"use client";

import React from "react";
import { Plane, Loader2 } from "lucide-react";
import { Flight } from "@/components/WorldviewMap";

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

interface FlightsTableProps {
  flights: Flight[];
  loading: boolean;
  onSelect: (flight: Flight) => void;
}

export function FlightsTable({ flights, loading, onSelect }: FlightsTableProps) {
  return (
    <div className="flex-1 overflow-hidden border border-white/10 rounded-2xl bg-[#0A0A0C]/80 backdrop-blur-md flex flex-col mb-8">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
        <h3 className="text-sm font-mono text-[#00E5FF] uppercase tracking-widest font-bold flex items-center gap-2">
          <Plane className="w-4 h-4" />
          Air Domain Intelligence
        </h3>
        <span className="text-[10px] font-mono text-white/40 uppercase">{flights.length} Targets Active</span>
      </div>
      <div className="overflow-auto max-h-[400px]">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="sticky top-0 bg-black/95 border-b border-white/10 z-10">
            <tr>
              <th className="p-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">Callsign</th>
              <th className="p-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">Airline</th>
              <th className="p-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">Altitude</th>
              <th className="p-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">Speed</th>
              <th className="p-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">Country</th>
            </tr>
          </thead>
          <tbody>
            {loading && flights.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-white/30 font-mono text-[10px]">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                  SYNCING AIR TRAFFIC...
                </td>
              </tr>
            ) : (
              flights.map((f) => (
                <tr key={f.id} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer group" onClick={() => onSelect(f)}>
                  <td className="p-4 font-mono text-sm text-[#00E5FF]">{f.callsign}</td>
                  <td className="p-4 font-body text-sm font-semibold">{getAirlineFromCallsign(f.callsign)}</td>
                  <td className="p-4 font-mono text-sm text-white/60">{f.baro_altitude ? `${Math.round(f.baro_altitude * 3.28084).toLocaleString()} ft` : "SFC"}</td>
                  <td className="p-4 font-mono text-sm text-white/60">{f.velocity ? `${Math.round(f.velocity * 1.94384)} kt` : "0"}</td>
                  <td className="p-4 font-body text-xs text-white/40">{f.country}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
