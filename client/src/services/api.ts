import { AnalyticsData, Booking, CostBreakdown, Mechanic, ServiceCatalogItem, ServiceType, VehicleType } from '../types';

const API_BASE = '/api';

export async function fetchCatalog(): Promise<ServiceCatalogItem[]> {
  const res = await fetch(`${API_BASE}/catalog`);
  return res.json();
}

export async function fetchPriceEstimate(params: {
  serviceType: ServiceType;
  vehicleType: VehicleType;
  distanceKm: number;
  isUrgent: boolean;
  hasDropOff: boolean;
}): Promise<CostBreakdown> {
  const res = await fetch(`${API_BASE}/pricing/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return res.json();
}

export async function createBooking(data: any): Promise<Booking> {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create booking');
  return res.json();
}

export async function fetchBookings(): Promise<Booking[]> {
  const res = await fetch(`${API_BASE}/bookings`);
  return res.json();
}

export async function fetchBooking(id: string): Promise<Booking> {
  const res = await fetch(`${API_BASE}/bookings/${id}`);
  if (!res.ok) throw new Error('Booking not found');
  return res.json();
}

export async function acceptBooking(id: string, mechanicId?: string): Promise<Booking> {
  const res = await fetch(`${API_BASE}/bookings/${id}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mechanicId })
  });
  return res.json();
}

export async function updateBookingStatus(id: string, status: string, note?: string): Promise<Booking> {
  const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note })
  });
  return res.json();
}

export async function addPartToBooking(id: string, name: string, price: number, quantity: number = 1): Promise<Booking> {
  const res = await fetch(`${API_BASE}/bookings/${id}/parts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price, quantity })
  });
  return res.json();
}

export async function submitBookingReview(id: string, stars: number, feedback: string): Promise<Booking> {
  const res = await fetch(`${API_BASE}/bookings/${id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stars, feedback })
  });
  return res.json();
}

export async function fetchMechanics(): Promise<Mechanic[]> {
  const res = await fetch(`${API_BASE}/mechanics`);
  return res.json();
}

export async function updateMechanicStatus(id: string, status: Mechanic['status']): Promise<Mechanic> {
  const res = await fetch(`${API_BASE}/mechanics/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
}

export async function toggleMechanicVerification(id: string, verified: boolean): Promise<Mechanic> {
  const res = await fetch(`${API_BASE}/mechanics/${id}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verified })
  });
  return res.json();
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const res = await fetch(`${API_BASE}/analytics`);
  return res.json();
}

export async function resetDemoState(): Promise<void> {
  await fetch(`${API_BASE}/reset-demo`, { method: 'POST' });
}