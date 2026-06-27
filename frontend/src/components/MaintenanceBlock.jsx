import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Wrench, Calendar, FileText, Trash2, ShieldAlert } from 'lucide-react';

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

const MaintenanceBlock = () => {
    const [vehicles, setVehicles] = useState([]);
    const [maintenanceBlocks, setMaintenanceBlocks] = useState([]);
    const [formData, setFormData] = useState({
        vehicleId: '',
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const fetchData = async () => {
        try {
            const [vehiclesRes, blocksRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/vehicles`),
                axios.get(`${import.meta.env.VITE_API_URL}/maintenance`)
            ]);
            setVehicles(vehiclesRes.data);
            setMaintenanceBlocks(blocksRes.data);
            setFetching(false);
        } catch (err) {
            console.error("Error fetching data:", err);
            setFetching(false);
            toast.error("Failed to load maintenance data.");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const loadingToast = toast.loading('Creating maintenance block...');

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/maintenance/block`, formData);
            toast.success('Vehicle successfully blocked for maintenance.', { id: loadingToast });
            setFormData({ vehicleId: '', startDate: '', endDate: '', reason: '' });
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error blocking vehicle for maintenance.', { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (id) => {
        // Custom elegant confirm prompt using toast
        toast((t) => (
            <div className="flex flex-col gap-2">
                <span className="font-semibold text-xs text-slate-300">Are you sure you want to remove this maintenance block?</span>
                <div className="flex justify-end gap-2 mt-1">
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            const actionToast = toast.loading('Removing maintenance block...');
                            try {
                                await axios.delete(`${import.meta.env.VITE_API_URL}/maintenance/${id}/unblock`);
                                toast.success('Maintenance block removed successfully.', { id: actionToast });
                                fetchData();
                            } catch {
                                toast.error('Failed to remove maintenance block.', { id: actionToast });
                            }
                        }}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider transition cursor-pointer"
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
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '12px'
            }
        });
    };

    if (fetching) {
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
        <div className="px-2 space-y-8">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="h-8 w-8 text-yellow-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]" />
                    <h1 className="text-3xl font-black text-white tracking-wide font-title uppercase">Admin: Maintenance Blocking</h1>
                </div>
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-xs font-mono font-bold">
                    Fleet Control Panel
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Block Form Panel */}
                <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-[15px] lg:col-span-1 h-fit">
                    <Screws />
                    <h2 className="text-lg font-bold text-white mb-6 tracking-wide font-title flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-blue-400" /> Add Maintenance Block
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        {/* Vehicle Select */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vehicle</label>
                            <select 
                                name="vehicleId"
                                value={formData.vehicleId}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                            >
                                <option value="" className="bg-[#121b28]">Select a vehicle</option>
                                <optgroup label="🚗 Cars" className="bg-[#121b28] text-gray-400">
                                    {vehicles.filter(v => v.vehicleType === 'Car').map(v => (
                                        <option key={v._id || v.id} value={v._id || v.id} className="text-white">
                                            {v.name} ({v.licensePlate})
                                        </option>
                                    ))}
                                </optgroup>
                                <optgroup label="🚌 Buses" className="bg-[#121b28] text-gray-400">
                                    {vehicles.filter(v => v.vehicleType === 'Bus').map(v => (
                                        <option key={v._id || v.id} value={v._id || v.id} className="text-white">
                                            {v.name} ({v.licensePlate})
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>

                        {/* Start Date */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Start Date</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200 [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">End Date</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200 [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        {/* Reason Description */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Reason / Description</label>
                            <textarea 
                                name="reason"
                                value={formData.reason}
                                onChange={handleInputChange}
                                required
                                rows="3"
                                className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                placeholder="e.g. Engine oil change and brake inspection"
                            ></textarea>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gradient-to-b from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)] text-slate-950 font-black py-3 px-4 rounded-xl transition duration-200 disabled:opacity-50 active:scale-[0.98] uppercase tracking-wider text-xs cursor-pointer"
                        >
                            {loading ? 'Processing...' : 'Block Vehicle'}
                        </button>
                    </form>
                </div>

                {/* Blocks List Panel */}
                <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-[15px] lg:col-span-2">
                    <Screws />
                    <h2 className="text-lg font-bold text-white mb-6 tracking-wide font-title flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-400" /> Current Maintenance Blocks
                    </h2>
                    
                    <div className="overflow-x-auto relative z-10">
                        <table className="min-w-full divide-y divide-white/[0.05]">
                            <thead>
                                <tr className="border-b border-white/[0.05]">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-transparent">Vehicle</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-transparent">Dates</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-transparent">Reason</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest bg-transparent">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {maintenanceBlocks.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-gray-400 font-medium bg-transparent">
                                            No active maintenance blocks.
                                        </td>
                                    </tr>
                                ) : (
                                    maintenanceBlocks.map(block => (
                                        <tr key={block._id} className="hover:bg-white/[0.02] transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-white">{block.vehicleId?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-400 font-mono mt-0.5">{block.vehicleId?.licensePlate || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-300 font-medium">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#121b28] border border-white/[0.05] rounded-lg">
                                                    {format(new Date(block.startDate), 'MMM d, yyyy')}
                                                    <span className="text-gray-500">→</span>
                                                    {format(new Date(block.endDate), 'MMM d, yyyy')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-300 max-w-xs truncate">
                                                {block.reason}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                                                <button 
                                                    onClick={() => handleUnblock(block._id)}
                                                    className="inline-flex items-center gap-1.5 h-8 px-3 border border-red-500/30 bg-red-500/5 hover:bg-red-500/12 text-red-400 hover:text-red-300 rounded-lg font-bold transition-all duration-150 active:scale-95 cursor-pointer"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    <span>Unblock</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceBlock;
