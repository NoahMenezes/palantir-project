import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { FeaturesGrid } from "@/components/FeaturesGrid";
import { Timeline } from "@/components/Timeline";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="bg-black min-h-screen relative selection:bg-white/20 selection:text-white">
      <Navbar />
      
      {/* Section 1: Hero (Fixed/Background) */}
      <Hero />
      
      {/* Spacer for Hero visibility (Hero is h-screen) */}
      <div className="h-screen w-full pointer-events-none relative z-0" />

      {/* Main Scrollable Content */}
      <div className="relative z-10">
        {/* Section 2: Why Us (Sticky Background) */}
        <div className="sticky top-0 z-10 h-screen w-full bg-black flex items-center justify-center overflow-hidden">
          <div className="w-full max-w-7xl">
            <FeaturesGrid />
          </div>
        </div>

        {/* Section 3: Timeline (The Overlapping Layer) */}
        <div className="relative z-20 mt-[-100vh]">
          {/* Transparent spacer to let Section 2 be visible first */}
          <div className="h-screen w-full pointer-events-none" />
          
          {/* The actual timeline content that slides over */}
          <div className="bg-black shadow-[0_-100px_100px_rgba(0,0,0,1)] relative z-30">
            <Timeline />
          </div>

          {/* Section 4: Footer (The Final Overlap) */}
          <div className="relative z-40">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
