import { GeoPoint } from '../types/index.js';
import { store } from './store.js';
import { calculateDistanceKm } from './dispatchEngine.js';

type BroadcastCallback = (event: string, payload: any) => void;

interface ActiveSimulation {
  bookingId: string;
  mechanicId: string;
  waypoints: GeoPoint[];
  currentIndex: number;
  timer: NodeJS.Timeout | null;
}

export class TelemetrySimulator {
  private simulations: Map<string, ActiveSimulation> = new Map();
  private broadcast: BroadcastCallback | null = null;

  public setBroadcast(cb: BroadcastCallback) {
    this.broadcast = cb;
  }

  /**
   * Generates a sequence of waypoints between start and end with realistic slight curvature
   */
  public generateWaypoints(start: GeoPoint, end: GeoPoint, steps: number = 20): GeoPoint[] {
    const points: GeoPoint[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Linear interpolation with slight non-linear curve to mimic street turns
      const jitterLat = Math.sin(t * Math.PI) * 0.0012;
      const jitterLng = Math.cos(t * Math.PI * 2) * 0.0008;
      
      const lat = start.lat + (end.lat - start.lat) * t + jitterLat;
      const lng = start.lng + (end.lng - start.lng) * t + jitterLng;

      points.push({
        lat: Math.round(lat * 1000000) / 1000000,
        lng: Math.round(lng * 1000000) / 1000000
      });
    }
    return points;
  }

  public startEnRouteSimulation(bookingId: string, mechanicId: string) {
    this.stopSimulation(bookingId);

    const booking = store.getBookingById(bookingId);
    const mechanic = store.getMechanicById(mechanicId);

    if (!booking || !mechanic) return;

    const start = mechanic.location;
    const destination = booking.breakdownLocation;
    const waypoints = this.generateWaypoints(start, destination, 24);

    const sim: ActiveSimulation = {
      bookingId,
      mechanicId,
      waypoints,
      currentIndex: 0,
      timer: null
    };

    sim.timer = setInterval(() => {
      this.stepSimulation(bookingId);
    }, 2500); // Progress step every 2.5 seconds

    this.simulations.set(bookingId, sim);
  }

  public stepSimulation(bookingId: string) {
    const sim = this.simulations.get(bookingId);
    if (!sim) return;

    if (sim.currentIndex < sim.waypoints.length - 1) {
      sim.currentIndex++;
      const currentPos = sim.waypoints[sim.currentIndex];

      // Update mechanic current location & booking
      const booking = store.getBookingById(bookingId);
      if (!booking || booking.status !== 'en_route') {
        this.stopSimulation(bookingId);
        return;
      }

      const remainingDist = calculateDistanceKm(currentPos, booking.breakdownLocation);
      const remainingEta = Math.max(1, Math.round((remainingDist / 25) * 60));

      store.updateMechanic(sim.mechanicId, { location: currentPos });
      store.updateBooking(bookingId, {
        currentMechanicLocation: currentPos,
        distanceKm: remainingDist,
        etaMinutes: remainingEta
      });

      if (this.broadcast) {
        this.broadcast('mechanic:location_update', {
          bookingId,
          mechanicId: sim.mechanicId,
          location: currentPos,
          distanceKm: remainingDist,
          etaMinutes: remainingEta,
          progress: Math.round((sim.currentIndex / (sim.waypoints.length - 1)) * 100)
        });
      }
    } else {
      // Reached destination! Automatically set to arrived
      this.stopSimulation(bookingId);
      const booking = store.getBookingById(bookingId);
      if (booking && booking.status === 'en_route') {
        const updatedTimeline = [
          ...booking.timeline,
          {
            status: 'arrived' as const,
            timestamp: new Date().toISOString(),
            note: 'Mechanic has arrived at breakdown location.'
          }
        ];
        store.updateBooking(bookingId, {
          status: 'arrived',
          etaMinutes: 0,
          timeline: updatedTimeline
        });

        if (this.broadcast) {
          this.broadcast('request:status_changed', {
            bookingId,
            status: 'arrived',
            note: 'Mechanic has arrived on scene.'
          });
        }
      }
    }
  }

  public stopSimulation(bookingId: string) {
    const sim = this.simulations.get(bookingId);
    if (sim) {
      if (sim.timer) clearInterval(sim.timer);
      this.simulations.delete(bookingId);
    }
  }
}

export const telemetrySimulator = new TelemetrySimulator();
