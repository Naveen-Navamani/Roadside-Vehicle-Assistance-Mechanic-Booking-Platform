import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapView } from '../common/MapView';
import { AnalyticsData, Booking, Mechanic } from '../../types';
import * as api from '../../services/api';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  DollarSign,
  Radio,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  Truck,
  UserCheck,
  Users,
  Wrench
} from 'lucide-react';

export const AdminTower: React.FC = () => {
  const { bookings, mechanics, refreshData } = useApp();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState<'fleet' | 'vetting' | 'incidents'>('fleet');
  const [selectedIncident, setSelectedIncident] = useState<Booking | null>(null);
  const [manualMechId, setManualMechId] = useState<string>('');
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  const fetchStats = async () => {
    try {
      const data = await api.fetchAnalytics();
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [bookings.length, mechanics.length]);

  const handleToggleVerification = async (mechId: string, current: boolean) => {
    await api.toggleMechanicVerification(mechId, !current);
    refreshData();
    fetchStats();
  };

  const handleManualDispatch = async (bookingId: string) => {
    if (!manualMechId) return;
    setIsDispatching(true);
    try {
      await api.acceptBooking(bookingId, manualMechId);
      setSelectedIncident(null);
      setManualMechId('');
      refreshData();
    } catch (e) {
      alert('Manual dispatch error');
    } finally {
      setIsDispatching(false);
    }
  };

  const activeIncidents = bookings.filter((b) => !['completed', 'cancelled'].includes(b.status));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Operations God View
            </span>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Live Telemetry Synced
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">Emergency Dispatch Control Tower</h2>
          <p className="text-xs text-slate-400">
            Real-time fleet positioning, incident triage, and mechanic verification pipeline
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'fleet' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Fleet Map
          </button>
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'incidents' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Incidents Queue</span>
            {activeIncidents.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('vetting')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'vetting' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mechanic Vetting & KYC
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Emergencies</span>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-3xl font-black text-white font-mono">{activeIncidents.length}</p>
          <span className="text-[11px] text-orange-400 font-semibold">Under Active Dispatch</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Fleet Ready</span>
            <Truck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white font-mono">
            {analytics ? `${analytics.onlineMechanics} / ${mechanics.length}` : '—'}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold">Online & Available</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg SLA Response</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white font-mono">11.4m</p>
          <span className="text-[11px] text-blue-400 font-semibold">Target &lt; 15.0 mins</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Volume</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-white font-mono">
            ${analytics ? analytics.totalRevenue.toFixed(0) : '0'}
          </p>
          <span className="text-[11px] text-purple-400 font-semibold">
            {analytics?.completedIncidents || 0} Resolved Rescues
          </span>
        </div>
      </div>

      {/* TAB 1: LIVE FLEET GOD VIEW MAP */}
      {activeTab === 'fleet' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl">
            <div className="flex items-center justify-between px-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Metropolitan Fleet Telemetry & Active Breakdown Coordinates
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Online
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Busy
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> SOS Incident
                </span>
              </div>
            </div>

            <MapView
              fleetMechanics={mechanics}
              customerPoint={activeIncidents[0]?.breakdownLocation || null}
              mechanicPoint={activeIncidents[0]?.currentMechanicLocation || null}
              height="500px"
              zoom={13}
            />
          </div>
        </div>
      )}

      {/* TAB 2: INCIDENTS QUEUE & MANUAL OVERRIDE */}
      {activeTab === 'incidents' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Live Emergency Dispatch Queue</h3>
            <span className="text-xs text-slate-400 font-mono">
              Showing all recorded active and past breakdowns
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="pb-3">Incident ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Assigned Unit</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Est. Total</th>
                  <th className="pb-3 text-right">Dispatcher Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {bookings.map((b) => {
                  const mech = mechanics.find((m) => m.id === b.mechanicId);
                  return (
                    <tr key={b.id} className="hover:bg-slate-800/40">
                      <td className="py-3 font-mono font-bold text-purple-400">{b.id}</td>
                      <td className="py-3">
                        <p className="font-semibold text-white">{b.customerName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{b.customerPhone}</p>
                      </td>
                      <td className="py-3">
                        <p className="capitalize font-medium text-white">{b.serviceType.replace('_', ' ')}</p>
                        <p className="text-[11px] text-slate-400">{b.vehicleModel}</p>
                      </td>
                      <td className="py-3">
                        {mech ? (
                          <div className="flex items-center gap-2">
                            <img src={mech.avatarUrl} className="w-6 h-6 rounded-full object-cover" />
                            <span>{mech.name}</span>
                          </div>
                        ) : (
                          <span className="text-orange-400 font-semibold italic">Unassigned / Broadcasting</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : b.status === 'en_route'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        }`}>
                          {b.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-white">${b.estimatedCost.toFixed(2)}</td>
                      <td className="py-3 text-right">
                        {!['completed', 'cancelled'].includes(b.status) && (
                          <button
                            onClick={() => setSelectedIncident(b)}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
                          >
                            Override Dispatch
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MECHANIC VETTING & KYC PIPELINE */}
      {activeTab === 'vetting' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Technician Vetting & Regulatory Compliance</h3>
              <p className="text-xs text-slate-400">
                Verify ASE certifications, commercial tow rig licenses, and background clearance
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              ● Rigorous Background Check Mode
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mechanics.map((m) => (
              <div
                key={m.id}
                className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={m.avatarUrl}
                    alt={m.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white truncate">{m.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        m.verified
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {m.verified ? 'VERIFIED' : 'PENDING AUDIT'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-0.5">
                      Lic: <span className="font-mono text-slate-300">{m.licenseNumber}</span> • {m.experienceYears} Years Exp
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Vehicle: <span className="text-slate-200 font-mono">{m.serviceVehicle}</span>
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {m.certifications.map((c, i) => (
                        <span key={i} className="text-[9px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-bold">{m.rating.toFixed(1)}</span>
                    <span className="text-slate-500">({m.completedJobs} rescues)</span>
                  </div>

                  <button
                    onClick={() => handleToggleVerification(m.id, m.verified)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      m.verified
                        ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/30'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30'
                    }`}
                  >
                    {m.verified ? (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Revoke Status</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Approve & Verify</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Dispatch Override Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Manual Dispatch Override</h3>
            <p className="text-xs text-slate-400">
              Reassign Incident #{selectedIncident.id} ({selectedIncident.serviceType.replace('_', ' ')}) to a specific verified unit:
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Select Technician</label>
              <select
                value={manualMechId}
                onChange={(e) => setManualMechId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">-- Choose Online Technician --</option>
                {mechanics
                  .filter((m) => m.verified)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.status.toUpperCase()} - {m.serviceVehicle})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleManualDispatch(selectedIncident.id)}
                disabled={!manualMechId || isDispatching}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
              >
                {isDispatching ? 'Reassigning...' : 'Force Assign Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};