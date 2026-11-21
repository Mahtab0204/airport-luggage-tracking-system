import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../index.css';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await axios.post('http://localhost:8080/api/auth/register', formData);
            navigate('/verify', { state: { email: formData.email } });
        } catch (err) {
            setError(err.response?.data || "Registration failed. Please try again.");
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
                    <h2>Passenger Registration 🛫</h2>
                    <p>Join LugTrac to secure and track your baggage worldwide.</p>
                </div>

                {error && <div className="error-alert">🚨 {error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>Full Name</label>
                        <div className="input-with-icon">
                            <span className="input-icon">👤</span>
                            <input 
                                type="text" 
                                required 
                                placeholder="John Doe"
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            />
                        </div>
                    </div>

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
                    </div>

                    <button type="submit" className="btn-auth-submit" disabled={isLoading}>
                        {isLoading ? 'Processing...' : 'Register & Send Code ✈️'}
                    </button>
                </form>

                <div className="auth-footer-link">
                    Already have an account? <Link to="/login">Login here 🧳</Link>
                </div>
            </div>
        </div>
    );
}