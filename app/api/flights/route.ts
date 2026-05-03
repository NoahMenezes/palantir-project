import { NextResponse } from "next/server";

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
      return NextResponse.json({ error: `Failed to fetch from OpenSky: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    
    // Indices: 0: icao24, 1: callsign, 2: origin_country, 5: longitude, 6: latitude, 8: on_ground
    const validFlights = (data.states || [])
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

    return NextResponse.json({ flights: validFlights });
  } catch (error: any) {
    // Suppress the giant ETIMEDOUT stack traces in the terminal
    if (error.name === 'AbortError' || error.message?.includes('fetch failed') || error.message?.includes('ETIMEDOUT') || error.code === 'ETIMEDOUT') {
      return NextResponse.json({ error: "OpenSky API Timeout" }, { status: 504 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
