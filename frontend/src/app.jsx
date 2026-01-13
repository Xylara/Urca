import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/auth';

const Dashboard = () => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/" />;

  return (
    <div className="flex flex-row min-h-screen bg-[#f4f4f4]">
      <div className="flex flex-col justify-center p-10 min-w-[380px]">
        <div className="w-[300px]">
          <h2 className="text-2xl font-bold text-center mb-6">Dashboard</h2>
          <p className="text-center mb-6">You are successfully logged in!</p>
          <button 
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className="w-full py-2.5 bg-black text-white font-bold rounded cursor-pointer hover:bg-zinc-800 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
      <div className="w-1 bg-black h-screen ml-1"></div>
      <div className="flex-1"></div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;