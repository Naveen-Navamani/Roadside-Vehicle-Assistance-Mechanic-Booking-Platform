import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SOSWizardModal } from './SOSWizardModal';
import { LiveTrackingCard } from './LiveTrackingCard';
import { InvoiceReceiptModal } from './InvoiceReceiptModal';
import {
  AlertTriangle,
  BatteryCharging,
  Car,
  CheckCircle,
  Clock,
  Disc,
  Fuel,
  Home,
  Key,
  MapPin,
  Radio,
  ShieldCheck,
  Star,
  Truck,
  Wrench,
  Zap
} from 'lucide-react';
import { ServiceType } from '../../types';

export const CustomerPortal: React.FC = () => {
  const { activeBooking, catalog, bookings } = useApp();
  const [wizardOpen, setWizardOpen] = useState<boolean>(false);
  const [invoiceOpen, setInvoiceOpen] = useState<boolean>(false);

  const isAssistanceActive = activeBooking && !['cancelled'].includes(activeBooking.status);

  const getServiceIcon = (id: ServiceType) => {
    switch (id) {
      case 'flat_tire': return <Disc className="w-5 h-5 text-amber-400" />;
      case 'battery_jump': return <BatteryCharging className="w-5 h-5 text-emerald-400" />;
      case 'towing': return <Truck className="w-5 h-5 text-orange-400" />;
      case 'fuel_delivery': return <Fuel className="w-5 h-5 text-blue-400" />;
      case 'lockout': return <Key className="w-5 h-5 text-yellow-400" />;
      case 'engine_diagnostic': return <Wrench className="w-5 h-5 text-rose-400" />;
      case 'brake_service': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'drop_off': return <Home className="w-5 h-5 text-purple-400" />;
      default: return <Wrench className="w-5 h-5 text-orange-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* If an active emergency booking is ongoing, render Live Tracking Screen */}
      {isAssistanceActive ? (
        <LiveTrackingCard onOpenInvoice={() => setInvoiceOpen(true)} />
      ) : (
        /* Standby Hero / Emergency SOS Screen */
        <div className="space-y-12 animate-in fade-in duration-300">
          
          {/* Hero SOS Trigger Section */}
          <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 md:p-12 text-center overflow-hidden shadow-2xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping"></span>
                24/7 Verified Emergency Mechanics Online
              </span>

              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Stranded on the Road? <br />
                <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                  Instant Help Is On The Way.
                </span>
              </h1>

              <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
                Real-time dispatch of background-checked master mechanics for punctures, towing, dead batteries, lockouts, and on-site diagnostics.
              </p>

              {/* Big Red SOS Button */}
              <div className="pt-4 flex flex-col items-center justify-center">
                <div className="relative group cursor-pointer" onClick={() => setWizardOpen(true)}>
                  <div className="absolute -inset-2 bg-gradient-to-r from-orange-600 to-rose-600 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
                  <button className="relative w-40 h-40 rounded-full bg-gradient-to-tr from-rose-600 via-orange-600 to-amber-500 text-white font-black text-xl shadow-2xl flex flex-col items-center justify-center gap-1.5 border-4 border-white/20 group-hover:scale-105 transition-all duration-200">
                    <AlertTriangle className="w-10 h-10" />
                    <span className="tracking-wider text-2xl">SOS</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-orange-100">Emergency</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-4 font-mono">
                  Tap to request immediate assistance with transparent pricing
                </p>
              </div>

            </div>
          </div>

          {/* Quick Service Cards Catalog */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Available Assistance Services</h3>
                <p className="text-xs text-slate-400">Fixed upfront pricing with no hidden roadside markup</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {catalog.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setWizardOpen(true)}
                  className="bg-slate-900 border border-slate-800 hover:border-orange-500/50 p-5 rounded-3xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 group-hover:border-orange-500/30 transition">
                      {getServiceIcon(item.id)}
                    </div>
                    <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                      From ${item.basePrice}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-orange-400 transition">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>~{item.estimatedTimeMin} min SLA</span>
                    </span>
                    <span className="text-orange-400 font-bold group-hover:translate-x-1 transition-transform">
                      Request →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Trust Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">100% Verified Technicians</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Every mechanic is ASE/AAA certified, identity-verified, and commercial insurance validated.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Live GPS Telemetry</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Track your assigned rescue vehicle moving toward your exact breakdown coordinates in real time.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Post-Repair Drop-Off</h4>
                <p className="text-xs text-slate-400 mt-1">
                  If your vehicle requires deep garage repair, we tow it and drop it off at your doorstep when fixed.
                </p>
              </div>
            </div>
          </div>

          {/* Past Incidents History Table */}
          {bookings.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-white">Incident & Rescue Log</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="pb-3">ID</th>
                      <th className="pb-3">Service</th>
                      <th className="pb-3">Vehicle</th>
                      <th className="pb-3">Location</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {bookings.slice(0, 5).map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/40">
                        <td className="py-3 font-mono text-orange-400">{b.id}</td>
                        <td className="py-3 font-medium capitalize">{b.serviceType.replace('_', ' ')}</td>
                        <td className="py-3">{b.vehicleModel}</td>
                        <td className="py-3 text-slate-400 max-w-xs truncate">{b.breakdownLocation.address}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                            b.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                          }`}>
                            {b.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-white">
                          ${b.estimatedCost.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Modals */}
      <SOSWizardModal isOpen={wizardOpen} onClose={() => setWizardOpen(false)} />
      <InvoiceReceiptModal isOpen={invoiceOpen} onClose={() => setInvoiceOpen(false)} />

    </div>
  );
};