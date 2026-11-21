import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

export default function Home() {
    return (
        <div className="home-wrapper">
            <div className="home-container">
                
                {/* Left Side: Text */}
                <div className="home-text-section">
                    <div className="iot-badge">
                        <span className="pulse-ring"></span>
                        <span className="pulse-core"></span>
                        IoT Hardware Integrated
                    </div>
                    
                    <h1 className="hero-title">
                        Never Lose Your <br/>
                        <span className="gradient-text">Luggage Again.</span>
                    </h1>
                    
                    <p className="hero-subtitle">
                        LugTrac combines real-time location tracking with smart-lock security alerts. Take absolute control of your travel experience from the check-in desk to the baggage carousel.
                    </p>
                    
                    <div className="hero-buttons">
                        <Link to="/register" className="btn-primary-large">Get Started ✈️</Link>
                        <Link to="/login" className="btn-secondary-large">Passenger Login 🧳</Link>
                    </div>
                </div>

                {/* Right Side: Glassmorphism Card */}
                <div className="home-visual-section">
                    <div className="bg-blob blob-blue"></div>
                    <div className="bg-blob blob-indigo"></div>
                    
                    <div className="glass-card">
                        <div className="glass-header">
                            <h3>🛡️ System Status</h3>
                            <span className="status-badge-secure">SECURE</span>
                        </div>
                        
                        <div className="glass-body">
                            <div className="status-row">
                                <div className="icon-box bg-blue-light">📍</div>
                                <div className="status-info">
                                    <span className="status-label">Live Location</span>
                                    <span className="status-value">Terminal 4, Sorting</span>
                                </div>
                            </div>
                            
                            <div className="status-row">
                                <div className="icon-box bg-green-light">🔒</div>
                                <div className="status-info">
                                    <span className="status-label">Smart Lock State</span>
                                    <span className="status-value text-green">ARMED (ACTIVE)</span>
                                </div>
                            </div>
                            
                            <div className="status-row">
                                <div className="icon-box bg-red-light">🚨</div>
                                <div className="status-info">
                                    <span className="status-label">Tamper Alerts</span>
                                    <span className="status-value">0 Breaches Detected</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}