"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, Filter, MapPin, Award, Users, Trophy, Zap, 
  ArrowRight, Loader2, Sparkles, Video, Briefcase, UserCheck, ChevronRight 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface EcosystemUser {
  name: string;
  role: string;
  district: string;
  sport?: string;
}

export default function UnifiedHomePage() {
  const [currentUser, setCurrentUser] = useState<EcosystemUser>({
    name: "Platform Member",
    role: "athlete",
    district: "Bengaluru",
    sport: "Football"
  });
  const [loading, setLoading] = useState(true);

  // Platform dynamic metric counters
  const [totalAthletes, setTotalAthletes] = useState(142);
  const [activeDeals, setActiveDeals] = useState(18);
  const [liveTournaments, setLiveTournaments] = useState(6);

  useEffect(() => {
    const initializeUnifiedEngine = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, ecosystem_role, district, sport")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setCurrentUser({
            name: profile.name || session.user.email?.split("@")[0] || "Member",
            role: profile.ecosystem_role || "athlete",
            district: profile.district || "Bengaluru",
            sport: profile.sport || "Football"
          });
        }

        // Asynchronously calculate real dynamic metric counters from active cloud tables
        const [profRes, oppsRes, tourRes] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("ecosystem_role", "athlete"),
          supabase.from("sponsorship_opportunities").select("id", { count: "exact", head: true }),
          supabase.from("tournaments").select("id", { count: "exact", head: true })
        ]);

        if (profRes.count) setTotalAthletes(profRes.count);
        if (oppsRes.count) setActiveDeals(oppsRes.count);
        if (tourRes.count) setLiveTournaments(tourRes.count);
      }
      setLoading(false);
    };

    initializeUnifiedEngine();
  }, []);

  // Helper mapping resolving dynamic identity hooks safely
  const getAvatarInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(" ");
    return parts.length > 1 
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() 
      : nameStr.slice(0, 2).toUpperCase();
  };

  // Dedicated dynamic navigation routing mapping base role access parameters
  const navigateToRoleWorkspace = () => {
    if (currentUser.role.toLowerCase() === "scout" || currentUser.role.toLowerCase() === "academy") {
      window.location.href = "/dashboard/scout";
    } else {
      window.location.href = "/dashboard/athlete";
    }
  };

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 flex flex-col justify-between select-none">
      
      {/* GLOBAL APPLICATION NAVIGATION HEADER */}
      <header className="border-b border-slate-800/80 bg-[#080d10]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Identity Matrix Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-500 p-0.5 flex-shrink-0">
              <div className="w-full h-full bg-[#080d10] rounded-[10px] flex items-center justify-center font-black text-xs text-white">
                {loading ? "●" : getAvatarInitials(currentUser.name)}
              </div>
            </div>
            <div className="hidden sm:block">
              <h2 className="text-xs font-bold text-white capitalize leading-tight">{currentUser.name}</h2>
              <span className="text-[10px] text-emerald-400 capitalize block font-semibold">
                {currentUser.role} Account • {currentUser.district}
              </span>
            </div>
          </div>

          {/* CENTRAL ROUTE LINKS DIRECTORY (LINKEDIN STYLE) */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
            <button 
              onClick={() => window.location.href = "/home"}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white border border-slate-800 flex items-center gap-1 cursor-pointer flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Home Feed
            </button>
            <button 
              onClick={() => window.location.href = "/feed"}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/50 transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
            >
              <Video className="w-3.5 h-3.5" /> Reels
            </button>
            <button 
              onClick={() => window.location.href = "/tournaments"}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/50 transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
            >
              <Trophy className="w-3.5 h-3.5" /> Tournaments
            </button>
            <button 
              onClick={() => window.location.href = "/sponsors"}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/50 transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
            >
              <Briefcase className="w-3.5 h-3.5" /> Brands Hub
            </button>
            <button 
              onClick={() => window.location.href = "/communities"}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/50 transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
            >
              <Users className="w-3.5 h-3.5" /> Community
            </button>
          </nav>

          {/* EXIT / DISCONNECT HOOK */}
          <button 
            onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}
            className="text-xs font-bold text-red-400/80 hover:text-red-400 px-2.5 py-1 rounded hover:bg-red-500/10 transition-colors flex-shrink-0"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* CORE WORKSPACE CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* HERO WELCOME BANNER FEATURING DYNAMIC ROUTE REDIRECTOR */}
        <div className="bg-[#0c1419] border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />
          
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] uppercase font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 tracking-wider">
              Ecosystem Root Access
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white capitalize tracking-tight leading-tight">
              Welcome back to PlayedIn, {currentUser.name}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your centralized access engine for verifiable athletic validation, real-time highlight matrix routing, direct tournament bracket line-ups, and hyperlocal brand package monetization.
            </p>
          </div>

          {/* DYNAMIC PRIMARY PATHWAY BUTTON TO RELEVANT WORKSPACE SECTION */}
          <div className="w-full md:w-auto flex-shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5 md:text-right">
              Active Control Station
            </span>
            <button 
              onClick={navigateToRoleWorkspace}
              className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Access Private {currentUser.role} Space</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* METRICS HUD ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#0c1419] border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Ecosystem Pool</span>
              <span className="text-xl font-black text-white block mt-0.5">{totalAthletes} Active Profiles</span>
            </div>
            <div className="p-3 bg-blue-500/5 text-blue-400 rounded-xl border border-blue-500/10"><UserCheck className="w-5 h-5" /></div>
          </div>
          <div className="p-4 bg-[#0c1419] border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Brand Integrations</span>
              <span className="text-xl font-black text-emerald-400 block mt-0.5">{activeDeals} Active Deals</span>
            </div>
            <div className="p-3 bg-emerald-500/5 text-emerald-400 rounded-xl border border-emerald-500/10"><Zap className="w-5 h-5" /></div>
          </div>
          <div className="p-4 bg-[#0c1419] border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Regional Fixtures</span>
              <span className="text-xl font-black text-amber-400 block mt-0.5">{liveTournaments} Brackets Live</span>
            </div>
            <div className="p-3 bg-amber-500/5 text-amber-400 rounded-xl border border-amber-500/10"><Trophy className="w-5 h-5" /></div>
          </div>
        </div>

        {/* 4-MODULE DISCOVERY QUICK ACCESS CARDS GRID */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">System Directories</span>
              <h3 className="text-sm font-bold text-white">Explore Functional Hubs</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Routing Matrix Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* MODULE 1: REELS FEED */}
            <div 
              onClick={() => window.location.href = "/feed"}
              className="p-5 bg-[#0c1419] border border-slate-800 hover:border-slate-700 rounded-2xl transition-all cursor-pointer flex justify-between items-center group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 flex-shrink-0">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">Grassroots Reels Engine</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Consume localized highlight recordings, upload drills, and secure peer technique feedback.</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors flex-shrink-0 ml-2" />
            </div>

            {/* MODULE 2: TOURNAMENTS */}
            <div 
              onClick={() => window.location.href = "/tournaments"}
              className="p-5 bg-[#0c1419] border border-slate-800 hover:border-slate-700 rounded-2xl transition-all cursor-pointer flex justify-between items-center group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 flex-shrink-0">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Live Tournament Command</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Evaluate weekend turf cups, map active division brackets, and deploy line-up setups directly.</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors flex-shrink-0 ml-2" />
            </div>

            {/* MODULE 3: SPONSORSHIPS */}
            <div 
              onClick={() => window.location.href = "/sponsors"}
              className="p-5 bg-[#0c1419] border border-slate-800 hover:border-slate-700 rounded-2xl transition-all cursor-pointer flex justify-between items-center group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 flex-shrink-0">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Hyperlocal Brand Marketplace</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Exchange documented timeline validation assets for secure regional gear and physical kit allocations.</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors flex-shrink-0 ml-2" />
            </div>

            {/* MODULE 4: COMMUNITY HUB */}
            <div 
              onClick={() => window.location.href = "/communities"}
              className="p-5 bg-[#0c1419] border border-slate-800 hover:border-slate-700 rounded-2xl transition-all cursor-pointer flex justify-between items-center group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 flex-shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Community Engagement Hub</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Lodge local discussion parameters, schedule physical casual matches, and interface with regional experts.</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors flex-shrink-0 ml-2" />
            </div>

          </div>
        </div>

      </main>

      {/* COMPREHENSIVE PLATFORM FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#080d10] py-4 px-6 text-center text-[10px] text-slate-600 font-mono flex-shrink-0">
        PlayedIn Master OS • Verified Multi-Sided Production Engine
      </footer>

    </div>
  );
}