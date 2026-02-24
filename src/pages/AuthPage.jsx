import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const [step, setStep] = useState(1);
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleNext = () => {
        if (step === 1 && formData.username.trim() !== '') {
            setStep(2);
            setError('');
        }
    };

    const handleSubmit = async () => {
        const endpoint = isLogin ? '/api/login' : '/api/register';
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                navigate('/dash');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Something went wrong");
        }
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter') {
            step === 1 ? handleNext() : handleSubmit();
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-white p-4 text-black">
            <div className="w-full max-w-[260px]">
                <div className="flex flex-col gap-4">
                    {step === 1 ? (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-black uppercase tracking-tight">Username</label>
                            <input 
                                autoFocus
                                type="text" 
                                value={formData.username}
                                className="w-full rounded-none border-[1.5px] border-black bg-white px-3 py-2 text-sm outline-none focus:bg-gray-50 transition-colors"
                                onKeyDown={onKeyDown}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-right-2 duration-200">
                            <label className="text-[11px] font-black uppercase tracking-tight">Password</label>
                            <input 
                                autoFocus
                                type="password" 
                                value={formData.password}
                                className="w-full rounded-none border-[1.5px] border-black bg-white px-3 py-2 text-sm outline-none focus:bg-gray-50 transition-colors"
                                onKeyDown={onKeyDown}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    )}

                    {error && <p className="text-[10px] font-bold uppercase text-red-600 tracking-tighter">{error}</p>}
                    
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={step === 1 ? handleNext : handleSubmit}
                            className="w-full rounded-none bg-black py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-white active:bg-gray-800 transition-all"
                        >
                            {step === 1 ? "Next" : (isLogin ? "Login" : "Register")}
                        </button>
                        
                        <div className="flex items-center justify-between px-0.5">
                            <button 
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setStep(1);
                                    setFormData({ username: '', password: '' });
                                    setError('');
                                }} 
                                className="text-[10px] font-bold uppercase text-gray-400 hover:text-black transition-colors"
                            >
                                {isLogin ? "Sign Up" : "Sign In"}
                            </button>

                            {step === 2 && (
                                <button 
                                    onClick={() => setStep(1)} 
                                    className="text-[10px] font-bold uppercase text-gray-400 hover:text-black transition-colors"
                                >
                                    ← Back
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;