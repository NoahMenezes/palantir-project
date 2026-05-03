"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Simple check for auth state based on cookie presence
    import('js-cookie').then((Cookies) => {
      const token = Cookies.default.get('access_token');
      setIsLoggedIn(!!token);
    });
  }, []);

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-8 lg:px-16 py-3 flex items-center justify-between">
      {/* Brand - hidden if not logged in */}
      <div className={`flex items-center transition-opacity duration-300 ${isLoggedIn ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="h-12 w-12 relative overflow-hidden rounded-xl">
          <Image src="/assets/logo-icon.png" alt="Logo" fill className="object-cover" />
        </div>
      </div>

      {/* Nav Links - hidden if not logged in */}
      <div className={`hidden md:flex items-center liquid-glass rounded-full px-1.5 py-1 transition-all duration-300 ${isLoggedIn ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
        <Link href="/" className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors">Home</Link>
        <Link href="#" className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors">Services</Link>
        <Link href="#" className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors">Work</Link>
        <Link href="#" className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors">Process</Link>
        <Link href="#" className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors">Pricing</Link>
      </div>

      {/* Auth Actions - Always visible on the right */}
      <div className="flex items-center gap-6">
        {!isLoggedIn ? (
          <>
            <Link href="/login" className="text-sm font-body font-medium text-white/60 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/signup" className="bg-white text-black rounded-full px-5 py-1.5 text-sm font-body font-bold flex items-center gap-1 hover:bg-white/90 transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              Sign Up
            </Link>
          </>
        ) : (
          <Link href="/dashboard" className="bg-white text-black rounded-full px-5 py-1.5 text-sm font-body font-bold flex items-center gap-1 hover:bg-white/90 transition-all">
            Dashboard
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </nav>
  );
}
