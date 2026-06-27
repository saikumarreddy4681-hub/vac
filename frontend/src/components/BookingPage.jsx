import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
    CalendarCheck, User, Mail, Calendar as CalendarIcon, MapPin, 
    DollarSign, Bot, ArrowRight, ShieldCheck, Clock, ShieldAlert,
    CheckCircle2, Sparkles, UserCheck, HelpCircle, AlertTriangle, Send, X
} from 'lucide-react';
import Input from './ui/Input';
import Button from './ui/Button';

const LOCATIONS = [
    "Delhi", "Mumbai", "Hyderabad", "Bangalore", "Chennai", "Kolkata", "Pune", "Goa", "Jaipur", "Ahmedabad"
];

const HUB_COORDS = {
    "Delhi": { name: 'Delhi', x: 44, y: 28, region: 'North' },
    "Mumbai": { name: 'Mumbai', x: 27, y: 60, region: 'West' },
    "Hyderabad": { name: 'Hyderabad', x: 46, y: 68, region: 'South' },
    "Bangalore": { name: 'Bangalore', x: 42, y: 80, region: 'South' },
    "Chennai": { name: 'Chennai', x: 52, y: 83, region: 'South' },
    "Kolkata": { name: 'Kolkata', x: 75, y: 47, region: 'East' },
    "Pune": { name: 'Pune', x: 30, y: 64, region: 'West' },
    "Goa": { name: 'Goa', x: 29, y: 74, region: 'West' },
    "Jaipur": { name: 'Jaipur', x: 36, y: 36, region: 'North' },
    "Ahmedabad": { name: 'Ahmedabad', x: 24, y: 48, region: 'West' }
};

const ALL_HUBS = [
    { id: 'delhi', name: 'Delhi', x: 44, y: 28, region: 'North' },
    { id: 'mumbai', name: 'Mumbai', x: 27, y: 60, region: 'West' },
    { id: 'hyderabad', name: 'Hyderabad', x: 46, y: 68, region: 'South' },
    { id: 'bangalore', name: 'Bangalore', x: 42, y: 80, region: 'South' },
    { id: 'chennai', name: 'Chennai', x: 52, y: 83, region: 'South' },
    { id: 'kolkata', name: 'Kolkata', x: 75, y: 47, region: 'East' },
    { id: 'pune', name: 'Pune', x: 30, y: 64, region: 'West' },
    { id: 'goa', name: 'Goa', x: 29, y: 74, region: 'West' },
    { id: 'jaipur', name: 'Jaipur', x: 36, y: 36, region: 'North' },
    { id: 'ahmedabad', name: 'Ahmedabad', x: 24, y: 48, region: 'West' }
];

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

const BookingPage = () => {
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [formData, setFormData] = useState({
        vehicleId: '',
        customerName: '',
        customerEmail: '',
        startDate: '',
        endDate: '',
        pickupLocation: 'Hyderabad',
        dropLocation: 'Mumbai',
        driverId: ''
    });
    
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    
    // AI Suggestion State
    const [aiSuggestions, setAiSuggestions] = useState(null);
    const [checkingAI, setCheckingAI] = useState(false);
    const [aiChat, setAiChat] = useState([]);

    // Map states
    const [hoveredHub, setHoveredHub] = useState(null);

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentEmail, setPaymentEmail] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi'); // 'upi' | 'cash'
    const [upiId, setUpiId] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle' | 'success' | 'failed'
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [paymentResult, setPaymentResult] = useState(null);
    const [paymentData, setPaymentData] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vehiclesRes, driversRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/vehicles'),
                    axios.get('http://localhost:5000/api/drivers/available')
                ]);
                setVehicles(vehiclesRes.data);
                setDrivers(driversRes.data);
            } catch (err) {
                console.error("Error fetching booking form data:", err);
            }
        };
        fetchData();
    }, []);

    // AI Assistant auto-analysis
    useEffect(() => {
        let isSubscribed = true;

        const analyzeForm = async () => {
            const { vehicleId, startDate, endDate, pickupLocation, dropLocation, driverId } = formData;
            if (!vehicleId) {
                if (isSubscribed) {
                    setAiChat([
                        { text: '✈️ Best option for airport transfer.', type: 'suggestion', action: 'airport' },
                        { text: '💡 Recommended for city travel', type: 'suggestion', action: 'city' },
                        { text: '💰 Low cost vehicle available!', type: 'suggestion', action: 'low_cost' },
                        { text: '🚌 More seating capacity recommended', type: 'suggestion', action: 'bus' }
                    ]);
                    setAiSuggestions(null);
                }
                return;
            }

            const selectedVehicle = vehicles.find(v => (v._id || v.id)?.toString() === vehicleId?.toString());
            if (!selectedVehicle) return;

            if (isSubscribed) {
                setCheckingAI(true);
                setAiSuggestions(null);
            }

            let chatFlow = [{ text: `AI is checking availability...`, type: 'info' }];
            if (isSubscribed) setAiChat([...chatFlow]);

            let hasDates = startDate && endDate;
            let actualStatus = selectedVehicle.status;

            if (hasDates) {
                try {
                    await axios.post('http://localhost:5000/api/bookings/check-conflict', {
                        vehicleId, startDate, endDate
                    });
                    actualStatus = 'Available';
                } catch (err) {
                    if (err.response && err.response.status === 409) {
                        actualStatus = 'Conflict';
                        try {
                            const res = await axios.get(`http://localhost:5000/api/vehicles/smart-suggest`, {
                                params: { vehicleId, vehicleType: selectedVehicle.vehicleType, startDate, endDate }
                            });
                            if (isSubscribed) setAiSuggestions(res.data.aiSuggestions);
                        } catch (e) {
                            console.error("Smart suggest error:", e);
                        }
                    }
                }
            }

            try {
                const response = await fetch("http://localhost:5000/api/ai-assistant", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        vehicle: selectedVehicle.name,
                        pickup: pickupLocation,
                        drop: dropLocation,
                        startDate: startDate,
                        endDate: endDate
                    })
                });

                const data = await response.json();
                chatFlow = [{ text: data.message, type: 'info' }];

                if (pickupLocation.includes("Airport") || dropLocation.includes("Airport")) {
                    chatFlow.push({ text: '✈️ Best option for airport transfer.', type: 'suggestion', action: 'airport' });
                }
                if (driverId) {
                    chatFlow.push({ text: '👨‍✈️ Vehicle with driver available and selected.', type: 'suggestion', action: 'driver' });
                }
                if (selectedVehicle.vehicleType === 'Car') {
                    chatFlow.push({ text: '💡 Recommended for city travel', type: 'suggestion', action: 'city' });
                    chatFlow.push({ text: '💰 Low cost vehicle available!', type: 'suggestion', action: 'low_cost' });
                } else if (selectedVehicle.vehicleType === 'Bus') {
                    chatFlow.push({ text: '🚌 More seating capacity recommended', type: 'suggestion', action: 'bus' });
                }

                if (isSubscribed) setAiChat(chatFlow);
            } catch (err) {
                console.error("AI API Error:", err);
                chatFlow = [{ text: "AI service unavailable. Please try again.", type: 'error' }];
                if (isSubscribed) setAiChat(chatFlow);
            }

            if (isSubscribed) setCheckingAI(false);
        };

        analyzeForm();
        return () => { isSubscribed = false; };
    }, [formData.vehicleId, formData.startDate, formData.endDate, formData.pickupLocation, formData.dropLocation, formData.driverId, vehicles]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAction = (actionType) => {
        if (actionType === 'airport') {
            const innova = vehicles.find(v => v.name.includes("Innova") || v.vehicleType === 'Car');
            setFormData(prev => ({ 
                ...prev, 
                pickupLocation: LOCATIONS[0], 
                vehicleId: innova ? (innova._id || innova.id) : prev.vehicleId
            }));
            toast.success("Applied: Airport route configuration ✈️");
        } else if (actionType === 'city') {
            const swift = vehicles.find(v => v.name.includes("Swift") || v.vehicleType === 'Car');
            setFormData(prev => ({ 
                ...prev, 
                dropLocation: LOCATIONS[2], 
                vehicleId: swift ? (swift._id || swift.id) : prev.vehicleId 
            }));
            toast.success("Applied: City travel configuration 💡");
        } else if (actionType === 'low_cost') {
            const car = vehicles.find(v => v.vehicleType === 'Car');
            setFormData(prev => ({ 
                ...prev, 
                vehicleId: car ? (car._id || car.id) : prev.vehicleId 
            }));
            toast.success("Applied: Economy fleet option 💰");
        } else if (actionType === 'bus') {
            const bus = vehicles.find(v => v.vehicleType === 'Bus');
            setFormData(prev => ({ 
                ...prev, 
                vehicleId: bus ? (bus._id || bus.id) : prev.vehicleId 
            }));
            toast.success("Applied: Bus fleet option 🚌");
        } else if (actionType === 'driver') {
            setFormData(prev => ({ 
                ...prev, 
                driverId: drivers.length > 0 ? (drivers[0]._id || drivers[0].id) : prev.driverId 
            }));
            toast.success("Applied: Assigned driver support 👨‍✈️");
        }
    };

    const getEstimatedPrice = () => {
        if (!formData.vehicleId || !formData.startDate || !formData.endDate) return 0;
        const vehicle = vehicles.find(v => (v._id || v.id)?.toString() === formData.vehicleId?.toString());
        if (!vehicle) return 0;
        
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;
        
        const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;
        
        let dailyRate = 5000; // standard in INR
        if (vehicle.vehicleType === 'Car') dailyRate = 5000;
        else if (vehicle.vehicleType === 'Bus') dailyRate = 15000;
        
        return dailyRate * diffDays;
    };

    const fetchSmartSuggestions = async (vId, type, start, end) => {
        setCheckingAI(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/vehicles/smart-suggest`, {
                params: { vehicleId: vId, vehicleType: type, startDate: start, endDate: end }
            });
            setAiSuggestions(res.data.aiSuggestions);
        } catch (err) {
            console.error("Error fetching AI suggestions:", err);
        } finally {
            setCheckingAI(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        
        let currentChat = [...aiChat];
        let missing = [];
        if (!formData.vehicleId) missing.push("Vehicle");
        if (!formData.customerName) missing.push("Customer Name");
        if (!formData.customerEmail) missing.push("Email");
        if (!formData.startDate) missing.push("Start Date");
        if (!formData.endDate) missing.push("End Date");

        if (missing.length > 0) {
             currentChat.push({ text: `⚠️ Missing fields: ${missing.join(', ')}`, type: 'error' });
             setAiChat(currentChat);
             setLoading(false);
             toast.error("Please fill in all required fields.");
             return;
        }

        const selectedVehicle = vehicles.find(v => (v._id || v.id)?.toString() === formData.vehicleId?.toString());

        try {
            // Check for conflict first
            await axios.post('http://localhost:5000/api/bookings/check-conflict', {
                vehicleId: formData.vehicleId,
                startDate: formData.startDate,
                endDate: formData.endDate
            });

            currentChat.push({ text: "🎉 Dates verified. Proceeding to payment...", type: 'success' });
            setAiChat([...currentChat]);

            // Setup payment details
            setPaymentEmail(formData.customerEmail);
            setPaymentData({
                email: formData.customerEmail,
                vehicle: selectedVehicle ? selectedVehicle.name : 'Unknown Vehicle',
                amount: getEstimatedPrice()
            });
            setUpiId('');
            setErrorMessage('');
            setPaymentStatus('idle');
            setPaymentResult(null);
            setShowPaymentModal(true);
        } catch (err) {
            if (err.response && err.response.status === 409) {
                setMessage({ type: 'error', text: err.response.data.message });
                toast.error("Schedule Conflict! Finding alternative options...");
                if (selectedVehicle) {
                    await fetchSmartSuggestions(
                        formData.vehicleId,
                        selectedVehicle.vehicleType,
                        formData.startDate,
                        formData.endDate
                    );
                }
            } else {
                const txt = err.response?.data?.message || 'Failed to verify dates. Please try again.';
                setMessage({ type: 'error', text: txt });
                toast.error(txt);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setPaymentStatus('idle');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!paymentEmail || !emailRegex.test(paymentEmail)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        if (selectedPaymentMethod === 'upi') {
            if (!upiId) {
                setErrorMessage('Enter valid UPI ID');
                return;
            }
            const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
            if (!upiRegex.test(upiId)) {
                setErrorMessage('Enter valid UPI ID');
                return;
            }
        }

        const amountVal = getEstimatedPrice();
        if (!amountVal || amountVal <= 0) {
            setErrorMessage('Invalid billing amount.');
            return;
        }

        setPaymentLoading(true);
        setLoadingText(selectedPaymentMethod === 'upi' ? 'Verifying UPI transaction...' : 'Processing cash booking...');

        try {
            const selectedVehicle = vehicles.find(v => (v._id || v.id)?.toString() === formData.vehicleId?.toString());

            const bookingRes = await axios.post('http://localhost:5000/api/bookings', {
                ...formData,
                customerEmail: paymentEmail,
                paymentMethod: selectedPaymentMethod,
                upiId,
                paymentStatus: 'Completed'
            });

            const { booking, payment } = bookingRes.data;

            setPaymentResult({
                bookingId: booking._id || booking.id,
                vehicleName: selectedVehicle ? selectedVehicle.name : 'Unknown Vehicle',
                vehicleType: selectedVehicle ? selectedVehicle.vehicleType : 'Car',
                customerName: formData.customerName,
                customerEmail: paymentEmail,
                pickupLocation: formData.pickupLocation,
                dropLocation: formData.dropLocation,
                startDate: formData.startDate,
                endDate: formData.endDate,
                paymentMethod: selectedPaymentMethod === 'upi' ? 'UPI' : 'Cash',
                amount: booking.price,
                paymentId: payment ? (payment.transactionId || 'MOCK_PAYMENT') : 'COMPLETED',
                emailStatus: 'Sending confirmation email... ✉️'
            });

            setPaymentStatus('success');
            setAiChat(prev => [
                ...prev, 
                { text: selectedPaymentMethod === 'upi' ? "🎉 Payment successful! Booking confirmed." : "🎉 Cash booking confirmed.", type: 'success' }
            ]);
            setPaymentLoading(false);
            resetForm();
            toast.success("Trip successfully booked! ✅");

            // Trigger direct email sending in the background and reactively update the success modal
            fetch("http://localhost:5000/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: paymentEmail,
                    vehicle: selectedVehicle ? selectedVehicle.name : 'Unknown Vehicle',
                    amount: booking.price,
                    status: "Payment Successful"
                })
            }).then(response => response.json())
              .then(data => {
                  if (data.success) {
                      setPaymentResult(prev => ({
                          ...prev,
                          emailStatus: 'Confirmation email sent ✅'
                      }));
                      console.log("[BACKGROUND EMAIL] Direct confirmation email sent successfully.");
                  } else {
                      setPaymentResult(prev => ({
                          ...prev,
                          emailStatus: `Email delivery failed: ${data.error || 'SMTP Error'}`
                      }));
                      console.error("[BACKGROUND EMAIL] Direct confirmation email failed:", data.error);
                  }
              })
              .catch(err => {
                  setPaymentResult(prev => ({
                      ...prev,
                      emailStatus: `Email delivery failed: ${err.message || 'Network Error'}`
                  }));
                  console.error("[BACKGROUND EMAIL] Direct email error:", err);
              });

        } catch (err) {
            console.error("Payment flow error:", err);
            setErrorMessage(err.response?.data?.message || 'Transaction failed. Please try again.');
            setPaymentStatus('failed');
            setPaymentLoading(false);
            toast.error("Payment failed. Please try again.");
        }
    };

    const resetForm = async () => {
        setFormData({
            vehicleId: '',
            customerName: '',
            customerEmail: '',
            startDate: '',
            endDate: '',
            pickupLocation: 'Hyderabad',
            dropLocation: 'Mumbai',
            driverId: ''
        });

        try {
            const [vehiclesRes, driversRes] = await Promise.all([
                axios.get('http://localhost:5000/api/vehicles'),
                axios.get('http://localhost:5000/api/drivers/available')
            ]);
            setVehicles(vehiclesRes.data);
            setDrivers(driversRes.data);
        } catch (e) {
            console.error("Error refreshing data:", e);
        }
    };

    const handleApplyAlternateVehicle = (altVehicleId) => {
        setFormData(prev => ({ ...prev, vehicleId: altVehicleId }));
        setAiSuggestions(null);
        toast.success("Switched to AI recommended available vehicle! 🚗");
    };

    const handleApplyAlternateDates = (altDates) => {
        setFormData(prev => ({ ...prev, startDate: altDates.startDate, endDate: altDates.endDate }));
        setAiSuggestions(null);
        toast.success("Adjusted booking dates to AI recommended slot! 📅");
    };

    const selectedVehicleData = formData.vehicleId ? vehicles.find(v => (v._id || v.id)?.toString() === formData.vehicleId?.toString()) : null;

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto px-2">
                
                {/* Form Pane (Left 8 Columns) */}
                <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 sm:p-8 shadow-[0_15px_35px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-[15px] lg:col-span-8 flex flex-col gap-6">
                    <Screws />
                    
                    <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4 relative z-10">
                        <CalendarCheck className="h-7 w-7 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse" />
                        <h2 className="text-xl font-black text-white tracking-wide font-title uppercase">Book a Vehicle</h2>
                    </div>

                    {message.text && (
                        <div className={`p-4 rounded-xl border relative z-10 text-xs font-bold uppercase tracking-wider flex items-center gap-2
                            ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                              message.type === 'info' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                            {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Select Fleet Vehicle</label>
                                <select 
                                    name="vehicleId"
                                    value={formData.vehicleId}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#0d1420]/85 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200 font-bold uppercase tracking-wide"
                                >
                                    <option value="" className="bg-[#121b28]">-- Choose a Vehicle --</option>
                                    <optgroup label="🚗 Cars" className="bg-[#121b28]">
                                        {vehicles.filter(v => v.vehicleType === 'Car').map(v => (
                                            <option key={v._id || v.id} value={v._id || v.id} className="bg-[#121b28]">{v.name} ({v.licensePlate})</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="🚌 Buses" className="bg-[#121b28]">
                                        {vehicles.filter(v => v.vehicleType === 'Bus').map(v => (
                                            <option key={v._id || v.id} value={v._id || v.id} className="bg-[#121b28]">{v.name} ({v.licensePlate})</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Assign Driver (Optional)</label>
                                <select 
                                    name="driverId"
                                    value={formData.driverId}
                                    onChange={handleChange}
                                    className="w-full bg-[#0d1420]/85 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200 font-bold uppercase tracking-wide"
                                >
                                    <option value="" className="bg-[#121b28]">-- Self Drive (No Driver) --</option>
                                    {drivers.map(d => (
                                        <option key={d._id || d.id} value={d._id || d.id} className="bg-[#121b28]">{d.name} ({d.licenseNumber})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Dynamic Vehicle Preview Section */}
                        <div className={`transition-all duration-550 ease-in-out overflow-hidden ${selectedVehicleData ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            {selectedVehicleData && (
                                <div className="bg-[#0b111a]/40 border border-white/[0.05] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
                                    <div className="w-full md:w-1/3 h-28 rounded-xl overflow-hidden shrink-0 shadow-inner border border-white/[0.08] bg-[#0b111a]">
                                        <img 
                                            src={selectedVehicleData.imageUrl || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format'} 
                                            alt={selectedVehicleData.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="w-full md:w-2/3 flex flex-col justify-between h-full space-y-3">
                                        <div>
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-base font-black text-white tracking-wide uppercase font-title">{selectedVehicleData.name}</h3>
                                                <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm
                                                    ${selectedVehicleData.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                                      selectedVehicleData.status === 'Maintenance' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                                                      'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                                    {selectedVehicleData.status}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-wider">{selectedVehicleData.licensePlate} • {selectedVehicleData.vehicleType}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-4 pt-2.5 border-t border-white/[0.03] text-xs font-semibold text-gray-400">
                                            <div>
                                                <span className="text-[9px] text-gray-550 block uppercase tracking-wider">Seats</span>
                                                <span className="text-slate-200 font-bold font-mono">{selectedVehicleData.vehicleType === 'Bus' ? '40 Seats' : '5 Seats'}</span>
                                            </div>
                                            <div className="border-l pl-4 border-white/[0.05]">
                                                <span className="text-[9px] text-gray-550 block uppercase tracking-wider">Fuel Type</span>
                                                <span className="text-slate-200 font-bold font-mono">{selectedVehicleData.vehicleType === 'Bus' ? 'Diesel' : 'Petrol'}</span>
                                            </div>
                                            <div className="border-l pl-4 border-white/[0.05]">
                                                <span className="text-[9px] text-gray-550 block uppercase tracking-wider">Price / Day</span>
                                                <span className="text-blue-400 font-extrabold font-mono">₹{selectedVehicleData.vehicleType === 'Bus' ? '15,000' : '5,000'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Customer Name</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 h-4.5 w-4.5" />
                                    <input
                                        type="text"
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleChange}
                                        required
                                        placeholder="John Doe"
                                        className="pl-10 pr-4 py-3 w-full rounded-xl border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs transition bg-[#0d1420]/80 text-white placeholder-gray-550"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Customer Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 h-4.5 w-4.5" />
                                    <input
                                        type="email"
                                        name="customerEmail"
                                        value={formData.customerEmail}
                                        onChange={handleChange}
                                        required
                                        placeholder="john@example.com"
                                        className="pl-10 pr-4 py-3 w-full rounded-xl border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs transition bg-[#0d1420]/80 text-white placeholder-gray-550"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5 text-blue-400" /> Pickup Location
                                </label>
                                <select
                                    name="pickupLocation"
                                    value={formData.pickupLocation}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#0d1420]/85 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200 font-bold"
                                >
                                    {LOCATIONS.map(loc => (
                                        <option key={loc} value={loc} className="bg-[#121b28]">{loc}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5 text-blue-400" /> Drop Location
                                </label>
                                <select
                                    name="dropLocation"
                                    value={formData.dropLocation}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#0d1420]/85 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200 font-bold"
                                >
                                    {LOCATIONS.map(loc => (
                                        <option key={loc} value={loc} className="bg-[#121b28]">{loc}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-1">
                                    <CalendarIcon className="h-3.5 w-3.5 text-blue-400" /> Start Date
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200 font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-1">
                                    <CalendarIcon className="h-3.5 w-3.5 text-blue-400" /> End Date
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200 font-mono"
                                />
                            </div>
                        </div>

                        {getEstimatedPrice() > 0 && (
                            <div className="bg-[#0b111a]/55 border border-white/[0.05] rounded-2xl p-5 flex justify-between items-center shadow-inner">
                                <div>
                                    <span className="text-[9px] text-gray-500 block uppercase tracking-wider font-bold">Estimated Invoice Total</span>
                                    <span className="text-xl font-black text-white flex items-center mt-1 font-mono">
                                        <span className="text-emerald-400 mr-0.5">₹</span>{getEstimatedPrice().toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-[10px] text-gray-500 text-right font-medium leading-relaxed uppercase tracking-wider">
                                    Tax & fuel charge included.<br />
                                    Billed on verification approval.
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] text-white font-black py-3 px-4 rounded-xl transition duration-200 active:scale-[0.98] uppercase tracking-wider text-xs cursor-pointer"
                        >
                            {loading ? 'Processing Schedule...' : 'Proceed to Payment Gate'}
                        </button>
                    </form>
                </div>

                {/* AI Assistant Pane (Right 4 Columns) */}
                <div className="relative overflow-hidden bg-gradient-to-b from-[#181331] to-[#0e0b1f] border border-violet-500/25 rounded-[18px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-[15px] lg:col-span-4 flex flex-col justify-between h-[650px]">
                    <Screws />
                    
                    <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
                        {/* Title block */}
                        <div className="flex items-center gap-3 border-b border-violet-500/20 pb-4 shrink-0">
                            <div className="p-2 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-white tracking-wide uppercase font-title">AI Assistant Layer</h3>
                                <span className="text-[9px] text-violet-400 font-black tracking-widest uppercase">Smart Fleet Recommendations</span>
                            </div>
                        </div>

                        {/* Message log feed */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 my-5 custom-scrollbar">
                            {!aiChat.length && !checkingAI && (
                                <div className="text-violet-300 text-xs space-y-4 py-4 font-medium">
                                    <p className="leading-relaxed">Awaiting rental schedule selections to launch real-time optimization...</p>
                                    <div className="flex items-start gap-2.5 bg-violet-950/20 border border-violet-500/10 p-4 rounded-xl shadow-inner">
                                        <ShieldCheck className="h-4.5 w-4.5 text-violet-400 shrink-0 mt-0.5" />
                                        <span className="leading-relaxed">The AI recommendation layer dynamically scans availability tables to prevent conflict events.</span>
                                    </div>
                                </div>
                            )}
                            
                            {aiChat.map((msg, idx) => (
                                msg.action ? (
                                    <button 
                                        key={idx} 
                                        type="button"
                                        onClick={() => handleAction(msg.action)}
                                        className="w-full text-left p-3.5 rounded-xl text-xs border transition-all cursor-pointer hover:bg-violet-500/10 hover:scale-[1.01] bg-violet-500/5 border-violet-500/20 text-violet-200 group block relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-center relative z-10">
                                            <span className="font-semibold">{msg.text}</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-violet-600 border border-violet-500 px-2.5 py-1 rounded-lg text-white font-medium transition-all duration-200 group-hover:bg-violet-500 shadow-sm flex items-center gap-1">
                                                <span>Apply</span>
                                                <ArrowRight className="h-3 w-3" />
                                            </span>
                                        </div>
                                    </button>
                                ) : (
                                    <div key={idx} className={`p-3.5 rounded-xl text-xs border leading-relaxed
                                        ${msg.type === 'error' ? 'bg-rose-500/5 border-rose-500/20 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.05)]' :
                                          msg.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.05)]' :
                                          'bg-[#0d1420]/40 border-white/[0.03] text-violet-200 shadow-inner'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                )
                            ))}

                            {checkingAI && (
                                <div className="flex items-center gap-2 p-3.5 bg-violet-500/5 border border-violet-500/10 rounded-xl text-violet-300 text-xs font-semibold uppercase tracking-wider">
                                    <Clock className="h-3.5 w-3.5 animate-spin text-violet-400" /> Analysing Fleet...
                                </div>
                            )}

                            {/* Smart alternates suggestions cards */}
                            {aiSuggestions && (
                                <div className="space-y-4 mt-3 pt-3 border-t border-violet-500/10">
                                    {aiSuggestions.recommendedAlternateDates && (
                                        <div className="bg-violet-500/5 border border-violet-500/20 p-3.5 rounded-xl space-y-3">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-violet-400 block">Alternate Booking Period</span>
                                            <p className="text-xs text-violet-200">
                                                Available slot: <strong className="text-white font-mono">{aiSuggestions.recommendedAlternateDates.startDate} to {aiSuggestions.recommendedAlternateDates.endDate}</strong>
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => handleApplyAlternateDates(aiSuggestions.recommendedAlternateDates)}
                                                className="w-full py-2 bg-gradient-to-b from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 border border-violet-500/20 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all cursor-pointer shadow-sm active:scale-95"
                                            >
                                                Apply Dates
                                            </button>
                                        </div>
                                    )}

                                    {aiSuggestions.alternates && aiSuggestions.alternates.length > 0 && (
                                        <div className="bg-violet-500/5 border border-violet-500/20 p-3.5 rounded-xl space-y-3">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-violet-400 block">Available Fleet Alternatives</span>
                                            <div className="space-y-2">
                                                {aiSuggestions.alternates.map(alt => (
                                                    <div key={alt._id || alt.id} className="flex justify-between items-center p-2.5 rounded-lg bg-[#0d1420]/60 border border-white/[0.04] text-xs">
                                                        <div>
                                                            <span className="font-bold text-slate-100 block">{alt.name}</span>
                                                            <span className="text-[10px] text-gray-500 font-mono uppercase mt-0.5 block">{alt.vehicleType}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApplyAlternateVehicle(alt._id || alt.id)}
                                                            className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-[10px] font-black uppercase tracking-wider rounded-lg transition text-white cursor-pointer active:scale-95 border border-violet-500/20 shadow-sm"
                                                        >
                                                            Select
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="shrink-0 border-t border-violet-550/10 pt-3 text-center text-[9px] text-violet-400 font-black tracking-widest uppercase relative z-10">
                        AI recommend engine active
                    </div>
                </div>
            </div>

            {/* National Booking Corridor Map */}
            {(() => {
                const pickupHub = HUB_COORDS[formData.pickupLocation] || ALL_HUBS[0];
                const dropHub = HUB_COORDS[formData.dropLocation] || ALL_HUBS[1];
                const isSameHub = pickupHub.name === dropHub.name;
                const midX = (pickupHub.x + dropHub.x) / 2;
                const midY = (pickupHub.y + dropHub.y) / 2 - 12; // Curvature offset
                const routePath = `M ${pickupHub.x} ${pickupHub.y} Q ${midX} ${midY} ${dropHub.x} ${dropHub.y}`;

                // Background corridors: Delhi-Mumbai, Mumbai-Bangalore, Bangalore-Chennai, Delhi-Kolkata
                const getHubCoordsByName = (name) => ALL_HUBS.find(h => h.name === name) || { x: 50, y: 50 };
                const delhi = getHubCoordsByName('Delhi');
                const mumbai = getHubCoordsByName('Mumbai');
                const bangalore = getHubCoordsByName('Bangalore');
                const chennai = getHubCoordsByName('Chennai');
                const kolkata = getHubCoordsByName('Kolkata');

                const bgCorridors = [
                    { from: delhi, to: mumbai, id: 'delhi-mumbai' },
                    { from: mumbai, to: bangalore, id: 'mumbai-bangalore' },
                    { from: bangalore, to: chennai, id: 'bangalore-chennai' },
                    { from: delhi, to: kolkata, id: 'delhi-kolkata' }
                ];

                const getHubTelemetry = (hubName) => {
                    const hash = hubName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    const totalVehicles = vehicles.length;
                    if (totalVehicles === 0) return { available: 3, booked: 2 };
                    
                    const allocated = vehicles.filter((_, idx) => (idx + hash) % 17 === 0);
                    const available = allocated.filter(v => v.status === 'Available').length;
                    const booked = allocated.filter(v => v.status === 'Booked').length;
                    
                    return {
                        available: allocated.length > 0 ? available : (hash % 4) + 1,
                        booked: allocated.length > 0 ? booked : (hash % 3)
                    };
                };

                const handleHubClick = (hub) => {
                    if (!formData.pickupLocation || formData.pickupLocation === formData.dropLocation) {
                        setFormData(prev => ({ ...prev, pickupLocation: hub.name }));
                        toast.success(`Selected ${hub.name} as Pickup Location! 📍`);
                    } else {
                        setFormData(prev => ({ ...prev, dropLocation: hub.name }));
                        toast.success(`Selected ${hub.name} as Dropoff Location! 🏁`);
                    }
                };

                const INDIA_PATH = "M 42 12 C 43 10, 42 8, 44 8 C 45 8, 45 9, 46 9 C 47 9, 48 8, 49 10 C 50 11, 49 13, 50 14 C 51 14, 52 13, 53 14 C 54 15, 52 16, 52 17 C 52 18, 54 18, 54 19 C 54 20, 52 21, 52 22 C 52 23, 54 24, 54 25 C 53 26, 51 25, 50 26 C 49 26, 48 27, 49 28 C 49 29, 52 28, 53 30 C 54 31, 56 29, 58 31 C 60 32, 59 34, 61 34 C 62 34, 63 33, 64 34 C 65 35, 63 36, 64 37 C 65 38, 67 36, 69 36 C 71 36, 72 38, 74 38 C 76 38, 76 36, 78 36 C 80 36, 82 38, 84 38 C 86 38, 87 36, 89 36 C 91 36, 92 38, 94 39 C 95 40, 94 42, 93 43 C 91 44, 89 42, 87 43 C 86 44, 85 45, 83 45 C 81 45, 80 44, 78 45 C 77 46, 77 48, 75 49 C 74 50, 75 51, 74 52 C 73 53, 71 52, 70 53 C 68 54, 69 56, 67 57 C 65 58, 64 57, 63 58 C 61 59, 61 61, 59 62 C 58 63, 57 65, 56 67 C 55 69, 55 72, 53 74 C 52 76, 52 79, 51 81 C 50 83, 50 86, 49 88 C 48 90, 49 93, 48 95 C 47 96, 46 95, 45 94 C 44 93, 44 90, 43 88 C 42 86, 42 83, 41 81 C 40 79, 39 77, 37 76 C 36 75, 34 74, 32 73 C 30 71, 29 69, 28 67 C 27 65, 27 62, 26 60 C 25 58, 23 57, 21 57 C 19 57, 17 56, 15 55 C 13 54, 11 52, 12 50 C 13 49, 15 49, 17 49 C 19 49, 20 50, 22 50 C 24 50, 25 48, 26 47 C 26 46, 25 44, 24 43 C 23 42, 21 42, 20 41 C 19 40, 20 38, 21 37 C 22 36, 24 37, 26 36 C 27 35, 27 33, 29 32 C 30 31, 31 32, 32 31 C 33 30, 33 28, 35 27 C 36 26, 36 24, 37 22 C 38 21, 37 19, 38 17 C 39 16, 40 14, 42 12 Z";

                return (
                    <div className="relative overflow-hidden bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-[18px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-[15px] lg:col-span-12 mt-8">
                        <Screws />
                        <div className="flex flex-col lg:flex-row justify-between items-stretch gap-8 relative z-10">
                            
                            {/* Left: Dynamic India SVG Map */}
                            <div className="w-full lg:w-3/5 flex flex-col relative">
                                <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white tracking-wide font-title uppercase">National Booking Corridor</h3>
                                        <p className="text-xs text-gray-555 font-mono uppercase tracking-widest mt-1 font-bold">Interactive Fleet Dispatch Grid</p>
                                    </div>
                                    <div className="flex items-center gap-3 self-end sm:self-start">
                                        <div className="flex items-center gap-2 bg-[#0b111a]/85 border border-white/[0.05] p-2 rounded-xl">
                                            <div className="text-right">
                                                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider block leading-none">PICKUP</span>
                                                <span className="text-[11px] font-black text-emerald-400 font-mono uppercase leading-none">{formData.pickupLocation}</span>
                                            </div>
                                            <div className="text-gray-600 font-bold text-xs">→</div>
                                            <div className="text-left">
                                                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider block leading-none">DROP</span>
                                                <span className="text-[11px] font-black text-blue-400 font-mono uppercase leading-none">{formData.dropLocation}</span>
                                            </div>
                                        </div>
                                        <span className="px-2.5 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/25 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider h-fit">
                                            10 Active Hubs
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="relative bg-[#0b111a]/40 border border-white/[0.04] rounded-2xl p-4 flex items-center justify-center h-[380px] overflow-hidden">
                                    <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                                    
                                    <svg className="w-full h-full max-h-[340px]" viewBox="0 0 100 100">
                                        <defs>
                                            <pattern id="booking-map-cyber-grid" width="3" height="3" patternUnits="userSpaceOnUse">
                                                <circle cx="1.5" cy="1.5" r="0.5" fill="rgba(59, 130, 246, 0.15)" />
                                            </pattern>
                                            <filter id="booking-map-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                                                <feGaussianBlur stdDeviation="1.2" result="blur" />
                                                <feMerge>
                                                    <feMergeNode in="blur" />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>
                                            <filter id="marker-glow" x="-30%" y="-30%" width="160%" height="160%">
                                                <feGaussianBlur stdDeviation="1" result="blur" />
                                                <feMerge>
                                                    <feMergeNode in="blur" />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>
                                        </defs>

                                        {/* India Path Outline */}
                                        <path 
                                            d={INDIA_PATH}
                                            fill="url(#booking-map-cyber-grid)"
                                            stroke="#1e3a8a"
                                            strokeWidth="0.8"
                                        />
                                        <path 
                                            d={INDIA_PATH}
                                            fill="none"
                                            stroke="#3b82f6"
                                            strokeWidth="1.2"
                                            filter="url(#booking-map-neon-glow)"
                                            className="opacity-60"
                                        />

                                        {/* Render Background Corridors */}
                                        {bgCorridors.map((c) => {
                                            const cMidX = (c.from.x + c.to.x) / 2;
                                            const cMidY = (c.from.y + c.to.y) / 2 - 10;
                                            const cPath = `M ${c.from.x} ${c.from.y} Q ${cMidX} ${cMidY} ${c.to.x} ${c.to.y}`;
                                            return (
                                                <g key={c.id}>
                                                    <path 
                                                        d={cPath} 
                                                        fill="none" 
                                                        stroke="rgba(59, 130, 246, 0.12)" 
                                                        strokeWidth="0.8" 
                                                        strokeDasharray="2 2" 
                                                    />
                                                    <circle r="0.6" fill="#3b82f6" opacity="0.6">
                                                        <animateMotion dur="6s" repeatCount="indefinite" path={cPath} />
                                                    </circle>
                                                </g>
                                            );
                                        })}

                                        {/* Dynamic Active Transit Routing Arc */}
                                        {!isSameHub ? (
                                            <>
                                                <path 
                                                    d={routePath} 
                                                    fill="none" 
                                                    stroke="url(#route-gradient)" 
                                                    strokeWidth="1.6" 
                                                    filter="url(#booking-map-neon-glow)"
                                                    className="opacity-90"
                                                />
                                                <path 
                                                    d={routePath} 
                                                    fill="none" 
                                                    stroke="#60a5fa" 
                                                    strokeWidth="0.8" 
                                                    strokeDasharray="3 3" 
                                                    className="opacity-70"
                                                />
                                                {/* Animated vehicle dot moving from pickup to drop */}
                                                <circle r="1.5" fill="#ffffff" filter="url(#booking-map-neon-glow)">
                                                    <animateMotion dur="3.5s" repeatCount="indefinite" path={routePath} />
                                                </circle>
                                                
                                                {/* Gradient definition */}
                                                <defs>
                                                    <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="#10b981" />
                                                        <stop offset="100%" stopColor="#3b82f6" />
                                                    </linearGradient>
                                                </defs>
                                            </>
                                        ) : (
                                            /* Local radar sweep at the shared hub */
                                            <circle 
                                                cx={pickupHub.x} 
                                                cy={pickupHub.y} 
                                                r="6" 
                                                fill="transparent" 
                                                stroke="#10b981" 
                                                strokeWidth="0.5" 
                                                className="animate-ping"
                                                style={{ transformOrigin: `${pickupHub.x}px ${pickupHub.y}px` }}
                                            />
                                        )}

                                        {/* Render All 17 Hubs */}
                                        {ALL_HUBS.map((hub) => {
                                            const isPickup = pickupHub.name === hub.name;
                                            const isDrop = dropHub.name === hub.name;
                                            const isHighlight = isPickup || isDrop;
                                            const isHovered = hoveredHub?.name === hub.name;

                                            return (
                                                <g 
                                                    key={hub.id}
                                                    onMouseEnter={() => setHoveredHub(hub)}
                                                    onMouseLeave={() => setHoveredHub(null)}
                                                    onClick={() => handleHubClick(hub)}
                                                    className="cursor-pointer"
                                                >
                                                    {/* Glowing background ring */}
                                                    <circle 
                                                        cx={hub.x} 
                                                        cy={hub.y} 
                                                        r={isHighlight ? 5 : isHovered ? 4 : 3} 
                                                        fill="transparent"
                                                        stroke={isPickup ? '#10b981' : isDrop ? '#3b82f6' : 'rgba(59, 130, 246, 0.2)'}
                                                        strokeWidth={0.5}
                                                        className={isHighlight || isHovered ? "animate-pulse" : ""}
                                                    />
                                                    {/* Center Marker dot */}
                                                    <circle 
                                                        cx={hub.x} 
                                                        cy={hub.y} 
                                                        r={isHighlight ? 2.2 : isHovered ? 1.8 : 1.2} 
                                                        fill={isPickup ? '#10b981' : isDrop ? '#3b82f6' : '#94a3b8'} 
                                                        filter={isHighlight || isHovered ? 'url(#marker-glow)' : ''}
                                                    />
                                                </g>
                                            );
                                        })}
                                    </svg>

                                    {/* Glassmorphic Hover / Click Telemetry details popup */}
                                    {hoveredHub && (() => {
                                        const telemetry = getHubTelemetry(hoveredHub.name);
                                        return (
                                            <div 
                                                className="absolute z-35 bg-[#0a121e]/90 backdrop-blur-md border border-white/[0.08] rounded-xl p-3.5 shadow-xl pointer-events-none w-48 flex flex-col gap-1.5 transition-all duration-200"
                                                style={{ 
                                                    left: `${hoveredHub.x > 60 ? hoveredHub.x - 52 : hoveredHub.x + 4}%`, 
                                                    top: `${hoveredHub.y > 60 ? hoveredHub.y - 32 : hoveredHub.y - 12}%` 
                                                }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-black text-white uppercase tracking-wide font-title">{hoveredHub.name}</span>
                                                    <span className="px-1.5 py-0.5 bg-[#0d1420] border border-white/[0.05] rounded text-[8px] font-mono text-gray-500 uppercase font-semibold">{hoveredHub.region}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 border-t border-white/[0.04] pt-1.5 text-[9px]">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-550 font-bold uppercase tracking-wider">Available</span>
                                                        <span className="font-mono font-black text-emerald-400 text-xs mt-0.5">{telemetry.available} vehicles</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-555 font-bold uppercase tracking-wider">Active Booked</span>
                                                        <span className="font-mono font-black text-blue-400 text-xs mt-0.5">{telemetry.booked} rented</span>
                                                    </div>
                                                </div>
                                                <span className="text-[8px] text-gray-550 italic block border-t border-white/[0.04] pt-1.5">Click node to select as location</span>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Right: Corridor Logistics Info Panel */}
                            <div className="w-full lg:w-2/5 flex flex-col justify-between self-stretch bg-[#080d15]/50 border border-white/[0.04] p-6 rounded-2xl">
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black text-white tracking-widest uppercase font-title">Logistics Corridor Analysis</h4>
                                    
                                    <div className="space-y-4">
                                        {/* Pickup hub details card */}
                                        {(() => {
                                            const pickupTelemetry = getHubTelemetry(pickupHub.name);
                                            return (
                                                <div className="p-3.5 bg-[#0d1420]/60 border border-white/[0.04] rounded-xl flex items-center justify-between gap-3">
                                                    <div>
                                                        <span className="text-[8px] font-black text-emerald-450 uppercase tracking-widest block mb-1">Origin Hub (Pickup)</span>
                                                        <span className="text-xs font-bold text-white block">{formData.pickupLocation}</span>
                                                        <span className="text-[10px] text-gray-500 font-mono block mt-0.5">{pickupHub.name} ({pickupHub.region} Zone)</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[8px] text-gray-550 font-black block uppercase">Available</span>
                                                        <span className="text-xs font-black text-emerald-455 font-mono">{pickupTelemetry.available} Presets</span>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Drop hub details card */}
                                        {(() => {
                                            const dropTelemetry = getHubTelemetry(dropHub.name);
                                            return (
                                                <div className="p-3.5 bg-[#0d1420]/60 border border-white/[0.04] rounded-xl flex items-center justify-between gap-3">
                                                    <div>
                                                        <span className="text-[8px] font-black text-blue-455 uppercase tracking-widest block mb-1">Destination Hub (Drop)</span>
                                                        <span className="text-xs font-bold text-white block">{formData.dropLocation}</span>
                                                        <span className="text-[10px] text-gray-550 font-mono block mt-0.5">{dropHub.name} ({dropHub.region} Zone)</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[8px] text-gray-550 font-black block uppercase">Active Rentals</span>
                                                        <span className="text-xs font-black text-blue-455 font-mono">{dropTelemetry.booked} active</span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/[0.05] space-y-3.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-455 font-semibold uppercase tracking-wider">Corridor Status</span>
                                        <span className={`font-mono font-bold uppercase tracking-wider
                                            ${isSameHub ? 'text-emerald-400' : 'text-blue-400 animate-pulse'}`}
                                        >
                                            {isSameHub ? 'Local Hub Routing' : 'Interstate Route Active'}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[10px] text-gray-450 leading-relaxed uppercase tracking-wide">
                                        {isSameHub 
                                            ? 'Both pickup and dropoff points reside inside the same hub coordinates. Local fleet dispatch telemetry active.' 
                                            : `Corridor path mapped successfully. Dynamic GPS transit telemetry running from ${pickupHub.name} to ${dropHub.name}.`}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                );
            })()}

            {/* Payment Verification Popup Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in" role="dialog" aria-modal="true">
                    <div className="relative w-full max-w-md bg-gradient-to-b from-[#142030] to-[#0d1621] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden text-left transform transition-all">
                        <Screws />
                        
                        <div className="bg-[#0d1420]/60 border-b border-white/[0.05] px-6 py-5 relative z-10 flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-bold text-white tracking-wide font-title uppercase">Payment Verification</h3>
                                <p className="text-[10px] text-gray-450 font-mono mt-0.5 uppercase tracking-wider">{selectedPaymentMethod === 'upi' ? 'Secure UPI' : 'Direct Cash'} Gateway</p>
                            </div>
                            {!paymentLoading && paymentStatus !== 'success' && (
                                <button 
                                    onClick={() => setShowPaymentModal(false)}
                                    className="p-1.5 bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.06] rounded-xl text-gray-300 hover:text-white transition cursor-pointer"
                                    aria-label="Close modal"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="p-6 max-h-[80vh] overflow-y-auto relative z-10">
                            {errorMessage && (
                                <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/25 text-rose-450 text-xs font-bold rounded-xl text-center uppercase tracking-wider shadow-sm">
                                    {errorMessage}
                                </div>
                            )}

                            {paymentLoading ? (
                                <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-inner"></div>
                                    <h4 className="text-sm font-bold text-slate-200 animate-pulse uppercase tracking-widest mt-2">{loadingText}</h4>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Please secure connection. Do not close.</p>
                                </div>
                            ) : paymentStatus === 'success' && paymentResult ? (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 mb-3 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                            <CheckCircle2 className="h-7 w-7" />
                                        </div>
                                        <h4 className="text-base font-black text-white uppercase tracking-wider">
                                            {selectedPaymentMethod === 'upi' ? 'Transaction Complete' : 'Cash Booking Logged'}
                                        </h4>
                                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Booking successfully confirmed</p>
                                    </div>

                                    <div className="bg-[#0d1420]/50 rounded-2xl p-5 border border-white/[0.05] space-y-2.5 text-xs text-gray-300">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-semibold">Booking ID:</span>
                                            <span className="font-mono font-bold text-slate-100">{paymentResult.bookingId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-semibold">Customer Name:</span>
                                            <span className="font-bold text-slate-100">{paymentResult.customerName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-semibold">Customer Email:</span>
                                            <span className="font-bold text-slate-100 font-mono">{paymentResult.customerEmail}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-semibold">Vehicle Name:</span>
                                            <span className="font-bold text-slate-100">{paymentResult.vehicleName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-semibold">Pickup:</span>
                                            <span className="font-bold text-slate-100 truncate max-w-[200px]">{paymentResult.pickupLocation}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-semibold">Drop:</span>
                                            <span className="font-bold text-slate-100 truncate max-w-[200px]">{paymentResult.dropLocation}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-semibold">Duration:</span>
                                            <span className="font-bold text-slate-100 font-mono">{paymentResult.startDate} to {paymentResult.endDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-semibold">Payment:</span>
                                            <span className="font-bold text-slate-100 uppercase">{paymentResult.paymentMethod}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-white/[0.05] pt-2.5 mt-1 font-bold text-sm">
                                            <span className="text-gray-400">Total Charged:</span>
                                            <span className="text-emerald-400 font-black font-mono">₹{paymentResult.amount?.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {paymentResult.emailStatus && (
                                        <div className={`p-3.5 rounded-xl text-center text-xs font-semibold border uppercase tracking-wider
                                            ${paymentResult.emailStatus.includes('failed') || paymentResult.emailStatus.includes(' SMTP')
                                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                        }`}>
                                            {paymentResult.emailStatus}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setShowPaymentModal(false)}
                                        className="w-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-gray-300 font-bold py-3 px-4 rounded-xl transition duration-200 text-xs uppercase tracking-wider cursor-pointer active:scale-95"
                                    >
                                        Close Portal
                                    </button>
                                </div>
                            ) : paymentStatus === 'failed' ? (
                                <div className="text-center py-6 space-y-6">
                                    <div className="inline-flex items-center justify-center w-14 h-14 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20 mb-3 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                                        <ShieldAlert className="h-7 w-7" />
                                    </div>
                                    <h4 className="text-base font-black text-white uppercase tracking-wider">Payment Declined</h4>
                                    <p className="text-xs text-gray-450 leading-relaxed uppercase tracking-wide">{errorMessage || 'Your payment transaction could not be processed. Please try again.'}</p>
                                    
                                    <button
                                        onClick={() => { setPaymentStatus('idle'); setErrorMessage(''); }}
                                        className="w-full bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl transition duration-200 text-xs uppercase tracking-wider cursor-pointer active:scale-95"
                                    >
                                        Retry Transaction
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handlePay} className="space-y-5 text-left">
                                    <div className="bg-[#0d1420]/55 p-4 rounded-2xl border border-white/[0.05] space-y-2.5 text-xs text-gray-300">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-semibold">Vehicle:</span>
                                            <span className="font-bold text-slate-200">{vehicles.find(v => (v._id || v.id)?.toString() === formData.vehicleId?.toString())?.name || 'Selected Vehicle'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-semibold">Dates:</span>
                                            <span className="font-bold text-slate-200 font-mono">{formData.startDate} to {formData.endDate}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-white/[0.05] pt-2.5 font-bold text-sm">
                                            <span className="text-gray-400">Total Billed:</span>
                                            <span className="text-blue-400 font-black font-mono">₹{getEstimatedPrice().toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Select Payment Method</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedPaymentMethod('upi')}
                                                className={`py-3 px-3 text-xs font-bold rounded-xl border text-center transition-all focus:outline-none cursor-pointer uppercase tracking-wider ${
                                                    selectedPaymentMethod === 'upi'
                                                        ? 'bg-blue-600/15 border-blue-500 text-blue-400 shadow-sm shadow-[0_0_8px_rgba(59,130,246,0.15)]'
                                                        : 'bg-white/[0.02] border-white/[0.05] text-gray-450 hover:bg-white/[0.04]'
                                                }`}
                                            >
                                                UPI Payment
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedPaymentMethod('cash')}
                                                className={`py-3 px-3 text-xs font-bold rounded-xl border text-center transition-all focus:outline-none cursor-pointer uppercase tracking-wider ${
                                                    selectedPaymentMethod === 'cash'
                                                        ? 'bg-blue-600/15 border-blue-500 text-blue-400 shadow-sm shadow-[0_0_8px_rgba(59,130,246,0.15)]'
                                                        : 'bg-white/[0.02] border-white/[0.05] text-gray-455 hover:bg-white/[0.04]'
                                                }`}
                                            >
                                                Cash Payment
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Confirm Billing Email</label>
                                        <input 
                                            type="email"
                                            value={paymentEmail}
                                            onChange={(e) => setPaymentEmail(e.target.value)}
                                            required
                                            className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white placeholder-gray-650 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                                            placeholder="john@example.com"
                                        />
                                    </div>

                                    {selectedPaymentMethod === 'upi' && (
                                        <div className="animate-fade-in space-y-2">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">UPI ID (Virtual Payment Address)</label>
                                            <input 
                                                type="text"
                                                value={upiId}
                                                onChange={(e) => setUpiId(e.target.value)}
                                                required
                                                className="w-full bg-[#0d1420]/80 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white placeholder-gray-650 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200 font-mono"
                                                placeholder="username@upi"
                                            />
                                            <span className="text-[10px] text-gray-550 font-medium block mt-1 uppercase tracking-wider">Example: user@upi, mobile@ybl</span>
                                        </div>
                                    )}

                                    {selectedPaymentMethod === 'cash' && (
                                        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl text-center uppercase tracking-wider animate-fade-in shadow-sm">
                                            Handover cash at Counter to unlock keys
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] text-white font-black py-3 px-4 rounded-xl transition duration-200 uppercase tracking-wider text-xs cursor-pointer active:scale-95"
                                    >
                                        Authorise & Settle
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BookingPage;
