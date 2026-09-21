import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Booking, GeoPoint, Mechanic } from '../../types';

interface MapViewProps {
  customerPoint?: GeoPoint | null;
  mechanicPoint?: GeoPoint | null;
  fleetMechanics?: Mechanic[];
  activeBooking?: Booking | null;
  zoom?: number;
  height?: string;
  onMapClick?: (point: GeoPoint) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  customerPoint,
  mechanicPoint,
  fleetMechanics = [],
  activeBooking,
  zoom = 13,
  height = '420px',
  onMapClick
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on default or customer point (defaulting to Downtown San Francisco)
    const initialLat = customerPoint?.lat || 37.7749;
    const initialLng = customerPoint?.lng || -122.4194;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom,
      zoomControl: true,
      attributionControl: false
    });

    // Dark-mode Map Tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng, address: 'Pin Drop Location' });
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Customer & Mechanic Markers and Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Customer Breakdown Marker
    if (customerPoint) {
      const customerIcon = L.divIcon({
        className: 'custom-customer-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-rose-500 opacity-60"></span>
            <div class="relative w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (!markersRef.current['customer']) {
        markersRef.current['customer'] = L.marker([customerPoint.lat, customerPoint.lng], { icon: customerIcon })
          .addTo(map)
          .bindPopup(`<strong>Breakdown Location</strong><br/>${customerPoint.address || 'Reported Scene'}`);
      } else {
        markersRef.current['customer'].setLatLng([customerPoint.lat, customerPoint.lng]);
      }
    } else if (markersRef.current['customer']) {
      map.removeLayer(markersRef.current['customer']);
      delete markersRef.current['customer'];
    }

    // 2. Active Mechanic En-Route Marker
    if (mechanicPoint) {
      const mechanicIcon = L.divIcon({
        className: 'custom-mechanic-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-pulse absolute inline-flex h-10 w-10 rounded-full bg-blue-500 opacity-50"></span>
            <div class="relative w-9 h-9 rounded-xl bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      if (!markersRef.current['active-mechanic']) {
        markersRef.current['active-mechanic'] = L.marker([mechanicPoint.lat, mechanicPoint.lng], { icon: mechanicIcon })
          .addTo(map)
          .bindPopup(`<strong>Service Vehicle</strong><br/>En Route to Customer`);
      } else {
        markersRef.current['active-mechanic'].setLatLng([mechanicPoint.lat, mechanicPoint.lng]);
      }
    } else if (markersRef.current['active-mechanic']) {
      map.removeLayer(markersRef.current['active-mechanic']);
      delete markersRef.current['active-mechanic'];
    }

    // 3. Connect Route Polyline
    if (customerPoint && mechanicPoint) {
      const latlngs: [number, number][] = [
        [mechanicPoint.lat, mechanicPoint.lng],
        [customerPoint.lat, customerPoint.lng]
      ];

      if (!routeLineRef.current) {
        routeLineRef.current = L.polyline(latlngs, {
          color: '#3b82f6',
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.85
        }).addTo(map);
      } else {
        routeLineRef.current.setLatLngs(latlngs);
      }
    } else if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    // 4. Fleet Mechanics (for Admin or surrounding overview)
    fleetMechanics.forEach((m) => {
      // Don't duplicate active mechanic
      if (mechanicPoint && Math.abs(m.location.lat - mechanicPoint.lat) < 0.0001) return;

      const markerKey = `fleet-${m.id}`;
      const statusColor = m.status === 'online' ? '#10b981' : m.status === 'busy' ? '#f59e0b' : '#64748b';

      const fleetIcon = L.divIcon({
        className: 'fleet-icon',
        html: `
          <div style="background-color: ${statusColor}" class="w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
            ${m.name.charAt(0)}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      if (!markersRef.current[markerKey]) {
        markersRef.current[markerKey] = L.marker([m.location.lat, m.location.lng], { icon: fleetIcon })
          .addTo(map)
          .bindPopup(`
            <div class="text-xs">
              <p class="font-bold text-slate-800">${m.name}</p>
              <p class="text-slate-600">${m.serviceVehicle}</p>
              <p class="mt-1 font-semibold ${m.status === 'online' ? 'text-emerald-600' : 'text-amber-600'}">
                ● ${m.status.toUpperCase()} (${m.verified ? 'Verified' : 'Pending'})
              </p>
            </div>
          `);
      } else {
        markersRef.current[markerKey].setLatLng([m.location.lat, m.location.lng]);
      }
    });

    // Auto-center bounds if both points exist
    if (customerPoint && mechanicPoint) {
      const bounds = L.latLngBounds([
        [customerPoint.lat, customerPoint.lng],
        [mechanicPoint.lat, mechanicPoint.lng]
      ]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [customerPoint, mechanicPoint, fleetMechanics, activeBooking]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};