"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import DeckGL from "@deck.gl/react";
import { IconLayer, BitmapLayer, PathLayer } from "@deck.gl/layers";
import { _GlobeView as GlobeView, MapView } from "@deck.gl/core";
import { TileLayer, Tile3DLayer } from "@deck.gl/geo-layers";
import { CesiumIonLoader } from "@loaders.gl/3d-tiles";
import Map from "react-map-gl/maplibre";
import Link from "next/link";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  X,
  ExternalLink,
  Globe2,
  Map as MapIcon,
  EyeOff,
  TableProperties,
  Crosshair,
  LayoutDashboard,
} from "lucide-react";
import * as satellite from "satellite.js";
import { WeatherControls, WeatherLayerType } from "./WeatherControls";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const AIRPLANE_SVG =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>',
  );
const SATELLITE_SVG =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 2L10.5 5h3L12 2zM4 10.5L2 12l2 1.5v-3zM20 10.5v3l2-1.5-2-1.5zM12 22l1.5-3h-3L12 22zM7 7v10h10V7H7zm8 8H9V9h6v6z"/></svg>',
  );
const SHIP_SVG =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M4,18L2,21L4,21C4,21 5,22 12,22C19,22 20,21 20,21L22,21L20,18L4,18Z M12,2L8,13L16,13L12,2Z"/></svg>',
  );

function getAltitudeColor(altitudeMeters: number): [number, number, number] {
  const altFt = (altitudeMeters || 0) * 3.28084;
  if (altFt < 1000) return [255, 128, 0];
  if (altFt < 4000) return [255, 191, 0];
  if (altFt < 8000) return [204, 255, 0];
  if (altFt < 10000) return [0, 255, 0];
  if (altFt < 20000) return [0, 255, 191];
  if (altFt < 30000) return [0, 191, 255];
  if (altFt < 40000) return [64, 0, 255];
  return [191, 0, 255];
}

export interface Flight {
  id: string;
  callsign: string;
  country: string;
  lng: number;
  lat: number;
  baro_altitude: number | null;
  geo_altitude: number | null;
  velocity: number | null;
  track: number;
  vertical_rate: number | null;
  squawk: string | null;
  last_contact: number;
  lastUpdated?: number;
  isSatellite?: boolean;
  isShip?: boolean;
  position_source?: number;
}

export interface SatelliteData {
  id: string;
  name: string;
  tle1: string;
  tle2: string;
  satrec?: satellite.SatRec;
  isSatellite?: boolean;
  callsign?: string;
}

export interface ShipData {
  id: string;
  mmsi: number;
  name: string;
  callsign: string;
  type: number;
  lng: number;
  lat: number;
  sog: number;
  cog: number;
  heading: number;
  navStat: number;
  lastUpdated: number;
  isShip?: boolean;
}

interface TacticalOptions {
  bloom: number;
  sharpen: number;
  hud: boolean;
  sparse: boolean;
  density: number;
}

interface WorldviewMapProps {
  onFlightsUpdate?: (count: number) => void;
  onSatellitesUpdate?: (count: number) => void;
  onShipsUpdate?: (count: number) => void;
  activeLayers: Record<string, boolean>;
  tacticalOptions: TacticalOptions;
  onRestoreHud?: () => void;
  activeWeatherLayer?: WeatherLayerType | null;
  setActiveWeatherLayer?: (layer: WeatherLayerType | null) => void;
  weatherTime?: number;
  setWeatherTime?: React.Dispatch<React.SetStateAction<number>>;
  weatherHost?: string;
  availableTimes?: number[];
}

export function WorldviewMap({
  onFlightsUpdate,
  onSatellitesUpdate,
  onShipsUpdate,
  activeLayers,
  tacticalOptions,
  onRestoreHud,
  activeWeatherLayer,
  setActiveWeatherLayer,
  weatherTime,
  setWeatherTime,
  weatherHost,
  availableTimes,
}: WorldviewMapProps) {
  const { bloom, sharpen, hud, sparse, density } = tacticalOptions;

  const [flights, setFlights] = useState<Flight[]>([]);
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [ships, setShips] = useState<ShipData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<any | null>(null);
  const [flightRoute, setFlightRoute] = useState<any | null>(null);
  const [isGlobeMode, setIsGlobeMode] = useState(false);
  const [timeTick, setTimeTick] = useState(0);
  const requestRef = useRef<number | null>(null);

  const [viewState, setViewState] = useState({
    longitude: 24.9384,
    latitude: 60.1695,
    zoom: 4,
    pitch: 0,
    bearing: 0,
  });

  const handleZoom = (delta: number) => {
    setViewState((prev) => ({
      ...prev,
      zoom: Math.max(1.5, Math.min(20, prev.zoom + delta)),
    }));
  };

  const fetchFlights = useCallback(async () => {
    if (!activeLayers.flights) return;
    try {
      const res = await fetch("/api/flights");
      if (!res.ok) throw new Error("Failed to fetch flight data");
      const data = await res.json();
      if (data.flights && data.flights.length > 0) {
        const now = Date.now();
        const flightsWithTimestamp = data.flights.map((f: Flight) => ({
          ...f,
          lastUpdated: now,
        }));
        setFlights(flightsWithTimestamp);
        if (onFlightsUpdate) onFlightsUpdate(flightsWithTimestamp.length);
      }
      setLoading(false);
      setError(null);
    } catch (err: any) {
      if (flights.length === 0) {
        setError(err.message);
        setLoading(false);
      }
    }
  }, [activeLayers.flights, flights.length, onFlightsUpdate]);

  const fetchSatellites = useCallback(async () => {
    if (!activeLayers.satellites) return;
    try {
      const res = await fetch("/api/satellites");
      if (!res.ok) throw new Error("Failed to fetch satellites");
      const data = await res.json();
      if (data.satellites) {
        const parsed = data.satellites
          .map((s: SatelliteData) => {
            try {
              return { ...s, satrec: satellite.twoline2satrec(s.tle1, s.tle2) };
            } catch (e) {
              return null;
            }
          })
          .filter((s: any): s is SatelliteData => s !== null);
        setSatellites(parsed);
        if (onSatellitesUpdate) onSatellitesUpdate(parsed.length);
      }
    } catch (err) {
      console.warn("Satellite fetch warning:", err);
    }
  }, [activeLayers.satellites, onSatellitesUpdate]);

  useEffect(() => {
    if (activeLayers.flights) {
      fetchFlights();
      const interval = setInterval(fetchFlights, 10000);
      return () => clearInterval(interval);
    } else {
      setFlights([]);
      if (onFlightsUpdate) onFlightsUpdate(0);
    }
  }, [activeLayers.flights, fetchFlights, onFlightsUpdate]);

  useEffect(() => {
    if (activeLayers.satellites) {
      fetchSatellites();
      const interval = setInterval(fetchSatellites, 3600000);
      return () => clearInterval(interval);
    } else {
      setSatellites([]);
      if (onSatellitesUpdate) onSatellitesUpdate(0);
    }
  }, [activeLayers.satellites, fetchSatellites, onSatellitesUpdate]);

  useEffect(() => {
    if (!activeLayers.ships) {
      setShips([]);
      if (onShipsUpdate) onShipsUpdate(0);
      return;
    }

    let ws: WebSocket | null = null;
    const shipMap = new globalThis.Map<number, ShipData>();
    let isSubscribed = true;

    const initWS = async () => {
      try {
        const res = await fetch("/api/ships?mode=key");
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
              ], // Global
              FilterMessageTypes: ["PositionReport", "ShipStaticData"],
            }),
          );
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.MessageType === "PositionReport") {
              const report = data.Message.PositionReport;
              const mmsi = report.UserID || report.MMSI;
              const existing = shipMap.get(mmsi);

              shipMap.set(mmsi, {
                id: `ship-${mmsi}`,
                mmsi: mmsi,
                name: existing?.name || `Vessel ${mmsi}`,
                callsign: existing?.callsign || "N/A",
                type: existing?.type || 0,
                lng: report.Longitude,
                lat: report.Latitude,
                sog: report.Sog || 0,
                cog: report.Cog || 0,
                heading: report.TrueHeading || 0,
                navStat: report.NavigationalStatus || 0,
                lastUpdated: Date.now(),
              });
            } else if (data.MessageType === "ShipStaticData") {
              const staticData = data.Message.ShipStaticData;
              const mmsi = staticData.UserID || staticData.MMSI;
              const existing = shipMap.get(mmsi);

              if (existing) {
                shipMap.set(mmsi, {
                  ...existing,
                  name: staticData.Name?.trim() || existing.name,
                  callsign: staticData.CallSign?.trim() || existing.callsign,
                  type: staticData.Type || existing.type,
                });
              }
            }
          } catch (e) { }
        };

        ws.onerror = (err) => {
          console.error("AISStream WebSocket Error. Check if your API key is valid and has not expired.", err);
        };

        ws.onclose = () => {
          console.warn("AISStream WebSocket Closed. Reconnecting may be required.");
        };
      } catch (err) {
        console.error("WebSocket init failed:", err);
      }
    };

    initWS();

    // Fallback logic: If no ships after 10s, try regional data
    const fallbackTimer = setTimeout(async () => {
      if (shipMap.size === 0 && isSubscribed) {
        console.warn("Global AIS stream inactive. Attempting regional fallback...");
        try {
          const res = await fetch("/api/ships?mode=data");
          const data = await res.json();
          if (data.ships && isSubscribed) {
            data.ships.forEach((s: ShipData) => shipMap.set(s.mmsi, s));
          }
        } catch (e) { }
      }
    }, 10000);

    // Throttle React state updates to every 3 seconds to handle global high throughput gracefully
    const interval = setInterval(() => {
      if (!isSubscribed) return;
      const currentShips = Array.from(shipMap.values());
      setShips(currentShips);
      if (onShipsUpdate) onShipsUpdate(currentShips.length);
    }, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, [activeLayers.ships, onShipsUpdate]);

  useEffect(() => {
    const updateTick = () => {
      setTimeTick(Date.now());
      requestRef.current = requestAnimationFrame(updateTick);
    };
    requestRef.current = requestAnimationFrame(updateTick);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Calculate Orbital Path / Flight Route
  useEffect(() => {
    if (selectedFlight?.isSatellite && selectedFlight.satrec) {
      const points: number[][] = [];
      const now = new Date();
      const sat = selectedFlight.satrec;
      // Calculate 90 minutes of orbit (standard LEO period)
      for (let i = 0; i <= 90; i++) {
        const futureDate = new Date(now.getTime() + i * 60000);
        const posAndVel = satellite.propagate(sat, futureDate);
        if (posAndVel.position && typeof posAndVel.position !== "boolean") {
          const gmst = satellite.gstime(futureDate);
          const positionGd = satellite.eciToGeodetic(
            posAndVel.position as satellite.EciVec3<number>,
            gmst,
          );
          points.push([
            satellite.degreesLong(positionGd.longitude),
            satellite.degreesLat(positionGd.latitude),
            isGlobeMode ? positionGd.height * 1000 : 0,
          ]);
        }
      }
      setFlightRoute({ points });
    } else if (
      selectedFlight &&
      !selectedFlight.isSatellite &&
      !selectedFlight.isShip
    ) {
      // Fetch flight route from API
      fetch(`/api/flight-route?callsign=${selectedFlight.callsign}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.route) setFlightRoute(data.route);
        })
        .catch((err) => console.warn("Route fetch error:", err));
    } else {
      setFlightRoute(null);
    }
  }, [selectedFlight, isGlobeMode]);

  // Sync camera with selected target
  useEffect(() => {
    if (selectedFlight && sparse) {
      let targetLng = selectedFlight.lng;
      let targetLat = selectedFlight.lat;

      if (selectedFlight.isSatellite && selectedFlight.satrec) {
        const date = new Date(timeTick);
        const posAndVel = satellite.propagate(selectedFlight.satrec, date);
        if (posAndVel.position && typeof posAndVel.position !== "boolean") {
          const gmst = satellite.gstime(date);
          const positionGd = satellite.eciToGeodetic(
            posAndVel.position as satellite.EciVec3<number>,
            gmst,
          );
          targetLng = satellite.degreesLong(positionGd.longitude);
          targetLat = satellite.degreesLat(positionGd.latitude);
        }
      } else if (selectedFlight.lastUpdated && selectedFlight.velocity) {
        const secondsElapsed = (timeTick - selectedFlight.lastUpdated) / 1000;
        const distanceMeters = selectedFlight.velocity * secondsElapsed;
        const trackRad = (selectedFlight.track * Math.PI) / 180;
        const dx = distanceMeters * Math.sin(trackRad);
        const dy = distanceMeters * Math.cos(trackRad);
        targetLat += dy / 111320;
        targetLng += dx / (111320 * Math.cos((targetLat * Math.PI) / 180));
      }

      setViewState((prev) => ({
        ...prev,
        longitude: targetLng,
        latitude: targetLat,
        transitionDuration: 100,
      }));
    }
  }, [selectedFlight, timeTick, sparse]);

  const satelliteImageryLayer = new TileLayer({
    id: "satellite-imagery-layer",
    data: `https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&key=${process.env.NEXT_PUBLIC_MAPTILES_API}`,
    minZoom: 0,
    maxZoom: 19,
    renderSubLayers: (props) => {
      const { west, south, east, north } = props.tile.bbox as any;
      return new BitmapLayer(props, {
        data: undefined,
        image: props.data,
        bounds: [west, south, east, north],
      });
    },
  });

  const layers = [
    satelliteImageryLayer,

    // CESIUM 3D BUILDINGS LAYER
    new Tile3DLayer({
      id: "cesium-buildings",
      data: 96488, // Cesium OSM Buildings asset ID
      loader: CesiumIonLoader,
      loadOptions: {
        "cesium-ion": {
          accessToken: process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN,
        },
      },
      onTileLoad: (tile) => {
        tile.content.cartographicOrigin = [0, 0, 0];
      },
      pickable: false,
      opacity: 0.8,
      material: {
        specularColor: [0, 229, 255],
        shininess: 32,
      },
      _lighting: "pbr",
    }),
    activeLayers.flights
      ? new IconLayer<Flight>({
        id: "flight-icons",
        data: sparse
          ? flights.slice(
            0,
            Math.max(1, Math.floor(flights.length * (density / 100))),
          )
          : flights,
        pickable: true,
        getIcon: () => ({
          url: AIRPLANE_SVG,
          width: 24,
          height: 24,
          anchorY: 12,
          mask: true,
        }),
        getPosition: (d: Flight) => {
          if (!d.lastUpdated || !d.velocity)
            return [d.lng, d.lat, isGlobeMode ? d.baro_altitude || 10000 : 0];
          const secondsElapsed = (timeTick - d.lastUpdated) / 1000;
          const distanceMeters = d.velocity * secondsElapsed;
          const trackRad = (d.track * Math.PI) / 180;
          const dx = distanceMeters * Math.sin(trackRad);
          const dy = distanceMeters * Math.cos(trackRad);
          const lat = d.lat + dy / 111320;
          const lng = d.lng + dx / (111320 * Math.cos((lat * Math.PI) / 180));
          return [lng, lat, isGlobeMode ? d.baro_altitude || 10000 : 0];
        },
        getSize: () => (isGlobeMode ? 32 : 24),
        getAngle: (d: Flight) => d.track || 0,
        getColor: (d: Flight) =>
          getAltitudeColor((d.geo_altitude || d.baro_altitude) as number),
        autoHighlight: true,
        onClick: ({ object }) => {
          if (object) {
            setSelectedFlight(object);
            setViewState((v) => ({
              ...v,
              longitude: object.lng,
              latitude: object.lat,
              zoom: 16,
              transitionDuration: 1000,
            }));
          }
        },
        updateTriggers: { getPosition: [timeTick] },
      })
      : null,
    activeLayers.satellites
      ? new IconLayer<SatelliteData>({
        id: "satellite-icons",
        data: satellites,
        pickable: true,
        getIcon: () => ({
          url: SATELLITE_SVG,
          width: 128,
          height: 128,
          anchorY: 64,
          mask: true,
        }),
        getPosition: (d: SatelliteData) => {
          if (!d.satrec) return [0, 0, 0];
          const date = new Date(timeTick);
          const posAndVel = satellite.propagate(d.satrec, date);
          if (posAndVel.position && typeof posAndVel.position !== "boolean") {
            const gmst = satellite.gstime(date);
            const positionGd = satellite.eciToGeodetic(
              posAndVel.position as satellite.EciVec3<number>,
              gmst,
            );
            return [
              satellite.degreesLong(positionGd.longitude),
              satellite.degreesLat(positionGd.latitude),
              isGlobeMode ? positionGd.height * 1000 : 0,
            ];
          }
          return [0, 0, 0];
        },
        getSize: () => (isGlobeMode ? 24 : 16),
        getColor: () => [0, 229, 255],
        autoHighlight: true,
        onClick: ({ object }) => {
          if (object) {
            setSelectedFlight({
              ...object,
              callsign: object.name,
              isSatellite: true,
            });
            setViewState((v) => ({
              ...v,
              zoom: 16,
              transitionDuration: 1000,
            }));
          }
        },
        updateTriggers: { getPosition: [timeTick] },
      })
      : null,
    activeLayers.ships
      ? new IconLayer<ShipData>({
        id: "ship-icons",
        data: sparse
          ? ships.slice(
            0,
            Math.max(1, Math.floor(ships.length * (density / 100))),
          )
          : ships,
        pickable: true,
        getIcon: () => ({
          url: SHIP_SVG,
          width: 32,
          height: 32,
          anchorY: 16,
          mask: true,
        }),
        getPosition: (d: ShipData) => [d.lng, d.lat, 0],
        getSize: () => 20,
        getAngle: (d: ShipData) => d.heading || d.cog || 0,
        getColor: () => [0, 255, 200],
        autoHighlight: true,
        onClick: ({ object }) => {
          if (object) {
            setSelectedFlight({
              ...object,
              callsign: object.name,
              isShip: true,
              country: "Maritime",
            });
            setViewState((v) => ({
              ...v,
              longitude: object.lng,
              latitude: object.lat,
              zoom: 16,
              transitionDuration: 1000,
            }));
          }
        },
      })
      : null,

    // TARGETING RETICLE LAYER (Aircraft & Ships only)
    selectedFlight && !selectedFlight.isSatellite
      ? new IconLayer({
        id: "targeting-reticle",
        data: [selectedFlight],
        getIcon: () => ({
          url:
            "data:image/svg+xml;charset=utf-8," +
            encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>',
            ),
          width: 128,
          height: 128,
          anchorY: 64,
          mask: false,
        }),
        getPosition: (d: any) => {
          if (d.isSatellite && d.satrec) {
            const date = new Date(timeTick);
            const posAndVel = satellite.propagate(d.satrec, date);
            if (
              posAndVel.position &&
              typeof posAndVel.position !== "boolean"
            ) {
              const gmst = satellite.gstime(date);
              const positionGd = satellite.eciToGeodetic(
                posAndVel.position as satellite.EciVec3<number>,
                gmst,
              );
              return [
                satellite.degreesLong(positionGd.longitude),
                satellite.degreesLat(positionGd.latitude),
                isGlobeMode ? positionGd.height * 1000 : 0,
              ];
            }
          }
          return [d.lng, d.lat, isGlobeMode ? d.baro_altitude || 10000 : 0];
        },
        getSize: () => (isGlobeMode ? 80 : 64),
        getAngle: () => (timeTick / 50) % 360,
        updateTriggers: { getPosition: [timeTick] },
      })
      : null,

    flightRoute && flightRoute.points
      ? new PathLayer<any>({
        id: "flight-route",
        data: [flightRoute],
        getPath: (d: any) => d.points,
        getColor: selectedFlight?.isSatellite
          ? [0, 229, 255, 200]
          : [255, 255, 255, 200],
        widthMinPixels: 2,
        getWidth: 3,
      })
      : null,
    activeLayers.weather && activeWeatherLayer && weatherTime
      ? new TileLayer({
        id: "weather-tile-layer",
        data:
          activeWeatherLayer === "radar" ||
            activeWeatherLayer === "precipitation" ||
            activeWeatherLayer === "satellite"
            ? `${weatherHost}/v2/${activeWeatherLayer === "satellite" ? "satellite" : "radar"}/${weatherTime}/256/{z}/{x}/{y}/2/1_1.png`
            : `https://tile.openweathermap.org/map/${activeWeatherLayer === "temperature" ? "temp_new" : activeWeatherLayer === "wind" ? "wind_new" : activeWeatherLayer === "humidity" ? "clouds_new" : activeWeatherLayer === "pressure" ? "pressure_new" : "clouds_new"}/{z}/{x}/{y}.png?appid=YOUR_OWM_API_KEY`,
        opacity: activeWeatherLayer === "satellite" ? 0.8 : 0.6,
        renderSubLayers: (props) => {
          const { west, south, east, north } = props.tile.bbox as any;
          return new BitmapLayer(props, {
            data: undefined,
            image: props.data,
            bounds: [west, south, east, north],
          });
        },
      })
      : null,
  ].filter(Boolean);

  const views = isGlobeMode
    ? [new GlobeView({ id: "globe", controller: true, resolution: 2 })]
    : [new MapView({ id: "map", controller: true })];

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="w-full flex justify-center pointer-events-auto">
        <button
          onClick={() => setIsGlobeMode(!isGlobeMode)}
          className="bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 transition-all font-mono text-xs uppercase tracking-widest flex items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-white/10 text-white font-bold"
        >
          {isGlobeMode ? (
            <MapIcon className="w-4 h-4 text-[#00E5FF]" />
          ) : (
            <Globe2 className="w-4 h-4 text-[#00E5FF]" />
          )}
          {isGlobeMode ? "Switch to Map View" : "Switch to Planet View"}
        </button>
      </div>

      <div className="w-full flex-1 relative group rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,229,255,0.05)] bg-[#0A0A0C] flex flex-row">
        {hud && (
          <div className="absolute bottom-24 right-4 z-[100] flex flex-col gap-2 pointer-events-auto">
            <button
              onClick={() => handleZoom(1)}
              className="w-10 h-10 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors shadow-xl text-xl font-bold"
            >
              +
            </button>
            <button
              onClick={() => handleZoom(-1)}
              className="w-10 h-10 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors shadow-xl text-xl font-bold"
            >
              -
            </button>
          </div>
        )}

        <div
          className="flex-1 relative h-full transition-all duration-700"
          style={{
            filter: `contrast(${100 + (sharpen - 50)}%) saturate(${100 + (sharpen - 50) * 0.5}%) ${bloom > 110 ? `brightness(1.15) drop-shadow(0 0 ${bloom / 10}px rgba(0,229,255,0.15))` : ""}`,
          }}
        >
          <DeckGL
            views={views}
            viewState={viewState as any}
            onViewStateChange={(e) => setViewState(e.viewState as any)}
            controller={true}
            layers={layers}
            getTooltip={({ object }) => {
              if (!object || selectedFlight) return null;
              return `${object.callsign || object.name}\n${object.country || "Maritime"}`;
            }}
            style={{ position: "absolute", width: "100%", height: "100%" }}
          >
            {!isGlobeMode && (
              <Map mapStyle={MAP_STYLE} renderWorldCopies={false} reuseMaps />
            )}
            {activeLayers.weather &&
              setActiveWeatherLayer &&
              setWeatherTime && (
                <WeatherControls
                  activeWeatherLayer={activeWeatherLayer || null}
                  setActiveWeatherLayer={setActiveWeatherLayer}
                  weatherTime={weatherTime || 0}
                  setWeatherTime={setWeatherTime}
                  availableTimes={availableTimes || []}
                />
              )}
          </DeckGL>

          {/* Bottom Tactical Link: Command Center */}
          <div
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto transition-all duration-500 ${!hud ? "opacity-0 translate-y-10" : "opacity-100 translate-y-0"}`}
          >
            <Link
              href={`/dashboard?layers=${Object.entries(activeLayers)
                .filter(([_, active]) => active)
                .map(([id]) => id)
                .join(",")}`}
              className="group bg-black/60 hover:bg-[#00E5FF]/20 text-[#00E5FF] backdrop-blur-xl px-10 py-4 rounded-full border border-[#00E5FF]/30 hover:border-[#00E5FF]/60 transition-all font-mono text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
            >
              <LayoutDashboard className="w-5 h-5 transition-transform group-hover:rotate-12" />
              <span>Open Command Center</span>
              <div className="flex gap-1 ml-2">
                {activeLayers.flights && (
                  <div className="w-1 h-3 bg-[#00E5FF]/40 rounded-full" />
                )}
                {activeLayers.satellites && (
                  <div className="w-1 h-3 bg-[#00E5FF]/40 rounded-full" />
                )}
                {activeLayers.ships && (
                  <div className="w-1 h-3 bg-[#00E5FF]/40 rounded-full" />
                )}
              </div>
            </Link>
          </div>

          {hud && (
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex flex-col gap-1 pointer-events-none z-10 transition-opacity duration-300">
              <div className="flex items-center gap-3">
                <div className="relative flex h-2 w-2">
                  <span
                    className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${error ? "bg-red-500" : "bg-[#00E5FF] animate-ping"}`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${error ? "bg-red-500" : "bg-[#00E5FF]"}`}
                  ></span>
                </div>
                <span className="text-xs font-mono text-[#00E5FF] uppercase tracking-widest font-bold">
                  {activeLayers.ships ? "Maritime Domain" : "Tactical Uplink"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/50 pl-5">
                {[
                  activeLayers.flights ? `${flights.length} Flights` : null,
                  activeLayers.satellites ? `${satellites.length} Sat` : null,
                  activeLayers.ships ? `${ships.length} Ships` : null,
                ]
                  .filter(Boolean)
                  .join(" | ")}
              </span>
            </div>
          )}
        </div>

        {selectedFlight && (
          <div className="w-full md:w-[350px] shrink-0 bg-black/95 backdrop-blur-xl border-l border-white/10 h-full overflow-y-auto z-20 flex flex-col pointer-events-auto shadow-2xl relative">
            <div className="p-4 border-b border-white/10 flex items-start justify-between sticky top-0 bg-black/95 z-10">
              <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-heading text-white leading-none">
                  {selectedFlight.callsign || selectedFlight.name}
                </h3>
                <p className="text-sm font-body font-semibold text-[#00E5FF]">
                  {selectedFlight.isShip
                    ? "Maritime Vessel"
                    : selectedFlight.isSatellite
                      ? "Satellite"
                      : "Aircraft"}
                </p>
              </div>
              <button
                onClick={() => setSelectedFlight(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-6 font-mono text-xs text-white/70">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="opacity-40">LATITUDE</p>
                  <p className="text-white">{selectedFlight.lat?.toFixed(5)}</p>
                </div>
                <div>
                  <p className="opacity-40">LONGITUDE</p>
                  <p className="text-white">{selectedFlight.lng?.toFixed(5)}</p>
                </div>
                {selectedFlight.isShip ? (
                  <>
                    <div>
                      <p className="opacity-40">MMSI</p>
                      <p className="text-white">{selectedFlight.mmsi}</p>
                    </div>
                    <div>
                      <p className="opacity-40">SOG (SPEED)</p>
                      <p className="text-white">{selectedFlight.sog} kt</p>
                    </div>
                    <div>
                      <p className="opacity-40">COG (COURSE)</p>
                      <p className="text-white">{selectedFlight.cog}&deg;</p>
                    </div>
                    <div>
                      <p className="opacity-40">HEADING</p>
                      <p className="text-white">
                        {selectedFlight.heading}&deg;
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="opacity-40">ALTITUDE</p>
                      <p className="text-white">
                        {Math.round(
                          (selectedFlight.baro_altitude || 0) * 3.28084,
                        ).toLocaleString()}{" "}
                        ft
                      </p>
                    </div>
                    <div>
                      <p className="opacity-40">VELOCITY</p>
                      <p className="text-white">
                        {Math.round((selectedFlight.velocity || 0) * 1.94384)}{" "}
                        kt
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
