import { Navbar } from "@/components/Navbar";
import { DataLayersSidebar } from "@/components/DataLayersSidebar";
import { FlightMap } from "@/components/FlightMap";

export default function WorldviewPage() {
  return (
    <div className="bg-black min-h-screen relative text-white overflow-y-auto overflow-x-hidden flex flex-col">
      <Navbar />

      {/* UI Overlay */}
      <div className="relative z-10 w-full flex-1 p-4 lg:p-6 pt-24 lg:pt-32 flex flex-col">
        
        {/* Header Section */}
        <div className="flex flex-col pointer-events-auto items-start mb-6">
          <div className="liquid-glass border border-white/10 rounded-xl px-4 py-2 mb-4 inline-flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_10px_#00E5FF]" />
            <span className="text-xs font-mono text-[#00E5FF] uppercase tracking-widest font-bold">Live Uplink</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-heading italic tracking-tighter drop-shadow-2xl">Worldview</h1>
          <p className="text-white/50 font-body max-w-md mt-4 text-sm leading-relaxed drop-shadow-md">
            Real-time geospatial intelligence feeds integrated via NORAD and ADS-B Exchange.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col xl:flex-row gap-6 w-full flex-1 items-stretch">
          
          {/* Left Side: Data Layers Sidebar */}
          <div className="w-full xl:w-[340px] shrink-0 pointer-events-auto">
            <DataLayersSidebar />
          </div>
          
          {/* Right Side: Flight Radar Map */}
          <div className="flex-1 w-full min-h-[80vh] pointer-events-auto relative">
            <FlightMap />
          </div>

        </div>
      </div>
    </div>
  );
}
