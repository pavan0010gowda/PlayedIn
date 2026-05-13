"use client";

import React, { useState } from "react";
import { Trophy, Settings, Users, Plus, LayoutGrid } from "lucide-react";
import Link from "next/link";

export default function OrganizerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 pb-12">
      <header className="border-b border-slate-800/80 bg-[#080d10]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={async () => {
              const { supabase } = await import("@/lib/supabase");
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            className="flex items-center gap-2 text-xs font-bold text-red-400/80 hover:text-red-400 transition-colors border border-red-500/20 bg-red-500/5 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            Sign Out OS
          </button>
          <div className="flex items-center gap-2 font-mono text-xs text-amber-400">
            <span>● Shopify Management Hub Active</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        <div className="bg-[#0c1419] border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-red-500" />
          <div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded uppercase tracking-wider block w-max">
              Live Tournament Matrix
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">Bengaluru Turf Championship</h1>
            <p className="text-xs text-slate-400 mt-1">Managing schedules, custom team rosters, and digital live score leaderboards</p>
          </div>
          <button className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0">
            <Plus className="w-4 h-4 stroke-[3]" /> Register Team Roster
          </button>
        </div>

        {/* Dynamic Brackets & Standings */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 bg-[#0c1419] border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Knockout Fixture Grid</h3>
              <span className="text-[10px] text-slate-500 font-mono">Semi-Finals Stage</span>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-[#080d10] border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">Whitefield United</span>
                  <span className="text-xs text-slate-500 block">Indiranagar FC</span>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-xs font-black text-emerald-400 block">3</span>
                  <span className="text-xs text-slate-500 block">1</span>
                </div>
              </div>
              <div className="p-4 bg-[#080d10] border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">HSR Rovers</span>
                  <span className="text-xs text-slate-500 block">Koramangala Academy</span>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-xs font-black text-amber-400 block">Match Pending</span>
                  <span className="text-[10px] text-slate-600 block">Kickoff: 6:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 bg-[#0c1419] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Sponsorship Board</h3>
              <div className="p-4 rounded-xl bg-[#080d10] border border-slate-800 text-center">
                <span className="text-xs font-bold text-slate-300 block">Decathlon Sports Arena</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Title Prize Sponsor Verified</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Prize Pool Distributed</span>
              <span className="text-lg font-bold text-white block mt-0.5">₹50,000 Payout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}