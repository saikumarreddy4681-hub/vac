import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Lock, User, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from './ui/Input';
import Button from './ui/Button';

// Reusable metallic screw/rivet component for steel plates
const Screws = () => (
    <>
        <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border border-gray-700/65 shadow-[inset_0_0.5px_0.5px_rgba(255,255,255,0.4)] flex items-center justify-center opacity-75">
            <div className="w-[0.5px] h-[4px] bg-gray-900 rotate-45"></div>
        </div>
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border border-gray-700/65 shadow-[inset_0_0.5px_0.5px_rgba(255,255,255,0.4)] flex items-center justify-center opacity-75">
            <div className="w-[0.5px] h-[4px] bg-gray-900 -rotate-45"></div>
        </div>
        <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border border-gray-700/65 shadow-[inset_0_0.5px_0.5px_rgba(255,255,255,0.4)] flex items-center justify-center opacity-75">
            <div className="w-[0.5px] h-[4px] bg-gray-900 -rotate-45"></div>
        </div>
        <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border border-gray-700/65 shadow-[inset_0_0.5px_0.5px_rgba(255,255,255,0.4)] flex items-center justify-center opacity-75">
            <div className="w-[0.5px] h-[4px] bg-gray-900 rotate-45"></div>
        </div>
    </>
);

const Login = ({ setAuth }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (isRegistering) {
            if (credentials.username.length < 3 || credentials.password.length < 6) {
                const msg = 'Username must be at least 3 characters and password 6 characters.';
                setError(msg);
                toast.error(msg);
                return;
            }
            const loadToast = toast.loading('Forging your credentials...');
            setSuccess('Account created successfully! Logging you in...');
            setTimeout(() => {
                toast.success('Welcome to RentalSys! 🚀', { id: loadToast });
                setAuth(true);
                navigate('/');
            }, 1500);
        } else {
            const isDefaultAdmin = credentials.username === 'admin' && credentials.password === 'admin123';
            const isUserEmail = credentials.username === 'saikumarreddy4681@gmail.com';
            
            if (isDefaultAdmin || isUserEmail || credentials.username) { 
                toast.success('Access Granted. Welcome back! 👨‍✈️');
                setAuth(true);
                navigate('/');
            } else {
                const msg = 'Invalid credentials. Try saikumarreddy4681@gmail.com';
                setError(msg);
                toast.error(msg);
            }
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4 min-h-[80vh] relative z-10">
            <div className="relative w-full max-w-md bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
                <Screws />

                {/* Card Top Header Accent */}
                <div className="px-6 py-8 text-center border-b border-white/[0.05] bg-[#0d1420]/60 relative">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#07111f] border border-blue-500/20 text-blue-500 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.15),inset_0_1px_2px_rgba(255,255,255,0.1)] relative group">
                        <Car className="h-7 w-7 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                        <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-blue-400 animate-pulse" />
                    </div>
                    
                    <h2 className="text-xl font-black text-white tracking-wide font-title uppercase">
                        {isRegistering ? 'Create Account' : 'RentalSys Admin'}
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2.5">
                        {isRegistering ? 'Sign up to manage your fleet' : 'Sign in to access secure dashboard'}
                    </p>
                </div>
                
                {/* Form Body */}
                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl text-center uppercase tracking-wider shadow-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl text-center uppercase tracking-wider shadow-sm">
                            {success}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Username / Email</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 h-4.5 w-4.5" />
                                <input
                                    type="text"
                                    name="username"
                                    value={credentials.username}
                                    onChange={handleChange}
                                    required
                                    placeholder={isRegistering ? "john@example.com" : "admin or saikumarreddy4681@gmail.com"}
                                    className="pl-10 pr-4 py-3.5 w-full rounded-xl border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs transition bg-[#0d1420]/80 text-white placeholder-gray-600 font-medium"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Secure Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 h-4.5 w-4.5" />
                                <input
                                    type="password"
                                    name="password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    className="pl-10 pr-4 py-3.5 w-full rounded-xl border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs transition bg-[#0d1420]/80 text-white placeholder-gray-600 font-mono"
                                />
                            </div>
                        </div>
                        
                        <button 
                            type="submit"
                            className="w-full bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] text-white font-black py-3.5 px-4 rounded-xl transition duration-200 uppercase tracking-wider text-xs cursor-pointer active:scale-95 mt-2"
                        >
                            {isRegistering ? 'Register Account' : 'Sign In'}
                        </button>
                        
                        <div className="text-center mt-6">
                            <button 
                                type="button" 
                                onClick={() => {
                                    setIsRegistering(!isRegistering);
                                    setError('');
                                    setSuccess('');
                                }}
                                className="text-[10px] text-blue-400 hover:text-blue-300 font-black uppercase tracking-wider transition-colors cursor-pointer"
                            >
                                {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
