import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
    Car, Bus, PlusCircle, Edit3, Trash2, CheckCircle, 
    Wrench, ShieldAlert, Sparkles, Image as ImageIcon, CreditCard, Layers, X
} from 'lucide-react';

const MODELS = {
    Car: [
        "Toyota Innova Crysta", "Hyundai Creta", "Maruti Swift",
        "Kia Seltos", "Tata Nexon", "Mahindra XUV700", "Honda City", "Toyota Fortuner"
    ],
    Bus: [
        "Volvo 9400 B11R", "Scania Metrolink", "Mercedes-Benz Superia", "Ashok Leyland Viking"
    ]
};

const DEFAULT_IMAGES = {
    "Toyota Innova Crysta": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
    "Hyundai Creta": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80",
    "Maruti Swift": "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=600&q=80",
    "Kia Seltos": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80",
    "Tata Nexon": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
    "Mahindra XUV700": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
    "Honda City": "https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&w=600&q=80",
    "Toyota Fortuner": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80",
    "Volvo 9400 B11R": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
    "Scania Metrolink": "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80",
    "Mercedes-Benz Superia": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
    "Ashok Leyland Viking": "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80"
};

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

const VehiclesList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    
    const [formData, setFormData] = useState({
        name: MODELS['Car'][0],
        vehicleType: 'Car',
        licensePlate: '',
        status: 'Available',
        imageUrl: DEFAULT_IMAGES[MODELS['Car'][0]]
    });

    const fetchVehicles = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/vehicles');
            setVehicles(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
            toast.error('Failed to sync fleet database.');
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'vehicleType') {
            const defaultModel = MODELS[value][0];
            setFormData({
                ...formData,
                vehicleType: value,
                name: defaultModel,
                imageUrl: DEFAULT_IMAGES[defaultModel] || ''
            });
        } else if (name === 'name') {
            setFormData({
                ...formData,
                name: value,
                imageUrl: DEFAULT_IMAGES[value] || ''
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleAutoGeneratePlate = () => {
        const prefix = formData.vehicleType.toUpperCase().substring(0, 3);
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        setFormData(prev => ({ ...prev, licensePlate: `${prefix}-${randomNum}` }));
        toast.success('License plate auto-generated!');
    };

    const handleOpenAddModal = () => {
        const defaultModel = MODELS['Car'][0];
        setFormData({
            name: defaultModel,
            vehicleType: 'Car',
            licensePlate: '',
            status: 'Available',
            imageUrl: DEFAULT_IMAGES[defaultModel]
        });
        setModalType('add');
        setSelectedVehicleId(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (vehicle) => {
        setFormData({
            name: vehicle.name,
            vehicleType: vehicle.vehicleType,
            licensePlate: vehicle.licensePlate,
            status: vehicle.status,
            imageUrl: vehicle.imageUrl
        });
        setModalType('edit');
        setSelectedVehicleId(vehicle.id || vehicle._id);
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadToast = toast.loading(modalType === 'add' ? 'Adding vehicle to database...' : 'Updating vehicle details...');
        try {
            if (modalType === 'add') {
                await axios.post('http://localhost:5000/api/vehicles', formData);
                toast.success('Vehicle successfully registered! 🚀', { id: loadToast });
            } else {
                await axios.put(`http://localhost:5000/api/vehicles/${selectedVehicleId}`, formData);
                toast.success('Vehicle updated successfully! 🛠️', { id: loadToast });
            }
            setModalOpen(false);
            fetchVehicles();
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.error || err.response?.data?.message || 'Server connection issue.';
            toast.error(`Operation failed: ${errMsg} ❌`, { id: loadToast });
        }
    };

    const handleDeleteVehicle = async (id, name) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <span className="font-semibold text-xs text-slate-300">
                    Are you sure you want to decommission <span className="text-red-400 font-bold">{name}</span> from the active fleet?
                </span>
                <div className="flex justify-end gap-2 mt-1">
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            const actionToast = toast.loading('Decommissioning vehicle...');
                            try {
                                await axios.delete(`http://localhost:5000/api/vehicles/${id}`);
                                toast.success('Vehicle removed from fleet database.', { id: actionToast });
                                fetchVehicles();
                            } catch {
                                toast.error('Failed to remove vehicle.', { id: actionToast });
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

    const handleUpdateStatus = async (id, currentVehicle, newStatus) => {
        const loadToast = toast.loading(`Updating status to ${newStatus}...`);
        try {
            const updatedData = {
                name: currentVehicle.name,
                vehicleType: currentVehicle.vehicleType,
                licensePlate: currentVehicle.licensePlate,
                imageUrl: currentVehicle.imageUrl,
                status: newStatus
            };
            await axios.put(`http://localhost:5000/api/vehicles/${id}`, updatedData);
            toast.success(`Vehicle marked as ${newStatus}!`, { id: loadToast });
            fetchVehicles();
        } catch (err) {
            console.error(err);
            toast.error('Failed to update status.', { id: loadToast });
        }
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse px-2">
                <div className="h-10 bg-slate-800/60 rounded-lg w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(n => (
                        <div key={n} className="h-64 bg-[#121b28]/60 border border-white/[0.05] rounded-[18px]"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="px-2 space-y-8 pb-12 relative">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-wide font-title uppercase">Fleet Management</h1>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-1">Manage active vehicles, edit specifications, & toggle states</p>
                </div>
                <button 
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-b from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] active:scale-[0.98] transition-all duration-200 font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                    <PlusCircle className="h-4 w-4" /> Add Vehicle
                </button>
            </div>

            {/* Vehicles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.length === 0 ? (
                    <div className="col-span-full relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-12 text-center py-24 text-gray-400">
                        <Screws />
                        <ShieldAlert className="h-12 w-12 mx-auto text-gray-600 mb-4 animate-pulse" />
                        <h3 className="text-base font-bold text-slate-350 uppercase tracking-wider">No Vehicles Registered</h3>
                        <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">Load default vehicles from the main dashboard Quick Actions or click Add Vehicle to construct your fleet.</p>
                    </div>
                ) : (
                    vehicles.map((vehicle) => {
                        const id = vehicle.id || vehicle._id;
                        return (
                            <div 
                                key={id} 
                                className="relative overflow-hidden bg-gradient-to-b from-[#142030]/90 to-[#0d1621]/90 border border-white/[0.08] rounded-[22px] p-5 shadow-[0_15px_30px_rgba(0,0,0,0.5)] group flex flex-col justify-between"
                            >
                                <Screws />
                                
                                {/* Image Container */}
                                <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/[0.08] shadow-inner bg-[#0b111a] mb-4">
                                    {vehicle.imageUrl ? (
                                        <img 
                                            src={vehicle.imageUrl} 
                                            alt={vehicle.name} 
                                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.src = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80";
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-2 bg-[#090e15]">
                                            <ImageIcon className="h-8 w-8 text-gray-600 animate-pulse" />
                                            <span className="text-[10px] font-medium">No Image Preset</span>
                                        </div>
                                    )}
                                    {/* Glassmorphic category pill */}
                                    <span className="absolute top-3 left-3 px-3 py-1 bg-[#0d1420]/80 backdrop-blur-md border border-white/[0.1] rounded-lg text-[10px] font-bold text-blue-400 uppercase tracking-widest shadow-md">
                                        {vehicle.vehicleType}
                                    </span>
                                    
                                    {/* Neon Status Badge */}
                                    <span className={`absolute top-3 right-3 px-3 py-1 border rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-md transition-all duration-300
                                        ${vehicle.status === 'Available' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 
                                          vehicle.status === 'Booked' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]' : 
                                          'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'}`}>
                                        {vehicle.status}
                                    </span>
                                </div>

                                {/* Details & Control Panel */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="truncate max-w-[170px]">
                                            <h3 className="text-base font-extrabold text-white tracking-wide font-title uppercase truncate">
                                                {vehicle.name}
                                            </h3>
                                            <span className="px-2 py-0.5 bg-[#0d1420]/65 border border-white/[0.05] rounded-md text-[9px] font-mono font-bold text-gray-500 uppercase tracking-wider block mt-1 w-fit">
                                                ID: {String(id).substring(0, 8)}...
                                            </span>
                                        </div>
                                        <div className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-mono font-bold tracking-wider shadow-sm">
                                            {vehicle.licensePlate}
                                        </div>
                                    </div>

                                    {/* Quick State Toggle */}
                                    <div className="bg-[#090e15]/60 border border-white/[0.04] p-2.5 rounded-xl flex items-center justify-between gap-1.5">
                                        <span className="text-[9px] text-gray-550 font-black uppercase tracking-wider pl-1.5">Set State:</span>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => handleUpdateStatus(id, vehicle, 'Available')}
                                                className={`p-1.5 rounded-lg transition-all duration-250 cursor-pointer
                                                    ${vehicle.status === 'Available' 
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.25)]' 
                                                        : 'bg-transparent text-gray-550 hover:text-emerald-400 hover:bg-emerald-500/5 border border-transparent'}`}
                                                title="Set Available"
                                            >
                                                <CheckCircle className="h-3.5 w-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => handleUpdateStatus(id, vehicle, 'Booked')}
                                                className={`p-1.5 rounded-lg transition-all duration-250 cursor-pointer
                                                    ${vehicle.status === 'Booked' 
                                                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.25)]' 
                                                        : 'bg-transparent text-gray-555 hover:text-rose-400 hover:bg-rose-500/5 border border-transparent'}`}
                                                title="Set Booked"
                                            >
                                                <Car className="h-3.5 w-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => handleUpdateStatus(id, vehicle, 'Maintenance')}
                                                className={`p-1.5 rounded-lg transition-all duration-250 cursor-pointer
                                                    ${vehicle.status === 'Maintenance' 
                                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.25)]' 
                                                        : 'bg-transparent text-gray-555 hover:text-amber-400 hover:bg-amber-500/5 border border-transparent'}`}
                                                title="Set Maintenance"
                                            >
                                                <Wrench className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action buttons (Edit & Delete) */}
                                    <div className="flex gap-2.5 pt-2 border-t border-white/[0.03]">
                                        <button
                                            onClick={() => handleOpenEditModal(vehicle)}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] text-gray-350 rounded-xl font-bold text-xs uppercase tracking-wider transition duration-200 active:scale-[0.97] cursor-pointer"
                                        >
                                            <Edit3 className="h-3.5 w-3.5 text-blue-400" />
                                            <span>Modify specs</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteVehicle(id, vehicle.name)}
                                            className="inline-flex items-center justify-center h-10 w-10 bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 hover:border-red-500/40 text-red-400 rounded-xl transition duration-200 active:scale-[0.97] cursor-pointer"
                                            title="Decommission Vehicle"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add / Edit Modal Overlay */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05090f]/80 backdrop-blur-md p-4">
                    <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[24px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.85)] max-w-lg w-full">
                        <Screws />
                        
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h2 className="text-xl font-black text-white tracking-wide font-title uppercase flex items-center gap-2">
                                {modalType === 'add' ? (
                                    <>
                                        <PlusCircle className="h-5 w-5 text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.3)]" /> Add New Vehicle
                                    </>
                                ) : (
                                    <>
                                        <Edit3 className="h-5 w-5 text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.3)]" /> Modify Vehicle Specs
                                    </>
                                )}
                            </h2>
                            <button 
                                onClick={() => setModalOpen(false)}
                                className="p-1 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] text-gray-400 hover:text-white rounded-lg transition cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                            {/* Vehicle Type select */}
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                    <Layers className="h-3.5 w-3.5 text-blue-400" /> Vehicle Type
                                </label>
                                <select
                                    name="vehicleType"
                                    value={formData.vehicleType}
                                    onChange={handleChange}
                                    disabled={modalType === 'edit'}
                                    className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200 disabled:opacity-50"
                                >
                                    <option value="Car" className="bg-[#121b28]">🚗 Car</option>
                                    <option value="Bus" className="bg-[#121b28]">🚌 Bus</option>
                                </select>
                            </div>

                            {/* Vehicle Model select */}
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                    <Car className="h-3.5 w-3.5 text-blue-400" /> Vehicle Model
                                </label>
                                <select
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                >
                                    {MODELS[formData.vehicleType].map(model => (
                                        <option key={model} value={model} className="bg-[#121b28]">{model}</option>
                                    ))}
                                </select>
                            </div>

                            {/* License Plate input */}
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                    <CreditCard className="h-3.5 w-3.5 text-blue-400" /> License Plate Number
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="licensePlate"
                                        value={formData.licensePlate}
                                        onChange={handleChange}
                                        required
                                        className="flex-1 bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-650 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                        placeholder="e.g. MH-12-AB-1234"
                                    />
                                    {modalType === 'add' && (
                                        <button
                                            type="button"
                                            onClick={handleAutoGeneratePlate}
                                            className="inline-flex items-center gap-1.5 px-3 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-xl font-bold text-[10px] hover:bg-blue-600/20 hover:border-blue-500/50 transition-all duration-200 active:scale-95 cursor-pointer"
                                        >
                                            <Sparkles className="h-3.5 w-3.5" />
                                            <span>Auto</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Image URL input */}
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                    <ImageIcon className="h-3.5 w-3.5 text-blue-400" /> Image URL
                                </label>
                                <input
                                    type="url"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-650 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                    placeholder="https://images.unsplash.com/..."
                                />
                            </div>

                            {/* Status select (only in Edit) */}
                            {modalType === 'edit' && (
                                <div>
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                    >
                                        <option value="Available" className="bg-[#121b28] text-emerald-400">Available</option>
                                        <option value="Booked" className="bg-[#121b28] text-rose-400">Booked</option>
                                        <option value="Maintenance" className="bg-[#121b28] text-amber-400">Maintenance</option>
                                    </select>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-gray-300 font-bold py-3 px-4 rounded-xl transition duration-200 active:scale-[0.98] uppercase tracking-wider text-[10px] cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] text-white font-black py-3 px-4 rounded-xl transition duration-200 active:scale-[0.98] uppercase tracking-wider text-[10px] cursor-pointer"
                                >
                                    {modalType === 'add' ? 'Register Vehicle' : 'Apply Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehiclesList;
