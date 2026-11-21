import React, { useState } from 'react';
import axios from 'axios';

export default function AdminSimulator() {
    const [rfidUid, setRfidUid] = useState('');
    const [checkpoint, setCheckpoint] = useState('Check-in Counter');
    const [message, setMessage] = useState(null);

    const handleScan = async (e) => {
        e.preventDefault();
        setMessage(null);
        try {
           
            const payload = { 
                rfidUid: rfidUid, 
                checkpoint: checkpoint 
            };
            
            const response = await axios.post('http://localhost:8080/api/iot/scan', payload);
            setMessage({ type: 'success', text: response.data });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data || "Scan failed. Ensure the backend is running." });
        }
    };
    const handleTamper = async (e) => {
        e.preventDefault();
        setMessage(null);
        try {
            const payload = { rfidUid: rfidUid };
            const response = await axios.post('http://localhost:8080/api/iot/tamper', payload);
            setMessage({ type: 'error', text: response.data }); // Show as error color for emphasis
        } catch (error) {
            setMessage({ type: 'error', text: "Failed to trigger tamper alert." });
        }
    };

    return (
        <div className="dashboard-container" style={{ maxWidth: '600px' }}>
            <div className="dashboard-card" style={{ borderTop: '4px solid #f59e0b' }}>
                <h2>🛄 IoT RFID Scanner Simulator</h2>
                <p style={{ marginBottom: '20px', color: '#6b7280' }}>
                    Use this tool to simulate a bag passing through an airport checkpoint.
                </p>

                {message && (
                    <div className={message.type === 'success' ? 'status-box' : 'error-msg'} style={{ marginBottom: '15px' }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleScan}>
                    <div className="form-group">
                        <label>RFID Tag UID (Must match a registered bag)</label>
                        <input type="text" required placeholder="e.g., A1:B2:C3:D4"
                               value={rfidUid} onChange={(e) => setRfidUid(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>New Checkpoint Location</label>
                        <select value={checkpoint} onChange={(e) => setCheckpoint(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="Check-in Counter">Check-in Counter</option>
                            <option value="Sorting Belt">Sorting Belt (Security)</option>
                            <option value="IN_TRANSIT">In Transit (Tarmac/Plane)</option>
                            <option value="Baggage Claim">Baggage Claim (Destination)</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}>
                        Simulate RFID Scan
                    </button>
                    <button 
                        type="button" 
                        onClick={handleTamper} 
                        className="btn-primary" 
                        style={{ width: '100%', backgroundColor: '#dc2626', borderColor: '#dc2626', marginTop: '10px' }}
                    >
                        🚨 Simulate Unauthorized Opening (Tamper)
                    </button>
                </form>
            </div>
        </div>
    );
}