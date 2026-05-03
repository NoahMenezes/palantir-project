import { SignIn } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";

export default function LoginPage() {
  return (
    <div className="bg-black min-h-screen relative flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center relative z-10 px-6 pt-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00E5FF]/5 blur-[120px] rounded-full pointer-events-none" />
        <SignIn />
      </div>
    </div>
  );
}
