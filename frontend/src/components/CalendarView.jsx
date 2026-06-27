import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, addDays } from 'date-fns';
import { Calendar, Filter, Eye, ShieldAlert, Sparkles, CheckCircle2, Clock } from 'lucide-react';

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

const CalendarView = () => {
    const [vehicles, setVehicles] = useState([]);
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!startDate || !endDate) return;
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/vehicles/availability`, {
                    params: { startDate, endDate }
                });
                setVehicles(res.data);
            } catch (err) {
                console.error("Error fetching availability:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAvailability();
    }, [startDate, endDate]);

    const filteredVehicles = vehicles.filter(v => {
        if (filter === 'All') return true;
        if (filter === 'Cars') return v.vehicleType === 'Car';
        if (filter === 'Buses') return v.vehicleType === 'Bus';
        if (filter === 'Available Only') return v.availabilityStatus === 'Available';
        if (filter === 'Booked Only') return v.availabilityStatus === 'Booked';
        if (filter === 'Maintenance Only') return v.availabilityStatus === 'Maintenance';
        return true;
    });

    return (
        <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 sm:p-8 shadow-[0_15px_35px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-[15px]">
            <Screws />
            
            <div className="relative z-10 flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/[0.05] pb-5">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-7 w-7 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse" />
                        <h2 className="text-xl font-black text-white tracking-wide font-title uppercase">Vehicle Availability Calendar</h2>
                    </div>

                    {/* High-Tech Status Legend */}
                    <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-2 bg-[#0d1420]/60 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span> 
                            <span className="text-emerald-400">Available</span>
                        </div>
                        <div className="flex items-center gap-2 bg-[#0d1420]/60 border border-rose-500/20 px-2.5 py-1 rounded-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span> 
                            <span className="text-rose-400">Booked</span>
                        </div>
                        <div className="flex items-center gap-2 bg-[#0d1420]/60 border border-yellow-500/20 px-2.5 py-1 rounded-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span> 
                            <span className="text-yellow-400">Maintenance</span>
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#0d1420]/55 border border-white/[0.05] p-5 rounded-2xl">
                    <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2.5">Start Date</label>
                        <input 
                            type="date" 
                            className="w-full bg-[#0d1420] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200 font-mono"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2.5">End Date</label>
                        <input 
                            type="date" 
                            className="w-full bg-[#0d1420] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200 font-mono"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2.5">Filter Fleet Status</label>
                        <select 
                            className="w-full bg-[#0d1420] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200 font-bold uppercase tracking-wider"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="All" className="bg-[#121b28]">All Vehicles</option>
                            <option value="Cars" className="bg-[#121b28]">Cars Only</option>
                            <option value="Buses" className="bg-[#121b28]">Buses Only</option>
                            <option value="Available Only" className="bg-[#121b28]">Available Only</option>
                            <option value="Booked Only" className="bg-[#121b28]">Booked Only</option>
                            <option value="Maintenance Only" className="bg-[#121b28]">Maintenance Only</option>
                        </select>
                    </div>
                </div>

                {/* Calendar Availability Grid */}
                {loading ? (
                    <div className="text-center py-16 text-gray-500 text-xs font-semibold animate-pulse uppercase tracking-widest">
                        Loading availability dashboard...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredVehicles.map(vehicle => {
                            const isAvail = vehicle.availabilityStatus === 'Available';
                            const isBooked = vehicle.availabilityStatus === 'Booked';
                            const isMaint = vehicle.availabilityStatus === 'Maintenance';

                            return (
                                <div 
                                    key={vehicle._id} 
                                    className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] shadow-lg flex flex-col justify-between h-36
                                        ${isAvail ? 'bg-emerald-500/[0.01] border-emerald-500/20 hover:border-emerald-500/45 shadow-[inset_0_1px_1px_rgba(255,255,255,0.01),0_5px_15px_rgba(16,185,129,0.05)]' :
                                          isBooked ? 'bg-rose-500/[0.01] border-rose-500/20 hover:border-rose-500/45 shadow-[inset_0_1px_1px_rgba(255,255,255,0.01),0_5px_15px_rgba(244,63,94,0.05)]' :
                                          'bg-yellow-500/[0.01] border-yellow-500/20 hover:border-yellow-500/45 shadow-[inset_0_1px_1px_rgba(255,255,255,0.01),0_5px_15px_rgba(245,158,11,0.05)]'
                                        }`}
                                >
                                    <div>
                                        <h3 className="text-sm font-black text-white tracking-wide uppercase font-title">{vehicle.name}</h3>
                                        <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase tracking-wider">{vehicle.vehicleType} • {vehicle.licensePlate}</p>
                                    </div>
                                    
                                    <div className={`w-fit text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider flex items-center gap-1.5 shadow-sm mt-4
                                        ${isAvail ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_6px_rgba(52,211,153,0.15)]' :
                                          isBooked ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_6px_rgba(244,63,94,0.15)]' :
                                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_6px_rgba(245,158,11,0.15)]'
                                        }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full 
                                            ${isAvail ? 'bg-emerald-400 animate-pulse shadow-[0_0_4px_rgba(52,211,153,0.8)]' :
                                              isBooked ? 'bg-rose-400 shadow-[0_0_4px_rgba(244,63,94,0.8)]' :
                                              'bg-yellow-400 shadow-[0_0_4px_rgba(245,158,11,0.8)]'
                                            }`}
                                        ></span>
                                        <span>{vehicle.availabilityStatus}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredVehicles.length === 0 && (
                            <div className="col-span-full text-center py-16 text-gray-500 text-xs font-semibold border border-dashed border-white/[0.08] rounded-2xl uppercase tracking-widest">
                                No fleet vehicles match the selected criteria.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarView;
