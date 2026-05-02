"use client";

import { HlsVideo } from "./HlsVideo";
import Link from "next/link";

export function CtaFooter() {
  return (
    <section className="relative w-full overflow-hidden flex flex-col justify-end min-h-[800px] pt-32">
      <div className="absolute inset-0 z-0">
        <HlsVideo
          src="https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8"
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

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading italic text-white leading-[0.85] mb-6 max-w-3xl">
          Own the Global Narrative.
        </h2>
        
        <p className="text-white/60 font-body font-light text-sm md:text-base max-w-lg mb-10">
          Book a demo of the intelligence platform. See the world as it truly is, in real time.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-32">
          <button className="liquid-glass-strong rounded-full px-6 py-3 text-white font-body font-medium transition-transform hover:scale-105">
            Book a Call
          </button>
          <button className="bg-white text-black rounded-full px-6 py-3 font-body font-medium hover:bg-white/90 transition-colors">
            View Pricing
          </button>
        </div>

        <div className="w-full border-t border-white/10 pt-8 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
          <div className="text-white/40 text-xs font-body font-light">
            © 2026 Studio. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-white/40 text-xs font-body font-light">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
