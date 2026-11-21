import axios from 'axios';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { API_BASE_URL } from '../config';

export default function ForgotPasswordScreen({ navigation }) {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendCode = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email address.");
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { 
                email: email.toLowerCase().trim() 
            });
            setStep(2);
            Alert.alert("Code Sent", "A 6-digit code has been sent to your email. It expires in 15 minutes.");
        } catch (error) {
            Alert.alert("Error", "Could not request reset code. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!token || !newPassword) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/auth/reset-password`, { 
                token: token.trim(), 
                newPassword: newPassword 
            });
            Alert.alert(
                "Success", 
                "Password updated successfully.", 
                [{ text: "Log In", onPress: () => navigation.navigate('Login') }]
            );
        } catch (error) {
            // Display the exact error from Spring Boot (e.g., "Reset code has expired.")
            if (error.response && error.response.data && error.response.data.error) {
                Alert.alert("Reset Failed", error.response.data.error);
            } else {
                Alert.alert("Error", "Invalid reset code. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.formContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back to Login</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Reset Password</Text>
                
                {step === 1 ? (
                    <>
                        <Text style={styles.subtitle}>Enter your email to receive a secure reset code.</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput 
                                style={styles.input} 
                                placeholder="passenger@example.com" 
                                autoCapitalize="none" 
                                keyboardType="email-address" 
                                value={email} 
                                onChangeText={setEmail} 
                            />
                        </View>

                        <TouchableOpacity style={styles.primaryButton} onPress={handleSendCode} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryButtonText}>Send Code</Text>}
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.subtitle}>Enter the 6-digit code sent to your email.</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Reset Code</Text>
                            <TextInput 
                                style={styles.input} 
                                placeholder="e.g. 123456" 
                                keyboardType="number-pad" 
                                maxLength={6}
                                value={token} 
                                onChangeText={setToken} 
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>New Password</Text>
                            <TextInput 
                                style={styles.input} 
                                placeholder="••••••••" 
                                secureTextEntry 
                                value={newPassword} 
                                onChangeText={setNewPassword} 
                            />
                        </View>

                        <TouchableOpacity style={styles.primaryButton} onPress={handleResetPassword} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryButtonText}>Update Password</Text>}
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(1)}>
                            <Text style={styles.secondaryButtonText}>Request New Code</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center' },
    formContainer: { paddingHorizontal: 30 },
    backButton: { marginBottom: 20 },
    backButtonText: { color: '#3b82f6', fontWeight: 'bold', fontSize: 15 },
    title: { fontSize: 32, fontWeight: '900', color: '#0f172a', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#64748b', marginBottom: 30, lineHeight: 22 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
    input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: '#0f172a' },
    primaryButton: { backgroundColor: '#3b82f6', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
    primaryButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    secondaryButton: { marginTop: 15, paddingVertical: 15, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1' },
    secondaryButtonText: { color: '#475569', fontSize: 16, fontWeight: 'bold' }
});