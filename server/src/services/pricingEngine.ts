import { CostBreakdown, PartItem, ServiceType, VehicleType } from '../types/index.js';
import { SERVICE_CATALOG } from './store.js';

const VEHICLE_MULTIPLIERS: Record<VehicleType, number> = {
  motorcycle: 0.85,
  hatchback: 1.0,
  sedan: 1.05,
  suv: 1.15,
  ev: 1.20,
  heavy_truck: 1.45
};

export function calculatePricing(
  serviceType: ServiceType,
  vehicleType: VehicleType,
  distanceKm: number = 3.5,
  isUrgent: boolean = false,
  hasDropOff: boolean = false,
  parts: PartItem[] = []
): CostBreakdown {
  const service = SERVICE_CATALOG.find(s => s.id === serviceType);
  const baseServicePrice = service ? service.basePrice : 50;

  // Base price adjusted by vehicle type
  const vehicleMultiplier = VEHICLE_MULTIPLIERS[vehicleType] || 1.0;
  const basePrice = Math.round(baseServicePrice * vehicleMultiplier * 100) / 100;

  // Distance fee: First 3 km free, then $2.50 per km
  const billableDistance = Math.max(0, distanceKm - 3.0);
  const distancePrice = Math.round(billableDistance * 2.5 * 100) / 100;

  // Priority / Emergency surge fee
  const urgencyFee = isUrgent ? 18.0 : 0.0;

  // Post-repair drop-off service fee
  const dropOffFee = hasDropOff ? 40.0 : 0.0;

  // Total parts cost
  const partsCost = parts.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const total = Math.round((basePrice + distancePrice + urgencyFee + dropOffFee + partsCost) * 100) / 100;

  return {
    basePrice,
    distancePrice,
    vehicleMultiplier,
    urgencyFee,
    partsCost,
    dropOffFee,
    total
  };
}
