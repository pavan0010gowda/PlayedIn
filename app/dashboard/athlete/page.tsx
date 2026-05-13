"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, MapPin, Users, DollarSign, Calendar, Star, 
  CheckCircle, Share2, MessageSquare, Play, Award, ArrowLeft, Loader2 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AthleteDashboard() {
  const [activeTab, setActiveTab] = useState("about");
  const [profileName, setProfileName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [initials, setInitials] = useState("AS");
  const [loading, setLoading] = useState(true);

  // Dynamically pull this specific user's saved Name from Supabase Postgres
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserEmail(session.user.email || "");
        
        // Fetch real name from profiles table
        const { data } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", session.user.id)
          .single();

        if (data?.name) {
          setProfileName(data.name);
          // Calculate dynamic initials (e.g. "Pavan Gowda" -> "PG")
          const nameParts = data.name.trim().split(" ");
          if (nameParts.length > 1) {
            setInitials((nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase());
          } else {
            setInitials(data.name.slice(0, 2).toUpperCase());
          }
        } else {
          // Fallback if record is syncing
          const fallback = session.user.email?.split("@")[0] || "Athlete";
          setProfileName(fallback);
          setInitials(fallback.slice(0, 2).toUpperCase());
        }
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 pb-12">
      <header className="border-b border-slate-800/80 bg-[#080d10]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            className="flex items-center gap-2 text-xs font-bold text-red-400/80 hover:text-red-400 transition-colors border border-red-500/20 bg-red-500/5 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            Sign Out OS
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-400 font-mono">Live Cloud Profile Syncing</span>
          </div>
        </div>
      </header>

      {/* Hero Profile Header */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="bg-[#0c1419] border border-slate-800/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              
              {/* Dynamic Initials Avatar */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 flex-shrink-0">
                <div className="w-full h-full bg-[#080d10] rounded-[14px] flex items-center justify-center font-black text-2xl text-emerald-400 tracking-wider">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : initials}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Dynamic Real Name Render */}
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white capitalize">
                    {loading ? "Syncing Identity..." : profileName}
                  </h1>
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified Athlete
                  </span>
                </div>
                
                <p className="text-emerald-400 font-semibold text-sm">Attacking Midfielder • Football</p>
                
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Bengaluru, Karnataka</span>
                  <span className="text-[11px] text-slate-500 font-mono block">{userEmail}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer">
                <MessageSquare className="w-3.5 h-3.5" /> Book Mentorship
              </button>
            </div>
          </div>

          {/* Core Analytics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div className="bg-[#080d10]/50 p-3 rounded-xl border border-slate-800/50">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">Local Ranking</span>
              <span className="text-lg font-bold text-white block mt-0.5">#7 Karnataka U21</span>
            </div>
            <div className="bg-[#080d10]/50 p-3 rounded-xl border border-slate-800/50">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">Monthly Earnings</span>
              <span className="text-lg font-bold text-emerald-400 block mt-0.5">₹82,000/mo</span>
            </div>
            <div className="bg-[#080d10]/50 p-3 rounded-xl border border-slate-800/50">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">Scout Views</span>
              <span className="text-lg font-bold text-white block mt-0.5">+214 This Month</span>
            </div>
            <div className="bg-[#080d10]/50 p-3 rounded-xl border border-slate-800/50">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">Followers</span>
              <span className="text-lg font-bold text-white block mt-0.5">18.4K Grassroots</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout Sections */}
      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-px">
            {["about", "achievements", "highlights"].map((tab) => (
              <button
                key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold capitalize rounded-t-lg transition-all ${activeTab === tab ? "text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5" : "text-slate-400"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "about" && (
            <div className="bg-[#0c1419] border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Athlete Bio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Grassroots dynamic player actively competing in local division matches. Focused on high agility, vision, and stamina development. Open for professional scouting reviews and academy recruitment tracking.
              </p>
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800/50">
                {["Turf Specialist", "Playmaking", "High Stamina"].map((tag) => (
                  <span key={tag} className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="bg-[#0c1419] border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Verified Records</h3>
              <div className="p-3 bg-[#080d10] border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <span>Winner - Bengaluru Turf Super Cup 2026</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Verified</span>
              </div>
            </div>
          )}

          {activeTab === "highlights" && (
            <div className="bg-[#0c1419] border border-slate-800 rounded-2xl p-6 text-center py-12">
              <Play className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Video reels interface syncing with cloud repository...</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0c1419] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verification Matrix</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Identity Connected</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Local Association Verified</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}