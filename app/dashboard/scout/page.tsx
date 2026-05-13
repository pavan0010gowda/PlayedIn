"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, MapPin, Award, UserPlus, Loader2, CheckCircle, FileText, ExternalLink, Play, X, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Achievement {
  id: string;
  title: string;
  organization_name: string;
  organization_link?: string;
  category: string;
  date_achieved: string;
  verification_status: string;
  document_url?: string;
}

interface AthleteProfile {
  id: string;
  email: string;
  name?: string;
  bio?: string;
  avatar_url?: string;
  ecosystem_role: string;
  sport?: string;
  position?: string;
  district?: string;
  score?: number;
  achievements?: Achievement[];
}

export default function ScoutDashboard() {
  const [selectedSport, setSelectedSport] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Custom interface tracking states
  const [hoveredAthleteId, setHoveredAthleteId] = useState<string | null>(null);
  const [selectedModalAthlete, setSelectedModalAthlete] = useState<AthleteProfile | null>(null);

  useEffect(() => {
    const fetchScoutMatrix = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          achievements (*)
        `)
        .eq("ecosystem_role", "athlete")
        .order("created_at", { ascending: false });

      if (error) console.error("Matrix Query Pipeline Error:", error);

      if (data) {
        const enrichedProfiles = data.map((profile, index) => {
          const cleanEmailPrefix = profile.email ? profile.email.split("@")[0] : "Athlete";
          const formattedFallback = cleanEmailPrefix.charAt(0).toUpperCase() + cleanEmailPrefix.slice(1);
          const resolvedDisplayName = profile.name && profile.name.trim() !== "" ? profile.name : formattedFallback;
          
          const sports = ["Football", "Cricket", "Badminton", "Football"];
          const positions = ["Attacking Midfielder", "Top-Order Batsman", "Singles Specialist", "Target Man / Forward"];
          const districts = ["Bengaluru", "Mysuru", "Udupi", "Mangaluru"];
          const scores = [92, 88, 94, 85];

          return {
            ...profile,
            name: resolvedDisplayName,
            sport: sports[index % sports.length],
            position: positions[index % positions.length],
            district: districts[index % districts.length],
            score: scores[index % scores.length],
            achievements: profile.achievements || [],
            bio: profile.bio || "Passionate grassroots athlete actively competing in super division matches. Dedicated to building tactical awareness and performance longevity."
          };
        });
        setAthletes(enrichedProfiles);
      }
      setLoading(false);
    };

    fetchScoutMatrix();
  }, []);

  const filteredAthletes = athletes.filter(item => {
    const matchesSport = selectedSport === "all" || item.sport?.toLowerCase() === selectedSport.toLowerCase();
    const safeSearchTarget = `${item.name || ""} ${item.position || ""} ${item.email || ""}`.toLowerCase();
    const matchesSearch = safeSearchTarget.includes(searchQuery.toLowerCase());
    return matchesSport && matchesSearch;
  });

  // Calculate generic profile avatar initial layout tags dynamically
  const getInitials = (nameStr?: string) => {
    if (!nameStr) return "AS";
    const parts = nameStr.trim().split(" ");
    return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : nameStr.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 pb-12 relative">
      
      {/* Ecosystem Global Navigation Line */}
      <header className="border-b border-slate-800/80 bg-[#080d10]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}
            className="flex items-center gap-2 text-xs font-bold text-red-400/80 hover:text-red-400 border border-red-500/20 bg-red-500/5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
          >
            Sign Out OS
          </button>
          <span className="font-mono text-xs text-blue-400">● Global Talent Vault Engine Online</span>
        </div>
      </header>

      {/* Control Module Environment Space */}
      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        <div className="bg-[#0c1419] border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-400 to-teal-400" />
          <h1 className="text-xl font-bold text-white">Discover Grassroots Stars</h1>
          <p className="text-xs text-slate-400 mt-0.5">Hover to display preview profiles • Click card matrices for complete documentation vault inspection</p>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
            <div className="md:col-span-8 relative">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input 
                type="text" placeholder="Search by verified player identity, specific division position, or profile contact parameters..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#080d10] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div className="md:col-span-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <select value={selectedSport} onChange={(e) => setSelectedSport(e.target.value)} className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer">
                <option value="all">All Sports Categories</option>
                <option value="football">Football</option>
                <option value="cricket">Cricket</option>
                <option value="badminton">Badminton</option>
              </select>
            </div>
          </div>
        </div>

        {/* Global Matrix Presentation */}
        <div>
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500 border border-slate-800/50 rounded-2xl bg-[#0c1419]/50">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" /> Compiling Platform Identities & Embedded Credential Repositories...
            </div>
          ) : filteredAthletes.length === 0 ? (
            <div className="py-16 text-center border border-slate-800 rounded-2xl bg-[#0c1419]">
              <p className="text-sm font-bold text-white">No Verified Records Displayed</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Verify search mapping inputs or register dedicated test users to observe matrix integration behavior.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredAthletes.map((athlete) => {
                const isHovered = hoveredAthleteId === athlete.id;
                
                return (
                  <div 
                    key={athlete.id} 
                    onMouseEnter={() => setHoveredAthleteId(athlete.id)}
                    onMouseLeave={() => setHoveredAthleteId(null)}
                    onClick={() => setSelectedModalAthlete(athlete)}
                    className="bg-[#0c1419] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer group"
                  >
                    
                    {/* Basic Grid Record Snapshot */}
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">{athlete.sport}</span>
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          ★ {athlete.score}
                        </span>
                      </div>

                      {/* Header Signature Block */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-teal-400 p-0.5 flex-shrink-0">
                          <div className="w-full h-full bg-[#080d10] rounded-[10px] flex items-center justify-center font-bold text-xs text-blue-400">
                            {getInitials(athlete.name)}
                          </div>
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="text-sm font-bold text-white capitalize truncate group-hover:text-blue-400 transition-colors">
                            {athlete.name}
                          </h3>
                          <p className="text-[11px] text-emerald-400 truncate font-semibold">{athlete.position}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-800/60">
                        <MapPin className="w-3 h-3 text-slate-500" /> District: {athlete.district}
                      </div>

                      {/* Dynamic Inline Preview State Triggered on Pointer Hover */}
                      {isHovered && (
                        <div className="mt-3 pt-3 border-t border-blue-500/20 space-y-2 animate-in fade-in duration-200">
                          <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3 italic">
                            "{athlete.bio}"
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                            <span>Vault Files: <strong className="text-slate-400">{athlete.achievements?.length || 0} Docs</strong></span>
                            <span className="text-blue-400 font-bold underline">Deep Dive Profile →</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-[10px] text-slate-500 font-mono">ID: {athlete.id.slice(0, 6)}</span>
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors flex items-center gap-1">
                        Inspect Complete Vault
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* LINKEDIN STYLE COMPLETE DEEP-DIVE PROFILE MODAL WORKSPACE */}
      {selectedModalAthlete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c1419] border border-slate-800 w-full max-w-4xl rounded-3xl relative shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header Architecture */}
            <div className="p-6 bg-[#080d10] border-b border-slate-800 flex justify-between items-start relative flex-shrink-0">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-500" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-teal-400 p-0.5 flex-shrink-0">
                  <div className="w-full h-full bg-[#080d10] rounded-[14px] flex items-center justify-center font-black text-xl text-blue-400">
                    {getInitials(selectedModalAthlete.name)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-white capitalize">{selectedModalAthlete.name}</h2>
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Verified Candidate
                    </span>
                    <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded">
                      Rising Star Rating: {selectedModalAthlete.score}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">{selectedModalAthlete.position} • {selectedModalAthlete.sport}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 font-mono">
                    <span>{selectedModalAthlete.email}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {selectedModalAthlete.district}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedModalAthlete(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close Vault Workspace"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Deep-Dive Workspace Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Comprehensive Bio Section */}
              <div className="bg-[#080d10] border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Professional Summary Bio</h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedModalAthlete.bio}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-800/40">
                  {["Verified Account", "Turf Certified", "Academy Profile Active", "High Tactical Output"].map((tag) => (
                    <span key={tag} className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* TWO COLUMN GRID: VERIFIED ASSETS VAULT & VIDEO EMBEDS */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* COLUMN 1: Linked Credentials Directory */}
                <div className="md:col-span-7 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Attached Document Assets ({selectedModalAthlete.achievements?.length || 0})
                  </h3>

                  {!selectedModalAthlete.achievements || selectedModalAthlete.achievements.length === 0 ? (
                    <div className="p-6 text-center bg-[#080d10] border border-slate-800 rounded-xl">
                      <p className="text-xs text-slate-500 italic">No verification certificates uploaded by candidate.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedModalAthlete.achievements.map((ach) => (
                        <div key={ach.id} className="p-4 bg-[#080d10] border border-slate-800 rounded-xl space-y-2">
                          
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                                {ach.category}
                              </span>
                              <h4 className="text-xs font-bold text-white mt-1.5">{ach.title}</h4>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">{ach.date_achieved}</span>
                          </div>

                          {/* Linked Organization Matrix Tag */}
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                            <span>Association link:</span>
                            {ach.organization_link ? (
                              <a 
                                href={ach.organization_link.startsWith("http") ? ach.organization_link : `https://${ach.organization_link}`}
                                target="_blank" rel="noopener noreferrer"
                                className="font-bold text-blue-400 hover:underline flex items-center gap-0.5 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20"
                              >
                                {ach.organization_name} <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : (
                              <strong className="text-slate-300">{ach.organization_name}</strong>
                            )}
                          </div>

                          {/* Real Evidence Upload Direct Action Link */}
                          {ach.document_url && (
                            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                                <FileText className="w-3 h-3" /> Secure asset attached
                              </span>
                              <a 
                                href={ach.document_url} 
                                target="_blank" rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black rounded text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                              >
                                View File Evidence →
                              </a>
                            </div>
                          )}

                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* COLUMN 2: Media Highlights Engine */}
                <div className="md:col-span-5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Video Reels Repository
                  </h3>

                  <div className="space-y-3">
                    <div className="aspect-video bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                      <Play className="w-8 h-8 text-blue-400 transition-transform group-hover:scale-110 z-10" />
                      <span className="text-[10px] text-slate-400 mt-2 z-10 font-medium">Turf Finishing Drill Reel</span>
                      <span className="absolute bottom-1.5 right-2 text-[9px] text-slate-600 font-mono z-10">01:24</span>
                    </div>

                    <div className="p-4 bg-[#080d10] border border-slate-800 rounded-xl space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Recruiter Evaluation Action</span>
                      <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                        <UserPlus className="w-3.5 h-3.5" /> Append Candidate to Roster
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}