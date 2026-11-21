import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../index.css';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [message, setMessage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSendCode = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        setMessage('');
        
        try {
            await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
            setStep(2);
            setMessage("A 6-digit code has been sent to your email. It expires in 15 minutes.");
        } catch (error) {
            setErrorMsg("Could not request reset code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        setMessage('');

        try {
            await axios.post('http://localhost:8080/api/auth/reset-password', { token, newPassword });
            alert("Password successfully reset! Please log in with your new password.");
            navigate('/login');
        } catch (error) {
            // Display the exact error from Spring Boot (e.g., "Reset code has expired.")
            if (error.response && error.response.data && error.response.data.error) {
                setErrorMsg(error.response.data.error);
            } else {
                setErrorMsg("Invalid reset code. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Reset Password 🔐</h2>
                    <p>Securely recover your LugTrac account.</p>
                </div>
                
                {message && <div className="alert-success" style={{ padding: '10px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem' }}>{message}</div>}
                {errorMsg && <div className="alert-error" style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem' }}>{errorMsg}</div>}
                
                {step === 1 ? (
                    <form onSubmit={handleSendCode}>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                required 
                                placeholder="passenger@example.com"
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: '100%', marginTop: '10px' }}>
                            {isLoading ? "Sending Code..." : "Send Reset Code"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <div className="input-group">
                            <label>6-Digit Reset Code</label>
                            <input 
                                type="text" 
                                required 
                                maxLength="6"
                                placeholder="e.g. 123456"
                                value={token} 
                                onChange={(e) => setToken(e.target.value)} 
                            />
                        </div>
                        <div className="input-group">
                            <label>New Password</label>
                            <input 
                                type="password" 
                                required 
                                placeholder="••••••••"
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: '100%', marginTop: '10px' }}>
                            {isLoading ? "Resetting..." : "Update Password"}
                        </button>
                        
                        <button type="button" onClick={() => { setStep(1); setErrorMsg(''); }} style={{ width: '100%', marginTop: '10px', background: 'transparent', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>
                            Request New Code
                        </button>
                    </form>
                )}
                
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button className="btn-link" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold' }}>
                        ← Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}