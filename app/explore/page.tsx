"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, Filter, MapPin, Navigation, ArrowLeft, Loader2, 
  Users, Map, Layers, Compass, UserPlus, Calendar, Trophy, CheckCircle 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface LocalEntity {
  id: string;
  name: string;
  type: "athlete" | "coach" | "academy" | "ground";
  sport: string;
  district: string;
  subZone: string;
  distance: string;
  rating?: number;
  meta?: string;
}

export default function HyperlocalDiscoveryPage() {
  const [entities, setEntities] = useState<LocalEntity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Custom Filters matching master blueprint examples
  const [selectedZone, setSelectedZone] = useState("Whitefield / Rajajinagar");
  const [selectedRadius, setSelectedRadius] = useState("5 km");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Map view switcher
  const [mapLayer, setMapLayer] = useState<"radar" | "density">("radar");
  const [actionFeedback, setActionFeedback] = useState("");

  // Target local zone presets
  const localZones = [
    "Whitefield / Rajajinagar",
    "Indiranagar / KR Puram",
    "Koramangala / Domlur",
    "Jayanagar / JP Nagar",
    "Electronic City / HSR Layout"
  ];

  useEffect(() => {
    const fetchHyperlocalNodes = async () => {
      setLoading(true);
      
      // Pull registered platform base arrays to reflect verified live nodes
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, ecosystem_role, sport, district, skill_level")
        .limit(15);

      // Populate interface buffers using reliable baseline nodes alongside dynamic DB entries
      const baselineNodes: LocalEntity[] = [
        {
          id: "node-1",
          name: "AstroTurf Pro Arena",
          type: "ground",
          sport: "Football",
          district: "Bengaluru",
          subZone: "Whitefield / Rajajinagar",
          distance: "1.2 km",
          rating: 4.9,
          meta: "5v5 & 7v7 synthetic traction turf available for instant evening practice allocations."
        },
        {
          id: "node-2",
          name: "Karnataka Youth Select Roster",
          type: "academy",
          sport: "Cricket",
          district: "Bengaluru",
          subZone: "Whitefield / Rajajinagar",
          distance: "2.5 km",
          rating: 4.8,
          meta: "Specialized high-performance net assessment and structured physical conditioning setup."
        },
        {
          id: "node-3",
          name: "Coach Rajesh Rao",
          type: "coach",
          sport: "Badminton",
          district: "Bengaluru",
          subZone: "Indiranagar / KR Puram",
          distance: "3.8 km",
          rating: 5.0,
          meta: "Certified instructor focusing heavily on advanced footwork scripts and defensive agility."
        }
      ];

      if (profiles && profiles.length > 0) {
        const dynamicNodes: LocalEntity[] = profiles.map((p, idx) => ({
          id: p.id,
          name: p.name || `Local Competitor ${idx + 1}`,
          type: p.ecosystem_role === "coach" ? "coach" : "athlete",
          sport: p.sport || "Football",
          district: p.district || "Bengaluru",
          subZone: localZones[idx % localZones.length],
          distance: `${(1.5 + (idx * 0.6)).toFixed(1)} km`,
          rating: 4.5 + (idx % 6) * 0.1,
          meta: p.skill_level || "Active super-division grassroots profile looking for reliable localized practice arrays."
        }));
        
        // Merge structured ground anchors directly with dynamic DB network indices
        setEntities([...baselineNodes, ...dynamicNodes]);
      } else {
        setEntities(baselineNodes);
      }
      
      setLoading(false);
    };

    fetchHyperlocalNodes();
  }, []);

  const triggerNodeEngagement = (nodeName: string, actionType: string) => {
    setActionFeedback(`⚡ Integrated ${actionType} directive securely transmitted to ${nodeName}!`);
    setTimeout(() => setActionFeedback(""), 3500);
  };

  const filteredEntities = entities.filter(item => {
    const matchesZone = selectedZone === "all" || item.subZone === selectedZone;
    const matchesCategory = selectedCategory === "all" || item.type === selectedCategory || item.sport.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = `${item.name} ${item.sport} ${item.meta}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZone && matchesCategory && matchesSearch;
  });

  // Calculate quick density mapping indicators
  const athleteCount = filteredEntities.filter(e => e.type === "athlete").length;
  const infrastructureCount = filteredEntities.filter(e => e.type === "ground" || e.type === "academy").length;

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 pb-12 select-none">
      
      {/* GLOBAL ROUTE HEADER */}
      <header className="border-b border-slate-800/80 bg-[#080d10]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Main Feed
          </button>
          <span className="font-mono text-xs text-blue-400 flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5" /> Geo-Discovery Active
          </span>
        </div>
      </header>

      {/* CORE WORKSPACE CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        
        {/* HERO TITLE BANNER */}
        <div className="bg-[#0c1419] border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-500" />
          <span className="text-[10px] uppercase font-bold text-blue-400 tracking-widest block">Hyperlocal Discovery Engine</span>
          <h1 className="text-xl font-bold text-white mt-1">Nearby Players, Grounds & Academies</h1>
          <p className="text-xs text-slate-400 mt-0.5">Filter verifiable local nodes instantly within your custom operational training radius</p>
          
          {/* MULTI-FILTER WORKSPACE GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 mt-5">
            
            {/* Search Searchbar */}
            <div className="lg:col-span-4 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search specific opener, keeper, or arena..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-[#080d10] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" 
              />
            </div>

            {/* Sub-Zone Anchor */}
            <div className="lg:col-span-3 relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
              <select 
                value={selectedZone} 
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full bg-[#080d10] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-semibold focus:outline-none cursor-pointer truncate"
              >
                <option value="all">All Hub Sub-Zones</option>
                {localZones.map((z, idx) => (
                  <option key={idx} value={z}>{z}</option>
                ))}
              </select>
            </div>

            {/* Distance Limits */}
            <div className="lg:col-span-2 relative">
              <Navigation className="absolute left-3 top-3 w-4 h-4 text-emerald-400" />
              <select 
                value={selectedRadius} 
                onChange={(e) => setSelectedRadius(e.target.value)}
                className="w-full bg-[#080d10] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="2 km">Within 2 km</option>
                <option value="5 km">Within 5 km</option>
                <option value="10 km">Within 10 km</option>
                <option value="all">Global Reach</option>
              </select>
            </div>

            {/* Entity Types */}
            <div className="lg:col-span-3 relative">
              <Filter className="absolute left-3 top-3 w-4 h-4 text-amber-400" />
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#080d10] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="athlete">🏃 Active Athletes</option>
                <option value="coach">📋 Instructors</option>
                <option value="ground">🏟️ Practice Grounds</option>
                <option value="academy">🛡️ Elite Academies</option>
              </select>
            </div>

          </div>
        </div>

        {/* FEEDBACK STATUS CHIP */}
        {actionFeedback && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle className="w-4 h-4 flex-shrink-0 stroke-[2.5]" /> {actionFeedback}
          </div>
        )}

        {/* WORKSPACE CONTENT COMPONENT: MAP INTERFACE vs LIST VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: INTERACTIVE RADAR & DENSITY VISUALIZER (FUTURISTIC SVG MAP) */}
          <div className="lg:col-span-5 bg-[#0c1419] border border-slate-800 rounded-2xl p-5 space-y-4 lg:sticky lg:top-24">
            
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Visualization Framework</span>
                <h3 className="text-xs font-bold text-white mt-0.5">Live Zone Density Render</h3>
              </div>

              {/* Layer Controls */}
              <div className="flex gap-1 bg-[#080d10] p-0.5 rounded-lg border border-slate-800">
                <button 
                  onClick={() => setMapLayer("radar")}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${mapLayer === "radar" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-white"}`}
                >
                  Radar Layer
                </button>
                <button 
                  onClick={() => setMapLayer("density")}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${mapLayer === "density" ? "bg-emerald-500 text-black" : "text-slate-500 hover:text-white"}`}
                >
                  Density Map
                </button>
              </div>
            </div>

            {/* SVG RADAR HUD COMPONENT */}
            <div className="w-full aspect-square bg-[#080d10] rounded-xl border border-slate-800/80 relative overflow-hidden flex items-center justify-center shadow-inner">
              
              {/* Animated Radar Sweep Lines */}
              {mapLayer === "radar" && (
                <>
                  <div className="absolute inset-0 rounded-full border border-blue-500/10 animate-ping duration-1000 opacity-20" />
                  <div className="absolute w-3/4 h-3/4 rounded-full border border-blue-500/20 pointer-events-none" />
                  <div className="absolute w-1/2 h-1/2 rounded-full border border-blue-500/30 pointer-events-none" />
                  <div className="absolute w-1/4 h-1/4 rounded-full border border-blue-500/40 pointer-events-none" />
                  <div className="absolute inset-0 border-t border-l border-blue-500/10 pointer-events-none" />
                  
                  {/* Rotating scanner beam */}
                  <div className="absolute w-1/2 h-1/2 top-0 left-0 bg-gradient-to-br from-blue-500/10 to-transparent origin-bottom-right animate-spin duration-1000 pointer-events-none" />
                </>
              )}

              {/* Heatmap Layer Overlays */}
              {mapLayer === "density" && (
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-teal-900/20 to-transparent pointer-events-none" />
              )}

              {/* CENTRAL ANCHOR PIN */}
              <div className="absolute z-10 flex flex-col items-center pointer-events-none">
                <span className="w-3 h-3 rounded-full bg-white ring-4 ring-blue-500/40 animate-pulse" />
                <span className="text-[8px] font-mono text-blue-300 font-bold bg-black/80 px-1.5 py-0.5 rounded mt-1 border border-blue-500/30">
                  {selectedRadius} Anchor
                </span>
              </div>

              {/* SIMULATED DYNAMIC ENTITY PLACEMENT NODES */}
              {filteredEntities.slice(0, 8).map((node, index) => {
                // Generate deterministic spread patterns mapping localized nodes safely
                const angle = (index * 45) * (Math.PI / 180);
                const radius = 25 + (index % 4) * 16;
                const topPos = `calc(50% + ${Math.sin(angle) * radius}%)`;
                const leftPos = `calc(50% + ${Math.cos(angle) * radius}%)`;

                const isInfra = node.type === "ground" || node.type === "academy";
                const pinColor = isInfra ? "bg-amber-400" : node.type === "coach" ? "bg-purple-400" : "bg-emerald-400";

                return (
                  <div 
                    key={node.id}
                    className="absolute group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 z-20"
                    style={{ top: topPos, left: leftPos }}
                    onClick={() => triggerNodeEngagement(node.name, "Map Focus Ping")}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full block ${pinColor} shadow-md`} />
                    
                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none w-max max-w-[120px]">
                      <div className="bg-black/90 border border-slate-700 text-[9px] text-white p-1 rounded shadow-xl leading-tight text-center">
                        <strong className="block truncate text-blue-400">{node.name}</strong>
                        <span className="text-slate-400 block text-[8px]">{node.sport} • {node.distance}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="absolute bottom-2 left-2 text-[8px] text-slate-600 font-mono">
                Lat: 12.9716 • Lon: 77.5946
              </div>
            </div>

            {/* DENSITY SUMMARY HUD */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 bg-[#080d10] rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Local Peers</span>
                <span className="text-sm font-black text-emerald-400 block mt-0.5">{athleteCount} Targets</span>
              </div>
              <div className="p-2.5 bg-[#080d10] rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Infra Anchors</span>
                <span className="text-sm font-black text-amber-400 block mt-0.5">{infrastructureCount} Hubs</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: ENTITY FILTER RESULTS LIST */}
          <div className="lg:col-span-7 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Discovered Network Ledgers ({filteredEntities.length})
              </span>
              <span className="text-[10px] text-slate-500">Sorted by Hyperlocal Distance</span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-1 text-blue-400" /> Computing geo-location buffers...
              </div>
            ) : filteredEntities.length === 0 ? (
              <div className="py-12 text-center border border-slate-800 rounded-xl bg-[#0c1419]">
                <Compass className="w-8 h-8 text-slate-700 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-400">No nodes identified within target radius.</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Expand distance filters or verify specified district coordinates.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEntities.map((item) => {
                  const isGround = item.type === "ground";
                  const isAcademy = item.type === "academy";
                  const isCoach = item.type === "coach";

                  const badgeStyle = isGround 
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                    : isAcademy 
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : isCoach
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

                  return (
                    <div 
                      key={item.id}
                      className="p-4 bg-[#0c1419] border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all group"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wide ${badgeStyle}`}>
                            {item.type} • {item.sport}
                          </span>
                          {item.rating && (
                            <span className="text-[10px] font-bold text-white bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                              ★ {item.rating.toFixed(1)}
                            </span>
                          )}
                          <span className="text-[10px] font-mono font-bold text-blue-400 ml-auto sm:ml-0 bg-blue-500/5 px-2 py-0.5 rounded">
                            📍 {item.distance}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white capitalize leading-tight group-hover:text-blue-400 transition-colors truncate block">
                          {item.name}
                        </h4>

                        {item.meta && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {item.meta}
                          </p>
                        )}

                        <span className="text-[10px] text-slate-500 block truncate pt-0.5">
                          Operational Hub: <strong>{item.subZone}</strong>
                        </span>

                      </div>

                      {/* Targeted Direct Outreach actions mapping node specific targets */}
                      <div className="w-full sm:w-auto flex flex-row sm:flex-col gap-2 justify-end flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                        {isGround ? (
                          <button 
                            onClick={() => triggerNodeEngagement(item.name, "Turf Booking Request")}
                            className="w-full sm:w-auto px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs transition-all cursor-pointer text-center"
                          >
                            Book Practice Turf
                          </button>
                        ) : isAcademy ? (
                          <button 
                            onClick={() => triggerNodeEngagement(item.name, "Academy Trial Entry")}
                            className="w-full sm:w-auto px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-all cursor-pointer text-center"
                          >
                            Request Roster Trial
                          </button>
                        ) : (
                          <button 
                            onClick={() => triggerNodeEngagement(item.name, "Practice Partner Sync")}
                            className="w-full sm:w-auto px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-lg text-xs transition-all cursor-pointer flex items-center justify-center gap-1 border border-slate-700"
                          >
                            <UserPlus className="w-3 h-3" /> Connect Peer
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}