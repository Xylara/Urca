import React from 'react';
import { useNavigate } from 'react-router-dom';
import ServerSidebar from '../parts/ServerSidebar';
import DashboardSidebar from '../parts/DashboardSidebar';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-white">
      <ServerSidebar />
      <DashboardSidebar />

      <main className="ml-[312px] flex-1 flex flex-col">
        <header className="flex h-12 items-center justify-between border-b border-gray-100 px-6">
          <span className="text-sm font-bold text-gray-600">Dashboard</span>
          <button 
            onClick={() => { localStorage.removeItem('token'); navigate('/'); }}
            className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        </header>
        <div className="p-8">
        </div>
      </main>
    </div>
  );
};

export default Dashboard;