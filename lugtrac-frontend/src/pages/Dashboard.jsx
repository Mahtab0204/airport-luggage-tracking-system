
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../index.css';
import LuggageMap from '../components/LuggageMap';
import TrackingTimeline from '../components/TrackingTimeline';

export default function Dashboard() {
    const navigate = useNavigate();
    const [myBags, setMyBags] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [alerts, setAlerts] = useState({});
    
    // Updated: Now stores an object { url, bag } so the modal knows which bag to update
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [uploadingBagId, setUploadingBagId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                // 1. Fetch latest bag data
                const response = await axios.get('http://localhost:8080/api/baggage/my-bags', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log("RAW SPRING BOOT RESPONSE:", response.data);
                
                // PERMANENT FIX: Intelligently extract the array no matter how Spring Boot sends it
                let validBags = [];
                if (Array.isArray(response.data)) {
                    validBags = response.data; // Standard JSON Array
                } else if (response.data && Array.isArray(response.data.data)) {
                    validBags = response.data.data; // Wrapped in a 'data' object
                } else if (response.data && Array.isArray(response.data.content)) {
                    validBags = response.data.content; // Wrapped in a Spring Data 'content' object
                } else if (response.data && typeof response.data === 'object' && response.data.id) {
                    validBags = [response.data]; // Backend returned a single object instead of a list
                }

                setMyBags(validBags);

                // 2. Fetch Alert History for each valid bag
                validBags.forEach(async (bag) => {
                    try {
                        const alertRes = await axios.get(`http://localhost:8080/api/alerts/baggage/${bag.id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setAlerts(prev => ({ ...prev, [bag.id]: alertRes.data }));
                    } catch (err) {
                        console.warn(`No alerts found for bag ${bag.id}`);
                    }
                });

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();

        const intervalId = setInterval(() => {
            fetchDashboardData();
        }, 3000); 

        return () => clearInterval(intervalId);

    }, [navigate]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this entire luggage profile?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/baggage/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyBags(myBags.filter(bag => bag.id !== id));
        } catch (error) {
            console.error("Failed to delete baggage", error);
            alert("Error deleting baggage.");
        }
    };

    const handleToggleLock = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:8080/api/baggage/${id}/toggle-lock`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyBags(myBags.map(bag => bag.id === id ? response.data : bag));
        } catch (error) {
            console.error("Failed to toggle lock", error);
            alert("Error communicating with smart lock.");
        }
    };

    const handleUpdateMedia = async (bagId, currentBag, e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingBagId(bagId);
        try {
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", "airport_lugtrac"); 
                
                const resourceType = file.type.includes('video') ? 'video' : 'image';
                const response = await axios.post(`https://api.cloudinary.com/v1_1/ipxn60la/${resourceType}/upload`, formData);
                return response.data.secure_url;
            });

            const newUrls = await Promise.all(uploadPromises);
            const updatedMediaUrls = [...(currentBag.mediaUrls || []), ...newUrls];

            const token = localStorage.getItem('token');
            const updatedBag = { ...currentBag, mediaUrls: updatedMediaUrls };
            
            const response = await axios.put(`http://localhost:8080/api/baggage/${bagId}`, updatedBag, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMyBags(myBags.map(bag => bag.id === bagId ? response.data : bag));
        } catch (error) {
            console.error("Failed to update media", error);
            alert("Failed to upload new media.");
        } finally {
            setUploadingBagId(null);
            e.target.value = null; 
        }
    };

    const handleRemoveMedia = async (bagId, currentBag, urlToRemove) => {
        if (!window.confirm("Are you sure you want to permanently delete this media file?")) return;
        
        try {
            const updatedMediaUrls = currentBag.mediaUrls.filter(url => url !== urlToRemove);
            const updatedBag = { ...currentBag, mediaUrls: updatedMediaUrls };
            
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:8080/api/baggage/${bagId}`, updatedBag, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMyBags(myBags.map(bag => bag.id === bagId ? response.data : bag));
            
            // Close the modal automatically upon successful deletion
            setSelectedMedia(null);
        } catch (error) {
            console.error("Failed to remove media", error);
            alert("Failed to remove media file.");
        }
    };

    if (isLoading) {
        return <div className="dashboard-loading">Loading your smart luggage... 🧳</div>;
    }

   // Ensure myBags is ALWAYS an array before rendering to prevent map() crashes
   const safeBagsArray = Array.isArray(myBags) ? myBags : [];

   return (
    <div className="dashboard-wrapper">
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h2>My Registered Luggage 🛫</h2>
                    <p>Track locations, manage media, and control your smart locks.</p>
                </div>
                <button className="btn-primary-large" onClick={() => navigate("/add-bag")}>+ Register New Bag</button>
            </div>

            {safeBagsArray.length === 0 ? (
                <div className="empty-state-card">
                    <span className="empty-icon">🛄</span>
                    <h3>No luggage found</h3>
                    <p>You haven't registered any baggage to your account yet.</p>
                </div>
            ) : (
                <div className="baggage-grid-wide">
                    {safeBagsArray.map((bag) => (
                        <div key={bag.id} className="baggage-card">
                            <div className="baggage-card-header">
                                <div className="pnr-badge">PNR: {bag.pnr}</div>
                                <button onClick={() => handleDelete(bag.id)} className="btn-delete" title="Delete Entire Profile">🗑️</button>
                            </div>

                            {bag.tamperAlert && <div className="tamper-alert-banner">🚨 SECURITY BREACH DETECTED</div>}

                            <div className="card-body-grid">
                                <div className="card-col-left">
                                    <div className="baggage-info-section">
                                        <div className="info-row">
                                            <span className="info-icon">📍</span>
                                            <div>
                                                <span className="info-label">Current Checkpoint</span>
                                                <span className="info-value">{bag.currentCheckpoint || "Pending Intake"}</span>
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-icon">🚥</span>
                                            <div>
                                                <span className="info-label">Transit Status</span>
                                                <span className="info-value">{bag.currentStatus || "Checked In"}</span>
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-icon">📡</span>
                                            <div>
                                                <span className="info-label">RFID Tag UID</span>
                                                <span className="info-value text-mono">{bag.rfidUid}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="smart-lock-section">
                                        <div className="lock-text">
                                            <strong>Smart Security Lock</strong>
                                            <span className={bag.locked ? "text-green" : "text-gray"}>{bag.locked ? "🔒 ARMED" : "🔓 DISARMED"}</span>
                                        </div>
                                        <label className="switch">
                                            <input type="checkbox" checked={bag.locked} onChange={() => handleToggleLock(bag.id)} />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>

                                    <div className="iot-hardware-section">
                                        <div className="iot-header">
                                            <span className="info-label">Hardware Diagnostics</span>
                                            <span className="iot-status online">🟢 Online</span>
                                        </div>
                                        <div className="iot-stats-grid">
                                            <div className="iot-stat">
                                                <span className="iot-icon">⚖️</span>
                                                <div>
                                                    <span className="stat-value">{bag.weight != null ? `${Number(bag.weight).toFixed(1)} KG` : "-- KG"}</span>
                                                    <span className="stat-label">Actual Weight</span>
                                                </div>
                                            </div>
                                            <div className="iot-stat">
                                                <span className="iot-icon">🔋</span>
                                                <div>
                                                    <span className="stat-value">{bag.smartLock?.batteryLevel ?? 87}%</span>
                                                    <span className="stat-label">Battery</span>
                                                </div>
                                            </div>
                                            <div className="iot-stat">
                                                <span className="iot-icon">📡</span>
                                                <div>
                                                    <span className="stat-value text-mono" style={{ fontSize: "0.75rem" }}>{bag.rfidUid || "N/A"}</span>
                                                    <span className="stat-label">RFID UID</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="media-section">
                                        <div className="media-section-header">
                                            <span className="info-label">Attached Media</span>
                                            <label className="btn-update-media">
                                                {uploadingBagId === bag.id ? "Uploading... ⏳" : "+ Add Media"}
                                                <input type="file" multiple accept="image/*,video/*" style={{ display: "none" }} onChange={(e) => handleUpdateMedia(bag.id, bag, e)} disabled={uploadingBagId === bag.id} />
                                            </label>
                                        </div>

                                        {Array.isArray(bag.mediaUrls) && bag.mediaUrls.length > 0 ? (
                                            <div className="media-scroller">
                                                {bag.mediaUrls.map((url, index) => (
                                                    url.includes("video") ? (
                                                        <video key={index} src={url} className="media-thumb clickable-media" muted onClick={() => setSelectedMedia({ url, bag })} />
                                                    ) : (
                                                        <img key={index} src={url} alt="Baggage" className="media-thumb clickable-media" onClick={() => setSelectedMedia({ url, bag })} />
                                                    )
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "10px" }}>No media attached. Click "+ Add Media" to upload photos.</div>
                                        )}
                                    </div>
                                </div>

                                <div className="card-col-right">
                                    <LuggageMap checkpoint={bag.currentCheckpoint} pnr={bag.pnr} />
                                    <TrackingTimeline pnr={bag.pnr} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {selectedMedia && (
            <div className="media-modal-overlay" onClick={() => setSelectedMedia(null)}>
                <div className="media-modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-close-modal" onClick={() => setSelectedMedia(null)}>✖</button>
                    {selectedMedia.url.includes("video") ? (
                        <video src={selectedMedia.url} controls autoPlay className="expanded-media" />
                    ) : (
                        <img src={selectedMedia.url} alt="Expanded Luggage" className="expanded-media" />
                    )}
                    <div className="modal-action-bar">
                        <button className="btn-modal-delete" onClick={() => handleRemoveMedia(selectedMedia.bag.id, selectedMedia.bag, selectedMedia.url)}>🗑️ Delete This Media</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}