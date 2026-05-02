"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Play } from "lucide-react";
import { BlurText } from "./BlurText";

export function Hero() {
  return (
    <section className="fixed top-0 left-0 h-screen w-full overflow-hidden flex flex-col items-center z-0">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/images/hero_bg.jpeg"
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 bg-black/5 z-0"></div>
      <div
        className="absolute bottom-0 w-full h-[300px] z-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, black)" }}
      ></div>

      <div className="relative z-10 flex flex-col items-center pt-[150px] w-full px-4 text-center h-full pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="liquid-glass rounded-full px-1 py-1 flex items-center gap-2 mb-8"
        >
          <span className="bg-white text-black rounded-full px-3 py-1 text-xs font-semibold">
            New
          </span>
          <span className="text-white text-xs font-body font-medium pr-3">
            Introducing Global Intelligence
          </span>
        </motion.div>

        <BlurText
          text="The God's Eye View of Global Activity"
          className="text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-foreground leading-[0.8] max-w-4xl tracking-[-4px] justify-center"
          delay={100}
        />

        <motion.p
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-6 text-sm md:text-base text-white/70 font-body font-light leading-tight max-w-2xl"
        >
          Unify scattered open-source signals—flights, ships, satellites, and disruptions—into a single interactive 4D view. Track world events as they unfold.
        </motion.p>

        <motion.div
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mt-10 flex items-center gap-6"
        >
          <button className="liquid-glass-strong rounded-full px-5 py-2.5 flex items-center gap-2 text-white font-body font-medium text-sm transition-transform hover:scale-105">
            Get Started
            <ArrowUpRight className="h-4 w-4" />
          </button>
          <button className="flex items-center gap-2 text-white font-body font-medium text-sm hover:text-white/80 transition-colors">
            <Play className="h-4 w-4 fill-white" />
            Watch the Film
          </button>
        </motion.div>

        <div className="mt-auto pb-8 pt-16 flex flex-col items-center">
          <div className="liquid-glass rounded-full px-4 py-1.5 mb-8 text-xs text-white/70 font-body">
            Trusted by the teams behind
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-2xl md:text-3xl font-heading italic text-white/80">
            <span>Stripe</span>
            <span>Vercel</span>
            <span>Linear</span>
            <span>Notion</span>
            <span>Figma</span>
          </div>
        </div>
      </div>
    </section>
  );
}
