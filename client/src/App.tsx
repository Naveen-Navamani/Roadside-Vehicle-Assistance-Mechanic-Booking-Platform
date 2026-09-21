import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { MechanicTerminal } from './components/mechanic/MechanicTerminal';
import { AdminTower } from './components/admin/AdminTower';
import { Activity, Radio, Shield, Wrench } from 'lucide-react';

const MainContent: React.FC = () => {
  const { role } = useApp();

  return (
    <main className="min-h-[calc(100vh-4rem)] pb-16">
      {role === 'customer' && <CustomerPortal />}
      {role === 'mechanic' && <MechanicTerminal />}
      {role === 'admin' && <AdminTower />}
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1">
          <MainContent />
        </div>
        
        {/* Footer */}
        <footer className="border-t border-slate-800 bg-slate-900/50 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-400">ResQAuto Production Simulation Platform</span>
            </div>
            <div className="text-slate-500 font-mono text-[11px]">
              Multi-Agent Telemetry • WebSockets • Dynamic Pricing Engine • Leaflet Mapping
            </div>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
};

export default App;