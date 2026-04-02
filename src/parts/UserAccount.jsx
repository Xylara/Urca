import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const UserAccount = () => {
  const [userData, setUserData] = useState({ username: '', pfp: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const res = await fetch(`/api/user/${payload.uuid}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok) {
          setUserData({ username: data.username, pfp: data.pfp });
        }
      } catch (e) {
        console.error("Failed to fetch user in account component");
      }
    };

    fetchUser();
  }, []);

  return (
    <Link 
      to="/settings/user" 
      className="flex items-center justify-between w-full gap-3 px-4 py-3 rounded-lg hover:bg-gray-200/60 transition-all group mx-auto max-w-[95%]"    >
      <div className="flex flex-col min-w-0 items-end flex-1">
        <span className="text-[13px] font-bold text-gray-700 truncate w-full text-right leading-tight group-hover:text-black">
          {userData.username || 'Loading...'}
        </span>
        <span className="text-[10px] font-medium text-gray-400 leading-tight">
          Online
        </span>
      </div>

      <div className="h-8 w-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
        {userData.pfp ? (
          <img 
            src={userData.pfp} 
            alt={userData.username} 
            className="h-full w-full object-cover" 
          />
        ) : (
          <span className="text-xs font-bold text-gray-600 uppercase">
            {userData.username?.charAt(0) || '?'}
          </span>
        )}
      </div>
    </Link>
  );
};

export default UserAccount;