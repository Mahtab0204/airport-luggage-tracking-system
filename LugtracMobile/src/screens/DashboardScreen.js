import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { API_BASE_URL } from '../config';

export default function DashboardScreen({ navigation }) {
    const [myBags, setMyBags] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/baggage/my-bags`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            let validBags = [];
            if (Array.isArray(response.data)) validBags = response.data;
            else if (response.data && Array.isArray(response.data.data)) validBags = response.data.data;
            
            setMyBags(validBags);
        } catch (error) {
            console.error("Refresh failed", error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleLogout = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Sign Out", 
                style: "destructive",
                onPress: async () => {
                    await AsyncStorage.removeItem('token');
                    navigation.replace('Login');
                }
            }
        ]);
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    navigation.replace('Login');
                    return;
                }

                const response = await axios.get(`${API_BASE_URL}/api/baggage/my-bags`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                let validBags = [];
                if (Array.isArray(response.data)) {
                    validBags = response.data;
                } else if (response.data && Array.isArray(response.data.data)) {
                    validBags = response.data.data;
                }

                setMyBags(validBags);
            } catch (error) {
                console.error("Fetch error", error);
                if (error.response?.status === 401) {
                    await AsyncStorage.removeItem('token');
                    navigation.replace('Login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();

    }, []); 
    
    const handleToggleLock = async (bagId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.put(`${API_BASE_URL}/api/baggage/${bagId}/toggle-lock`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMyBags(myBags.map(bag => bag.id === bagId ? response.data : bag));
        } catch (error) {
            Alert.alert("Error", "Could not communicate with Smart Lock.");
        }
    };

    const renderBaggageCard = ({ item }) => (
        // Changed to a View so the nested "View Details" button receives the touch reliably
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeader}>
                <Text style={styles.pnrText}>PNR: {item.pnr}</Text>
            </View>

            {/* Tamper Alert */}
            {item.tamperAlert && (
                <View style={styles.alertBanner}>
                    <Text style={styles.alertText}>🚨 SECURITY BREACH DETECTED</Text>
                </View>
            )}

            {/* Status Grid */}
            <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Current Checkpoint: <Text style={styles.infoValue}>{item.currentCheckpoint || "Pending"}</Text></Text>
                <Text style={styles.infoLabel}>Transit Status: <Text style={styles.infoValue}>{item.currentStatus || "Checked In"}</Text></Text>
            </View>

            {/* Smart Lock Toggle */}
            <View style={styles.lockSection}>
                <View>
                    <Text style={styles.lockTitle}>Smart Security Lock</Text>
                    <Text style={{ color: item.locked ? '#15803d' : '#64748b', fontWeight: 'bold' }}>
                        {item.locked ? '🔒 ARMED' : '🔓 DISARMED'}
                    </Text>
                </View>
                <Switch 
                    value={item.locked} 
                    onValueChange={() => handleToggleLock(item.id)} 
                    trackColor={{ false: '#cbd5e1', true: '#86efac' }}
                    thumbColor={item.locked ? '#22c55e' : '#f8fafc'}
                />
            </View>

            {/* IoT Diagnostics */}
            <View style={styles.iotSection}>
                <Text style={styles.iotTitle}>Hardware Diagnostics</Text>
                <View style={styles.iotGrid}>
                    <View style={styles.iotBox}>
                        <Text style={styles.iotIcon}>⚖️</Text>
                        <Text style={styles.iotValue}>{item.weight != null ? `${Number(item.weight).toFixed(1)} KG` : "-- KG"}</Text>
                        <Text style={styles.iotLabel}>Weight</Text>
                    </View>
                    <View style={styles.iotBox}>
                        <Text style={styles.iotIcon}>🔋</Text>
                        <Text style={styles.iotValue}>{item.smartLock?.batteryLevel ?? 87}%</Text>
                        <Text style={styles.iotLabel}>Battery</Text>
                    </View>
                </View>
            </View>

            {/* NEW: View Details Button */}
            <TouchableOpacity 
                style={styles.detailsButton}
                onPress={() => navigation.navigate('BagDetails', { bagId: item.id, pnr: item.pnr })}
            >
                <Text style={styles.detailsButtonText}>View Details →</Text>
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={{ marginTop: 10 }}>Loading Smart Luggage...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Top Navigation Bar */}
            <View style={styles.topNav}>
                <Text style={styles.navLogo}>🛫 LugTrac</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.dashboardHeader}>
                <Text style={styles.headerTitle}>My Luggage</Text>
                <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={() => navigation.navigate('AddBag')}
                >
                    <Text style={styles.addButtonText}>+ Add Bag</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={myBags}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderBaggageCard}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={<Text style={styles.emptyText}>No luggage found.</Text>}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh} 
                        colors={['#3b82f6']} 
                        tintColor="#3b82f6" 
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9', padding: 15 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', marginBottom: 15, marginTop: 40 },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 10, marginBottom: 10 },
    pnrText: { fontWeight: 'bold', color: '#1e40af', backgroundColor: '#dbeafe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
    alertBanner: { backgroundColor: '#ef4444', padding: 10, borderRadius: 6, marginBottom: 10 },
    alertText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
    infoSection: { marginBottom: 15 },
    infoLabel: { color: '#64748b', fontSize: 14, marginBottom: 4 },
    infoValue: { color: '#0f172a', fontWeight: 'bold' },
    lockSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 15 },
    lockTitle: { fontWeight: 'bold', fontSize: 16 },
    iotSection: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
    iotTitle: { fontWeight: 'bold', color: '#64748b', marginBottom: 10 },
    iotGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    iotBox: { flex: 1, backgroundColor: 'white', marginHorizontal: 5, padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    iotIcon: { fontSize: 20, marginBottom: 5 },
    iotValue: { fontWeight: 'bold', color: '#0f172a' },
    iotLabel: { fontSize: 10, color: '#64748b', textTransform: 'uppercase' },
    detailsButton: { backgroundColor: '#eff6ff', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15, borderWidth: 1, borderColor: '#bfdbfe' },
    detailsButtonText: { color: '#2563eb', fontWeight: 'bold', fontSize: 15 },
    emptyText: { textAlign: 'center', color: '#64748b', marginTop: 50 },
    dashboardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 40,
    },
    addButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    topNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        marginBottom: 20,
    },
    navLogo: {
        fontSize: 20,
        fontWeight: '900',
        color: '#0f172a',
    },
    logoutBtn: {
        backgroundColor: '#fee2e2',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    logoutText: {
        color: '#ef4444',
        fontWeight: 'bold',
        fontSize: 12,
    },
});