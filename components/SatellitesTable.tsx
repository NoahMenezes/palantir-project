"use client";

import React from "react";
import { Satellite, Loader2, Search } from "lucide-react";
import { SatelliteData } from "@/components/WorldviewMap";

interface SatellitesTableProps {
  satellites: SatelliteData[];
  loading: boolean;
}

export function SatellitesTable({ satellites, loading }: SatellitesTableProps) {
  const [search, setSearch] = React.useState("");

  const filteredSatellites = satellites.filter((s) => {
    const searchLower = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(searchLower) ||
      s.id.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex-1 overflow-hidden border border-white/10 rounded-2xl bg-[#0A0A0C]/80 backdrop-blur-md flex flex-col mb-8">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02] gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-mono text-[#00E5FF] uppercase tracking-widest font-bold flex items-center gap-2">
            <Satellite className="w-4 h-4" />
            Orbital Intelligence
          </h3>
          <span className="text-[10px] font-mono text-white/40 uppercase hidden sm:inline">{satellites.length} Assets Tracked</span>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
          <input
            type="text"
            placeholder="FILTER BY DESIGNATION OR ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-full py-2 pl-9 pr-4 text-[10px] font-mono text-[#00E5FF] placeholder:text-white/20 focus:outline-none focus:border-[#00E5FF]/40 transition-all"
          />
        </div>
      </div>
      <div className="overflow-auto max-h-[400px]">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="sticky top-0 bg-black/95 border-b border-white/10 z-10">
            <tr>
              <th className="p-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">Designation</th>
              <th className="p-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">TLE Source</th>
              <th className="p-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">ID</th>
              <th className="p-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">Type</th>
            </tr>
          </thead>
          <tbody>
            {loading && satellites.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-white/30 font-mono text-[10px]">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                  ACQUIRING ORBITAL TELEMETRY...
                </td>
              </tr>
            ) : (
              filteredSatellites.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer group">
                  <td className="p-4 font-mono text-sm text-[#00E5FF]">{s.name}</td>
                  <td className="p-4 font-mono text-xs text-white/60 truncate max-w-[200px]">{s.tle1}</td>
                  <td className="p-4 font-mono text-sm text-white/40">{s.id}</td>
                  <td className="p-4 font-body text-xs text-white/60">Low Earth Orbit</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
