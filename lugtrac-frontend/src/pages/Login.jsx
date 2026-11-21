import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../index.css';

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', formData);
            
            // Extract token (handles both {token: "..."} object or raw string response)
            const token = response.data.token || response.data; 
            
            // Save token to localStorage for authenticated requests
            localStorage.setItem('token', token);
            
            // Redirect to the Passenger Dashboard
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || "Invalid email or password.");
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            {/* Background decorative elements */}
            <div className="bg-blob blob-blue" style={{ top: '10%', left: '20%' }}></div>
            <div className="bg-blob blob-indigo" style={{ bottom: '10%', right: '20%' }}></div>

            <div className="auth-card">
                <div className="auth-header">
                    <h2>Passenger Login 🧳</h2>
                    <p>Welcome back! Access your smart luggage dashboard.</p>
                </div>

                {error && <div className="error-alert">🚨 {error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>Email Address</label>
                        <div className="input-with-icon">
                            <span className="input-icon">✉️</span>
                            <input 
                                type="email" 
                                required 
                                placeholder="passenger@example.com"
                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <span className="input-icon">🔒</span>
                            <input 
                                type="password" 
                                required 
                                placeholder="••••••••"
                                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                            />
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '5px' }}>
        <a href="/forgot-password" style={{ fontSize: '0.85rem', color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>
            Forgot Password?
        </a>
    </div>
                    </div>

                    <button type="submit" className="btn-auth-submit" disabled={isLoading}>
                        {isLoading ? 'Authenticating...' : 'Secure Login ✈️'}
                    </button>
                </form>

                <div className="auth-footer-link">
                    Don't have an account? <Link to="/register">Register here 🛫</Link>
                </div>
            </div>
        </div>
    );
}