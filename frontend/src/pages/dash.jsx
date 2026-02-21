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
    <div className="flex min-h-screen w-full bg-[#f4f4f4] overflow-hidden">
      <Sidebar />

      <main className="flex-1 min-w-0 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
        </header>
      </main>
    </div>
  );
};

export default Dashboard;