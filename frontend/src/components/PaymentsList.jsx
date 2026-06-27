import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    DollarSign, ShieldAlert, CheckCircle, CreditCard, Search, 
    TrendingUp, Clock, FileText, X, Printer, Download, Filter, 
    ArrowUpDown, Calendar, User, Car, Hash, Coins, Sparkles
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

const PaymentsList = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search, Filter, Sort State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortBy, setSortBy] = useState('date-desc');

    // Modal State
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [payingInvoice, setPayingInvoice] = useState(null);

    // Form state for recording payment
    const [paymentForm, setPaymentForm] = useState({
        paymentMethod: 'Credit Card',
        transactionId: '',
        notes: '',
        status: 'Completed'
    });

    const fetchPayments = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/payments`);
            setPayments(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching payments:', err);
            setLoading(false);
            toast.error("Failed to load payments ledger.");
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleOpenPayModal = (pay) => {
        setPayingInvoice(pay);
        setPaymentForm({
            paymentMethod: 'Credit Card',
            transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
            notes: '',
            status: 'Completed'
        });
    };

    const handleProcessPayment = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading('Processing billing update...');
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/payments/${payingInvoice._id}/pay`, paymentForm);
            toast.success('Payment recorded and settled! 💵', { id: loadToast });
            setPayingInvoice(null);
            fetchPayments(true);
            
            // If the selected invoice details modal is open, update its state as well
            if (selectedInvoice && selectedInvoice._id === payingInvoice._id) {
                const updatedPaymentsRes = await axios.get(`${import.meta.env.VITE_API_URL}/payments`);
                const fresh = updatedPaymentsRes.data.find(p => p._id === payingInvoice._id);
                setSelectedInvoice(fresh);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to process and record payment.', { id: loadToast });
        }
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    // Calculate Financial stats
    const totalInvoicesCount = payments.length;
    const totalRevenueCollected = payments
        .filter(p => p.status === 'Completed')
        .reduce((sum, p) => sum + p.amount, 0);
    const totalPendingRevenue = payments
        .filter(p => p.status === 'Pending')
        .reduce((sum, p) => sum + p.amount, 0);
    const collectionRate = totalInvoicesCount > 0
        ? Math.round((payments.filter(p => p.status === 'Completed').length / totalInvoicesCount) * 100)
        : 0;

    // Filter & Sort Logic
    const filteredPayments = payments.filter(pay => {
        const matchesSearch =
            pay.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pay.bookingId?.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pay.bookingId?.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pay.bookingId?.vehicleId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pay.bookingId?.vehicleId?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All' || pay.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const sortedPayments = [...filteredPayments].sort((a, b) => {
        if (sortBy === 'date-desc') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortBy === 'date-asc') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (sortBy === 'amount-desc') {
            return b.amount - a.amount;
        } else if (sortBy === 'amount-asc') {
            return a.amount - b.amount;
        }
        return 0;
    });

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse px-2">
                <div className="h-10 bg-slate-800/60 rounded-lg w-1/3"></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-[#121b28]/60 border border-white/[0.05] rounded-2xl"></div>)}
                </div>
                <div className="h-96 bg-[#121b28]/60 border border-white/[0.05] rounded-[18px]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-2 py-2 print:p-0">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.05] pb-5 print:hidden">
                <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                    <h1 className="text-3xl font-black text-white tracking-wide font-title uppercase">
                        Payments & Billing
                    </h1>
                </div>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-mono font-bold self-start md:self-auto">
                    Ledger Controller
                </span>
            </div>

            {/* Financial Overview Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 print:hidden">
                {/* Total Collected */}
                <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-2xl p-5 shadow-[0_10px_25px_rgba(0,0,0,0.4)] group">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Collected</span>
                        <span className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                            <TrendingUp className="h-4 w-4" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <span className="text-2xl font-black text-white">₹{totalRevenueCollected.toLocaleString()}</span>
                        <div className="text-[10px] text-emerald-400 font-bold mt-1 uppercase tracking-wider">Settled Fleet Revenue</div>
                    </div>
                </div>

                {/* Outstanding Revenue */}
                <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-2xl p-5 shadow-[0_10px_25px_rgba(0,0,0,0.4)] group">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pending Balance</span>
                        <span className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                            <Clock className="h-4 w-4" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <span className="text-2xl font-black text-white">₹{totalPendingRevenue.toLocaleString()}</span>
                        <div className="text-[10px] text-amber-400 font-bold mt-1 uppercase tracking-wider">Awaiting Collection</div>
                    </div>
                </div>

                {/* Collection Rate */}
                <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-2xl p-5 shadow-[0_10px_25px_rgba(0,0,0,0.4)] group">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Collection Rate</span>
                        <span className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl group-hover:bg-blue-500 group-hover:text-slate-950 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.15)]">
                            <CheckCircle className="h-4 w-4" />
                        </span>
                    </div>
                    <div className="mt-4 space-y-2">
                        <span className="text-2xl font-black text-white">{collectionRate}%</span>
                        <div className="w-full bg-[#0d1420] rounded-full h-1.5 border border-white/[0.03]">
                            <div
                                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                style={{ width: `${collectionRate}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Total Invoices */}
                <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-2xl p-5 shadow-[0_10px_25px_rgba(0,0,0,0.4)] group">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Invoices</span>
                        <span className="p-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl group-hover:bg-purple-500 group-hover:text-slate-950 transition-all duration-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]">
                            <FileText className="h-4 w-4" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <span className="text-2xl font-black text-white">{totalInvoicesCount}</span>
                        <div className="text-[10px] text-purple-400 font-bold mt-1 uppercase tracking-wider">Generated Invoices</div>
                    </div>
                </div>
            </div>

            {/* Filter and Control Bar */}
            <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-2xl p-4 shadow-[0_10px_20px_rgba(0,0,0,0.3)] flex flex-col lg:flex-row gap-4 justify-between items-center print:hidden">
                {/* Search */}
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-550 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search Invoice ID, Customer, Plate..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs transition bg-[#0d1420]/80 text-white placeholder-gray-550"
                    />
                </div>

                {/* Filtering controls */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto justify-end">
                    {/* Status filter */}
                    <div className="flex items-center gap-1 bg-[#0d1420]/80 border border-white/[0.05] rounded-xl p-1 text-xs font-bold">
                        {['All', 'Completed', 'Pending', 'Failed'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${statusFilter === status
                                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 font-bold shadow-sm'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Sorting */}
                    <div className="relative flex items-center gap-2 border border-white/[0.08] rounded-xl px-3 py-2.5 bg-[#0d1420]/80 text-xs font-bold text-gray-400">
                        <ArrowUpDown className="h-3.5 w-3.5 text-blue-400" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent border-none focus:outline-none cursor-pointer pr-4 font-bold text-slate-200 uppercase tracking-wide"
                        >
                            <option value="date-desc" className="bg-[#121b28]">Newest First</option>
                            <option value="date-asc" className="bg-[#121b28]">Oldest First</option>
                            <option value="amount-desc" className="bg-[#121b28]">Amount: High-Low</option>
                            <option value="amount-asc" className="bg-[#121b28]">Amount: Low-High</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Billing Ledger Table */}
            <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] shadow-[0_15px_35px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-[15px] print:border-none print:shadow-none">
                <Screws />
                
                <div className="overflow-x-auto relative z-10">
                    <table className="min-w-full divide-y divide-white/[0.05]">
                        <thead>
                            <tr className="border-b border-white/[0.05]">
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-transparent">Invoice ID</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-transparent">Customer Details</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-transparent">Assigned Vehicle</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-transparent">Billed Amount</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-transparent">Payment Status</th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest bg-transparent print:hidden">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {sortedPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center text-gray-400 font-medium bg-transparent">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <FileText className="h-10 w-10 text-gray-600 animate-pulse" />
                                            <span className="text-xs">No invoices match your selection.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                sortedPayments.map((pay) => (
                                    <tr
                                        key={pay._id}
                                        className="hover:bg-white/[0.02] transition-colors duration-150 cursor-pointer"
                                        onClick={() => setSelectedInvoice(pay)}
                                    >
                                        {/* Invoice ID */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1.5 rounded-lg shadow-inner">
                                                {pay.invoiceId}
                                            </span>
                                        </td>

                                        {/* Customer Details */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-xl bg-[#0d1420] border border-white/[0.08] flex items-center justify-center text-blue-400 font-black text-xs uppercase shadow-inner">
                                                    {pay.bookingId?.customerName ? pay.bookingId.customerName.charAt(0) : '?'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-white">{pay.bookingId?.customerName || 'Walk-in Customer'}</div>
                                                    <div className="text-xs text-gray-400 font-mono mt-0.5">{pay.bookingId?.customerEmail || 'No email'}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Vehicle */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-200">{pay.bookingId?.vehicleId?.name || 'Deleted Vehicle'}</span>
                                                <span className="text-[10px] w-fit font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 mt-1 rounded-md uppercase tracking-wider shadow-inner">
                                                    {pay.bookingId?.vehicleId?.licensePlate || 'N/A'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Amount */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center font-bold text-sm text-slate-100">
                                                <span className="text-emerald-400 mr-0.5">₹</span>
                                                <span>{pay.amount?.toLocaleString()}</span>
                                            </div>
                                        </td>

                                        {/* Status Badge */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm
                                                ${pay.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]' :
                                                  pay.status === 'Failed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.15)]' :
                                                  'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                                {pay.status === 'Completed' ? <CheckCircle className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                                                {pay.status}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium print:hidden" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-2">
                                                {pay.status === 'Pending' ? (
                                                    <button
                                                        onClick={() => handleOpenPayModal(pay)}
                                                        className="px-3 py-1.5 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 hover:shadow-[0_0_8px_rgba(59,130,246,0.2)] text-white font-bold rounded-xl text-xs transition duration-200 shadow-sm cursor-pointer active:scale-95"
                                                    >
                                                        Mark Paid
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setSelectedInvoice(pay)}
                                                        className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-gray-300 font-bold rounded-xl text-xs transition duration-200 cursor-pointer active:scale-95"
                                                    >
                                                        View Receipt
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL 1: VIEW & PRINT INVOICE DETAILS */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 print:p-0 print:static print:bg-white">
                    <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden flex flex-col print:shadow-none print:border-none print:max-w-full print:bg-white print:text-black">
                        <Screws />
                        
                        {/* Header bar - Hidden in Print */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05] bg-[#0d1420]/50 relative z-10 print:hidden">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Invoice Details</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrintInvoice}
                                    className="p-2 bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.06] rounded-xl text-gray-300 hover:text-white transition cursor-pointer"
                                    title="Print Invoice"
                                >
                                    <Printer className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setSelectedInvoice(null)}
                                    className="p-2 bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.06] rounded-xl text-gray-300 hover:text-white transition cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Invoice Content */}
                        <div className="p-8 space-y-6 flex-1 relative z-10 print:p-0 print:text-black">
                            {/* Branding and Invoice Title */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-black text-white flex items-center gap-2 print:text-black">
                                        <span className="text-blue-500 font-title italic text-3xl">R</span>
                                        <span className="font-title uppercase tracking-wider">RentalSys</span>
                                    </h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider print:text-gray-500">Premium Fleet & CRM Management</p>
                                </div>
                                <div className="text-right">
                                    <h3 className="text-md font-bold text-white uppercase tracking-widest print:text-black">Invoice Receipt</h3>
                                    <p className="text-xs font-mono font-bold text-blue-400 mt-1 print:text-black">{selectedInvoice.invoiceId}</p>
                                </div>
                            </div>

                            <hr className="border-white/[0.05] print:border-gray-200" />

                            {/* Client & Date Info */}
                            <div className="grid grid-cols-2 gap-6 text-xs">
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Billed To:</h4>
                                    <div className="space-y-1">
                                        <p className="font-bold text-slate-200 flex items-center gap-1.5 print:text-black text-sm">
                                            <User className="h-3.5 w-3.5 text-blue-400" /> {selectedInvoice.bookingId?.customerName || 'Walk-in Customer'}
                                        </p>
                                        <p className="text-xs text-gray-400 font-mono print:text-gray-650">{selectedInvoice.bookingId?.customerEmail || 'No email address'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Invoice Info:</h4>
                                    <div className="space-y-1 text-gray-300 print:text-black">
                                        <p className="font-medium">Date Issued: <span className="font-semibold text-slate-200 print:text-black">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</span></p>
                                        <p className="font-medium">Status:
                                            <span className={`ml-1 font-bold uppercase tracking-wider ${selectedInvoice.status === 'Completed' ? 'text-emerald-400' : selectedInvoice.status === 'Failed' ? 'text-rose-400' : 'text-amber-400'}`}>
                                                {selectedInvoice.status}
                                            </span>
                                        </p>
                                        {selectedInvoice.paymentDate && (
                                            <p className="font-medium">Payment Date: <span className="font-semibold text-slate-200 print:text-black">{new Date(selectedInvoice.paymentDate).toLocaleDateString()}</span></p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Rental details section */}
                            <div className="bg-[#0d1420]/40 rounded-2xl p-5 border border-white/[0.05] space-y-4 print:bg-gray-55/10 print:border-gray-200 print:text-black">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 print:text-black">
                                    <Car className="h-4 w-4 text-blue-400" /> Rental Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium text-gray-350 print:text-black">
                                    <div>
                                        <span className="block text-[9px] text-gray-550 uppercase font-bold tracking-wider">Vehicle</span>
                                        <span className="text-white font-bold text-sm block mt-0.5 print:text-black">{selectedInvoice.bookingId?.vehicleId?.name || 'N/A'}</span>
                                        <span className="text-[9px] text-blue-400 bg-blue-500/10 border border-blue-500/20 font-bold px-1.5 py-0.5 rounded mt-1 inline-block uppercase tracking-wider font-mono">
                                            {selectedInvoice.bookingId?.vehicleId?.licensePlate}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-[9px] text-gray-550 uppercase font-bold tracking-wider">Pick-up / Drop</span>
                                        <span className="text-slate-200 font-semibold block mt-0.5 print:text-black">From: {selectedInvoice.bookingId?.pickupLocation}</span>
                                        <span className="text-slate-200 font-semibold block print:text-black">To: {selectedInvoice.bookingId?.dropLocation}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[9px] text-gray-550 uppercase font-bold tracking-wider">Duration</span>
                                        <span className="text-slate-200 font-semibold block mt-0.5 print:text-black">Start: {selectedInvoice.bookingId?.startDate ? new Date(selectedInvoice.bookingId.startDate).toLocaleDateString() : 'N/A'}</span>
                                        <span className="text-slate-200 font-semibold block print:text-black">End: {selectedInvoice.bookingId?.endDate ? new Date(selectedInvoice.bookingId.endDate).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Breakup Table */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fee Breakdown</h4>
                                <table className="min-w-full text-xs text-left">
                                    <thead className="border-b border-white/[0.05] text-gray-500 font-bold print:border-gray-200 print:text-black">
                                        <tr>
                                            <th className="py-2 uppercase tracking-wider">Item Description</th>
                                            <th className="py-2 text-right uppercase tracking-wider">Daily Rate</th>
                                            <th className="py-2 text-right uppercase tracking-wider">Days</th>
                                            <th className="py-2 text-right uppercase tracking-wider">Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03] text-gray-300 print:text-black print:divide-gray-100">
                                        <tr>
                                            <td className="py-3">
                                                <span className="font-bold text-white print:text-black text-sm">{selectedInvoice.bookingId?.vehicleId?.name || 'Vehicle Rental'}</span>
                                                <span className="block text-[10px] text-gray-500 font-medium mt-0.5">Standard rental insurance and tax included</span>
                                            </td>
                                            <td className="py-3 text-right font-medium">
                                                ₹{(selectedInvoice.bookingId?.vehicleId?.vehicleType === 'Car' ? 5000 : 15000).toLocaleString()}
                                            </td>
                                            <td className="py-3 text-right font-medium">
                                                {selectedInvoice.bookingId?.startDate && selectedInvoice.bookingId?.endDate ?
                                                    Math.ceil(Math.abs(new Date(selectedInvoice.bookingId.endDate) - new Date(selectedInvoice.bookingId.startDate)) / (1000 * 60 * 60 * 24)) || 1
                                                    : 1
                                                }
                                            </td>
                                            <td className="py-3 text-right font-bold text-slate-100 print:text-black text-sm">₹{selectedInvoice.amount?.toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Payment Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/[0.05] pt-6 text-left print:border-gray-200">
                                <div className="text-xs text-gray-400 space-y-1 print:text-black">
                                    <p className="font-bold text-gray-500 uppercase tracking-widest text-[9px] print:text-black">Payment Information</p>
                                    <p><span className="font-medium text-gray-500">Method:</span> <span className="text-slate-200 print:text-black font-semibold">{selectedInvoice.paymentMethod || 'N/A'}</span></p>
                                    <p><span className="font-medium text-gray-500">Txn ID:</span> <span className="font-mono text-slate-200 print:text-black">{selectedInvoice.transactionId || 'N/A'}</span></p>
                                    {selectedInvoice.notes && (
                                        <p><span className="font-medium text-gray-500">Notes:</span> <span className="italic text-gray-400 print:text-black">{selectedInvoice.notes}</span></p>
                                    )}
                                </div>
                                <div className="text-right space-y-1.5 text-gray-400 print:text-black">
                                    <div className="flex justify-between items-center text-xs font-semibold md:justify-end md:gap-8">
                                        <span className="text-gray-500">Subtotal:</span>
                                        <span className="text-slate-200 print:text-black">₹{selectedInvoice.amount?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-semibold md:justify-end md:gap-8">
                                        <span className="text-gray-500">Tax & Surcharges:</span>
                                        <span className="text-slate-200 print:text-black">₹0.00</span>
                                    </div>
                                    <div className="flex justify-between items-center text-base font-black text-blue-400 md:justify-end md:gap-8 border-t border-white/[0.05] pt-2.5 mt-2 print:border-gray-200 print:text-black">
                                        <span>Grand Total:</span>
                                        <span className="text-lg text-white print:text-black font-extrabold">₹{selectedInvoice.amount?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stamp of Confirmation */}
                        <div className={`absolute right-12 top-20 rotate-12 opacity-15 pointer-events-none select-none border-4 rounded-xl px-4 py-2 text-2xl font-black tracking-widest uppercase
                            ${selectedInvoice.status === 'Completed' ? 'border-emerald-500 text-emerald-500' : 'border-amber-500 text-amber-500'}`}>
                            {selectedInvoice.status === 'Completed' ? 'PAID' : selectedInvoice.status}
                        </div>

                        {/* Action buttons at bottom */}
                        <div className="px-6 py-4 border-t border-white/[0.05] bg-[#0d1420]/50 flex items-center justify-between relative z-10 print:hidden">
                            {selectedInvoice.status === 'Pending' ? (
                                <button
                                    onClick={() => {
                                        handleOpenPayModal(selectedInvoice);
                                    }}
                                    className="px-4 py-2 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition duration-200 shadow-sm cursor-pointer active:scale-95"
                                >
                                    Record Payment
                                </button>
                            ) : (
                                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                                    <CheckCircle className="h-4 w-4" /> Invoice Settled
                                </span>
                            )}
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-gray-300 font-bold rounded-xl text-xs transition duration-200 cursor-pointer active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: RECORD / MARK PAYMENT AS PAID */}
            {payingInvoice && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="relative w-full max-w-md bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden text-left">
                        <Screws />
                        
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05] bg-[#0d1420]/50 relative z-10">
                            <div>
                                <h3 className="text-sm font-bold text-white tracking-wide font-title uppercase">Record Payment</h3>
                                <p className="text-xs text-gray-400 font-mono mt-0.5">Invoice ID: {payingInvoice.invoiceId}</p>
                            </div>
                            <button
                                onClick={() => setPayingInvoice(null)}
                                className="p-2 bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.06] rounded-xl text-gray-300 hover:text-white transition cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Pay Form */}
                        <form onSubmit={handleProcessPayment} className="p-6 space-y-4 relative z-10">
                            {/* Bill detail recap */}
                            <div className="p-4 bg-blue-500/5 border border-blue-500/15 rounded-2xl flex items-center justify-between text-slate-200 shadow-inner">
                                <div>
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block">Customer</span>
                                    <span className="font-bold text-sm text-white">{payingInvoice.bookingId?.customerName || 'Walk-in'}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] text-gray-550 font-bold uppercase tracking-widest block">Total Billed</span>
                                    <span className="font-black text-lg text-emerald-400">₹{payingInvoice.amount?.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Payment Status Choice */}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Status</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentForm({ ...paymentForm, status: 'Completed' })}
                                        className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer uppercase tracking-wider ${paymentForm.status === 'Completed'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500'
                                            : 'bg-white/[0.02] border-white/[0.05] text-gray-450 hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        Completed (Paid)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentForm({ ...paymentForm, status: 'Failed' })}
                                        className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer uppercase tracking-wider ${paymentForm.status === 'Failed'
                                            ? 'bg-rose-500/10 text-rose-400 border-rose-500'
                                            : 'bg-white/[0.02] border-white/[0.05] text-gray-455 hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        Failed / Declined
                                    </button>
                                </div>
                            </div>

                            {/* Payment Method selection */}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Method</label>
                                <select
                                    value={paymentForm.paymentMethod}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                                    className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200 font-semibold"
                                >
                                    <option value="Credit Card" className="bg-[#121b28]">Credit Card</option>
                                    <option value="Debit Card" className="bg-[#121b28]">Debit Card</option>
                                    <option value="UPI" className="bg-[#121b28]">UPI (Google Pay, PhonePe)</option>
                                    <option value="Bank Transfer" className="bg-[#121b28]">Bank Transfer</option>
                                    <option value="Cash" className="bg-[#121b28]">Cash at Counter</option>
                                    <option value="Net Banking" className="bg-[#121b28]">Net Banking</option>
                                </select>
                            </div>

                            {/* Transaction ID */}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction ID / Reference</label>
                                <input
                                    type="text"
                                    value={paymentForm.transactionId}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                                    placeholder="Enter reference receipt ID"
                                    className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                />
                            </div>

                            {/* Payment Notes */}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Internal Notes (Optional)</label>
                                <textarea
                                    value={paymentForm.notes}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                                    rows="2"
                                    placeholder="e.g. Card swiped on Terminal 2"
                                    className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                ></textarea>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-3">
                                <button
                                    type="submit"
                                    className={`flex-1 py-3 text-white font-black rounded-xl text-xs transition duration-200 shadow-md uppercase tracking-wider cursor-pointer active:scale-95 ${
                                        paymentForm.status === 'Completed' 
                                            ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500' 
                                            : 'bg-gradient-to-b from-rose-550 to-rose-650 hover:from-rose-500 hover:to-rose-600'
                                    }`}
                                >
                                    Confirm & Update
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPayingInvoice(null)}
                                    className="px-5 py-3 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider transition duration-200 cursor-pointer active:scale-95"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentsList;
