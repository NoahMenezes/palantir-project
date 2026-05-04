"use client";

import React from "react";
import { Anchor, Loader2 } from "lucide-react";
import { ShipData } from "@/components/WorldviewMap";

interface ShipsTableProps {
  ships: ShipData[];
  loading: boolean;
}

export function ShipsTable({ ships, loading }: ShipsTableProps) {
  return (
    <div className="flex-1 overflow-hidden border border-white/10 rounded-2xl bg-[#0A0A0C]/80 backdrop-blur-md flex flex-col mb-8">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
        <h3 className="text-sm font-mono text-[#00E5FF] uppercase tracking-widest font-bold flex items-center gap-2">
          <Anchor className="w-4 h-4" />
          Maritime Domain Intelligence
        </h3>
        <span className="text-[10px] font-mono text-white/40 uppercase">{ships.length} Vessels Tracking</span>
      </div>
      <div className="overflow-auto max-h-[400px]">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="sticky top-0 bg-black/95 border-b border-white/10 z-10">
            <tr>
              <th className="p-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">Vessel Name</th>
              <th className="p-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">MMSI</th>
              <th className="p-4 text-[10px] font-mono text-white/40 uppercase tracking-widest text-right">Speed (kt)</th>
              <th className="p-4 text-[10px] font-mono text-white/40 uppercase tracking-widest text-right">Course</th>
              <th className="p-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">Type</th>
            </tr>
          </thead>
          <tbody>
            {loading && ships.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-white/30 font-mono text-[10px]">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                  POLLING AIS NETWORK...
                </td>
              </tr>
            ) : (
              ships.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer group">
                  <td className="p-4 font-mono text-sm text-[#00E5FF]">{s.name}</td>
                  <td className="p-4 font-mono text-sm text-white/40">{s.mmsi}</td>
                  <td className="p-4 font-mono text-sm text-white/60 text-right">{s.sog}</td>
                  <td className="p-4 font-mono text-sm text-white/60 text-right">{s.cog}&deg;</td>
                  <td className="p-4 font-body text-xs text-white/60">Commercial Vessel</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
