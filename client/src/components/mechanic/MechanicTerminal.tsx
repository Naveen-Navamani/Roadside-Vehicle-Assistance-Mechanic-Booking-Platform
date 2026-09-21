import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapView } from '../common/MapView';
import { IncomingJobModal } from './IncomingJobModal';
import { AddPartsModal } from './AddPartsModal';
import * as api from '../../services/api';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  DollarSign,
  FastForward,
  MapPin,
  Navigation,
  PackagePlus,
  Phone,
  Power,
  ShieldAlert,
  ShieldCheck,
  Star,
  Truck,
  User,
  Wrench
} from 'lucide-react';

export const MechanicTerminal: React.FC = () => {
  const { activeMechanic, activeMechanicId, bookings, refreshData } = useApp();
  const [partsModalOpen, setPartsModalOpen] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  if (!activeMechanic) {
    return <div className="p-8 text-center text-slate-400">Loading technician profile...</div>;
  }

  // Find active booking for this mechanic
  const currentJob = bookings.find(
    (b) => b.mechanicId === activeMechanic.id && !['completed', 'cancelled'].includes(b.status)
  );

  const pastJobs = bookings.filter(
    (b) => b.mechanicId === activeMechanic.id && b.status === 'completed'
  );

  const totalEarnings = pastJobs.reduce((sum, j) => sum + j.estimatedCost, 0);

  const handleToggleOnline = async () => {
    const nextStatus = activeMechanic.status === 'online' ? 'offline' : 'online';
    await api.updateMechanicStatus(activeMechanic.id, nextStatus);
    refreshData();
  };

  const handleAdvanceJobStatus = async (nextStatus: string, note?: string) => {
    if (!currentJob) return;
    setIsUpdatingStatus(true);
    try {
      await api.updateBookingStatus(currentJob.id, nextStatus, note);
      refreshData();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Profile & Availability Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Avatar & Badges */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={activeMechanic.avatarUrl}
                alt={activeMechanic.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 shadow-xl"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                  activeMechanic.status === 'online'
                    ? 'bg-emerald-500'
                    : activeMechanic.status === 'busy'
                    ? 'bg-amber-500'
                    : 'bg-slate-500'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{activeMechanic.name}</h2>
                {activeMechanic.verified ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Master Technician</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Pending Verification</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Unit: <span className="text-slate-200 font-mono">{activeMechanic.serviceVehicle}</span> • {activeMechanic.experienceYears} Years Exp
              </p>
              
              <div className="flex items-center gap-3 mt-2 text-xs font-mono">
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-bold">{activeMechanic.rating.toFixed(1)}</span>
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">{activeMechanic.completedJobs} Rescues</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-bold">${totalEarnings.toFixed(2)} Earned</span>
              </div>
            </div>
          </div>

          {/* Status Toggle & Location */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleOnline}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 border transition shadow-lg ${
                activeMechanic.status === 'online'
                  ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30'
                  : activeMechanic.status === 'busy'
                  ? 'bg-amber-600/20 text-amber-400 border-amber-500/30 cursor-not-allowed'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>Status: {activeMechanic.status.toUpperCase()}</span>
            </button>
          </div>

        </div>

        {/* Certifications Row */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400">Accreditations:</span>
          {activeMechanic.certifications.map((cert, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 font-mono"
            >
              {cert}
            </span>
          ))}
        </div>
      </div>

      {/* Active Job Terminal (If on a job) */}
      {currentJob ? (
        <div className="bg-slate-900 border-2 border-blue-500/40 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Active Dispatch: #{currentJob.id}
                </span>
                <span className="text-xs text-orange-400 uppercase font-bold animate-pulse">
                  ● Status: {currentJob.status.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-2xl font-black text-white mt-1 capitalize">
                {currentJob.serviceType.replace('_', ' ')}
              </h3>
              <p className="text-xs text-slate-400">
                Customer: <span className="text-white font-semibold">{currentJob.customerName}</span> ({currentJob.customerPhone})
              </p>
            </div>

            {/* Quick Action Stepper for Technician */}
            <div className="flex flex-wrap items-center gap-2">
              {currentJob.status === 'en_route' && (
                <button
                  onClick={() => handleAdvanceJobStatus('arrived', 'Mechanic arrived on scene.')}
                  disabled={isUpdatingStatus}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-blue-600/30 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Confirm Arrival at Scene</span>
                </button>
              )}

              {currentJob.status === 'arrived' && (
                <button
                  onClick={() => handleAdvanceJobStatus('diagnosing', 'Started vehicle inspection and repairs.')}
                  disabled={isUpdatingStatus}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-amber-600/30 flex items-center gap-2"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Start Diagnostics & Repair</span>
                </button>
              )}

              {currentJob.status === 'diagnosing' && (
                <>
                  <button
                    onClick={() => setPartsModalOpen(true)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                  >
                    <PackagePlus className="w-4 h-4" />
                    <span>+ Add Parts / Supplies</span>
                  </button>

                  <button
                    onClick={() => handleAdvanceJobStatus('invoicing', 'Work completed. Preparing final bill.')}
                    disabled={isUpdatingStatus}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-blue-600/30 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Repair & Finalize Bill</span>
                  </button>
                </>
              )}

              {currentJob.status === 'invoicing' && (
                <button
                  onClick={() => handleAdvanceJobStatus('completed', 'Service completed. Handed over to owner.')}
                  disabled={isUpdatingStatus}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Release Vehicle & Complete Job</span>
                </button>
              )}
            </div>
          </div>

          {/* Telemetry & Map Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MapView
                customerPoint={currentJob.breakdownLocation}
                mechanicPoint={currentJob.currentMechanicLocation || activeMechanic.location}
                activeBooking={currentJob}
                height="400px"
              />
            </div>

            {/* Job Details & Digital Job Sheet */}
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Incident Dossier</h4>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p><strong>Model:</strong> {currentJob.vehicleModel} ({currentJob.vehicleType})</p>
                  <p><strong>Plate:</strong> <span className="font-mono text-orange-400">{currentJob.licensePlate}</span></p>
                  <p><strong>Location:</strong> {currentJob.breakdownLocation.address}</p>
                  {currentJob.dropOffLocation && (
                    <p className="text-purple-400"><strong>Post-Repair Drop-off:</strong> {currentJob.dropOffLocation.address}</p>
                  )}
                  {currentJob.notes && (
                    <p className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 italic">
                      "{currentJob.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Itemized Parts Added in Real-time */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Digital Job Sheet Parts</h4>
                  <button
                    onClick={() => setPartsModalOpen(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    + Add Part
                  </button>
                </div>

                {currentJob.parts.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No replacement parts added yet.</p>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    {currentJob.parts.map((p) => (
                      <div key={p.id} className="flex justify-between text-slate-300">
                        <span>• {p.name} (x{p.quantity})</span>
                        <span className="font-mono font-medium">${(p.price * p.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline text-xs">
                  <span className="font-bold text-white">Current Job Total:</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    ${currentJob.estimatedCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standby Radar Screen */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-2xl">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping"></div>
            <div className="relative w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Navigation className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-white">Technician Radar Active</h3>
            <p className="text-xs text-slate-400">
              You are currently <span className="text-emerald-400 font-bold">{activeMechanic.status.toUpperCase()}</span>. When an emergency breakdown matching your skills is requested within your radius, your terminal will alert you immediately.
            </p>
          </div>
        </div>
      )}

      {/* Completed Job History Ledger */}
      {pastJobs.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-white">Completed Job History & Earnings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="pb-3">Job ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Vehicle</th>
                  <th className="pb-3">Customer Rating</th>
                  <th className="pb-3 text-right">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {pastJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-800/40">
                    <td className="py-3 font-mono text-blue-400">{j.id}</td>
                    <td className="py-3 font-medium">{j.customerName}</td>
                    <td className="py-3 capitalize">{j.serviceType.replace('_', ' ')}</td>
                    <td className="py-3">{j.vehicleModel}</td>
                    <td className="py-3">
                      {j.rating ? (
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{j.rating.stars} ★</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Unrated</span>
                      )}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-400">
                      ${j.estimatedCost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Incoming Job Modal */}
      <IncomingJobModal />

      {/* Add Parts Modal */}
      {currentJob && (
        <AddPartsModal
          bookingId={currentJob.id}
          isOpen={partsModalOpen}
          onClose={() => setPartsModalOpen(false)}
          onAdded={refreshData}
        />
      )}

    </div>
  );
};