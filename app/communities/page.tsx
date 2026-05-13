"use client";

import React, { useState, useEffect } from "react";
import { Users, MessageSquare, PlusCircle, MapPin, Send, ArrowLeft, Loader2, Megaphone, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Community {
  id: string;
  name: string;
  sport: string;
  district: string;
  description: string;
  members_count: number;
}

interface Post {
  id: string;
  author_name: string;
  author_role: string;
  content: string;
  post_type: string;
  created_at: string;
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  
  // States for new interactions
  const [newPostContent, setNewPostContent] = useState("");
  const [postType, setPostType] = useState("general");
  const [submittingPost, setSubmittingPost] = useState(false);
  
  // Current user cache
  const [userName, setUserName] = useState("Grassroots Athlete");
  const [userRole, setUserRole] = useState("Athlete");

  // Fetch initial base profiles and active circles on component mount
  useEffect(() => {
    const initializeView = async () => {
      setLoadingCommunities(true);
      // Fetch user context directly from cloud security context
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
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

      // Query core database for published communities
      const { data: comms } = await supabase
        .from("communities")
        .select("*")
        .order("members_count", { ascending: false });

      if (comms && comms.length > 0) {
        setCommunities(comms);
        setSelectedCommunity(comms[0]); // Select primary default community
        await fetchPosts(comms[0].id);
      }
      setLoadingCommunities(false);
    };

    initializeView();
  }, []);

  // Fetch real-time messaging feed when active circle toggles
  const fetchPosts = async (communityId: string) => {
    setLoadingPosts(true);
    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .eq("community_id", communityId)
      .order("created_at", { ascending: false });

    if (data) {
      setPosts(data);
    } else {
      setPosts([]);
    }
    setLoadingPosts(false);
  };

  // Switch community tabs smoothly
  const handleSelectCommunity = async (comm: Community) => {
    setSelectedCommunity(comm);
    await fetchPosts(comm.id);
  };

  // Submit discussion inputs back to cloud relational database
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunity || !newPostContent.trim()) return;
    setSubmittingPost(true);

    const { data, error } = await supabase
      .from("community_posts")
      .insert([
        {
          community_id: selectedCommunity.id,
          author_name: userName,
          author_role: userRole,
          content: newPostContent.trim(),
          post_type: postType
        }
      ])
      .select();

    if (!error && data) {
      setPosts([data[0], ...posts]); // Instantly push new post to screen state
      setNewPostContent(""); // Reset input form
    }
    setSubmittingPost(false);
  };

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 flex flex-col">
      
      {/* Universal Top Nav Header */}
      <header className="border-b border-slate-800/80 bg-[#080d10]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Primary Hub
          </button>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
            <span>● Hyperlocal Circles Online</span>
          </div>
        </div>
      </header>

      {/* Core Interface Workspace */}
      <div className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Community Circles Directory */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0c1419] border border-slate-800 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest block">Explore Matrix</span>
              <span className="text-xs text-slate-500 font-mono">{communities.length} Circles</span>
            </div>
            <h2 className="text-base font-bold text-white leading-tight">Grassroots Hubs</h2>
            <p className="text-xs text-slate-400 mt-0.5">Discover and join localized practice groups</p>
          </div>

          {/* Directory Rendering List */}
          <div className="space-y-2">
            {loadingCommunities ? (
              <div className="py-12 text-center text-xs text-slate-500 border border-slate-800/40 rounded-xl bg-[#0c1419]/40">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-500" /> Pulling Cloud Matrix...
              </div>
            ) : (
              communities.map((comm) => {
                const isSelected = selectedCommunity?.id === comm.id;
                return (
                  <button
                    key={comm.id}
                    onClick={() => handleSelectCommunity(comm)}
                    className={`w-full p-4 rounded-xl border text-left transition-all relative block cursor-pointer ${
                      isSelected 
                        ? "bg-emerald-500/10 border-emerald-500/60 shadow-md" 
                        : "bg-[#0c1419] border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {comm.sport}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {comm.members_count}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mt-2 leading-tight">{comm.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{comm.description}</p>
                    
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-800/40">
                      <MapPin className="w-3 h-3 text-slate-600" /> Hyperlocal: {comm.district}
                    </div>

                    {isSelected && (
                      <div className="absolute inset-0 border-2 border-emerald-500 rounded-xl pointer-events-none" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Feed Chat Engine */}
        <div className="lg:col-span-8 flex flex-col h-[calc(100vh-140px)] bg-[#0c1419] border border-slate-800 rounded-2xl overflow-hidden relative">
          
          {selectedCommunity ? (
            <>
              {/* Active Circle Sub-Header */}
              <div className="p-5 bg-[#080d10] border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">{selectedCommunity.name}</h2>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedCommunity.description}</p>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 hidden sm:block">
                  Connected
                </span>
              </div>

              {/* Discussion Posts Matrix Flow */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {loadingPosts ? (
                  <div className="py-16 text-center text-xs text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" /> Synchronizing live community logs...
                  </div>
                ) : posts.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                    <p className="text-sm font-bold text-slate-400">Circle feed is clear</p>
                    <p className="mt-0.5">Be the first to leave an update or coordinate practice plans below.</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="p-4 bg-[#080d10] border border-slate-800/80 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white capitalize">{post.author_name}</span>
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {post.author_role}
                          </span>
                        </div>
                        {post.post_type !== "general" && (
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 ${
                            post.post_type === "announcement" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          }`}>
                            {post.post_type === "announcement" ? <Megaphone className="w-2.5 h-2.5" /> : <Calendar className="w-2.5 h-2.5" />}
                            {post.post_type}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Dynamic Post Submission Controller */}
              <form onSubmit={handleCreatePost} className="p-4 bg-[#080d10] border-t border-slate-800 space-y-3 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 block">Posting publicly as <strong className="text-slate-300 capitalize">{userName}</strong></span>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-slate-500">Format:</span>
                    <select
                      value={postType}
                      onChange={(e) => setPostType(e.target.value)}
                      className="bg-[#0c1419] border border-slate-800 rounded px-2 py-0.5 text-emerald-400 focus:outline-none cursor-pointer font-semibold"
                    >
                      <option value="general">💬 General Chat</option>
                      <option value="event">📅 Local Event / Meet</option>
                      <option value="announcement">📣 Key Announcement</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text"
                    required
                    placeholder={`Message #${selectedCommunity.name.toLowerCase().replace(/\s+/g, '-')}...`}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="flex-1 bg-[#0c1419] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-600"
                  />
                  <button 
                    type="submit"
                    disabled={submittingPost}
                    className="px-5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 flex-shrink-0"
                    title="Send Post"
                  >
                    {submittingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 stroke-[2.5]" />}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
              <MessageSquare className="w-10 h-10 mb-2 text-slate-700" />
              <p className="text-sm font-bold text-white">No active hub highlighted</p>
              <p className="text-xs mt-1">Select a sports network view directly from the left sidebar directories.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}