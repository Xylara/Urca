import React from 'react';
import { useNavigate } from 'react-router-dom';
import ServerSidebar from '../parts/ServerSidebar';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-white">
      <ServerSidebar />
    </div>
  );
};

export default Dashboard;