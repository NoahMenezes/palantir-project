"use client";

import { HlsVideo } from "./HlsVideo";
import { ArrowUpRight } from "lucide-react";

export function StartSection() {
  return (
    <section className="relative w-full overflow-hidden flex flex-col items-center justify-center min-h-[500px] py-32">
      <div className="absolute inset-0 z-0">
        <HlsVideo
          src="https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div
          className="absolute top-0 w-full h-[200px]"
          style={{ background: "linear-gradient(to bottom, black, transparent)" }}
        />
        <div
          className="absolute bottom-0 w-full h-[200px]"
          style={{ background: "linear-gradient(to top, black, transparent)" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-2xl mx-auto">
        <div className="liquid-glass rounded-full px-3.5 py-1 mb-6 text-xs font-medium text-white font-body">
          How It Works
        </div>
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic tracking-tight leading-[0.9] text-white mb-6">
          You dream it. We ship it.
        </h2>
        
        <p className="text-white/60 font-body font-light text-sm md:text-base max-w-lg mb-10">
          Share your vision. Our AI handles the rest--wireframes, design, code, launch. All in days, not quarters.
        </p>
        
        <button className="liquid-glass-strong rounded-full px-6 py-3 flex items-center gap-2 text-white font-body font-medium transition-transform hover:scale-105">
          Get Started
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
