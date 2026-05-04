"use client";

import { Navbar } from "@/components/Navbar";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect, Suspense } from "react";
import { FlightsTable } from "@/components/FlightsTable";
import { SatellitesTable } from "@/components/SatellitesTable";
import { ShipsTable } from "@/components/ShipsTable";
import { Flight, SatelliteData, ShipData } from "@/components/WorldviewMap";
import { LayoutDashboard, ArrowLeft, Activity } from "lucide-react";
import Link from "next/link";

function DashboardContent() {
  const searchParams = useSearchParams();
  const layersStr = searchParams.get("layers") || "flights";
  const activeLayersList = layersStr.split(",");

  const [flights, setFlights] = useState<Flight[]>([]);
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [ships, setShips] = useState<ShipData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeLayersList.includes("flights")) {
          const res = await fetch("/api/flights");
          const data = await res.json();
          setFlights(data.flights || []);
        }
        if (activeLayersList.includes("satellites")) {
          const res = await fetch("/api/satellites");
          const data = await res.json();
          setSatellites(data.satellites || []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [layersStr]);

  // Separate effect for Ships WebSocket
  useEffect(() => {
    if (!activeLayersList.includes("ships")) {
      setShips([]);
      return;
    }

    let ws: WebSocket | null = null;
    const shipMap = new Map<number, ShipData>();
    let isSubscribed = true;

    const initWS = async () => {
      try {
        const res = await fetch("/api/ships");
        const { key } = await res.json();

        if (!key || !isSubscribed) return;

        ws = new WebSocket("wss://stream.aisstream.io/v0/stream");
        ws.onopen = () => {
          ws?.send(
            JSON.stringify({
              APIKey: key,
              BoundingBoxes: [
                [
                  [-90, -180],
                  [90, 180],
                ],
              ],
              FilterMessageTypes: ["PositionReport"],
            }),
          );
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.MessageType === "PositionReport") {
              const report = data.Message.PositionReport;
              const mmsi = report.UserID || report.MMSI;

              shipMap.set(mmsi, {
                id: `ship-${mmsi}`,
                mmsi: mmsi,
                name: `Vessel ${mmsi}`,
                callsign: "N/A",
                type: 0,
                lng: report.Longitude,
                lat: report.Latitude,
                sog: report.Sog || 0,
                cog: report.Cog || 0,
                heading: report.TrueHeading || 0,
                navStat: report.NavigationalStatus || 0,
                lastUpdated: Date.now(),
              });
            }
          } catch (e) {}
        };
      } catch (err) {
        console.error("WebSocket init failed:", err);
      }
    };

    initWS();

    const interval = setInterval(() => {
      if (!isSubscribed) return;
      setShips(Array.from(shipMap.values()));
    }, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, [layersStr]);

  return (
    <div className="bg-black min-h-screen relative text-white overflow-hidden flex flex-col">
      <Navbar />

      {/* UI Overlay */}
      <div className="relative z-10 w-full flex-1 p-4 lg:p-16 pt-32 flex flex-col overflow-y-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6">
          <div>
            <div className="liquid-glass border border-white/10 rounded-xl px-4 py-2 mb-4 inline-flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00E5FF] animate-pulse" />
              <span className="text-xs font-mono text-[#00E5FF] uppercase tracking-widest font-bold">
                Consolidated Intelligence
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-heading italic tracking-tighter">
              Command Center
            </h1>
            <p className="text-white/40 font-mono text-xs mt-4 uppercase tracking-[0.3em]">
              Monitoring {activeLayersList.length} Active Domains
            </p>
          </div>

          <Link
            href="/worldview"
            className="bg-white/5 hover:bg-white/10 backdrop-blur-md px-8 py-4 rounded-full border border-white/10 transition-all font-mono text-xs uppercase tracking-widest flex items-center gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Worldview
          </Link>
        </div>

        {/* Tactical Tables Grid */}
        <div className="grid grid-cols-1 gap-8 w-full">
          {activeLayersList.includes("flights") && (
            <FlightsTable
              flights={flights}
              loading={loading}
              onSelect={() => {}}
            />
          )}

          {activeLayersList.includes("satellites") && (
            <SatellitesTable satellites={satellites} loading={loading} />
          )}

          {activeLayersList.includes("ships") && (
            <ShipsTable ships={ships} loading={loading} />
          )}

          {activeLayersList.length === 0 && (
            <div className="p-20 text-center border border-dashed border-white/10 rounded-3xl opacity-30">
              <p className="font-mono text-sm uppercase tracking-widest">
                No Tactical Layers Selected
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-black min-h-screen flex items-center justify-center text-white font-mono uppercase tracking-widest opacity-50">
          Initializing Dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
