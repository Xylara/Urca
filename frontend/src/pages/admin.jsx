import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Sidebar from '../parts/sidebar';
import AdminSidebar from '../parts/AdminSidebar';

const Admin = () => {
  const [userStats, setUserStats] = useState({ total_users: 0 });
  const [appVersion, setAppVersion] = useState('...');
  const [health, setHealth] = useState({ status: '...', database: '...' });
  const [commits, setCommits] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      const baseUrl = import.meta.env.VITE_API_BASE;
      const apiKey = import.meta.env.VITE_PULSE_API_KEY;
      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'Authorization': `Bearer ${token}`
      };

      try {
        const [usersRes, versionRes, healthRes, githubRes] = await Promise.all([
          fetch(`${baseUrl}/api/users`, { headers }),
          fetch(`${baseUrl}/api/version`, { headers }),
          fetch(`${baseUrl}/api/health`, { headers }),
          fetch('https://api.github.com/repos/Xylara/Pulse/commits?per_page=10')
        ]);

        if (usersRes.ok) setUserStats(await usersRes.json());
        if (versionRes.ok) setAppVersion((await versionRes.json()).version);
        if (healthRes.ok) setHealth(await healthRes.json());
        if (githubRes.ok) setCommits(await githubRes.json());
      } catch (err) {
        console.error(err);
      }
    };

    if (token) fetchData();
  }, [token]);

  if (!token) return <Navigate to="/" />;
  try {
    const decoded = jwtDecode(token);
    if (decoded.admin !== "yes") return <Navigate to="/dashboard" />;
  } catch {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Version</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-zinc-900">{appVersion}</span>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Users</p>
            <span className="text-2xl font-bold text-zinc-900">{userStats.total_users}</span>
          </div>
          <div className="bg-zinc-100/40 border border-dashed border-zinc-300 rounded-2xl flex items-center justify-center text-zinc-400 text-xs italic font-bold uppercase tracking-widest">Slot</div>
          <div className="bg-zinc-100/40 border border-dashed border-zinc-300 rounded-2xl flex items-center justify-center text-zinc-400 text-xs italic font-bold uppercase tracking-widest">Slot</div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col h-fit">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 rounded-t-2xl">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Github Activity</h3>
              <a href="https://github.com/Xylara/Pulse" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-500 hover:text-indigo-600 font-bold uppercase tracking-widest">Repo</a>
            </div>
            <div className="divide-y divide-zinc-50">
              {commits.map((c) => (
                <div key={c.sha} className="px-6 py-3 flex items-center justify-between hover:bg-zinc-50/80 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={c.author?.avatar_url} alt="" className="w-5 h-5 rounded-full grayscale opacity-70" />
                    <p className="text-sm text-zinc-600 truncate font-medium">{c.commit.message}</p>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 ml-4 flex-shrink-0">{c.sha.substring(0, 7)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/3 flex flex-col gap-4">
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
               <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2">Backend Status</p>
               <div className="flex items-center justify-between">
                 <span className="text-sm font-bold text-zinc-900">API</span>
                 <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${health.status === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>{health.status}</span>
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
               <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2">Database Status</p>
               <div className="flex items-center justify-between">
                 <span className="text-sm font-bold text-zinc-900">PostgreSQL</span>
                 <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${health.database === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>{health.database}</span>
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
               <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2">Engine Status</p>
               <div className="flex items-center justify-between">
                 <span className="text-sm font-bold text-zinc-900">Active</span>
                 <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
               </div>
            </div>

            <div className="bg-zinc-100/50 border border-dashed border-zinc-200 rounded-2xl h-24 flex items-center justify-center">
               <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest italic text-center px-4">Logs coming soon</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;