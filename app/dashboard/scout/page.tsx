"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, MapPin, Award, UserPlus, Loader2, CheckCircle, FileText, ExternalLink, Play, X, Calendar, Phone, Send, Check, MessageSquare, Mail } from "lucide-react";
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
  
  const [hoveredAthleteId, setHoveredAthleteId] = useState<string | null>(null);
  const [selectedModalAthlete, setSelectedModalAthlete] = useState<AthleteProfile | null>(null);

  // Authenticated Scout Cache
  const [scoutId, setScoutId] = useState<string | null>(null);
  const [scoutName, setScoutName] = useState("Platform Scout");

  // Functional Messaging States
  const [directMessageText, setDirectMessageText] = useState("");
  const [sendingDm, setSendingDm] = useState(false);
  const [dmStatus, setDmStatus] = useState("");

  useEffect(() => {
    const fetchScoutMatrix = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setScoutId(session.user.id);
        const { data: scoutProfile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", session.user.id)
          .single();

        if (scoutProfile?.name) setScoutName(scoutProfile.name);
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select(`*, achievements (*)`)
        .eq("ecosystem_role", "athlete")
        .order("created_at", { ascending: false });

      if (data) {
        const enrichedProfiles = data.map((profile, index) => {
          const cleanEmailPrefix = profile.email ? profile.email.split("@")[0] : "Athlete";
          const resolvedDisplayName = profile.name && profile.name.trim() !== "" ? profile.name : cleanEmailPrefix;
          const sports = ["Football", "Cricket", "Badminton", "Football"];
          const positions = ["Attacking Midfielder", "Top-Order Batsman", "Singles Specialist", "Forward"];
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

  // REAL FUNCTIONAL DM DISPATCHER
  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModalAthlete || !scoutId || !directMessageText.trim()) return;
    
    setSendingDm(true);
    setDmStatus("");

    try {
      const { error } = await supabase
        .from("direct_messages")
        .insert([
          {
            sender_id: scoutId,
            sender_name: scoutName,
            receiver_id: selectedModalAthlete.id,
            message: directMessageText.trim()
          }
        ]);

      if (error) throw error;

      setDmStatus("success");
      setDirectMessageText("");
      setTimeout(() => setDmStatus(""), 3000);
    } catch (err: any) {
      console.error("DM dispatch error:", err);
      setDmStatus("error");
    } finally {
      setSendingDm(false);
    }
  };

  const filteredAthletes = athletes.filter(item => {
    const matchesSport = selectedSport === "all" || item.sport?.toLowerCase() === selectedSport.toLowerCase();
    const safeSearchTarget = `${item.name || ""} ${item.position || ""} ${item.email || ""}`.toLowerCase();
    return matchesSport && safeSearchTarget.includes(searchQuery.toLowerCase());
  });

  const getInitials = (nameStr?: string) => {
    if (!nameStr) return "AS";
    const parts = nameStr.trim().split(" ");
    return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : nameStr.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 pb-12 relative">
      <header className="border-b border-slate-800/80 bg-[#080d10]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }} className="flex items-center gap-2 text-xs font-bold text-red-400/80 hover:text-red-400 border border-red-500/20 bg-red-500/5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
            Sign Out OS
          </button>
          <span className="font-mono text-xs text-blue-400">● Global Talent Vault & Outreach Online</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        <div className="bg-[#0c1419] border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-400 to-teal-400" />
          <h1 className="text-xl font-bold text-white">Discover Grassroots Stars</h1>
          <p className="text-xs text-slate-400 mt-0.5">Click any athlete card to access their documentation ledger and drop immediate secure messages</p>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
            <div className="md:col-span-8 relative">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Search by identity, specific division position, or profile credentials..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#080d10] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div className="md:col-span-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <select value={selectedSport} onChange={(e) => setSelectedSport(e.target.value)} className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer">
                <option value="all">All Sports Categories</option>
                <option value="football">Football</option>
                <option value="cricket">Cricket</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500 border border-slate-800/50 rounded-2xl bg-[#0c1419]/50"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" /> Indexing Global Matrix...</div>
          ) : filteredAthletes.length === 0 ? (
            <div className="py-16 text-center border border-slate-800 rounded-2xl bg-[#0c1419]"><p className="text-sm font-bold text-white">No Profiles Displayed</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredAthletes.map((athlete) => {
                const isHovered = hoveredAthleteId === athlete.id;
                return (
                  <div key={athlete.id} onMouseEnter={() => setHoveredAthleteId(athlete.id)} onMouseLeave={() => setHoveredAthleteId(null)} onClick={() => setSelectedModalAthlete(athlete)} className="bg-[#0c1419] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer group">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">{athlete.sport}</span>
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">★ {athlete.score}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-teal-400 p-0.5 flex-shrink-0">
                          <div className="w-full h-full bg-[#080d10] rounded-[10px] flex items-center justify-center font-bold text-xs text-blue-400">{getInitials(athlete.name)}</div>
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="text-sm font-bold text-white capitalize truncate group-hover:text-blue-400 transition-colors">{athlete.name}</h3>
                          <p className="text-[11px] text-emerald-400 truncate font-semibold">{athlete.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-800/60">
                        <MapPin className="w-3 h-3 text-slate-500" /> District: {athlete.district}
                      </div>
                      {isHovered && (
                        <div className="mt-3 pt-3 border-t border-blue-500/20 space-y-2 animate-in fade-in duration-200">
                          <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3 italic">"{athlete.bio}"</p>
                          <span className="text-blue-400 font-bold underline text-[10px] block text-right">Deep Dive & Chat →</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FULLY FUNCTIONAL PROFILE & CHAT MODAL */}
      {selectedModalAthlete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c1419] border border-slate-800 w-full max-w-4xl rounded-3xl relative shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            <div className="p-6 bg-[#080d10] border-b border-slate-800 flex justify-between items-start relative flex-shrink-0">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-500" />
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-teal-400 p-0.5 flex-shrink-0">
                  <div className="w-full h-full bg-[#080d10] rounded-[14px] flex items-center justify-center font-black text-xl text-blue-400">{getInitials(selectedModalAthlete.name)}</div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white capitalize">{selectedModalAthlete.name}</h2>
                  <p className="text-xs text-emerald-400 font-semibold">{selectedModalAthlete.position} • {selectedModalAthlete.sport}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{selectedModalAthlete.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedModalAthlete(null)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* INTERACTIVE SECURE DIRECT MESSAGING WORKSPACE */}
              <div className="bg-[#080d10] border-2 border-emerald-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/50" />
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Direct Connect Channel</h3>
                  </div>
                  
                  {/* DIRECT EMAIL LAUNCHER HOOK */}
                  <a href={`mailto:${selectedModalAthlete.email}?subject=Scouting Inquiry from PlayedIn Platform`} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer">
                    <Mail className="w-3.5 h-3.5" /> Launch Email App
                  </a>
                </div>

                <form onSubmit={handleSendDirectMessage} className="space-y-2 pt-1">
                  <textarea rows={2} required placeholder={`Type instant direct message to ${selectedModalAthlete.name}... (e.g. "Loved your footwork reel. Let's schedule a call.")`} value={directMessageText} onChange={(e) => setDirectMessageText(e.target.value)} className="w-full bg-[#0c1419] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none placeholder-slate-600" />
                  
                  <div className="flex justify-between items-center pt-1">
                    <div>
                      {dmStatus === "success" && <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5 stroke-[3]" /> Message securely dropped to athlete's dashboard inbox!</span>}
                      {dmStatus === "error" && <span className="text-xs text-red-400">Failed dispatching payload.</span>}
                    </div>

                    <button type="submit" disabled={sendingDm} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                      {sendingDm ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>Drop Secure Message <Send className="w-3 h-3 stroke-[2.5]" /></>}
                    </button>
                  </div>
                </form>
              </div>

              {/* Verified Documents Ledger Stack */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Attached Vault Documentation ({selectedModalAthlete.achievements?.length || 0})</h3>
                {!selectedModalAthlete.achievements || selectedModalAthlete.achievements.length === 0 ? (
                  <div className="p-6 text-center bg-[#080d10] border border-slate-800 rounded-xl"><p className="text-xs text-slate-500 italic">No verification documents attached.</p></div>
                ) : (
                  selectedModalAthlete.achievements.map((ach) => (
                    <div key={ach.id} className="p-4 bg-[#080d10] border border-slate-800 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{ach.category}</span>
                        <h4 className="text-xs font-bold text-white mt-1">{ach.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Entity: <strong className="text-slate-300">{ach.organization_name}</strong></p>
                      </div>
                      {ach.document_url && <a href={ach.document_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/20">Inspect Proof →</a>}
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}