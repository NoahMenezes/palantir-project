import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { FeaturesChess } from "@/components/FeaturesChess";
import { FeaturesGrid } from "@/components/FeaturesGrid";

export default function Home() {
  return (
    <div className="bg-black min-h-screen relative overflow-x-hidden selection:bg-white/20 selection:text-white">
      <div className="relative z-10 flex flex-col">
        <Navbar />
        <Hero />
        
        {/* Spacer to show the fixed hero background */}
        <div className="h-screen w-full pointer-events-none" />
        
        <div className="relative z-10 bg-black shadow-[0_-50px_100px_rgba(0,0,0,1)]">
          <FeaturesChess />
          <FeaturesGrid />
        </div>
      </div>
    </div>
  );
}
