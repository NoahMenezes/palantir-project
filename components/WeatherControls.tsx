"use client";

import { useState, useEffect } from "react";
import { 
  ChevronUp, ChevronDown, Play, Pause, SkipForward, Satellite, Radar, 
  CloudRain, Wind, Thermometer, Droplets, Gauge, Info, Search, Maximize, 
  Settings, X, Sun, Cloud
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type WeatherLayerType = "satellite" | "radar" | "precipitation" | "wind" | "temperature" | "humidity" | "pressure";

interface WeatherControlsProps {
  activeWeatherLayer: WeatherLayerType | null;
  setActiveWeatherLayer: (layer: WeatherLayerType | null) => void;
  weatherTime: number; // timestamp in seconds
  setWeatherTime: React.Dispatch<React.SetStateAction<number>>;
  availableTimes: number[];
}

export function WeatherControls({ activeWeatherLayer, setActiveWeatherLayer, weatherTime, setWeatherTime, availableTimes }: WeatherControlsProps) {
  const [menuOpen, setMenuOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const OPTIONS: { id: WeatherLayerType; icon: React.ComponentType<any>; label: string }[] = [
    { id: "satellite", icon: Satellite, label: "Satellite" },
    { id: "radar", icon: Radar, label: "Radar" },
    { id: "precipitation", icon: CloudRain, label: "Precipitation" },
    { id: "wind", icon: Wind, label: "Wind" },
    { id: "temperature", icon: Thermometer, label: "Temperature" },
    { id: "humidity", icon: Droplets, label: "Humidity" },
    { id: "pressure", icon: Gauge, label: "Pressure" },
  ];

  // Playback Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && availableTimes.length > 0) {
      interval = setInterval(() => {
        setWeatherTime((prev) => {
          const currentIndex = availableTimes.indexOf(prev);
          const nextIndex = (currentIndex + 1) % availableTimes.length;
          return availableTimes[nextIndex];
        });
      }, 1000); // 1 second per frame
    }
    return () => clearInterval(interval);
  }, [isPlaying, availableTimes, setWeatherTime]);

  const handleTimeChange = (direction: 'up' | 'down', _unit: 'day' | 'time') => {
    if (availableTimes.length === 0) return;
    const currentIndex = availableTimes.indexOf(weatherTime);
    let nextIndex = currentIndex;
    
    if (direction === 'up') {
      nextIndex = (currentIndex + 1) % availableTimes.length;
    } else {
      nextIndex = (currentIndex - 1 + availableTimes.length) % availableTimes.length;
    }
    
    setWeatherTime(availableTimes[nextIndex]);
  };

  const currentDate = new Date(weatherTime * 1000);
  const dayStr = currentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const timeStr = currentDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden font-body select-none">
      {/* Zoom Earth Style Sidebar Menu (Top Left) */}
      <div className="absolute top-6 left-6 w-[200px] pointer-events-auto flex flex-col gap-2">
        <div className="bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden flex flex-col">
          <div 
            className="flex items-center justify-between p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="text-[10px] font-mono tracking-widest text-white/50 font-bold uppercase">Weather Maps</span>
            {menuOpen ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
          </div>
          
          <AnimatePresence>
            {menuOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex flex-col p-1"
              >
                {OPTIONS.map((opt) => {
                  const isActive = activeWeatherLayer === opt.id;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setActiveWeatherLayer(isActive ? null : opt.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs transition-all duration-200 group ${
                        isActive ? "bg-white/10 text-white shadow-inner" : "text-white/40 hover:bg-white/5 hover:text-white/80"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-[#00E5FF]" : "text-white/30 group-hover:text-white/60"}`} />
                      <span className="font-medium tracking-tight">{opt.label}</span>
                      {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sub-options for selected layer (e.g. Relative / Dew Point for Humidity) */}
        <AnimatePresence>
          {activeWeatherLayer === "humidity" && menuOpen && (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-lg p-1 flex flex-col"
            >
              <button className="flex items-center gap-3 px-3 py-2 rounded-md text-[11px] text-white/80 bg-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                Relative
              </button>
              <button className="flex items-center gap-3 px-3 py-2 rounded-md text-[11px] text-white/40 hover:text-white/80 transition-colors">
                <span className="w-1.5 h-1.5" />
                Dew Point
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Forecast Panel (Top Right) */}
      <div className="absolute top-6 right-6 w-[280px] pointer-events-auto flex flex-col gap-3">
        <div className="bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-[#FFD700]" />
              <span className="text-sm font-bold tracking-tight">15&deg; 11&apos; N, 73&deg; 23&apos; E</span>
            </div>
            <X className="w-4 h-4 text-white/20 cursor-pointer hover:text-white/60 transition-colors" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] text-white/40 font-mono uppercase tracking-wider mb-1">
              <span>Daily Forecast</span>
              <span>Humidity</span>
            </div>
            {[
              { day: 'Today', icon: Sun, temp: '72%', hum: '76%' },
              { day: 'Mon', icon: Sun, temp: '65%', hum: '76%' },
              { day: 'Tue', icon: Sun, temp: '68%', hum: '74%' },
              { day: 'Wed', icon: Cloud, temp: '69%', hum: '75%' },
              { day: 'Thu', icon: Sun, temp: '70%', hum: '78%' },
            ].map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1">
                <span className="w-10 text-white/60">{d.day}</span>
                <d.icon className="w-3 h-3 text-[#FFD700]" />
                <div className="flex-1 mx-3 h-px bg-white/10 relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[60%] h-px bg-[#00E5FF]/40" />
                </div>
                <span className="w-10 text-right font-mono text-white/80">{d.hum}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Icons Sidebar */}
        <div className="flex flex-col self-end bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden divide-y divide-white/5 shadow-xl">
          {[Search, Settings, Info, Maximize].map((Icon, i) => (
            <button key={i} className="p-3 text-white/30 hover:text-white/80 hover:bg-white/5 transition-all">
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Playback Timeline (Bottom Center) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="flex items-center gap-6 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-lg px-6 py-3 shadow-2xl h-fit text-white font-mono border-b-2 border-b-[#00E5FF]/20">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-white/60 hover:text-white transition-all transform hover:scale-110 active:scale-95"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
          </button>
          
          <div className="flex items-center gap-8 text-sm font-bold">
            {/* Day Scroller */}
            <div className="flex flex-col items-center justify-center group">
              <button onClick={() => handleTimeChange('up', 'day')} className="text-white/20 group-hover:text-[#00E5FF] transition-colors"><ChevronUp className="w-3 h-3" /></button>
              <span className="py-0.5">{dayStr}</span>
              <button onClick={() => handleTimeChange('down', 'day')} className="text-white/20 group-hover:text-[#00E5FF] transition-colors"><ChevronDown className="w-3 h-3" /></button>
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* Time Scroller */}
            <div className="flex flex-col items-center justify-center group">
              <button onClick={() => handleTimeChange('up', 'time')} className="text-white/20 group-hover:text-[#00E5FF] transition-colors"><ChevronUp className="w-3 h-3" /></button>
              <span className="py-0.5 tracking-tighter">{timeStr.replace(':', ' : ')}</span>
              <button onClick={() => handleTimeChange('down', 'time')} className="text-white/20 group-hover:text-[#00E5FF] transition-colors"><ChevronDown className="w-3 h-3" /></button>
            </div>
          </div>

          <button 
            onClick={() => handleTimeChange('up', 'time')}
            className="text-white/20 hover:text-white transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Color Scale Legend (Bottom Left) */}
      {activeWeatherLayer && (
        <div className="absolute bottom-10 left-10 pointer-events-auto flex flex-col gap-2">
          <div className="flex items-center justify-between text-[9px] font-mono text-white/30 uppercase tracking-widest px-1">
            <span>Low</span>
            <span>High</span>
          </div>
          <div className="w-[180px] h-1.5 rounded-full bg-gradient-to-r from-[#00E5FF]/20 via-[#00E5FF] to-[#FF00E5] shadow-lg" />
          <div className="flex justify-between px-1 text-[8px] font-mono text-white/20">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>
      )}

      {/* Model Selection (Bottom Right) */}
      <div className="absolute bottom-10 right-10 pointer-events-auto flex flex-col gap-4 items-end">
        <div className="bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-lg p-1 flex items-center gap-1 shadow-xl">
          <button className="px-3 py-1.5 text-[10px] font-bold tracking-tight text-white/80 bg-white/5 rounded">ICON 13 km</button>
          <button className="px-3 py-1.5 text-[10px] font-bold tracking-tight text-white/30 hover:text-white/60 transition-colors">GFS 22 km</button>
        </div>
        <div className="flex flex-col bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-xl">
          <button className="p-3 text-white/30 hover:text-white/80 hover:bg-white/5 transition-colors border-b border-white/5">
            <Maximize className="w-4 h-4" />
          </button>
          <button className="p-3 text-white/30 hover:text-white/80 hover:bg-white/5 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
