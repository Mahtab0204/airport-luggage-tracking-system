import AsyncStorage from '@react-native-async-storage/async-storage';
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

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password.");
            return;
        }

        setIsLoading(true);
        try {
            // Adjust the endpoint if your Spring Boot auth URL is different
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email: email.toLowerCase().trim(),
                password: password
            });

            // Assuming your backend returns { token: "eyJhbG..." }
            const token = response.data.token; 

            if (token) {
                // Save the JWT token securely on the device
                await AsyncStorage.setItem('token', token);
                
                // Navigate to Dashboard and remove Login from the back-stack
                navigation.replace('Dashboard');
            } else {
                Alert.alert("Login Failed", "No token received from server.");
            }
        } catch (error) {
            console.error("Login Error:", error);
            if (error.response && error.response.status === 401) {
                Alert.alert("Unauthorized", "Incorrect email or password.");
            } else {
                Alert.alert("Network Error", "Could not connect to the server. Check your IP address.");
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
                
                <Text style={styles.logo}>🛫 LugTrac</Text>
                <Text style={styles.subtitle}>Sign in to track your smart luggage.</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="passenger@example.com"
                        placeholderTextColor="#94a3b8"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordWrapper}>
                        <TextInput 
                            style={styles.inputWithIcon}
                            placeholder="••••••••"
                            placeholderTextColor="#94a3b8"
                            secureTextEntry={!isPasswordVisible}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity 
                            style={styles.eyeIcon} 
                            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        >
                            <Text style={{ fontSize: 18 }}>{isPasswordVisible ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity 
                        style={{ alignSelf: 'flex-end', marginTop: 8 }}
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text style={{ color: '#3b82f6', fontSize: 13, fontWeight: '600' }}>Forgot Password?</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={styles.loginButton} 
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.loginButtonText}>Sign In</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
                        <Text style={styles.signupLink}>Sign Up</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
    },
    formContainer: {
        paddingHorizontal: 30,
    },
    logo: {
        fontSize: 32,
        fontWeight: '900',
        color: '#0f172a',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 40,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#0f172a',
    },
    loginButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    footerText: {
        color: '#64748b',
        fontSize: 15,
    },
    signupLink: {
        color: '#3b82f6',
        fontSize: 15,
        fontWeight: 'bold',
    },
});