import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapView } from '../common/MapView';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  MessageSquare,
  Navigation,
  Phone,
  Receipt,
  ShieldCheck,
  Star,
  Truck,
  User,
  Wrench
} from 'lucide-react';
import * as api from '../../services/api';

interface LiveTrackingCardProps {
  onOpenInvoice: () => void;
}

export const LiveTrackingCard: React.FC<LiveTrackingCardProps> = ({ onOpenInvoice }) => {
  const { activeBooking, mechanics, setActiveBooking, refreshData } = useApp();
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'mech'; text: string; time: string }>>([
    { sender: 'mech', text: 'Hello! I received your breakdown request. I am gearing up the service van with diagnostic tools now.', time: 'Just now' }
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  if (!activeBooking) return null;

  const assignedMechanic = mechanics.find(m => m.id === activeBooking.mechanicId);

  const getStatusStepIndex = () => {
    switch (activeBooking.status) {
      case 'pending':
      case 'broadcasting': return 0;
      case 'accepted':
      case 'en_route': return 1;
      case 'arrived': return 2;
      case 'diagnosing':
      case 'invoicing': return 3;
      case 'completed': return 4;
      default: return 0;
    }
  };

  const steps = [
    { label: 'SOS Broadcast', desc: 'Matching vetted unit' },
    { label: 'En Route', desc: `${activeBooking.etaMinutes || 8}m away` },
    { label: 'Arrived', desc: 'On-site presence' },
    { label: 'Triage & Repair', desc: 'Work underway' },
    { label: 'Resolved', desc: 'Invoice & Release' },
  ];

  const currentStep = getStatusStepIndex();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'user', text: chatInput, time: 'Just now' }]);
    const currentText = chatInput;
    setChatInput('');

    // Simulated mechanic response after 1.2s
    setTimeout(() => {
      let reply = 'Copy that! Keeping eyes on traffic, be there shortly.';
      if (currentText.toLowerCase().includes('tire') || currentText.toLowerCase().includes('spare')) {
        reply = 'Got it! I have the heavy-duty hydraulic jack and impact driver ready.';
      } else if (currentText.toLowerCase().includes('where')) {
        reply = `I am turning onto the main artery now, approx ${activeBooking.etaMinutes || 5} mins remaining.`;
      }
      setChatMessages(prev => [...prev, { sender: 'mech', text: reply, time: 'Just now' }]);
    }, 1200);
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this roadside assistance request?')) {
      await api.updateBookingStatus(activeBooking.id, 'cancelled', 'Cancelled by vehicle owner');
      refreshData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner Status Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                Job #{activeBooking.id}
              </span>
              <span className="text-xs text-slate-400">
                Created {new Date(activeBooking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1 capitalize">
              {activeBooking.serviceType.replace('_', ' ')} Assistance
            </h2>
            <p className="text-xs text-slate-400">
              Vehicle: <span className="text-slate-200 font-semibold">{activeBooking.vehicleModel}</span> ({activeBooking.licensePlate})
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-2xl text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estimated Time of Arrival</span>
              <div className="text-xl font-black text-orange-400 font-mono flex items-center justify-end gap-1.5">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>{activeBooking.status === 'completed' ? 'Resolved' : activeBooking.status === 'arrived' ? 'On Scene' : `${activeBooking.etaMinutes} mins`}</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-2xl text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Live Distance</span>
              <div className="text-xl font-black text-blue-400 font-mono flex items-center justify-end gap-1.5">
                <Navigation className="w-4 h-4 text-blue-500" />
                <span>{activeBooking.distanceKm > 0 ? `${activeBooking.distanceKm.toFixed(1)} km` : '0.0 km'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Step Visual Stepper */}
        <div className="pt-6">
          <div className="grid grid-cols-5 gap-2">
            {steps.map((step, idx) => {
              const isPassed = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div className="w-full flex items-center mb-2">
                    <div className={`h-1 flex-1 ${idx === 0 ? 'opacity-0' : isPassed || isCurrent ? 'bg-orange-500' : 'bg-slate-800'}`} />
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 transition ${
                        isPassed
                          ? 'bg-orange-600 border-orange-500 text-white'
                          : isCurrent
                          ? 'bg-orange-500 border-white text-white animate-pulse shadow-lg shadow-orange-500/50'
                          : 'bg-slate-800 border-slate-700 text-slate-500'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div className={`h-1 flex-1 ${idx === steps.length - 1 ? 'opacity-0' : isPassed ? 'bg-orange-500' : 'bg-slate-800'}`} />
                  </div>
                  <span className={`text-xs font-bold ${isCurrent ? 'text-orange-400' : isPassed ? 'text-white' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">{step.desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Mechanic Dossier & Live Bill */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-Time Live Map View (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-200">Live GPS Telemetry Stream</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {activeBooking.status === 'en_route' ? 'Moving towards scene...' : 'Status: ' + activeBooking.status}
              </span>
            </div>

            <MapView
              customerPoint={activeBooking.breakdownLocation}
              mechanicPoint={activeBooking.currentMechanicLocation}
              activeBooking={activeBooking}
              height="450px"
              zoom={14}
            />
          </div>
        </div>

        {/* Mechanic Dossier & Itemized Live Bill (1 Col) */}
        <div className="space-y-6">
          
          {/* Assigned Verified Mechanic Card */}
          {assignedMechanic ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Technician</span>
                <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Vetted & Verified</span>
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <img
                  src={assignedMechanic.avatarUrl}
                  alt={assignedMechanic.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
                />
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <span>{assignedMechanic.name}</span>
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{assignedMechanic.rating.toFixed(1)}</span>
                    <span className="text-slate-400">({assignedMechanic.completedJobs} rescues completed)</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{assignedMechanic.serviceVehicle}</p>
                </div>
              </div>

              {/* Certifications badges */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400">Credentials & Badges:</span>
                <div className="flex flex-wrap gap-1.5">
                  {assignedMechanic.certifications.map((cert, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {/* Communication Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => alert(`Calling technician at ${assignedMechanic.phone}`)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Driver</span>
                </button>
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-600/30"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>In-App Chat</span>
                </button>
              </div>

              {/* In-App Chat Panel */}
              {chatOpen && (
                <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="max-h-40 overflow-y-auto space-y-2 text-xs">
                    {chatMessages.map((m, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl ${
                          m.sender === 'user'
                            ? 'bg-blue-600 text-white ml-6'
                            : 'bg-slate-800 text-slate-200 mr-6'
                        }`}
                      >
                        <p>{m.text}</p>
                        <span className="text-[9px] opacity-70 block text-right mt-1">{m.time}</span>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                    >
                      Send
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto animate-spin">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Broadcasting to Nearby Technicians</h3>
              <p className="text-xs text-slate-400">
                Finding the highest rated master mechanic with proper towing/diagnostic equipment...
              </p>
            </div>
          )}

          {/* Real-Time Live Bill & Parts Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Itemized Bill</h3>
              <span className="text-[10px] text-emerald-400 font-mono">Real-Time Sync</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Base Assistance Service</span>
                <span className="font-mono">${activeBooking.costBreakdown.basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Distance Transit</span>
                <span className="font-mono">${activeBooking.costBreakdown.distancePrice.toFixed(2)}</span>
              </div>
              {activeBooking.costBreakdown.urgencyFee > 0 && (
                <div className="flex justify-between text-orange-400">
                  <span>Emergency Surge</span>
                  <span className="font-mono">+${activeBooking.costBreakdown.urgencyFee.toFixed(2)}</span>
                </div>
              )}
              {activeBooking.costBreakdown.dropOffFee > 0 && (
                <div className="flex justify-between text-purple-400">
                  <span>Vehicle Home Drop-off</span>
                  <span className="font-mono">+${activeBooking.costBreakdown.dropOffFee.toFixed(2)}</span>
                </div>
              )}

              {/* Dynamically added parts by mechanic */}
              {activeBooking.parts.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-amber-400">On-Site Parts & Supplies:</span>
                  {activeBooking.parts.map((part) => (
                    <div key={part.id} className="flex justify-between text-slate-300 pl-2">
                      <span>• {part.name} (×{part.quantity})</span>
                      <span className="font-mono font-medium">${(part.price * part.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Current Total</span>
                <span className="text-xl font-black text-orange-400 font-mono">
                  ${activeBooking.estimatedCost.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2">
              {activeBooking.status === 'completed' ? (
                <button
                  onClick={onOpenInvoice}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <Receipt className="w-4 h-4" />
                  <span>View Receipt & Rate Technician</span>
                </button>
              ) : (
                <button
                  onClick={handleCancel}
                  className="w-full py-2 bg-slate-800/80 hover:bg-rose-900/30 hover:text-rose-400 border border-slate-700/60 text-slate-400 rounded-xl text-xs font-semibold transition"
                >
                  Cancel Assistance Request
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};