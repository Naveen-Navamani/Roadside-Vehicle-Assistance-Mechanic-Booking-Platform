import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveRole } from '../types';
import { AlertCircle, Car, RotateCcw, Shield, Wrench, Radio, CheckCircle2 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    role,
    setRole,
    isConnected,
    resetDemo,
    activeBooking,
    mechanics,
    activeMechanicId,
    setActiveMechanicId
  } = useApp();

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-xl">
              <Car className="w-6 h-6" />
            </div>
            {isConnected && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-900"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                ResQ<span className="text-orange-500">Auto</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded">
                Live Dispatch
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
              <Radio className={`w-3 h-3 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
              <span>{isConnected ? 'Telemetry Stream Active' : 'Connecting...'}</span>
            </div>
          </div>
        </div>

        {/* Role Switcher Pill Bar */}
        <nav className="flex items-center bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setRole('customer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
              role === 'customer'
                ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md shadow-orange-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Customer SOS</span>
            {activeBooking && !['completed', 'cancelled'].includes(activeBooking.status) && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setRole('mechanic')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
              role === 'mechanic'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Mechanic View</span>
          </button>

          <button
            onClick={() => setRole('admin')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
              role === 'admin'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin Tower</span>
          </button>
        </nav>

        {/* Action Controls & Mechanic Persona Switcher */}
        <div className="flex items-center gap-3">
          {role === 'mechanic' && (
            <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700 text-xs">
              <span className="text-slate-400 hidden sm:inline">Active Unit:</span>
              <select
                value={activeMechanicId}
                onChange={(e) => setActiveMechanicId(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                {mechanics.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                    {m.name} ({m.verified ? '✓ Verified' : 'Pending'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => {
              if (window.confirm('Reset all demo state (restore initial mechanics and clear bookings)?')) {
                resetDemo();
              }
            }}
            title="Reset to clean demo data"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};