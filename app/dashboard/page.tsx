import { Navbar } from "@/components/Navbar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="bg-black min-h-screen relative text-white">
      <Navbar />
      <div className="pt-32 px-8 max-w-7xl mx-auto">
        <div className="liquid-glass border border-white/10 rounded-3xl p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-heading italic">Command Center</h1>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-body mb-4">Operator Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
              <div><strong>ID:</strong> {user.id}</div>
              <div>
                <strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}
              </div>
              <div><strong>Status:</strong> Online</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
