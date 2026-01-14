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
          <h1 className="text-2xl font-bold text-zinc-800">Overview</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-black text-white text-sm font-bold rounded hover:bg-zinc-800 transition-colors whitespace-nowrap"
          >
            Log Out
          </button>
        </header>

        <div className="rounded-xl border border-zinc-200 bg-white h-[calc(100vh-160px)] shadow-sm flex items-center justify-center">
           <p className="text-zinc-400 font-medium italic">Welcome to the Pulse Dashboard</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;