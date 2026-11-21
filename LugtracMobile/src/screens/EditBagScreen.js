import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_BASE_URL } from '../config';

export default function EditBagScreen({ route, navigation }) {
    const { bagDetails } = route.params;

    const [pnr, setPnr] = useState(bagDetails.pnr || '');
    const [rfidUid, setRfidUid] = useState(bagDetails.rfidUid || '');
    const [mediaUrls, setMediaUrls] = useState(bagDetails.mediaUrls || []);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // 1. Handle Removing an Existing Image
    const handleRemoveImage = (indexToRemove) => {
        setMediaUrls(mediaUrls.filter((_, index) => index !== indexToRemove));
    };

    // 2. Handle Adding a New Image to Cloudinary
    const pickAndUploadImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setIsUploading(true);
            const imageUri = result.assets[0].uri;
            
            const data = new FormData();
            data.append('file', { uri: imageUri, type: 'image/jpeg', name: 'upload.jpg' });
            data.append('upload_preset', 'airport_lugtrac'); // Match your AddBagScreen preset

            try {
                
                const cloudResponse = await fetch('https://api.cloudinary.com/v1_1/ipxn60la/image/upload', {
                    method: 'POST',
                    body: data,
                    headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' }
                });
                const cloudData = await cloudResponse.json();
                
                if (cloudData.secure_url) {
                    setMediaUrls([...mediaUrls, cloudData.secure_url]); 
                }
            } catch (error) {
                Alert.alert("Upload Failed", "Could not upload image to Cloudinary.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    // 3. Submit the PUT Request
    const handleUpdateBag = async () => {
        if (!pnr || !rfidUid) return Alert.alert("Error", "PNR and RFID cannot be empty.");

        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const updatedData = {
                pnr: pnr,
                rfidUid: rfidUid,
                mediaUrls: mediaUrls // Send the final array. Backend will delete any missing URLs from Cloudinary
            };

            await axios.put(`${API_BASE_URL}/api/baggage/${bagDetails.id}`, updatedData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            Alert.alert("Success", "Baggage details updated successfully.");
            navigation.navigate('Dashboard'); // Go back to refresh data
        } catch (error) {
            console.error("Update error:", error);
            Alert.alert("Error", "Failed to update baggage details.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Cancel</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Edit Baggage</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Flight PNR</Text>
                    <TextInput style={styles.input} value={pnr} onChangeText={setPnr} autoCapitalize="characters" />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>RFID Tag UID</Text>
                    <TextInput style={styles.input} value={rfidUid} onChangeText={setRfidUid} />
                </View>

                {/* Media Management Section */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Manage Media ({mediaUrls.length})</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaContainer}>
                        {mediaUrls.map((url, index) => (
                            <View key={index} style={styles.imageWrapper}>
                                <Image source={{ uri: url }} style={styles.mediaThumb} />
                                <TouchableOpacity style={styles.deleteBadge} onPress={() => handleRemoveImage(index)}>
                                    <Text style={styles.deleteBadgeText}>X</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                        
                        <TouchableOpacity style={styles.addPhotoBtn} onPress={pickAndUploadImage} disabled={isUploading}>
                            {isUploading ? <ActivityIndicator color="#3b82f6" /> : <Text style={styles.addPhotoIcon}>+</Text>}
                            <Text style={styles.addPhotoText}>Add Photo</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={handleUpdateBag} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryButtonText}>Save Changes</Text>}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', padding: 20, paddingTop: 50 },
    backButton: { marginBottom: 20 },
    backButtonText: { color: '#3b82f6', fontWeight: 'bold', fontSize: 16 },
    title: { fontSize: 28, fontWeight: '900', color: '#0f172a', marginBottom: 20 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
    input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 15, fontSize: 16 },
    mediaContainer: { flexDirection: 'row', marginTop: 10 },
    imageWrapper: { position: 'relative', marginRight: 15 },
    mediaThumb: { width: 100, height: 100, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
    deleteBadge: { position: 'absolute', top: -10, right: -10, backgroundColor: '#ef4444', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },
    deleteBadgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    addPhotoBtn: { width: 100, height: 100, borderRadius: 8, borderWidth: 2, borderColor: '#3b82f6', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#eff6ff' },
    addPhotoIcon: { fontSize: 24, color: '#3b82f6', marginBottom: 5 },
    addPhotoText: { fontSize: 12, color: '#3b82f6', fontWeight: '600' },
    primaryButton: { backgroundColor: '#3b82f6', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 20, marginBottom: 40 },
    primaryButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});