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
                d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" 
           />
        </svg>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;