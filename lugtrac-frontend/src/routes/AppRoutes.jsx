import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Verify from '../pages/Verify';
import Dashboard from '../pages/Dashboard';
import AdminSimulator from '../pages/AdminSimulator';
import BaggageUpload from '../components/BaggageUpload'; 
import ForgotPassword from '../components/ForgotPassword';

// ... inside your <Routes> ...
<Route path="/add-bag" element={<BaggageUpload />} />


// Custom component to protect the dashboard route
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/add-bag" element={<BaggageUpload />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            
            {/* Protected Routes */}
            <Route 
                path="/dashboard" 
                element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                } 
            />
            <Route path="/simulator" element={<AdminSimulator />} />
        </Routes>
    );
}