import fs from 'fs';
import path from 'path';
import { Booking, Mechanic, ServiceCatalogItem, ServiceType, VehicleType } from '../types/index.js';

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  {
    id: 'flat_tire',
    title: 'Flat Tire & Puncture Repair',
    description: 'On-site tire replacement with spare or pneumatic puncture repair & inflation.',
    basePrice: 45,
    estimatedTimeMin: 20,
    icon: 'Disc'
  },
  {
    id: 'battery_jump',
    title: 'Battery Jumpstart & Diagnostics',
    description: '12V / 24V jumpstart, alternator load test & portable EV battery boost.',
    basePrice: 40,
    estimatedTimeMin: 15,
    icon: 'BatteryCharging'
  },
  {
    id: 'towing',
    title: 'Emergency Towing Service',
    description: 'Flatbed or hydraulic wheel-lift towing to nearest authorized garage or home.',
    basePrice: 85,
    estimatedTimeMin: 35,
    icon: 'Truck'
  },
  {
    id: 'fuel_delivery',
    title: 'Emergency Fuel / EV Boost',
    description: 'Delivery of 2-3 gallons of gasoline/diesel or mobile emergency EV charge top-up.',
    basePrice: 35,
    estimatedTimeMin: 20,
    icon: 'Fuel'
  },
  {
    id: 'lockout',
    title: 'Car Lockout Assistance',
    description: 'Damage-free professional wedge & lockpick door unlock by certified locksmiths.',
    basePrice: 50,
    estimatedTimeMin: 15,
    icon: 'Key'
  },
  {
    id: 'engine_diagnostic',
    title: 'On-Site Engine Diagnostics',
    description: 'OBD-II computer scan, coolant/overheating triage, minor hose & belt repairs.',
    basePrice: 65,
    estimatedTimeMin: 30,
    icon: 'Wrench'
  },
  {
    id: 'brake_service',
    title: 'Brake & Fluid Emergency Repair',
    description: 'Brake fluid bleeding, stuck caliper relief, master cylinder emergency check.',
    basePrice: 75,
    estimatedTimeMin: 35,
    icon: 'AlertTriangle'
  },
  {
    id: 'drop_off',
    title: 'Post-Repair Vehicle Drop-Off',
    description: 'Chauffeured vehicle delivery from repair garage back to your doorstep.',
    basePrice: 40,
    estimatedTimeMin: 45,
    icon: 'Home'
  }
];

// Initial seeded mechanics in Downtown SF & surrounding area
export const INITIAL_MECHANICS: Mechanic[] = [
  {
    id: 'mech-1',
    name: 'Marcus Vance',
    phone: '+1 (415) 890-2311',
    rating: 4.95,
    completedJobs: 342,
    status: 'online',
    specialties: ['flat_tire', 'battery_jump', 'engine_diagnostic', 'towing'],
    serviceVehicle: 'Ford F-350 Heavy Duty Flatbed Tow',
    location: { lat: 37.7812, lng: -122.4089, address: '4th & Market St, SoMa' },
    verified: true,
    certifications: ['ASE Master Automobile Technician', 'EV High Voltage Certified', 'Tow Heavy Rigging'],
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    experienceYears: 12,
    licenseNumber: 'ASE-CA-89211'
  },
  {
    id: 'mech-2',
    name: 'Elena Rostova',
    phone: '+1 (415) 743-9941',
    rating: 4.88,
    completedJobs: 219,
    status: 'online',
    specialties: ['flat_tire', 'lockout', 'battery_jump', 'fuel_delivery'],
    serviceVehicle: 'Mercedes Sprinter Rapid Diagnostic Van',
    location: { lat: 37.7648, lng: -122.4218, address: 'Valencia & 18th, Mission District' },
    verified: true,
    certifications: ['Certified Automotive Locksmith (CAL)', 'Emergency Roadside Dispatch Level 3'],
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    experienceYears: 7,
    licenseNumber: 'CAL-US-44102'
  },
  {
    id: 'mech-3',
    name: 'Darius Thorne',
    phone: '+1 (415) 612-4480',
    rating: 4.92,
    completedJobs: 410,
    status: 'online',
    specialties: ['engine_diagnostic', 'brake_service', 'battery_jump', 'drop_off'],
    serviceVehicle: 'RAM ProMaster Mobile Repair Workshop',
    location: { lat: 37.7942, lng: -122.4005, address: 'California & Battery St, Financial District' },
    verified: true,
    certifications: ['Bosch Diagnostics Specialist', 'ASE Advanced Engine Performance'],
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    experienceYears: 15,
    licenseNumber: 'ASE-CA-11094'
  },
  {
    id: 'mech-4',
    name: 'Liam Chen',
    phone: '+1 (415) 554-1290',
    rating: 4.79,
    completedJobs: 135,
    status: 'online',
    specialties: ['battery_jump', 'fuel_delivery', 'flat_tire'],
    serviceVehicle: 'Toyota Tacoma Rapid Response 4x4',
    location: { lat: 37.7885, lng: -122.4324, address: 'Fillmore & Bush St, Pacific Heights' },
    verified: true,
    certifications: ['AAA Certified Roadside Responder', 'EV Rapid Assist Specialist'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    experienceYears: 5,
    licenseNumber: 'AAA-CA-90431'
  },
  {
    id: 'mech-5',
    name: 'Sarah Jenkins',
    phone: '+1 (415) 918-6723',
    rating: 4.70,
    completedJobs: 82,
    status: 'online',
    specialties: ['towing', 'brake_service', 'drop_off'],
    serviceVehicle: 'International CV515 Dual Wheel Recovery Truck',
    location: { lat: 37.7511, lng: -122.4182, address: 'Cesar Chavez & Potrero Ave' },
    verified: false, // For testing verification flow!
    certifications: ['Commercial Driver Class A', 'WreckMaster Level 4'],
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    experienceYears: 4,
    licenseNumber: 'WM-US-66723'
  }
];

export class AppStore {
  private mechanics: Map<string, Mechanic> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private dataDir = path.resolve(process.cwd(), 'data');
  private storeFile = path.resolve(this.dataDir, 'store.json');

  constructor() {
    this.initStore();
  }

  private initStore() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    if (fs.existsSync(this.storeFile)) {
      try {
        const raw = fs.readFileSync(this.storeFile, 'utf-8');
        const data = JSON.parse(raw);
        if (data.mechanics) {
          data.mechanics.forEach((m: Mechanic) => this.mechanics.set(m.id, m));
        }
        if (data.bookings) {
          data.bookings.forEach((b: Booking) => this.bookings.set(b.id, b));
        }
      } catch (err) {
        console.error('Failed to load store.json, re-seeding default data', err);
        this.seedDefaults();
      }
    } else {
      this.seedDefaults();
    }
  }

  public seedDefaults() {
    this.mechanics.clear();
    INITIAL_MECHANICS.forEach(m => this.mechanics.set(m.id, { ...m }));
    this.bookings.clear();
    this.persist();
  }

  private persist() {
    try {
      const data = {
        mechanics: Array.from(this.mechanics.values()),
        bookings: Array.from(this.bookings.values())
      };
      fs.writeFileSync(this.storeFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting store:', err);
    }
  }

  // Mechanic operations
  public getMechanics(): Mechanic[] {
    return Array.from(this.mechanics.values());
  }

  public getMechanicById(id: string): Mechanic | undefined {
    return this.mechanics.get(id);
  }

  public updateMechanic(id: string, updates: Partial<Mechanic>): Mechanic | undefined {
    const mech = this.mechanics.get(id);
    if (!mech) return undefined;
    const updated = { ...mech, ...updates };
    this.mechanics.set(id, updated);
    this.persist();
    return updated;
  }

  public setMechanicStatus(id: string, status: Mechanic['status']): Mechanic | undefined {
    return this.updateMechanic(id, { status });
  }

  public setMechanicVerification(id: string, verified: boolean): Mechanic | undefined {
    return this.updateMechanic(id, { verified });
  }

  // Booking operations
  public getBookings(): Booking[] {
    return Array.from(this.bookings.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getBookingById(id: string): Booking | undefined {
    return this.bookings.get(id);
  }

  public saveBooking(booking: Booking): Booking {
    this.bookings.set(booking.id, booking);
    this.persist();
    return booking;
  }

  public updateBooking(id: string, updates: Partial<Booking>): Booking | undefined {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    const updated = {
      ...booking,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.bookings.set(id, updated);
    this.persist();
    return updated;
  }

  public getActiveBookingForMechanic(mechanicId: string): Booking | undefined {
    return Array.from(this.bookings.values()).find(
      b => b.mechanicId === mechanicId && !['completed', 'cancelled'].includes(b.status)
    );
  }
}

export const store = new AppStore();
