import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    Linking,
    View
} from 'react-native';
import { WebView } from 'react-native-webview';
import { API_BASE_URL } from '../config';


export default function BagDetailsScreen({ route, navigation }) {
    const { bagId, pnr } = route.params;
    
    const [bagDetails, setBagDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBagDetails = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/api/baggage/${bagId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBagDetails(response.data);
            } catch (error) {
                console.error("Failed to fetch bag details", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Adding a focus listener so the screen refreshes when coming back from EditBagScreen
        const unsubscribe = navigation.addListener('focus', () => {
            fetchBagDetails();
        });

        fetchBagDetails();
        return unsubscribe;
    }, [bagId, navigation]);

    const handleDeleteBag = () => {
        Alert.alert(
            "Delete Baggage",
            "Are you sure? This will permanently remove the tracking history and all associated photos.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('token');
                            await axios.delete(`${API_BASE_URL}/api/baggage/${bagId}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            Alert.alert("Deleted", "Baggage record removed.");
                            navigation.replace('Dashboard'); 
                        } catch (error) {
                            Alert.alert("Error", "Could not delete baggage.");
                            console.error("Failed to delete bag:", error);
                        }
                    }
                }
            ]
        );
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={{ marginTop: 10 }}>Locating Baggage...</Text>
            </View>
        );
    }

    if (!bagDetails) {
        return (
            <View style={styles.center}>
                <Text>Could not load baggage details.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#3b82f6' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

   // Matches  web dashboard's checkpoint coordinates (HSIA, Dhaka)
    const checkpointCoordinates = {
        "Passenger Device": [23.8433, 90.4033],
        "PRE_FLIGHT": [23.8433, 90.4033],
        "Check-in Counter": [23.8445, 90.4045],
        "Sorting Belt": [23.8455, 90.4055],
        "IN_TRANSIT": [23.8465, 90.4065],
        "Baggage Claim": [23.8430, 90.4020],
    };

    const checkpoint = bagDetails.currentCheckpoint || "Passenger Device";
    const [fallbackLat, fallbackLng] = checkpointCoordinates[checkpoint] || [23.8433, 90.4033];


    const lat = bagDetails.latitude ?? fallbackLat;
    const lng = bagDetails.longitude ?? fallbackLng;

    const openInPhoneMaps = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        Linking.openURL(url).catch(() =>
            Alert.alert("Error", "Could not open the Maps app on this device.")
        );
    };

    const mapHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                body { margin: 0; padding: 0; }
                #map { height: 100vh; width: 100vw; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 16);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap'
                }).addTo(map);

                L.marker([${lat}, ${lng}])
                    .addTo(map)
                    .bindPopup("<b>Bag ${pnr}</b><br>${checkpoint}")
                    .openPopup();
            </script>
        </body>
        </html>
    `;

    return (
        <View style={styles.container}>
            {/* Header with Edit Button */}
            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => navigation.navigate('EditBag', { bagDetails: bagDetails })}>
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.title}>PNR: {pnr}</Text>
                <Text style={styles.subtitle}>Tracking & Diagnostics</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
               {/* 1. Live GPS Map */}
                <View style={styles.section}>
                    <View style={styles.mapHeaderRow}>
                        <Text style={styles.sectionTitle}>Live GPS Location</Text>
                        <Text style={styles.coordsText}>{lat.toFixed(4)}, {lng.toFixed(4)}</Text>
                    </View>

                    <View style={styles.mapContainer}>
                        <WebView
                            originWhitelist={['*']}
                            source={{ html: mapHtml }}
                            style={styles.map}
                            scrollEnabled={false}
                        />
                    </View>

                    <TouchableOpacity style={styles.openMapsBtn} onPress={openInPhoneMaps}>
                        <Text style={styles.openMapsBtnText}>📍 Open in Phone Maps</Text>
                    </TouchableOpacity>
                </View>

                {/* 2. Media Gallery */}
                {bagDetails.mediaUrls && bagDetails.mediaUrls.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Attached Media</Text>
                        <FlatList 
                            horizontal
                            data={bagDetails.mediaUrls}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <Image source={{ uri: item }} style={styles.mediaThumb} />
                            )}
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                )}

                {/* 3. Tracking Timeline */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Transit Timeline</Text>
                    {bagDetails.trackingLogs && bagDetails.trackingLogs.length > 0 ? (
                        bagDetails.trackingLogs.map((log, index) => (
                            <View key={log.id} style={styles.timelineRow}>
                                <View style={styles.timelineGraphic}>
                                    <View style={[styles.timelineDot, index === 0 ? styles.timelineDotActive : null]} />
                                    {index !== bagDetails.trackingLogs.length - 1 && <View style={styles.timelineLine} />}
                                </View>
                                <View style={styles.timelineContent}>
                                    <Text style={styles.timelineCheckpoint}>{log.checkpointName}</Text>
                                    <Text style={styles.timelineTime}>{formatTime(log.timestamp)}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No tracking history available yet.</Text>
                    )}
                </View>

                {/* 4. Danger Zone (Delete Button) */}
                <View style={[styles.section, { borderBottomWidth: 0, paddingBottom: 40, marginTop: 10 }]}>
                    <TouchableOpacity 
                        style={styles.deleteButton} 
                        onPress={handleDeleteBag}
                    >
                        <Text style={styles.deleteButtonText}>Delete Baggage Record</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, paddingTop: 50, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    backButtonText: { color: '#3b82f6', fontSize: 16, fontWeight: 'bold' },
    editButtonText: { color: '#10b981', fontWeight: 'bold', fontSize: 16 },
    title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    subtitle: { fontSize: 14, color: '#64748b' },
    section: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 15 },
    mapContainer: { height: 250, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0' },
    map: { ...StyleSheet.absoluteFillObject },
    mediaThumb: { width: 120, height: 120, borderRadius: 8, marginRight: 15, backgroundColor: '#e2e8f0' },
    timelineRow: { flexDirection: 'row' },
    timelineGraphic: { width: 30, alignItems: 'center' },
    timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#cbd5e1', zIndex: 1 },
    timelineDotActive: { backgroundColor: '#3b82f6', width: 14, height: 14, borderRadius: 7 },
    timelineLine: { width: 2, flex: 1, backgroundColor: '#e2e8f0', marginTop: -2, marginBottom: -2 },
    timelineContent: { flex: 1, paddingBottom: 25, paddingLeft: 10 },
    timelineCheckpoint: { fontSize: 15, fontWeight: 'bold', color: '#334155' },
    timelineTime: { fontSize: 13, color: '#64748b', marginTop: 2 },
    emptyText: { color: '#64748b', fontStyle: 'italic' },
    deleteButton: { backgroundColor: '#fee2e2', padding: 15, borderRadius: 8, alignItems: 'center' },
    deleteButtonText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },
    mapHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    coordsText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    openMapsBtn: {
        marginTop: 12,
        backgroundColor: '#eff6ff',
        borderWidth: 1,
        borderColor: '#bfdbfe',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    openMapsBtnText: { color: '#2563eb', fontWeight: 'bold', fontSize: 14 },
});