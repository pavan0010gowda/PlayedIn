"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, Users, ArrowLeft, Loader2, PlusCircle, CheckCircle, 
  AlertTriangle, UserCheck, X, Shield 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface RegisteredTeam {
  id: string;
  team_name: string;
  captain_name: string;
  sport: string;
  roster_profiles: { name: string; type: string }[];
  status?: string;
}

export default function OrganizerDashboardPage() {
  const [currentUserName, setCurrentUserName] = useState("Tournament Director");
  const [currentUserId, setCurrentUserId] = useState("demo-organizer-uuid");

  // Dynamic Fixtures State driving the inline grid layout
  const [fixtures, setFixtures] = useState([
    {
      id: "fix-1",
      teamA: "Whitefield United",
      scoreA: "3",
      teamB: "Indiranagar FC",
      scoreB: "1",
      status: "Completed",
      time: "Full Time"
    },
    {
      id: "fix-2",
      teamA: "HSR Rovers",
      scoreA: "-",
      teamB: "Koramangala Academy",
      scoreB: "-",
      status: "Match Pending",
      time: "Kickoff: 6:00 PM"
    }
  ]);

  // Modal / Drawer Controller State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState("Football");
  const [teamNameInput, setTeamNameInput] = useState("");
  const [captainNameInput, setCaptainNameInput] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<{ name: string; type: string }[]>([]);
  const [playerNameBuffer, setPlayerNameBuffer] = useState("");
  const [submittingRoster, setSubmittingRoster] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Live stream ledger array
  const [registeredTeams, setRegisteredTeams] = useState<RegisteredTeam[]>([]);

  useEffect(() => {
    const fetchOrganizerSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
        const { data: profile } = await supabase.from("profiles").select("name").eq("id", session.user.id).single();
        if (profile?.name) setCurrentUserName(profile.name);
      }

      const { data: rosters } = await supabase
        .from("tournament_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (rosters) setRegisteredTeams(rosters);
    };

    fetchOrganizerSession();
  }, []);

  // Determine standard slot bounds dynamically based on discipline
  const getSportRequirements = (sport: string) => {
    switch (sport) {
      case "Cricket": return { primary: 11, subs: 2, label: "11 Active Lineup + up to 2 Substitutes" };
      case "Volleyball": return { primary: 6, subs: 2, label: "6 Starting Lineup + up to 2 Substitutes" };
      case "Football": return { primary: 7, subs: 3, label: "7 Primary Lineup + up to 3 Substitutes" };
      case "Badminton": return { primary: 1, subs: 0, label: "Solo Registration (Exactly 1 Contender)" };
      default: return { primary: 5, subs: 2, label: "Custom Configuration Array" };
    }
  };

  const handleLaunchRosterDrawer = () => {
    setIsDrawerOpen(true);
    setTeamNameInput("");
    setCaptainNameInput("");
    setFeedbackMessage("");
    setPlayerNameBuffer("");
    setSelectedPlayers([]);
  };

  const handleAppendSquadSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerNameBuffer.trim()) return;

    const rules = getSportRequirements(selectedSport);
    const primaryCount = selectedPlayers.filter(p => p.type === "primary").length;
    const subsCount = selectedPlayers.filter(p => p.type === "substitute").length;

    let targetSlotType = "primary";

    if (primaryCount >= rules.primary) {
      if (subsCount >= rules.subs) {
        setFeedbackMessage(`⚠️ Roster full. ${selectedSport} limits capacity to exactly ${rules.primary + rules.subs} authenticated players.`);
        return;
      }
      targetSlotType = "substitute";
    }

    setSelectedPlayers(prev => [...prev, { name: playerNameBuffer.trim(), type: targetSlotType }]);
    setPlayerNameBuffer("");
    setFeedbackMessage("");
  };

  const handleRemoveSlot = (index: number) => {
    setSelectedPlayers(prev => prev.filter((_, i) => i !== index));
  };

  const handleCommitOrganizerRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    const rules = getSportRequirements(selectedSport);
    const primaryCount = selectedPlayers.filter(p => p.type === "primary").length;

    if (selectedSport !== "Badminton" && !teamNameInput.trim()) {
      setFeedbackMessage("⚠️ Squad Signature Name is strictly required to generate bracket seeds.");
      return;
    }

    if (!captainNameInput.trim() && selectedSport !== "Badminton") {
      setFeedbackMessage("⚠️ Primary Captain Identity handle must be specified.");
      return;
    }

    if (primaryCount < rules.primary) {
      setFeedbackMessage(`⚠️ Insufficient active matrix slots. ${selectedSport} strictly demands exactly ${rules.primary} primary lineup entries.`);
      return;
    }

    setSubmittingRoster(true);
    setFeedbackMessage("");

    const resolvedTeamName = selectedSport === "Badminton" ? `${selectedPlayers[0]?.name || "Solo Athlete"} (Solo)` : teamNameInput.trim();
    const resolvedCaptain = selectedSport === "Badminton" ? (selectedPlayers[0]?.name || "Solo Athlete") : captainNameInput.trim();

    try {
      const { data } = await supabase
        .from("tournament_registrations")
        .insert([{
          tournament_id: "tour-bengaluru-championship",
          tournament_name: "Bengaluru Turf Championship",
          sport: selectedSport,
          team_name: resolvedTeamName,
          captain_id: currentUserId,
          captain_name: resolvedCaptain,
          roster_profiles: selectedPlayers,
          status: "Verified Seed ✓"
        }])
        .select();

      setFeedbackMessage("✨ Roster officially injected into global tournament active storage blocks!");

      const newTeamObj: RegisteredTeam = data && data.length > 0 ? data[0] : {
        id: `team-${Date.now()}`,
        team_name: resolvedTeamName,
        captain_name: resolvedCaptain,
        sport: selectedSport,
        roster_profiles: selectedPlayers,
        status: "Verified Seed ✓"
      };

      setRegisteredTeams(prev => [newTeamObj, ...prev]);

      setFixtures(prev => [
        ...prev,
        {
          id: `fix-${Date.now()}`,
          teamA: resolvedTeamName,
          scoreA: "-",
          teamB: "TBD Contender",
          scoreB: "-",
          status: "Seed Locked",
          time: "Round 1 Allocation"
        }
      ]);

      setTimeout(() => {
        setIsDrawerOpen(false);
        setFeedbackMessage("");
      }, 1500);

    } catch (err) {
      setFeedbackMessage("❌ Processing error. Verify storage configuration schema constraints.");
    } finally {
      setSubmittingRoster(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 pb-12 select-none">
      
      <header className="border-b border-slate-800/80 bg-[#080d10]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <button 
          onClick={() => window.location.href = "/home"} 
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Sign Out OS
        </button>
        <span className="font-mono text-xs text-amber-400 font-semibold flex items-center gap-1.5">
          ● Shopify Management Hub Active
        </span>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        
        {/* HERO BANNER EQUIPPED WITH VIBRANT V4 GRADIENT CONTROLLERS */}
        <div className="bg-[#0c1419] border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
          
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 tracking-wider block w-max">
              LIVE TOURNAMENT MATRIX
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Bengaluru Turf Championship
            </h1>
            <p className="text-xs text-slate-400">
              Managing schedules, custom team rosters, and digital live score leaderboards
            </p>
          </div>

          {/* ACTIVE HIGH-FIDELITY GRADIENT STYLING RESTORED COMPLETELY */}
          <button 
            type="button"
            onClick={handleLaunchRosterDrawer}
            className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-black font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/10 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5] shrink-0 text-black" />
            <span className="text-black font-black">Register Team Roster</span>
          </button>
        </div>

        {/* CORE LAYOUT MATRIX */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                KNOCKOUT FIXTURE GRID
              </span>
              <span className="text-[10px] font-mono text-slate-500">Semi-Finals Stage</span>
            </div>

            <div className="space-y-3">
              {fixtures.map((fix) => (
                <div key={fix.id} className="p-4 bg-[#0c1419] border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex justify-between items-center pr-4">
                      <span className="text-xs font-bold text-white">{fix.teamA}</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">{fix.scoreA}</span>
                    </div>
                    <div className="flex justify-between items-center pr-4">
                      <span className="text-xs font-bold text-slate-400">{fix.teamB}</span>
                      <span className="text-xs font-mono font-bold text-slate-500">{fix.scoreB}</span>
                    </div>
                  </div>

                  <div className="pl-4 border-l border-slate-800 text-right shrink-0 min-w-[120px]">
                    <span className={`text-xs font-bold block ${fix.status.includes("Pending") ? "text-amber-400" : "text-emerald-400"}`}>
                      {fix.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{fix.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-2">
              SPONSORSHIP BOARD
            </span>

            <div className="p-5 bg-[#0c1419] border border-slate-800 rounded-xl text-center space-y-1">
              <h3 className="text-xs font-bold text-white">Decathlon Sports Arena</h3>
              <span className="text-[10px] font-medium text-emerald-400 block">Title Prize Sponsor Verified</span>
            </div>

            <div className="pt-2">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">TOTAL PRIZE POOL DISTRIBUTED</span>
              <span className="text-xl font-black text-white block mt-0.5">₹50,000 Payout</span>
            </div>
          </div>

        </div>

        {registeredTeams.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-800/80">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Verified Roster Lineups ({registeredTeams.length})
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Sync loop validated</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {registeredTeams.map((team, idx) => (
                <div key={idx} className="p-4 bg-[#0c1419] border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      {team.sport}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-0.5">
                      <UserCheck className="w-3 h-3" /> {team.status || "Seeded"}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{team.team_name}</h4>
                  <p className="text-[11px] text-slate-400 truncate">Captain: <strong className="text-slate-300">{team.captain_name}</strong></p>
                  
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1">
                    {team.roster_profiles?.map((p, pIdx) => (
                      <span key={pIdx} className={`text-[9px] px-1.5 py-0.5 rounded border ${p.type === "substitute" ? "bg-slate-900 text-slate-500 border-slate-800" : "bg-[#080d10] text-slate-300 border-slate-800/60"}`}>
                        {p.name.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* DYNAMIC ROSTER ALLOCATION MODAL DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c1419] border border-slate-800 w-full max-w-lg rounded-3xl p-6 relative shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            <div className="flex justify-between items-start border-b border-slate-800 pb-3 shrink-0">
              <div>
                <span className="text-[9px] uppercase font-extrabold text-amber-400 block tracking-wider">Tournament Entry Processor</span>
                <h3 className="text-base font-bold text-white leading-tight mt-0.5">Lineup Allocation Gateway</h3>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white cursor-pointer shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedbackMessage && (
              <div className={`p-3 my-3 rounded-xl text-xs font-bold border flex items-center gap-2 shrink-0 ${feedbackMessage.includes("⚠️") || feedbackMessage.includes("❌") ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p className="leading-snug">{feedbackMessage}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
              
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Target Sport Discipline</label>
                <select 
                  value={selectedSport}
                  onChange={(e) => {
                    setSelectedSport(e.target.value);
                    setSelectedPlayers([]);
                    setFeedbackMessage("");
                  }}
                  className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="Football">⚽ Football (Turf 7v7 / 5v5)</option>
                  <option value="Cricket">🏏 Cricket (Standard 11-Man)</option>
                  <option value="Volleyball">🏐 Volleyball (6-Man Rotation)</option>
                  <option value="Badminton">🏸 Badminton (Solo Registration)</option>
                </select>
                <span className="text-[10px] text-emerald-400 font-mono block mt-1">
                  Scope: {getSportRequirements(selectedSport).label}
                </span>
              </div>

              {selectedSport !== "Badminton" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Squad Signature Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Astro Smashers" 
                      value={teamNameInput} 
                      onChange={(e) => setTeamNameInput(e.target.value)}
                      className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Captain Identity Handle</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Coach Rajesh" 
                      value={captainNameInput} 
                      onChange={(e) => setCaptainNameInput(e.target.value)}
                      className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {selectedSport !== "Badminton" && (
                <div className="bg-[#080d10] p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">Primary Starting Lineup Slots</span>
                    <strong className="text-emerald-400 font-mono">
                      {selectedPlayers.filter(p => p.type === "primary").length} / {getSportRequirements(selectedSport).primary}
                    </strong>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-400 h-full transition-all" 
                      style={{ width: `${Math.min(100, (selectedPlayers.filter(p => p.type === "primary").length / getSportRequirements(selectedSport).primary) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Assembled Matrix Lineup</label>
                {selectedPlayers.length === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-600 italic">
                    Squad buffer currently empty. Search and append user tags below.
                  </div>
                ) : (
                  selectedPlayers.map((player, pIndex) => (
                    <div key={pIndex} className={`p-2 rounded-xl border flex items-center justify-between text-xs ${player.type === "primary" ? "bg-[#080d10] border-emerald-500/20 text-white" : "bg-slate-900 border-slate-800 text-slate-400"}`}>
                      <div className="flex items-center gap-2 truncate pl-1">
                        <span className="w-3.5 h-3.5 rounded-full font-mono text-[8px] font-bold flex items-center justify-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                          {pIndex + 1}
                        </span>
                        <span className="truncate">{player.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[8px] font-bold text-emerald-400 uppercase">{player.type}</span>
                        <button onClick={() => handleRemoveSlot(pIndex)} className="text-slate-500 hover:text-red-400 cursor-pointer p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedPlayers.length < (getSportRequirements(selectedSport).primary + getSportRequirements(selectedSport).subs) && (
                <form onSubmit={handleAppendSquadSlot} className="pt-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Append Registered User Handles</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={selectedSport === "Badminton" ? "Enter solo athlete name..." : "Enter candidate handle..."}
                      value={playerNameBuffer} 
                      onChange={(e) => setPlayerNameBuffer(e.target.value)}
                      className="flex-1 bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <button type="submit" className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer shrink-0">
                      <PlusCircle className="w-3.5 h-3.5 shrink-0" /> Add
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 shrink-0">
              <button 
                type="button"
                onClick={handleCommitOrganizerRegistration}
                disabled={submittingRoster}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-black font-extrabold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 text-black"
              >
                {submittingRoster ? <Loader2 className="w-4 h-4 animate-spin shrink-0 text-black" /> : <span className="text-black font-black">Lock In Verified Roster Seed</span>}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}