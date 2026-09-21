import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import * as api from '../../services/api';
import { CheckCircle2, DollarSign, Receipt, Star, X } from 'lucide-react';
export const InvoiceReceiptModal = ({ isOpen, onClose }) => {
    const { activeBooking, setActiveBooking, refreshData, mechanics } = useApp();
    const [stars, setStars] = useState(5);
    const [feedback, setFeedback] = useState('Super fast response, had my tire changed safely in 15 minutes. Highly recommended!');
    const [isPaid, setIsPaid] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    if (!isOpen || !activeBooking)
        return null;
    const assignedMechanic = mechanics.find(m => m.id === activeBooking.mechanicId);
    const handlePayAndReview = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.submitBookingReview(activeBooking.id, stars, feedback);
            setIsPaid(true);
            setTimeout(() => {
                refreshData();
                setActiveBooking(null);
                onClose();
            }, 1800);
        }
        catch (err) {
            alert('Error saving review');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200", children: [_jsxs("div", { className: "bg-gradient-to-r from-emerald-600/20 via-slate-800 to-slate-900 p-6 border-b border-slate-800 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400", children: _jsx(Receipt, { className: "w-6 h-6" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-bold text-white", children: "Digital Service Invoice" }), _jsxs("p", { className: "text-xs text-slate-400", children: ["Order #", activeBooking.id, " \u2022 Verified Mechanic Completion"] })] })] }), _jsx("button", { onClick: onClose, className: "p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition", children: _jsx(X, { className: "w-5 h-5" }) })] }), isPaid ? (_jsxs("div", { className: "p-8 text-center space-y-4", children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce", children: _jsx(CheckCircle2, { className: "w-10 h-10" }) }), _jsx("h3", { className: "text-xl font-black text-white", children: "Payment Confirmed!" }), _jsx("p", { className: "text-xs text-slate-400", children: "Thank you for using ResQAuto. A copy of your itemized receipt has been sent to your phone." })] })) : (_jsxs("form", { onSubmit: handlePayAndReview, className: "p-6 space-y-5", children: [_jsxs("div", { className: "bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs", children: [_jsxs("div", { className: "flex justify-between text-slate-300", children: [_jsxs("span", { children: [activeBooking.serviceType.replace('_', ' ').toUpperCase(), " Labor"] }), _jsxs("span", { className: "font-mono", children: ["$", activeBooking.costBreakdown.basePrice.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between text-slate-400", children: [_jsxs("span", { children: ["Distance Transit (~", activeBooking.distanceKm.toFixed(1), " km)"] }), _jsxs("span", { className: "font-mono", children: ["$", activeBooking.costBreakdown.distancePrice.toFixed(2)] })] }), activeBooking.costBreakdown.urgencyFee > 0 && (_jsxs("div", { className: "flex justify-between text-orange-400", children: [_jsx("span", { children: "Emergency Dispatch Priority" }), _jsxs("span", { className: "font-mono", children: ["+$", activeBooking.costBreakdown.urgencyFee.toFixed(2)] })] })), activeBooking.costBreakdown.dropOffFee > 0 && (_jsxs("div", { className: "flex justify-between text-purple-400", children: [_jsx("span", { children: "Vehicle Home Drop-off Service" }), _jsxs("span", { className: "font-mono", children: ["+$", activeBooking.costBreakdown.dropOffFee.toFixed(2)] })] })), activeBooking.parts.length > 0 && (_jsxs("div", { className: "pt-2 border-t border-slate-800 space-y-1", children: [_jsx("span", { className: "text-[11px] font-bold text-amber-400", children: "Parts Supplied:" }), activeBooking.parts.map(p => (_jsxs("div", { className: "flex justify-between text-slate-300 pl-2", children: [_jsxs("span", { children: ["\u2022 ", p.name, " (x", p.quantity, ")"] }), _jsxs("span", { className: "font-mono", children: ["$", (p.price * p.quantity).toFixed(2)] })] }, p.id)))] })), _jsxs("div", { className: "pt-3 border-t border-slate-800 flex justify-between items-baseline", children: [_jsx("span", { className: "text-sm font-bold text-white", children: "Total Amount Due" }), _jsxs("span", { className: "text-2xl font-black text-emerald-400 font-mono", children: ["$", activeBooking.estimatedCost.toFixed(2)] })] })] }), _jsxs("div", { className: "space-y-3 pt-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-xs font-bold text-slate-300", children: ["Rate Technician (", assignedMechanic ? assignedMechanic.name : 'Mechanic', ")"] }), _jsx("div", { className: "flex items-center gap-1", children: [1, 2, 3, 4, 5].map((star) => (_jsx("button", { type: "button", onClick: () => setStars(star), className: "p-1 focus:outline-none transition transform hover:scale-110", children: _jsx(Star, { className: `w-5 h-5 ${star <= stars
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-slate-600 hover:text-slate-400'}` }) }, star))) })] }), _jsx("textarea", { value: feedback, onChange: (e) => setFeedback(e.target.value), rows: 2, placeholder: "Share your experience (punctuality, diagnosis, professionalism)...", className: "w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500" })] }), _jsxs("button", { type: "submit", disabled: isSubmitting, className: "w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50", children: [_jsx(DollarSign, { className: "w-4 h-4" }), _jsx("span", { children: isSubmitting ? 'Processing Payment...' : `Approve & Pay $${activeBooking.estimatedCost.toFixed(2)}` })] })] }))] }) }));
};
