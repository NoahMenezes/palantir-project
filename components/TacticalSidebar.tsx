"use client";

import { Play, Sparkles, Search, Eye, EyeOff, Layout, Square, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface TacticalSidebarProps {
  bloom: number;
  setBloom: (v: number) => void;
  sharpen: number;
  setSharpen: (v: number) => void;
  hud: boolean;
  setHud: (v: boolean) => void;
  sparse: boolean;
  setSparse: (v: boolean) => void;
  density: number;
  setDensity: (v: number) => void;
  cleanUi: () => void;
}

export function TacticalSidebar({
  bloom, setBloom,
  sharpen, setSharpen,
  hud, setHud,
  sparse, setSparse,
  density, setDensity,
  cleanUi
}: TacticalSidebarProps) {
  return (
    <div className="w-[280px] flex flex-col gap-3 font-mono text-[11px] tracking-widest uppercase text-white/70">
      
      {/* MOVE */}
      <div className="bg-[#0A0A0C]/80 border border-white/10 rounded-2xl p-3 flex items-center justify-between group hover:border-white/20 transition-all cursor-pointer">
        <span className="opacity-50">Move</span>
        <Play className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
      </div>

      {/* BLOOM */}
      <div className="flex flex-col gap-2 bg-[#0A0A0C]/80 border border-[#00E5FF]/30 rounded-2xl p-3 shadow-[0_0_20px_rgba(0,229,255,0.05)]">
        <div className="flex items-center gap-3 text-[#00E5FF]">
          <Sparkles className="w-4 h-4" />
          <span className="font-bold">Bloom</span>
        </div>
        <div className="flex items-center gap-4 mt-1">
          <input 
            type="range" 
            min="0" 
            max="200" 
            value={bloom} 
            onChange={(e) => setBloom(parseInt(e.target.value))}
            className="flex-1 accent-[#00E5FF] h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
          />
          <span className="min-w-[40px] text-right text-[#00E5FF]/80">{bloom}%</span>
        </div>
      </div>

      {/* SHARPEN */}
      <div className="flex flex-col gap-2 bg-[#0A0A0C]/80 border border-[#00E5FF]/30 rounded-2xl p-3 shadow-[0_0_20px_rgba(0,229,255,0.05)]">
        <div className="flex items-center gap-3 text-[#00E5FF]">
          <Search className="w-4 h-4" />
          <span className="font-bold">Sharpen</span>
        </div>
        <div className="flex items-center gap-4 mt-1">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={sharpen} 
            onChange={(e) => setSharpen(parseInt(e.target.value))}
            className="flex-1 accent-[#00E5FF] h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
          />
          <span className="min-w-[40px] text-right text-[#00E5FF]/80">{sharpen}%</span>
        </div>
      </div>

      {/* HUD */}
      <div 
        onClick={() => setHud(!hud)}
        className={`bg-[#0A0A0C]/80 border ${hud ? 'border-[#00E5FF]/50 text-[#00E5FF]' : 'border-white/10 text-white/50'} rounded-2xl p-3 flex items-center gap-3 cursor-pointer transition-all hover:bg-white/5`}
      >
        {hud ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        <span className="font-bold">Hud</span>
      </div>

      {/* LAYOUT */}
      <div className="flex items-center justify-between p-1 pl-3 text-white/40">
        <span>Layout</span>
        <div className="bg-[#1A1A1E] border border-white/10 rounded-xl px-4 py-2 flex items-center gap-6 text-white/80 cursor-pointer hover:bg-[#252529] transition-colors">
          <span>Tactical</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </div>
      </div>

      {/* SPARSE */}
      <div className={`flex flex-col gap-2 bg-[#0A0A0C]/80 border ${sparse ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-white/10'} rounded-2xl p-3 transition-all`}>
        <div 
          onClick={() => setSparse(!sparse)}
          className={`flex items-center gap-3 cursor-pointer ${sparse ? 'text-green-500' : 'text-white/50'}`}
        >
          <div className={`w-3 h-3 rounded-sm ${sparse ? 'bg-green-500' : 'border border-white/20'}`} />
          <span className="font-bold">Sparse</span>
        </div>
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex justify-between items-center opacity-40 text-[9px]">
            <span>Density</span>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={density} 
              onChange={(e) => setDensity(parseInt(e.target.value))}
              className={`flex-1 ${sparse ? 'accent-green-500' : 'accent-white/20'} h-1 bg-white/10 rounded-full appearance-none cursor-pointer`}
            />
            <span className={`min-w-[40px] text-right ${sparse ? 'text-[#00E5FF]' : 'text-white/20'}`}>{density}%</span>
          </div>
        </div>
      </div>

      {/* CLEAN UI */}
      <button 
        onClick={cleanUi}
        className="mt-2 bg-transparent border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all rounded-2xl p-3 text-white/30 hover:text-white/60 text-center font-bold tracking-[0.3em]"
      >
        Clean Ui
      </button>

    </div>
  );
}
