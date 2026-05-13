"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, MapPin, Award, CheckCircle, ArrowLeft, Loader2, Gift, Briefcase, Zap, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Opportunity {
  id: string;
  brand_name: string;
  brand_logo: string;
  title: string;
  sport: string;
  district: string;
  description: string;
  requirements: string;
  reward_package: string;
  slots_available: number;
}

export default function SponsorshipHubPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const [selectedSport, setSelectedSport] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Application Matrix states
  const [appliedDeals, setAppliedDeals] = useState<{ [key: string]: boolean }>({});
  const [submittingDealId, setSubmittingDealId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState("");

  // Current authenticated user state cache
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("Verified Athlete");
  const [userRole, setUserRole] = useState("athlete");

  useEffect(() => {
    const initializeDealsMarketplace = async () => {
      setLoadingDeals(true);
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

        // Pull active logged application hooks for UI feedback
        const { data: apps } = await supabase
          .from("sponsorship_applications")
          .select("opportunity_id")
          .eq("athlete_id", session.user.id);

        if (apps) {
          const appliedMap: { [key: string]: boolean } = {};
          apps.forEach(a => { appliedMap[a.opportunity_id] = true; });
          setAppliedDeals(appliedMap);
        }
      }

      // Query active brand sponsorship packages
      const { data: deals } = await supabase
        .from("sponsorship_opportunities")
        .select("*")
        .order("created_at", { ascending: false });

      if (deals) setOpportunities(deals);
      setLoadingDeals(false);
    };

    initializeDealsMarketplace();
  }, []);

  // Securely insert application payload record into cloud tables
  const handleApplyDeal = async (opportunityId: string) => {
    if (!userId) {
      setActionMessage("⚠️ Please sign in to authenticate your digital identity metrics before requesting brand deployments.");
      return;
    }
    
    if (userRole !== "athlete") {
      setActionMessage("⚠️ Sponsorship marketplaces are restricted exclusively to authenticated Grassroots Athletes.");
      return;
    }

    setSubmittingDealId(opportunityId);
    setActionMessage("");

    try {
      const { error } = await supabase
        .from("sponsorship_applications")
        .insert([
          {
            opportunity_id: opportunityId,
            athlete_id: userId,
            athlete_name: userName
          }
        ]);

      if (error) throw error;

      // Update screen state dynamically upon cloud save confirmation
      setAppliedDeals(prev => ({ ...prev, [opportunityId]: true }));
      setActionMessage("🎉 Application successfully lodged! Brand organizers review structured metrics ledgers autonomously.");
    } catch (err: any) {
      console.error("Deal submission failure:", err);
      setActionMessage("❌ Could not process request pipeline. Verify connection headers.");
    } finally {
      setSubmittingDealId(null);
    }
  };

  const filteredDeals = opportunities.filter(deal => {
    const matchesSport = selectedSport === "all" || deal.sport.toLowerCase() === selectedSport.toLowerCase();
    const matchesSearch = `${deal.brand_name} ${deal.title} ${deal.reward_package}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 pb-12">
      
      {/* Ecosystem Universal Navigation Micro-Header */}
      <header className="border-b border-slate-800/80 bg-[#080d10]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Exit Marketplace
          </button>
          <div className="flex items-center gap-2 font-mono text-xs text-amber-400">
            <span>● Hyperlocal Brand Engine Connected</span>
          </div>
        </div>
      </header>

      {/* Discovery Work Matrix Layout */}
      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        
        {/* Value Proposition Header */}
        <div className="bg-[#0c1419] border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-500" />
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-widest block">Monetization Vault</span>
          <h1 className="text-xl font-bold text-white mt-1">Hyperlocal Brand Deals & Kit Grants</h1>
          <p className="text-xs text-slate-400 mt-0.5">Apply for physical equipment support utilizing validated digital profile ledgers</p>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-5">
            <div className="md:col-span-8 relative">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input 
                type="text" placeholder="Filter by brand identities, gear titles, or specific resource rewards..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#080d10] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div className="md:col-span-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <select value={selectedSport} onChange={(e) => setSelectedSport(e.target.value)} className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-semibold focus:outline-none cursor-pointer">
                <option value="all">All Sports Deals</option>
                <option value="Football">⚽ Football</option>
                <option value="Cricket">🏏 Cricket</option>
                <option value="Badminton">🏸 Badminton</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Action Interaction Alert Frame */}
        {actionMessage && (
          <div className={`p-4 rounded-xl border text-xs font-semibold animate-in fade-in duration-200 ${
            actionMessage.includes("⚠️") || actionMessage.includes("❌") ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}>
            {actionMessage}
          </div>
        )}

        {/* Global Marketplace Grid Rendering */}
        <div>
          {loadingDeals ? (
            <div className="py-16 text-center text-xs text-slate-500 border border-slate-800/50 rounded-2xl bg-[#0c1419]/40">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-500" /> Indexing Sponsorship Opportunities Matrix...
            </div>
          ) : filteredDeals.length === 0 ? (
            <div className="py-16 text-center border border-slate-800 rounded-2xl bg-[#0c1419]">
              <Briefcase className="w-12 h-12 text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">No Matching Grants Active</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Verify input keyword parameters or monitor continuous regional brand syndication uploads.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDeals.map((deal) => {
                const isApplied = appliedDeals[deal.id];
                const isSubmitting = submittingDealId === deal.id;

                return (
                  <div key={deal.id} className="bg-[#0c1419] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all relative group">
                    
                    {/* Top Identity Tags */}
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                          {deal.sport}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Slots: <strong className="text-emerald-400">{deal.slots_available} Left</strong>
                        </span>
                      </div>

                      {/* Brand Metadata */}
                      <div className="flex items-center gap-3 mt-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700">
                          <img src={deal.brand_logo} alt="Brand Logo" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white leading-tight group-hover:text-amber-400 transition-colors">
                            {deal.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5 font-medium">{deal.brand_name}</p>
                        </div>
                      </div>

                      {/* Core Summary Fields */}
                      <div className="space-y-3 mt-4 pt-4 border-t border-slate-800/60">
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                          {deal.description}
                        </p>

                        <div className="p-3 bg-[#080d10] border border-slate-800/80 rounded-xl space-y-1">
                          <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider">Verification Checklist</span>
                          <p className="text-[11px] text-slate-400 leading-snug">{deal.requirements}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-3">
                        <MapPin className="w-3 h-3 text-slate-600" /> Target Hub: {deal.district}
                      </div>
                    </div>

                    {/* Bottom Package Footing & Request Buttons */}
                    <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-emerald-400/80 block">Grant Reward Tiers</span>
                        <span className="text-xs font-black text-white flex items-center gap-1 mt-0.5">
                          <Gift className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> {deal.reward_package}
                        </span>
                      </div>

                      <button 
                        onClick={() => handleApplyDeal(deal.id)}
                        disabled={isApplied || isSubmitting}
                        className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0 disabled:cursor-default ${
                          isApplied ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/10"
                        }`}
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isApplied ? <>Applied <Check className="w-3.5 h-3.5 stroke-[3]" /></> : <>Apply Deal <Zap className="w-3.5 h-3.5 fill-black" /></>}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}