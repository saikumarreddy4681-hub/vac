import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
    BookOpen, Calendar, User, Clock, CheckCircle, 
    XCircle, ShieldAlert, FileText, Trash2, Search, Filter 
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

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchBookings = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/bookings');
            setBookings(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
            toast.error('Failed to retrieve bookings ledger.');
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleUpdateStatus = async (bookingId, newStatus) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <span className="font-semibold text-xs text-slate-300">
                    Update status of booking <span className="text-blue-400 font-mono">#{String(bookingId).substring(0, 8)}</span> to <span className={newStatus === 'Completed' ? 'text-green-400 font-bold' : 'text-red-450 font-bold'}>{newStatus}</span>?
                </span>
                <div className="flex justify-end gap-2 mt-1">
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            const actToast = toast.loading('Synchronizing state...');
                            try {
                                await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/status`, { status: newStatus });
                                toast.success(`Booking status set to ${newStatus}!`, { id: actToast });
                                fetchBookings();
                            } catch (err) {
                                console.error(err);
                                toast.error('Failed to update booking status.', { id: actToast });
                            }
                        }}
                        className={`font-bold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider transition cursor-pointer text-white
                            ${newStatus === 'Completed' ? 'bg-emerald-600 hover:bg-emerald-505' : 'bg-red-600 hover:bg-red-505'}`}
                    >
                        Confirm
                    </button>
                    <button 
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-slate-850 hover:bg-slate-800 text-gray-300 font-bold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider transition cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), {
            duration: 6000,
            style: {
                background: '#121b28',
                border: `1px solid ${newStatus === 'Completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                padding: '12px'
            }
        });
    };

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = 
            (b.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.customerEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.vehicleId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(b._id).toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'All' || b.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse px-2">
                <div className="h-10 bg-slate-800/60 rounded-lg w-1/4"></div>
                <div className="h-[450px] bg-[#121b28]/60 border border-white/[0.05] rounded-[18px]"></div>
            </div>
        );
    }

    return (
        <div className="px-2 space-y-8 pb-12">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-wide font-title uppercase">Booking Management</h1>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-1">Audit customer bookings, trip records, & change rental statuses</p>
                </div>
                <span className="px-3.5 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider">
                    Total: {bookings.length} Bookings
                </span>
            </div>

            {/* Controls panel */}
            <div className="relative overflow-hidden bg-[#142030] border border-white/[0.08] rounded-[18px] p-4 shadow-md backdrop-blur-[15px] flex flex-col md:flex-row gap-4 justify-between items-center">
                <Screws />
                
                {/* Search */}
                <div className="relative w-full md:w-96 z-10">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <input 
                        type="text"
                        placeholder="Search Booking ID, Customer, Vehicle..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs bg-[#0d1420]/80 text-white placeholder-gray-550 transition duration-200"
                    />
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 w-full md:w-auto z-10">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-xs font-bold text-gray-455 uppercase tracking-wider mr-1">Filter status:</span>
                    <div className="flex gap-1 bg-[#090e15]/60 border border-white/[0.04] p-1 rounded-xl">
                        {['All', 'Active', 'Completed', 'Cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer
                                    ${statusFilter === status 
                                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                                        : 'bg-transparent text-gray-500 hover:text-gray-200'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table panel */}
            <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.55)] backdrop-blur-[15px]">
                <Screws />
                <div className="overflow-x-auto relative z-10">
                    <table className="min-w-full divide-y divide-white/[0.05]">
                        <thead>
                            <tr className="border-b border-white/[0.05]">
                                <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-transparent">Booking ID</th>
                                <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-transparent">Customer</th>
                                <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-transparent">Vehicle</th>
                                <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-transparent">Duration</th>
                                <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-transparent">Billing & Payment</th>
                                <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-transparent">Status</th>
                                <th className="px-4 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-transparent">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 font-medium bg-transparent">
                                        No bookings match the criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((b) => (
                                    <tr key={b._id} className="hover:bg-white/[0.015] transition-colors duration-150">
                                        {/* Booking ID */}
                                        <td className="px-4 py-4 whitespace-nowrap text-xs font-mono font-bold text-blue-400">
                                            #{String(b._id).substring(0, 8)}...
                                        </td>
                                        
                                        {/* Customer Details */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs uppercase">
                                                    {b.customerName ? b.customerName.charAt(0) : <User className="h-3.5 w-3.5" />}
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-white block">{b.customerName}</span>
                                                    <span className="text-[9px] text-gray-500 font-mono block">{b.customerEmail}</span>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {/* Vehicle Details */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-xs font-bold text-white block">
                                                {b.vehicleId ? b.vehicleId.name : 'Deleted Vehicle'}
                                            </span>
                                            {b.vehicleId && (
                                                <span className="text-[9px] text-gray-500 font-mono tracking-wider block uppercase">
                                                    {b.vehicleId.licensePlate}
                                                </span>
                                            )}
                                        </td>
                                        
                                        {/* Duration */}
                                        <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-300 font-mono">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-gray-500" />
                                                <span>
                                                    {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <span className="text-[9px] text-gray-550 font-bold block mt-0.5">
                                                {b.pickupLocation} → {b.dropLocation}
                                            </span>
                                        </td>
                                        
                                        {/* Billing & Payment */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-xs font-black text-white font-mono block">
                                                ₹{b.price ? b.price.toLocaleString() : '0'}
                                            </span>
                                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-450 border border-emerald-500/25 rounded-md text-[8px] font-mono font-bold uppercase tracking-wider block w-fit mt-1">
                                                PAID • UPI
                                            </span>
                                        </td>
                                        
                                        {/* Status */}
                                        <td className="px-4 py-4 whitespace-nowrap text-xs">
                                            <span className={`px-2.5 py-0.5 inline-flex text-[9px] font-black rounded-full border uppercase tracking-wider
                                                ${b.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.15)]' : 
                                                  b.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]' : 
                                                  'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        
                                        {/* Actions */}
                                        <td className="px-4 py-4 whitespace-nowrap text-right text-xs">
                                            {b.status === 'Active' ? (
                                                <div className="flex gap-1.5 justify-end">
                                                    <button
                                                        onClick={() => handleUpdateStatus(b._id, 'Completed')}
                                                        className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/25 text-emerald-400 rounded-lg transition duration-150 active:scale-95 cursor-pointer"
                                                        title="Complete Trip"
                                                    >
                                                        <CheckCircle className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(b._id, 'Cancelled')}
                                                        className="p-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/25 text-red-450 rounded-lg transition duration-150 active:scale-95 cursor-pointer"
                                                        title="Cancel Booking"
                                                    >
                                                        <XCircle className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-gray-500 font-mono uppercase">LOCKED</span>
                                            )}
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

export default AdminBookings;
