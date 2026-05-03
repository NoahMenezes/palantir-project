"use client";

import React, { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { ArrowLeft, Loader2, Satellite, X } from "lucide-react";
import * as satellite from "satellite.js";

export interface SatelliteData {
  id: string;
  name: string;
  tle1: string;
  tle2: string;
  satrec?: satellite.SatRec;
}

export interface PropagatedSat {
  lat: number;
  lng: number;
  alt: number;
  vel: number;
}

export default function AllSatellitesPage() {
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSat, setSelectedSat] = useState<SatelliteData | null>(null);
  const [timeTick, setTimeTick] = useState(0);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const tid = setTimeout(() => {
      setTimeTick(Date.now());
    }, 0);
    return () => clearTimeout(tid);
  }, []);

  const fetchSatellites = React.useCallback(async () => {
    try {
      const res = await fetch("/api/satellites");
      const data = await res.json();
      
      const parsed: SatelliteData[] = (data.satellites || []).map((s: SatelliteData) => {
        try {
          return { ...s, satrec: satellite.twoline2satrec(s.tle1, s.tle2) };
        } catch(e) { 
          console.error("Error parsing TLE for satellite", s.name, e);
          return null; 
        }
      }).filter((s: SatelliteData | null): s is SatelliteData => s !== null);
      
      setSatellites(parsed);
      setLoading(false);
      
      if (selectedSat) {
        const updated = parsed.find((s: SatelliteData) => s.id === selectedSat.id);
        if (updated) setSelectedSat(updated);
      }
    } catch (err) {
      console.warn("Failed to fetch satellites", err);
      setLoading(false);
    }
  }, [selectedSat]);

  useEffect(() => {
    const tid = setTimeout(() => {
      fetchSatellites();
    }, 0);
    return () => clearTimeout(tid);
  }, [fetchSatellites]);

  useEffect(() => {
    let lastUpdate = Date.now();
    const updateTick = () => {
      const now = Date.now();
      if (now - lastUpdate > 1000) { // UI ticks every 1s
        setTimeTick(now);
        lastUpdate = now;
      }
      requestRef.current = requestAnimationFrame(updateTick);
    };
    requestRef.current = requestAnimationFrame(updateTick);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const getSatData = (sat: SatelliteData): PropagatedSat | null => {
    if (!sat || !sat.satrec) return null;
    try {
      const date = new Date(timeTick || (typeof window !== 'undefined' ? Date.now() : 0));
      const positionAndVelocity = satellite.propagate(sat.satrec, date);
      if (positionAndVelocity.position && typeof positionAndVelocity.position !== "boolean" && positionAndVelocity.velocity && typeof positionAndVelocity.velocity !== "boolean") {
        const gmst = satellite.gstime(date);
        const positionGd = satellite.eciToGeodetic(positionAndVelocity.position as satellite.EciVec3<number>, gmst);
        
        // velocity is in km/s. Convert to km/h
        const vx = positionAndVelocity.velocity.x;
        const vy = positionAndVelocity.velocity.y;
        const vz = positionAndVelocity.velocity.z;
        const velocityKms = Math.sqrt(vx*vx + vy*vy + vz*vz);
        
        return {
          lat: satellite.degreesLat(positionGd.latitude),
          lng: satellite.degreesLong(positionGd.longitude),
          alt: positionGd.height, // km
          vel: velocityKms * 3600 // km/h
        };
      }
    } catch(e) {
      console.error("Error propagating satellite", sat.name, e);
    }
    return null;
  };

  const selectedSatData = React.useMemo(() => getSatData(selectedSat as SatelliteData), [selectedSat, timeTick]);

  return (
    <div className="bg-[#050505] min-h-screen text-white flex flex-col font-body">
      <Navbar />

      <div className="flex-1 flex overflow-hidden pt-20">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full relative">
          
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/worldview" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl md:text-4xl font-heading tracking-tight flex items-center gap-3">
                  <Satellite className="w-8 h-8 text-[#00E5FF]" />
                  Active Satellites
                </h1>
                <p className="text-white/40 font-mono text-xs mt-1 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {satellites.length.toLocaleString()} Active Targets Traced
                </p>
              </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-auto p-6 md:p-8">
            <div className="rounded-xl border border-white/10 bg-[#0A0A0C] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">Target Name</th>
                    <th className="p-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">NORAD ID</th>
                    <th className="p-4 text-[10px] font-mono text-white/40 uppercase tracking-widest text-right">Altitude (km)</th>
                    <th className="p-4 text-[10px] font-mono text-white/40 uppercase tracking-widest text-right">Velocity (km/h)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-4 text-white/40">
                          <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
                          <p className="font-mono text-xs uppercase tracking-widest">Connecting to CelesTrak...</p>
                        </div>
                      </td>
                    </tr>
                  ) : satellites.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-white/40 font-mono text-sm">
                        No satellites currently traced.
                      </td>
                    </tr>
                  ) : (
                    satellites.slice(0, 50).map((sat) => {
                      const data = getSatData(sat);
                      return (
                        <tr 
                          key={sat.id} 
                          onClick={() => setSelectedSat(sat)}
                          className={`hover:bg-white/5 cursor-pointer transition-colors ${selectedSat?.id === sat.id ? 'bg-[#00E5FF]/10' : ''}`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Satellite className={`w-4 h-4 ${selectedSat?.id === sat.id ? 'text-[#00E5FF]' : 'text-white/30'}`} />
                              <span className="font-bold text-sm tracking-wide">{sat.name}</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-xs text-white/50">{sat.id}</td>
                          <td className="p-4 font-mono text-sm text-[#00E5FF] text-right">
                            {data ? Math.round(data.alt).toLocaleString() : "N/A"}
                          </td>
                          <td className="p-4 font-mono text-sm text-white text-right">
                            {data ? Math.round(data.vel).toLocaleString() : "N/A"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              {!loading && satellites.length > 50 && (
                <div className="p-4 border-t border-white/5 text-center">
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Showing top 50 of {satellites.length} satellites to maintain system performance.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Satellite Sidebar */}
        {selectedSat && (
          <div className="w-[350px] shrink-0 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl h-full overflow-y-auto z-20 flex flex-col pointer-events-auto shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-white/10 flex items-start justify-between sticky top-0 bg-black/95 z-10 backdrop-blur-xl">
              <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-heading text-white leading-none">{selectedSat.name}</h3>
                <p className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-wider mt-1">NORAD ID: {selectedSat.id}</p>
              </div>
              <button onClick={() => setSelectedSat(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors border border-transparent hover:border-white/20">
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-6">
              
              <div>
                <h4 className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Telemetry</h4>
                <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-white/40 uppercase font-mono">Latitude</p>
                          <p className="text-sm font-mono text-white">{selectedSatData ? selectedSatData.lat.toFixed(4) : "N/A"}&deg;</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/40 uppercase font-mono">Longitude</p>
                          <p className="text-sm font-mono text-white">{selectedSatData ? selectedSatData.lng.toFixed(4) : "N/A"}&deg;</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/40 uppercase font-mono">Altitude</p>
                          <p className="text-sm font-mono text-[#00E5FF]">{selectedSatData ? Math.round(selectedSatData.alt).toLocaleString() : "N/A"} km</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-white/40 uppercase font-mono">Velocity</p>
                          <p className="text-sm font-mono text-white">{selectedSatData ? Math.round(selectedSatData.vel).toLocaleString() : "N/A"} km/h</p>
                        </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Raw Orbital Data (TLE)</h4>
                <div className="bg-black/50 border border-white/10 rounded-lg p-3 overflow-x-auto">
                  <p className="text-[10px] font-mono text-white/60 whitespace-pre">{selectedSat.name}</p>
                  <p className="text-[10px] font-mono text-white/60 whitespace-pre mt-1">{selectedSat.tle1}</p>
                  <p className="text-[10px] font-mono text-white/60 whitespace-pre mt-1">{selectedSat.tle2}</p>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
