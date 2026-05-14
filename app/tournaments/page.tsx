"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Trophy, Users, Award } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface LiveTournament {
  id: string;
  title: string;
  sport: string;
  prize_pool: string;
  entry_fee: string;
  max_slots: number;
  created_at: string;
}

export default function DedicatedTournamentCircuitPage() {
  const [circuits, setCircuits] = useState<LiveTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState("Verified Grassroots Athlete");

  useEffect(() => {
    const bindSessionAndData = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
        const { data: profile } = await supabase.from("profiles").select("name").eq("id", session.user.id).single();
        if (profile?.name) setCurrentUserName(profile.name);
      }

      // Execute non-cached data pool requests targeting 'live_tournaments'
      const { data } = await supabase
        .from("live_tournaments")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setCircuits(data);
      } else {
        // Fallback demo parameters if database row count is initially unseeded
        setCircuits([
          {
            id: "circuit-demo-1",
            title: "Bengaluru Turf Championship (Super Cup)",
            sport: "Cricket",
            prize_pool: "₹50,000",
            entry_fee: "₹2,500",
            max_slots: 16,
            created_at: "May 24, 2026"
          },
          {
            id: "circuit-demo-2",
            title: "Whitefield Knockout League",
            sport: "Football",
            prize_pool: "₹35,000",
            entry_fee: "₹1,800",
            max_slots: 12,
            created_at: "June 02, 2026"
          }
        ]);
      }
      setLoading(false);
    };

    bindSessionAndData();
  }, []);

  // Write squad integration directly to administrative operational queue: 'live_registrations'
  const handleTransmitJoinRequest = async (tourney: LiveTournament) => {
    setJoiningId(tourney.id);
    try {
      const targetUserId = currentUserId || "demo-unlinked-athlete-uuid";
      const { error } = await supabase.from("live_registrations").insert([{
        tournament_ref_id: tourney.id,
        tournament_name: tourney.title,
        sport: tourney.sport,
        captain_id: targetUserId,
        captain_name: currentUserName,
        team_name: `${currentUserName} Contingent`,
        status: "pending"
      }]);

      if (error) throw error;
      alert(`✨ Request Locked! Sourcing data synced perfectly into "${tourney.title}" admin ledger views.`);
    } catch (err: any) {
      console.error("Transmission Drop:", err);
      alert(`⚠️ Write Pipeline Failure: ${err.message || "Constraint mapping mismatch."}`);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 pb-16 select-none font-sans">
      {/* Top Standalone Header Layout matching provided reference preview exactly */}
      <header className="border-b border-slate-800/80 bg-[#080d10]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <button 
          onClick={() => window.location.href = "/dashboard/athlete"} 
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" /> Back to Dashboard Base
        </button>
        <span className="font-mono text-xs text-amber-400 font-extrabold flex items-center gap-1.5 shrink-0">
          🏆 High-Stakes Knockout Network Live
        </span>
      </header>

      {/* Main Grid Framework Container */}
      <main className="max-w-6xl mx-auto px-6 pt-10 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
           <div>
             <h1 className="text-2xl font-black text-white tracking-tight">Active Verifiable Circuits</h1>
             <p className="text-xs text-slate-400 mt-0.5">Real-Time Cloud Deployment Queue Matrix</p>
           </div>
           <span className="bg-slate-900 px-3 py-1 rounded-md text-xs font-mono text-slate-400 border border-slate-800 shrink-0">
             {circuits.length} Circuits Indexed
           </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
             <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
             <span className="text-xs font-mono text-slate-500">Parsing live database parameter allocations...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {circuits.map((t) => (
              <div 
                key={t.id} 
                className="bg-[#0c1419] border border-slate-800/90 p-6 rounded-2xl space-y-4 hover:border-amber-500/50 transition-all flex flex-col justify-between group"
              >
                 <div>
                    <div className="flex justify-between items-start">
                       <span className="text-[10px] font-black bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest shrink-0">
                         {t.sport} STANDARD
                       </span>
                       <span className="text-emerald-400 font-black text-xs shrink-0">
                         Pool: {t.prize_pool || "TBD Payout"}
                       </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white tracking-tight mt-3">
                      {t.title}
                    </h3>
                    
                    <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium">
                       <span className="bg-[#080d10] px-2.5 py-1 rounded border border-slate-800 flex items-center gap-1 shrink-0">
                         <Users className="w-3 h-3 text-slate-500 shrink-0" /> Slots: {t.max_slots || 16}
                       </span>
                       <span className="bg-[#080d10] px-2.5 py-1 rounded border border-slate-800 flex items-center gap-1 shrink-0">
                         <Award className="w-3 h-3 text-slate-500 shrink-0" /> Entry: {t.entry_fee || "Free"}
                       </span>
                    </div>
                 </div>

                 <button 
                   onClick={() => handleTransmitJoinRequest(t)}
                   disabled={joiningId === t.id}
                   className="w-full py-3.5 bg-slate-900 group-hover:bg-amber-500 text-slate-400 group-hover:text-black font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-slate-800 group-hover:border-amber-400 cursor-pointer mt-3 shrink-0 disabled:opacity-50"
                 >
                   {joiningId === t.id ? (
                     <Loader2 className="w-4 h-4 animate-spin text-amber-500 group-hover:text-black" />
                   ) : (
                     "REGISTER TEAM ROSTER CONTINGENT"
                   )}
                 </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}