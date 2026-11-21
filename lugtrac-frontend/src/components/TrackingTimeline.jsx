import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../index.css';

export default function TrackingTimeline({ pnr }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8080/api/tracking/${pnr}/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLogs(response.data);
            } catch (error) {
                console.error("Failed to fetch tracking history", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [pnr]);

    if (loading) return <div className="timeline-msg">Loading journey history... ⏳</div>;
    if (logs.length === 0) return <div className="timeline-msg">No tracking history available yet.</div>;

    return (
        <div className="timeline-wrapper">
            <h4 className="timeline-title">📍 Tracking Journey</h4>
            <div className="timeline-track">
                {logs.map((log, index) => (
                    <div key={log.id || index} className={`timeline-step ${index === 0 ? 'step-active' : ''}`}>
                        <div className="step-dot"></div>
                        <div className="step-content">
                            <span className="step-time">
                                {new Date(log.timestamp).toLocaleString(undefined, {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </span>
                            <span className="step-location">Scanned at: {log.checkpointName}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}