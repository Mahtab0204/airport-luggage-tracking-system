import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css'; 

export default function Footer() {
    return (
        <footer className="custom-footer">
            <div className="footer-container">
                <div className="footer-grid">
                    
                    <div className="footer-brand">
                        <h3>🧳 LugTrac</h3>
                        <p>Next-generation intelligent baggage tracking and security. Travel with peace of mind, knowing your luggage is secure from check-in to arrival.</p>
                    </div>
                    
                    <div className="footer-links">
                        <h4>QUICK LINKS</h4>
                        <Link to="/login">Passenger Login</Link>
                        <Link to="/register">Create Account</Link>
                    </div>

                    <div className="footer-status">
                        <h4>SYSTEM STATUS</h4>
                        <p className="status-indicator">
                            <span className="pulse-dot"></span> Live IoT Tracking Online
                        </p>
                        <p className="demo-text">Capstone Project Demo ✈️</p>
                    </div>
                    
                </div>
                
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} LugTrac Intelligent Baggage System. All rights reserved.</p>
                    <p className="tagline">Securing travel globally 🌍</p>
                </div>
            </div>
        </footer>
    );
}