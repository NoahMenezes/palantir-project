"use client";

import { Zap, Palette, BarChart3, Shield } from "lucide-react";

export function FeaturesGrid() {
  const features = [
    {
      icon: <Zap className="h-5 w-5 text-white" />,
      title: "Robust Sensing Layer",
      description: "Continuously ingest massive volumes of real-time data from diverse OSINT sources worldwide."
    },
    {
      icon: <Palette className="h-5 w-5 text-white" />,
      title: "AI Orientation",
      description: "Computer vision detects objects while LLMs infer context and relationships across multiple data layers."
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-white" />,
      title: "Prioritized Anomalies",
      description: "Instead of raw alerts, the system highlights critical events, enabling faster decision-making."
    },
    {
      icon: <Shield className="h-5 w-5 text-white" />,
      title: "Fusion Layer",
      description: "A centralized command interface integrating all signals into a unified 4D operational view on a 3D globe."
    }
  ];

  return (
    <section className="py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="liquid-glass rounded-full px-3.5 py-1 mb-6 text-xs font-medium text-white font-body">
          Why Us
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9]">
          The difference is everything.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {features.map((feature, idx) => (
          <div key={idx} className="liquid-glass rounded-2xl p-6 flex flex-col items-start hover:bg-white/[0.03] transition-colors">
            <div className="liquid-glass-strong rounded-full w-10 h-10 flex items-center justify-center mb-6">
              {feature.icon}
            </div>
            <h3 className="text-xl font-heading italic text-white mb-3">
              {feature.title}
            </h3>
            <p className="text-white/60 font-body font-light text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
