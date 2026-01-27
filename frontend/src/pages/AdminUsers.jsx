import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AdminSidebar from '../parts/AdminSidebar';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ new_username: '', new_password: '', admin_status: '' });
  const token = localStorage.getItem("token");

  const baseUrl = import.meta.env.VITE_API_BASE;
  const apiKey = import.meta.env.VITE_PULSE_API_KEY;

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/users/list`, {
        headers: { 'x-api-key': apiKey, 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${baseUrl}/api/users/update`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'x-api-key': apiKey, 
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          id: editingUser.id,
          ...formData
        })
      });
      if (res.ok) {
        setEditingUser(null);
        setFormData({ new_username: '', new_password: '', admin_status: '' });
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Username</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-mono text-zinc-400">#{user.id}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-zinc-900">{user.username}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${user.admin === 'yes' ? 'bg-indigo-50 text-indigo-600' : 'bg-zinc-100 text-zinc-500'}`}>
                      {user.admin === 'yes' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setEditingUser(user);
                        setFormData({ ...formData, admin_status: user.admin });
                      }}
                      className="text-xs font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingUser && (
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden">
              <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center">
                <h2 className="font-bold text-zinc-900">Edit User: {editingUser.username}</h2>
                <button onClick={() => setEditingUser(null)} className="text-zinc-400 hover:text-zinc-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <form onSubmit={handleUpdate} className="p-8 space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">New Username</label>
                  <input 
                    type="text" 
                    placeholder="Leave blank to keep current"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    onChange={(e) => setFormData({...formData, new_username: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Admin Rights</label>
                  <select 
                    value={formData.admin_status}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none"
                    onChange={(e) => setFormData({...formData, admin_status: e.target.value})}
                  >
                    <option value="no">Standard User</option>
                    <option value="yes">Administrator</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-zinc-900 text-white font-bold py-4 rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsers;