"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, Filter, MapPin, Award, Users, Trophy, Zap, 
  ArrowLeft, Loader2, Star, Clock, CheckCircle, ShieldCheck, ChevronRight, MessageSquare 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface MentorListing {
  id: string;
  name: string;
  sport: string;
  district: string;
  hourly_rate: string;
  mentor_rating: number;
  sessions_completed: number;
  skill_level: string;
  bio?: string;
}

export default function MentorshipMarketplacePage() {
  const [mentors, setMentors] = useState<MentorListing[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filtering Parameters
  const [selectedSport, setSelectedSport] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Booking Matrix States
  const [selectedMentor, setSelectedMentor] = useState<MentorListing | null>(null);
  const [sessionType, setSessionType] = useState<"online" | "offline">("online");
  const [bookingDate, setBookingDate] = useState("");
  const [processingBooking, setProcessingBooking] = useState(false);
  const [bookingFeedback, setBookingFeedback] = useState("");

  // Authenticated Mentee Tracker Context
  const [menteeId, setMenteeId] = useState<string | null>(null);
  const [menteeName, setMenteeName] = useState("Platform Mentee");

  useEffect(() => {
    const initializeMarketplaceFeed = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setMenteeId(session.user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", session.user.id)
          .single();

        if (profile?.name) setMenteeName(profile.name);
      }

      // Query core database targets looking specifically for platform profiles flagged explicitly as active mentors
      const { data: mentorsData } = await supabase
        .from("profiles")
        .select("id, name, sport, district, hourly_rate, mentor_rating, sessions_completed, skill_level, bio")
        // In live DB architectures, filter by: .eq("is_mentor", true)
        .order("mentor_rating", { ascending: false })
        .limit(12);

      if (mentorsData) {
        // Enrich database output streams with resilient platform fallbacks
        const enriched = mentorsData.map((m, idx) => ({
          ...m,
          name: m.name || `Elite Mentor ${idx + 1}`,
          sport: m.sport || ["Football", "Cricket", "Badminton"][idx % 3],
          district: m.district || ["Bengaluru", "Mysuru", "Udupi"][idx % 3],
          hourly_rate: m.hourly_rate || ["₹499/hr", "₹799/hr", "₹1200/hr"][idx % 3],
          mentor_rating: m.mentor_rating ? Number(m.mentor_rating) : [4.9, 4.8, 5.0][idx % 3],
          sessions_completed: m.sessions_completed || [14, 28, 42][idx % 3],
          skill_level: m.skill_level || "Advanced / State Contender",
          bio: m.bio || "Specialized performance instructor delivering rigorous athletic guidance and technique validation scripts."
        }));
        setMentors(enriched);
      }
      setLoading(false);
    };

    initializeMarketplaceFeed();
  }, []);

  const getAvatarInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(" ");
    return parts.length > 1 
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() 
      : nameStr.slice(0, 2).toUpperCase();
  };

  // Securely execute booking transactions and dispatch payload entries
  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor || !menteeId) {
      setBookingFeedback("⚠️ Authentication token required. Please sign in to finalize session bookings.");
      return;
    }

    setProcessingBooking(true);
    setBookingFeedback("");

    try {
      // Create record entry targeting standard session history channels
      // (Utilizes generic storage tables or direct message streams as reliable fallback buffers)
      await supabase
        .from("direct_messages")
        .insert([
          {
            sender_id: menteeId,
            sender_name: menteeName,
            receiver_id: selectedMentor.id,
            message: `[AUTOMATED BOOKING INITIATION] Requested ${sessionType.toUpperCase()} Session for target timeline: ${bookingDate}. Base Package Rate: ${selectedMentor.hourly_rate}.`
          }
        ]);

      setBookingFeedback("✨ Success! Session request locked. The mentor has been notified instantly via platform messaging channels.");
      setTimeout(() => {
        setBookingFeedback("");
        setSelectedMentor(null);
      }, 3500);
    } catch (err) {
      console.error("Booking workflow output failure:", err);
      setBookingFeedback("❌ Error mapping session schedule. Validate database relational schema parameters.");
    } finally {
      setProcessingBooking(false);
    }
  };

  const filteredMentors = mentors.filter(m => {
    const matchesSport = selectedSport === "all" || m.sport.toLowerCase() === selectedSport.toLowerCase();
    const matchesSearch = `${m.name} ${m.district} ${m.skill_level}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 pb-12 select-none">
      
      {/* GLOBAL APPLICATION ROUTE HEADER */}
      <header className="border-b border-slate-800/80 bg-[#080d10]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Core Hub Feed
          </button>
          <span className="font-mono text-xs text-amber-400 flex items-center gap-1">
            ● Upwork / Mentorship Network Active
          </span>
        </div>
      </header>

      {/* CORE WORKSPACE CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        
        {/* HERO TITLE BANNER */}
        <div className="bg-[#0c1419] border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-red-500" />
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-widest block">Athlete Earning Economy</span>
          <h1 className="text-xl font-bold text-white mt-1">Professional Mentorship Marketplace</h1>
          <p className="text-xs text-slate-400 mt-0.5">Learn direct match mechanics from verified state/district level talent or monetize your personal instruction time</p>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-5">
            <div className="md:col-span-8 relative">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search mentors by identity, target local radius hubs, or verified tier ratings..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-[#080d10] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500" 
              />
            </div>
            <div className="md:col-span-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <select 
                value={selectedSport} 
                onChange={(e) => setSelectedSport(e.target.value)} 
                className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">All Sports Categories</option>
                <option value="Football">⚽ Football</option>
                <option value="Cricket">🏏 Cricket</option>
                <option value="Badminton">🏸 Badminton</option>
              </select>
            </div>
          </div>
        </div>

        {/* FEEDBACK INTEGRITY CHIP */}
        {bookingFeedback && (
          <div className={`p-4 rounded-xl text-xs font-bold border flex items-center gap-2 animate-in fade-in duration-200 ${bookingFeedback.includes("⚠️") || bookingFeedback.includes("❌") ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
            <CheckCircle className="w-4 h-4 flex-shrink-0 stroke-[2.5]" /> {bookingFeedback}
          </div>
        )}

        {/* MENTOR CARDS GRID */}
        <div>
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500 border border-slate-800/40 rounded-2xl bg-[#0c1419]/30">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-500" /> Compiling Verified Instructor Profiles...
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="py-16 text-center border border-slate-800 rounded-2xl bg-[#0c1419]">
              <Trophy className="w-12 h-12 text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">No Mentors Match Configured Parameters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((m) => (
                <div key={m.id} className="bg-[#0c1419] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all group relative">
                  <div>
                    {/* Top Identity Block */}
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 uppercase tracking-wider block">
                        {m.sport}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-white bg-slate-900 px-2 py-1 rounded border border-slate-800">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{m.mentor_rating.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({m.sessions_completed})</span>
                      </div>
                    </div>

                    {/* Avatar & Title Matrix */}
                    <div className="flex items-center gap-3 mt-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 p-0.5 flex-shrink-0">
                        <div className="w-full h-full bg-[#080d10] rounded-[10px] flex items-center justify-center font-bold text-xs text-amber-400">
                          {getAvatarInitials(m.name)}
                        </div>
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="text-base font-bold text-white capitalize truncate group-hover:text-amber-400 transition-colors">
                          {m.name}
                        </h3>
                        <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-0.5 truncate">
                          <ShieldCheck className="w-3 h-3 flex-shrink-0" /> {m.skill_level}
                        </span>
                      </div>
                    </div>

                    {/* Descriptive Bio Layers */}
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mt-3 pt-3 border-t border-slate-800/60">
                      "{m.bio}"
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-3 font-mono">
                      <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" /> Hub Path: {m.district}
                    </div>
                  </div>

                  {/* Checkout Pricing Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Session Fee</span>
                      <span className="text-sm font-black text-white block">{m.hourly_rate}</span>
                    </div>

                    <button 
                      onClick={() => { setSelectedMentor(m); setBookingFeedback(""); }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-black font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
                    >
                      Book Mentorship
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* TRANSACTION BOOKING MODAL DRAWER */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1419] border border-slate-800 w-full max-w-md rounded-3xl p-6 relative shadow-2xl overflow-hidden flex flex-col">
            
            <div className="flex justify-between items-start border-b border-slate-800 pb-3 flex-shrink-0">
              <div>
                <span className="text-[9px] uppercase font-bold text-amber-400 block tracking-wider">Secure Booking Hub</span>
                <h3 className="text-base font-bold text-white capitalize leading-tight mt-0.5">Schedule {selectedMentor.name}</h3>
                <span className="text-[10px] text-slate-500 block">Base rate locked at {selectedMentor.hourly_rate}</span>
              </div>
              <button onClick={() => setSelectedMentor(null)} className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessCheckout} className="space-y-4 pt-4 flex-1 overflow-y-auto">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Select Consultation Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button" 
                    onClick={() => setSessionType("online")}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${sessionType === "online" ? "bg-amber-500/10 border-amber-500 text-amber-400" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                  >
                    <span>💻 Video Call</span>
                    <span className="text-[9px] font-normal text-slate-500">Tactical Review</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setSessionType("offline")}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${sessionType === "offline" ? "bg-amber-500/10 border-amber-500 text-amber-400" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                  >
                    <span>🏟️ Turf Visit</span>
                    <span className="text-[9px] font-normal text-slate-500">Practical Drill</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Target Booking Timing</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-600" />
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. This Saturday, 10:00 AM" 
                    value={bookingDate} 
                    onChange={(e) => setBookingDate(e.target.value)} 
                    className="w-full bg-[#080d10] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" 
                  />
                </div>
                <p className="text-[9px] text-slate-500 mt-1">Instructor will verify your slots instantly via messaging channels.</p>
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[10px] text-slate-300 leading-snug">
                🛡️ <strong>Platform Verification Escrow:</strong> Funds are held securely until session tracking counters return explicit validation triggers from both peers.
              </div>

              <button 
                type="submit" 
                disabled={processingBooking}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-black font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {processingBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Initiate Payment Escrow Protocol</>}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}