import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css'; 

export default function Navbar() {
    const navigate = useNavigate();
    
    // Check if the user is currently logged in
    const isAuthenticated = !!localStorage.getItem('token');

    const handleLogout = () => {
        // Clear the token and redirect to login
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className="custom-navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    🧳 <span className="gradient-text">LugTrac</span>
                </Link>

                <div className="nav-links">
                    <Link to="/">Home</Link>
                    {isAuthenticated && <Link to="/dashboard">My Luggage</Link>}
                </div>

                <div className="nav-auth">
                    {isAuthenticated ? (
                        <button onClick={handleLogout} className="btn-logout">
                            Logout 🚪
                        </button>
                    ) : (
                        <>
                            <Link to="/login" className="btn-text">Login</Link>
                            <Link to="/register" className="btn-register">Register ✈️</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}