"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { motion } from "motion/react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", { email, password });
      router.push("/login"); // Redirect to login after successful registration
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed.");
    }
  };

  return (
    <div className="bg-black min-h-screen relative selection:bg-white/20 selection:text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center relative z-10 px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00E5FF]/5 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md liquid-glass border border-white/10 rounded-3xl p-8"
        >
          <h2 className="text-3xl font-heading italic text-white mb-2 text-center">Join Palantir</h2>
          <p className="text-white/50 text-sm font-body text-center mb-8">Create your secure intelligence account</p>
          
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-white/70 text-xs font-body mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-white/70 text-xs font-body mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
              />
            </div>
            
            <button 
              type="submit"
              className="mt-4 w-full bg-[#00E5FF] text-black rounded-xl py-3 font-body font-bold hover:bg-[#00E5FF]/90 transition-all hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]"
            >
              Create Account
            </button>
            
            <p className="text-center text-white/40 text-xs font-body mt-4">
              Already have an account? <Link href="/login" className="text-white hover:text-[#00E5FF] transition-colors">Login</Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
