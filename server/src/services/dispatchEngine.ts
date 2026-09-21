import { GeoPoint, Mechanic, ServiceType } from '../types/index.js';
import { store } from './store.js';

/**
 * Calculates Haversine distance in Kilometers between two geographic coordinates
 */
export function calculateDistanceKm(point1: GeoPoint, point2: GeoPoint): number {
  const R = 6371; // Earth radius in km
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLon = ((point2.lng - point1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface MechanicMatch {
  mechanic: Mechanic;
  distanceKm: number;
  etaMinutes: number;
  score: number;
}

export function findBestMechanic(
  targetLocation: GeoPoint,
  serviceType: ServiceType
): MechanicMatch | null {
  const mechanics = store.getMechanics();

  // Filter verified, online mechanics
  let candidates = mechanics.filter(
    m => m.verified && m.status === 'online' && m.specialties.includes(serviceType)
  );

  // Fallback: verified online mechanics even if service is generic
  if (candidates.length === 0) {
    candidates = mechanics.filter(m => m.verified && m.status === 'online');
  }

  if (candidates.length === 0) {
    return null;
  }

  const matches: MechanicMatch[] = candidates.map(mechanic => {
    const distanceKm = calculateDistanceKm(mechanic.location, targetLocation);
    // Estimated time in minutes at ~25 km/h urban speed + 3 mins dispatch buffer
    const etaMinutes = Math.max(4, Math.round((distanceKm / 25) * 60) + 3);
    
    // Scoring: Lower is better (prioritize closer distance, high rating, high experience)
    const score = distanceKm * 0.7 - mechanic.rating * 1.5 - mechanic.experienceYears * 0.05;

    return {
      mechanic,
      distanceKm,
      etaMinutes,
      score
    };
  });

  matches.sort((a, b) => a.score - b.score);
  return matches[0] || null;
}
