import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { MechanicTerminal } from './components/mechanic/MechanicTerminal';
import { AdminTower } from './components/admin/AdminTower';
const MainContent = () => {
    const { role } = useApp();
    return (_jsxs("main", { className: "min-h-[calc(100vh-4rem)] pb-16", children: [role === 'customer' && _jsx(CustomerPortal, {}), role === 'mechanic' && _jsx(MechanicTerminal, {}), role === 'admin' && _jsx(AdminTower, {})] }));
};
export const App = () => {
    return (_jsx(AppProvider, { children: _jsxs("div", { className: "min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans", children: [_jsx(Navbar, {}), _jsx("div", { className: "flex-1", children: _jsx(MainContent, {}) }), _jsx("footer", { className: "border-t border-slate-800 bg-slate-900/50 py-6 text-center text-xs text-slate-500", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse" }), _jsx("span", { className: "font-semibold text-slate-400", children: "ResQAuto Production Simulation Platform" })] }), _jsx("div", { className: "text-slate-500 font-mono text-[11px]", children: "Multi-Agent Telemetry \u2022 WebSockets \u2022 Dynamic Pricing Engine \u2022 Leaflet Mapping" })] }) })] }) }));
};
export default App;
