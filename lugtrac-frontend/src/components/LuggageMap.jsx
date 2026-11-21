import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../index.css';

// Fix for React-Leaflet default marker icons not loading
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

// Mock coordinates for airport checkpoints (Hazrat Shahjalal International Airport)
const checkpointCoordinates = {
    "Passenger Device": [23.8433, 90.4033], // Airport Entrance
    "PRE_FLIGHT": [23.8433, 90.4033],
    "Check-in Counter": [23.8445, 90.4045], // Check-in Area
    "Sorting Belt": [23.8455, 90.4055],     // Security/Sorting
    "IN_TRANSIT": [23.8465, 90.4065],       // Tarmac/Plane
    "Baggage Claim": [23.8430, 90.4020]     // Arrival Claim
};

// Component to dynamically update map center when checkpoint changes
const RecenterAutomatically = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(position, 16);
    }, [position, map]);
    return null;
};

export default function LuggageMap({ checkpoint, pnr }) {
    // Default to airport entrance if checkpoint isn't mapped
    const position = checkpointCoordinates[checkpoint] || checkpointCoordinates["Passenger Device"];

    return (
        <div className="map-container-wrapper">
            <div className="map-header">
                <span className="map-icon">🛰️</span>
                <strong>Live GPS Tracking</strong>
            </div>
            <div className="map-frame">
                <MapContainer center={position} zoom={16} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <RecenterAutomatically position={position} />
                    <Marker position={position}>
                        <Popup className="custom-popup">
                            <div className="popup-content">
                                <strong>🧳 PNR: {pnr}</strong>
                                <span>📍 {checkpoint || "Pending Intake"}</span>
                            </div>
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>
        </div>
    );
}