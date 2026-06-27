import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, PlusCircle, Calendar, BookOpen, Wrench, 
    CreditCard, MessageSquare, Users, Mail, Car, Settings, MoreVertical 
} from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/vehicles', label: 'Vehicles', icon: Car },
        { path: '/bookings', label: 'Bookings', icon: BookOpen },
        { path: '/customers', label: 'Customers', icon: Users },
        { path: '/maintenance', label: 'Maintenance', icon: Wrench },
        { path: '/payments', label: 'Payments', icon: CreditCard },
        { path: '/messages', label: 'Messages', icon: Mail },
        { path: '/settings', label: 'Settings', icon: Settings }
    ];

    return (
        <aside className="hidden lg:flex flex-col w-[260px] min-h-screen bg-[#080f19]/95 border-r border-white/[0.08] text-gray-400 relative z-45">
            {/* Sidebar Brand Header */}
            <div className="h-16 flex items-center px-6 border-b border-white/[0.05] gap-2.5">
                <Car className="h-6 w-6 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] animate-pulse" />
                <span className="text-xl font-black text-white tracking-wider font-title uppercase">
                    Rental<span className="text-blue-500">Sys</span>
                </span>
            </div>

            {/* Sidebar Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase px-3 mb-2">Main</div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => 
                                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                                ${isActive 
                                    ? 'bg-blue-600/15 text-blue-400 border-l-3 border-blue-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                                    : 'hover:bg-white/[0.03] hover:text-gray-200 border-l-3 border-transparent'
                                }`
                            }
                        >
                            <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                            {item.label}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Decorative Fleet Card */}
            <div className="p-4 border-t border-white/[0.05]">
                <div className="relative overflow-hidden bg-gradient-to-b from-[#142030]/80 to-[#0d1621]/80 border border-white/[0.08] rounded-2xl p-4 shadow-lg group">
                    {/* Metallic Screws */}
                    <div className="absolute top-2 left-2 w-1 h-1 rounded-full bg-gray-500 opacity-40"></div>
                    <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-gray-500 opacity-40"></div>
                    
                    <img 
                        src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=300&q=80" 
                        alt="Sleek Sedan" 
                        className="w-full h-24 object-cover rounded-lg border border-white/[0.08] shadow-md mb-3 group-hover:scale-105 transition-transform duration-300"
                    />
                    <h3 className="text-xs font-bold text-white tracking-wide font-title uppercase">Rental<span className="text-blue-400">Sys</span></h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">Vehicle Rental Booking System</p>
                </div>
            </div>

            {/* User Profile Footer Section */}
            <div className="p-4 border-t border-white/[0.05] bg-[#060b12]/90 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm border border-white/[0.1] shadow-md uppercase">
                            Ad
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#060b12] shadow-sm"></div>
                    </div>
                    <div className="flex flex-col truncate max-w-[130px]">
                        <span className="text-xs font-bold text-white leading-tight">Admin</span>
                        <span className="text-[9px] text-gray-500 truncate leading-none mt-0.5">admin@rentalsys.com</span>
                    </div>
                </div>
                <button className="p-1 hover:bg-white/[0.05] rounded-lg text-gray-500 hover:text-white transition-colors">
                    <MoreVertical className="h-4 w-4" />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
