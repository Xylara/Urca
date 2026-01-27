import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Sidebar from '../parts/sidebar';

const Admin = () => {
  const [userStats, setUserStats] = useState({ total_users: 0 });
  const [appVersion, setAppVersion] = useState('...');
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
        const [usersRes, versionRes, githubRes] = await Promise.all([
          fetch(`${baseUrl}/api/users`, { headers }),
          fetch(`${baseUrl}/api/version`, { headers }),
          fetch('https://api.github.com/repos/Xylara/Pulse/commits?per_page=10')
        ]);

        if (usersRes.ok) setUserStats(await usersRes.json());
        if (versionRes.ok) {
          const v = await versionRes.json();
          setAppVersion(v.version);
        }
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
      <Sidebar />
      
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

          <div className="bg-zinc-100/40 border border-dashed border-zinc-300 rounded-2xl flex items-center justify-center text-zinc-400 text-xs italic">
            Slot
          </div>

          <div className="bg-zinc-100/40 border border-dashed border-zinc-300 rounded-2xl flex items-center justify-center text-zinc-400 text-xs italic">
            Slot
          </div>
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
                    <p className="text-sm text-zinc-600 truncate font-medium">
                      {c.commit.message}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 ml-4 flex-shrink-0">
                    {c.sha.substring(0, 7)}
                  </span>
                </div>
              ))}
              {commits.length === 0 && <div className="p-10 text-center text-zinc-400 text-xs italic uppercase tracking-widest">Connecting...</div>}
            </div>
          </div>

          <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm h-32 flex flex-col justify-center items-center border-dashed border-2">
               <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Logs</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm h-32 flex flex-col justify-center items-center border-dashed border-2">
               <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">API Health</p>
            </div>

            <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl flex flex-col justify-center border border-zinc-800">
               <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Engine Status</p>
               <h4 className="text-white font-bold tracking-tight flex items-center gap-2">
                 Active
                 <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
               </h4>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;