import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export function Navbar() {
  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-8 lg:px-16 py-3 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center transition-opacity duration-300">
        <div className="h-12 w-12 relative overflow-hidden rounded-xl">
          <Image src="/assets/logo-icon.png" alt="Logo" fill sizes="48px" priority className="object-cover" />
        </div>
      </div>

      {/* Nav Links */}
      <div className="hidden md:flex items-center liquid-glass rounded-full px-1.5 py-1 transition-all duration-300">
        <Link href="/" className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors">Home</Link>
        <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors">Dashboard</Link>
        <Link href="/worldview" className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors">Worldview</Link>
      </div>

      {/* Auth Actions */}
      <div className="flex items-center gap-6">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="text-sm font-body font-medium text-white/60 hover:text-white transition-colors cursor-pointer">
              Login
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="bg-white text-black rounded-full px-5 py-1.5 text-sm font-body font-bold flex items-center gap-1 hover:bg-white/90 transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] cursor-pointer">
              Sign Up
            </button>
          </SignUpButton>
        </Show>
        
        <Show when="signed-in">
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10" } }} />
        </Show>
      </div>
    </nav>
  );
}
