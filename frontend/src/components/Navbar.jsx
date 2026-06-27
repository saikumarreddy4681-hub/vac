import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
    Calendar, Wrench, LayoutDashboard, PlusCircle, Car, BookOpen, 
    LogOut, Mail, Menu, Sun, Moon, X, User, Settings, CreditCard, Users, ShieldAlert, ChevronDown
} from 'lucide-react';

// Reusable metallic screw/rivet component for steel plates
const Screws = () => (
    <>
        <div className="absolute top-2 left-2 w-1 h-1 rounded-full bg-gray-500 opacity-40"></div>
        <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-gray-500 opacity-40"></div>
        <div className="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-gray-500 opacity-40"></div>
        <div className="absolute bottom-2 right-2 w-1 h-1 rounded-full bg-gray-500 opacity-40"></div>
    </>
);

const Navbar = ({ bgTheme, toggleTheme, setAuth }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    // Complete list of navigation links matching the sidebar for mobile usage
    const allLinks = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/add-vehicle', label: 'Add Vehicle', icon: PlusCircle },
        { path: '/calendar', label: 'Calendar', icon: Calendar },
        { path: '/booking', label: 'Bookings', icon: BookOpen },
        { path: '/enquiries', label: 'Enquiries', icon: Mail },
        { path: '/customers', label: 'Customers', icon: Users },
        { path: '/payments', label: 'Reports', icon: CreditCard },
        { path: '/messages', label: 'Settings', icon: Settings }
    ];

    // Desktop top navigation (focused subset)
    const topLinks = allLinks.slice(0, 5);

    return (
        <nav className="bg-[#080f19]/80 backdrop-blur-md border-b border-white/[0.08] sticky top-0 z-50 h-16 flex items-center">
            <div className="w-full px-4 sm:px-6 lg:px-12">
                <div className="flex justify-between items-center h-full">
                    
                    {/* Left Section: Mobile Brand / Desktop Navigation */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        {/* Mobile Menu Toggle Button */}
                        <button 
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl text-gray-300 hover:text-white transition cursor-pointer"
                            aria-label="Open navigation menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        {/* Mobile Brand Logo */}
                        <div className="lg:hidden flex items-center gap-2">
                            <Car className="h-5 w-5 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                            <span className="text-base sm:text-lg font-black text-white tracking-wider font-title uppercase">
                                Rental<span className="text-blue-500">Sys</span>
                            </span>
                        </div>

                        {/* Desktop Sub-navigation Links */}
                        <div className="hidden lg:flex items-center space-x-6">
                            {topLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <NavLink
                                        key={link.path}
                                        to={link.path}
                                        className={({ isActive }) => 
                                            `inline-flex items-center px-1 pt-1 text-sm font-semibold transition-all duration-200 border-b-2 h-16 gap-2
                                            ${isActive 
                                                ? 'border-blue-500 text-blue-400' 
                                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-white/[0.15]'
                                            }`
                                        }
                                    >
                                        <Icon className="h-4 w-4" />
                                        {link.label}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Section: Theme Toggle, Admin Avatar, & Logout */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        
                        {/* Theme Toggle Switch */}
                        <button 
                            onClick={toggleTheme}
                            className="relative flex items-center justify-between w-16 h-8 bg-[#121b28]/90 border border-white/[0.08] rounded-full p-1 cursor-pointer hover:border-white/[0.15] transition-all duration-200 shadow-inner"
                            title={`Switch to ${bgTheme === 'light' ? 'Dark' : 'Light'} Mode`}
                        >
                            <span className={`absolute w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md transition-all duration-300 transform
                                ${bgTheme === 'light' ? 'translate-x-0' : 'translate-x-8'}`}
                            >
                                {bgTheme === 'light' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
                            </span>
                            <Sun className={`h-3.5 w-3.5 text-amber-500 ml-1.5 transition-opacity duration-200 ${bgTheme === 'light' ? 'opacity-100' : 'opacity-20'}`} />
                            <Moon className={`h-3.5 w-3.5 text-indigo-400 mr-1.5 transition-opacity duration-200 ${bgTheme === 'light' ? 'opacity-20' : 'opacity-100'}`} />
                        </button>

                        {/* Interactive Profile Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="flex items-center gap-2 p-1 bg-[#121b28]/60 hover:bg-[#121b28]/90 border border-white/[0.08] rounded-xl transition duration-150 cursor-pointer"
                                aria-expanded={profileDropdownOpen}
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-inner">
                                    Ad
                                </div>
                                <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Floating Dropdown Card */}
                            {profileDropdownOpen && (
                                <>
                                    {/* Click Away Backdrop */}
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setProfileDropdownOpen(false)}
                                    ></div>
                                    
                                    <div className="absolute right-0 mt-3 w-56 bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-2xl shadow-2xl p-4 z-20 animate-fade-in text-left relative overflow-hidden">
                                        <Screws />
                                        <div className="relative z-10">
                                            <div className="border-b border-white/[0.05] pb-3 mb-3">
                                                <span className="text-xs font-black text-white block uppercase font-title">Administrator</span>
                                                <span className="text-[9px] text-gray-500 font-mono block mt-0.5">admin@rentalsys.com</span>
                                            </div>
                                            <div className="space-y-1">
                                                <Link 
                                                    to="/messages" 
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-300 hover:bg-white/[0.04] hover:text-white transition font-medium"
                                                >
                                                    <Settings className="h-3.5 w-3.5 text-gray-400" /> System Config
                                                </Link>
                                                <Link 
                                                    to="/payments" 
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-300 hover:bg-white/[0.04] hover:text-white transition font-medium"
                                                >
                                                    <CreditCard className="h-3.5 w-3.5 text-gray-400" /> Revenue Reports
                                                </Link>
                                            </div>
                                            
                                            <div className="border-t border-white/[0.05] pt-3 mt-3">
                                                <button 
                                                    onClick={() => {
                                                        setProfileDropdownOpen(false);
                                                        setAuth(false);
                                                        toast.success('Logged out successfully!');
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 py-2 border border-red-500/30 bg-red-500/5 hover:bg-red-500/12 text-red-400 hover:text-red-300 rounded-xl font-bold text-xs uppercase tracking-wider transition duration-150 cursor-pointer"
                                                >
                                                    <LogOut className="h-3.5 w-3.5" /> Log Out
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* Sliding Mobile Glassmorphic Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-55 lg:hidden">
                    {/* Backdrop Overlay */}
                    <div 
                        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setMobileMenuOpen(false)}
                    ></div>

                    {/* Drawer panel */}
                    <aside className="fixed inset-y-0 left-0 w-[280px] bg-[#080f19]/98 border-r border-white/[0.08] shadow-2xl flex flex-col z-55 animate-slide-in relative overflow-hidden">
                        <div className="absolute top-4 right-4 z-20">
                            <button 
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl text-gray-300 hover:text-white transition cursor-pointer"
                                aria-label="Close menu"
                            >
                                <X className="h-4.5 w-4.5" />
                            </button>
                        </div>

                        {/* Brand Header */}
                        <div className="h-16 flex items-center px-6 border-b border-white/[0.05] gap-2.5">
                            <Car className="h-6 w-6 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] animate-pulse" />
                            <span className="text-xl font-black text-white tracking-wider font-title uppercase">
                                Rental<span className="text-blue-500">Sys</span>
                            </span>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
                            <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase px-3 mb-3">Navigation</div>
                            {allLinks.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={({ isActive }) => 
                                            `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                                            ${isActive 
                                                ? 'bg-blue-600/15 text-blue-400 border-l-3 border-blue-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                                                : 'hover:bg-white/[0.03] hover:text-gray-200 border-l-3 border-transparent'
                                            }`
                                        }
                                    >
                                        <Icon className="h-4.5 w-4.5" />
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                        </nav>

                        {/* Footer Profile badge */}
                        <div className="p-4 border-t border-white/[0.05] bg-[#060b12]/90 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm border border-white/[0.1] uppercase">
                                    Ad
                                </div>
                                <div className="flex flex-col truncate max-w-[150px]">
                                    <span className="text-xs font-bold text-white leading-tight">Admin</span>
                                    <span className="text-[9px] text-gray-500 truncate leading-none mt-0.5">admin@rentalsys.com</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
