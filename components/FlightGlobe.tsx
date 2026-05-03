"use client";

import React, { useEffect, useState } from "react";
import { Globe3D, GlobeMarker } from "@/components/ui/3d-globe";

export function FlightGlobe() {
  const [markers, setMarkers] = useState<GlobeMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlights = async () => {
    try {
      const res = await fetch("/api/flights");
      if (!res.ok) throw new Error("Failed to fetch flight data");
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Convert flight data to GlobeMarker format compatible with Globe3D
      const flightMarkers: GlobeMarker[] = data.flights.map((flight: any) => ({
        lat: flight.lat,
        lng: flight.lng,
        // We use a small orange dot as a plane marker
        src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2Y5NzMxNiI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiLz48L3N2Zz4=", 
        label: `${flight.callsign} (${flight.country})`,
      }));

      setMarkers(flightMarkers);
      setLoading(false);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchFlights, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full relative group rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,229,255,0.05)] bg-[#0A0A0C]/50 backdrop-blur-sm">
      <Globe3D 
        className="w-full h-full"
        markers={markers}
        config={{
          atmosphereColor: "#00E5FF",
          atmosphereIntensity: 5,
          bumpScale: 5,
          autoRotateSpeed: 0.15,
          enableZoom: true,
          enablePan: true,
          minDistance: 2,
          maxDistance: 10,
          showWireframe: false,
        }}
      />
      
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${error ? 'bg-red-500' : 'bg-[#00E5FF] animate-ping'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${error ? 'bg-red-500' : 'bg-[#00E5FF]'}`}></span>
          </div>
          <span className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest font-bold">
            Live ADS-B Radar
          </span>
        </div>
        <span className="text-[9px] font-mono text-white/50 pl-5">
          {loading ? "Establishing Uplink..." : error ? "Connection Failed" : `Tracking ${markers.length} Active Flights`}
        </span>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <span className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Scroll to zoom &middot; Drag to pan globe</span>
      </div>
    </div>
  );
}
