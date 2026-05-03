import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Global cache to bypass OpenSky's aggressive rate-limiting returning 0 states
let globalFlightsCache: any[] | null = null;
let lastCacheTime = 0;

// Initialize cache with our fallback to guarantee 0 flights is never rendered on boot
try {
  const fallbackPath = path.join(process.cwd(), "public", "flights-backup.json");
  const fallbackData = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
  if (fallbackData && fallbackData.flights) {
    globalFlightsCache = fallbackData.flights;
  }
} catch (e) {
  console.warn("Could not load flights fallback data");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Default to somewhere interesting (e.g. Europe or US) if no coordinates provided
  const lat = searchParams.get('lat') || "48.8566";
  const lng = searchParams.get('lng') || "2.3522";
  
  // ADSB.lol allows maximum 250 nautical miles radius
  const radius = "250"; 

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`https://api.adsb.lol/v2/lat/${lat}/lon/${lng}/dist/${radius}`, {
      next: { revalidate: 5 }, // ADSB is real-time, ping every 5s
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (globalFlightsCache) return NextResponse.json({ flights: globalFlightsCache });
      return NextResponse.json({ error: `Failed to fetch from ADSB.lol: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    
    if (!data.ac || data.ac.length === 0) {
      if (globalFlightsCache) return NextResponse.json({ flights: globalFlightsCache });
      return NextResponse.json({ flights: [] });
    }

    // ADSB.lol / ADSBExchange v2 Schema Mapping
    const validFlights = data.ac
      .filter((ac: any) => ac.lat !== undefined && ac.lon !== undefined)
      .map((ac: any) => ({
        id: ac.hex,
        callsign: ac.flight ? ac.flight.trim() : "UNKNOWN",
        country: "N/A", // ADSBx doesn't always provide origin_country directly in this endpoint
        time_position: Math.floor(Date.now() / 1000),
        last_contact: Math.floor(Date.now() / 1000),
        lng: ac.lon,
        lat: ac.lat,
        baro_altitude: ac.alt_baro === "ground" ? 0 : (ac.alt_baro * 0.3048), // Convert ft to meters
        velocity: ac.gs * 0.514444, // Convert knots to m/s
        track: ac.track || 0,
        vertical_rate: (ac.geom_rate || ac.baro_rate || 0) * 0.00508, // Convert ft/min to m/s
        geo_altitude: ac.alt_geom * 0.3048,
        squawk: ac.squawk,
        position_source: ac.type
      }));

    globalFlightsCache = validFlights;
    lastCacheTime = Date.now();

    return NextResponse.json({ flights: validFlights });
  } catch (error: any) {
    if (globalFlightsCache) {
      return NextResponse.json({ flights: globalFlightsCache });
    }
    if (error.name === 'AbortError' || error.message?.includes('fetch failed') || error.message?.includes('ETIMEDOUT')) {
      return NextResponse.json({ error: "ADSB.lol API Timeout" }, { status: 504 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
