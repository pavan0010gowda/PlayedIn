"use client";

import React, { useState, useEffect } from "react";
import { Users, Calendar, DollarSign, PlusCircle, CheckCircle, Clock, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Define the structure of a Package
interface Package {
  id: string;
  title: string;
  hourly_rate: string;
  session_type: string;
  description: string;
}

export default function MentorDashboard() {
  const [activeTab, setActiveTab] = useState("packages");
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Modal state for creating a new package
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newType, setNewType] = useState("1-on-1 Offline");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch current user and their packages on load
  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        await fetchPackages(session.user.id);
      }
    };
    loadData();
  }, []);

  // Query Supabase for packages belonging to this mentor
  const fetchPackages = async (mentorId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("mentor_id", mentorId)
      .order("created_at", { ascending: false });

    if (data) {
      setPackages(data);
    }
    setLoading(false);
  };

  // Handle form submission to save a new package to the cloud
  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("packages")
      .insert([
        {
          mentor_id: userId,
          title: newTitle,
          hourly_rate: `₹${newRate}/hr`,
          session_type: newType,
          description: newDesc
        }
      ])
      .select();

    if (!error && data) {
      // Add newly created package to our local UI state instantly
      setPackages([data[0], ...packages]);
      // Reset form and close modal
      setNewTitle("");
      setNewRate("");
      setNewDesc("");
      setIsModalOpen(false);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 pb-12 relative">
      
      {/* Top Navbar */}
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
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <span>● Live Cloud Database Connected</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        
        {/* Header Summary Card */}
        <div className="bg-[#0c1419] border border-slate-800/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-500" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Coach Management Hub
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Monetization Dashboard</h1>
              <p className="text-xs text-slate-400 mt-1">Manage custom packages, group sessions, and direct cloud records</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Create Package
            </button>
          </div>

          {/* Static Stats Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div className="bg-[#080d10]/50 p-3 rounded-xl border border-slate-800/50">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Active Mentees</span>
              <span className="text-lg font-bold text-white block mt-0.5">14 Local Rising Stars</span>
            </div>
            <div className="bg-[#080d10]/50 p-3 rounded-xl border border-slate-800/50">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Session Hours</span>
              <span className="text-lg font-bold text-white block mt-0.5">86 Hours Completed</span>
            </div>
            <div className="bg-[#080d10]/50 p-3 rounded-xl border border-slate-800/50">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Gross Payouts</span>
              <span className="text-lg font-bold text-emerald-400 block mt-0.5">₹1,42,000 Total</span>
            </div>
            <div className="bg-[#080d10]/50 p-3 rounded-xl border border-slate-800/50">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Rating Score</span>
              <span className="text-lg font-bold text-white block mt-0.5">★ 4.9 / 5.0</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 mt-8 border-b border-slate-800 pb-px">
          {["packages", "mentees", "schedule"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold capitalize rounded-t-lg transition-all ${
                activeTab === tab 
                  ? "text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "packages" && (
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 border border-slate-800/50 rounded-2xl bg-[#0c1419]/50">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
                  <p className="text-xs text-slate-500">Querying live packages from Supabase...</p>
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-12 border border-slate-800 rounded-2xl bg-[#0c1419]">
                  <p className="text-sm font-bold text-white">No Mentorship Packages Found</p>
                  <p className="text-xs text-slate-500 mt-1">Click "Create Package" above to deploy your first live monetization plan.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {packages.map((item) => (
                    <div key={item.id} className="bg-[#0c1419] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                            {item.session_type}
                          </span>
                          <span className="text-sm font-extrabold text-emerald-400">{item.hourly_rate}</span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-3">{item.title}</h3>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.description}</p>
                      </div>
                      <div className="mt-6 pt-3 border-t border-slate-800/60 flex justify-between items-center text-[10px] text-slate-500">
                        <span>ID: {item.id.slice(0, 8)}...</span>
                        <span className="text-emerald-500 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Live Cloud Record
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "mentees" && (
            <div className="bg-[#0c1419] border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Mentorship Progress</h3>
              <div className="p-4 rounded-xl bg-[#080d10] border border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-white">Rahul K. (U16 Midfielder)</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Target: State Junior Trials Prep</p>
                </div>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">
                  4/6 Sessions Done
                </span>
              </div>
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="bg-[#0c1419] border border-slate-800 rounded-2xl p-6 text-center py-12">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">No Upcoming Sessions Today</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Your automated sync with local turf booking charts allows mentees to reserve available slots seamlessly.</p>
            </div>
          )}
        </div>

      </div>

      {/* CREATE PACKAGE MODAL POPUP */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1419] border border-slate-800 w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Create Monetization Package</h3>
            <p className="text-xs text-slate-400 mb-4">Deploy a new coaching service directly to the cloud backend</p>

            <form onSubmit={handleCreatePackage} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Package Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Masterclass in Turf Finishing"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Hourly Rate (₹)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="799"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Session Format</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="1-on-1 Offline">1-on-1 Offline</option>
                    <option value="Group Online">Group Online</option>
                    <option value="Group Academy">Group Academy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Service Overview</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Describe what the athlete will learn in this practice plan..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold text-xs tracking-wide transition-all mt-2 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Deploy Package to Cloud"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}