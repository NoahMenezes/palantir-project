"use client";

import React, { useEffect, useState } from "react";
import DeckGL from "@deck.gl/react";
import { IconLayer, ScatterplotLayer } from "@deck.gl/layers";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_STYLE: any = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenSky Network / OpenStreetMap Contributors",
    }
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }]
};

const INITIAL_VIEW_STATE = {
  longitude: 10.0,
  latitude: 50.0,
  zoom: 4,
  pitch: 0,
  bearing: 0
};

// SVG Airplane Icon (Changed to Violet to stand out on light maps)
const AIRPLANE_SVG = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#8B5CF6"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>');

export function FlightMap() {
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlights = async () => {
    try {
      const res = await fetch("/api/flights");
      if (!res.ok) throw new Error("Failed to fetch flight data");
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setFlights(data.flights);
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
    const interval = setInterval(fetchFlights, 10000);
    return () => clearInterval(interval);
  }, []);

  const layers = [
    new IconLayer({
      id: 'flight-icons',
      data: flights,
      pickable: true,
      getIcon: (d) => ({
        url: AIRPLANE_SVG,
        width: 24,
        height: 24,
        anchorY: 12
      }),
      sizeScale: 1,
      getPosition: (d: any) => [d.lng, d.lat],
      getSize: (d) => 24,
      getAngle: (d: any) => d.track || 0, // Rotate airplane to match heading
      autoHighlight: true,
    })
  ];

  return (
    <div className="w-full h-full relative group rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,229,255,0.05)] bg-[#0A0A0C]/50 backdrop-blur-sm">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={{ minZoom: 1.5 }}
        layers={layers}
        getTooltip={({object}) => object && `${object.callsign}\n${object.country}`}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      >
        <Map mapStyle={MAP_STYLE} renderWorldCopies={false} />
      </DeckGL>
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${error ? 'bg-red-500' : 'bg-[#00E5FF] animate-ping'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${error ? 'bg-red-500' : 'bg-[#00E5FF]'}`}></span>
          </div>
          <span className="text-xs font-mono text-[#00E5FF] uppercase tracking-widest font-bold">
            Live ADS-B Radar
          </span>
        </div>
        <span className="text-[10px] font-mono text-white/50 pl-5">
          {loading ? "Establishing Uplink..." : error ? "Connection Failed" : `Tracking ${flights.length} Active Flights`}
        </span>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <span className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Scroll to zoom &middot; Hover planes for details</span>
      </div>
    </div>
  );
}
