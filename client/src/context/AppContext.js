import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../services/api';
import { socketService } from '../services/socket';
const AppContext = createContext(null);
export const AppProvider = ({ children }) => {
    const [role, setRole] = useState('customer');
    const [activeBooking, setActiveBooking] = useState(null);
    const [activeMechanicId, setActiveMechanicId] = useState('mech-1');
    const [bookings, setBookings] = useState([]);
    const [mechanics, setMechanics] = useState([]);
    const [catalog, setCatalog] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [incomingJob, setIncomingJob] = useState(null);
    const refreshData = async () => {
        try {
            const [catList, bList, mList] = await Promise.all([
                api.fetchCatalog(),
                api.fetchBookings(),
                api.fetchMechanics()
            ]);
            setCatalog(catList);
            setBookings(bList);
            setMechanics(mList);
            // Restore or sync active booking if one is ongoing
            if (bList.length > 0) {
                const ongoing = bList.find(b => !['completed', 'cancelled'].includes(b.status));
                if (ongoing && !activeBooking) {
                    setActiveBooking(ongoing);
                }
                else if (activeBooking) {
                    const fresh = bList.find(b => b.id === activeBooking.id);
                    if (fresh)
                        setActiveBooking(fresh);
                }
            }
        }
        catch (err) {
            console.error('Error fetching initial app data', err);
        }
    };
    const resetDemo = async () => {
        await api.resetDemoState();
        setActiveBooking(null);
        setIncomingJob(null);
        await refreshData();
    };
    const clearIncomingJob = () => setIncomingJob(null);
    useEffect(() => {
        refreshData();
        socketService.connect();
        const unsubStatus = socketService.on('connection:status', ({ connected }) => {
            setIsConnected(connected);
        });
        const unsubBookingCreated = socketService.on('booking:created', (newBooking) => {
            setBookings(prev => [newBooking, ...prev.filter(b => b.id !== newBooking.id)]);
            // If matches active mechanic, trigger incoming alert
            if (newBooking.mechanicId === activeMechanicId && newBooking.status === 'broadcasting') {
                setIncomingJob(newBooking);
                socketService.playAlertSound('radar');
            }
        });
        const unsubStatusChanged = socketService.on('request:status_changed', ({ bookingId, status, booking }) => {
            setBookings(prev => prev.map(b => b.id === bookingId ? (booking || { ...b, status }) : b));
            setActiveBooking(prev => {
                if (prev && prev.id === bookingId) {
                    if (status === 'arrived') {
                        socketService.playAlertSound('arrival');
                    }
                    return booking || { ...prev, status };
                }
                return prev;
            });
            // Clear broadcast modal if job was accepted
            setIncomingJob(prev => (prev && prev.id === bookingId ? null : prev));
        });
        const unsubLocUpdate = socketService.on('mechanic:location_update', ({ bookingId, location, distanceKm, etaMinutes }) => {
            setActiveBooking(prev => {
                if (prev && prev.id === bookingId) {
                    return {
                        ...prev,
                        currentMechanicLocation: location,
                        distanceKm,
                        etaMinutes
                    };
                }
                return prev;
            });
            setBookings(prev => prev.map(b => {
                if (b.id === bookingId) {
                    return {
                        ...b,
                        currentMechanicLocation: location,
                        distanceKm,
                        etaMinutes
                    };
                }
                return b;
            }));
        });
        const unsubPartsAdded = socketService.on('request:parts_added', ({ bookingId, part, costBreakdown, total }) => {
            setActiveBooking(prev => {
                if (prev && prev.id === bookingId) {
                    return {
                        ...prev,
                        parts: [...prev.parts, part],
                        costBreakdown,
                        estimatedCost: total
                    };
                }
                return prev;
            });
            setBookings(prev => prev.map(b => {
                if (b.id === bookingId) {
                    return {
                        ...b,
                        parts: [...b.parts, part],
                        costBreakdown,
                        estimatedCost: total
                    };
                }
                return b;
            }));
        });
        const unsubMechanicStatus = socketService.on('mechanic:status_changed', (mech) => {
            setMechanics(prev => prev.map(m => m.id === mech.id ? mech : m));
        });
        const unsubReset = socketService.on('system:reset', () => {
            refreshData();
            setActiveBooking(null);
            setIncomingJob(null);
        });
        return () => {
            unsubStatus();
            unsubBookingCreated();
            unsubStatusChanged();
            unsubLocUpdate();
            unsubPartsAdded();
            unsubMechanicStatus();
            unsubReset();
        };
    }, [activeMechanicId, activeBooking?.id]);
    const activeMechanic = mechanics.find(m => m.id === activeMechanicId);
    return (_jsx(AppContext.Provider, { value: {
            role,
            setRole,
            activeBooking,
            setActiveBooking,
            activeMechanicId,
            setActiveMechanicId,
            bookings,
            mechanics,
            catalog,
            isConnected,
            incomingJob,
            clearIncomingJob,
            refreshData,
            resetDemo,
            activeMechanic
        }, children: children }));
};
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context)
        throw new Error('useApp must be used within an AppProvider');
    return context;
};
