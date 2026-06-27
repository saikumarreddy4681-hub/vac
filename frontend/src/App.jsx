import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import CalendarView from './components/CalendarView';
import MaintenanceBlock from './components/MaintenanceBlock';
import Dashboard from './components/Dashboard';
import AddVehicle from './components/AddVehicle';
import BookingPage from './components/BookingPage';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import PaymentsList from './components/PaymentsList';
import MessagesList from './components/MessagesList';
import CustomersList from './components/CustomersList';
import EnquiriesList from './components/EnquiriesList';
import VehiclesList from './components/VehiclesList';
import AdminBookings from './components/AdminBookings';
import SettingsPage from './components/SettingsPage';
import './index.css';

function App() {
  const [bgTheme, setBgTheme] = useState('light'); // 'light' or 'dark'
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const setAuth = (val) => {
    setIsAuthenticated(val);
    if (val) {
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      localStorage.removeItem('isAuthenticated');
    }
  };

  const toggleTheme = () => {
    setBgTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const getBackgroundClass = () => {
    if (bgTheme === 'light') return 'animated-bg-light bg-gray-50';
    return 'animated-bg-dark text-white';
  };

  return (
    <Router>
      <div className={`min-h-screen flex ${isAuthenticated ? 'flex-row' : 'flex-col'} ${getBackgroundClass()} transition-colors duration-500 relative`}>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#121b28',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '14px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#121b28',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#121b28',
              },
            }
          }}
        />

        {/* Sidebar Navigation Panel (Only when authenticated) */}
        {isAuthenticated && <Sidebar />}

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          {/* Topbar Navigation Header (Only when authenticated) */}
          {isAuthenticated && <Navbar bgTheme={bgTheme} toggleTheme={toggleTheme} setAuth={setAuth} />}

          {/* Page Route Content */}
          <main className={`flex-1 w-full relative z-10 flex flex-col ${isAuthenticated ? 'px-4 sm:px-6 lg:px-12 py-8' : ''}`}>
            <Routes>
              <Route path="/login" element={!isAuthenticated ? <Login setAuth={setAuth} /> : <Navigate to="/" />} />
              <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/calendar" element={isAuthenticated ? <CalendarView /> : <Navigate to="/login" />} />
              <Route path="/booking" element={isAuthenticated ? <BookingPage /> : <Navigate to="/login" />} />
              <Route path="/maintenance" element={isAuthenticated ? <MaintenanceBlock /> : <Navigate to="/login" />} />
              <Route path="/add-vehicle" element={isAuthenticated ? <AddVehicle /> : <Navigate to="/login" />} />
              <Route path="/payments" element={isAuthenticated ? <PaymentsList /> : <Navigate to="/login" />} />
              <Route path="/messages" element={isAuthenticated ? <MessagesList /> : <Navigate to="/login" />} />
              <Route path="/customers" element={isAuthenticated ? <CustomersList /> : <Navigate to="/login" />} />
              <Route path="/enquiries" element={isAuthenticated ? <EnquiriesList /> : <Navigate to="/login" />} />
              <Route path="/vehicles" element={isAuthenticated ? <VehiclesList /> : <Navigate to="/login" />} />
              <Route path="/bookings" element={isAuthenticated ? <AdminBookings /> : <Navigate to="/login" />} />
              <Route path="/settings" element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
