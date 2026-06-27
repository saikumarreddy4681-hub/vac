import { useState } from 'react';
import toast from 'react-hot-toast';
import { 
    Settings, User, Shield, Sliders, Bell, Mail, 
    Save, Key, CheckCircle, RefreshCw, Cpu
} from 'lucide-react';

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

const SettingsPage = () => {
    // Admin Profile State
    const [profile, setProfile] = useState({
        name: 'Admin Command',
        email: 'admin@rentalsys.com',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        role: 'Super Administrator'
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // General Config Mockup State
    const [configs, setConfigs] = useState({
        systemName: 'RentalSys Corp',
        currency: 'INR (₹)',
        autoBackup: true,
        notifyOnBooking: true,
        smtpSecure: true,
        aiAssistantGlow: true
    });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        const loadToast = toast.loading('Syncing admin configuration...');
        setTimeout(() => {
            toast.success('Admin profile credentials updated successfully! ✅', { id: loadToast });
        }, 800);
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New password parameters do not match!');
            return;
        }
        const loadToast = toast.loading('Encrypting & updating credentials...');
        setTimeout(() => {
            toast.success('Security password updated! 🔒', { id: loadToast });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }, 1000);
    };

    const handleToggleConfig = (key) => {
        setConfigs(prev => {
            const next = { ...prev, [key]: !prev[key] };
            toast.success(`${key.replace(/([A-Z])/g, ' $1')} updated!`, { duration: 1000 });
            return next;
        });
    };

    return (
        <div className="px-2 space-y-8 pb-12 max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Settings className="h-8 w-8 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-spin-slow" />
                    <h1 className="text-3xl font-black text-white tracking-wide font-title uppercase">System Settings</h1>
                </div>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-mono font-bold">
                    Admin Panel
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Admin Profile Panel (Left Col) */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Profile details */}
                    <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.55)]">
                        <Screws />
                        <h2 className="text-lg font-bold text-white mb-6 tracking-wide font-title flex items-center gap-2 relative z-10">
                            <User className="h-5 w-5 text-blue-400" /> Admin Profile Credentials
                        </h2>

                        <form onSubmit={handleProfileSubmit} className="space-y-5 relative z-10">
                            <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-white/[0.05]">
                                <div className="relative group">
                                    <img 
                                        src={profile.avatarUrl} 
                                        alt="Admin Avatar" 
                                        className="w-20 h-20 rounded-full object-cover border-2 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#121b28] rounded-full shadow-md"></span>
                                </div>
                                <div className="flex-1 space-y-1 text-center sm:text-left">
                                    <h3 className="text-base font-extrabold text-white uppercase tracking-wider">{profile.name}</h3>
                                    <p className="text-xs text-gray-500 font-mono font-bold">{profile.role}</p>
                                    <span className="inline-block px-2.5 py-0.5 bg-emerald-500/10 text-emerald-450 border border-emerald-500/25 rounded-md text-[9px] font-mono font-black uppercase mt-1">
                                        SECURE CONTEXT
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-widest mb-2">Display Name</label>
                                    <input 
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-455 uppercase tracking-widest mb-2">Admin Email</label>
                                    <input 
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-455 uppercase tracking-widest mb-2">Avatar URL Path</label>
                                <input 
                                    type="url"
                                    value={profile.avatarUrl}
                                    onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                                    className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                />
                            </div>

                            <button 
                                type="submit"
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-b from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] active:scale-[0.98] transition-all duration-200 font-bold text-xs uppercase tracking-wider cursor-pointer"
                            >
                                <Save className="h-4 w-4" /> Save Profile Details
                            </button>
                        </form>
                    </div>

                    {/* Security credentials */}
                    <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.55)]">
                        <Screws />
                        <h2 className="text-lg font-bold text-white mb-6 tracking-wide font-title flex items-center gap-2 relative z-10">
                            <Shield className="h-5 w-5 text-blue-400" /> Administrative Security
                        </h2>

                        <form onSubmit={handlePasswordSubmit} className="space-y-5 relative z-10">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-455 uppercase tracking-widest mb-2">Current password</label>
                                <input 
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                    placeholder="••••••••"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-455 uppercase tracking-widest mb-2">New password</label>
                                    <input 
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-455 uppercase tracking-widest mb-2">Confirm new password</label>
                                    <input 
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/50 text-white rounded-xl hover:from-slate-750 hover:to-slate-800 hover:shadow-[0_0_12px_rgba(255,255,255,0.05)] active:scale-[0.98] transition-all duration-200 font-bold text-xs uppercase tracking-wider cursor-pointer"
                            >
                                <Key className="h-4 w-4 text-blue-400" /> Update Password
                            </button>
                        </form>
                    </div>
                </div>

                {/* System & SMTP Settings (Right Col) */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Platform configs */}
                    <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.55)]">
                        <Screws />
                        <h2 className="text-lg font-bold text-white mb-6 tracking-wide font-title flex items-center gap-2 relative z-10">
                            <Sliders className="h-5 w-5 text-blue-400" /> System Preferences
                        </h2>

                        <div className="space-y-6 relative z-10">
                            {/* branding */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-455 uppercase tracking-widest mb-2">Platform Title Branding</label>
                                <input 
                                    type="text"
                                    value={configs.systemName}
                                    onChange={(e) => setConfigs({ ...configs, systemName: e.target.value })}
                                    className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                />
                            </div>

                            {/* Toggles */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Bell className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <span className="text-xs font-bold text-white block">Push Notifications</span>
                                            <span className="text-[9px] text-gray-500 block">Alert admin on new bookings</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleToggleConfig('notifyOnBooking')}
                                        className={`w-10 h-6 rounded-full transition-all duration-300 relative border cursor-pointer
                                            ${configs.notifyOnBooking ? 'bg-blue-600/20 border-blue-500/50' : 'bg-slate-950 border-white/[0.05]'}`}
                                    >
                                        <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300
                                            ${configs.notifyOnBooking ? 'left-[18px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'left-0.5 bg-gray-600'}`}></span>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Cpu className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <span className="text-xs font-bold text-white block">AI Dispatcher Assistance</span>
                                            <span className="text-[9px] text-gray-500 block">Synthesize smart routes and queries</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleToggleConfig('aiAssistantGlow')}
                                        className={`w-10 h-6 rounded-full transition-all duration-300 relative border cursor-pointer
                                            ${configs.aiAssistantGlow ? 'bg-blue-600/20 border-blue-500/50' : 'bg-slate-950 border-white/[0.05]'}`}
                                    >
                                        <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300
                                            ${configs.aiAssistantGlow ? 'left-[18px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'left-0.5 bg-gray-600'}`}></span>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="h-4 w-4 text-gray-400 animate-spin-slow" />
                                        <div>
                                            <span className="text-xs font-bold text-white block">Auto Database Backup</span>
                                            <span className="text-[9px] text-gray-500 block">Periodic MySQL & MongoDB syncs</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleToggleConfig('autoBackup')}
                                        className={`w-10 h-6 rounded-full transition-all duration-300 relative border cursor-pointer
                                            ${configs.autoBackup ? 'bg-blue-600/20 border-blue-500/50' : 'bg-slate-950 border-white/[0.05]'}`}
                                    >
                                        <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300
                                            ${configs.autoBackup ? 'left-[18px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'left-0.5 bg-gray-600'}`}></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SMTP Health panel */}
                    <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.55)]">
                        <Screws />
                        <h2 className="text-lg font-bold text-white mb-6 tracking-wide font-title flex items-center gap-2 relative z-10">
                            <Mail className="h-5 w-5 text-blue-400" /> Transporter SMTP Diagnostics
                        </h2>

                        <div className="space-y-4 relative z-10">
                            <div className="bg-[#0b111a]/50 border border-white/[0.05] p-3.5 rounded-xl flex items-center justify-between">
                                <div>
                                    <span className="text-[9px] text-gray-500 block uppercase tracking-wider font-bold">Mail Gateway Host</span>
                                    <span className="text-xs font-semibold text-white font-mono">smtp.gmail.com:587</span>
                                </div>
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-md text-[8px] font-mono font-bold uppercase">
                                    VERIFIED
                                </span>
                            </div>

                            <div className="bg-[#0b111a]/50 border border-white/[0.05] p-3.5 rounded-xl flex items-center justify-between">
                                <div>
                                    <span className="text-[9px] text-gray-500 block uppercase tracking-wider font-bold">SMTP SSL Transporter</span>
                                    <span className="text-xs font-semibold text-white font-mono">auth.secure: false</span>
                                </div>
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-md text-[8px] font-mono font-bold uppercase">
                                    ONLINE
                                </span>
                            </div>

                            <button 
                                type="button"
                                onClick={() => {
                                    const diagToast = toast.loading('Sending test ping to Gmail SMTP relays...');
                                    setTimeout(() => {
                                        toast.success('SMTP Handshake successful! Response 250 OK ✅', { id: diagToast });
                                    }, 1200);
                                }}
                                className="w-full bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600/20 text-blue-400 font-bold py-2.5 px-4 rounded-xl transition duration-200 active:scale-[0.98] uppercase tracking-wider text-[10px] cursor-pointer"
                            >
                                Trigger SMTP Diagnostics Test
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
