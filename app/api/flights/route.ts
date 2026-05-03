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

export async function GET() {
  const username = process.env.clientId;
  const password = process.env.clientSecret;

  if (!username || !password) {
    return NextResponse.json({ error: "Missing OpenSky credentials in .env" }, { status: 500 });
  }

  const auth = Buffer.from(`${username}:${password}`).toString("base64");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("https://opensky-network.org/api/states/all", {
      headers: {
        "Authorization": `Basic ${auth}`
      },
      next: { revalidate: 15 },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (globalFlightsCache) return NextResponse.json({ flights: globalFlightsCache });
      return NextResponse.json({ error: `Failed to fetch from OpenSky: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    
    if (!data.states || data.states.length === 0) {
      if (globalFlightsCache) return NextResponse.json({ flights: globalFlightsCache });
      return NextResponse.json({ error: "OpenSky rate limited (0 states)" }, { status: 429 });
    }

    // Indices: 0: icao24, 1: callsign, 2: origin_country, 5: longitude, 6: latitude, 8: on_ground
    const validFlights = data.states
      .filter((state: any) => state[5] !== null && state[6] !== null && state[8] === false)
      .map((state: any) => ({
        id: state[0],
        callsign: state[1] ? state[1].trim() : "UNKNOWN",
        country: state[2],
        time_position: state[3],
        last_contact: state[4],
        lng: state[5],
        lat: state[6],
        baro_altitude: state[7],
        velocity: state[9],
        track: state[10] || 0,
        vertical_rate: state[11],
        geo_altitude: state[13],
        squawk: state[14],
        position_source: state[16]
      }));

    globalFlightsCache = validFlights;
    lastCacheTime = Date.now();

    return NextResponse.json({ flights: validFlights });
  } catch (error: any) {
    if (globalFlightsCache) {
      return NextResponse.json({ flights: globalFlightsCache });
    }
    // Suppress the giant ETIMEDOUT stack traces in the terminal
    if (error.name === 'AbortError' || error.message?.includes('fetch failed') || error.message?.includes('ETIMEDOUT') || error.code === 'ETIMEDOUT') {
      return NextResponse.json({ error: "OpenSky API Timeout" }, { status: 504 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
