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
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-[350px] rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                
                <div className="flex flex-col gap-4">
                    {step === 1 ? (
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700">Username</label>
                            <input 
                                autoFocus
                                type="text" 
                                value={formData.username}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base outline-none focus:border-black transition-colors"
                                placeholder="Type it here..."
                                onKeyDown={onKeyDown}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                            <label className="text-sm font-semibold text-gray-700">Password</label>
                            <input 
                                autoFocus
                                type="password" 
                                value={formData.password}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base outline-none focus:border-black transition-colors"
                                placeholder="Keep it secret..."
                                onKeyDown={onKeyDown}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    )}

                    {error && <p className="text-xs font-medium text-red-500">{error}</p>}
                    
                    <div className="mt-4 flex items-center justify-between">
                        <button 
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setStep(1);
                                setFormData({ username: '', password: '' });
                                setError('');
                            }} 
                            className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {isLogin ? "Register" : "Login"}
                        </button>
                        
                        <button 
                            onClick={step === 1 ? handleNext : handleSubmit}
                            className="rounded-lg bg-black px-5 py-2 text-xs font-bold text-white hover:bg-gray-800 active:scale-95 transition-all"
                        >
                            {step === 1 ? "Next" : (isLogin ? "Login" : "Register")}
                        </button>
                    </div>
                </div>

                {step === 2 && (
                    <button 
                        onClick={() => setStep(1)} 
                        className="mt-6 block w-full text-center text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:text-gray-500"
                    >
                        ← Back
                    </button>
                )}
            </div>
        </div>
    );
};

export default AuthPage;