"use client";

import { HlsVideo } from "./HlsVideo";

export function Stats() {
  const stats = [
    { value: "200+", label: "Sites launched" },
    { value: "98%", label: "Client satisfaction" },
    { value: "3.2x", label: "More conversions" },
    { value: "5 days", label: "Average delivery" }
  ];

  return (
    <section className="relative w-full overflow-hidden flex flex-col items-center justify-center min-h-[600px] py-32 px-6">
      <div className="absolute inset-0 z-0">
        <HlsVideo
          src="https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover saturate-0"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div
          className="absolute top-0 w-full h-[200px]"
          style={{ background: "linear-gradient(to bottom, black, transparent)" }}
        />
        <div
          className="absolute bottom-0 w-full h-[200px]"
          style={{ background: "linear-gradient(to top, black, transparent)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <div className="liquid-glass rounded-3xl p-12 md:p-16 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 text-center sm:text-left">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center sm:items-start">
                <div className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-white/60 font-body font-light text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
