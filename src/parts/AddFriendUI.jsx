import React, { useState } from 'react';
import axios from 'axios';

const AddFriendUI = () => {
    const [uuid, setUuid] = useState('');
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/friends/add', { friendUuid: uuid }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus({ type: 'success', msg: "Friend request sent!" });
            setUuid('');
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.error || 'Failed to add friend' });
        }
    };

    return (
        <div className="max-w-xl">
            <h2 className="text-gray-900 font-bold text-lg mb-1">Add Friend</h2>
            <p className="text-gray-500 text-sm mb-6">Enter a user's unique UUID to send them a friend request.</p>
            
            <form onSubmit={handleAdd} className="flex items-center bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-50 focus-within:bg-white transition-all">
                <input 
                    value={uuid}
                    onChange={(e) => setUuid(e.target.value)}
                    placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                    className="bg-transparent flex-1 outline-none text-sm px-3 text-gray-800 placeholder:text-gray-400"
                />
                <button 
                    disabled={!uuid}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-xs font-bold py-2.5 px-5 rounded-lg transition-colors shadow-sm"
                >
                    Send Request
                </button>
            </form>
            
            {status.msg && (
                <p className={`mt-3 text-sm font-medium ${status.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {status.msg}
                </p>
            )}
        </div>
    );
};

export default AddFriendUI;