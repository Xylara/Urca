import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FriendList = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/friends', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFriends(res.data);
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFriends();
    }, []);

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
                                    <div className="text-xs text-gray-500">Online</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center mt-32 text-center">
                    <p className="text-gray-400 text-sm font-medium">No friends here yet. Try adding some!</p>
                </div>
            )}
        </div>
    );
};

export default FriendList;