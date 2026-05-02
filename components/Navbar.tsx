"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-8 lg:px-16 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <div className="h-12 w-12 relative overflow-hidden rounded-xl">
          <Image src="/assets/logo-icon.png" alt="Logo" fill className="object-cover" />
        </div>
      </div>

      <div className="hidden md:flex items-center liquid-glass rounded-full px-1.5 py-1">
        <Link href="#" className="px-3 py-2 text-sm font-medium text-foreground/90 font-body hover:text-white transition-colors">Home</Link>
        <Link href="#" className="px-3 py-2 text-sm font-medium text-foreground/90 font-body hover:text-white transition-colors">Services</Link>
        <Link href="#" className="px-3 py-2 text-sm font-medium text-foreground/90 font-body hover:text-white transition-colors">Work</Link>
        <Link href="#" className="px-3 py-2 text-sm font-medium text-foreground/90 font-body hover:text-white transition-colors">Process</Link>
        <Link href="#" className="px-3 py-2 text-sm font-medium text-foreground/90 font-body hover:text-white transition-colors">Pricing</Link>
      </div>

      <div className="flex items-center">
        <button className="bg-white text-black rounded-full px-3.5 py-1.5 text-sm font-body font-medium flex items-center gap-1 hover:bg-white/90 transition-colors">
          Get Started
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
