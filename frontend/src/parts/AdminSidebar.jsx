import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      path: '/admin',
      label: 'Dashboard',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    },
    {
      path: '/admin/users',
      label: 'Users',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    }
  ];

  return (
    <aside className="w-20 flex-shrink-0 min-h-screen bg-white border-r border-zinc-200 flex flex-col items-center py-6">
      <nav className="flex-1 flex flex-col gap-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div key={item.path} className="relative group flex items-center">
              <button
                onClick={() => navigate(item.path)}
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 border 
                  ${isActive 
                    ? 'bg-zinc-100 border-zinc-200 text-zinc-900' 
                    : 'text-zinc-400 border-transparent hover:bg-zinc-100 hover:border-zinc-200 hover:text-zinc-900'
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  {item.icon}
                </svg>
              </button>

              <span className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                {item.label}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45"></div>
              </span>
            </div>
          );
        })}
      </nav>

      <div className="pb-8 flex flex-col gap-4">
        <div className="relative group flex items-center">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 text-zinc-400 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 hover:text-zinc-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </button>
          
          <span className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
            Exit Admin
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45"></div>
          </span>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;