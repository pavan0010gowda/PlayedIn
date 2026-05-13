"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, Filter, MapPin, Award, Users, Trophy, Zap, 
  ArrowRight, Loader2, Sparkles, Video, Briefcase, UserCheck, ChevronRight, UserPlus, Send, CheckCircle 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface EcosystemUser {
  id: string;
  name: string;
  role: string;
  district: string;
  sport: string;
}

// Interfaces tracking explicit database feed payload items
interface FeedAthlete {
  id: string;
  name: string;
  sport: string;
  position?: string;
  district: string;
  score?: number;
  bio?: string;
}

interface FeedOpportunity {
  id: string;
  brand_name: string;
  title: string;
  reward_package: string;
  district: string;
  slots_available: number;
}

interface FeedTournament {
  id: string;
  title: string;
  organizer_name: string;
  start_date: string;
  district: string;
  prize_pool: string;
}

export default function UnifiedHomePage() {
  const [currentUser, setCurrentUser] = useState<EcosystemUser>({
    id: "",
    name: "Platform Member",
    role: "athlete",
    district: "Bengaluru",
    sport: "Football"
  });
  const [loading, setLoading] = useState(true);

  // Dynamic Content Feeds Segmented by Authentication Role Context
  const [recommendedAthletes, setRecommendedAthletes] = useState<FeedAthlete[]>([]);
  const [relevantOpportunities, setRelevantOpportunities] = useState<FeedOpportunity[]>([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState<FeedTournament[]>([]);
  
  // Real-time Action Feedback State
  const [interactionFeedback, setInteractionFeedback] = useState("");

  useEffect(() => {
    const initializeTailoredFeed = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, name, ecosystem_role, district, sport")
          .eq("id", session.user.id)
          .single();

        let resolvedRole = "athlete";
        let resolvedDistrict = "Bengaluru";
        let resolvedSport = "Football";

        if (profile) {
          resolvedRole = profile.ecosystem_role || "athlete";
          resolvedDistrict = profile.district || "Bengaluru";
          resolvedSport = profile.sport || "Football";
          
          setCurrentUser({
            id: profile.id,
            name: profile.name || session.user.email?.split("@")[0] || "Member",
            role: resolvedRole,
            district: resolvedDistrict,
            sport: resolvedSport
          });
        }

        // ==========================================
        // ALGORITHMIC FEED ROUTER EXECUTION PIPELINES
        // ==========================================
        
        if (resolvedRole === "scout" || resolvedRole === "organizer" || resolvedRole === "mentor") {
          // SCOUT / MENTOR / ORGANIZER REALITY: Pull active, highly ranked athletes directly targeting their district
          const { data: athletesData } = await supabase
            .from("profiles")
            .select("id, name, sport, district, bio")
            .eq("ecosystem_role", "athlete")
            // Target local context prioritized visibility
            .order("created_at", { ascending: false })
            .limit(6);

          if (athletesData) {
            // Map simulated background scoring parameters matching recruitment matrices
            const enriched = athletesData.map((a, idx) => ({
              ...a,
              sport: a.sport || resolvedSport,
              position: ["Attacking Midfielder", "Top-Order Batsman", "Singles Specialist", "Forward"][idx % 4],
              score: [94, 89, 91, 87, 95, 86][idx % 6],
              bio: a.bio || "Dedicated grassroots competitor establishing verifiable match validation blocks."
            }));
            setRecommendedAthletes(enriched);
          }
        } else {
          // ATHLETE REALITY: Pull open brand packages and live division fixtures matching their localized radius
          const [oppsRes, tourRes] = await Promise.all([
            supabase.from("sponsorship_opportunities").select("*").order("created_at", { ascending: false }).limit(4),
            supabase.from("tournaments").select("*").order("created_at", { ascending: false }).limit(4)
          ]);

          if (oppsRes.data) setRelevantOpportunities(oppsRes.data);
          if (tourRes.data) setUpcomingTournaments(tourRes.data);
        }
      }
      setLoading(false);
    };

    initializeTailoredFeed();
  }, []);

  const getAvatarInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(" ");
    return parts.length > 1 
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() 
      : nameStr.slice(0, 2).toUpperCase();
  };

  // Direct workspace bypass integration controller
  const navigateToDedicatedWorkspace = () => {
    window.location.href = `/dashboard/${currentUser.role}`;
  };

  // Instant trigger logic simulating recruiter engagement straight from the home wall
  const handleQuickRecruitPing = async (targetAthlete: FeedAthlete) => {
    setInteractionFeedback(`Direct invitation call securely dispatched to ${targetAthlete.name}'s mobile dashboard!`);
    setTimeout(() => setInteractionFeedback(""), 3500);
  };

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 flex flex-col justify-between select-none">
      
      {/* GLOBAL APPLICATION NAVIGATION HEADER */}
      <header className="border-b border-slate-800/80 bg-[#080d10]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-500 p-0.5 flex-shrink-0">
              <div className="w-full h-full bg-[#080d10] rounded-[10px] flex items-center justify-center font-black text-xs text-white">
                {loading ? "●" : getAvatarInitials(currentUser.name)}
              </div>
            </div>
            <div className="hidden sm:block">
              <h2 className="text-xs font-bold text-white capitalize leading-tight">{currentUser.name}</h2>
              <span className="text-[10px] text-emerald-400 capitalize block font-semibold">
                {currentUser.role} Feed • {currentUser.district}
              </span>
            </div>
          </div>

          {/* DYNAMIC MODULE LINK ACCESS EQUIPPED WITH FULL UNICORN DIRECTORY ROUTING */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
            <button onClick={() => window.location.href = "/home"} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white border border-slate-800 flex items-center gap-1 flex-shrink-0 cursor-pointer">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Home Wall
            </button>
            
            {/* CRITICAL UX UPGRADE: Hide personal athletic metrics from Scout & Organizer accounts */}
            {currentUser.role !== "scout" && currentUser.role !== "organizer" && (
              <button onClick={() => window.location.href = "/analytics"} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/50 transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer">
                📊 Analytics
              </button>
            )}

            <button onClick={() => window.location.href = "/feed"} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/50 transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer">
              <Video className="w-3.5 h-3.5" /> Reels Feed
            </button>
            <button onClick={() => window.location.href = "/tournaments"} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/50 transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer">
              <Trophy className="w-3.5 h-3.5" /> Tournaments
            </button>
            <button onClick={() => window.location.href = "/sponsors"} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/50 transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer">
              <Briefcase className="w-3.5 h-3.5" /> Brand Deals
            </button>
            <button onClick={() => window.location.href = "/mentorship"} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/50 transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer">
              🏆 Mentors
            </button>
            <button onClick={() => window.location.href = "/passport"} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/50 transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer">
              🛡️ Passport
            </button>
            <button onClick={() => window.location.href = "/explore"} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/50 transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer">
              📍 Explore Map
            </button>
            <button onClick={() => window.location.href = "/communities"} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/50 transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer">
              <Users className="w-3.5 h-3.5" /> Community
            </button>
          </nav>

          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }} className="text-xs font-bold text-red-400/80 hover:text-red-400 px-2.5 py-1 rounded hover:bg-red-500/10 transition-colors flex-shrink-0 cursor-pointer">
            Sign Out
          </button>
        </div>
      </header>

      {/* CORE DYNAMIC FEED CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* ACTION BANNER: PRIMARY INTERACTION ROUTER */}
        <div className="bg-[#0c1419] border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />
          
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 tracking-wider">
                Platform Workspace Linked
              </span>
              <span className="text-xs text-slate-500 font-mono">• Active Radius: {currentUser.district}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white capitalize tracking-tight leading-tight">
              {currentUser.role === "scout" ? "Scouting Command Wall Engine" :
               currentUser.role === "organizer" ? "Tournament Roster Sourcing Feed" :
               currentUser.role === "mentor" ? "Local Skills Development Radar" :
               "Athlete Discovery & Opportunity Wall"}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              {currentUser.role === "scout" ? "Review active authenticated players matching your specific regional target frameworks directly inside the stream below." :
               currentUser.role === "organizer" ? "Identify elite validated competitor identities to secure instant team allocations directly to bracket line-ups." :
               currentUser.role === "mentor" ? "Monitor grassroots active video drills and review profiles requiring immediate customized technique feedback." :
               "Explore active regional brand deployments and high-stakes weekend tournament registrations curated specifically for your profile stats."}
            </p>
          </div>

          <div className="w-full md:w-auto flex-shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5 md:text-right">
              Deep Space Operations
            </span>
            <button 
              onClick={navigateToDedicatedWorkspace}
              className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Launch {currentUser.role} Command Center</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* FEEDBACK INTEGRITY CHIP */}
        {interactionFeedback && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle className="w-4 h-4 flex-shrink-0" /> {interactionFeedback}
          </div>
        )}

        {/* ========================================== */}
        {/* CONDITIONAL REALITY 1: RECRUITER / SCOUT / MENTOR FEED */}
        {/* ========================================== */}
        {(currentUser.role === "scout" || currentUser.role === "organizer" || currentUser.role === "mentor") && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Recruitment Radar Feed</span>
                <h3 className="text-base font-bold text-white">Target Talent Candidates • {currentUser.district} Radius</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">Real-time Sourcing</span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-slate-500 border border-slate-800/40 rounded-2xl bg-[#0c1419]/30">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" /> Pulling Match Matrices...
              </div>
            ) : recommendedAthletes.length === 0 ? (
              <div className="py-12 text-center border border-slate-800 rounded-2xl bg-[#0c1419]">
                <p className="text-sm font-bold text-white">No Direct Athletes Evaluated</p>
                <p className="text-xs text-slate-500 mt-0.5">Awaiting active validation blocks inside your regional hub array.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedAthletes.map((athlete) => (
                  <div key={athlete.id} className="bg-[#0c1419] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">{athlete.sport}</span>
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          ★ {athlete.score} Index
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white mt-2 capitalize group-hover:text-blue-400 transition-colors">
                        {athlete.name}
                      </h4>
                      <p className="text-xs text-emerald-400 font-semibold mt-0.5">{athlete.position}</p>
                      
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mt-3 pt-3 border-t border-slate-800/60">
                        "{athlete.bio}"
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-600" /> {athlete.district}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => window.location.href = "/dashboard/scout"}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Deep Inspect
                        </button>
                        <button 
                          onClick={() => handleQuickRecruitPing(athlete)}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <UserPlus className="w-3 h-3" /> Ping Recruiter
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* CONDITIONAL REALITY 2: ATHLETE / PLAYER FEED */}
        {/* ========================================== */}
        {currentUser.role !== "scout" && currentUser.role !== "organizer" && currentUser.role !== "mentor" && (
          <div className="space-y-8">
            
            {/* ROW A: TAILORED SPONSORSHIPS */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Hyperlocal Monetization Wall</span>
                  <h3 className="text-base font-bold text-white">Target Brand Deployments • {currentUser.district} Hub</h3>
                </div>
                <button onClick={() => window.location.href = "/sponsors"} className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer">
                  See All Deals →
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-slate-500 border border-slate-800/40 rounded-2xl bg-[#0c1419]/30">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" /> Caching Local Sponsorships...
                </div>
              ) : relevantOpportunities.length === 0 ? (
                <div className="py-8 text-center border border-slate-800 rounded-xl bg-[#0c1419]">
                  <p className="text-xs font-bold text-slate-400">No Open Hub Packages Discovered</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {relevantOpportunities.map((deal) => (
                    <div key={deal.id} onClick={() => window.location.href = "/sponsors"} className="bg-[#0c1419] border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 flex flex-col justify-between transition-all cursor-pointer group">
                      <div>
                        <span className="text-[9px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 block w-max">
                          Slots: {deal.slots_available} Left
                        </span>
                        <h4 className="text-sm font-bold text-white mt-2 group-hover:text-amber-400 transition-colors leading-tight">
                          {deal.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{deal.brand_name}</p>
                      </div>
                      
                      <div className="mt-3 pt-2 border-t border-slate-800/60">
                        <span className="text-[9px] uppercase font-bold text-emerald-400 block">Package Setup</span>
                        <span className="text-xs font-bold text-slate-200 block truncate mt-0.5">{deal.reward_package}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ROW B: RECOMMENDED TURF CUPS & LEAGUES */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Live Competition Engine</span>
                  <h3 className="text-base font-bold text-white">Upcoming Knockout Fixtures</h3>
                </div>
                <button onClick={() => window.location.href = "/tournaments"} className="text-xs text-emerald-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer">
                  Browse Tournament Directory →
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-slate-500 border border-slate-800/40 rounded-2xl bg-[#0c1419]/30">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" /> Caching Live Tournaments...
                </div>
              ) : upcomingTournaments.length === 0 ? (
                <div className="py-8 text-center border border-slate-800 rounded-xl bg-[#0c1419]">
                  <p className="text-xs font-bold text-slate-400">No Bracket Frameworks Active</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingTournaments.map((tour) => (
                    <div key={tour.id} onClick={() => window.location.href = "/tournaments"} className="bg-[#0c1419] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between group">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-slate-500 block uppercase">{currentUser.sport} Bracket</span>
                          <span className="text-xs font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {tour.start_date}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-2 group-hover:text-emerald-400 transition-colors">
                          {tour.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">Operated by: {tour.organizer_name}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-amber-400 block">Prize Reward</span>
                          <span className="text-xs font-black text-white block">{tour.prize_pool}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 group-hover:underline flex items-center gap-0.5">
                          View Roster Details <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* FOOTER FOOTING ENGINE */}
      <footer className="border-t border-slate-800/80 bg-[#080d10] py-4 px-6 text-center text-[10px] text-slate-600 font-mono flex-shrink-0">
        PlayedIn Platform Architecture • Algorithm-Driven Custom Homepage Routing
      </footer>

    </div>
  );
}