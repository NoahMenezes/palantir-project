"use client";

import { motion, useScroll, useSpring, useTransform, MotionValue } from "motion/react";
import { useRef } from "react";

interface TimelineItemProps {
  item: {
    prefix: string;
    title: string;
    description: string;
  };
  idx: number;
  totalItems: number;
  scrollYProgress: MotionValue<number>;
}

function TimelineItem({ item, idx, totalItems, scrollYProgress }: TimelineItemProps) {
  const step = 1 / totalItems;
  const start = idx * step;
  const end = (idx + 1) * step;
  
  const beamX = useTransform(scrollYProgress, [start, end], ["-100%", "100%"]);
  const beamOpacity = useTransform(scrollYProgress, [start - 0.1, start, end, end + 0.1], [0, 1, 1, 0]);
  const titleColor = useTransform(scrollYProgress, [start, end], ["#ffffff", "#00E5FF"]);
  const dotColor = useTransform(scrollYProgress, [start, end], ["#ffffff", "#00E5FF"]);
  const dotScale = useTransform(scrollYProgress, [start, end], [1, 1.2]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: idx * 0.1 }}
      className={`flex flex-col ${idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8 md:gap-0`}
    >
      {/* Content Side */}
      <div className={`flex-1 w-full ${idx % 2 === 0 ? "md:text-right md:pr-16" : "md:text-left md:pl-16"}`}>
        <div className="liquid-glass border border-white/10 rounded-3xl p-8 hover:bg-white/[0.03] transition-colors group relative overflow-hidden">
          {/* Card Border Beam Animation (Scroll-Linked) */}
          <motion.div 
            style={{ x: beamX, opacity: beamOpacity }}
            className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent"
          />
          
          <span className="text-sm font-body font-bold text-white/40 mb-2 block">{item.prefix}</span>
          <motion.h3 
            style={{ color: titleColor }}
            className="text-2xl font-heading italic mb-4 group-hover:translate-x-1 transition-transform duration-300"
          >
            {item.title}
          </motion.h3>
          <p className="text-white/60 font-body font-light text-sm leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Center Dot */}
      <div className="relative flex items-center justify-center w-12 md:w-0">
        <motion.div 
          style={{ 
            backgroundColor: dotColor,
            scale: dotScale
          }}
          className="w-3 h-3 rounded-full z-20 shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
        />
        <div className="absolute w-8 h-8 rounded-full border border-white/20 animate-pulse" />
      </div>

      {/* Empty Side for Spacing */}
      <div className="flex-1 hidden md:block" />
    </motion.div>
  );
}

export function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const timelineData = [
    {
      prefix: "01",
      title: "Robust Sensing Layer",
      description: "Continuously ingest massive volumes of real-time data from diverse OSINT sources worldwide."
    },
    {
      prefix: "02",
      title: "AI Orientation",
      description: "Computer vision detects objects while LLMs infer context and relationships across multiple data layers."
    },
    {
      prefix: "03",
      title: "Prioritized Anomalies",
      description: "Instead of raw alerts, the system highlights critical events, enabling faster decision-making."
    },
    {
      prefix: "04",
      title: "Fusion Layer",
      description: "A centralized command interface integrating all signals into a unified 4D operational view on a 3D globe."
    },
    {
      prefix: "05",
      title: "Predictive Intelligence",
      description: "Anticipate threats before they manifest with advanced temporal modeling and trend analysis."
    },
    {
      prefix: "06",
      title: "Edge Deployment",
      description: "Deploy intelligence modules at the edge for low-latency processing in disconnected environments."
    },
    {
      prefix: "07",
      title: "Zero-Trust Security",
      description: "Military-grade encryption and granular access controls ensure your data remains sovereign."
    },
    {
      prefix: "08",
      title: "Real-time Monitoring",
      description: "Live telemetry and pulse monitoring of global assets with sub-second synchronization."
    }
  ];

  return (
    <section 
      ref={containerRef}
      className="relative z-20 bg-black py-32 px-6 md:px-12 lg:px-24 flex flex-col items-center shadow-[0_-50px_100px_rgba(0,0,0,1)]"
    >
      <div className="flex flex-col items-center text-center mb-24">
        <div className="liquid-glass border border-white/20 rounded-full px-3.5 py-1 mb-6 text-xs font-medium text-white font-body">
          Capabilities
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9]">
          The mechanics of omniscience.
        </h2>
      </div>

      <div className="relative w-full max-w-4xl">
        {/* The vertical line base */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2 hidden md:block" />
        
        {/* The Animated Border Beam Line */}
        <motion.div 
          style={{ scaleY }}
          className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#00E5FF] via-[#00E5FF] to-transparent -translate-x-1/2 hidden md:block origin-top z-10 shadow-[0_0_15px_rgba(0,229,255,0.5)]"
        />

        <div className="flex flex-col gap-24 relative z-10">
          {timelineData.map((item, idx) => (
            <TimelineItem 
              key={idx}
              item={item}
              idx={idx}
              totalItems={timelineData.length}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
