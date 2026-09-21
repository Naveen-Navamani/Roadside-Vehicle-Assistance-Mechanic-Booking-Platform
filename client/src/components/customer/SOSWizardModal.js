import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import * as api from '../../services/api';
import { AlertTriangle, BatteryCharging, Disc, Fuel, Home, Key, MapPin, Truck, Wrench, X } from 'lucide-react';
export const SOSWizardModal = ({ isOpen, onClose }) => {
    const { catalog, setActiveBooking, setRole } = useApp();
    const [step, setStep] = useState(1);
    const [serviceType, setServiceType] = useState('flat_tire');
    const [vehicleType, setVehicleType] = useState('suv');
    const [vehicleModel, setVehicleModel] = useState('Tesla Model Y');
    const [licensePlate, setLicensePlate] = useState('7XYZ892');
    const [customerName, setCustomerName] = useState('Alex Mercer');
    const [customerPhone, setCustomerPhone] = useState('+1 (415) 555-0192');
    const [notes, setNotes] = useState('Right rear tire blown on highway shoulder.');
    const [hasDropOff, setHasDropOff] = useState(false);
    const [dropOffAddress, setDropOffAddress] = useState('742 Evergreen Terrace, SF');
    const [isUrgent, setIsUrgent] = useState(true);
    const [locationAddress, setLocationAddress] = useState('Market St & 5th Ave, San Francisco, CA');
    const [latLng, setLatLng] = useState({ lat: 37.7833, lng: -122.4080 });
    const [estimate, setEstimate] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Recalculate price estimate whenever parameters change
    useEffect(() => {
        let isMounted = true;
        api.fetchPriceEstimate({
            serviceType,
            vehicleType,
            distanceKm: 4.2,
            isUrgent,
            hasDropOff
        }).then(est => {
            if (isMounted)
                setEstimate(est);
        }).catch(console.error);
        return () => { isMounted = false; };
    }, [serviceType, vehicleType, isUrgent, hasDropOff]);
    if (!isOpen)
        return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const newBooking = await api.createBooking({
                customerName,
                customerPhone,
                serviceType,
                vehicleType,
                vehicleModel,
                licensePlate,
                notes,
                breakdownLocation: {
                    lat: latLng.lat,
                    lng: latLng.lng,
                    address: locationAddress
                },
                dropOffLocation: hasDropOff ? {
                    lat: 37.7700,
                    lng: -122.4400,
                    address: dropOffAddress
                } : null,
                isUrgent
            });
            setActiveBooking(newBooking);
            onClose();
        }
        catch (err) {
            alert('Error creating booking. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const getServiceIcon = (id) => {
        switch (id) {
            case 'flat_tire': return _jsx(Disc, { className: "w-5 h-5 text-amber-400" });
            case 'battery_jump': return _jsx(BatteryCharging, { className: "w-5 h-5 text-emerald-400" });
            case 'towing': return _jsx(Truck, { className: "w-5 h-5 text-orange-400" });
            case 'fuel_delivery': return _jsx(Fuel, { className: "w-5 h-5 text-blue-400" });
            case 'lockout': return _jsx(Key, { className: "w-5 h-5 text-yellow-400" });
            case 'engine_diagnostic': return _jsx(Wrench, { className: "w-5 h-5 text-rose-400" });
            case 'brake_service': return _jsx(AlertTriangle, { className: "w-5 h-5 text-red-500" });
            case 'drop_off': return _jsx(Home, { className: "w-5 h-5 text-purple-400" });
            default: return _jsx(Wrench, { className: "w-5 h-5 text-orange-400" });
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200", children: [_jsxs("div", { className: "bg-gradient-to-r from-orange-600/20 via-slate-800 to-slate-900 p-6 border-b border-slate-800 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400", children: _jsx(AlertTriangle, { className: "w-6 h-6 animate-pulse" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-white", children: "Emergency Roadside Assistance" }), _jsx("p", { className: "text-xs text-slate-400", children: "Instant dispatch of vetted master mechanics in your area" })] })] }), _jsx("button", { onClick: onClose, className: "p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "grid grid-cols-3 border-b border-slate-800/80 bg-slate-950/40 text-xs font-semibold", children: [_jsx("button", { onClick: () => setStep(1), className: `py-3 text-center border-b-2 transition ${step === 1 ? 'border-orange-500 text-orange-400 bg-orange-500/5' : 'border-transparent text-slate-400'}`, children: "1. Select Issue" }), _jsx("button", { onClick: () => setStep(2), className: `py-3 text-center border-b-2 transition ${step === 2 ? 'border-orange-500 text-orange-400 bg-orange-500/5' : 'border-transparent text-slate-400'}`, children: "2. Vehicle & Location" }), _jsx("button", { onClick: () => setStep(3), className: `py-3 text-center border-b-2 transition ${step === 3 ? 'border-orange-500 text-orange-400 bg-orange-500/5' : 'border-transparent text-slate-400'}`, children: "3. Pricing & Dispatch" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-6", children: [step === 1 && (_jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-slate-300 font-medium", children: "What type of roadside assistance do you need?" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: catalog.map((cat) => (_jsxs("div", { onClick: () => setServiceType(cat.id), className: `p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3.5 ${serviceType === cat.id
                                            ? 'bg-orange-600/10 border-orange-500 ring-1 ring-orange-500'
                                            : 'bg-slate-800/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800'}`, children: [_jsx("div", { className: "p-2 rounded-xl bg-slate-900 border border-slate-700", children: getServiceIcon(cat.id) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "text-sm font-bold text-white truncate", children: cat.title }), _jsxs("span", { className: "text-xs font-mono font-bold text-orange-400", children: ["$", cat.basePrice, "+"] })] }), _jsx("p", { className: "text-xs text-slate-400 mt-0.5 line-clamp-2", children: cat.description })] })] }, cat.id))) }), _jsx("div", { className: "flex justify-end pt-4", children: _jsx("button", { type: "button", onClick: () => setStep(2), className: "px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-orange-600/30", children: "Continue to Vehicle Details \u2192" }) })] })), step === 2 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2", children: "Vehicle Category" }), _jsx("div", { className: "grid grid-cols-3 sm:grid-cols-6 gap-2", children: [
                                                { id: 'sedan', label: 'Sedan' },
                                                { id: 'suv', label: 'SUV' },
                                                { id: 'hatchback', label: 'Hatchback' },
                                                { id: 'ev', label: 'EV / Hybrid' },
                                                { id: 'heavy_truck', label: 'Truck/Van' },
                                                { id: 'motorcycle', label: 'Motorcycle' }
                                            ].map((v) => (_jsx("button", { type: "button", onClick: () => setVehicleType(v.id), className: `py-2.5 px-2 rounded-xl text-xs font-bold border transition ${vehicleType === v.id
                                                    ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/30'
                                                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'}`, children: v.label }, v.id))) })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-300 mb-1", children: "Make & Model" }), _jsx("input", { type: "text", value: vehicleModel, onChange: (e) => setVehicleModel(e.target.value), required: true, className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-orange-500", placeholder: "e.g. Ford Explorer, Honda Civic" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-300 mb-1", children: "License Plate Number" }), _jsx("input", { type: "text", value: licensePlate, onChange: (e) => setLicensePlate(e.target.value), required: true, className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-mono uppercase", placeholder: "e.g. 7XYZ892" })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between", children: [_jsx("span", { children: "Current Breakdown Location" }), _jsx("span", { className: "text-[11px] text-emerald-400 font-mono", children: "\u25CF Auto-detected GPS" })] }), _jsxs("div", { className: "relative", children: [_jsx(MapPin, { className: "absolute left-3 top-3 w-4 h-4 text-rose-500" }), _jsx("input", { type: "text", value: locationAddress, onChange: (e) => setLocationAddress(e.target.value), required: true, className: "w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" })] })] }), _jsxs("div", { className: "p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(Home, { className: "w-4 h-4 text-purple-400" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-bold text-white", children: "Post-Repair Vehicle Drop-Off" }), _jsx("p", { className: "text-[11px] text-slate-400", children: "Deliver vehicle to home/office after garage repair (+$40)" })] })] }), _jsx("input", { type: "checkbox", checked: hasDropOff, onChange: (e) => setHasDropOff(e.target.checked), className: "w-4 h-4 accent-orange-500 cursor-pointer" })] }), hasDropOff && (_jsx("input", { type: "text", value: dropOffAddress, onChange: (e) => setDropOffAddress(e.target.value), placeholder: "Enter delivery drop-off address", className: "w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500" }))] }), _jsxs("div", { className: "flex justify-between pt-2", children: [_jsx("button", { type: "button", onClick: () => setStep(1), className: "px-4 py-2 text-slate-400 hover:text-white text-sm", children: "\u2190 Back" }), _jsx("button", { type: "button", onClick: () => setStep(3), className: "px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-orange-600/30", children: "Review Transparent Estimate \u2192" })] })] })), step === 3 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-slate-800", children: [_jsx("h3", { className: "text-sm font-bold text-white", children: "Upfront Guaranteed Price Breakdown" }), _jsx("span", { className: "text-xs text-emerald-400 font-mono", children: "No Hidden Surge Fees" })] }), estimate && (_jsxs("div", { className: "space-y-2 text-xs", children: [_jsxs("div", { className: "flex justify-between text-slate-300", children: [_jsxs("span", { children: ["Base Service Fee (", serviceType.replace('_', ' '), ")"] }), _jsxs("span", { className: "font-mono font-medium", children: ["$", estimate.basePrice.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between text-slate-400", children: [_jsxs("span", { children: ["Vehicle Class Multiplier (", vehicleType, ")"] }), _jsxs("span", { className: "font-mono", children: ["\u00D7", estimate.vehicleMultiplier] })] }), _jsxs("div", { className: "flex justify-between text-slate-300", children: [_jsx("span", { children: "Distance Transit Fee (~4.2 km)" }), _jsxs("span", { className: "font-mono font-medium", children: ["$", estimate.distancePrice.toFixed(2)] })] }), isUrgent && (_jsxs("div", { className: "flex justify-between text-orange-400", children: [_jsx("span", { children: "Emergency Priority Dispatch Surge" }), _jsxs("span", { className: "font-mono font-medium", children: ["+$", estimate.urgencyFee.toFixed(2)] })] })), hasDropOff && (_jsxs("div", { className: "flex justify-between text-purple-400", children: [_jsx("span", { children: "Chauffeured Post-Repair Drop-off" }), _jsxs("span", { className: "font-mono font-medium", children: ["+$", estimate.dropOffFee.toFixed(2)] })] })), _jsxs("div", { className: "pt-3 border-t border-slate-800 flex justify-between items-baseline", children: [_jsx("span", { className: "text-sm font-bold text-white", children: "Total Estimated Cost" }), _jsxs("span", { className: "text-2xl font-black text-orange-400 font-mono", children: ["$", estimate.total.toFixed(2)] })] })] }))] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-400 mb-1", children: "Your Full Name" }), _jsx("input", { type: "text", value: customerName, onChange: (e) => setCustomerName(e.target.value), required: true, className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-400 mb-1", children: "Callback Phone Number" }), _jsx("input", { type: "text", value: customerPhone, onChange: (e) => setCustomerPhone(e.target.value), required: true, className: "w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-mono" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-400 mb-1", children: "Situation Notes for Mechanic" }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), rows: 2, className: "w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500", placeholder: "Describe sounds, smoke, exact spot, safety hazards..." })] }), _jsxs("div", { className: "flex items-center justify-between pt-3", children: [_jsx("button", { type: "button", onClick: () => setStep(2), className: "px-4 py-2 text-slate-400 hover:text-white text-sm", children: "\u2190 Back" }), _jsxs("button", { type: "submit", disabled: isSubmitting, className: "px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-orange-600/40 flex items-center gap-2 disabled:opacity-50", children: [_jsx(AlertTriangle, { className: "w-4 h-4" }), _jsx("span", { children: isSubmitting ? 'Locating Mechanics...' : 'Confirm & Dispatch Verified Mechanic' })] })] })] }))] })] }) }));
};
