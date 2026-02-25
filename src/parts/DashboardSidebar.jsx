import React from 'react';
import UserAccount from './UserAccount';

const DashboardSidebar = ({ username, pfp }) => {
  return (
    <div className="fixed left-[72px] top-0 flex h-screen w-[240px] flex-col bg-[#f8f9fa] border-r border-gray-100">
      <div className="flex-1"></div>
      <div className="p-4 bg-[#ebedef]">
        <UserAccount username={username} pfp={pfp} />
      </div>
    </div>
  );
};

export default DashboardSidebar;