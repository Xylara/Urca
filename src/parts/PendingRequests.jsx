import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PendingRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/friends/pending', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (requestId, action) => {
        const previousRequests = [...requests];
        setRequests(requests.filter(req => req.id !== requestId));

        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/friends/${action}`, { requestId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            setRequests(previousRequests);
        }
    };

    if (loading) return <div className="p-4 text-gray-400 italic text-sm">Loading...</div>;

    return (
        <div className="w-full">
            <h2 className="text-gray-500 uppercase font-bold text-[11px] mb-4 tracking-widest border-b border-gray-100 pb-2">
                Pending — {requests.length}
            </h2>
            {requests.length > 0 ? (
                <div className="flex flex-col">
                    {requests.map((req) => (
                        <div key={req.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg border-b border-gray-50">
                            <div className="flex items-center gap-4">
                                <img src={req.SenderDetails?.pfp} className="w-10 h-10 rounded-full border border-gray-200" alt="" />
                                <div className="text-sm font-bold text-gray-900">{req.SenderDetails?.username}</div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleAction(req.id, 'accept')}
                                    className="w-8 h-8 flex items-center justify-center bg-gray-100 text-green-600 rounded-full hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                >
                                    ✓
                                </button>
                                <button 
                                    onClick={() => handleAction(req.id, 'deny')}
                                    className="w-8 h-8 flex items-center justify-center bg-gray-100 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center mt-32">
                    <p className="text-gray-400 text-sm">No pending requests.</p>
                </div>
            )}
        </div>
    );
};

export default PendingRequests;