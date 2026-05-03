"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Github, Twitter, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-40 bg-black border-t border-white/10 pt-24 pb-12 px-6 md:px-12 lg:px-24 shadow-[0_-100px_100px_rgba(0,0,0,1)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand Info */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-black rounded-sm rotate-45" />
              </div>
              <span className="text-xl font-heading italic text-white">Palantir Project</span>
            </div>
            <p className="text-white/50 font-body text-sm leading-relaxed max-w-xs">
              Pioneering the next generation of global intelligence through neural integration and multi-domain fusion.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                <Twitter className="w-4 h-4 text-white/70" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                <Github className="w-4 h-4 text-white/70" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                <Linkedin className="w-4 h-4 text-white/70" />
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-heading italic mb-8">Platform</h4>
            <ul className="flex flex-col gap-4 text-sm font-body text-white/40">
              <li><Link href="#" className="hover:text-[#00E5FF] transition-colors">Sensing Layer</Link></li>
              <li><Link href="#" className="hover:text-[#00E5FF] transition-colors">AI Correlation</Link></li>
              <li><Link href="#" className="hover:text-[#00E5FF] transition-colors">Edge Deployment</Link></li>
              <li><Link href="#" className="hover:text-[#00E5FF] transition-colors">Predictive Modeling</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-heading italic mb-8">Company</h4>
            <ul className="flex flex-col gap-4 text-sm font-body text-white/40">
              <li><Link href="#" className="hover:text-[#00E5FF] transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-[#00E5FF] transition-colors">Methodology</Link></li>
              <li><Link href="#" className="hover:text-[#00E5FF] transition-colors">Intelligence Reports</Link></li>
              <li><Link href="#" className="hover:text-[#00E5FF] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* CTA */}
          <div className="liquid-glass border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
            <h4 className="text-lg font-heading italic text-white leading-tight">
              Ready to secure your global interests?
            </h4>
            <button className="w-full bg-[#00E5FF] text-black rounded-xl py-3 text-sm font-body font-bold flex items-center justify-center gap-2 group transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]">
              Get Started
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
            <div className="flex items-center gap-2 text-white/30 text-xs">
              <Mail className="w-3 h-3" />
              <span>intelligence@palantir.ai</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-white/20 text-xs font-body uppercase tracking-widest">
            © 2026 Palantir Project. All rights reserved.
          </div>
          <div className="flex gap-8 text-white/20 text-xs font-body">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
