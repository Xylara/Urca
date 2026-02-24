import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServerSidebar from '../parts/ServerSidebar';
import DashboardSidebar from '../parts/DashboardSidebar';

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        const res = await fetch(`/api/user/${payload.uuid}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();
        
        if (res.ok) {
          setUsername(data.username);
        } else {
          throw new Error();
        }
      } catch (e) {
        localStorage.removeItem('token');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) return <div className="min-h-screen bg-white" />;

  return (
    <div className="flex min-h-screen bg-white">
      <ServerSidebar />
      <DashboardSidebar username={username} />

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
        <div className="p-8"></div>
      </main>
    </div>
  );
};

export default Dashboard;