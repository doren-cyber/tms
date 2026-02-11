
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Booking, Vehicle } from '../types';
import { HTMService } from '../store';

interface VehicleMapProps {
  activeTrips: Booking[];
}

export const VehicleMap: React.FC<VehicleMapProps> = ({ activeTrips }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  // Hospital base location (Mock coordinates)
  const HOSPITAL_LAT = 37.7749;
  const HOSPITAL_LNG = -122.4194;

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([HOSPITAL_LAT, HOSPITAL_LNG], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      // Hospital Marker
      L.marker([HOSPITAL_LAT, HOSPITAL_LNG], {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        })
      }).addTo(mapInstance.current).bindPopup('Main Hospital Campus');
    }

    // Update markers for active trips
    const currentTripIds = new Set(activeTrips.map(t => t.id));

    // Remove stale markers
    Object.keys(markersRef.current).forEach(id => {
      if (!currentTripIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    activeTrips.forEach(trip => {
      // Mock "movement" based on trip ID and current time for demo
      const timeOffset = Date.now() / 10000;
      const lat = HOSPITAL_LAT + (Math.sin(timeOffset + parseInt(trip.id.split('-')[1] || '0') / 1000) * 0.02);
      const lng = HOSPITAL_LNG + (Math.cos(timeOffset + parseInt(trip.id.split('-')[1] || '0') / 1000) * 0.02);

      const vehicle = HTMService.getVehicles().find(v => v.id === trip.assignedVehicleId);
      const driver = HTMService.getDrivers().find(d => d.id === trip.assignedDriverId);

      if (markersRef.current[trip.id]) {
        markersRef.current[trip.id].setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'vehicle-icon',
            html: `<div style="background-color: #ef4444; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); animation: pulse 2s infinite;"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          })
        }).addTo(mapInstance.current!).bindPopup(`
          <div class="p-1">
            <p class="font-bold text-slate-800 text-xs">${vehicle?.plateNumber || 'Unknown Vehicle'}</p>
            <p class="text-slate-500 text-[10px] mt-1">${trip.purpose}</p>
            <p class="text-blue-600 font-bold text-[10px] mt-1">${driver?.name || 'Assigned Driver'}</p>
          </div>
        `);
        markersRef.current[trip.id] = marker;
      }
    });

    return () => {
      // Clean up if needed, but usually we keep the map alive
    };
  }, [activeTrips]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapRef} className="absolute inset-0 w-full h-full shadow-inner bg-slate-100" />
      <div className="absolute top-4 right-4 z-[500] bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 flex flex-col gap-2">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            Hospital
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            Active Trip
         </div>
      </div>
    </div>
  );
};
