import React from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '../parts/sidebar';

const Dashboard = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" />;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-[#f4f4f4]">
      <Sidebar />

      <main className="flex-1 p-10">
        <header className="flex justify-between items-center mb-8">
        </header>
      </main>
    </div>
  );
};

export default Dashboard;