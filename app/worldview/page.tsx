"use client";

import { DataLayersSidebar } from "@/components/DataLayersSidebar";
import { WorldviewMap } from "@/components/WorldviewMap";
import { Navbar } from "@/components/Navbar";
import { TacticalSidebar } from "@/components/TacticalSidebar";
import { WeatherLayerType } from "@/components/WeatherControls";
import React, { useState, useEffect, useCallback } from "react";

export default function WorldviewPage() {
  const [flightCount, setFlightCount] = useState<number>(0);
  const [satelliteCount, setSatelliteCount] = useState<number>(0);
  const [shipCount, setShipCount] = useState<number>(0);
  
  // By default, flights are visible
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    flights: true,
    satellites: false,
    ships: false,
    weather: false
  });

  const toggleLayer = (id: string) => {
    setActiveLayers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Weather States
  const [activeWeatherLayer, setActiveWeatherLayer] = useState<WeatherLayerType | null>(null);
  const [weatherTime, setWeatherTime] = useState<number>(0);
  const [availableTimes, setAvailableTimes] = useState<number[]>([]);
  const [weatherHost, setWeatherHost] = useState<string>("https://tilecache.rainviewer.com");

  const refreshWeather = useCallback(() => {
    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then(res => res.json())
      .then(data => {
        if (data && data.radar && data.radar.past) {
          setWeatherHost(data.host || "https://tilecache.rainviewer.com");
          const times = [
            ...data.radar.past.map((t: { time: number }) => t.time),
            ...data.radar.nowcast.map((t: { time: number }) => t.time)
          ];
          setAvailableTimes(times);
          if (times.length > 0 && weatherTime === 0) {
            setWeatherTime(times[times.length - 1]);
          }
        }
      })
      .catch(err => console.error("Failed to fetch weather times:", err));
  }, [weatherTime]);

  useEffect(() => {
    refreshWeather();
    const interval = setInterval(refreshWeather, 300000); // Refresh every 5 mins
    return () => clearInterval(interval);
  }, [refreshWeather]);

  // Tactical States
  const [bloom, setBloom] = useState(136);
  const [sharpen, setSharpen] = useState(49);
  const [hud, setHud] = useState(true);
  const [sparse, setSparse] = useState(true);
  const [density, setDensity] = useState(99);

  const cleanUi = () => {
    setHud(true);
    setSparse(false);
    setBloom(100);
    setSharpen(50);
  };

  return (
    <div className="bg-black min-h-screen relative text-white overflow-hidden flex flex-col font-body">
      <Navbar />

      {/* UI Overlay */}
      <div className="relative z-10 w-full flex-1 p-4 lg:p-6 pt-24 lg:pt-32 flex flex-col">

        {/* Header Section */}
        <div className={`flex flex-col pointer-events-auto items-start mb-6 transition-all duration-500 ${activeLayers.weather ? "opacity-0 -translate-y-10" : "opacity-100"}`}>
          <div className="liquid-glass border border-white/10 rounded-xl px-4 py-2 mb-4 inline-flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_10px_#00E5FF]" />
            <span className="text-xs font-mono text-[#00E5FF] uppercase tracking-widest font-bold">Live Uplink</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-heading italic tracking-tighter drop-shadow-2xl">Worldview</h1>
          <p className="text-white/50 font-body max-w-md mt-4 text-sm leading-relaxed drop-shadow-md">
            Real-time geospatial intelligence feeds integrated via NORAD and ADS-B Exchange.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col xl:flex-row gap-6 w-full flex-1 items-stretch">

          {/* Left Side: Sidebars (DataLayers + Tactical) */}
          <div className={`w-full xl:w-[340px] shrink-0 pointer-events-auto flex flex-col gap-6 transition-all duration-500 ${!hud || activeLayers.weather ? "opacity-0 pointer-events-none -translate-x-20" : "opacity-100"}`}>
            <DataLayersSidebar 
              flightCount={flightCount} 
              satelliteCount={satelliteCount}
              shipCount={shipCount}
              activeLayers={activeLayers}
              toggleLayer={toggleLayer}
            />
            <div className="w-full">
              <TacticalSidebar
                bloom={bloom} setBloom={setBloom}
                sharpen={sharpen} setSharpen={setSharpen}
                hud={hud} setHud={setHud}
                sparse={sparse} setSparse={setSparse}
                density={density} setDensity={setDensity}
                cleanUi={cleanUi}
              />
            </div>
          </div>
          
          {/* Right Side: Flight Radar Map (Takes up all remaining space) */}
          <div className="flex-1 w-full min-h-[80vh] pointer-events-auto relative">
            <WorldviewMap
              onFlightsUpdate={setFlightCount}
              onSatellitesUpdate={setSatelliteCount}
              onShipsUpdate={setShipCount}
              activeLayers={activeLayers}
              tacticalOptions={{ bloom, sharpen, hud, sparse, density }}
              onRestoreHud={() => setHud(true)}
              activeWeatherLayer={activeWeatherLayer}
              setActiveWeatherLayer={setActiveWeatherLayer}
              weatherTime={weatherTime}
              setWeatherTime={setWeatherTime}
              weatherHost={weatherHost}
              availableTimes={availableTimes}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
