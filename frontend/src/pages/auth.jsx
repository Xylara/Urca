import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const API_BASE = ""; 

function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    const payload = isLogin ? { username, password } : { username, password, email };
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (isLogin) {
          const data = await response.json();
          localStorage.setItem("token", data.token);
          navigate("/dashboard");
        } else {
          setMessage("Account created.");
          setIsLogin(true);
          setLoading(false);
        }
      } else {
        setLoading(false);
        setMessage("Login failed.");
      }
    } catch (err) {
      setLoading(false);
      setMessage("Connection error.");
    }
  };

  return (
    <div className="flex flex-row min-h-screen bg-[#f4f4f4] relative overflow-hidden">
      
      <div 
        className={`fixed top-0 left-0 h-[3px] bg-[#007bff] transition-all duration-500 ease-in-out z-50 ${loading ? 'opacity-100' : 'opacity-0 w-0'}`}
        style={{ width: loading ? '70%' : '0%' }}
      ></div>

      <div className="flex flex-col justify-center p-10 min-w-[380px]">
        <div className="w-[300px]">
          <h2 className="text-2xl font-bold text-center mb-6">
            {isLogin ? "Login" : "Register"}
          </h2>

          {message && (
            <p className="text-red-600 text-[13px] text-center mb-4 break-words font-medium">
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div className="flex flex-col gap-1">
                <label className="font-bold text-sm">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border border-[#ccc] rounded focus:outline-none focus:border-black bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="font-bold text-sm">Username</label>
              <input
                type="text"
                className="w-full p-2 border border-[#ccc] rounded focus:outline-none focus:border-black bg-white"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-sm">Password</label>
              <input
                type="password"
                className="w-full p-2 border border-[#ccc] rounded focus:outline-none focus:border-black bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full mt-2 py-2.5 bg-black text-white font-bold rounded cursor-pointer hover:bg-zinc-800 transition-colors"
            >
              {isLogin ? "Log In" : "Register"}
            </button>
          </form>

          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
            className="w-full mt-4 text-center text-sm text-black hover:underline cursor-pointer bg-transparent border-none p-0"
          >
            {isLogin ? "Need an Account?" : "Already have an account?"}
          </button>
        </div>
      </div>

      <div className="w-1 bg-black h-screen ml-1"></div>

      <div className="flex-1 bg-[#f4f4f4]"></div>
    </div>
  );
}

export default AuthPage;