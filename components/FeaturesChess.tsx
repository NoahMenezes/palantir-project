"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export function FeaturesChess() {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-20">
        <div className="liquid-glass rounded-full px-3.5 py-1 mb-6 text-xs font-medium text-white font-body">
          Capabilities
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9]">
          Global Data. Unifed View.
        </h2>
      </div>

      <div className="flex flex-col gap-24 w-full">
        {/* Row 1 */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 flex flex-col items-start text-left">
            <h3 className="text-3xl md:text-4xl font-heading italic text-white mb-6">
              Unified Live Data Streams
            </h3>
            <p className="text-white/60 font-body font-light text-sm md:text-base mb-8 max-w-md">
              Integrate ADS-B aviation signals, maritime AIS data, and satellite orbital trajectories. See exactly when specific regions are being observed.
            </p>
            <button className="liquid-glass-strong rounded-full px-5 py-2.5 flex items-center gap-2 text-white font-body text-sm hover:scale-105 transition-transform">
              Learn more
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="liquid-glass rounded-2xl overflow-hidden aspect-[4/3] relative">
              <Image
                src="/assets/feature-1.gif"
                alt="Feature 1"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
          <div className="flex-1 flex flex-col items-start text-left">
            <h3 className="text-3xl md:text-4xl font-heading italic text-white mb-6">
              AI-Driven Correlation Engine
            </h3>
            <p className="text-white/60 font-body font-light text-sm md:text-base mb-8 max-w-md">
              Large language models and computer vision analyze transient signals to identify patterns. Rerouted flights + GPS jamming = Situational awareness.
            </p>
            <button className="liquid-glass-strong rounded-full px-5 py-2.5 flex items-center gap-2 text-white font-body text-sm hover:scale-105 transition-transform">
              See how it works
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="liquid-glass rounded-2xl overflow-hidden aspect-[4/3] relative">
              <Image
                src="/assets/feature-2.gif"
                alt="Feature 2"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
