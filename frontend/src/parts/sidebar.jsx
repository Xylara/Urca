import React from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Sidebar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let admin = false;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      admin = decoded.admin === "yes";
    } catch (error) {
      console.error("Invalid token");
    }
  }

  return (
    <aside className="w-20 flex-shrink-0 min-h-screen bg-white border-r border-zinc-200 flex flex-col items-center">      
      <nav className="flex-1"></nav>

      <div className="pb-8 px-2">
        {admin && (
          <div className="relative group flex items-center">
            <button 
              onClick={() => navigate("/admin")}
              className="flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 hover:bg-zinc-100 border border-transparent hover:border-zinc-200"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="w-7 h-7 text-zinc-400 group-hover:text-zinc-900 transition-colors"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
              </svg>
            </button>

            {/* Tooltip */}
            <span className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
              Admin Panel
              {/* Tooltip Arrow */}
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45"></div>
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;