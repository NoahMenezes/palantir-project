"use client";


export function Stats() {
  const stats = [
    { value: "1.2B+", label: "Signals processed daily" },
    { value: "4D", label: "Operational visibility" },
    { value: "85ms", label: "Ingestion latency" },
    { value: "99.9%", label: "Uptime of global sensors" }
  ];

  return (
    <section className="relative w-full overflow-hidden flex flex-col items-center justify-center min-h-[400px] py-32 px-6 bg-black">
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
