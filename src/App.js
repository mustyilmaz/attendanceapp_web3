import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Register from './components/Register';
import Attendance from './components/Attendance';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import AttendanceList from './components/AttendanceList';
import './App.css';
import ProtectedRoute from './routes/ProtectedRoute';

const App = () => (
  <Router>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/attendance" element={<Attendance />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin-panel" element={
        <ProtectedRoute>
          <AdminPanel />
        </ProtectedRoute>
        } 
      />
      <Route path="/attendance-list" element={
        <ProtectedRoute>
          <AttendanceList />
        </ProtectedRoute>
        } 
      />
      
    </Routes>
  </Router>
);

export default App;
