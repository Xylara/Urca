import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/auth';
import Dashboard from './pages/dash';
import Admin from './pages/admin';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/profile';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/account/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;