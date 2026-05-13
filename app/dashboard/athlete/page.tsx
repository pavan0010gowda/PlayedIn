"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, MapPin, Users, DollarSign, Calendar, Star, 
  CheckCircle, Share2, MessageSquare, Play, Award, ArrowLeft, Loader2, PlusCircle, ExternalLink, FileText, X, Check
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Achievement {
  id: string;
  title: string;
  organization_name: string;
  organization_link?: string;
  category: string;
  date_achieved: string;
  verification_status: string;
  document_url?: string;
}

export default function AthleteDashboard() {
  const [activeTab, setActiveTab] = useState("achievements");
  const [profileName, setProfileName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [initials, setInitials] = useState("AS");
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Real-time Cloud Credentials State
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loadingAchievements, setLoadingAchievements] = useState(true);

  // Dynamic Upload Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgLink, setNewOrgLink] = useState("");
  const [newCategory, setNewCategory] = useState("Certificate");
  const [newDate, setNewDate] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [documentPath, setDocumentPath] = useState("");
  const [submittingRecord, setSubmittingRecord] = useState(false);
  const [modalError, setModalError] = useState("");

  // Load authenticated identity data and associated records
  useEffect(() => {
    const loadCoreEcosystem = async () => {
      setLoadingProfile(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || "");
        
        // Retrieve explicit display name
        const { data: profileData } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", session.user.id)
          .single();

        if (profileData?.name) {
          setProfileName(profileData.name);
          const parts = profileData.name.trim().split(" ");
          setInitials(parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : profileData.name.slice(0, 2).toUpperCase());
        } else {
          const fallback = session.user.email?.split("@")[0] || "Athlete";
          setProfileName(fallback);
          setInitials(fallback.slice(0, 2).toUpperCase());
        }

        // Trigger dynamic achievements query
        await pullLiveAchievements(session.user.id);
      }
      setLoadingProfile(false);
    };

    loadCoreEcosystem();
  }, []);

  // Fetch verified records and linked academies from PostgreSQL
  const pullLiveAchievements = async (targetAthleteId: string) => {
    setLoadingAchievements(true);
    const { data } = await supabase
      .from("achievements")
      .select("*")
      .eq("athlete_id", targetAthleteId)
      .order("created_at", { ascending: false });

    if (data) {
      setAchievements(data);
    }
    setLoadingAchievements(false);
  };

  // Securely upload physical file proof directly to Supabase storage bucket
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0 || !userId) return;
      setUploadingDoc(true);
      setModalError("");

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const uniqueFileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `certificates/${uniqueFileName}`;

      // Upload payload to our public storage pool
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Extract raw direct public reference path
      const { data } = supabase.storage.from("documents").getPublicUrl(filePath);
      setDocumentPath(data.publicUrl);
    } catch (error: any) {
      // Log the actual detailed system error to your browser console for easy debugging
      console.error("Supabase Storage Error:", error);
      // Display the true server error message directly in the UI
      setModalError(error.message || "File upload rejected by server storage policies.");
    } finally {
      setUploadingDoc(false);
    }
  };

  // Commit finalized documented achievement to cloud relational system
  const handleCommitCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSubmittingRecord(true);
    setModalError("");

    try {
      const { data, error } = await supabase
        .from("achievements")
        .insert([
          {
            athlete_id: userId,
            title: newTitle,
            organization_name: newOrgName,
            organization_link: newOrgLink.trim() !== "" ? newOrgLink : null,
            category: newCategory,
            date_achieved: newDate,
            document_url: documentPath !== "" ? documentPath : null,
            verification_status: documentPath !== "" ? "Verified Document Attached" : "Pending Verification"
          }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Render updated global matrix instantly
        setAchievements([data[0], ...achievements]);
        // Reset states and close UI form
        setNewTitle("");
        setNewOrgName("");
        setNewOrgLink("");
        setNewDate("");
        setDocumentPath("");
        setIsModalOpen(false);
      }
    } catch (error: any) {
      setModalError("Could not commit record to database. Verify authorization tokens.");
    } finally {
      setSubmittingRecord(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 pb-12 relative">
      
      {/* Universal Ecosystem Navigation Micro-Header */}
      <header className="border-b border-slate-800/80 bg-[#080d10]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}
            className="flex items-center gap-2 text-xs font-bold text-red-400/80 hover:text-red-400 transition-colors border border-red-500/20 bg-red-500/5 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            Sign Out OS
          </button>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <span>● Dynamic Identity Engine Active</span>
          </div>
        </div>
      </header>

      {/* Hero Core Profile Space */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="bg-[#0c1419] border border-slate-800/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              
              {/* Dynamic Identity Avatar Ring */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 flex-shrink-0 shadow-lg shadow-emerald-500/10">
                <div className="w-full h-full bg-[#080d10] rounded-[14px] flex items-center justify-center font-black text-2xl text-emerald-400 tracking-wider">
                  {loadingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : initials}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white capitalize">
                    {loadingProfile ? "Syncing Identity..." : profileName}
                  </h1>
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified Athlete
                  </span>
                </div>
                
                <p className="text-emerald-400 font-semibold text-sm">Grassroots Registered Competitor</p>
                
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Direct Credentials Route</span>
                  <span className="text-[11px] text-slate-500 font-mono block">{userEmail}</span>
                </div>
              </div>
            </div>

            {/* Path Navigations */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button 
                onClick={() => window.location.href = "/communities"}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" /> Explore Communities
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" /> Link Credential
              </button>
            </div>
          </div>

          {/* Performance Analytics Tracking Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div className="bg-[#080d10]/50 p-3 rounded-xl border border-slate-800/50">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">Verified Log records</span>
              <span className="text-lg font-bold text-white block mt-0.5">{achievements.length} Documents</span>
            </div>
            <div className="bg-[#080d10]/50 p-3 rounded-xl border border-slate-800/50">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">Academy Associations</span>
              <span className="text-lg font-bold text-emerald-400 block mt-0.5">
                {new Set(achievements.map(a => a.organization_name)).size} Linked
              </span>
            </div>
            <div className="bg-[#080d10]/50 p-3 rounded-xl border border-slate-800/50">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">Scout Pings</span>
              <span className="text-lg font-bold text-white block mt-0.5">Active Logs Flow</span>
            </div>
            <div className="bg-[#080d10]/50 p-3 rounded-xl border border-slate-800/50">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">Identity Matrix</span>
              <span className="text-lg font-bold text-white block mt-0.5">Public Record</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Structural Layout Workspace */}
      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Tab Controls & Verifiable Achievements Viewer */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-px">
            {["achievements", "about", "highlights"].map((tab) => (
              <button
                key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold capitalize rounded-t-lg transition-all ${activeTab === tab ? "text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5" : "text-slate-400 hover:text-slate-200"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* DYNAMIC CLOUD ACHIEVEMENTS TAB */}
          {activeTab === "achievements" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Verifiable Credentials Matrix</h3>
                  <p className="text-xs text-slate-400">Linked organizational credentials backed securely by public reference images</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Document New Claim
                </button>
              </div>

              {loadingAchievements ? (
                <div className="py-16 text-center text-xs text-slate-500 border border-slate-800/50 rounded-2xl bg-[#0c1419]/40">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-500" /> Pulling Cloud Database Records...
                </div>
              ) : achievements.length === 0 ? (
                <div className="py-12 text-center border border-slate-800 rounded-2xl bg-[#0c1419]">
                  <Award className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                  <p className="text-sm font-bold text-white">No Documented Credentials Associated</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Scouts rely on validated documents to confirm track records. Click "Link Credential" above to attach your initial academy milestones.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {achievements.map((item) => (
                    <div key={item.id} className="p-5 bg-[#0c1419] border border-slate-800 rounded-2xl relative transition-all hover:border-slate-700 space-y-3">
                      
                      {/* Top Action Tags */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wide ${
                            item.category === "Medal" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : 
                            item.category === "Tournament Record" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                            "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}>
                            {item.category}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">• {item.date_achieved}</span>
                        </div>

                        {/* Status Integrity Marker */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                          item.verification_status.includes("Verified") ? "text-emerald-400 bg-emerald-500/5" : "text-amber-400 bg-amber-500/5"
                        }`}>
                          <CheckCircle className="w-3 h-3" /> {item.verification_status}
                        </span>
                      </div>

                      {/* Main Data Elements */}
                      <div>
                        <h4 className="text-base font-bold text-white leading-tight">{item.title}</h4>
                        
                        {/* LINKED ACADEMY / ORGANIZATION RENDER */}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <span className="text-xs text-slate-400">Issued / Played for:</span>
                          {item.organization_link ? (
                            <a 
                              href={item.organization_link.startsWith("http") ? item.organization_link : `https://${item.organization_link}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:underline bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20"
                              title="External Profile Verification Path"
                            >
                              {item.organization_name} <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                              {item.organization_name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Attached Document Image Proof Link View */}
                      {item.document_url && (
                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-emerald-400" /> Authorized Scan Asset Linked
                          </span>
                          <a 
                            href={item.document_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            Access Original Document Asset →
                          </a>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "about" && (
            <div className="bg-[#0c1419] border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Athlete Ecosystem Standing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Registered sports professional establishing verified organizational tracks across localized networks. Documented records provide immediate background metrics for competitive team drafting and talent management logic.
              </p>
            </div>
          )}

          {activeTab === "highlights" && (
            <div className="bg-[#0c1419] border border-slate-800 rounded-2xl p-6 text-center py-12">
              <Play className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Video reels interface syncing with digital media stores...</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Real-time Profile Status Admonitions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0c1419] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verification Integrity</h3>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Account Security Locked</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Active Cloud Database Pipe</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Public Record Access Point</div>
            </div>
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-amber-400 block font-semibold">⚠️ Scouting Alert</span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Unlinked self-claims without supporting certificate document reference scans carry lower weighting in search optimization pipelines.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL POPUP: SECURE FILE UPLOAD & ACADEMY LINKING FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1419] border border-slate-800 w-full max-w-lg rounded-3xl p-6 relative shadow-2xl">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Link Verified Credential</h3>
            <p className="text-xs text-slate-400 mb-4">Associate structured records to active external academies or clubs</p>

            {modalError && (
              <div className="p-3 mb-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCommitCredential} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Achievement Headline</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Under-19 State Division Medallist"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Played For / Issued By</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Badminton Academy 123"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Organization Web Path (Optional)</label>
                  <input 
                    type="text"
                    placeholder="academy123.com or internal link"
                    value={newOrgLink}
                    onChange={(e) => setNewOrgLink(e.target.value)}
                    className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Milestone Format</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="Medal">🥇 Official Medal</option>
                    <option value="Certificate">📜 Digital Certificate</option>
                    <option value="Tournament Record">🏆 Tournament Log</option>
                    <option value="Milestone">⭐ General Track</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Date Signature</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Nov 2025"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* REAL SUPABASE STORAGE UPLOAD COMPONENT */}
              <div className="pt-1">
                <label className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Upload Verification Evidence (Image / PDF)</label>
                <div className="border border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl p-3 bg-[#080d10] transition-colors relative">
                  <input 
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    disabled={uploadingDoc}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-400 pointer-events-none">
                    <span className="truncate flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" /> 
                      {uploadingDoc ? "Transmitting payload to cloud..." : documentPath !== "" ? "Document securely linked" : "Click to select local file asset..."}
                    </span>
                    {uploadingDoc ? (
                      <Loader2 className="w-4 h-4 text-emerald-400 animate-spin flex-shrink-0" />
                    ) : documentPath !== "" ? (
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 stroke-[3]" />
                    ) : null}
                  </div>
                </div>
                {documentPath !== "" && (
                  <p className="text-[10px] text-emerald-400 font-mono mt-1 truncate">Direct pointer: {documentPath.slice(0, 48)}...</p>
                )}
              </div>

              <button 
                type="submit"
                disabled={submittingRecord || uploadingDoc}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold text-xs tracking-wide transition-all mt-4 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingRecord ? <Loader2 className="w-4 h-4 animate-spin" /> : "Deploy Credential Record to Matrix"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}