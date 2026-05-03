"use client";

import Image from "next/image";
import { motion } from "motion/react";

export function FeaturesChess() {
  return (
    <section className="py-16 px-6 md:px-12 lg:px-24 max-w-6xl mx-auto flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center mb-16"
      >
        <div className="liquid-glass rounded-full px-3.5 py-1 mb-6 text-xs font-medium text-foreground font-body">
          Capabilities
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-foreground tracking-tight leading-[0.9]">
          Global Data. Unified View.
        </h2>
      </motion.div>

      <div className="flex flex-col gap-20 w-full max-w-5xl">
        {/* Row 1 */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24"
        >
          <div className="flex-1 flex flex-col items-start text-left">
            <h3 className="text-3xl font-heading italic text-foreground mb-6">
              Unified Live Data Streams
            </h3>
            <p className="text-foreground/60 font-body font-light text-sm md:text-base mb-8 max-w-md">
              Integrate ADS-B aviation signals, maritime AIS data, and satellite orbital trajectories. See exactly when specific regions are being observed.
            </p>
          </div>
          <div className="flex-1 w-full max-w-sm">
            <div className="liquid-glass rounded-2xl overflow-hidden aspect-square relative shadow-2xl">
              <Image
                src="/assets/feature-1.gif"
                alt="Feature 1"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </motion.div>

        {/* Row 2 */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-24"
        >
          <div className="flex-1 flex flex-col items-start text-left">
            <h3 className="text-3xl font-heading italic text-foreground mb-6">
              AI-Driven Correlation Engine
            </h3>
            <p className="text-foreground/60 font-body font-light text-sm md:text-base mb-8 max-w-md">
              Large language models and computer vision analyze transient signals to identify patterns. Rerouted flights + GPS jamming = Situational awareness.
            </p>
          </div>
          <div className="flex-1 w-full max-w-sm">
            <div className="liquid-glass rounded-2xl overflow-hidden aspect-square relative shadow-2xl">
              <Image
                src="/assets/feature-2.gif"
                alt="Feature 2"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </motion.div>

        {/* Section 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center mt-8"
        >
          <div className="liquid-glass rounded-full px-3.5 py-1 mb-8 text-xs font-medium text-foreground font-body">
            Section 2
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="flex flex-col items-start text-left liquid-glass p-8 rounded-3xl">
               <h3 className="text-2xl font-heading italic text-foreground mb-4">Tactical Edge Computing</h3>
               <p className="text-foreground/60 font-body font-light text-sm">Real-time processing at the source of data ingestion for zero-latency awareness.</p>
            </div>
            <div className="flex flex-col items-start text-left liquid-glass p-8 rounded-3xl">
               <h3 className="text-2xl font-heading italic text-foreground mb-4">Multi-Domain Fusion</h3>
               <p className="text-foreground/60 font-body font-light text-sm">Seamlessly blend space, air, land, and sea data into a single operational reality.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
