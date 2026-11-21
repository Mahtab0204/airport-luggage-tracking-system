import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { API_BASE_URL } from '../config';


export default function AddBagScreen({ navigation }) {
    const [pnr, setPnr] = useState('');
    const [rfidUid, setRfidUid] = useState('');
    const [imageUri, setImageUri] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // 1. Open Phone Camera or Gallery
    const pickImage = async () => {
        // Request permissions
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "You need to allow access to your photos to upload a luggage image.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
           mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    // 2. Upload Image to Cloudinary, then Save Bag to Spring Boot
    const handleRegisterBag = async () => {
        if (!pnr || !rfidUid) {
            Alert.alert("Missing Details", "Please provide both PNR and RFID Tag UID.");
            return;
        }

        setIsLoading(true);
        let uploadedImageUrl = null;

        try {
            // STEP A: Upload to Cloudinary (if an image was selected)
            if (imageUri) {
                const formData = new FormData();
                formData.append('file', {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: 'luggage_photo.jpg'
                });
                formData.append('upload_preset', 'airport_lugtrac'); 

                const cloudinaryRes = await axios.post(
                    'https://api.cloudinary.com/v1_1/ipxn60la/image/upload', 
                    formData, 
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                
                uploadedImageUrl = cloudinaryRes.data.secure_url;
            }

            // STEP B: Save the complete bag record to Spring Boot
            const token = await AsyncStorage.getItem('token');
            const newBag = {
                pnr: pnr.toUpperCase().trim(),
                rfidUid: rfidUid.trim(),
                currentStatus: "PRE_FLIGHT",
                currentCheckpoint: "Passenger Registration",
                mediaUrls: uploadedImageUrl ? [uploadedImageUrl] : [],
                locked: true, // Armed by default
                tamperAlert: false
            };

            await axios.post(`${API_BASE_URL}/api/baggage/register`, newBag, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert("Success!", "Luggage successfully registered and armed.", [
                { text: "OK", onPress: () => navigation.navigate('Dashboard') }
            ]);

        } catch (error) {
          if (error.response) {
                console.error("403 Error from Server:", error.response.data);
                console.error("Failing URL:", error.config.url);
            } else {
                console.error("Failed to register bag:", error.message);
            }
            Alert.alert("Error", "Could not register baggage. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Header with Back Button */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Register Luggage</Text>
                    <Text style={styles.subtitle}>Link your smart tag to your flight.</Text>
                </View>

                {/* Form Fields */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Flight PNR (Booking Reference)</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="e.g. AB707"
                        placeholderTextColor="#94a3b8"
                        autoCapitalize="characters"
                        value={pnr}
                        onChangeText={setPnr}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Hardware RFID UID</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="e.g. 04 6A 89 2A"
                        placeholderTextColor="#94a3b8"
                        autoCapitalize="characters"
                        value={rfidUid}
                        onChangeText={setRfidUid}
                    />
                </View>

                {/* Image Upload Section */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Luggage Photo (Optional)</Text>
                    {imageUri ? (
                        <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                            <TouchableOpacity style={styles.repickButton} onPress={pickImage}>
                                <Text style={styles.repickButtonText}>Change Photo</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                            <Text style={styles.uploadIcon}>📷</Text>
                            <Text style={styles.uploadButtonText}>Tap to add a photo</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={handleRegisterBag}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.submitButtonText}>Activate Smart Luggage</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    scrollContent: { padding: 20, paddingTop: 50, paddingBottom: 50 },
    header: { marginBottom: 30 },
    backButton: { marginBottom: 15 },
    backButtonText: { color: '#3b82f6', fontSize: 16, fontWeight: 'bold' },
    title: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
    subtitle: { fontSize: 15, color: '#64748b', marginTop: 5 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
    input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: '#0f172a' },
    uploadButton: { backgroundColor: '#e2e8f0', borderRadius: 8, padding: 30, alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#cbd5e1' },
    uploadIcon: { fontSize: 30, marginBottom: 10 },
    uploadButtonText: { color: '#64748b', fontWeight: '600' },
    imagePreviewContainer: { alignItems: 'center' },
    imagePreview: { width: '100%', height: 200, borderRadius: 8, marginBottom: 10 },
    repickButton: { backgroundColor: '#e2e8f0', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6 },
    repickButtonText: { color: '#475569', fontWeight: 'bold' },
    submitButton: { backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginTop: 10, shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
    submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});