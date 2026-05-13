"use client";

import React, { useState, useEffect } from "react";
import { 
  MapPin, Users, CheckCircle, Award, Loader2, PlusCircle, 
  ExternalLink, FileText, X, Check, Edit3, Video, Grid, Layers, Phone, Calendar, MessageSquare
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
  description?: string;
}

interface UserReel {
  id: string;
  video_url: string;
  caption: string;
  likes_count: number;
}

interface TrialInvite {
  id: string;
  scout_name: string;
  academy_name: string;
  trial_date: string;
  trial_location: string;
  contact_info: string;
  notes?: string;
  status: string;
  created_at: string;
}

interface DirectMessage {
  id: string;
  sender_name: string;
  message: string;
  created_at: string;
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

  // Integrated Database Arrays
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userReels, setUserReels] = useState<UserReel[]>([]);
  const [trialInvites, setTrialInvites] = useState<TrialInvite[]>([]);
  const [inboxMessages, setInboxMessages] = useState<DirectMessage[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  // Modal Controllers
  const [isCredModalOpen, setIsCredModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Form State Properties
  const [newTitle, setNewTitle] = useState("");
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgLink, setNewOrgLink] = useState("");
  const [newCategory, setNewCategory] = useState("Certificate");
  const [newDate, setNewDate] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [documentPath, setDocumentPath] = useState("");
  const [submittingRecord, setSubmittingRecord] = useState(false);
  const [modalError, setModalError] = useState("");
  const [savingMetrics, setSavingMetrics] = useState(false);

  // Initialize profile contexts and bind concurrent data arrays
  useEffect(() => {
    const initializeEcosystemView = async () => {
      setLoadingProfile(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || "");
        
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

        await fetchIntegratedMatrix(session.user.id);
      }
      setLoadingProfile(false);
    };

    initializeEcosystemView();
  }, []);

  // Secure parallel extraction for 4 separate data dependencies
  const fetchIntegratedMatrix = async (targetId: string) => {
    setLoadingAssets(true);
    
    const [achRes, reelsRes, invitesRes, messagesRes] = await Promise.all([
      supabase.from("achievements").select("*").eq("athlete_id", targetId).order("created_at", { ascending: false }),
      supabase.from("reels").select("id, video_url, caption, likes_count").eq("athlete_id", targetId).order("created_at", { ascending: false }),
      supabase.from("trial_invitations").select("*").eq("athlete_id", targetId).order("created_at", { ascending: false }),
      supabase.from("direct_messages").select("*").eq("receiver_id", targetId).order("created_at", { ascending: false })
    ]);

    if (achRes.data) setAchievements(achRes.data);
    if (reelsRes.data) setUserReels(reelsRes.data);
    if (invitesRes.data) setTrialInvites(invitesRes.data);
    if (messagesRes.data) setInboxMessages(messagesRes.data);
    
    setLoadingAssets(false);
  };

  // Dispatch raw binary files directly to Supabase global documents pool
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
      setModalError(error.message || "Storage policy error. Ensure file permissions are met.");
    } finally {
      setUploadingDoc(false);
    }
  };

  // Commit dynamic documented posts complete with descriptive layers
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
            description: newDescription.trim() !== "" ? newDescription : "Verified milestone execution tracked internally by ecosystem credentials protocol.",
            document_url: documentPath !== "" ? documentPath : null,
            verification_status: documentPath !== "" ? "Verified Document Attached" : "Pending Verification"
          }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setAchievements([data[0], ...achievements]);
        setNewTitle(""); setNewOrgName(""); setNewOrgLink(""); setNewDate(""); setNewDescription(""); setDocumentPath("");
        setIsCredModalOpen(false);
      }
    } catch (error: any) {
      console.error("Commit error:", error);
      setModalError("Database persistence error. Review valid authorization credentials.");
    } finally {
      setSubmittingRecord(false);
    }
  };

  // Apply metric parameter changes securely to the cloud profiles table
  const handleSaveMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSavingMetrics(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ age, height, preferred_foot_hand: prefSide, about_me: aboutMe })
        .eq("id", userId);

      if (!error) setIsEditModalOpen(false);
    } catch (err) {
      console.error("Failed saving metrics:", err);
    } finally {
      setSavingMetrics(false);
    }
  };

  // Dynamically set scout trial invite states
  const handleAcknowledgeInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from("trial_invitations")
        .update({ status: "Accepted ✓" })
        .eq("id", inviteId);

      if (!error) {
        setTrialInvites(prev => prev.map(i => i.id === inviteId ? { ...i, status: "Accepted ✓" } : i));
      }
    } catch (err) {
      console.error("Status check update failure:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 pb-12 relative">
      <header className="border-b border-slate-800/80 bg-[#080d10]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}
            className="flex items-center gap-2 text-xs font-bold text-red-400/80 hover:text-red-400 transition-colors border border-red-500/20 bg-red-500/5 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            Sign Out OS
          </button>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <span>● Premium LinkedIn Workspace Bound</span>
          </div>
        </div>
      </header>

      {/* Hero Workspace Frame */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="bg-[#0c1419] border border-slate-800/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
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

            {/* DYNAMIC ACTION TRIGGER SET (WITH INTEGRATED COMMUNITY HUB HOOK) */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
              <button 
                onClick={() => window.location.href = "/communities"}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-800 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" /> Community Hub
              </button>
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
        </div>
      </div>

      {/* Main Framework Grid Architecture */}
      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PRIMARY MATRIX WORKSPACE */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-px overflow-x-auto">
            <button onClick={() => setActiveTab("credentials")} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === "credentials" ? "text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5" : "text-slate-400 hover:text-slate-200"}`}>
              <Layers className="w-3.5 h-3.5" /> Posts & Credentials
            </button>
            <button onClick={() => setActiveTab("reels")} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === "reels" ? "text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5" : "text-slate-400 hover:text-slate-200"}`}>
              <Grid className="w-3.5 h-3.5" /> Reels Grid
            </button>
            <button onClick={() => setActiveTab("about")} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${activeTab === "about" ? "text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5" : "text-slate-400 hover:text-slate-200"}`}>
              <FileText className="w-3.5 h-3.5" /> About & Metrics
            </button>
            
            <button onClick={() => window.location.href = "/feed"} className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-[11px] font-bold text-emerald-400 transition-all flex items-center gap-1 ml-auto flex-shrink-0 cursor-pointer">
              <Video className="w-3 h-3 text-emerald-400" /> Watch Feed
            </button>
          </div>

          {/* TAB 1: VERIFIED POSTS LAYOUT */}
          {activeTab === "credentials" && (
            <div className="space-y-4">
              {loadingAssets ? (
                <div className="py-16 text-center border border-slate-800/50 rounded-2xl bg-[#0c1419]/40"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-500" /> Indexing Timeline Ledgers...</div>
              ) : achievements.length === 0 ? (
                <div className="py-12 text-center border border-slate-800 rounded-2xl bg-[#0c1419]"><Award className="w-10 h-10 mx-auto mb-2 text-slate-700" /><p className="text-sm font-bold text-white">No Track Records Uploaded</p></div>
              ) : (
                <div className="space-y-6">
                  {achievements.map((item) => (
                    <div key={item.id} className="bg-[#0c1419] border border-slate-800/80 rounded-2xl overflow-hidden transition-all hover:border-slate-700 flex flex-col">
                      <div className="p-5 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{item.category}</span>
                            <span className="text-xs text-slate-500 font-mono">• {item.date_achieved}</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Verified Document Attached</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white leading-tight">{item.title}</h4>
                          {item.description && <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-[#080d10] p-3 rounded-xl border border-slate-800/40">{item.description}</p>}
                          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                            <span className="text-xs text-slate-400">Authorized entity association:</span>
                            <strong className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{item.organization_name}</strong>
                          </div>
                        </div>
                      </div>
                      {item.document_url && (
                        <div className="border-t border-slate-800/80 bg-[#080d10] p-3 flex justify-center">
                          <div className="w-full max-h-[350px] overflow-hidden rounded-xl border border-slate-800/60 relative bg-black flex items-center justify-center">
                            <img src={item.document_url} alt="Verification Asset Proof" className="w-full h-full object-contain max-h-[340px]" loading="lazy" />
                          </div>
                        </div>
                      )}
                      <div className="p-3 bg-[#080d10] border-t border-slate-800/40 flex justify-between items-center text-[10px] text-slate-500">
                        <span>Database Key Identifier: {item.id.slice(0, 8)}...</span>
                        <button onClick={() => window.location.href = "/sponsors"} className="text-amber-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer">Browse Brand Sponsorship Deals →</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PERSONAL VIDEO LOOPS */}
          {activeTab === "reels" && (
            <div className="space-y-4">
              {loadingAssets ? (
                <div className="py-16 text-center border border-slate-800/50 rounded-2xl bg-[#0c1419]/40"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-500" /> Pulling Stream Assets...</div>
              ) : userReels.length === 0 ? (
                <div className="py-12 text-center border border-slate-800 rounded-2xl bg-[#0c1419]"><p className="text-sm font-bold text-white">No Video Highlights Deployed</p></div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {userReels.map((reel) => (
                    <div key={reel.id} className="aspect-[9/16] bg-black rounded-xl border border-slate-800 overflow-hidden relative group shadow-md">
                      <video src={reel.video_url} className="w-full h-full object-cover pointer-events-none" muted playsInline />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EXTENDED METRICS BIO */}
          {activeTab === "about" && (
            <div className="space-y-4">
              <div className="bg-[#0c1419] border border-slate-800 rounded-2xl p-6 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Professional Summary Profile</h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{aboutMe}</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR MODULES: HIGH VISIBILITY DIRECT MESSAGES & CALL-UP MATRIX */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* DIRECT MESSAGING CHAT BOX PIPELINE VIEW */}
          <div className="bg-[#0c1419] border-2 border-emerald-500/30 rounded-2xl p-6 space-y-4 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider block">Recruitment Network</span>
                <h3 className="text-sm font-bold text-white mt-0.5">Secure Direct Inbox</h3>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                {inboxMessages.length} DMs
              </span>
            </div>

            {loadingAssets ? (
              <div className="py-8 text-center text-xs text-slate-500"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-emerald-400" /> Caching DMs...</div>
            ) : inboxMessages.length === 0 ? (
              <div className="py-8 text-center border border-slate-800/80 rounded-xl bg-[#080d10]">
                <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-1 stroke-[1.5]" />
                <p className="text-xs font-bold text-slate-400">Inbox is Clear</p>
                <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto mt-0.5">Direct scout outreach chat notifications surface here instantaneously.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {inboxMessages.map((msg) => (
                  <div key={msg.id} className="p-3 bg-[#080d10] border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
                      <span className="text-xs font-bold text-emerald-400 capitalize">{msg.sender_name}</span>
                      <span className="text-[9px] text-slate-500 font-mono">Just now</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PHYSICAL MEETUP INVITATION MODULE */}
          <div className="bg-[#0c1419] border-2 border-blue-500/30 rounded-2xl p-6 space-y-4 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-400 to-teal-400" />
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase font-bold text-blue-400 tracking-wider block">Trial Router</span>
                <h3 className="text-sm font-bold text-white mt-0.5">Scout Call-Ups</h3>
              </div>
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-mono">
                {trialInvites.length} Pings
              </span>
            </div>

            {loadingAssets ? (
              <div className="py-8 text-center text-xs text-slate-500"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-blue-400" /> Indexing Conduits...</div>
            ) : trialInvites.length === 0 ? (
              <div className="py-8 text-center border border-slate-800/80 rounded-xl bg-[#080d10]">
                <Phone className="w-8 h-8 text-slate-700 mx-auto mb-1 stroke-[1.5]" />
                <p className="text-xs font-bold text-slate-400">No Meetup Invites Active</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {trialInvites.map((invite) => (
                  <div key={invite.id} className="p-3 bg-[#080d10] border border-slate-800 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-white capitalize">{invite.scout_name}</h4>
                        <span className="text-[9px] text-slate-400 block">{invite.academy_name}</span>
                      </div>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                        invite.status.includes("Accepted") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {invite.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-[10px] bg-[#0c1419] p-2 rounded border border-slate-800/60">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <MapPin className="w-3 h-3 text-blue-400 flex-shrink-0" />
                        <span className="truncate">{invite.trial_location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Calendar className="w-3 h-3 text-blue-400 flex-shrink-0" />
                        <span className="truncate">{invite.trial_date}</span>
                      </div>
                    </div>

                    <div className="pt-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
                      <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span>{invite.contact_info}</span>
                      </div>
                      {!invite.status.includes("Accepted") && (
                        <button onClick={() => handleAcknowledgeInvite(invite.id)} className="px-2 py-0.5 bg-emerald-500 text-black font-bold rounded text-[9px]">Lock In Trial</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Admonition Integrity Layout */}
          <div className="bg-[#0c1419] border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Status</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> DMs Active</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> Router Linked</div>
            </div>
          </div>

        </div>

      </div>

      {/* METADATA FORM */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1419] border border-slate-800 w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-white mb-1">Revise Professional Metrics</h3>
            <form onSubmit={handleSaveMetrics} className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" required value={age} onChange={(e) => setAge(e.target.value)} className="bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                <input type="text" required value={height} onChange={(e) => setHeight(e.target.value)} className="bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <select value={prefSide} onChange={(e) => setPrefSide(e.target.value)} className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold">
                <option value="Right">Right Foot / Hand</option>
                <option value="Left">Left Foot / Hand</option>
              </select>
              <textarea required rows={4} value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white resize-none" />
              <button type="submit" disabled={savingMetrics} className="w-full py-3 bg-emerald-500 text-black font-extrabold text-xs rounded-xl mt-4">Store Persistent Profile Update</button>
            </form>
          </div>
        </div>
      )}

      {/* CREDENTIAL ATTACHMENT MODAL */}
      {isCredModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1419] border border-slate-800 w-full max-w-lg rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setIsCredModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-white mb-1">Link Verified Credential</h3>
            {modalError && <div className="p-3 mb-3 bg-red-500/10 text-red-400 text-xs rounded-xl">{modalError}</div>}
            <form onSubmit={handleCommitCredential} className="space-y-3 mt-4">
              <input type="text" required placeholder="Headline" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              <textarea rows={2} placeholder="Description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" required placeholder="Organization" value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} className="bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                <input type="text" placeholder="Link" value={newOrgLink} onChange={(e) => setNewOrgLink(e.target.value)} className="bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold">
                  <option value="Medal">Medal</option>
                  <option value="Certificate">Certificate</option>
                </select>
                <input type="text" required placeholder="Date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div className="border border-dashed border-slate-800 rounded-xl p-3 bg-[#080d10] relative">
                <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} disabled={uploadingDoc} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                <div className="flex items-center justify-between text-xs text-slate-400 pointer-events-none">
                  <span>{uploadingDoc ? "Transmitting..." : documentPath !== "" ? "Linked" : "Target digital proof asset..."}</span>
                </div>
              </div>
              <button type="submit" disabled={submittingRecord || uploadingDoc} className="w-full py-3.5 bg-emerald-500 text-black font-extrabold text-xs rounded-xl mt-4">Deploy Credential Card</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}