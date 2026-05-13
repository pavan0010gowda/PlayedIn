"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, Award, Zap, Activity, ArrowLeft, Loader2, 
  PlusCircle, CheckCircle, BarChart3, Users, Compass 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProfileState {
  id: string;
  name: string;
  ecosystem_role: string;
  district: string;
  sport: string;
  matches_played: number;
  win_percentage: number;
  consistency_streak: number;
  xp_level: number;
  sessions_completed: number;
}

export default function SportsAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<ProfileState>({
    id: "",
    name: "Platform User",
    ecosystem_role: "athlete",
    district: "Bengaluru",
    sport: "Football",
    matches_played: 12,
    win_percentage: 68,
    consistency_streak: 5,
    xp_level: 4,
    sessions_completed: 8
  });
  
  const [loading, setLoading] = useState(true);
  const [updatingLive, setUpdatingLive] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Simulated static breakdown distribution arrays for high-fidelity UI rendering
  const performanceHistory = [
    { label: "Q1 Fixtures", value: 45 },
    { label: "Q2 Fixtures", value: 65 },
    { label: "Q3 Fixtures", value: 80 },
    { label: "Current Fixtures", value: 92 },
  ];

  useEffect(() => {
    const fetchRealtimeState = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setMetrics({
            id: profile.id,
            name: profile.name || session.user.email?.split("@")[0] || "User",
            ecosystem_role: profile.ecosystem_role || "athlete",
            district: profile.district || "Bengaluru",
            sport: profile.sport || "Football",
            matches_played: profile.matches_played ?? 12,
            win_percentage: profile.win_percentage ?? 68,
            consistency_streak: profile.consistency_streak ?? 5,
            xp_level: profile.xp_level ?? 4,
            sessions_completed: profile.sessions_completed ?? 8
          });
        }
      }
      setLoading(false);
    };

    fetchRealtimeState();
  }, []);

  const handleLogMatchVictory = async () => {
    if (!metrics.id) return;
    setUpdatingLive(true);
    setFeedback("");

    const newMatches = metrics.matches_played + 1;
    const newStreak = metrics.consistency_streak + 1;
    const newWinPct = Math.min(98, Math.round(((metrics.win_percentage * metrics.matches_played) + 100) / newMatches));

    try {
      await supabase.from("profiles").update({
        matches_played: newMatches,
        win_percentage: newWinPct,
        consistency_streak: newStreak
      }).eq("id", metrics.id);

      setMetrics(prev => ({ ...prev, matches_played: newMatches, win_percentage: newWinPct, consistency_streak: newStreak }));
      setFeedback("Victory successfully logged! Continuous parameters updated inline.");
      setTimeout(() => setFeedback(""), 3500);
    } catch (err) {
      console.error("Storage update error:", err);
      setFeedback("Error mapping internal progression pipeline.");
    } finally {
      setUpdatingLive(false);
    }
  };

  const isScoutReality = metrics.ecosystem_role === "scout" || metrics.ecosystem_role === "organizer";

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 pb-12 select-none">
      
      {/* GLOBAL ROUTE HEADER */}
      <header className="border-b border-slate-800/80 bg-[#080d10]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Main Network
          </button>
          <span className="font-mono text-xs text-emerald-400 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> {isScoutReality ? "Recruitment Operations Node" : "Structured Metrics Node"}
          </span>
        </div>
      </header>

      {/* CORE ANALYTICS ENGINE WORKSPACE */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        
        {/* BANNER FRAME */}
        <div className="bg-[#0c1419] border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest block">
              {isScoutReality ? "Organizational Metrics" : "Continuous Assessment"}
            </span>
            <h1 className="text-xl font-bold text-white mt-0.5 capitalize">
              {metrics.name}'s {isScoutReality ? "Scouting Command Overview" : "Performance Metrics"}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{metrics.sport} • {metrics.district} Zone</p>
          </div>

          {/* DYNAMIC METRIC TRIGGER ACTION (HIDDEN FOR RECRUITERS) */}
          {!isScoutReality && (
            <button
              onClick={handleLogMatchVictory}
              disabled={updatingLive || loading}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50 flex-shrink-0"
            >
              {updatingLive ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4 stroke-[2.5]" />}
              <span>Log Match Victory</span>
            </button>
          )}
        </div>

        {/* FEEDBACK POPUP */}
        {feedback && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle className="w-4 h-4 flex-shrink-0 stroke-[2.5]" /> {feedback}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 border border-slate-800/40 rounded-2xl bg-[#0c1419]/30">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-500" /> Reading Relational Backend Structures...
          </div>
        ) : isScoutReality ? (

          /* ========================================== */
          /* ORGANIZATIONAL SCOUT REALITY OUTPUT        */
          /* ========================================== */
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-[#0c1419] border border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Candidate Vaults Inspected</span>
                <span className="text-2xl font-black text-white block mt-2">48 Profiles</span>
                <span className="text-[10px] text-emerald-400 block mt-1">✓ Active district mapping</span>
              </div>
              <div className="p-5 bg-[#0c1419] border border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Dispatched Meetup Calls</span>
                <span className="text-2xl font-black text-white block mt-2">14 Invitations</span>
                <span className="text-[10px] text-blue-400 block mt-1">Physical screening active</span>
              </div>
              <div className="p-5 bg-[#0c1419] border border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Accepted Call Ratios</span>
                <span className="text-2xl font-black text-white block mt-2">82% Lock-in</span>
                <span className="text-[10px] text-amber-400 block mt-1">⚡ High response efficiency</span>
              </div>
              <div className="p-5 bg-[#0c1419] border border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Network Auth Tier</span>
                <span className="text-2xl font-black text-white block mt-2">Verified Scout</span>
                <span className="text-[10px] text-purple-400 block mt-1">Multi-Sig authority live</span>
              </div>
            </div>

            <div className="p-6 bg-[#0c1419] border border-slate-800 rounded-2xl flex items-center gap-4">
              <Compass className="w-8 h-8 text-blue-400 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-white">Ecosystem Integrity Engine Connected</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your search configurations automatically prioritize cryptographic profiles backed by unalterable peer validation hashes.
                </p>
              </div>
            </div>
          </div>

        ) : (

          /* ========================================== */
          /* STANDARD ATHLETE REALITY OUTPUT            */
          /* ========================================== */
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* GRID ROW 1: PRIMARY DATA NODES */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* NODE 1: MATCH OUTPUT */}
              <div className="p-5 bg-[#0c1419] border border-slate-800 rounded-2xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Matches Logged</span>
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-2xl font-black text-white block mt-2">{metrics.matches_played}</span>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-1">
                  <TrendingUp className="w-3 h-3" /> +100% Tracking Confidence
                </div>
              </div>

              {/* NODE 2: WIN PERCENTAGE */}
              <div className="p-5 bg-[#0c1419] border border-slate-800 rounded-2xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Career Win Ratio</span>
                  <Award className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-2xl font-black text-white block mt-2">{metrics.win_percentage}%</span>
                
                {/* SVG Progress Arc Simulation */}
                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${metrics.win_percentage}%` }}
                  />
                </div>
              </div>

              {/* NODE 3: STREAK CONSISTENCY */}
              <div className="p-5 bg-[#0c1419] border border-slate-800 rounded-2xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Practice Streak</span>
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                </div>
                <span className="text-2xl font-black text-white block mt-2">{metrics.consistency_streak} Days</span>
                <span className="text-[10px] text-amber-400/90 font-medium block mt-1">🔥 Hyperlocal Activity Optimized</span>
              </div>

              {/* NODE 4: EXPERIENCE TIER */}
              <div className="p-5 bg-[#0c1419] border border-slate-800 rounded-2xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">XP Ranking Tier</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-2xl font-black text-white block mt-2">Level {metrics.xp_level}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Mentorship eligibility token validated</span>
              </div>

            </div>

            {/* GRID ROW 2: GRAPHICAL VISUALIZATIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* HISTORICAL OUTPUT CHARTS */}
              <div className="lg:col-span-7 bg-[#0c1419] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Output Trajectory Scale</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Continuous technical validation scaling mapping active tournament iterations</p>
                </div>

                <div className="space-y-4 pt-2">
                  {performanceHistory.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-medium">{item.label}</span>
                        <span className="font-mono font-bold text-emerald-400">{item.value} pts</span>
                      </div>
                      <div className="w-full bg-[#080d10] h-3 rounded-md overflow-hidden p-0.5 border border-slate-800/80">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 h-full rounded-sm transition-all duration-700" 
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* METADATA TARGET MAPPING BREAKDOWN */}
              <div className="lg:col-span-5 bg-[#0c1419] border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Algorithmic Distribution</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Parameters processed by real-time talent recruitment modules</p>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-[#080d10] border border-slate-800/80 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-slate-400">Tactical Awareness Index</span>
                    <span className="text-xs font-bold text-white bg-slate-900 px-2 py-0.5 rounded">91 / 100</span>
                  </div>
                  <div className="p-3 bg-[#080d10] border border-slate-800/80 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-slate-400">Mentorship Return Trajectory</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                      {metrics.sessions_completed} Sessions
                    </span>
                  </div>
                  <div className="p-3 bg-[#080d10] border border-slate-800/80 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-slate-400">Verified Platform Posts</span>
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">
                      Active Asset Ledger
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}