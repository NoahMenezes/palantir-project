"use client";

import React, { useEffect, useState, useRef } from "react";
import DeckGL from "@deck.gl/react";
import { IconLayer, BitmapLayer, PathLayer } from "@deck.gl/layers";
import { _GlobeView as GlobeView, MapView } from "@deck.gl/core";
import { TileLayer } from "@deck.gl/geo-layers";
import Map, { NavigationControl } from "react-map-gl/maplibre";
import Link from "next/link";
import "maplibre-gl/dist/maplibre-gl.css";
import { X, ExternalLink, Globe2, Map as MapIcon, Play, Sparkles, Search, Eye, Layout, Crosshair, MonitorOff, EyeOff } from "lucide-react";
import * as satellite from "satellite.js";

// Restored the cool dark-mode Palantir map!
const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

// We use a white SVG and mask: true, which allows Deck.gl to magically tint it with getColor!
const AIRPLANE_SVG =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>',
  );

const SATELLITE_SVG =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 2L10.5 5h3L12 2zM4 10.5L2 12l2 1.5v-3zM20 10.5v3l2-1.5-2-1.5zM12 22l1.5-3h-3L12 22zM7 7v10h10V7H7zm8 8H9V9h6v6z"/></svg>',
  );

function getAltitudeColor(altitudeMeters: number): [number, number, number] {
  const altFt = (altitudeMeters || 0) * 3.28084;
  if (altFt < 1000) return [255, 128, 0];
  if (altFt < 4000) return [255, 191, 0];
  if (altFt < 8000) return [204, 255, 0];
  if (altFt < 10000) return [0, 255, 0];
  if (altFt < 20000) return [0, 255, 191];
  if (altFt < 30000) return [0, 191, 255];
  if (altFt < 40000) return [64, 0, 255];
  return [191, 0, 255];
}

// Massive dictionary of standard ICAO Airline Codes
const AIRLINE_CODES: Record<string, string> = {
  QTR: "Qatar Airways",
  SIA: "Singapore Airlines",
  UAE: "Emirates",
  SEJ: "SpiceJet",
  BAW: "British Airways",
  AAL: "American Airlines",
  DAL: "Delta Air Lines",
  UAL: "United Airlines",
  RYR: "Ryanair",
  EZY: "easyJet",
  EZS: "easyJet Switzerland",
  AFR: "Air France",
  DLH: "Lufthansa",
  IGO: "IndiGo",
  AIC: "Air India",
  AXM: "AirAsia",
  CPA: "Cathay Pacific",
  THA: "Thai Airways",
  JAL: "Japan Airlines",
  ANA: "All Nippon Airways",
  QFA: "Qantas",
  ANZ: "Air New Zealand",
  ACA: "Air Canada",
  WJA: "WestJet",
  SWA: "Southwest Airlines",
  JBU: "JetBlue",
  ASA: "Alaska Airlines",
  NKS: "Spirit Airlines",
  KLM: "KLM Royal Dutch Airlines",
  VIR: "Virgin Atlantic",
  THY: "Turkish Airlines",
  ETD: "Etihad Airways",
  SVA: "Saudia",
  MSR: "EgyptAir",
  GIA: "Garuda Indonesia",
  MAS: "Malaysia Airlines",
  PAL: "Philippine Airlines",
  KAL: "Korean Air",
  AAR: "Asiana Airlines",
  CAL: "China Airlines",
  EVA: "EVA Air",
  CSN: "China Southern Airlines",
  CCA: "Air China",
  CES: "China Eastern Airlines",
  HVN: "Vietnam Airlines",
  VJC: "VietJet Air",
  CEB: "Cebu Pacific",
  GFA: "Gulf Air",
  VTI: "Vistara",
  LNI: "Lion Air",
  BTK: "Batik Air",
  AWQ: "Indonesia AirAsia",
  IBE: "Iberia",
  AEA: "Air Europa",
  VLG: "Vueling",
  SWR: "Swiss International Air Lines",
  AUA: "Austrian Airlines",
  FIN: "Finnair",
  SAS: "SAS Scandinavian Airlines",
  NAX: "Norwegian Air Shuttle",
  WZZ: "Wizz Air",
  RJA: "Royal Jordanian",
  MEA: "Middle East Airlines",
  KAC: "Kuwait Airways",
  OMA: "Oman Air",
  BBC: "Biman Bangladesh Airlines",
  ALK: "SriLankan Airlines",
  FDB: "flydubai",
  ABY: "Air Arabia",
  GOW: "Go First",
  IAD: "AirAsia India",
  LLR: "Alliance Air",
  AZA: "ITA Airways",
  ELY: "El Al",
  ETH: "Ethiopian Airlines",
  KQA: "Kenya Airways",
  RAM: "Royal Air Maroc",
  AMX: "Aeroméxico",
  VOI: "Volaris",
  LAN: "LATAM Airlines",
  TAM: "LATAM Brasil",
  AZU: "Azul Linhas Aéreas",
  GLO: "Gol Transportes Aéreos",
  ARG: "Aerolíneas Argentinas",
  SKU: "Sky Airline",
  JST: "Jetstar Airways",
  VOZ: "Virgin Australia",
  RXA: "Regional Express",
};

function getAirlineFromCallsign(callsign: string): string {
  if (!callsign || callsign === "UNKNOWN") return "Private / General";
  const prefix = callsign.substring(0, 3).toUpperCase();
  if (/^[A-Z]{3}$/.test(prefix)) {
    return AIRLINE_CODES[prefix] || "Commercial Flight";
  }
  return "Private / General";
}

const INITIAL_VIEW_STATE = {
  longitude: 10.0,
  latitude: 50.0,
  zoom: 4,
  pitch: 0,
  bearing: 0,
};

interface TacticalOptions {
  bloom: number;
  sharpen: number;
  hud: boolean;
  sparse: boolean;
  density: number;
}

interface FlightMapProps {
  onFlightsUpdate?: (count: number) => void;
  onSatellitesUpdate?: (count: number) => void;
  activeLayers: Record<string, boolean>;
  tacticalOptions: TacticalOptions;
  onRestoreHud?: () => void;
}

export function FlightMap({ onFlightsUpdate, onSatellitesUpdate, activeLayers, tacticalOptions, onRestoreHud }: FlightMapProps) {
  const { bloom, sharpen, hud, sparse, density } = tacticalOptions;
  
  const [flights, setFlights] = useState<any[]>([]);
  const [satellites, setSatellites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<any | null>(null);
  const [flightRoute, setFlightRoute] = useState<any | null>(null);
  const [isGlobeMode, setIsGlobeMode] = useState(false);
  const [timeTick, setTimeTick] = useState(Date.now());
  const requestRef = useRef<number | null>(null);

  // Controlling the viewState manually allows us to fix the zoom buttons and the "slipping" bug simultaneously
  const [viewState, setViewState] = useState({
    longitude: 10.0,
    latitude: 50.0,
    zoom: 4,
    pitch: 0,
    bearing: 0,
  });

  const handleZoom = (delta: number) => {
    setViewState((prev) => ({
      ...prev,
      zoom: Math.max(1.5, Math.min(20, prev.zoom + delta)),
    }));
  };

  const fetchFlights = async () => {
    if (!activeLayers.flights) return;
    try {
      // Send the current view state center to fetch local 250nm ADSB.lol data dynamically
      const lat = viewState.latitude.toFixed(4);
      const lng = viewState.longitude.toFixed(4);
      
      const res = await fetch(`/api/flights?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error("Failed to fetch flight data");

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Protect against empty arrays from timeout/throttling
      if (data.flights && data.flights.length > 0) {
        const now = Date.now();
        const flightsWithTimestamp = data.flights.map((f: any) => ({ ...f, lastUpdated: now }));
        setFlights(flightsWithTimestamp);
        if (onFlightsUpdate) onFlightsUpdate(flightsWithTimestamp.length);

        // If a flight is selected, automatically update its metrics with the new data
        setSelectedFlight((prev: any) => {
          if (!prev) return null;
          const updated = flightsWithTimestamp.find((f: any) => f.id === prev.id);
          
          if (sparse && updated) {
            setViewState((v) => ({
              ...v,
              longitude: updated.lng,
              latitude: updated.lat,
              transitionDuration: 1000,
            }));
          }
          
          return updated || prev;
        });
      }

      setLoading(false);
      setError(null);
    } catch (err: any) {
      console.warn("Flight fetch warning (likely API timeout):", err.message);
      // Graceful degradation: do NOT set error or clear flights if we already have them loaded!
      if (flights.length === 0) {
        setError(err.message);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (activeLayers.flights) {
      fetchFlights();
      // Refresh flights every 15 seconds to create real-time movement and avoid strict API rate limits
      const interval = setInterval(fetchFlights, 15000);
      return () => clearInterval(interval);
    } else {
      setFlights([]);
      if (onFlightsUpdate) onFlightsUpdate(0);
    }
  }, [activeLayers.flights]);

  const fetchSatellites = async () => {
    if (!activeLayers.satellites) return;
    try {
      const res = await fetch("/api/satellites");
      if (!res.ok) throw new Error("Failed to fetch satellites");
      const data = await res.json();
      if (data.satellites) {
        // Parse TLEs into satrec objects immediately
        const parsed = data.satellites.map((s: any) => {
          try {
            return { ...s, satrec: satellite.twoline2satrec(s.tle1, s.tle2) };
          } catch (e) { return null; }
        }).filter(Boolean);
        setSatellites(parsed);
        if (onSatellitesUpdate) onSatellitesUpdate(parsed.length);
      }
    } catch (err) {
      console.warn("Satellite fetch warning:", err);
    }
  };

  useEffect(() => {
    if (activeLayers.satellites) {
      fetchSatellites();
      // Satellite TLEs rarely change, re-fetch every 1 hour is fine
      const interval = setInterval(fetchSatellites, 3600000);
      return () => clearInterval(interval);
    } else {
      setSatellites([]);
      if (onSatellitesUpdate) onSatellitesUpdate(0);
    }
  }, [activeLayers.satellites]);

  // Real-time animation loop for both satellites and dead-reckoning flights
  const shouldAnimate = activeLayers.satellites || activeLayers.flights;
  useEffect(() => {
    if (shouldAnimate) {
      let lastUpdate = Date.now();
      const updateTick = () => {
        const now = Date.now();
        // Update at ~20fps to save CPU but remain buttery smooth
        if (now - lastUpdate > 50) {
          setTimeTick(now);
          lastUpdate = now;
        }
        requestRef.current = requestAnimationFrame(updateTick);
      };
      requestRef.current = requestAnimationFrame(updateTick);
      return () => cancelAnimationFrame(requestRef.current!);
    }
  }, [shouldAnimate]);

  // Fetch Origin/Destination routing or calculate Orbit when a feature is selected!
  useEffect(() => {
    if (selectedFlight && selectedFlight.isSatellite && selectedFlight.satrec) {
      // Calculate 1 full orbit (~100 mins) into the future
      const points = [];
      const now = new Date();
      for (let i = 0; i <= 100; i++) {
        const futureDate = new Date(now.getTime() + i * 60000); // i minutes
        const posAndVel = satellite.propagate(selectedFlight.satrec, futureDate);
        if (posAndVel.position && typeof posAndVel.position !== "boolean") {
          const gmst = satellite.gstime(futureDate);
          const positionGd = satellite.eciToGeodetic(posAndVel.position as any, gmst);
          points.push([
            satellite.degreesLong(positionGd.longitude),
            satellite.degreesLat(positionGd.latitude),
            isGlobeMode ? positionGd.height * 1000 : 0
          ]);
        }
      }
      setFlightRoute({ points });
    } else if (
      selectedFlight &&
      !selectedFlight.isSatellite &&
      selectedFlight.callsign &&
      selectedFlight.callsign !== "UNKNOWN"
    ) {
      setFlightRoute(null); // reset old route
      fetch(`/api/flight-route?callsign=${selectedFlight.callsign}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.route && data.route.route) {
            setFlightRoute(data.route);
          }
        })
        .catch((err) => console.error(err));
    } else {
      setFlightRoute(null);
    }
  }, [selectedFlight?.id, isGlobeMode]);

  // Background map tiles for the 3D Globe mode
  const globeBackgroundLayer = new TileLayer({
    id: "globe-background-layer",
    data: "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    minZoom: 0,
    maxZoom: 19,
    renderSubLayers: (props) => {
      const { west, south, east, north } = props.tile.bbox as any;

      return new BitmapLayer(props, {
        data: undefined,
        image: props.data,
        bounds: [west, south, east, north],
      });
    },
  });

  const layers = [
    isGlobeMode ? globeBackgroundLayer : null,
    activeLayers.flights ? new IconLayer({
      id: "flight-icons",
      data: sparse ? flights.slice(0, Math.max(1, Math.floor(flights.length * (density / 100)))) : flights,
      pickable: true,
      getIcon: (d) => ({
        url: AIRPLANE_SVG,
        width: 24,
        height: 24,
        anchorY: 12,
        mask: true,
      }),
      sizeScale: 1,
      getPosition: (d: any) => {
        if (!d.lastUpdated || !d.velocity || d.track == null) {
          return [d.lng, d.lat, isGlobeMode ? d.baro_altitude || 10000 : 0];
        }
        
        // Dead reckoning: calculate exact position based on velocity and heading
        const secondsElapsed = (timeTick - d.lastUpdated) / 1000;
        const distanceMeters = d.velocity * secondsElapsed;
        
        // Convert heading to radians
        const trackRad = (d.track * Math.PI) / 180;
        
        // delta x (longitude) and delta y (latitude)
        const dx = distanceMeters * Math.sin(trackRad);
        const dy = distanceMeters * Math.cos(trackRad);
        
        // Approx meters per degree
        const deltaLat = dy / 111320;
        const deltaLng = dx / (111320 * Math.cos((d.lat * Math.PI) / 180));
        
        return [
          d.lng + deltaLng,
          d.lat + deltaLat,
          isGlobeMode ? (d.baro_altitude || 10000) + ((d.vertical_rate || 0) * secondsElapsed) : 0
        ];
      },
      getSize: (d) => (isGlobeMode ? 32 : bloom > 120 ? 30 : 24),
      getAngle: (d: any) => d.track || 0,
      getColor: (d: any) => getAltitudeColor(d.geo_altitude || d.baro_altitude),
      autoHighlight: true,
      updateTriggers: {
        getPosition: [timeTick]
      },
      onClick: ({ object }) => {
        if (object) {
          setSelectedFlight(object);
          setViewState((prev) => ({
            ...prev,
            longitude: object.lng,
            latitude: object.lat,
            zoom: 8,
            transitionDuration: 1000,
          }));
        }
      },
    }) : null,
    activeLayers.satellites ? new IconLayer({
      id: "satellite-icons",
      data: sparse ? satellites.slice(0, Math.max(1, Math.floor(satellites.length * (density / 100)))) : satellites,
      pickable: true,
      getIcon: (d) => ({
        url: SATELLITE_SVG,
        width: 128,
        height: 128,
        anchorY: 64,
        mask: true,
      }),
      getPosition: (d: any) => {
        if (!d.satrec) return [0, 0, 0];
        try {
          const date = new Date(timeTick);
          const positionAndVelocity = satellite.propagate(d.satrec, date);
          if (positionAndVelocity.position && typeof positionAndVelocity.position !== "boolean") {
            const gmst = satellite.gstime(date);
            const positionGd = satellite.eciToGeodetic(positionAndVelocity.position as any, gmst);
            return [
              satellite.degreesLong(positionGd.longitude),
              satellite.degreesLat(positionGd.latitude),
              isGlobeMode ? positionGd.height * 1000 : 0
            ];
          }
        } catch(e) {}
        return [0, 0, 0];
      },
      getSize: (d) => (isGlobeMode ? 24 : bloom > 120 ? 20 : 16),
      getColor: (d: any) => [0, 229, 255],
      autoHighlight: true,
      highlightColor: [255, 255, 255],
      updateTriggers: {
        getPosition: [timeTick],
      },
      onClick: (info) => {
        if (info.object) {
          setSelectedFlight({
            ...info.object,
            callsign: info.object.name,
            isSatellite: true,
          });
        }
      },
    }) : null,
    flightRoute && flightRoute.points ? new PathLayer({
      id: "flight-route",
      data: [flightRoute],
      getPath: (d: any) => d.points,
      getColor: selectedFlight?.isSatellite ? [0, 229, 255, 200] : [255, 255, 255, 200],
      getWidth: 3,
      widthMinPixels: 2,
    }) : null
  ].filter(Boolean);

  const views = isGlobeMode
    ? [new GlobeView({ id: "globe", controller: true, resolution: 2 })]
    : [new MapView({ id: "map", controller: true })];

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Top Controls: View Toggle */}
      <div className="w-full flex justify-center pointer-events-auto">
        <button
          onClick={() => setIsGlobeMode(!isGlobeMode)}
          className="bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 transition-all font-mono text-xs uppercase tracking-widest flex items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-white/10 text-white font-bold"
        >
          {isGlobeMode ? (
            <MapIcon className="w-4 h-4 text-[#00E5FF]" />
          ) : (
            <Globe2 className="w-4 h-4 text-[#00E5FF]" />
          )}
          {isGlobeMode ? "Switch to Map View" : "Switch to Planet View"}
        </button>
      </div>

      <div className="w-full flex-1 relative group rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,229,255,0.05)] bg-[#0A0A0C] flex flex-row">
        {/* Custom Zoom Controls - Positioned outside DeckGL for perfect event handling */}
        {hud && (
          <div className="absolute bottom-24 right-4 z-[100] flex flex-col gap-2 pointer-events-auto">
            <button
              onClick={() => handleZoom(1)}
              className="w-10 h-10 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors shadow-xl text-xl font-bold"
            >
              +
            </button>
            <button
              onClick={() => handleZoom(-1)}
              className="w-10 h-10 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors shadow-xl text-xl font-bold"
            >
              -
            </button>
          </div>
        )}

        {/* Map Area */}
        <div 
          className="flex-1 relative h-full transition-all duration-700" 
          style={{ 
            filter: `contrast(${100 + (sharpen - 50)}%) saturate(${100 + (sharpen - 50) * 0.5}%) ${bloom > 110 ? `brightness(1.15) drop-shadow(0 0 ${bloom/10}px rgba(0,229,255,0.15))` : ''}` 
          }}
        >
          <DeckGL
            views={views}
            viewState={viewState as any}
            onViewStateChange={(e) => setViewState(e.viewState as any)}
            controller={true}
            layers={layers}
            getTooltip={({ object }) =>
              object && !selectedFlight
                ? `${object.callsign}\n${object.country}`
                : null
            }
            style={{ position: "absolute", width: "100%", height: "100%" }}
          >
            {/* reuseMaps perfectly aligns Maplibre and DeckGL, but maplibre only works in 2D MapView */}
            {!isGlobeMode && (
              <Map mapStyle={MAP_STYLE} renderWorldCopies={false} reuseMaps />
            )}
          </DeckGL>

          {/* Top Left Indicator */}
          <div className={`absolute top-4 left-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex flex-col gap-1 pointer-events-none z-10 transition-opacity duration-300 ${!hud ? "opacity-0" : "opacity-100"}`}>
            <div className="flex items-center gap-3">
              <div className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${error ? "bg-red-500" : "bg-[#00E5FF] animate-ping"}`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${error ? "bg-red-500" : "bg-[#00E5FF]"}`}
                ></span>
              </div>
              <span className="text-xs font-mono text-[#00E5FF] uppercase tracking-widest font-bold">
                Live ADS-B Radar
              </span>
            </div>
            <span className="text-[10px] font-mono text-white/50 pl-5">
              {loading
                ? "Establishing Uplink..."
                : error
                  ? "Connection Failed"
                  : `Tracking ${flights.length.toLocaleString()} Active Flights`}
            </span>
          </div>

          {/* Bottom Panel Link */}
          <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-auto transition-opacity duration-300 ${!hud ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <Link
              href={activeLayers.satellites && !activeLayers.flights ? `/satellites?from=${isGlobeMode ? 'globe' : 'map'}` : `/flights?from=${isGlobeMode ? 'globe' : 'map'}`}
              className="bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] backdrop-blur-md px-6 py-3 rounded-full border border-[#00E5FF]/30 transition-all font-mono text-xs uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.1)] hover:shadow-[0_0_30px_rgba(0,229,255,0.2)]"
            >
              <ExternalLink className="w-4 h-4" />
              {activeLayers.satellites && !activeLayers.flights ? "Open Global Satellites Dashboard" : "Open Global Flights Dashboard"}
            </Link>
          </div>

          {/* Altitude Legend */}
          <div className={`absolute bottom-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-white/10 z-10 pointer-events-none transition-opacity duration-300 hidden md:block ${!hud ? "opacity-0" : "opacity-100"}`}>
            <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest mb-2 block">
              Altitude (ft)
            </span>
            <div className="w-48 h-2 rounded-full bg-gradient-to-r from-orange-500 via-green-500 to-[#4000FF] mb-1" />
            <div className="flex justify-between text-[8px] font-mono text-white/40">
              <span>0</span>
              <span>10k</span>
              <span>20k</span>
              <span>30k</span>
              <span>40k+</span>
            </div>
          </div>
          {/* Clean UI Restore Button */}
          {!hud && (
            <button
              onClick={() => onRestoreHud && onRestoreHud()}
              className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto z-[100] bg-black/80 backdrop-blur-md p-3 rounded-full border border-white/10 hover:border-white/30 text-white/50 hover:text-white transition-all shadow-[0_0_20px_rgba(0,0,0,0.8)]"
            >
              <EyeOff className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Selected Flight Sidebar (Slide-in Dashboard) */}
        {selectedFlight && (
          <div className="w-full md:w-[350px] shrink-0 bg-black/95 backdrop-blur-xl border-l border-white/10 h-full overflow-y-auto z-20 flex flex-col pointer-events-auto shadow-2xl absolute md:relative right-0 top-0">
            <div className="p-4 border-b border-white/10 flex items-start justify-between sticky top-0 bg-black/95 z-10 backdrop-blur-xl">
              <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-heading text-white leading-none">
                  {selectedFlight.callsign}
                </h3>
                <p className="text-sm font-body font-semibold text-[#00E5FF] drop-shadow-[0_0_10px_rgba(0,229,255,0.3)]">
                  {getAirlineFromCallsign(selectedFlight.callsign)}
                </p>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                  {selectedFlight.country}
                </p>
              </div>
              <button
                onClick={() => setSelectedFlight(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors border border-transparent hover:border-white/20"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-6">
              {/* Routing Data (From/To) */}
              {flightRoute && flightRoute.route && (
                <div>
                  <h4 className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
                    Flight Route
                  </h4>
                  <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3 flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-[10px] text-white/40 uppercase font-mono mb-1">
                        Origin
                      </p>
                      <p className="text-xl font-heading text-white">
                        {flightRoute.route[0]}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center px-4 opacity-50">
                      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-white/40 uppercase font-mono mb-1">
                        Destination
                      </p>
                      <p className="text-xl font-heading text-white">
                        {flightRoute.route[1]}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Spatial Data */}
              <div>
                <h4 className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
                  Spatial
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-mono">
                      Groundspeed
                    </p>
                    <p className="text-sm font-mono text-white">
                      {selectedFlight.velocity
                        ? Math.round(selectedFlight.velocity * 1.94384)
                        : "N/A"}{" "}
                      kt
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-mono">
                      Baro. Altitude
                    </p>
                    <p className="text-sm font-mono text-white">
                      {selectedFlight.baro_altitude
                        ? Math.round(
                            selectedFlight.baro_altitude * 3.28084,
                          ).toLocaleString()
                        : "N/A"}{" "}
                      ft
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-mono">
                      Geo. Altitude
                    </p>
                    <p className="text-sm font-mono text-white">
                      {selectedFlight.geo_altitude
                        ? Math.round(
                            selectedFlight.geo_altitude * 3.28084,
                          ).toLocaleString()
                        : "N/A"}{" "}
                      ft
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-mono">
                      Vert. Rate
                    </p>
                    <p className="text-sm font-mono text-white">
                      {selectedFlight.vertical_rate
                        ? Math.round(selectedFlight.vertical_rate * 196.85)
                        : 0}{" "}
                      ft/min
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-mono">
                      Track (Heading)
                    </p>
                    <p className="text-sm font-mono text-white">
                      {Math.round(selectedFlight.track)}&deg;
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-mono">
                      Position
                    </p>
                    <p className="text-[11px] font-mono text-[#00E5FF]">
                      {selectedFlight.lat?.toFixed(3)}&deg;,{" "}
                      {selectedFlight.lng?.toFixed(3)}&deg;
                    </p>
                  </div>
                </div>
              </div>

              {/* Signal & Identity */}
              <div>
                <h4 className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
                  Identity & Signal
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-mono">
                      Hex ID
                    </p>
                    <p className="text-sm font-mono text-white">
                      {selectedFlight.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-mono">
                      Squawk
                    </p>
                    <p className="text-sm font-mono text-white">
                      {selectedFlight.squawk || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-mono">
                      Source
                    </p>
                    <p className="text-sm font-mono text-white">
                      {selectedFlight.position_source === 0
                        ? "ADS-B"
                        : selectedFlight.position_source === 1
                          ? "ASTERIX"
                          : selectedFlight.position_source === 2
                            ? "MLAT"
                            : "FLARM"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-mono">
                      Last Contact
                    </p>
                    <p className="text-sm font-mono text-white">
                      {selectedFlight.last_contact
                        ? `${Math.floor(Date.now() / 1000 - selectedFlight.last_contact)}s ago`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
