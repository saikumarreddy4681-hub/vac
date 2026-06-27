import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
    Mail, User, MessageSquare, History, Check, Plus, 
    AlertCircle, RefreshCw, Sparkles, Send, Clock, Play 
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

const EnquiriesList = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);

    // New Enquiry Form State
    const [newEnquiry, setNewEnquiry] = useState({
        customerName: '',
        customerEmail: '',
        message: ''
    });

    // Follow-up notes State
    const [followUpNotes, setFollowUpNotes] = useState('');

    const fetchEnquiries = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/enquiries');
            setEnquiries(res.data);
            setLoading(false);
            
            // Sync selected enquiry details if open
            if (selectedEnquiry) {
                const updatedSelected = res.data.find(e => e._id === selectedEnquiry._id);
                if (updatedSelected) setSelectedEnquiry(updatedSelected);
            }
        } catch (err) {
            console.error("Error fetching enquiries:", err);
            setLoading(false);
            toast.error("Failed to load enquiries.");
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const handleCreateEnquiry = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading('Submitting new enquiry...');
        try {
            await axios.post('http://localhost:5000/api/enquiries', newEnquiry);
            toast.success("Enquiry submitted successfully! 🚀", { id: loadToast });
            setNewEnquiry({ customerName: '', customerEmail: '', message: '' });
            fetchEnquiries(true);
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit enquiry. Make sure backend is active.", { id: loadToast });
        }
    };

    const handleUpdateStatus = async (enquiryId, newStatus) => {
        const loadToast = toast.loading(`Marking enquiry as ${newStatus}...`);
        try {
            await axios.patch(`http://localhost:5000/api/enquiries/${enquiryId}/status`, { status: newStatus });
            toast.success(`Enquiry successfully marked as ${newStatus}!`, { id: loadToast });
            fetchEnquiries(true);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update enquiry status.", { id: loadToast });
        }
    };

    const handleAddFollowUp = async (e) => {
        e.preventDefault();
        if (!followUpNotes.trim()) return;
        const loadToast = toast.loading('Logging CRM follow-up note...');

        try {
            await axios.post(`http://localhost:5000/api/enquiries/${selectedEnquiry._id}/follow-up`, {
                notes: followUpNotes
            });
            setFollowUpNotes('');
            toast.success("Follow-up note logged successfully! 📝", { id: loadToast });
            fetchEnquiries(true);
        } catch (err) {
            console.error(err);
            toast.error("Failed to log follow-up note.", { id: loadToast });
        }
    };

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
                    <Mail className="h-8 w-8 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse" />
                    <h1 className="text-3xl font-black text-white tracking-wide font-title uppercase">Customer Enquiries</h1>
                </div>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-mono font-bold">
                    CRM & Leads
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Submit New Enquiry Form (Left Column) */}
                <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-[15px] lg:col-span-4 h-fit">
                    <Screws />
                    <h2 className="text-lg font-bold text-white mb-6 tracking-wide font-title flex items-center gap-2 relative z-10">
                        <Plus className="h-4.5 w-4.5 text-blue-400" /> Submit New Enquiry
                    </h2>
                    
                    <form onSubmit={handleCreateEnquiry} className="space-y-5 relative z-10">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Name</label>
                            <input 
                                type="text"
                                required
                                value={newEnquiry.customerName}
                                onChange={(e) => setNewEnquiry({ ...newEnquiry, customerName: e.target.value })}
                                placeholder="Enter name"
                                className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Email</label>
                            <input 
                                type="email"
                                required
                                value={newEnquiry.customerEmail}
                                onChange={(e) => setNewEnquiry({ ...newEnquiry, customerEmail: e.target.value })}
                                placeholder="Enter email"
                                className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message / Requirements</label>
                            <textarea 
                                required
                                value={newEnquiry.message}
                                onChange={(e) => setNewEnquiry({ ...newEnquiry, message: e.target.value })}
                                placeholder="What vehicle type/model is the customer interested in?"
                                rows="4"
                                className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                            ></textarea>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="w-full bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] text-white font-black py-3 px-4 rounded-xl transition duration-200 active:scale-[0.98] uppercase tracking-wider text-xs cursor-pointer"
                        >
                            Submit Enquiry
                        </button>
                    </form>
                </div>

                {/* Enquiries Queue & Details (Right Column) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Active Queue Card */}
                    <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
                        <Screws />
                        
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="text-lg font-bold text-white tracking-wide font-title flex items-center gap-2">
                                <Clock className="h-4.5 w-4.5 text-blue-400" /> Active Enquiries Queue
                            </h3>
                            <button 
                                onClick={() => { fetchEnquiries(true); toast.success('Queue refreshed!', { duration: 1000 }); }} 
                                className="p-2 bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] text-gray-400 hover:text-white rounded-xl transition cursor-pointer"
                                title="Refresh Queue"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </button>
                        </div>

                        {enquiries.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 border border-dashed border-white/[0.08] rounded-xl text-xs font-medium relative z-10">
                                No active enquiries in queue.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                {enquiries.map(enq => (
                                    <div 
                                        key={enq._id} 
                                        onClick={() => setSelectedEnquiry(enq)}
                                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between hover:bg-white/[0.02]
                                            ${selectedEnquiry?._id === enq._id 
                                                ? 'bg-blue-600/15 border-blue-500 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                                                : 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1]'
                                            }`}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-sm text-slate-100 block truncate max-w-[150px]">{enq.customerName}</span>
                                                <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm
                                                    ${enq.status === 'Open' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                      enq.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                    }`}
                                                >
                                                    {enq.status}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500 block mb-3 font-mono">{enq.customerEmail}</span>
                                            <p className="text-xs text-gray-400 line-clamp-3 bg-[#0d1420]/40 border border-white/[0.03] p-2.5 rounded-lg leading-relaxed">{enq.message}</p>
                                        </div>

                                        <div className="mt-4 flex justify-between items-center text-[10px] text-gray-500 border-t border-white/[0.04] pt-2.5">
                                            <span>Logged: {new Date(enq.createdAt).toLocaleDateString()}</span>
                                            <span className="font-bold text-blue-400 bg-blue-500/5 px-2 py-0.5 border border-blue-500/10 rounded-lg">{enq.followUps?.length || 0} Follow-ups</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Detailed Enquiry Viewer & Follow-up Timeline */}
                    {selectedEnquiry && (
                        <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 shadow-[0_15px_30px_rgba(0,0,0,0.5)] space-y-6">
                            <Screws />
                            
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.05] pb-5 relative z-10">
                                <div>
                                    <h4 className="text-base font-bold text-white tracking-wide font-title uppercase">Enquiry Details: {selectedEnquiry.customerName}</h4>
                                    <span className="text-xs text-gray-400 font-mono mt-0.5 block">{selectedEnquiry.customerEmail}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button 
                                        onClick={() => handleUpdateStatus(selectedEnquiry._id, 'Resolved')}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 text-xs font-bold rounded-lg transition-all duration-150 active:scale-95 cursor-pointer"
                                    >
                                        <Check className="h-3.5 w-3.5" /> Resolve
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateStatus(selectedEnquiry._id, 'Follow-up')}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 hover:border-yellow-500/40 text-yellow-400 text-xs font-bold rounded-lg transition-all duration-150 active:scale-95 cursor-pointer"
                                    >
                                        <AlertCircle className="h-3.5 w-3.5" /> Follow-up
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateStatus(selectedEnquiry._id, 'Open')}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 text-blue-400 text-xs font-bold rounded-lg transition-all duration-150 active:scale-95 cursor-pointer"
                                    >
                                        Re-Open
                                    </button>
                                </div>
                            </div>

                            {/* Log CRM follow-up */}
                            <div className="relative z-10">
                                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                    <MessageSquare className="h-4 w-4 text-blue-400" /> Log CRM Follow-up Note
                                </h5>
                                <form onSubmit={handleAddFollowUp} className="flex gap-2">
                                    <input 
                                        type="text"
                                        required
                                        value={followUpNotes}
                                        onChange={(e) => setFollowUpNotes(e.target.value)}
                                        placeholder="Type follow-up details (e.g. 'Called customer, shared quotation')"
                                        className="flex-1 bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                    />
                                    <button 
                                        type="submit" 
                                        className="px-5 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 hover:shadow-[0_0_10px_rgba(59,130,246,0.2)] text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                        <span>Log Note</span>
                                    </button>
                                </form>
                            </div>

                            {/* Neon Timeline Log */}
                            <div className="relative z-10">
                                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                    <History className="h-4 w-4 text-blue-400" /> Follow-up Log Timeline
                                </h5>

                                <div className="space-y-4">
                                    {!selectedEnquiry.followUps || selectedEnquiry.followUps.length === 0 ? (
                                        <div className="text-xs text-gray-500 py-6 border border-dashed border-white/[0.08] rounded-xl text-center font-medium">
                                            No follow-ups recorded yet. Status is currently Open.
                                        </div>
                                    ) : (
                                        <div className="relative border-l-2 border-white/[0.06] pl-5 space-y-5 ml-2.5">
                                            {selectedEnquiry.followUps.map((fu, idx) => (
                                                <div key={fu._id} className="relative">
                                                    {/* Glowing timeline node */}
                                                    <span className="absolute -left-[27px] top-1.5 bg-gradient-to-tr from-blue-600 to-indigo-600 h-3.5 w-3.5 rounded-full border-2 border-[#0d1621] shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-mono font-bold text-gray-500 block leading-none">
                                                            {new Date(fu.createdAt).toLocaleString()}
                                                        </span>
                                                        <p className="bg-[#0d1420]/40 border border-white/[0.04] p-3 rounded-xl text-xs text-gray-300 leading-relaxed max-w-2xl shadow-inner">
                                                            {fu.notes}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EnquiriesList;
