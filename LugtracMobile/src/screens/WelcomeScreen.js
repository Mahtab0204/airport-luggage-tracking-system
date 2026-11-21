import { useEffect, useRef } from 'react';
import {
    Animated,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen({ navigation }) {
    // Animation Values
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoTranslateY = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // The Animation Sequence
        Animated.sequence([
            // 1. Fade in the logo initially
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            // 2. Hold it on the screen for 1 second (Splash effect)
            Animated.delay(1000),
            // 3. Move logo up AND fade in the buttons at the same time
            Animated.parallel([
                Animated.timing(logoTranslateY, {
                    toValue: -80, // Slide up by 80 pixels
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(contentOpacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                })
            ])
        ]).start();
    }, [logoOpacity, logoTranslateY, contentOpacity]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
            
            <View style={styles.animationContainer}>
                {/* Animated Logo Section */}
                <Animated.View style={[
                    styles.logoContainer, 
                    { 
                        opacity: logoOpacity,
                        transform: [{ translateY: logoTranslateY }]
                    }
                ]}>
                    <Text style={styles.logoIcon}>🛫</Text>
                    <Text style={styles.logoText}>LugTrac</Text>
                    <Text style={styles.tagline}>Intelligent Baggage Tracking</Text>
                </Animated.View>

                {/* Animated Buttons Section */}
                <Animated.View style={[
                    styles.contentContainer, 
                    { opacity: contentOpacity }
                ]}>
                    <TouchableOpacity 
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.primaryButtonText}>Sign In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate('Registration')}
                    >
                        <Text style={styles.secondaryButtonText}>Create Account</Text>
                    </TouchableOpacity>

                    <Text style={styles.footerText}>Powered by IoT & Edge AI</Text>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a', // Premium dark slate background
    },
    animationContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    logoContainer: {
        alignItems: 'center',
        position: 'absolute',
    },
    logoIcon: {
        fontSize: 60,
        marginBottom: 10,
    },
    logoText: {
        fontSize: 42,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 5,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    contentContainer: {
        width: '100%',
        position: 'absolute',
        bottom: 50,
    },
    primaryButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 5,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#334155',
    },
    secondaryButtonText: {
        color: '#f8fafc',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footerText: {
        textAlign: 'center',
        color: '#475569',
        fontSize: 12,
        marginTop: 30,
        letterSpacing: 0.5,
    }
});