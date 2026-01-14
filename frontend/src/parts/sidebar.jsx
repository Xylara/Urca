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
      <nav className="flex-1">
      </nav>

      <div className="pb-8 px-2">
        {admin && (
          <button 
            onClick={() => navigate("/admin")}
            title="Admin Panel"
            className="group flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 hover:bg-zinc-100 border border-transparent hover:border-zinc-200"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="w-7 h-7 text-zinc-400 group-hover:text-zinc-900 transition-colors"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" 
              />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;