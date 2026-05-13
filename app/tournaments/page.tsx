"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, MapPin, Trophy, Calendar, Users, ArrowLeft, Loader2, DollarSign, Award, Check, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Tournament {
  id: string;
  title: string;
  organizer_name: string;
  sport: string;
  district: string;
  start_date: string;
  entry_fee: string;
  prize_pool: string;
  format: string;
  max_teams: number;
  registered_count: number;
  description: string;
}

interface RosterMember {
  id: string;
  athlete_name: string;
  registered_at: string;
}

export default function TournamentsHubPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedSport, setSelectedSport] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Registration Matrix State
  const [registeredEvents, setRegisteredEvents] = useState<{ [key: string]: boolean }>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState("");

  // Roster Deep-Dive Drawer State
  const [selectedRosterEvent, setSelectedRosterEvent] = useState<Tournament | null>(null);
  const [activeRoster, setActiveRoster] = useState<RosterMember[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  // Identity Verification Tokens
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("Platform Competitor");
  const [userRole, setUserRole] = useState("athlete");

  useEffect(() => {
    const initializeTournamentsWorkspace = async () => {
      setLoadingEvents(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, ecosystem_role")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUserName(profile.name || session.user.email?.split("@")[0] || "Athlete");
          setUserRole(profile.ecosystem_role);
        }

        // Pull active historical registrations to update UI states dynamically
        const { data: regs } = await supabase
          .from("tournament_registrations")
          .select("tournament_id")
          .eq("athlete_id", session.user.id);

        if (regs) {
          const regMap: { [key: string]: boolean } = {};
          regs.forEach(r => { regMap[r.tournament_id] = true; });
          setRegisteredEvents(regMap);
        }
      }

      // Query active tournament events ledger
      const { data: events } = await supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false });

      if (events) setTournaments(events);
      setLoadingEvents(false);
    };

    initializeTournamentsWorkspace();
  }, []);

  // Dispatch persistent registration record and update cloud capacity counters
  const handleExecuteRegistration = async (eventObj: Tournament) => {
    if (!userId) {
      setStatusFeedback("⚠️ Access verification token missing. Please sign in to map your registration parameters.");
      return;
    }
    
    if (userRole !== "athlete") {
      setStatusFeedback("⚠️ Tournament entries are optimized securely for registered Grassroots Athletes.");
      return;
    }

    if (eventObj.registered_count >= eventObj.max_teams) {
      setStatusFeedback("⚠️ Bracket mapping maximum threshold exceeded. Event roster is fully occupied.");
      return;
    }

    setSubmittingId(eventObj.id);
    setStatusFeedback("");

    try {
      // 1. Commit profile parameters directly to registrations table
      const { error: regError } = await supabase
        .from("tournament_registrations")
        .insert([
          {
            tournament_id: eventObj.id,
            athlete_id: userId,
            athlete_name: userName
          }
        ]);

      if (regError) throw regError;

      // 2. Safely increment persistent registry metrics counters on base storage target
      const updatedCount = eventObj.registered_count + 1;
      await supabase
        .from("tournaments")
        .update({ registered_count: updatedCount })
        .eq("id", eventObj.id);

      // 3. Mirror logic locally to preserve user rendering states instantly
      setRegisteredEvents(prev => ({ ...prev, [eventObj.id]: true }));
      setTournaments(prev => prev.map(t => t.id === eventObj.id ? { ...t, registered_count: updatedCount } : t));
      setStatusFeedback("🏆 Success! Roster token generated. Track line-up configurations and fixtures locally.");
    } catch (err: any) {
      console.error("Pipeline persistence output fault:", err);
      setStatusFeedback("❌ Error handling registration parameters. Validate network stability.");
    } finally {
      setSubmittingId(null);
    }
  };

  // Inspect existing registered peer accounts natively
  const handleOpenRosterView = async (targetEvent: Tournament) => {
    setSelectedRosterEvent(targetEvent);
    setLoadingRoster(true);
    
    const { data } = await supabase
      .from("tournament_registrations")
      .select("id, athlete_name, registered_at")
      .eq("tournament_id", targetEvent.id)
      .order("registered_at", { ascending: true });

    if (data) setActiveRoster(data);
    setLoadingRoster(false);
  };

  const filteredTournaments = tournaments.filter(t => {
    const matchesSport = selectedSport === "all" || t.sport.toLowerCase() === selectedSport.toLowerCase();
    const matchesSearch = `${t.title} ${t.organizer_name} ${t.prize_pool}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 pb-12 relative">
      
      {/* Platform Route Sub-Header Header */}
      <header className="border-b border-slate-800/80 bg-[#080d10]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => window.history.back()} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Exit Tournaments Command
          </button>
          <span className="font-mono text-xs text-emerald-400">● Live Knockout Framework Engine Active</span>
        </div>
      </header>

      {/* Main Filter Command and Interface Directory */}
      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        
        {/* Core Value Statement View Header */}
        <div className="bg-[#0c1419] border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest block">Competition Matrix</span>
          <h1 className="text-xl font-bold text-white mt-1">Regional Tournaments & Turf Cups</h1>
          <p className="text-xs text-slate-400 mt-0.5">Secure competitive tracking setups to elevate your algorithm rating parameters</p>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-5">
            <div className="md:col-span-8 relative">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Filter by event titles, executing hosts, or prize structures..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#080d10] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div className="md:col-span-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <select value={selectedSport} onChange={(e) => setSelectedSport(e.target.value)} className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-semibold focus:outline-none cursor-pointer">
                <option value="all">All Events</option>
                <option value="Football">⚽ Football</option>
                <option value="Cricket">🏏 Cricket</option>
                <option value="Badminton">🏸 Badminton</option>
              </select>
            </div>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {statusFeedback && (
          <div className={`p-4 rounded-xl border text-xs font-semibold animate-in fade-in duration-200 ${statusFeedback.includes("⚠️") || statusFeedback.includes("❌") ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}`}>
            {statusFeedback}
          </div>
        )}

        {/* Tournament Cards Workspace Array */}
        <div>
          {loadingEvents ? (
            <div className="py-16 text-center text-xs text-slate-500 border border-slate-800/50 rounded-2xl bg-[#0c1419]/40"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-500" /> Pulling Knockout Framework DB Matrices...</div>
          ) : filteredTournaments.length === 0 ? (
            <div className="py-16 text-center border border-slate-800 rounded-2xl bg-[#0c1419]"><Trophy className="w-12 h-12 text-slate-700 mx-auto mb-2" /><p className="text-sm font-bold text-white">No Competitions Active</p></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTournaments.map((evt) => {
                const isRegistered = registeredEvents[evt.id];
                const isSubmitting = submittingId === evt.id;
                const isFull = evt.registered_count >= evt.max_teams;

                return (
                  <div key={evt.id} className="bg-[#0c1419] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all relative">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 uppercase tracking-wider">{evt.sport} • {evt.format}</span>
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-blue-400" /> Roster: <strong className="text-white">{evt.registered_count} / {evt.max_teams}</strong>
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mt-3 leading-tight">{evt.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Operated by: <strong className="text-slate-300">{evt.organizer_name}</strong></p>

                      <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-2">
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{evt.description}</p>
                        <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                          <span className="bg-[#080d10] border border-slate-800 px-2.5 py-1 rounded text-slate-300 flex items-center gap-1"><Calendar className="w-3 h-3 text-emerald-400 flex-shrink-0" /> {evt.start_date}</span>
                          <span className="bg-[#080d10] border border-slate-800 px-2.5 py-1 rounded text-slate-300 flex items-center gap-1"><MapPin className="w-3 h-3 text-blue-400 flex-shrink-0" /> {evt.district}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-amber-400 block tracking-wider">Tournament Reward Structure</span>
                        <span className="text-xs font-black text-white flex items-center gap-1 mt-0.5"><Award className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" /> {evt.prize_pool}</span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-shrink-0">
                        {/* ROSTER INSPECTION BUTTON TRIGGER */}
                        <button onClick={() => handleOpenRosterView(evt)} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer">
                          View Lineup
                        </button>

                        {/* LIVE REGISTRATION STATE CONTROLLER */}
                        <button 
                          onClick={() => handleExecuteRegistration(evt)}
                          disabled={isRegistered || isSubmitting || isFull}
                          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                            isRegistered ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 disabled:cursor-default" :
                            isFull ? "bg-slate-800 text-slate-500 border border-slate-700 disabled:cursor-default" :
                            "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/10"
                          }`}
                        >
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isRegistered ? <>Roster Locked <Check className="w-3.5 h-3.5 stroke-[3]" /></> : isFull ? "Capacity Full" : <>Join Matrix Bracket</>}
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* COMPREHENSIVE DRAWER: ROSTER COMPETITOR INSPECTOR */}
      {selectedRosterEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1419] border border-slate-800 w-full max-w-md rounded-3xl p-6 relative shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3 flex-shrink-0">
              <div>
                <span className="text-[9px] uppercase font-bold text-blue-400 tracking-wider block">Live Roster Vault</span>
                <h3 className="text-base font-bold text-white leading-tight mt-0.5">{selectedRosterEvent.title}</h3>
                <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Occupied Slots: {activeRoster.length} / {selectedRosterEvent.max_teams}</span>
              </div>
              <button onClick={() => setSelectedRosterEvent(null)} className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"><ArrowLeft className="w-4 h-4 rotate-180" /></button>
            </div>

            <div className="flex-1 overflow-y-auto pt-4 space-y-2.5">
              {loadingRoster ? (
                <div className="py-12 text-center text-xs text-slate-500"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-blue-400" /> Evaluating Roster Tokens...</div>
              ) : activeRoster.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 italic">Bracket lineup is clear. Secure the opening token slot directly below.</div>
              ) : (
                activeRoster.map((competitor, idx) => (
                  <div key={competitor.id} className="p-3 bg-[#080d10] border border-slate-800/80 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-900 w-5 h-5 rounded-md flex items-center justify-center border border-slate-800">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-white capitalize">{competitor.athlete_name}</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">Verified Token</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}