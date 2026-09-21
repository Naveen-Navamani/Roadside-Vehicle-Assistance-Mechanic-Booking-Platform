import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import * as api from '../../services/api';
import { AlertTriangle, MapPin, Navigation } from 'lucide-react';
export const IncomingJobModal = () => {
    const { incomingJob, clearIncomingJob, activeMechanicId, setActiveBooking, refreshData } = useApp();
    const [secondsLeft, setSecondsLeft] = useState(30);
    const [isAccepting, setIsAccepting] = useState(false);
    useEffect(() => {
        if (!incomingJob)
            return;
        setSecondsLeft(30);
        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    clearIncomingJob();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [incomingJob?.id]);
    if (!incomingJob)
        return null;
    const handleAccept = async () => {
        setIsAccepting(true);
        try {
            const updated = await api.acceptBooking(incomingJob.id, activeMechanicId);
            setActiveBooking(updated);
            clearIncomingJob();
            refreshData();
        }
        catch (err) {
            alert('Failed to accept job');
        }
        finally {
            setIsAccepting(false);
        }
    };
    const handleDecline = () => {
        clearIncomingJob();
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in", children: _jsxs("div", { className: "bg-slate-900 border-2 border-orange-500 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative", children: [_jsx("div", { className: "w-full bg-slate-800 h-2", children: _jsx("div", { className: "bg-orange-500 h-full transition-all duration-1000", style: { width: `${(secondsLeft / 30) * 100}%` } }) }), _jsxs("div", { className: "p-6 space-y-5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "relative", children: [_jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" }), _jsx("div", { className: "relative w-10 h-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white font-bold", children: _jsx(AlertTriangle, { className: "w-5 h-5" }) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-black text-white", children: "Emergency Request Broadcast" }), _jsx("p", { className: "text-xs text-orange-400 font-mono", children: "Matched by GPS proximity & specialty" })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("span", { className: "text-2xl font-black text-white font-mono", children: [secondsLeft, "s"] }), _jsx("span", { className: "block text-[10px] text-slate-400 uppercase tracking-wider", children: "Remaining" })] })] }), _jsxs("div", { className: "bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-2", children: [_jsx("span", { className: "text-xs font-bold uppercase text-slate-400", children: "Service Category" }), _jsx("span", { className: "text-xs font-bold text-white capitalize bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700", children: incomingJob.serviceType.replace('_', ' ') })] }), _jsxs("div", { className: "space-y-1 text-xs", children: [_jsxs("p", { className: "text-slate-300", children: ["Vehicle: ", _jsx("span", { className: "font-semibold text-white", children: incomingJob.vehicleModel }), " (", incomingJob.vehicleType.toUpperCase(), ")"] }), _jsxs("p", { className: "text-slate-300", children: ["Plate: ", _jsx("span", { className: "font-mono text-orange-400", children: incomingJob.licensePlate })] }), _jsxs("div", { className: "flex items-start gap-1 text-slate-400 pt-1", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" }), _jsx("span", { children: incomingJob.breakdownLocation.address })] }), incomingJob.notes && (_jsxs("p", { className: "text-slate-400 italic bg-slate-900 p-2 rounded-xl border border-slate-800 mt-2", children: ["\"", incomingJob.notes, "\""] }))] }), _jsxs("div", { className: "flex justify-between items-baseline pt-2 border-t border-slate-800", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[10px] text-slate-400 uppercase font-bold", children: "Transit Distance" }), _jsxs("p", { className: "text-sm font-bold text-blue-400 font-mono flex items-center gap-1", children: [_jsx(Navigation, { className: "w-3.5 h-3.5" }), _jsxs("span", { children: [incomingJob.distanceKm.toFixed(1), " km"] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("span", { className: "text-[10px] text-slate-400 uppercase font-bold", children: "Estimated Payout" }), _jsxs("p", { className: "text-xl font-black text-emerald-400 font-mono", children: ["$", incomingJob.estimatedCost.toFixed(2)] })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3 pt-1", children: [_jsx("button", { onClick: handleDecline, disabled: isAccepting, className: "py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition", children: "Decline Job" }), _jsx("button", { onClick: handleAccept, disabled: isAccepting, className: "py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs transition shadow-lg shadow-orange-600/30 flex items-center justify-center gap-1.5", children: _jsx("span", { children: isAccepting ? 'Accepting...' : 'Accept & Mobilize' }) })] })] })] }) }));
};
