"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { Navbar } from "@/components/Navbar";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        router.push("/login");
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      // Import js-cookie to remove cookie state from frontend logic if needed
      // Actually the backend removes the http-only cookie
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnable2FA = async () => {
    try {
      const res = await api.post("/auth/enable-2fa");
      setQrCode(res.data.qr_code);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to generate 2FA");
    }
  };

  const handleConfirm2FA = async () => {
    try {
      await api.post("/auth/confirm-2fa", { otp_code: otpCode });
      setQrCode(null);
      setUser({ ...user, is_2fa_enabled: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid OTP code");
    }
  };

  if (!user) {
    return <div className="bg-black min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="bg-black min-h-screen relative text-white">
      <Navbar />
      <div className="pt-32 px-8 max-w-7xl mx-auto">
        <div className="liquid-glass border border-white/10 rounded-3xl p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-heading italic">Command Center</h1>
            <button 
              onClick={handleLogout}
              className="bg-white/10 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors"
            >
              Logout
            </button>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-body mb-4">Operator Profile</h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-white/70">
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Role:</strong> <span className="uppercase text-[#00E5FF]">{user.role}</span></div>
              <div><strong>Status:</strong> Online</div>
              <div>
                <strong>2FA Status:</strong> {user.is_2fa_enabled ? <span className="text-green-400">Enabled</span> : <span className="text-red-400">Disabled</span>}
              </div>
            </div>

            {!user.is_2fa_enabled && !qrCode && (
              <button 
                onClick={handleEnable2FA}
                className="mt-6 bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF] rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#00E5FF]/30 transition-colors"
              >
                Enable Two-Factor Authentication
              </button>
            )}

            {qrCode && (
              <div className="mt-8 bg-black/50 border border-white/10 p-6 rounded-2xl flex flex-col items-center">
                <h3 className="mb-4 font-heading text-lg">Scan this QR Code with Authenticator App</h3>
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 mb-6 rounded-lg bg-white p-2" />
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit OTP" 
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center tracking-widest outline-none focus:border-[#00E5FF]/50"
                  />
                  <button 
                    onClick={handleConfirm2FA}
                    className="bg-white text-black px-6 py-2 rounded-xl font-bold hover:bg-white/90"
                  >
                    Confirm
                  </button>
                </div>
                {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
