import React, { useState } from 'react';
import ServerSidebar from '../parts/ServerSidebar';
import DashboardSidebar from '../parts/DashboardSidebar';
import FriendList from '../parts/FriendList';
import AddFriendUI from '../parts/AddFriendUI';
import PendingRequests from '../parts/PendingRequests';

const Dashboard = () => {
    const [tab, setTab] = useState('all');

    return (
        <div className="flex h-screen w-full bg-white text-gray-800 overflow-hidden">
            <ServerSidebar />
            <DashboardSidebar />

            <main className="flex-1 flex flex-col bg-white ml-[312px] h-full">
                <header className="h-12 min-h-[48px] border-b border-gray-200 flex items-center px-6 gap-6 shadow-sm">
                    <div className="flex items-center gap-2 pr-6 border-r border-gray-200">
                        <span className="font-bold text-gray-900">Friends</span>
                    </div>
                    
                    <nav className="flex gap-4 text-sm font-medium">
                        <button 
                            onClick={() => setTab('all')}
                            className={`px-3 py-1 rounded-md transition ${tab === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            All
                        </button>
                        <button 
                            onClick={() => setTab('pending')}
                            className={`px-3 py-1 rounded-md transition ${tab === 'pending' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Pending
                        </button>
                        <button 
                            onClick={() => setTab('add')}
                            className={`px-3 py-1 rounded-md transition ${tab === 'add' ? 'bg-green-600 text-white' : 'text-green-600 hover:bg-green-50'}`}
                        >
                            Add Friend
                        </button>
                    </nav>
                </header>

                <div className="flex-1 overflow-y-auto bg-white">
                    <div className="max-w-5xl px-8 py-6">
                        {tab === 'all' && <FriendList />}
                        {tab === 'pending' && <PendingRequests />}
                        {tab === 'add' && <AddFriendUI />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;