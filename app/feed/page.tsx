"use client";

import React, { useState, useEffect } from "react";
import { Heart, MessageSquare, Share2, Plus, ArrowLeft, Loader2, Sparkles, MapPin, Send, Video, X, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ReelComment {
  id: string;
  author_name: string;
  author_role: string;
  content: string;
  created_at: string;
}

interface Reel {
  id: string;
  athlete_id: string;
  athlete_name: string;
  sport: string;
  district: string;
  video_url: string;
  caption: string;
  visibility_score: number;
  likes_count: number;
}

export default function SportsFeedPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  
  // Interaction Control States
  const [likedReels, setLikedReels] = useState<{ [key: string]: boolean }>({});
  const [activeComments, setActiveComments] = useState<ReelComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showCommentDrawer, setShowCommentDrawer] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Authenticated Context Cache
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("Sports Enthusiast");
  const [userRole, setUserRole] = useState("Fan");

  // Video Upload Modal Control States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadSport, setUploadSport] = useState("Football");
  const [uploadDistrict, setUploadDistrict] = useState("Bengaluru");
  const [uploadCaption, setUploadCaption] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingState, setUploadingState] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Populate dynamic media records on load
  useEffect(() => {
    const initializeFeed = async () => {
      setLoadingFeed(true);
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
          setUserRole(profile.ecosystem_role.charAt(0).toUpperCase() + profile.ecosystem_role.slice(1));
        }
      }

      // Query core highlights matrix
      const { data } = await supabase
        .from("reels")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setReels(data);
      }
      setLoadingFeed(false);
    };

    initializeFeed();
  }, []);

  // Handle immediate UI incrementing and update persistent upvote database records
  const handleToggleLike = async (reelId: string, currentLikes: number) => {
    const isLiked = likedReels[reelId];
    const newCount = isLiked ? currentLikes - 1 : currentLikes + 1;
    
    // Optimistic inline state updates for instantaneous mobile layout UX
    setLikedReels(prev => ({ ...prev, [reelId]: !isLiked }));
    setReels(prev => prev.map(r => r.id === reelId ? { ...r, likes_count: newCount } : r));

    // Commit change asynchronously to database backend
    await supabase
      .from("reels")
      .update({ likes_count: newCount })
      .eq("id", reelId);
  };

  // Open structured discussion panel for individual reel items
  const handleOpenComments = async (reelId: string) => {
    setShowCommentDrawer(true);
    setLoadingComments(true);
    
    const { data } = await supabase
      .from("reel_comments")
      .select("*")
      .eq("reel_id", reelId)
      .order("created_at", { ascending: true });

    setActiveComments(data || []);
    setLoadingComments(false);
  };

  // Insert professional evaluation updates into comment matrices
  const handleCommitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeReel = reels[activeReelIndex];
    if (!activeReel || !newCommentText.trim()) return;
    
    setSubmittingComment(true);
    const { data, error } = await supabase
      .from("reel_comments")
      .insert([
        {
          reel_id: activeReel.id,
          author_name: userName,
          author_role: userRole,
          content: newCommentText.trim()
        }
      ])
      .select();

    if (!error && data) {
      setActiveComments([...activeComments, data[0]]);
      setNewCommentText("");
      
      // Give the athlete an algorithm visibility boost if author is a Mentor/Scout
      if (userRole === "Mentor" || userRole === "Scout") {
        await supabase
          .from("reels")
          .update({ visibility_score: activeReel.visibility_score + 5 })
          .eq("id", activeReel.id);
      }
    }
    setSubmittingComment(false);
  };

  // Complete end-to-end cloud database write operations handling binary MP4 inputs
  const handleExecuteUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !userId) {
      setUploadError("Please target a valid system video segment.");
      return;
    }
    setUploadingState(true);
    setUploadError("");

    try {
      const fileExt = videoFile.name.split('.').pop();
      const uniquePath = `${userId}/${Date.now()}.${fileExt}`;

      // Upload binary payload directly into public Supabase reels storage container
      const { error: storageError } = await supabase.storage
        .from("reels_media")
        .upload(uniquePath, videoFile);

      if (storageError) throw storageError;

      const { data: mediaRef } = supabase.storage.from("reels_media").getPublicUrl(uniquePath);

      // Commit structured relational mapping to postgres tables
      const { data: insertRecord, error: dbError } = await supabase
        .from("reels")
        .insert([
          {
            athlete_id: userId,
            athlete_name: userName,
            sport: uploadSport,
            district: uploadDistrict,
            video_url: mediaRef.publicUrl,
            caption: uploadCaption.trim() || "Local showcase update 🔥",
            visibility_score: 85,
            likes_count: 0
          }
        ])
        .select();

      if (dbError) throw dbError;

      if (insertRecord && insertRecord.length > 0) {
        setReels([insertRecord[0], ...reels]);
        setActiveReelIndex(0);
        setShowUploadModal(false);
        setVideoFile(null);
        setUploadCaption("");
      }
    } catch (err: any) {
      console.error("Pipeline failure:", err);
      setUploadError(err.message || "Could not transmit media element. Validate token authorization.");
    } finally {
      setUploadingState(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 flex flex-col justify-between select-none">
      
      {/* Dynamic Header Frame */}
      <header className="border-b border-slate-800/80 bg-[#080d10]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex-shrink-0">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Exit
          </button>
          
          <div className="flex items-center gap-1.5 font-black tracking-tight text-white">
            <span>PlayedIn</span>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 text-transparent bg-clip-text text-sm">
              Reels
            </span>
          </div>

          <button 
            onClick={() => setShowUploadModal(true)}
            className="p-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold transition-all flex items-center gap-1 text-xs cursor-pointer shadow-lg shadow-emerald-500/10"
            title="Deploy Local Loop"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Drop
          </button>
        </div>
      </header>

      {/* Primary Video Reel Interactive Space Container */}
      <main className="flex-1 flex items-center justify-center py-4 px-2">
        <div className="w-full max-w-md h-[calc(100vh-130px)] bg-[#0c1419] border border-slate-800 rounded-3xl overflow-hidden relative flex flex-col justify-between shadow-2xl">
          
          {loadingFeed ? (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              <span className="text-xs text-slate-500 font-mono">Caching local highlight metrics...</span>
            </div>
          ) : reels.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <Video className="w-12 h-12 text-slate-700 mb-2" />
              <p className="text-sm font-bold text-white">Highlights Vault Empty</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No highlight reels active in backend system arrays. Click "Drop" above to transmit initial match loops.
              </p>
            </div>
          ) : (
            <>
              {/* CURRENT ACTIVE VIDEO CONTAINER */}
              <div className="absolute inset-0 bg-black z-0 flex items-center justify-center overflow-hidden">
                <video 
                  key={reels[activeReelIndex].id}
                  src={reels[activeReelIndex].video_url}
                  autoPlay
                  loop
                  muted={false}
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Visual Accent Mask overlay to preserve content legibility */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />
              </div>

              {/* TOP HUD ACCENTS */}
              <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Algorithm Boost Score: {reels[activeReelIndex].visibility_score}
                </span>

                {/* Integrated Pager Position Metrics */}
                <span className="text-[10px] font-mono bg-black/60 backdrop-blur-md text-slate-300 px-2.5 py-1 rounded-full border border-slate-800">
                  {activeReelIndex + 1} / {reels.length}
                </span>
              </div>

              {/* CENTRAL SWIPE CONTROLLER NAVIGATION ARROWS */}
              <div className="absolute inset-y-0 left-2 right-2 z-10 flex justify-between items-center pointer-events-none">
                <button 
                  onClick={() => setActiveReelIndex(prev => Math.max(0, prev - 1))}
                  disabled={activeReelIndex === 0}
                  className="p-3 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white rounded-full transition-all pointer-events-auto disabled:opacity-0 cursor-pointer"
                  title="Previous Clip"
                >
                  ▲
                </button>
                <button 
                  onClick={() => setActiveReelIndex(prev => Math.min(reels.length - 1, prev + 1))}
                  disabled={activeReelIndex === reels.length - 1}
                  className="p-3 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white rounded-full transition-all pointer-events-auto disabled:opacity-0 cursor-pointer"
                  title="Next Clip"
                >
                  ▼
                </button>
              </div>

              {/* BOTTOM METADATA CAPTION OVERLAYS */}
              <div className="absolute bottom-4 left-4 right-16 z-10 space-y-2 pointer-events-auto">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white capitalize drop-shadow-md">
                    @{reels[activeReelIndex].athlete_name}
                  </h3>
                  <span className="text-[9px] font-bold text-black bg-emerald-400 px-1.5 py-0.5 rounded tracking-wide uppercase">
                    {reels[activeReelIndex].sport}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-snug line-clamp-3 drop-shadow-md">
                  {reels[activeReelIndex].caption}
                </p>

                <div className="flex items-center gap-1 text-[10px] text-emerald-300 pt-0.5 drop-shadow-md">
                  <MapPin className="w-3 h-3 flex-shrink-0" /> District Hub: {reels[activeReelIndex].district}
                </div>
              </div>

              {/* RIGHT SIDE HUD STACK ACTIONS CONTAINER */}
              <div className="absolute bottom-4 right-3 z-10 flex flex-col items-center space-y-4 pointer-events-auto">
                
                {/* LIKE ACTION LOGIC HOOK */}
                <button 
                  onClick={() => handleToggleLike(reels[activeReelIndex].id, reels[activeReelIndex].likes_count)}
                  className="flex flex-col items-center group cursor-pointer"
                  title="Upvote Loop"
                >
                  <div className={`p-3 rounded-full backdrop-blur-md transition-all ${
                    likedReels[reels[activeReelIndex].id] ? "bg-emerald-500 text-black scale-110" : "bg-black/50 text-white group-hover:bg-black/80"
                  }`}>
                    <Heart className={`w-5 h-5 ${likedReels[reels[activeReelIndex].id] ? "fill-black stroke-black" : ""}`} />
                  </div>
                  <span className="text-[10px] font-bold text-white mt-1 drop-shadow-md">
                    {reels[activeReelIndex].likes_count}
                  </span>
                </button>

                {/* OPEN COMMENTS PANEL TRIGGER */}
                <button 
                  onClick={() => handleOpenComments(reels[activeReelIndex].id)}
                  className="flex flex-col items-center group cursor-pointer"
                  title="Evaluate Content"
                >
                  <div className="p-3 bg-black/50 group-hover:bg-black/80 backdrop-blur-md text-white rounded-full transition-all">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-white mt-1 drop-shadow-md">Tips</span>
                </button>

                {/* NATIVE ECOSYSTEM ROUTE HOOK */}
                <button 
                  onClick={() => {
                    // Copy active link or open native sharing prompt
                    navigator.clipboard.writeText(window.location.href);
                    alert("Reel reference string cached to operating clipboard!");
                  }}
                  className="flex flex-col items-center group cursor-pointer"
                  title="Share Reference"
                >
                  <div className="p-3 bg-black/50 group-hover:bg-black/80 backdrop-blur-md text-white rounded-full transition-all">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-white mt-1 drop-shadow-md">Share</span>
                </button>

              </div>
            </>
          )}

        </div>
      </main>

      {/* DYNAMIC REEL COMMENTARY DRAWER OVERLAY */}
      {showCommentDrawer && reels[activeReelIndex] && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end">
          <div className="w-full max-w-md mx-auto bg-[#0c1419] border-t border-slate-800 rounded-t-3xl h-3/4 flex flex-col justify-between overflow-hidden animate-in slide-in-from-bottom duration-200">
            
            {/* Drawer Control Header */}
            <div className="p-4 bg-[#080d10] border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white">Tactical Performance Feedback</h3>
                <p className="text-[10px] text-slate-500">Mentors evaluate execution tracks below</p>
              </div>
              <button 
                onClick={() => setShowCommentDrawer(false)}
                className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Matrix Data Logging Screen */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingComments ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" /> Pulling Cloud Feedback Pipes...
                </div>
              ) : activeComments.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 italic">
                  No direct peer evaluations submitted yet. Drop custom technique strategies below.
                </div>
              ) : (
                activeComments.map((comm) => (
                  <div key={comm.id} className="p-3 bg-[#080d10] border border-slate-800/80 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white capitalize">{comm.author_name}</span>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${
                        comm.author_role === "Mentor" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        comm.author_role === "Scout" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        "bg-slate-800 text-slate-400 border-slate-700"
                      }`}>
                        {comm.author_role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed break-words">{comm.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form Submit Command */}
            <form onSubmit={handleCommitComment} className="p-3 bg-[#080d10] border-t border-slate-800 flex gap-2">
              <input 
                type="text"
                required
                placeholder={`Leave tactical feedback as ${userName}...`}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 bg-[#0c1419] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-slate-600"
              />
              <button 
                type="submit"
                disabled={submittingComment}
                className="px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5 stroke-[2.5]" />}
              </button>
            </form>

          </div>
        </div>
      )}

      {/* SECURE VIDEO STORAGE PIPELINE UPLOAD MODAL WORKSPACE */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1419] border border-slate-800 w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button 
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Transmit Highlight Stream</h3>
            <p className="text-xs text-slate-400 mb-4">Deploy active mobile loops directly to discovery platforms</p>

            {uploadError && (
              <div className="p-3 mb-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleExecuteUpload} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Sport Engine</label>
                  <select 
                    value={uploadSport} onChange={(e) => setUploadSport(e.target.value)}
                    className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none"
                  >
                    <option value="Football">⚽ Football</option>
                    <option value="Cricket">🏏 Cricket</option>
                    <option value="Badminton">🏸 Badminton</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Ecosystem District</label>
                  <input 
                    type="text" required value={uploadDistrict} onChange={(e) => setUploadDistrict(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Media Context Header</label>
                <textarea 
                  required rows={2} value={uploadCaption} onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="Summarize technique focal targets..."
                  className="w-full bg-[#080d10] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none resize-none placeholder-slate-600"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Attach Video Segment (MP4 / WebM)</label>
                <div className="border border-dashed border-slate-800 hover:border-emerald-500/40 rounded-xl p-3 bg-[#080d10] relative transition-colors">
                  <input 
                    type="file" accept="video/mp4,video/webm"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) setVideoFile(e.target.files[0]);
                    }}
                    disabled={uploadingState}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-400 pointer-events-none">
                    <span className="truncate flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      {uploadingState ? "Transmitting stream chunks..." : videoFile ? videoFile.name : "Target local source recording..."}
                    </span>
                    {uploadingState ? <Loader2 className="w-4 h-4 text-emerald-400 animate-spin flex-shrink-0" /> : videoFile ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 stroke-[3]" /> : null}
                  </div>
                </div>
              </div>

              <button 
                type="submit" disabled={uploadingState || !videoFile}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-xs tracking-wide transition-all mt-4 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploadingState ? <Loader2 className="w-4 h-4 animate-spin" /> : "Deploy Stream Pipeline Natively"}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}