"use client";

import React, { useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Tile3DLayer } from '@deck.gl/geo-layers';
import { Tiles3DLoader } from '@loaders.gl/3d-tiles';

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_MAPTILES_API;
const TILESET_URL = `https://tile.googleapis.com/v1/3dtiles/root.json`;

// Initial view for DeckGL
const INITIAL_VIEW_STATE = {
  longitude: -74.006, // default NYC
  latitude: 40.7128,
  zoom: 16,
  pitch: 65,
  bearing: 0
};

export function Google3DViewer() {
  const [layers, setLayers] = useState<any[]>([]);

  useEffect(() => {
    if (!GOOGLE_API_KEY) return;
    
    const tile3DLayer = new Tile3DLayer({
      id: 'google-3d-tiles',
      data: TILESET_URL,
      loader: Tiles3DLoader,
      loadOptions: {
        fetch: {
          headers: {
            'X-GOOG-API-KEY': GOOGLE_API_KEY
          }
        }
      },
      onTileLoad: (tileHeader) => {
        // Optional logging for successful load
      }
    });

    setLayers([tile3DLayer]);
  }, []);

  if (!GOOGLE_API_KEY) {
    return (
      <div className="w-full h-[50vh] bg-black/50 border border-red-500/50 rounded-2xl flex items-center justify-center p-8 backdrop-blur-md">
        <div className="text-red-500 font-mono text-sm">Error: Missing NEXT_PUBLIC_MAPTILES_API environment variable.</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[50vh] rounded-2xl overflow-hidden border border-white/10 relative shadow-[0_0_50px_rgba(0,229,255,0.05)] bg-[#0A0A0C]/50 backdrop-blur-sm group">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-3">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E5FF]"></span>
        </div>
        <span className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-widest font-bold">Live 3D Global Viewer</span>
      </div>
      
      {/* Interaction Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <span className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Scroll to zoom &middot; Drag to pan &middot; Ctrl+Drag to pitch</span>
      </div>
    </div>
  );
}
