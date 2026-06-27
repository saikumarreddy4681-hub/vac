import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PlusCircle, Car, Sparkles, Image as ImageIcon, CreditCard, Layers } from 'lucide-react';

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

const AddVehicle = () => {
    const [formData, setFormData] = useState({
        name: MODELS['Car'][0],
        vehicleType: 'Car',
        licensePlate: '',
        status: 'Available',
        imageUrl: DEFAULT_IMAGES[MODELS['Car'][0]]
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const loadingToast = toast.loading('Adding vehicle to database...');

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/vehicles`, formData);
            toast.success('Vehicle added successfully to fleet! 🚀', { id: loadingToast });
            
            // Reset form
            const defaultModel = MODELS['Car'][0];
            setFormData({ 
                name: defaultModel, 
                vehicleType: 'Car', 
                licensePlate: '', 
                status: 'Available', 
                imageUrl: DEFAULT_IMAGES[defaultModel] 
            });
        } catch (error) {
            console.error(error);
            const serverMsg = error.response?.data?.error || error.response?.data?.message;
            toast.error(`Failed to add vehicle: ${serverMsg ? serverMsg : 'Is backend running?'} ❌`, { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

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
        toast.success('License plate auto-generated!', { duration: 1500 });
    };

    return (
        <div className="px-2 space-y-8 max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <PlusCircle className="h-8 w-8 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse" />
                    <h1 className="text-3xl font-black text-white tracking-wide font-title uppercase">Add New Vehicle</h1>
                </div>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-mono font-bold">
                    Fleet Expansion
                </span>
            </div>

            {/* Content Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Form Plate Card */}
                <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 sm:p-8 shadow-[0_15px_35px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-[15px] lg:col-span-7">
                    <Screws />
                    
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {/* Vehicle Type select */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                <Layers className="h-3.5 w-3.5 text-blue-400" /> Vehicle Type
                            </label>
                            <select
                                name="vehicleType"
                                value={formData.vehicleType}
                                onChange={handleChange}
                                className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                            >
                                <option value="Car" className="bg-[#121b28]">🚗 Car</option>
                                <option value="Bus" className="bg-[#121b28]">🚌 Bus</option>
                            </select>
                        </div>

                        {/* Vehicle Model select */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                <Car className="h-3.5 w-3.5 text-blue-400" /> Vehicle Model
                            </label>
                            <select
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                            >
                                {MODELS[formData.vehicleType].map(model => (
                                    <option key={model} value={model} className="bg-[#121b28]">{model}</option>
                                ))}
                            </select>
                        </div>

                        {/* License Plate input */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                <CreditCard className="h-3.5 w-3.5 text-blue-400" /> License Plate Number
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="licensePlate"
                                    value={formData.licensePlate}
                                    onChange={handleChange}
                                    required
                                    className="flex-1 bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                    placeholder="e.g. CAR-1234"
                                />
                                <button
                                    type="button"
                                    onClick={handleAutoGeneratePlate}
                                    className="inline-flex items-center gap-1.5 px-4 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-xl font-bold text-xs hover:bg-blue-600/20 hover:border-blue-500/50 transition-all duration-200 active:scale-95 cursor-pointer"
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>Auto-Generate</span>
                                </button>
                            </div>
                        </div>

                        {/* Image URL input */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                <ImageIcon className="h-3.5 w-3.5 text-blue-400" /> Image URL
                            </label>
                            <input
                                type="url"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                placeholder="https://images.unsplash.com/..."
                            />
                        </div>

                        {/* Buttons section */}
                        <div className="flex gap-4 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const defaultModel = MODELS[formData.vehicleType][0];
                                    setFormData({ 
                                        name: defaultModel, 
                                        vehicleType: formData.vehicleType, 
                                        licensePlate: '', 
                                        status: 'Available', 
                                        imageUrl: DEFAULT_IMAGES[defaultModel] 
                                    });
                                    toast.success('Form cleared!', { duration: 1000 });
                                }}
                                className="flex-1 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-gray-300 font-bold py-3 px-4 rounded-xl transition duration-200 active:scale-[0.98] uppercase tracking-wider text-xs cursor-pointer"
                            >
                                Clear Form
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] text-white font-black py-3 px-4 rounded-xl transition duration-200 disabled:opacity-50 active:scale-[0.98] uppercase tracking-wider text-xs cursor-pointer"
                            >
                                {loading ? 'Adding...' : 'Add Vehicle to Fleet'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Live Premium Preview Card */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-yellow-500" /> Live Holographic Preview
                    </div>
                    
                    <div className="relative overflow-hidden bg-gradient-to-b from-[#142030]/90 to-[#0d1621]/90 border border-white/[0.08] rounded-[22px] p-5 shadow-[0_15px_30px_rgba(0,0,0,0.5)] group">
                        {/* Screws */}
                        <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-gray-500/30"></div>
                        <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-gray-500/30"></div>
                        <div className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-gray-500/30"></div>
                        <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-gray-500/30"></div>

                        {/* Image Container with Neon Glow Ring */}
                        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/[0.08] shadow-inner bg-[#0b111a] mb-5">
                            {formData.imageUrl ? (
                                <img 
                                    src={formData.imageUrl} 
                                    alt={formData.name} 
                                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.src = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80";
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-2 bg-[#090e15]">
                                    <ImageIcon className="h-8 w-8 text-gray-600 animate-pulse" />
                                    <span className="text-xs font-medium">No image provided</span>
                                </div>
                            )}
                            {/* Glassmorphic category pill */}
                            <span className="absolute top-3 left-3 px-3 py-1 bg-[#0d1420]/80 backdrop-blur-md border border-white/[0.1] rounded-lg text-[10px] font-bold text-blue-400 uppercase tracking-widest shadow-md">
                                {formData.vehicleType}
                            </span>
                            
                            {/* Neon Available pill */}
                            <span className="absolute top-3 right-3 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[10px] font-bold text-emerald-400 uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                Available
                            </span>
                        </div>

                        {/* Vehicle Title & License Plate */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-black text-white tracking-wide font-title uppercase">
                                        {formData.name || 'New Vehicle'}
                                    </h3>
                                    <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-0.5">
                                        RENO-CLASS FLEET
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-mono font-bold tracking-wider shadow-sm">
                                        {formData.licensePlate || 'PLATE-PENDING'}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Decorative Tech Specs Divider */}
                            <div className="pt-3 border-t border-white/[0.05] grid grid-cols-3 gap-2 text-center">
                                <div className="px-2 py-1.5 bg-[#0d1420]/40 rounded-lg border border-white/[0.03]">
                                    <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Fuel Type</div>
                                    <div className="text-xs text-slate-300 font-semibold mt-0.5">Petrol/Diesel</div>
                                </div>
                                <div className="px-2 py-1.5 bg-[#0d1420]/40 rounded-lg border border-white/[0.03]">
                                    <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Transmission</div>
                                    <div className="text-xs text-slate-300 font-semibold mt-0.5">Automatic</div>
                                </div>
                                <div className="px-2 py-1.5 bg-[#0d1420]/40 rounded-lg border border-white/[0.03]">
                                    <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Capacity</div>
                                    <div className="text-xs text-slate-300 font-semibold mt-0.5">
                                        {formData.vehicleType === 'Car' ? '5-7 Seats' : '30-45 Seats'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddVehicle;
