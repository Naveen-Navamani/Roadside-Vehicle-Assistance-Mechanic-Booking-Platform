import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import * as api from '../../services/api';
import { AlertTriangle, Clock, MapPin, Navigation, ShieldCheck, X } from 'lucide-react';

export const IncomingJobModal: React.FC = () => {
  const { incomingJob, clearIncomingJob, activeMechanicId, setActiveBooking, refreshData } = useApp();
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [isAccepting, setIsAccepting] = useState<boolean>(false);

  useEffect(() => {
    if (!incomingJob) return;
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

  if (!incomingJob) return null;

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const updated = await api.acceptBooking(incomingJob.id, activeMechanicId);
      setActiveBooking(updated);
      clearIncomingJob();
      refreshData();
    } catch (err) {
      alert('Failed to accept job');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = () => {
    clearIncomingJob();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border-2 border-orange-500 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        
        {/* Countdown Progress Bar */}
        <div className="w-full bg-slate-800 h-2">
          <div
            className="bg-orange-500 h-full transition-all duration-1000"
            style={{ width: `${(secondsLeft / 30) * 100}%` }}
          />
        </div>

        <div className="p-6 space-y-5">
          {/* Header with Radar Icon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <div className="relative w-10 h-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Emergency Request Broadcast</h3>
                <p className="text-xs text-orange-400 font-mono">Matched by GPS proximity & specialty</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-white font-mono">{secondsLeft}s</span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Remaining</span>
            </div>
          </div>

          {/* Job Details Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase text-slate-400">Service Category</span>
              <span className="text-xs font-bold text-white capitalize bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                {incomingJob.serviceType.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-slate-300">
                Vehicle: <span className="font-semibold text-white">{incomingJob.vehicleModel}</span> ({incomingJob.vehicleType.toUpperCase()})
              </p>
              <p className="text-slate-300">
                Plate: <span className="font-mono text-orange-400">{incomingJob.licensePlate}</span>
              </p>
              <div className="flex items-start gap-1 text-slate-400 pt-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>{incomingJob.breakdownLocation.address}</span>
              </div>
              {incomingJob.notes && (
                <p className="text-slate-400 italic bg-slate-900 p-2 rounded-xl border border-slate-800 mt-2">
                  "{incomingJob.notes}"
                </p>
              )}
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Transit Distance</span>
                <p className="text-sm font-bold text-blue-400 font-mono flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{incomingJob.distanceKm.toFixed(1)} km</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Estimated Payout</span>
                <p className="text-xl font-black text-emerald-400 font-mono">
                  ${incomingJob.estimatedCost.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleDecline}
              disabled={isAccepting}
              className="py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition"
            >
              Decline Job
            </button>
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs transition shadow-lg shadow-orange-600/30 flex items-center justify-center gap-1.5"
            >
              <span>{isAccepting ? 'Accepting...' : 'Accept & Mobilize'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};