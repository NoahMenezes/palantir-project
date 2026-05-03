"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Play } from "lucide-react";
import { BlurText } from "./BlurText";
import { Globe3D, GlobeMarker } from "@/components/ui/3d-globe";

export function Hero() {
  return (
    <section className="fixed top-0 left-0 h-screen w-full overflow-hidden flex items-center z-0 bg-black">
      {/* Subtle Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00E5FF]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center w-full max-w-7xl mx-auto px-6 md:px-12 h-full pt-24 lg:pt-0 gap-12">

        {/* Left Side: Content */}
        <div className="flex flex-col items-start text-left order-2 lg:order-1 pt-10 lg:pt-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="liquid-glass rounded-full px-1 py-1 flex items-center gap-2 mb-8"
          >
            <span className="bg-[#00E5FF] text-black rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
              Live
            </span>
            <span className="text-white text-xs font-body font-medium pr-3">
              Neural Signal Mesh v2.4 Active
            </span>
          </motion.div>

          <BlurText
            text="The God's Eye View of Global Activity"
            className="text-5xl md:text-6xl lg:text-[4.5rem] font-heading italic text-white leading-[0.9] max-w-xl tracking-tight justify-start"
            delay={100}
          />

          <motion.p
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-6 text-sm md:text-base text-white/60 font-body font-light leading-relaxed max-w-lg"
          >
            Unify scattered open-source signals—flights, ships, satellites, and disruptions—into a single interactive 4D view. Track world events as they unfold in real-time.
          </motion.p>

          <motion.div
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mt-10 flex items-center gap-6"
          >
            <button className="bg-white text-black rounded-full px-6 py-3 flex items-center gap-2 font-body font-bold text-sm transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Get Started
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-2 text-white/70 font-body font-medium text-sm hover:text-white transition-colors">
              <Play className="h-4 w-4 fill-current" />
              Intelligence Briefing
            </button>
          </motion.div>
        </div>

        {/* Right Side: The Globe */}
        <div className="relative w-full h-[50vh] lg:h-[80vh] flex items-center justify-center order-1 lg:order-2">
          <Globe3D
            markers={[]}
            className="w-full h-full"
            config={{
              atmosphereColor: "#4da6ff",
              atmosphereIntensity: 20,
              bumpScale: 5,
              autoRotateSpeed: 0.3,
            }}
            onMarkerClick={(marker) => {
              console.log("Clicked marker:", marker.label);
            }}
            onMarkerHover={(marker) => {
              if (marker) {
                console.log("Hovering:", marker.label);
              }
            }}
          />
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
    </section>
  );
}
