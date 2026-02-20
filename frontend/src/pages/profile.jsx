import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Sidebar from '../parts/sidebar';
import AccountSidebar from '../parts/AccountSidebar';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:7000";
const PULSE_API_KEY = import.meta.env.VITE_PULSE_API_KEY;

const Profile = () => {
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState({ id: null, username: '' });
  const [pfpUrl, setPfpUrl] = useState(null);
  const [cacheBust, setCacheBust] = useState(Date.now());

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userData = {
          id: decoded.uuid || decoded.sub,
          username: decoded.username || decoded.sub || ''
        };
        setUser(userData);
        setPfpUrl(`${API_BASE}/api/user/${userData.username}/pfp`);
      } catch (e) {
        console.error(e);
      }
    }
  }, [token]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !user.username) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE}/api/user/${user.username}/pfp/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-api-key": PULSE_API_KEY,
        },
        body: formData,
      });

      if (response.ok) {
        setCacheBust(Date.now());
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-zinc-900">
      <Sidebar />
      <AccountSidebar />

      <main className="flex-1 p-10 max-w-4xl">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        </header>

        <section className="space-y-12">
          <div className="flex items-start gap-8 pb-10 border-b border-zinc-100">
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm bg-zinc-50">
              <img
                src={pfpUrl ? `${pfpUrl}?t=${cacheBust}` : "https://s3.tebi.io/main/default.png"}
                alt="Profile"
                className={`w-full h-full object-cover ${uploading ? 'opacity-40' : 'opacity-100'}`}
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-semibold uppercase text-zinc-400">Profile Picture</h3>
              <div className="flex gap-3 mt-4">
                <label className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-zinc-800">
                  {uploading ? 'Uploading...' : 'Upload New Image'}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    disabled={uploading}
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-zinc-700">Username</label>
              <input type="text" value={user.username} readOnly className="px-4 py-2.5 bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-500 cursor-not-allowed" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Profile;