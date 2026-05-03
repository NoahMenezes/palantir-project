"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { ArrowLeft, Loader2, Plane } from "lucide-react";

// Massive dictionary of standard ICAO Airline Codes
const AIRLINE_CODES: Record<string, string> = {
  "QTR": "Qatar Airways", "SIA": "Singapore Airlines", "UAE": "Emirates", "SEJ": "SpiceJet", 
  "BAW": "British Airways", "AAL": "American Airlines", "DAL": "Delta Air Lines", "UAL": "United Airlines",
  "RYR": "Ryanair", "EZY": "easyJet", "EZS": "easyJet Switzerland", "AFR": "Air France",
  "DLH": "Lufthansa", "IGO": "IndiGo", "AIC": "Air India", "AXM": "AirAsia",
  "CPA": "Cathay Pacific", "THA": "Thai Airways", "JAL": "Japan Airlines", "ANA": "All Nippon Airways",
  "QFA": "Qantas", "ANZ": "Air New Zealand", "ACA": "Air Canada", "WJA": "WestJet",
  "SWA": "Southwest Airlines", "JBU": "JetBlue", "ASA": "Alaska Airlines", "NKS": "Spirit Airlines",
  "KLM": "KLM Royal Dutch Airlines", "VIR": "Virgin Atlantic", "THY": "Turkish Airlines", "ETD": "Etihad Airways",
  "SVA": "Saudia", "MSR": "EgyptAir", "GIA": "Garuda Indonesia", "MAS": "Malaysia Airlines",
  "PAL": "Philippine Airlines", "KAL": "Korean Air", "AAR": "Asiana Airlines", "CAL": "China Airlines",
  "EVA": "EVA Air", "CSN": "China Southern Airlines", "CCA": "Air China", "CES": "China Eastern Airlines",
  "HVN": "Vietnam Airlines", "VJC": "VietJet Air", "CEB": "Cebu Pacific", "GFA": "Gulf Air",
  "VTI": "Vistara", "LNI": "Lion Air", "BTK": "Batik Air", "AWQ": "Indonesia AirAsia",
  "IBE": "Iberia", "AEA": "Air Europa", "VLG": "Vueling", "SWR": "Swiss International Air Lines",
  "AUA": "Austrian Airlines", "FIN": "Finnair", "SAS": "SAS Scandinavian Airlines", "NAX": "Norwegian Air Shuttle",
  "WZZ": "Wizz Air", "RJA": "Royal Jordanian", "MEA": "Middle East Airlines", "KAC": "Kuwait Airways",
  "OMA": "Oman Air", "BBC": "Biman Bangladesh Airlines", "ALK": "SriLankan Airlines", "FDB": "flydubai",
  "ABY": "Air Arabia", "GOW": "Go First", "IAD": "AirAsia India", "LLR": "Alliance Air",
  "AZA": "ITA Airways", "ELY": "El Al", "ETH": "Ethiopian Airlines", "KQA": "Kenya Airways",
  "RAM": "Royal Air Maroc", "AMX": "Aeroméxico", "VOI": "Volaris", "LAN": "LATAM Airlines",
  "TAM": "LATAM Brasil", "AZU": "Azul Linhas Aéreas", "GLO": "Gol Transportes Aéreos", "ARG": "Aerolíneas Argentinas",
  "SKU": "Sky Airline", "JST": "Jetstar Airways", "VOZ": "Virgin Australia", "RXA": "Regional Express"
};

function getAirlineFromCallsign(callsign: string): string {
  if (!callsign || callsign === "UNKNOWN") return "Private / General";
  const prefix = callsign.substring(0, 3).toUpperCase();
  if (/^[A-Z]{3}$/.test(prefix)) {
    return AIRLINE_CODES[prefix] || "Commercial Flight";
  }
  return "Private / General";
}

export default function AllFlightsPage() {
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState<any | null>(null);
  const [flightRoute, setFlightRoute] = useState<any | null>(null);

  const fetchFlights = async () => {
    try {
      const res = await fetch("/api/flights");
      const data = await res.json();
      setFlights(data.flights || []);
      setLoading(false);
      
      // Update selected flight if it exists in the new data
      if (selectedFlight) {
        const updated = data.flights?.find((f: any) => f.id === selectedFlight.id);
        if (updated) setSelectedFlight(updated);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 10000);
    return () => clearInterval(interval);
  }, [selectedFlight?.id]);

  useEffect(() => {
    if (selectedFlight && selectedFlight.callsign && selectedFlight.callsign !== "UNKNOWN") {
      setFlightRoute(null);
      fetch(`/api/flight-route?callsign=${selectedFlight.callsign}`)
        .then(res => res.json())
        .then(data => {
          if (data.route && data.route.route) setFlightRoute(data.route);
        }).catch(err => console.error(err));
    } else {
      setFlightRoute(null);
    }
  }, [selectedFlight?.id]);

  return (
    <div className="bg-black min-h-screen relative text-white overflow-hidden flex flex-col">
      <Navbar />

      <div className="relative z-10 w-full flex-1 px-4 lg:px-16 pt-32 pb-8 flex flex-row h-full max-h-screen overflow-hidden gap-6">
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 shrink-0">
            <div>
              <div className="liquid-glass border border-white/10 rounded-xl px-4 py-2 mb-4 inline-flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
                <span className="text-xs font-mono text-[#00E5FF] uppercase tracking-widest font-bold">Global Database</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-heading italic tracking-tighter">Active Flight Directory</h1>
            </div>
            
            <Link href="/worldview" className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 transition-all font-mono text-xs uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <ArrowLeft className="w-4 h-4" />
              Back to Radar Map
            </Link>
          </div>

          {/* Data Table */}
          <div className="flex-1 overflow-hidden border border-white/10 rounded-2xl bg-[#0A0A0C]/80 backdrop-blur-md flex flex-col shadow-[0_0_50px_rgba(0,229,255,0.02)]">
            <div className="overflow-auto flex-1">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-white/10 z-10 shadow-xl">
                  <tr>
                    <th className="p-4 text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest">Callsign</th>
                    <th className="p-4 text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest">Airline</th>
                    <th className="p-4 text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest">Origin Country</th>
                    <th className="p-4 text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest">Hex ID</th>
                    <th className="p-4 text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest">Squawk</th>
                    <th className="p-4 text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest text-right">Altitude (ft)</th>
                    <th className="p-4 text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest text-right">Speed (kt)</th>
                    <th className="p-4 text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest text-right">Track</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && flights.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-16 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#00E5FF] mb-4" />
                        <p className="text-xs font-mono text-white/50 uppercase tracking-widest">Fetching global telemetry database...</p>
                      </td>
                    </tr>
                  ) : (
                    flights.map((flight, i) => (
                      <tr 
                        key={`${flight.id}-${i}`} 
                        className={`border-b border-white/5 hover:bg-white/[0.04] transition-colors group cursor-pointer ${selectedFlight?.id === flight.id ? 'bg-white/[0.06]' : ''}`}
                        onClick={() => setSelectedFlight(flight)}
                      >
                        <td className="p-4 flex items-center gap-3">
                          <Plane className="w-4 h-4 text-[#00E5FF] opacity-50 group-hover:opacity-100 transition-opacity" style={{ transform: `rotate(${flight.track - 90}deg)` }} />
                          <span className="font-mono text-sm text-white">{flight.callsign}</span>
                        </td>
                        <td className="p-4 font-body text-sm font-semibold text-[#00E5FF] drop-shadow-[0_0_10px_rgba(0,229,255,0.3)]">{getAirlineFromCallsign(flight.callsign)}</td>
                        <td className="p-4 font-body text-sm text-white/80">{flight.country}</td>
                        <td className="p-4 font-mono text-sm text-white/40">{flight.id}</td>
                        <td className="p-4 font-mono text-sm text-white/60">{flight.squawk || "N/A"}</td>
                        <td className="p-4 font-mono text-sm text-[#00E5FF] text-right">
                          {flight.baro_altitude ? Math.round(flight.baro_altitude * 3.28084).toLocaleString() : "GROUND"}
                        </td>
                        <td className="p-4 font-mono text-sm text-white text-right">
                          {flight.velocity ? Math.round(flight.velocity * 1.94384) : 0}
                        </td>
                        <td className="p-4 font-mono text-sm text-white/60 text-right">
                          {Math.round(flight.track)}&deg;
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Selected Flight Sidebar */}
        {selectedFlight && (
          <div className="w-[350px] shrink-0 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl h-full overflow-y-auto z-20 flex flex-col pointer-events-auto shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-white/10 flex items-start justify-between sticky top-0 bg-black/95 z-10 backdrop-blur-xl">
              <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-heading text-white leading-none">{selectedFlight.callsign}</h3>
                <p className="text-sm font-body font-semibold text-[#00E5FF] drop-shadow-[0_0_10px_rgba(0,229,255,0.3)]">{getAirlineFromCallsign(selectedFlight.callsign)}</p>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">{selectedFlight.country}</p>
              </div>
              <button onClick={() => setSelectedFlight(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors border border-transparent hover:border-white/20">
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-6">
              {flightRoute && flightRoute.route && (
                <div>
                  <h4 className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Flight Route</h4>
                  <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3 flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-[10px] text-white/40 uppercase font-mono mb-1">Origin</p>
                      <p className="text-xl font-heading text-white">{flightRoute.route[0]}</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center px-4 opacity-50">
                      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-white/40 uppercase font-mono mb-1">Destination</p>
                      <p className="text-xl font-heading text-white">{flightRoute.route[1]}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Spatial</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-mono">Groundspeed</p>
                    <p className="text-sm font-mono text-white">{selectedFlight.velocity ? Math.round(selectedFlight.velocity * 1.94384) : "N/A"} kt</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-mono">Baro. Altitude</p>
                    <p className="text-sm font-mono text-white">{selectedFlight.baro_altitude ? Math.round(selectedFlight.baro_altitude * 3.28084).toLocaleString() : "N/A"} ft</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-mono">Geo. Altitude</p>
                    <p className="text-sm font-mono text-white">{selectedFlight.geo_altitude ? Math.round(selectedFlight.geo_altitude * 3.28084).toLocaleString() : "N/A"} ft</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-mono">Vert. Rate</p>
                    <p className="text-sm font-mono text-white">{selectedFlight.vertical_rate ? Math.round(selectedFlight.vertical_rate * 196.85) : 0} ft/min</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Identity & Signal</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-mono">Hex ID</p>
                    <p className="text-sm font-mono text-white">{selectedFlight.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-mono">Squawk</p>
                    <p className="text-sm font-mono text-white">{selectedFlight.squawk || "N/A"}</p>
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
