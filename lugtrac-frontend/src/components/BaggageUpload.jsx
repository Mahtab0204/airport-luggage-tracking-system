import React, { useState } from 'react';
import axios from 'axios';
import '../index.css';

export default function BaggageUpload({ onUploadSuccess }) {
    const [pnr, setPnr] = useState('');
    const [rfidUid, setRfidUid] = useState('');
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState(null);

    // Cloudinary Configuration
    const CLOUD_NAME = "ipxn60la"; 
    const UPLOAD_PRESET = "airport_lugtrac";

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (files.length === 0) {
            setMessage({ type: 'error', text: 'Please select at least one media file.' });
            return;
        }

        setIsUploading(true);
        setMessage(null);

        try {
            // 1. Upload all selected files to Cloudinary concurrently
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", UPLOAD_PRESET);

                const resourceType = file.type.includes('video') ? 'video' : 'image';
                const cloudinaryEndpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

                const response = await axios.post(cloudinaryEndpoint, formData);
                return response.data.secure_url;
            });

            const uploadedUrls = await Promise.all(uploadPromises);

            // 2. Send the array of URLs to your Spring Boot backend
            const token = localStorage.getItem('token');
            const payload = {
                pnr: pnr,
                rfidUid: rfidUid,
                currentStatus: 'CHECKED_IN',
                currentCheckpoint: 'Check-in Counter',
                mediaUrls: uploadedUrls
            };

            await axios.post('http://localhost:8080/api/baggage/register', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({ type: 'success', text: 'Luggage and media registered successfully!' });
            setPnr('');
            setRfidUid('');
            setFiles([]);
            document.getElementById('media-upload-input').value = "";
            
            if (onUploadSuccess) onUploadSuccess();

        } catch (error) {
            console.error("Upload failed", error);
            setMessage({ type: 'error', text: 'Failed to upload luggage data.' });
        } finally {
            setIsUploading(false);
        }
    };

   return (
        <div className="dashboard-wrapper">
            <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                
                <div className="baggage-card" style={{ maxWidth: '600px', width: '100%', margin: '0' }}>
                    <div className="upload-header">
                        <h3>Register New Luggage 🛄</h3>
                        <p>Securely link your physical bag and media to your digital profile.</p>
                    </div>

                    {message && (
                        <div 
                            className="error-alert" 
                            style={message.type === 'success' ? { backgroundColor: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0' } : {}}
                        >
                            {message.type === 'success' ? '✅ ' : '🚨 '}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleUpload} className="auth-form">
                        <div className="input-group">
                            <label>Flight PNR</label>
                            <div className="input-with-icon">
                                <span className="input-icon">🎫</span>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="e.g., AB1234"
                                    value={pnr} 
                                    onChange={(e) => setPnr(e.target.value)} 
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>RFID Tag UID</label>
                            <div className="input-with-icon">
                                <span className="input-icon">🏷️</span>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="e.g., 04 6A 89 2A"
                                    value={rfidUid} 
                                    onChange={(e) => setRfidUid(e.target.value)} 
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Luggage Media (Images/Videos)</label>
                            <div className="custom-file-upload">
                                <input 
                                    id="media-upload-input"
                                    type="file" 
                                    accept="image/*,video/*" 
                                    multiple 
                                    required 
                                    onChange={handleFileChange} 
                                />
                                <div className="upload-visuals">
                                    <span className="upload-icon">📸</span>
                                    <span className="upload-text">Click to browse or drag files here</span>
                                    <span className={files.length > 0 ? "upload-status active" : "upload-status"}>
                                        {files.length > 0 ? `${files.length} file(s) ready to upload` : 'No files selected'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn-auth-submit" disabled={isUploading}>
                            {isUploading ? 'Uploading Media & Saving... ⏳' : 'Register Luggage ✈️'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}