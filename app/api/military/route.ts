import { NextResponse } from "next/server";

let militaryCache: any[] | null = null;
let lastCacheTime = 0;

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch("https://api.adsb.lol/v2/mil", {
      next: { revalidate: 15 },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (militaryCache) return NextResponse.json({ flights: militaryCache });
      return NextResponse.json({ error: `Failed to fetch from ADSB.lol: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    
    if (!data.ac || data.ac.length === 0) {
      if (militaryCache) return NextResponse.json({ flights: militaryCache });
      return NextResponse.json({ flights: [] });
    }

    const validFlights = data.ac
      .filter((ac: any) => ac.lat !== undefined && ac.lon !== undefined)
      .map((ac: any) => ({
        id: ac.hex,
        callsign: ac.flight ? ac.flight.trim() : "UNKNOWN",
        country: ac.t || "MIL", // Military flight type/country
        time_position: Math.floor(Date.now() / 1000),
        last_contact: Math.floor(Date.now() / 1000),
        lng: ac.lon,
        lat: ac.lat,
        baro_altitude: ac.alt_baro === "ground" ? 0 : (ac.alt_baro * 0.3048),
        velocity: ac.gs * 0.514444,
        track: ac.track || 0,
        vertical_rate: (ac.geom_rate || ac.baro_rate || 0) * 0.00508,
        geo_altitude: ac.alt_geom * 0.3048,
        squawk: ac.squawk,
        position_source: ac.type,
        isMilitary: true // Flag to differentiate
      }));

    militaryCache = validFlights;
    lastCacheTime = Date.now();

    return NextResponse.json({ flights: validFlights });
  } catch (error: any) {
    if (militaryCache) {
      return NextResponse.json({ flights: militaryCache });
    }
    return NextResponse.json({ error: "ADSB.lol Military Timeout" }, { status: 504 });
  }
}
