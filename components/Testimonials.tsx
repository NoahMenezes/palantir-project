"use client";

export function Testimonials() {
  const testimonials = [
    {
      quote: "A complete rebuild in five days. The result outperformed everything we'd spent months building before.",
      name: "Sarah Chen",
      role: "CEO, Luminary"
    },
    {
      quote: "Conversions up 4x. That's not a typo. The design just works differently when it's built on real data.",
      name: "Marcus Webb",
      role: "Head of Growth, Arcline"
    },
    {
      quote: "They didn't just design our site. They defined our brand. World-class doesn't begin to cover it.",
      name: "Elena Voss",
      role: "Brand Director, Helix"
    }
  ];

  return (
    <section className="py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="liquid-glass rounded-full px-3.5 py-1 mb-6 text-xs font-medium text-white font-body">
          What They Say
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9]">
          Don't take our word for it.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {testimonials.map((item, idx) => (
          <div key={idx} className="liquid-glass rounded-2xl p-8 flex flex-col justify-between h-full hover:bg-white/[0.03] transition-colors">
            <p className="text-white/80 font-body font-light text-sm italic mb-8 leading-relaxed">
              &quot;{item.quote}&quot;
            </p>
            <div>
              <div className="text-white font-body font-medium text-sm">
                {item.name}
              </div>
              <div className="text-white/50 font-body font-light text-xs mt-1">
                {item.role}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
