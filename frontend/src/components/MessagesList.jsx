import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MailOpen, Send, Calendar, MessageSquare, Bell, Sparkles, Search, CheckCircle2, ShieldCheck, Mail, MapPin } from 'lucide-react';

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

const MessagesList = () => {
    const [messages, setMessages] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All Bookings');

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [messagesRes, bookingsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/messages'),
                axios.get('http://localhost:5000/api/bookings')
            ]);
            setMessages(messagesRes.data);
            setBookings(bookingsRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching messaging logs:', err);
            setLoading(false);
            toast.error("Failed to load alerts and logs.");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSendReminder = async (booking) => {
        if (booking.status !== 'Active') {
            toast.error('Reminders can only be sent for active bookings.');
            return;
        }

        const bookingDate = new Date(booking.startDate);
        if (isNaN(bookingDate.getTime())) {
            toast.error('Booking has an invalid start date.');
            return;
        }

        // Optimistically disable button and set to "Reminder Sent ✓" immediately
        setBookings(prevBookings =>
            prevBookings.map(b => b._id === booking._id ? { ...b, reminderSent: true } : b)
        );

        const loadToast = toast.loading('Sending email reminder...');

        try {
            await axios.post('http://localhost:5000/api/reminder', {
                bookingId: booking._id,
                customerEmail: booking.customerEmail,
                customerName: booking.customerName,
                vehicleName: booking.vehicleId?.name || 'Unknown Vehicle',
                bookingDate: booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
                pickup: booking.pickupLocation,
                drop: booking.dropLocation
            });
            toast.success('Reminder Email Sent Successfully! 📬', { id: loadToast });
            fetchData(true);
        } catch (err) {
            // Revert optimistic update on failure
            setBookings(prevBookings =>
                prevBookings.map(b => b._id === booking._id ? { ...b, reminderSent: false } : b)
            );
            const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
            toast.error(`Email delivery failed: ${errMsg}`, { id: loadToast });
        }
    };

    const filteredBookings = bookings.filter(b => {
        const name = b.customerName?.toLowerCase() || '';
        const email = b.customerEmail?.toLowerCase() || '';
        const vehicle = b.vehicleId?.name?.toLowerCase() || '';
        const term = searchTerm.toLowerCase();
        
        const matchesSearch = name.includes(term) || email.includes(term) || vehicle.includes(term);
        if (!matchesSearch) return false;

        const today = new Date();
        today.setHours(0,0,0,0);
        
        const start = new Date(b.startDate);
        start.setHours(0,0,0,0);
        
        const end = new Date(b.endDate);
        end.setHours(0,0,0,0);

        if (activeFilter === 'Upcoming') {
            return b.status === 'Active' && start > today;
        }
        if (activeFilter === 'Today') {
            return b.status === 'Active' && start.getTime() === today.getTime();
        }
        if (activeFilter === 'Completed') {
            return b.status === 'Completed' || end < today;
        }
        return true; // 'All Bookings'
    });

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse px-2">
                <div className="h-10 bg-slate-800/60 rounded-lg w-1/3"></div>
                <div className="h-96 bg-[#121b28]/60 border border-white/[0.05] rounded-[18px]"></div>
                <div className="h-96 bg-[#121b28]/60 border border-white/[0.05] rounded-[18px]"></div>
            </div>
        );
    }

    return (
        <div className="px-2 space-y-8 max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Bell className="h-8 w-8 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse" />
                    <h1 className="text-3xl font-black text-white tracking-wide font-title uppercase">Alerts & Messages</h1>
                </div>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-mono font-bold">
                    System Communications
                </span>
            </div>

            {/* Active Bookings Reminder Widget */}
            <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 sm:p-8 shadow-[0_15px_35px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-[15px]">
                <Screws />
                
                <div className="relative z-10">
                    <h2 className="text-lg font-bold text-white mb-2 tracking-wide font-title flex items-center gap-2">
                        <Bell className="h-4.5 w-4.5 text-blue-400" /> Active Bookings Alerts Manager
                    </h2>
                    <p className="text-xs text-gray-400 mb-6 font-medium">
                        Manually trigger real Email reminder notifications to customers for their upcoming rental trips.
                    </p>

                    {/* Filters and Search Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search by customer name, email, vehicle..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs transition bg-[#0d1420]/80 text-white placeholder-gray-550"
                            />
                        </div>
                        <div className="flex items-center gap-1 bg-[#0d1420]/80 border border-white/[0.05] p-1 rounded-xl self-start md:self-auto">
                            {['All Bookings', 'Upcoming', 'Today', 'Completed'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                                        activeFilter === filter
                                            ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-sm'
                                            : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Booking Cards Grid */}
                    <div className="grid grid-cols-1 gap-5">
                        {filteredBookings.length === 0 ? (
                            <div className="text-center text-gray-500 py-12 border border-dashed border-white/[0.08] rounded-xl text-xs font-medium">
                                No bookings match the selected search or filter options.
                            </div>
                        ) : (
                            filteredBookings.map(b => (
                                <div key={b._id} className="bg-white/[0.01] rounded-2xl border border-white/[0.05] overflow-hidden hover:border-white/[0.1] hover:bg-white/[0.02] transition duration-200 flex flex-col md:flex-row">
                                    {/* Vehicle Image */}
                                    <div className="w-full md:w-48 h-44 md:h-auto relative shrink-0 bg-[#0b111a] border-r border-white/[0.03]">
                                        <img 
                                            src={b.vehicleId?.imageUrl || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format'} 
                                            alt={b.vehicleId?.name} 
                                            className="w-full h-full object-cover"
                                        />
                                        <span className="absolute top-3 left-3 px-2 py-0.5 bg-[#0d1420]/80 backdrop-blur-md border border-white/[0.1] text-blue-400 text-[9px] font-black rounded uppercase tracking-wider">
                                            {b.vehicleId?.vehicleType}
                                        </span>
                                    </div>

                                    {/* Details */}
                                    <div className="p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start gap-2 flex-wrap pb-3 border-b border-white/[0.03]">
                                                <div>
                                                    <h4 className="font-black text-white text-base tracking-wide font-title uppercase">{b.customerName}</h4>
                                                    <p className="text-xs text-gray-500 font-mono mt-0.5">{b.customerEmail}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {/* Reminder Status */}
                                                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm ${
                                                        b.reminderSent 
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    }`}>
                                                        Reminder: {b.reminderSent ? 'Sent' : 'Pending'}
                                                    </span>
                                                    {/* Payment Status */}
                                                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm ${
                                                        b.paymentStatus === 'Completed'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                                                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.15)]'
                                                    }`}>
                                                        Payment: {b.paymentStatus || 'Pending'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs text-gray-300">
                                                <div>
                                                    <p className="text-gray-500 font-bold uppercase text-[9px] tracking-wider">Vehicle</p>
                                                    <p className="font-semibold text-slate-250 mt-0.5">{b.vehicleId?.name || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 font-bold uppercase text-[9px] tracking-wider">Booking Date</p>
                                                    <p className="font-semibold text-slate-250 mt-0.5">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 font-bold uppercase text-[9px] tracking-wider">Start Date</p>
                                                    <p className="font-semibold text-blue-400 mt-0.5 font-mono">{new Date(b.startDate).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 font-bold uppercase text-[9px] tracking-wider">End Date</p>
                                                    <p className="font-semibold text-blue-400 mt-0.5 font-mono">{new Date(b.endDate).toLocaleDateString()}</p>
                                                </div>
                                                <div className="col-span-2 sm:col-span-4 grid grid-cols-2 pt-2 gap-2">
                                                    <div>
                                                        <p className="text-gray-500 font-bold uppercase text-[9px] tracking-wider flex items-center gap-1"><MapPin className="h-3 w-3" /> Pickup Location</p>
                                                        <p className="font-medium text-slate-200 mt-0.5">{b.pickupLocation}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 font-bold uppercase text-[9px] tracking-wider flex items-center gap-1"><MapPin className="h-3 w-3" /> Drop Location</p>
                                                        <p className="font-medium text-slate-200 mt-0.5">{b.dropLocation}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mt-5 pt-3 border-t border-white/[0.03]">
                                            <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                                b.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                b.status === 'Completed' ? 'bg-gray-800 text-gray-400 border border-white/[0.05]' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                                Booking: {b.status}
                                            </span>
                                            <button
                                                onClick={() => handleSendReminder(b)}
                                                disabled={b.reminderSent || b.status !== 'Active'}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                                                    b.reminderSent 
                                                        ? 'bg-[#121b28] border border-white/[0.05] text-gray-500 cursor-not-allowed' 
                                                        : b.status !== 'Active'
                                                        ? 'bg-[#121b28] border border-white/[0.05] text-gray-500 cursor-not-allowed'
                                                        : 'bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 hover:shadow-[0_0_10px_rgba(59,130,246,0.2)] text-white shadow-sm font-bold'
                                                }`}
                                            >
                                                <Send className="h-3.5 w-3.5" />
                                                {b.reminderSent ? 'Reminder Sent ✓' : 'Remind'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Messages Sent History Log */}
            <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 sm:p-8 shadow-[0_15px_35px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-[15px]">
                <Screws />
                
                <div className="relative z-10">
                    <h2 className="text-lg font-bold text-white mb-6 tracking-wide font-title flex items-center gap-2">
                        <MessageSquare className="h-4.5 w-4.5 text-blue-400" /> Messaging & Notifications Log
                    </h2>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1.5 custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-500 py-10 border border-dashed border-white/[0.08] rounded-xl text-xs font-medium">
                                No notifications sent yet. Create a booking to automatically trigger confirmations.
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const formattedDate = new Date(msg.sentAt).toLocaleString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                }).replace(',', '');

                                return (
                                    <div key={msg._id} className="p-5 rounded-2xl border border-white/[0.05] bg-[#0d1420]/20 hover:bg-[#0d1420]/40 hover:border-white/[0.08] transition duration-200 flex items-start gap-4">
                                        <div className={`p-2.5 rounded-xl shrink-0 ${
                                            msg.messageType === 'Confirmation' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25'
                                        }`}>
                                            <MailOpen className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1.5 w-full">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-lg tracking-wider border ${
                                                    msg.messageType === 'Confirmation' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                }`}>
                                                    {msg.messageType} Message
                                                </span>
                                                <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/5 px-2.5 py-0.5 rounded-lg border border-emerald-500/10 flex items-center gap-1 shadow-sm">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                                    Email Delivered
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-300 whitespace-pre-line mt-2.5 leading-relaxed bg-[#0d1420]/50 border border-white/[0.03] p-3 rounded-xl shadow-inner font-sans">{msg.message}</p>
                                            <div className="flex flex-col gap-1.5 mt-3.5 pt-3 border-t border-white/[0.03] text-xs text-gray-400">
                                                <div><strong className="text-gray-500">Recipient:</strong> <span className="font-semibold text-slate-200">{msg.customerName}</span> ({msg.customerEmail})</div>
                                                <div className="flex gap-4 mt-1">
                                                    <span><strong className="text-gray-500">Status:</strong> <span className="text-emerald-400 font-semibold">Delivered</span></span>
                                                    <span><strong className="text-gray-500">Sent At:</strong> <span className="font-mono text-gray-400">{formattedDate}</span></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessagesList;
