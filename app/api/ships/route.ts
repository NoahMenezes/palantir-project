import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "key";
  const key = process.env.OCEAN_API_KEY;

  if (mode === "key") {
    if (!key) return NextResponse.json({ error: "Missing OCEAN_API_KEY" }, { status: 500 });
    return NextResponse.json({ key });
  }

  // Fallback mode: Fetch from Digitraffic (Finland/Baltic)
  try {
    const res = await fetch("https://meri.digitraffic.fi/api/ais/v1/locations", {
      next: { revalidate: 30 }
    });
    const data = await res.json();
    if (!data.features) return NextResponse.json({ ships: [] });
    
    const ships = data.features.map((f: any) => ({
      id: `ship-fallback-${f.mmsi || Math.random()}`,
      mmsi: f.mmsi,
      name: f.name || `Vessel ${f.mmsi}`,
      callsign: "N/A",
      type: 0,
      lng: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
      sog: f.sog || 0,
      cog: f.cog || 0,
      heading: f.heading || 0,
      navStat: 0,
      lastUpdated: Date.now(),
    }));
    return NextResponse.json({ ships });
  } catch (err) {
    return NextResponse.json({ ships: [] });
  }
}
