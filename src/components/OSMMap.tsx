import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface OSMMapProps {
  originCoords: { lat: number; lon: number } | null;
  destinationCoords: { lat: number; lon: number } | null;
  routeGeometry: any | null;
}

export default function OSMMap({ originCoords, destinationCoords, routeGeometry }: OSMMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const originMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not already done
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([-23.5505, -46.6333], 12); // Default to SP Brazil

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Remove old route layer
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
    // Remove old markers
    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }
    if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }

    const bounds: L.LatLngTuple[] = [];

    // Add origin marker
    if (originCoords) {
      const originIcon = L.divIcon({
        html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-md text-white font-bold text-xs uppercase">A</div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      originMarkerRef.current = L.marker([originCoords.lat, originCoords.lon], { icon: originIcon })
        .addTo(map)
        .bindPopup("<strong>Origem</strong>")
        .openPopup();
      bounds.push([originCoords.lat, originCoords.lon]);
    }

    // Add destination marker
    if (destinationCoords) {
      const destIcon = L.divIcon({
        html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-900 border-2 border-white shadow-md text-white font-bold text-xs uppercase">B</div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      destMarkerRef.current = L.marker([destinationCoords.lat, destinationCoords.lon], { icon: destIcon })
        .addTo(map)
        .bindPopup("<strong>Destino</strong>");
      bounds.push([destinationCoords.lat, destinationCoords.lon]);
    }

    // Add route line
    if (routeGeometry && routeGeometry.coordinates) {
      const latLns = routeGeometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      routeLayerRef.current = L.polyline(latLns, {
        color: '#1e3a8a', // navy blue
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round'
      }).addTo(map);

      // Add all coords to bounds
      latLns.forEach((latLng: [number, number]) => bounds.push(latLng));
    }

    // Adjust map viewport to fit all features
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [originCoords, destinationCoords, routeGeometry]);

  // Handle map resizing and unmount destruction
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[240px] rounded-xl overflow-hidden border border-slate-200 shadow-sm z-10">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
