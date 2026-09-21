import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { Booking, BookingStatus, GeoPoint, Mechanic, PartItem, ServiceType, VehicleType } from '../types/index.js';
import { store, SERVICE_CATALOG } from '../services/store.js';
import { calculatePricing } from '../services/pricingEngine.js';
import { calculateDistanceKm, findBestMechanic } from '../services/dispatchEngine.js';
import { telemetrySimulator } from '../services/telemetrySimulator.js';

export const createApiRouter = (broadcast: (event: string, payload: any) => void) => {
  const router = express.Router();

  // 1. Get Service Catalog
  router.get('/catalog', (_req: Request, res: Response) => {
    res.json(SERVICE_CATALOG);
  });

  // 2. Upfront Pricing Estimate
  router.post('/pricing/estimate', (req: Request, res: Response) => {
    const { serviceType, vehicleType, distanceKm, isUrgent, hasDropOff } = req.body;
    const breakdown = calculatePricing(
      serviceType || 'flat_tire',
      vehicleType || 'sedan',
      typeof distanceKm === 'number' ? distanceKm : 3.5,
      Boolean(isUrgent),
      Boolean(hasDropOff),
      []
    );
    res.json(breakdown);
  });

  // 3. Create Roadside Assistance Booking
  router.post('/bookings', (req: Request, res: Response) => {
    const {
      customerName,
      customerPhone,
      serviceType,
      vehicleType,
      vehicleModel,
      licensePlate,
      notes,
      breakdownLocation,
      dropOffLocation,
      isUrgent
    } = req.body;

    if (!customerName || !customerPhone || !serviceType || !breakdownLocation) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    const loc: GeoPoint = {
      lat: breakdownLocation.lat,
      lng: breakdownLocation.lng,
      address: breakdownLocation.address || 'Street Location, San Francisco, CA'
    };

    const hasDropOff = Boolean(dropOffLocation && dropOffLocation.lat);
    const dropOff: GeoPoint | null = hasDropOff ? {
      lat: dropOffLocation.lat,
      lng: dropOffLocation.lng,
      address: dropOffLocation.address || 'Drop-Off Destination'
    } : null;

    // Find nearest matching verified mechanic
    const match = findBestMechanic(loc, serviceType as ServiceType);

    const distanceKm = match ? match.distanceKm : 4.0;
    const etaMinutes = match ? match.etaMinutes : 12;

    const costBreakdown = calculatePricing(
      serviceType as ServiceType,
      (vehicleType as VehicleType) || 'sedan',
      distanceKm,
      Boolean(isUrgent),
      hasDropOff,
      []
    );

    const newBooking: Booking = {
      id: 'BK-' + Math.floor(100000 + Math.random() * 900000),
      customerName,
      customerPhone,
      serviceType: serviceType as ServiceType,
      vehicleType: (vehicleType as VehicleType) || 'sedan',
      vehicleModel: vehicleModel || 'Vehicle',
      licensePlate: licensePlate || 'N/A',
      notes: notes || '',
      breakdownLocation: loc,
      dropOffLocation: dropOff,
      status: match ? 'broadcasting' : 'pending',
      mechanicId: match ? match.mechanic.id : null,
      estimatedCost: costBreakdown.total,
      costBreakdown,
      parts: [],
      etaMinutes,
      distanceKm,
      currentMechanicLocation: match ? match.mechanic.location : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: 'Emergency roadside request created.'
        },
        ...(match ? [{
          status: 'broadcasting' as BookingStatus,
          timestamp: new Date().toISOString(),
          note: `Dispatch broadcast sent to verified mechanic: ${match.mechanic.name}`
        }] : [])
      ]
    };

    store.saveBooking(newBooking);

    // Notify WebSocket subscribers
    broadcast('booking:created', newBooking);

    res.status(201).json(newBooking);
  });

  // 4. List all bookings
  router.get('/bookings', (_req: Request, res: Response) => {
    res.json(store.getBookings());
  });

  // 5. Get Booking by ID
  router.get('/bookings/:id', (req: Request, res: Response) => {
    const booking = store.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  });

  // 6. Mechanic accepts booking
  router.post('/bookings/:id/accept', (req: Request, res: Response) => {
    const { mechanicId } = req.body;
    const booking = store.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const mechId = mechanicId || booking.mechanicId;
    const mechanic = mechId ? store.getMechanicById(mechId) : null;

    const timeline = [
      ...booking.timeline,
      {
        status: 'accepted' as BookingStatus,
        timestamp: new Date().toISOString(),
        note: `Job accepted by ${mechanic ? mechanic.name : 'Mechanic'}. Preparing response unit.`
      },
      {
        status: 'en_route' as BookingStatus,
        timestamp: new Date().toISOString(),
        note: 'Mechanic is en route with service vehicle.'
      }
    ];

    const updated = store.updateBooking(booking.id, {
      status: 'en_route',
      mechanicId: mechId,
      currentMechanicLocation: mechanic ? mechanic.location : booking.currentMechanicLocation,
      timeline
    });

    if (mechId) {
      store.updateMechanic(mechId, { status: 'busy', currentBookingId: booking.id });
      // Start real-time turn-by-turn waypoint telemetry simulation!
      telemetrySimulator.startEnRouteSimulation(booking.id, mechId);
    }

    broadcast('request:status_changed', {
      bookingId: booking.id,
      status: 'en_route',
      booking: updated
    });

    res.json(updated);
  });

  // 7. Update booking status
  router.post('/bookings/:id/status', (req: Request, res: Response) => {
    const { status, note } = req.body;
    const booking = store.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (status === 'completed' || status === 'cancelled') {
      telemetrySimulator.stopSimulation(booking.id);
      if (booking.mechanicId) {
        store.updateMechanic(booking.mechanicId, {
          status: 'online',
          currentBookingId: null,
          completedJobs: status === 'completed' ? 
            (store.getMechanicById(booking.mechanicId)?.completedJobs || 0) + 1 : 
            store.getMechanicById(booking.mechanicId)?.completedJobs
        });
      }
    } else if (status === 'en_route' && booking.mechanicId) {
      telemetrySimulator.startEnRouteSimulation(booking.id, booking.mechanicId);
    }

    const timeline = [
      ...booking.timeline,
      {
        status: status as BookingStatus,
        timestamp: new Date().toISOString(),
        note: note || `Status updated to ${status}`
      }
    ];

    const updated = store.updateBooking(booking.id, {
      status: status as BookingStatus,
      timeline
    });

    broadcast('request:status_changed', {
      bookingId: booking.id,
      status,
      booking: updated
    });

    res.json(updated);
  });

  // 8. Add itemized diagnostic/repair part to job sheet
  router.post('/bookings/:id/parts', (req: Request, res: Response) => {
    const { name, price, quantity } = req.body;
    const booking = store.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const newPart: PartItem = {
      id: 'part-' + Math.random().toString(36).substring(2, 8),
      name: name || 'Replacement Part / Shop Supply',
      price: Number(price) || 0,
      quantity: Number(quantity) || 1
    };

    const updatedParts = [...booking.parts, newPart];

    // Recalculate total with newly added parts
    const costBreakdown = calculatePricing(
      booking.serviceType,
      booking.vehicleType,
      booking.distanceKm,
      booking.costBreakdown.urgencyFee > 0,
      Boolean(booking.dropOffLocation),
      updatedParts
    );

    const updated = store.updateBooking(booking.id, {
      parts: updatedParts,
      costBreakdown,
      estimatedCost: costBreakdown.total
    });

    broadcast('request:parts_added', {
      bookingId: booking.id,
      part: newPart,
      costBreakdown,
      total: costBreakdown.total
    });

    res.json(updated);
  });

  // 9. Customer rating & review
  router.post('/bookings/:id/review', (req: Request, res: Response) => {
    const { stars, feedback } = req.body;
    const booking = store.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const updated = store.updateBooking(booking.id, {
      rating: {
        stars: Number(stars) || 5,
        feedback: feedback || ''
      }
    });

    if (booking.mechanicId) {
      const mechanic = store.getMechanicById(booking.mechanicId);
      if (mechanic) {
        const newRating = Math.round(((mechanic.rating * mechanic.completedJobs + Number(stars)) / (mechanic.completedJobs + 1)) * 10) / 10;
        store.updateMechanic(mechanic.id, { rating: newRating });
      }
    }

    broadcast('booking:reviewed', {
      bookingId: booking.id,
      rating: updated?.rating
    });

    res.json(updated);
  });

  // 10. List Mechanics
  router.get('/mechanics', (_req: Request, res: Response) => {
    res.json(store.getMechanics());
  });

  // 11. Get Mechanic by ID
  router.get('/mechanics/:id', (req: Request, res: Response) => {
    const mechanic = store.getMechanicById(req.params.id);
    if (!mechanic) return res.status(404).json({ error: 'Mechanic not found' });
    res.json(mechanic);
  });

  // 12. Update Mechanic Online/Busy/Offline status
  router.post('/mechanics/:id/status', (req: Request, res: Response) => {
    const { status } = req.body;
    const updated = store.setMechanicStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: 'Mechanic not found' });

    broadcast('mechanic:status_changed', updated);
    res.json(updated);
  });

  // 13. Admin Toggle Mechanic Verification
  router.post('/mechanics/:id/verify', (req: Request, res: Response) => {
    const { verified } = req.body;
    const updated = store.setMechanicVerification(req.params.id, Boolean(verified));
    if (!updated) return res.status(404).json({ error: 'Mechanic not found' });

    broadcast('mechanic:verified_changed', updated);
    res.json(updated);
  });

  // 14. Admin Operations & SLA Analytics
  router.get('/analytics', (_req: Request, res: Response) => {
    const bookings = store.getBookings();
    const mechanics = store.getMechanics();

    const activeIncidents = bookings.filter(b => !['completed', 'cancelled'].includes(b.status)).length;
    const completedIncidents = bookings.filter(b => b.status === 'completed').length;
    const totalRevenue = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.estimatedCost, 0);

    const onlineMechanics = mechanics.filter(m => m.status === 'online').length;
    const busyMechanics = mechanics.filter(m => m.status === 'busy').length;
    const verifiedRate = Math.round((mechanics.filter(m => m.verified).length / mechanics.length) * 100);

    const categoryDistribution: Record<string, number> = {};
    bookings.forEach(b => {
      categoryDistribution[b.serviceType] = (categoryDistribution[b.serviceType] || 0) + 1;
    });

    res.json({
      activeIncidents,
      completedIncidents,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      onlineMechanics,
      busyMechanics,
      verifiedRate,
      averageSlaMinutes: 11.4,
      categoryDistribution
    });
  });

  // 15. Reset Demo State
  router.post('/reset-demo', (_req: Request, res: Response) => {
    store.seedDefaults();
    broadcast('system:reset', { timestamp: new Date().toISOString() });
    res.json({ success: true, message: 'Demo data reset to fresh seeded state' });
  });

  return router;
};
