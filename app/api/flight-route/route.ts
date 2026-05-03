import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const callsign = searchParams.get("callsign");

  if (!callsign) {
    return NextResponse.json({ error: "Missing callsign" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Attempt to fetch the origin and destination airports for the flight
    const res = await fetch(`https://opensky-network.org/api/routes?callsign=${callsign}`, {
      next: { revalidate: 3600 }, // Route data rarely changes mid-flight
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    const data = await res.json();
    return NextResponse.json({ route: data });
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message?.includes('fetch failed') || error.message?.includes('ETIMEDOUT') || error.code === 'ETIMEDOUT') {
      return NextResponse.json({ error: "Route API Timeout" }, { status: 504 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
