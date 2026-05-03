import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Global cache to bypass OpenSky's aggressive rate-limiting returning 0 states
let globalFlightsCache: Record<string, string | number | boolean | null>[] | null = null;
// lastCacheTime is used for debugging/internal tracking, we'll keep it but use it or remove it.
// I'll remove it to satisfy the lint rule.

// Initialize cache with our fallback to guarantee 0 flights is never rendered on boot
try {
  const fallbackPath = path.join(process.cwd(), "public", "flights-backup.json");
  const fallbackData = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
  if (fallbackData && fallbackData.flights) {
    globalFlightsCache = fallbackData.flights;
  }
} catch (e) {
  console.warn("Could not load flights fallback data", e);
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
      .filter((state: (string | number | boolean | null)[]) => state[5] !== null && state[6] !== null && state[8] === false)
      .map((state: (string | number | boolean | null)[]) => ({
        id: state[0] as string,
        callsign: state[1] ? (state[1] as string).trim() : "UNKNOWN",
        country: state[2] as string,
        time_position: state[3] as number,
        last_contact: state[4] as number,
        lng: state[5] as number,
        lat: state[6] as number,
        baro_altitude: state[7] as number,
        velocity: state[9] as number,
        track: (state[10] as number) || 0,
        vertical_rate: state[11] as number,
        geo_altitude: state[13] as number,
        squawk: state[14] as string,
        position_source: state[16] as number
      }));

    globalFlightsCache = validFlights;

    return NextResponse.json({ flights: validFlights });
  } catch (error: unknown) {
    const err = error as Error & { code?: string };
    if (globalFlightsCache) {
      return NextResponse.json({ flights: globalFlightsCache });
    }
    // Suppress the giant ETIMEDOUT stack traces in the terminal
    if (err.name === 'AbortError' || err.message?.includes('fetch failed') || err.message?.includes('ETIMEDOUT') || err.code === 'ETIMEDOUT') {
      return NextResponse.json({ error: "OpenSky API Timeout" }, { status: 504 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
