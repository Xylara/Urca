import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Sidebar from '../parts/sidebar';

const Admin = () => {
  const token = localStorage.getItem("token");
  
  if (!token) return <Navigate to="/" />;
  
  try {
    const decoded = jwtDecode(token);
    if (decoded.admin !== "yes") return <Navigate to="/dashboard" />;
  } catch {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex min-h-screen w-full bg-[#f4f4f4] overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0 p-10 overflow-y-auto">
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
        </div>
      </main>
    </div>
  );
};

export default Admin;