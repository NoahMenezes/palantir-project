import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const revalidate = 21600; // Cache for 6 hours

export async function GET() {
  try {
    // We read from our locally cached Starlink TLE database to bypass Celestrak rate-limits
    const filePath = path.join(process.cwd(), "public", "starlink.txt");
    const text = fs.readFileSync(filePath, "utf8");
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const satellites = [];

    // TLEs come in groups of 3 lines: Name, Line 1, Line 2
    for (let i = 0; i < lines.length - 2; i += 3) {
      const name = lines[i];
      const tleLine1 = lines[i + 1];
      const tleLine2 = lines[i + 2];

      if (!name || !tleLine1 || !tleLine2) continue;
      // Basic check to ensure it looks like a TLE
      if (tleLine1.charAt(0) !== '1' || tleLine2.charAt(0) !== '2') continue;

      const id = tleLine1.substring(2, 7).trim();

      satellites.push({
        id,
        name,
        tle1: tleLine1,
        tle2: tleLine2,
      });
    }

    // Limit to 5,000 to keep the payload size reasonable and prevent browser crashes
    // 5k is enough to look incredibly cool while maintaining high FPS
    return NextResponse.json({ satellites: satellites.slice(0, 5000) }); 
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
