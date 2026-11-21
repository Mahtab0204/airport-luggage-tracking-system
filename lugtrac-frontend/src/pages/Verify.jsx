import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import '../index.css';

export default function Verify() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Automatically grab the email passed from the Register page (if available)
    const initialEmail = location.state?.email || '';

    const [formData, setFormData] = useState({ email: initialEmail, code: '' });
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMsg(null);
        try {
            // Assuming your backend expects {email, code} or similar
            const response = await axios.post('http://localhost:8080/api/auth/verify', formData);
            setSuccessMsg("Account verified successfully! Redirecting to login...");
            
            // Wait 2 seconds so they can read the success message, then route to login
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data || "Verification failed. Please check your code.");
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            {/* Background decorative elements */}
            <div className="bg-blob blob-blue" style={{ top: '15%', left: '25%' }}></div>
            <div className="bg-blob blob-indigo" style={{ bottom: '15%', right: '25%' }}></div>

            <div className="auth-card">
                <div className="auth-header">
                    <h2>Verify Account 🛡️</h2>
                    <p>Enter the security code sent to your email.</p>
                </div>

                {error && <div className="error-alert">🚨 {error}</div>}
                
                {/* Reusing the error-alert class but styling it green for success inline */}
                {successMsg && (
                    <div className="error-alert" style={{ backgroundColor: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0' }}>
                        ✅ {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>Email Address</label>
                        <div className="input-with-icon">
                            <span className="input-icon">✉️</span>
                            <input 
                                type="email" 
                                required 
                                value={formData.email}
                                placeholder="passenger@example.com"
                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Verification Code</label>
                        <div className="input-with-icon">
                            <span className="input-icon">🔑</span>
                            <input 
                                type="text" 
                                required 
                                placeholder="Enter 6-digit code"
                                onChange={(e) => setFormData({...formData, code: e.target.value})} 
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-auth-submit" disabled={isLoading || successMsg}>
                        {isLoading ? 'Verifying...' : 'Confirm Account ✈️'}
                    </button>
                </form>

                <div className="auth-footer-link">
                    Didn't receive a code? <Link to="/register">Register again 🛄</Link>
                </div>
            </div>
        </div>
    );
}