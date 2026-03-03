import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FriendList = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFriends = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/friends', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFriends(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    const handleUnfriend = async (friendId) => {
        const previousFriends = [...friends];
        setFriends(friends.filter(f => f.id !== friendId));
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/friends/remove/${friendId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            setFriends(previousFriends);
        }
    };

    if (loading) return <div className="p-4 text-gray-400 italic">Loading...</div>;

    return (
        <div className="w-full">
            <h2 className="text-gray-500 uppercase font-bold text-[11px] mb-4 tracking-widest border-b border-gray-100 pb-2">
                All Friends — {friends.length}
            </h2>
            
            {friends.length > 0 ? (
                <div className="flex flex-col">
                    {friends.map((f) => (
                        <div key={f.id} className="flex items-center justify-between group px-4 py-3 hover:bg-gray-50 rounded-lg transition-all border-b border-gray-50">
                            <div className="flex items-center gap-4">
                                <img src={f.FriendDetails?.pfp} className="w-10 h-10 rounded-full border border-gray-200" alt="" />
                                <div>
                                    <div className="text-sm font-bold text-gray-900">{f.nickname}</div>
                                    <div className="text-xs text-green-500">Online</div>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleUnfriend(f.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-md transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center mt-32 text-center">
                    <p className="text-gray-400 text-sm font-medium">No friends here yet.</p>
                </div>
            )}
        </div>
    );
};

export default FriendList;