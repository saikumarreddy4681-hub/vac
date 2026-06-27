import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
    Car, Bus, Wrench, CalendarCheck, CheckCircle, Calendar, 
    TrendingUp, DollarSign, Award, Clock, ArrowRight, User, ShieldAlert 
} from 'lucide-react';
import StatCard from './StatCard';

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

const Dashboard = () => {
    const [summary, setSummary] = useState({
        cars: 0,
        buses: 0,
        available: 0,
        booked: 0,
        maintenance: 0
    });
    const [loading, setLoading] = useState(true);
    const [vehiclesList, setVehiclesList] = useState([]);
    const [bookingsList, setBookingsList] = useState([]);

    const fetchDashboardData = async (showToast = false) => {
        try {
            const [summaryRes, vehiclesRes, bookingsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/status/summary`),
                axios.get(`${import.meta.env.VITE_API_URL}/vehicles`),
                axios.get(`${import.meta.env.VITE_API_URL}/bookings`)
            ]);
            setSummary(summaryRes.data);
            setVehiclesList(vehiclesRes.data);
            setBookingsList(bookingsRes.data);
            setLoading(false);
            if (showToast) {
                toast.success('Dashboard telemetry reloaded!');
            }
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
            setLoading(false);
            toast.error('Failed to sync dashboard telemetry with the server.');
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Calculate metrics
    const totalVehicles = vehiclesList.length || 1;
    const totalBookings = bookingsList.length;
    const totalRevenue = bookingsList
        .filter(b => b.status !== 'Cancelled')
        .reduce((sum, b) => sum + (b.price || 0), 0);

    const activeBookingsCount = bookingsList.filter(b => b.status === 'Active').length;
    const completedBookingsCount = bookingsList.filter(b => b.status === 'Completed').length;
    const completionRate = totalBookings > 0 ? Math.round((completedBookingsCount / totalBookings) * 100) : 100;

    // Concentric Ring Radii & Circumferences for Telemetry Chart
    const ringConfig = [
        { label: 'Available', value: summary.available, color: '#10b981', radius: 45, max: totalVehicles },
        { label: 'Booked', value: summary.booked, color: '#f43f5e', radius: 32, max: totalVehicles },
        { label: 'Maintenance', value: summary.maintenance, color: '#f59e0b', radius: 19, max: totalVehicles }
    ];

    // Get 5 most recent bookings
    const recentBookings = [...bookingsList]
        .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
        .slice(0, 5);

    // Loading Skeletons for Steel Theme
    if (loading) {
        return (
            <div className="space-y-8 animate-pulse px-2">
                <div className="h-10 bg-slate-800/60 rounded-lg w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5].map(n => (
                        <div key={n} className="h-28 bg-[#121b28]/60 border border-white/[0.05] rounded-[18px]"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 h-[340px] bg-[#121b28]/60 border border-white/[0.05] rounded-[18px]"></div>
                    <div className="lg:col-span-4 h-[340px] bg-[#121b28]/60 border border-white/[0.05] rounded-[18px]"></div>
                </div>
                <div className="h-36 bg-[#121b28]/60 border border-white/[0.05] rounded-[18px]"></div>
                <div className="h-96 bg-[#121b28]/60 border border-white/[0.05] rounded-[18px]"></div>
            </div>
        );
    }

    return (
        <div className="px-2 space-y-8 pb-12">
            {/* Dashboard Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-wide font-title uppercase">Telemetry Dashboard</h1>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-1">Fleet Operations Command</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => fetchDashboardData(true)}
                        className="p-2.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl text-gray-400 hover:text-white transition cursor-pointer"
                        title="Sync Telemetry"
                    >
                        <Clock className="h-4 w-4" />
                    </button>
                    <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        MySQL & MongoDB Online
                    </span>
                </div>
            </div>
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard 
                    title="Cars" 
                    value={summary.cars} 
                    icon={<Car className="h-6 w-6" />} 
                    glowColor="blue" 
                />
                <StatCard 
                    title="Buses" 
                    value={summary.buses} 
                    icon={<Bus className="h-6 w-6" />} 
                    glowColor="purple" 
                />
                <StatCard 
                    title="Available" 
                    value={summary.available} 
                    icon={<CheckCircle className="h-6 w-6" />} 
                    glowColor="green" 
                />
                <StatCard 
                    title="Booked" 
                    value={summary.booked} 
                    icon={<CalendarCheck className="h-6 w-6" />} 
                    glowColor="red" 
                />
                <StatCard 
                    title="Maintenance" 
                    value={summary.maintenance} 
                    icon={<Wrench className="h-6 w-6" />} 
                    glowColor="yellow" 
                />
            </div>

            {/* Advanced Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Analytics Panel 1: Bookings & Revenue (8 Cols) */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Revenue Performance Card */}
                    <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.55)] backdrop-blur-[15px] flex flex-col justify-between h-[320px]">
                        <Screws />
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black text-gray-450 uppercase tracking-widest font-mono">Gross Fleet Earnings</span>
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[9px] font-bold uppercase flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" /> Live
                                </span>
                            </div>
                            <h3 className="text-3xl font-black text-white font-mono tracking-tight flex items-center">
                                <span className="text-blue-500 text-2xl mr-1 font-sans">₹</span>
                                {totalRevenue.toLocaleString()}
                            </h3>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1.5">Net billing across active rentals</p>
                        </div>

                        {/* Interactive Vector Sparkline */}
                        <div className="w-full h-24 relative overflow-hidden my-3">
                            <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="revenue-glow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>
                                <path 
                                    d="M 0 80 Q 50 20 100 60 T 200 40 T 300 10 L 300 100 L 0 100 Z" 
                                    fill="url(#revenue-glow)" 
                                />
                                <path 
                                    d="M 0 80 Q 50 20 100 60 T 200 40 T 300 10" 
                                    fill="none" 
                                    stroke="#3b82f6" 
                                    strokeWidth="3" 
                                    strokeLinecap="round"
                                />
                                <circle cx="300" cy="10" r="4" fill="#3b82f6" className="animate-ping" />
                                <circle cx="300" cy="10" r="3.5" fill="#ffffff" />
                            </svg>
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-500 relative z-10 pt-2 border-t border-white/[0.03]">
                            <span>Q2 Target: ₹1,000,000</span>
                            <span className="text-blue-400 font-mono">{Math.round((totalRevenue / 1000000) * 100)}% Achieved</span>
                        </div>
                    </div>

                    {/* Bookings Volumetrics Card */}
                    <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.55)] backdrop-blur-[15px] flex flex-col justify-between h-[320px]">
                        <Screws />
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black text-gray-450 uppercase tracking-widest font-mono">Bookings Volumetrics</span>
                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-[9px] font-bold uppercase">Activity logs</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-4xl font-black text-white font-mono tracking-tight">{totalBookings}</h3>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Total Orders</span>
                            </div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">Inclusive of active, completed & cancelled</p>
                        </div>

                        {/* Booking Statistics Breakdown */}
                        <div className="space-y-4 my-4 relative z-10">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-400 font-bold uppercase tracking-wide">Completion Rate</span>
                                    <span className="text-emerald-400 font-bold font-mono">{completionRate}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/[0.03]">
                                    <div 
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-500" 
                                        style={{ width: `${completionRate}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-[#0b111a]/50 border border-white/[0.04] p-2.5 rounded-xl">
                                    <span className="text-[9px] text-gray-500 block uppercase tracking-wider font-bold">Active Trips</span>
                                    <span className="text-sm font-extrabold text-blue-400 font-mono">{activeBookingsCount}</span>
                                </div>
                                <div className="bg-[#0b111a]/50 border border-white/[0.04] p-2.5 rounded-xl">
                                    <span className="text-[9px] text-gray-550 block uppercase tracking-wider font-bold">Completed Trips</span>
                                    <span className="text-sm font-extrabold text-emerald-400 font-mono">{completedBookingsCount}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-500 relative z-10 pt-2 border-t border-white/[0.03]">
                            <span>Active Scheduler Node</span>
                            <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Secure</span>
                        </div>
                    </div>
                </div>

                {/* Analytics Panel 2: SVG Telemetry Radar (4 Cols) */}
                <div className="lg:col-span-4 relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.55)] backdrop-blur-[15px] h-[320px] flex flex-col justify-between">
                    <Screws />
                    <div className="relative z-10">
                        <h3 className="text-xs font-black text-white tracking-widest uppercase font-title mb-1">Fleet Telemetry</h3>
                        <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider block mb-4">Live status distribution</span>
                    </div>

                    <div className="flex items-center justify-between my-2 relative z-10">
                        {/* High-Tech SVG Concentric Rings */}
                        <div className="w-32 h-32 relative flex items-center justify-center shrink-0">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="4" />
                                <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="4" />
                                <circle cx="50" cy="50" r="19" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="4" />
                                
                                {ringConfig.map((ring, idx) => {
                                    const circumference = 2 * Math.PI * ring.radius;
                                    const percentage = ring.max > 0 ? (ring.value / ring.max) : 0;
                                    const strokeDashoffset = circumference - percentage * circumference;
                                    return (
                                        <circle 
                                            key={idx}
                                            cx="50" 
                                            cy="50" 
                                            r={ring.radius} 
                                            fill="none" 
                                            stroke={ring.color} 
                                            strokeWidth="4.5" 
                                            strokeDasharray={circumference}
                                            strokeDashoffset={strokeDashoffset}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 ease-out"
                                            style={{
                                                filter: `drop-shadow(0 0 3px ${ring.color}cc)`
                                            }}
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center text-center">
                                <span className="text-xl font-black text-white font-mono leading-none">{vehiclesList.length}</span>
                                <span className="text-[7px] text-gray-500 uppercase tracking-widest font-black mt-1">Vehicles</span>
                            </div>
                        </div>

                        {/* Telemetry Legend breakdown */}
                        <div className="flex-1 pl-4 space-y-2.5">
                            {ringConfig.map((ring, idx) => {
                                const percentage = vehiclesList.length > 0 ? Math.round((ring.value / vehiclesList.length) * 100) : 0;
                                return (
                                    <div key={idx} className="flex flex-col">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                                            <span className="flex items-center gap-1.5 text-gray-400">
                                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ring.color }}></span>
                                                {ring.label}
                                            </span>
                                            <span className="text-slate-200 font-mono font-extrabold">{ring.value} ({percentage}%)</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="text-[10px] text-center text-gray-500 uppercase font-black tracking-widest relative z-10 pt-2 border-t border-white/[0.03]">
                        Utilization: {Math.round((summary.booked / totalVehicles) * 100)}% of total fleet
                    </div>
                </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-[15px]">
                <Screws />
                <h2 className="text-xl font-bold text-white mb-6 tracking-wide font-title uppercase">Quick Actions</h2>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 relative z-10">
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <Link 
                            to="/calendar" 
                            className="inline-flex items-center justify-center h-12 px-6 bg-gradient-to-b from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-500 hover:to-blue-600 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] active:scale-[0.98] transition-all duration-200 font-semibold text-sm w-full sm:w-auto text-center gap-2"
                        >
                            <Calendar className="h-4 w-4" /> View Calendar
                        </Link>
                        <Link 
                            to="/maintenance" 
                            className="inline-flex items-center justify-center h-12 px-6 bg-gradient-to-b from-slate-850 to-slate-900 text-white border border-slate-700/50 rounded-lg hover:from-slate-750 hover:to-slate-800 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] active:scale-[0.98] transition-all duration-200 font-semibold text-sm w-full sm:w-auto text-center gap-2"
                        >
                            <Wrench className="h-4 w-4" /> Manage Maintenance
                        </Link>
                    </div>
                    <div className="w-full md:w-auto">
                        <button 
                            onClick={async () => {
                                const loadingToast = toast.loading('Populating database with vehicles...');
                                try {
                                    const res = await axios.post(`${import.meta.env.VITE_API_URL}/vehicles/seed`);
                                    toast.success(res.data.message || 'Database successfully seeded!', { id: loadingToast });
                                    fetchDashboardData();
                                } catch (err) {
                                    console.error(err);
                                    toast.error('Failed to seed vehicles. Make sure MySQL and the backend are running.', { id: loadingToast });
                                }
                            }}
                            className="inline-flex items-center justify-center h-12 px-6 bg-gradient-to-b from-green-600 to-green-700 text-white rounded-lg hover:from-green-500 hover:to-green-600 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] active:scale-[0.98] transition-all duration-200 font-semibold text-sm w-full md:w-auto text-center cursor-pointer gap-2"
                        >
                            <Car className="h-4 w-4" /> Load Default Vehicles 🚀
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Activity Ledger (Bookings Table) */}
            <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.55)] backdrop-blur-[15px]">
                <Screws />
                <h2 className="text-xl font-bold text-white mb-6 tracking-wide font-title uppercase">Recent Activity Ledger</h2>
                <div className="overflow-x-auto relative z-10">
                    <table className="min-w-full divide-y divide-white/[0.05]">
                        <thead>
                            <tr className="border-b border-white/[0.05]">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-transparent">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-transparent">Vehicle</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-transparent">Duration</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-transparent">Price</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-transparent">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {recentBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-400 font-medium">
                                        No recent bookings recorded. Open the Booking Workspace to make a booking.
                                    </td>
                                </tr>
                            ) : (
                                recentBookings.map((b) => (
                                    <tr key={b._id || b.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs uppercase">
                                                    {b.customerName ? b.customerName.charAt(0) : <User className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-bold text-white block">{b.customerName}</span>
                                                    <span className="text-[9px] text-gray-500 font-mono tracking-wider block">{b.customerEmail}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                                            {b.vehicleId ? b.vehicleId.name : 'Unassigned'}
                                            {b.vehicleId && (
                                                <span className="text-[9px] text-gray-500 font-mono tracking-wider block uppercase">{b.vehicleId.licensePlate}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono font-medium">
                                            {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-blue-400 font-mono">
                                            ₹{b.price ? b.price.toLocaleString() : '0'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border
                                                ${b.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.15)]' : 
                                                b.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]' : 
                                                'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]'}`}>
                                                {b.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Full Fleet Table Panel */}
            <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.55)] backdrop-blur-[15px]">
                <Screws />
                <h2 className="text-xl font-bold text-white mb-6 tracking-wide font-title uppercase">Our Fleet</h2>
                <div className="overflow-x-auto relative z-10">
                    <table className="min-w-full divide-y divide-white/[0.05]">
                        <thead>
                            <tr className="border-b border-white/[0.05]">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-transparent">Image</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-transparent">Vehicle</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-transparent">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-transparent">License Plate</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-transparent">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {vehiclesList.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-400 font-medium">
                                        No vehicles in fleet. Click "Load Default Vehicles" to seed data.
                                    </td>
                                </tr>
                            ) : (
                                vehiclesList.map((v) => (
                                    <tr key={v.id || v._id} className="hover:bg-white/[0.02] transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {v.imageUrl ? (
                                                <img 
                                                    src={v.imageUrl} 
                                                    alt={v.name} 
                                                    className="h-10 w-16 object-cover rounded-md border border-white/[0.08] shadow-md" 
                                                />
                                            ) : (
                                                <div className="h-10 w-16 bg-slate-800/80 rounded-md border border-white/[0.05] flex items-center justify-center text-[10px] text-gray-500 font-mono">
                                                    NO IMAGE
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">{v.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">{v.vehicleType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono font-medium">{v.licensePlate}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border
                                                ${v.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]' : 
                                                v.status === 'Booked' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(239,68,68,0.15)]' : 
                                                'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]'}`}>
                                                {v.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
