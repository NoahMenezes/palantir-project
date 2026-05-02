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
        
        <div className="relative z-20 bg-black">
          <FeaturesChess />
          <FeaturesGrid />
        </div>
      </div>
    </div>
  );
}
