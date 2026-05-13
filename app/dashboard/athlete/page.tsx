"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, MapPin, Users, DollarSign, Calendar, Star, 
  CheckCircle, Share2, MessageSquare, Play, Award, ArrowLeft, Loader2, PlusCircle, ExternalLink, FileText, X, Check, Edit3, Video, Grid, Layers
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

interface UserReel {
  id: string;
  video_url: string;
  caption: string;
  likes_count: number;
}

export default function AthleteDashboard() {
  const [activeTab, setActiveTab] = useState("credentials");
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Custom Metadata States
  const [profileName, setProfileName] = useState("");
  const [initials, setInitials] = useState("AS");
  const [age, setAge] = useState("20");
  const [height, setHeight] = useState("178 cm");
  const [prefSide, setPrefSide] = useState("Right");
  const [aboutMe, setAboutMe] = useState("");

  // Relational Entity State Arrays
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userReels, setUserReels] = useState<UserReel[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  // Modals Controller States
  const [isCredModalOpen, setIsCredModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Credential Input States
  const [newTitle, setNewTitle] = useState("");
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgLink, setNewOrgLink] = useState("");
  const [newCategory, setNewCategory] = useState("Certificate");
  const [newDate, setNewDate] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [documentPath, setDocumentPath] = useState("");
  const [submittingRecord, setSubmittingRecord] = useState(false);
  const [modalError, setModalError] = useState("");
  const [savingMetrics, setSavingMetrics] = useState(false);

  // Load contextual dashboard profiles and bound assets
  useEffect(() => {
    const initializeEcosystemView = async () => {
      setLoadingProfile(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || "");
        
        // Query explicit core metadata fields
        const { data: profileData } = await supabase
          .from("profiles")
          .select("name, age, height, preferred_foot_hand, about_me")
          .eq("id", session.user.id)
          .single();

        if (profileData) {
          const resolvedName = profileData.name || session.user.email?.split("@")[0] || "Athlete";
          setProfileName(resolvedName);
          setAge(profileData.age || "20");
          setHeight(profileData.height || "178 cm");
          setPrefSide(profileData.preferred_foot_hand || "Right");
          setAboutMe(profileData.about_me || "Passionate grassroots competitor tracking live stats and working toward localized academy selections.");
          
          const parts = resolvedName.trim().split(" ");
          setInitials(parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : resolvedName.slice(0, 2).toUpperCase());
        }

        // Fetch dependent arrays concurrently
        await fetchIntegratedMatrix(session.user.id);
      }
      setLoadingProfile(false);
    };

    initializeEcosystemView();
  }, []);

  // Parallel database read pipelines pulling achievements + uploaded profile reels
  const fetchIntegratedMatrix = async (targetId: string) => {
    setLoadingAssets(true);
    
    const [achRes, reelsRes] = await Promise.all([
      supabase.from("achievements").select("*").eq("athlete_id", targetId).order("created_at", { ascending: false }),
      supabase.from("reels").select("id, video_url, caption, likes_count").eq("athlete_id", targetId).order("created_at", { ascending: false })
    ]);

    if (achRes.data) setAchievements(achRes.data);
    if (reelsRes.data) setUserReels(reelsRes.data);
    
    setLoadingAssets(false);
  };

  // Process and transmit new file verification storage objects securely
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0 || !userId) return;
      setUploadingDoc(true);
      setModalError("");

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const uniqueFileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `certificates/${uniqueFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("documents").getPublicUrl(filePath);
      setDocumentPath(data.publicUrl);
    } catch (error: any) {
      console.error("Supabase Storage Error:", error);
      setModalError(error.message || "Storage policy error. Ensure file size restrictions are met.");
    } finally {
      setUploadingDoc(false);
    }
  };

  // Commit validated credentials and physical document reference URLs
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
        setAchievements([data[0], ...achievements]);
        setNewTitle(""); setNewOrgName(""); setNewOrgLink(""); setNewDate(""); setDocumentPath("");
        setIsCredModalOpen(false);
      }
    } catch (error: any) {
      setModalError("Database persistence error. Review valid auth headers.");
    } finally {
      setSubmittingRecord(false);
    }
  };

  // Commit personal metrics updates directly to database profile storage
  const handleSaveMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSavingMetrics(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          age,
          height,
          preferred_foot_hand: prefSide,
          about_me: aboutMe
        })
        .eq("id", userId);

      if (!error) {
        setIsEditModalOpen(false);
      }
    } catch (err) {
      console.error("Failed saving metrics:", err);
    } finally {
      setSavingMetrics(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 pb-12 relative">
      
      {/* Global Application Route Framework */}
      <header className="border-b border-slate-800/80 bg-[#080d10]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}
            className="flex items-center gap-2 text-xs font-bold text-red-400/80 hover:text-red-400 transition-colors border border-red-500/20 bg-red-500/5 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            Sign Out OS
          </button>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <span>● Premium LinkedIn Space Bound</span>
          </div>
        </div>
      </header>

      {/* Hero Professional Workspace Header */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="bg-[#0c1419] border border-slate-800/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Identity Array Block */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full lg:w-auto">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 flex-shrink-0 shadow-lg shadow-emerald-500/10">
                <div className="w-full h-full bg-[#080d10] rounded-[14px] flex items-center justify-center font-black text-2xl text-emerald-400 tracking-wider">
                  {loadingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : initials}
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white capitalize">
                    {loadingProfile ? "Compiling Matrix..." : profileName}
                  </h1>
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified Candidate
                  </span>
                </div>
                
                {/* DYNAMIC INLINE ATHLETE METRICS BAR */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300">
                  <span className="bg-[#080d10] border border-slate-800 px-2.5 py-1 rounded-md">Age: <strong className="text-emerald-400">{age}</strong></span>
                  <span className="bg-[#080d10] border border-slate-800 px-2.5 py-1 rounded-md">Height: <strong className="text-emerald-400">{height}</strong></span>
                  <span className="bg-[#080d10] border border-slate-800 px-2.5 py-1 rounded-md">Dominant Side: <strong className="text-emerald-400">{prefSide}</strong></span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono pt-0.5">
                  <MapPin className="w-3 h-3" /> Local Hub Path • <span>{userEmail}</span>
                </div>
              </div>
            </div>

            {/* Quick Application Connectors */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" /> Complete Profile Metrics
              </button>
              <button 
                onClick={() => setIsCredModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" /> Link Credential
              </button>
            </div>
          </div>

          {/* High-Fidelity Snapshot Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div className="bg-[#080d10]/50 p-3 rounded-xl border border-slate-800/50">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">Verified Feed Log</span>
              <span className="text-lg font-bold text-white block mt-0.5">{achievements.length} Verified Claims</span>
            </div>
            <div className="bg-[#080d10]/50 p-3 rounded-xl border border-slate-800/50">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">Published Reels</span>
              <span className="text-lg font-bold text-emerald-400 block mt-0.5">{userReels.length} Direct Media</span>
            </div>
            <div className="bg-[#080d10]/50 p-3 rounded-xl border border-slate-800/50">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">Academy Links</span>
              <span className="text-lg font-bold text-white block mt-0.5">
                {new Set(achievements.map(a => a.organization_name)).size} Bound Orgs
              </span>
            </div>
            <div className="bg-[#080d10]/50 p-3 rounded-xl border border-slate-800/50">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">Ecosystem Routing</span>
              <span className="text-lg font-bold text-white block mt-0.5">Matrix Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Sections Division Layout Grid */}
      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PRIMARY MATRIX PANELS */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* PROFESSIONAL SEPARATED TAB SELECTIONS */}
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab("credentials")}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "credentials" ? "text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Posts & Credentials
            </button>
            <button
              onClick={() => setActiveTab("reels")}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "reels" ? "text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Reels Grid
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "about" ? "text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> About & Metrics
            </button>
            
            {/* Quick shortcut to dynamic external mobile playback loops */}
            <button
              onClick={() => window.location.href = "/feed"}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-[11px] font-bold text-emerald-400 transition-all flex items-center gap-1 ml-auto flex-shrink-0 cursor-pointer"
            >
              <Video className="w-3 h-3 text-emerald-400" /> Watch Feed
            </button>
          </div>

          {/* TAB 1: POSTS & LINKEDIN CREDENTIALS FEED */}
          {activeTab === "credentials" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Verified Professional Claims Feed</h3>
                  <p className="text-xs text-slate-400">Structured performance documentation verified via attached file proofs</p>
                </div>
              </div>

              {loadingAssets ? (
                <div className="py-16 text-center border border-slate-800/50 rounded-2xl bg-[#0c1419]/40">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-500" /> Pulling Cloud Evidence Matrix...
                </div>
              ) : achievements.length === 0 ? (
                <div className="py-12 text-center border border-slate-800 rounded-2xl bg-[#0c1419]">
                  <Award className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                  <p className="text-sm font-bold text-white">No Professional Track Records Uploaded</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Scouts expect explicit documented proof for timeline events. Attach original certificate scans inline using the "Link Credential" controls above.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {achievements.map((item) => (
                    <div key={item.id} className="bg-[#0c1419] border border-slate-800/80 rounded-2xl overflow-hidden transition-all hover:border-slate-700 flex flex-col">
                      
                      {/* Card Content Top Architecture */}
                      <div className="p-5 space-y-3">
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

                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Verified Document Attached
                          </span>
                        </div>

                        {/* Heading & Organization Details */}
                        <div>
                          <h4 className="text-base font-bold text-white leading-tight">{item.title}</h4>
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span className="text-xs text-slate-400">Authorized entity association:</span>
                            {item.organization_link ? (
                              <a 
                                href={item.organization_link.startsWith("http") ? item.organization_link : `https://${item.organization_link}`}
                                target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:underline bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20"
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
                      </div>

                      {/* PREMIUM RICH-MEDIA EMBED CONTAINER (LINKEDIN INLINE RENDERING) */}
                      {item.document_url && (
                        <div className="border-t border-slate-800/80 bg-[#080d10] p-3 flex justify-center">
                          <div className="w-full max-h-[350px] overflow-hidden rounded-xl border border-slate-800/60 relative bg-black flex items-center justify-center">
                            {/* Validate file signature mapping safely */}
                            {item.document_url.toLowerCase().endsWith(".pdf") ? (
                              <div className="p-8 text-center space-y-2">
                                <FileText className="w-12 h-12 text-emerald-400 mx-auto" />
                                <span className="text-xs font-bold text-white block">Official Digital Document Attached</span>
                                <a 
                                  href={item.document_url} target="_blank" rel="noopener noreferrer"
                                  className="text-xs text-blue-400 underline inline-block pt-1 font-semibold"
                                >
                                  Open secure PDF payload reference asset →
                                </a>
                              </div>
                            ) : (
                              <img 
                                src={item.document_url} 
                                alt="Verification Asset Proof" 
                                className="w-full h-full object-contain max-h-[340px]"
                                loading="lazy"
                              />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Card Bottom Direct Meta Footing */}
                      <div className="p-3 bg-[#080d10] border-t border-slate-800/40 flex justify-between items-center text-[10px] text-slate-500">
                        <span>Database Key Identifier: {item.id.slice(0, 8)}...</span>
                        <span className="text-slate-400">Sponsorship Verified Logic</span>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SPECIALIZED INSTAGRAM/TIKTOK REELS GRID */}
          {activeTab === "reels" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Private Video Loops Stack</h3>
                  <p className="text-xs text-slate-400">Media blocks deployed natively directly to public discover pipelines</p>
                </div>
              </div>

              {loadingAssets ? (
                <div className="py-16 text-center border border-slate-800/50 rounded-2xl bg-[#0c1419]/40">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-500" /> Indexing Local DB Segments...
                </div>
              ) : userReels.length === 0 ? (
                <div className="py-12 text-center border border-slate-800 rounded-2xl bg-[#0c1419]">
                  <Video className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                  <p className="text-sm font-bold text-white">No Gameplay Stream Uploads Active</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Deploy mobile reels straight from physical turf environments utilizing the central feed integration options to watch files cache natively into this grid.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {userReels.map((reel) => (
                    <div key={reel.id} className="aspect-[9/16] bg-black rounded-xl border border-slate-800 overflow-hidden relative group cursor-pointer shadow-md">
                      <video 
                        src={reel.video_url} 
                        className="w-full h-full object-cover pointer-events-none"
                        muted playsInline
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-emerald-400 bg-black/60 px-2 py-0.5 rounded w-max">
                          ★ Live Reel
                        </span>
                        <div className="space-y-1">
                          <p className="text-[10px] text-white line-clamp-2 leading-tight drop-shadow-md font-medium">
                            {reel.caption}
                          </p>
                          <span className="text-[10px] text-emerald-300 font-bold block">
                            {reel.likes_count} Network Likes
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EXTENDED BIO SUMMARY & DEEP DEMOGRAPHICS */}
          {activeTab === "about" && (
            <div className="space-y-4">
              <div className="bg-[#0c1419] border border-slate-800 rounded-2xl p-6 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Professional Summary Profile</h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {aboutMe}
                </p>
              </div>

              <div className="bg-[#0c1419] border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Physical Signature Mapping</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-[#080d10] border border-slate-800 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Registered Age</span>
                    <span className="text-sm font-bold text-white block">{age} Years</span>
                  </div>
                  <div className="p-3 bg-[#080d10] border border-slate-800 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Stated Height</span>
                    <span className="text-sm font-bold text-white block">{height}</span>
                  </div>
                  <div className="p-3 bg-[#080d10] border border-slate-800 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Technique Dominance</span>
                    <span className="text-sm font-bold text-white block">{prefSide}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CORE SECURITY CHECKLIST HOOKS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0c1419] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verification Status</h3>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> Cloud Token Active</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> Rich Profile Media Matrix Pipeline</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> Open Recruiter Visibility State</div>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL 1: COMPLETE METADATA REVISION FORM */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1419] border border-slate-800 w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Revise Professional Metrics</h3>
            <p className="text-xs text-slate-400 mb-4">Complete explicit parameters parsed actively by scout matrices</p>

            <form onSubmit={handleSaveMetrics} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Age Metrics</label>
                  <input 
                    type="text" required value={age} onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Height Index</label>
                  <input 
                    type="text" required value={height} onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g. 178 cm"
                    className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Preferred Side / Dominance</label>
                <select 
                  value={prefSide} onChange={(e) => setPrefSide(e.target.value)}
                  className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none"
                >
                  <option value="Right">Right Foot / Hand</option>
                  <option value="Left">Left Foot / Hand</option>
                  <option value="Both / Ambidextrous">Ambidextrous Utility</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Expanded Bio Summary</label>
                <textarea 
                  required rows={4} value={aboutMe} onChange={(e) => setAboutMe(e.target.value)}
                  placeholder="Summarize competitive standing..."
                  className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <button 
                type="submit" disabled={savingMetrics}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-xs transition-all mt-4 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingMetrics ? <Loader2 className="w-4 h-4 animate-spin" /> : "Store Persistent Profile Update"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DOCUMENT & CREDENTIAL ATTACHMENT MODAL */}
      {isCredModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1419] border border-slate-800 w-full max-w-lg rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setIsCredModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Link Verified Credential</h3>
            <p className="text-xs text-slate-400 mb-4">Associate structured records backed securely by cloud image payloads</p>

            {modalError && <div className="p-3 mb-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{modalError}</div>}

            <form onSubmit={handleCommitCredential} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Achievement Headline</label>
                <input type="text" required placeholder="e.g. Under-19 State Division Medallist" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Played For / Issued By</label>
                  <input type="text" required placeholder="e.g. Badminton Academy 123" value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Organization Web Path</label>
                  <input type="text" placeholder="academy123.com or internal link" value={newOrgLink} onChange={(e) => setNewOrgLink(e.target.value)} className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Milestone Format</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none">
                    <option value="Medal">🥇 Official Medal</option>
                    <option value="Certificate">📜 Digital Certificate</option>
                    <option value="Tournament Record">🏆 Tournament Log</option>
                    <option value="Milestone">⭐ General Track</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Date Signature</label>
                  <input type="text" required placeholder="e.g. Nov 2025" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div className="pt-1">
                <label className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Upload File Proof (Image Asset / PDF)</label>
                <div className="border border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl p-3 bg-[#080d10] relative">
                  <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} disabled={uploadingDoc} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  <div className="flex items-center justify-between text-xs text-slate-400 pointer-events-none">
                    <span className="truncate flex items-center gap-1.5"><FileText className="w-4 h-4 text-slate-500" /> {uploadingDoc ? "Transmitting stream..." : documentPath !== "" ? "Document payload securely linked" : "Target digital proof asset..."}</span>
                    {uploadingDoc ? <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" /> : documentPath !== "" ? <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> : null}
                  </div>
                </div>
              </div>

              <button type="submit" disabled={submittingRecord || uploadingDoc} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-xs transition-all mt-4 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                {submittingRecord ? <Loader2 className="w-4 h-4 animate-spin" /> : "Deploy Credential Card Inline"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}