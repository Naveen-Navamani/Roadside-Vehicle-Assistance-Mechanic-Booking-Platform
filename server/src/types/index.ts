export type ServiceType = 
  | 'flat_tire'
  | 'battery_jump'
  | 'towing'
  | 'fuel_delivery'
  | 'lockout'
  | 'engine_diagnostic'
  | 'brake_service'
  | 'drop_off';

export type VehicleType = 
  | 'sedan'
  | 'suv'
  | 'hatchback'
  | 'ev'
  | 'heavy_truck'
  | 'motorcycle';

export type BookingStatus = 
  | 'pending'
  | 'broadcasting'
  | 'accepted'
  | 'en_route'
  | 'arrived'
  | 'diagnosing'
  | 'invoicing'
  | 'completed'
  | 'cancelled';

export type MechanicStatus = 'online' | 'busy' | 'offline';

export interface GeoPoint {
  lat: number;
  lng: number;
  address?: string;
}

export interface Mechanic {
  id: string;
  name: string;
  phone: string;
  rating: number;
  completedJobs: number;
  status: MechanicStatus;
  specialties: ServiceType[];
  serviceVehicle: string;
  location: GeoPoint;
  verified: boolean;
  certifications: string[];
  avatarUrl: string;
  currentBookingId?: string | null;
  experienceYears: number;
  licenseNumber: string;
}

export interface PartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CostBreakdown {
  basePrice: number;
  distancePrice: number;
  vehicleMultiplier: number;
  urgencyFee: number;
  partsCost: number;
  dropOffFee: number;
  total: number;
}

export interface TimelineEvent {
  status: BookingStatus;
  timestamp: string;
  note?: string;
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceType: ServiceType;
  vehicleType: VehicleType;
  vehicleModel: string;
  licensePlate: string;
  notes: string;
  breakdownLocation: GeoPoint;
  dropOffLocation?: GeoPoint | null;
  status: BookingStatus;
  mechanicId?: string | null;
  estimatedCost: number;
  costBreakdown: CostBreakdown;
  parts: PartItem[];
  etaMinutes: number;
  distanceKm: number;
  currentMechanicLocation?: GeoPoint | null;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
  rating?: {
    stars: number;
    feedback: string;
  };
}

export interface ServiceCatalogItem {
  id: ServiceType;
  title: string;
  description: string;
  basePrice: number;
  estimatedTimeMin: number;
  icon: string;
}

export interface WebSocketEvent {
  event: string;
  data: any;
}
