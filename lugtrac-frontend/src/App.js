import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        
        {/* Main content dynamically changes based on AppRoutes */}
        <main className="main-content">
          <AppRoutes />
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;