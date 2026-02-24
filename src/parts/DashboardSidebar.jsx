import React from 'react';
import UserAccount from './UserAccount';

const DashboardSidebar = ({ username }) => {
  return (
    <aside className="fixed left-[72px] top-0 flex h-screen w-60 flex-col justify-between bg-[#f8f9fa] border-r border-gray-200">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="h-12 flex items-center px-4">
        </div>
        <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        </div>
      </div>

      <div className="h-14 bg-[#ebedef] border-t border-gray-200 flex items-center px-3 w-full">
        <UserAccount username={username} />
      </div>
    </aside>
  );
};

export default DashboardSidebar;