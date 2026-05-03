"use client";

import { motion } from "motion/react";
import { Zap, Brain, BarChart3, Shield, Globe, Cpu, Lock, Activity } from "lucide-react";

export function FeaturesGrid() {
  const features = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Robust Sensing Layer",
      description: "Continuously ingest massive volumes of real-time data from diverse OSINT sources worldwide."
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: "AI Orientation",
      description: "Computer vision detects objects while LLMs infer context and relationships across multiple data layers."
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Prioritized Anomalies",
      description: "Instead of raw alerts, the system highlights critical events, enabling faster decision-making."
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Fusion Layer",
      description: "A centralized command interface integrating all signals into a unified 4D operational view on a 3D globe."
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Predictive Intelligence",
      description: "Anticipate threats before they manifest with advanced temporal modeling and trend analysis."
    },
    {
      icon: <Cpu className="h-5 w-5" />,
      title: "Edge Deployment",
      description: "Deploy intelligence modules at the edge for low-latency processing in disconnected environments."
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: "Zero-Trust Security",
      description: "Military-grade encryption and granular access controls ensure your data remains sovereign."
    },
    {
      icon: <Activity className="h-5 w-5" />,
      title: "Real-time Monitoring",
      description: "Live telemetry and pulse monitoring of global assets with sub-second synchronization."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-20 md:py-32 px-6 md:px-12 lg:px-24 w-full bg-black flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center mb-16"
      >
        <div className="liquid-glass border border-white/20 rounded-full px-3.5 py-1 mb-6 text-xs font-medium text-white font-body">
          Why Us
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9]">
          The difference is everything.
        </h2>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl"
      >
        {features.map((feature, idx) => (
          <motion.div 
            key={idx} 
            variants={itemVariants}
            className="liquid-glass border border-white/10 rounded-2xl p-6 flex flex-col items-start hover:bg-white/[0.03] transition-colors group min-h-[220px]"
          >
            <div className="liquid-glass-strong border border-white/20 rounded-full w-12 h-12 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              <div className="text-white">
                {feature.icon}
              </div>
            </div>
            <h3 className="text-xl font-heading italic text-white mb-4">
              {feature.title}
            </h3>
            <p className="text-white/60 font-body font-light text-sm leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
