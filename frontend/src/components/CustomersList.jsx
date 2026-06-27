import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
    User, Phone, FileText, MapPin, Calendar, CreditCard, 
    Edit, CheckCircle, XCircle, Search, Clock, ShieldCheck, Mail 
} from 'lucide-react';

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

const CustomersList = () => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Edit Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        phone: '',
        licenseNumber: '',
        address: ''
    });

    const fetchCustomers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/customers');
            setCustomers(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching customers:", err);
            setLoading(false);
            toast.error("Failed to load customers database.");
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSelectCustomer = async (cust) => {
        setSelectedCustomer(cust);
        setIsEditing(false);
        setEditForm({
            phone: cust.phone || '',
            licenseNumber: cust.licenseNumber || '',
            address: cust.address || ''
        });
        
        try {
            const res = await axios.get(`http://localhost:5000/api/customers/${cust._id}/trips`);
            setTrips(res.data);
        } catch (err) {
            console.error("Error fetching trips:", err);
            toast.error("Failed to load customer rental history.");
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading('Updating customer profile...');
        try {
            const res = await axios.put(`http://localhost:5000/api/customers/${selectedCustomer._id}`, editForm);
            setSelectedCustomer(res.data.customer);
            setIsEditing(false);
            toast.success("Profile updated successfully! ✅", { id: loadToast });
            fetchCustomers();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile.", { id: loadToast });
        }
    };

    const handleUpdateBookingStatus = async (bookingId, newStatus) => {
        // Custom confirmation toast
        toast((t) => (
            <div className="flex flex-col gap-2">
                <span className="font-semibold text-xs text-slate-300">
                    Are you sure you want to mark this booking as <span className={newStatus === 'Completed' ? 'text-green-400' : 'text-red-400'}>{newStatus}</span>?
                </span>
                <div className="flex justify-end gap-2 mt-1">
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            const actToast = toast.loading('Updating booking status...');
                            try {
                                await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/status`, { status: newStatus });
                                // Refresh trips
                                const res = await axios.get(`http://localhost:5000/api/customers/${selectedCustomer._id}/trips`);
                                setTrips(res.data);
                                toast.success(`Trip successfully marked as ${newStatus}!`, { id: actToast });
                            } catch (err) {
                                console.error(err);
                                toast.error("Failed to update booking status.", { id: actToast });
                            }
                        }}
                        className={`font-bold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider transition cursor-pointer text-white
                            ${newStatus === 'Completed' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'}`}
                    >
                        Confirm
                    </button>
                    <button 
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider transition cursor-pointer"
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

    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse px-2">
                <div className="h-10 bg-slate-800/60 rounded-lg w-1/3"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 h-96 bg-[#121b28]/60 border border-white/[0.05] rounded-[18px]"></div>
                    <div className="lg:col-span-2 h-96 bg-[#121b28]/60 border border-white/[0.05] rounded-[18px]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-2 space-y-8 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse" />
                    <h1 className="text-3xl font-black text-white tracking-wide font-title uppercase">Customers Directory</h1>
                </div>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-mono font-bold">
                    Client Database
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Customers Directory List (Left Column) */}
                <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-5 shadow-[0_15px_35px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-[15px] lg:col-span-4 flex flex-col h-[650px]">
                    <Screws />
                    
                    {/* Search Field */}
                    <div className="relative mb-5 z-10">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                        <input 
                            type="text"
                            placeholder="Search customer name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 w-full rounded-xl border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs bg-[#0d1420]/80 text-white placeholder-gray-550 transition duration-200"
                        />
                    </div>

                    {/* Selector List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1.5 relative z-10 custom-scrollbar">
                        {filteredCustomers.length === 0 ? (
                            <div className="text-center text-gray-550 py-12 text-xs font-medium">No customers found.</div>
                        ) : (
                            filteredCustomers.map(cust => (
                                <button
                                    key={cust._id}
                                    onClick={() => handleSelectCustomer(cust)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer
                                        ${selectedCustomer?._id === cust._id 
                                            ? 'bg-blue-600/15 border-blue-500 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                                            : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1] text-gray-400'
                                        }`}
                                >
                                    <span className="font-bold text-sm text-slate-100">{cust.name}</span>
                                    <span className="text-xs text-gray-500 truncate block w-full">{cust.email}</span>
                                    {cust.phone && (
                                        <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1.5 font-mono">
                                            <Phone className="h-3 w-3 text-blue-400" /> {cust.phone}
                                        </span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Details and History (Right Column) */}
                <div className="lg:col-span-8 space-y-6">
                    {selectedCustomer ? (
                        <>
                            {/* Profile Details Container */}
                            <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
                                <Screws />
                                
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold text-white tracking-wide font-title uppercase">{selectedCustomer.name}</h2>
                                            <ShieldCheck className="h-4 w-4 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-0.5"><Mail className="h-3 w-3" /> {selectedCustomer.email}</p>
                                    </div>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-4 py-2 bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600/20 hover:border-blue-500/50 text-blue-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer"
                                        >
                                            <Edit className="h-3.5 w-3.5" /> Edit Profile
                                        </button>
                                    )}
                                </div>

                                {isEditing ? (
                                    <form onSubmit={handleUpdateProfile} className="space-y-4 relative z-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                                                <input 
                                                    type="text"
                                                    value={editForm.phone}
                                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                    placeholder="e.g. +91 9876543210"
                                                    className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Driver's License #</label>
                                                <input 
                                                    type="text"
                                                    value={editForm.licenseNumber}
                                                    onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })}
                                                    placeholder="e.g. DL-XXXXXXXX"
                                                    className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Home Address</label>
                                            <textarea 
                                                value={editForm.address}
                                                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                                placeholder="Enter full address"
                                                rows="2"
                                                className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                            ></textarea>
                                        </div>
                                        <div className="flex gap-3">
                                            <button type="submit" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_10px_rgba(59,130,246,0.2)] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer">Save Changes</button>
                                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer">Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm relative z-10">
                                        <div className="bg-[#0d1420]/50 border border-white/[0.05] p-4 rounded-xl">
                                            <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phone</span>
                                            <span className="font-semibold text-slate-200 font-mono">{selectedCustomer.phone || 'Not provided'}</span>
                                        </div>
                                        <div className="bg-[#0d1420]/50 border border-white/[0.05] p-4 rounded-xl">
                                            <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">License Number</span>
                                            <span className="font-semibold text-slate-200 font-mono">{selectedCustomer.licenseNumber || 'Not provided'}</span>
                                        </div>
                                        <div className="bg-[#0d1420]/50 border border-white/[0.05] p-4 rounded-xl">
                                            <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Address</span>
                                            <span className="font-semibold text-slate-200 truncate block">{selectedCustomer.address || 'Not provided'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Trip History Container */}
                            <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
                                <Screws />
                                <h3 className="text-lg font-bold text-white mb-5 tracking-wide font-title flex items-center gap-2 relative z-10">
                                    <FileText className="h-4 w-4 text-blue-400" /> Trip History & Rental Records
                                </h3>

                                <div className="space-y-4 relative z-10 max-h-[350px] overflow-y-auto pr-1.5 custom-scrollbar">
                                    {trips.length === 0 ? (
                                        <div className="text-center text-gray-500 py-10 border border-dashed border-white/[0.08] rounded-xl text-xs font-medium">
                                            No rental history for this customer.
                                        </div>
                                    ) : (
                                        trips.map(trip => (
                                            <div key={trip._id} className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/[0.08] transition duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-bold text-white text-sm">{trip.vehicleId?.name || 'Deleted Vehicle'}</span>
                                                        <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-lg shadow-inner">
                                                            {trip.vehicleId?.licensePlate || 'N/A'}
                                                        </span>
                                                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm
                                                            ${trip.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]' :
                                                              trip.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]' :
                                                              'bg-red-500/10 text-red-400 border border-red-500/20'
                                                            }`}
                                                        >
                                                            {trip.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-400 flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 text-gray-500" />
                                                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1.5">
                                                        <MapPin className="h-3.5 w-3.5 text-gray-500" /> Pickup: {trip.pickupLocation} | Drop: {trip.dropLocation}
                                                    </div>
                                                    {trip.driverId && (
                                                        <div className="text-xs text-gray-400 flex items-center gap-1.5">
                                                            <span>👤</span> Assigned Driver: <span className="font-semibold text-gray-300">{trip.driverId.name}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 self-stretch md:self-auto justify-between md:justify-end border-t border-white/[0.03] md:border-none pt-3 md:pt-0">
                                                    <div className="text-left md:text-right">
                                                        <span className="text-[9px] text-gray-550 font-bold block uppercase tracking-wider">Billed</span>
                                                        <span className="font-extrabold text-white flex items-center text-sm mt-0.5">₹{trip.price}</span>
                                                    </div>

                                                    {trip.status === 'Active' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleUpdateBookingStatus(trip._id, 'Completed')}
                                                                className="p-2 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-xl transition duration-150 active:scale-95 cursor-pointer"
                                                                title="Complete Trip"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateBookingStatus(trip._id, 'Cancelled')}
                                                                className="p-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl transition duration-150 active:scale-95 cursor-pointer"
                                                                title="Cancel Booking"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-8 text-center py-24 text-gray-400">
                            <Screws />
                            <Clock className="h-12 w-12 mx-auto text-gray-600 mb-4 animate-pulse" />
                            <p className="text-sm font-medium text-gray-500">Select a customer from the directory to view profile details and rental history.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomersList;
