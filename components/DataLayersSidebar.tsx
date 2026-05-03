"use client";

import { Plane, Medal, Activity, Satellite, Car, CloudRain, Cctv, Bike, Minus } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const LAYERS = [
  { id: "flights", icon: Plane, name: "Live Flights", source: "OpenSky Network", time: "5m ago", count: "6.9K", iconColor: "text-blue-400" },
  { id: "military", icon: Medal, name: "Military Flights", source: "adsb.lol", time: "4m ago", count: "156", iconColor: "text-yellow-500" },
  { id: "earthquakes", icon: Activity, name: "Earthquakes (24h)", source: "USGS", time: "never", count: "-", iconColor: "text-orange-400" },
  { id: "satellites", icon: Satellite, name: "Satellites", source: "CelesTrak", time: "10m ago", count: "180", iconColor: "text-blue-500" },
  { id: "traffic", icon: Car, name: "Street Traffic", source: "OpenStreetMap", time: "loading...", count: "-", iconColor: "text-red-500" },
  { id: "weather", icon: CloudRain, name: "Weather Radar", source: "NOAA NEXRAD (globe overlay)", time: "never", count: "-", iconColor: "text-white" },
  { id: "cctv", icon: Cctv, name: "CCTV Mesh", source: "CCTV Mesh + Street View fallback", time: "never", count: "-", iconColor: "text-gray-400" },
  { id: "bikeshare", icon: Bike, name: "Bikeshare", source: "GBFS", time: "never", count: "-", iconColor: "text-purple-400" },
];

export function DataLayersSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({});

  const toggleLayer = (id: string) => {
    setActiveLayers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-[340px] bg-[#0A0A0C]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col font-body text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <h3 className="text-[10px] font-mono tracking-widest text-white/50 font-bold uppercase">Data Layers</h3>
          <div className="h-[1px] w-8 bg-white/10" />
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-6 h-6 flex items-center justify-center rounded border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
      </div>

      {/* Content */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col gap-1 p-3"
          >
            {LAYERS.map((layer) => {
              const isActive = activeLayers[layer.id];
              return (
                <div key={layer.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-colors group">
                  {/* Icon */}
                  <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${layer.iconColor}`}>
                    <layer.icon className="w-5 h-5 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                  </div>
                  
                  {/* Text */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="text-sm font-semibold text-white/90 truncate">{layer.name}</span>
                    <span className="text-[10px] text-white/40 font-mono truncate">
                      {layer.source} &middot; {layer.time}
                    </span>
                  </div>
                  
                  {/* Count & Toggle */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-white/50 w-8 text-right">{layer.count}</span>
                    <button 
                      onClick={() => toggleLayer(layer.id)}
                      className={`px-3 py-1 text-[10px] font-bold tracking-wider rounded transition-all duration-300 border ${
                        isActive 
                          ? "bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/30 shadow-[0_0_10px_rgba(0,229,255,0.2)]" 
                          : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white/70"
                      }`}
                    >
                      {isActive ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
