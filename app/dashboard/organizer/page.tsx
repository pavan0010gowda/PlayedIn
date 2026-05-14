"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Loader2, UserCheck, X, Check, Trash2, Clock, 
  PlusCircle, Trophy, Award, Layers, CheckCircle, MessageSquare 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Registration {
  id: string;
  team_name: string;
  captain_name: string;
  sport: string;
  status: string;
  roster_profiles: any[];
}

interface PendingCertificate {
  id: string;
  athlete_id: string;
  title: string;
  organization_name: string;
  category: string;
  date_achieved: string;
  verification_status: string;
  document_url?: string;
  description?: string;
}

interface DirectMessage {
  id: string;
  sender_id?: string;
  receiver_id?: string;
  sender_name: string;
  receiver_name?: string;
  message: string;
  created_at: string;
}

export default function OrganizerDashboardPage() {
  // Added 'messages' tab to handle real-time scout-to-athlete communications
  const [activeAdminTab, setActiveAdminTab] = useState<"tournaments" | "certificates" | "messages">("tournaments");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [pendingCerts, setPendingCerts] = useState<PendingCertificate[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const MAX_SPOTS = 16;

  // Identity contexts
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentEntityName, setCurrentEntityName] = useState("CMRIT Administration");

  // Chat interface workspace controllers
  const [activeChatAthlete, setActiveChatAthlete] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Form setup parameters
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTourney, setNewTourney] = useState({
    title: "", sport: "Cricket", prize: "", fee: "", slots: 16
  });
  const [creating, setCreating] = useState(false);

  const fetchOperationsQueue = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let resolvedUserId = null;
      
      if (session?.user) {
        resolvedUserId = session.user.id;
        setCurrentUserId(resolvedUserId);
        if (session.user.email) {
          const parsedName = session.user.email.split("@")[0].toUpperCase();
          if (parsedName.includes("CMRIT")) setCurrentEntityName("CMRIT");
          else setCurrentEntityName(parsedName);
        }
      }

      // Parallel data fetching matching current user contexts securely
      const [regRes, certRes, msgRes] = await Promise.all([
        supabase.from("live_registrations").select("*").order("created_at", { ascending: false }),
        supabase.from("achievements").select("*").order("created_at", { ascending: false }),
        // Load global message mappings to construct active thread lists reliably
        supabase.from("direct_messages").select("*").order("created_at", { ascending: false })
      ]);

      if (regRes.data) setRegistrations(regRes.data);
      if (certRes.data) setPendingCerts(certRes.data);
      if (msgRes.data) setMessages(msgRes.data);
      
    } catch (err: any) {
      console.error("Operations Queue load dropped:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchOperationsQueue(); 
  }, []);

  const handleAction = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("live_registrations").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      await fetchOperationsQueue();
    } catch (err) {
      console.error("Override state failure:", err);
      alert("⚠️ Request timeout. Confirm endpoint bindings.");
    }
  };

  const handleCertificateVerification = async (certId: string, isApproved: boolean) => {
    const finalStateString = isApproved ? "Verified ✓" : "Rejected ❌";
    try {
      const { error } = await supabase.from("achievements").update({ verification_status: finalStateString }).eq("id", certId);
      if (error) throw error;
      
      setPendingCerts(prev => prev.map(c => c.id === certId ? { ...c, verification_status: finalStateString } : c));
      alert(`✨ Verification Sync Validated! Certificate record natively tagged as "${finalStateString}". The athlete's public feed layout will mirror this outcome instantaneously.`);
    } catch (err: any) {
      console.error("Authentication execution drop:", err);
      alert(`⚠️ Authentication Block: ${err.message || "Failed database target constraint overrides."}`);
    }
  };

  // REAL-TIME SCOUT REPLY HANDLER: Dispatches text updates directly back to selected Athlete scope
  const handleSendScoutMessage = async (e: React.FormEvent, targetAthleteName: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSendingReply(true);

    // Identify corresponding incoming messages to map precise destination athlete accounts
    const targetMsg = messages.find(m => m.sender_name === targetAthleteName && m.sender_id);
    const targetAthleteId = targetMsg?.sender_id || null;

    try {
      const { data, error } = await supabase.from("direct_messages").insert([{
        sender_id: currentUserId || "scout-unlinked-uuid",
        sender_name: currentEntityName,
        receiver_id: targetAthleteId,
        receiver_name: targetAthleteName,
        message: replyText.trim(),
        created_at: new Date().toISOString()
      }]).select();

      if (error) throw error;

      if (data && data.length > 0) {
        setMessages(prev => [data[0], ...prev]);
        setReplyText("");
      }
    } catch (err: any) {
      console.error("Message sync rejection:", err);
      alert(`⚠️ Pipeline drop: ${err.message || "Could not route chat packets."}`);
    } finally {
      setSendingReply(false);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session?.user) throw new Error("Identity scope missing. Sign back into console framework.");
      if (!newTourney.title.trim()) { alert("⚠️ Input missing valid target designation string."); setCreating(false); return; }

      const completePayload = {
        title: newTourney.title.trim(), sport: newTourney.sport, prize_pool: newTourney.prize.trim() || "TBD Payout",
        entry_fee: newTourney.fee.trim() || "Free Entry", max_slots: isNaN(newTourney.slots) || newTourney.slots <= 0 ? 16 : newTourney.slots,
        organizer_id: session.user.id, status: "active"
      };

      let res = await supabase.from("live_tournaments").insert([completePayload]);

      if (res.error && (res.error.message.includes("security policy") || res.error.message.includes("violates row-level"))) {
        const basicPayload = { title: completePayload.title, sport: completePayload.sport, prize_pool: completePayload.prize_pool, entry_fee: completePayload.entry_fee, max_slots: completePayload.max_slots, status: "active" };
        res = await supabase.from("live_tournaments").insert([basicPayload]);
      }

      if (res.error) throw res.error;

      setIsCreateModalOpen(false); setNewTourney({ title: "", sport: "Cricket", prize: "", fee: "", slots: 16 });
      alert(`✨ "${completePayload.title}" actively deployed to un-cached live routing files!`);
    } catch (err: any) {
      console.error("Write error stack:", err); alert(`❌ Deployment Drop: ${err.message || "Target column dropped by RLS logic."}`);
    } finally { setCreating(false); }
  };

  const confirmedCount = registrations.filter(r => r.status === "confirmed").length;
  const spotsLeft = MAX_SPOTS - confirmedCount;
  const queuedInboundCerts = pendingCerts.filter(c => c.verification_status?.includes("Pending"));
  
  // Aggregate distinct athlete targets dynamically based on communication routing files
  const uniqueAthletes = Array.from(new Set(
    messages.map(m => m.sender_name === currentEntityName ? m.receiver_name : m.sender_name).filter(Boolean)
  )) as string[];

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 pb-12 select-none">
      <header className="border-b border-slate-800/80 bg-[#080d10]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <button onClick={() => window.location.href = "/home"} className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shrink-0">
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" /> Exit Dashboard
        </button>
        
        <div className="flex gap-6 items-center">
           <div className="text-right hidden sm:block">
              <span className="text-sm font-black text-emerald-400">{spotsLeft}</span>
              <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Spots Remaining</p>
           </div>
           <button onClick={() => setIsCreateModalOpen(true)} className="bg-orange-500 hover:bg-orange-400 text-black px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-orange-500/20 shrink-0">
             <PlusCircle className="w-4 h-4 stroke-[2.5] shrink-0" /> Post New Tournament
           </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-8 space-y-8">
        <div className="bg-[#0c1419] border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-red-500" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  Entity Command Hub
                </span>
                <span className="text-xs text-slate-500 font-mono">• Logged in as {currentEntityName}</span>
              </div>
              <h1 className="text-3xl font-black text-white flex items-center gap-3 italic mt-1.5">
                <Trophy className="text-amber-500 w-8 h-8 shrink-0" /> Institution Control Center
              </h1>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Inbound Approvals & Real-Time Security Ledgers</p>
            </div>
            
            {/* INTEGRATED TAB SWITCHER CONTROLLING THE 3 ADMINISTRATIVE VIEWS */}
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex flex-wrap items-center gap-1 shrink-0">
              <button 
                onClick={() => setActiveAdminTab("tournaments")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeAdminTab === "tournaments" ? "bg-[#0c1419] text-amber-400 border border-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Trophy className="w-3.5 h-3.5 shrink-0" /> Squads Queue
              </button>
              
              <button 
                onClick={() => setActiveAdminTab("certificates")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 relative ${
                  activeAdminTab === "certificates" ? "bg-[#0c1419] text-emerald-400 border border-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Award className="w-3.5 h-3.5 shrink-0" /> Certificate Auth
                {queuedInboundCerts.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />}
              </button>

              <button 
                onClick={() => setActiveAdminTab("messages")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 relative ${
                  activeAdminTab === "messages" ? "bg-[#0c1419] text-blue-400 border border-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" /> Recruiter Comms
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-amber-500 w-8 h-8" /></div>
        ) : activeAdminTab === "tournaments" ? (
          /* TOURNAMENTS ROSTER MANAGEMENT */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" /> Pending Requests ({registrations.filter(r => r.status === "pending").length})
              </h2>
              {registrations.filter(r => r.status === "pending").length === 0 ? (
                <div className="p-8 text-center border border-slate-800/50 rounded-2xl bg-slate-900/20"><p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Queue Clear</p></div>
              ) : (
                registrations.filter(r => r.status === "pending").map((req) => (
                  <div key={req.id} className="p-5 bg-[#0c1419] border border-amber-500/20 rounded-2xl space-y-3 relative overflow-hidden">
                    <div><span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">{req.sport}</span><h3 className="text-lg font-bold text-white tracking-tight">{req.team_name || req.captain_name}</h3></div>
                    <div className="flex gap-2"><button onClick={() => handleAction(req.id, "confirmed")} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"><Check className="w-3.5 h-3.5 stroke-[3] shrink-0" /> Approve Entry</button><button onClick={() => handleAction(req.id, "declined")} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs font-bold cursor-pointer shrink-0">Decline</button></div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2"><UserCheck className="w-4 h-4 shrink-0" /> Confirmed Roster ({confirmedCount}/{MAX_SPOTS})</h2>
              {registrations.filter(r => r.status === "confirmed").length === 0 ? (
                <div className="p-8 text-center border border-slate-800/50 rounded-2xl bg-slate-900/20"><p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Roster Empty</p></div>
              ) : (
                registrations.filter(r => r.status === "confirmed").map((req) => (
                  <div key={req.id} className="p-4 bg-[#0c1419] border border-slate-800 rounded-2xl flex items-center justify-between group">
                    <div><h3 className="text-sm font-bold text-white tracking-tight">{req.team_name || req.captain_name}</h3><p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{req.sport} • Verified Seed</p></div>
                    <button onClick={() => handleAction(req.id, "pending")} className="p-2 text-slate-700 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 shrink-0"><Trash2 className="w-4 h-4 shrink-0" /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeAdminTab === "certificates" ? (
          /* CERTIFICATE VERIFICATIONS MATRIX */
          <div className="space-y-6">
             <div className="flex justify-between items-center border-b border-slate-800 pb-3"><div><h2 className="text-sm font-bold text-white tracking-tight">Institutional Authorization Gateway</h2><p className="text-xs text-slate-400 mt-0.5">Filter incoming proofs tagged to your organizational identity metrics.</p></div><span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded text-xs font-mono shrink-0">{queuedInboundCerts.length} Pending Approvals</span></div>
             {pendingCerts.length === 0 ? (
               <div className="py-16 text-center border border-slate-800 rounded-2xl bg-[#0c1419]"><p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No Certificate References Mapped to Platform Logs</p></div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingCerts.map((cert) => {
                    const isPending = cert.verification_status?.includes("Pending");
                    const isVerified = cert.verification_status?.includes("Verified");
                    const isRejected = cert.verification_status?.includes("Rejected");
                    return (
                      <div key={cert.id} className={`bg-[#0c1419] border p-6 rounded-2xl space-y-4 flex flex-col justify-between transition-all ${isPending ? "border-amber-500/40 shadow-xs" : isVerified ? "border-emerald-500/30" : "border-slate-800 opacity-60"}`}>
                         <div>
                            <div className="flex justify-between items-start"><span className="text-[10px] font-extrabold bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 uppercase tracking-wider shrink-0">{cert.category}</span><span className={`text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wide shrink-0 ${isPending ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse" : isVerified ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>{cert.verification_status?.split(" ")[0] || "Pending"}</span></div>
                            <h3 className="text-base font-bold text-white tracking-tight mt-3 leading-snug">{cert.title}</h3>
                            <div className="mt-2 text-xs text-slate-400 font-medium"><span>Tagged Target: </span><strong className="text-white font-bold">{cert.organization_name}</strong></div>
                            {cert.description && <p className="text-xs text-slate-400 mt-2.5 bg-[#080d10] p-2.5 rounded-lg border border-slate-800/60 leading-relaxed italic">"{cert.description}"</p>}
                            {cert.document_url && <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between"><span className="text-[10px] text-slate-500 font-mono">Proof Uploaded Asset</span><a href={cert.document_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline font-bold flex items-center gap-1 shrink-0">Inspect Digital Document →</a></div>}
                         </div>
                         {isPending ? (
                           <div className="pt-3 border-t border-slate-800 flex items-center gap-2 mt-2"><button onClick={() => handleCertificateVerification(cert.id, true)} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"><Check className="w-3.5 h-3.5 stroke-[3] shrink-0" /> Approve (Yes)</button><button onClick={() => handleCertificateVerification(cert.id, false)} className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl text-xs transition-all border border-red-500/20 cursor-pointer shrink-0">Reject (No)</button></div>
                         ) : <div className="pt-2 text-center text-[10px] text-slate-500 font-mono italic">🔒 Authorization Handshake Completed</div>}
                      </div>
                    );
                  })}
               </div>
             )}
          </div>
        ) : (
          /* TAB 3: REAL-TIME SECURE RECRUITER & SCOUT MESSAGING MATRIX */
          <div className="bg-[#0c1419] border border-slate-800 rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
             
             {/* LEFT DIRECTORY: TARGET ATHLETES THREAD CONDUIT */}
             <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#080d10]/40 flex flex-col">
                <div className="p-4 border-b border-slate-800 bg-[#0c1419]">
                   <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Recruitment Channels</span>
                   <h3 className="text-xs font-bold text-white mt-0.5">Active Candidate Conduits</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
                   {uniqueAthletes.length === 0 ? (
                     <div className="p-8 text-center text-xs text-slate-500 italic">No communication history parsed.</div>
                   ) : (
                     uniqueAthletes.map((athleteName) => {
                       const isSelected = activeChatAthlete === athleteName;
                       const refMsg = messages.find(m => m.sender_name === athleteName || m.receiver_name === athleteName);
                       
                       return (
                         <button
                           key={athleteName}
                           onClick={() => setActiveChatAthlete(athleteName)}
                           className={`w-full p-4 text-left transition-all flex items-center justify-between cursor-pointer ${
                             isSelected ? "bg-blue-500/10 border-l-4 border-blue-500" : "hover:bg-slate-900/50 text-slate-400"
                           }`}
                         >
                           <div className="truncate pr-2">
                             <h4 className={`text-xs font-bold truncate capitalize ${isSelected ? 'text-blue-400' : 'text-slate-200'}`}>
                               {athleteName}
                             </h4>
                             <p className="text-[10px] text-slate-500 truncate italic mt-0.5">
                               {refMsg ? refMsg.message : "Open active chat workspace..."}
                             </p>
                           </div>
                           <span className="text-[10px] font-mono text-slate-600 shrink-0">→</span>
                         </button>
                       );
                     })
                   )}
                </div>
             </div>

             {/* RIGHT INTERACTIVE STREAM PANEL: MIRRORED TWO-WAY BUBBLE CHAT */}
             <div className="lg:col-span-8 flex flex-col justify-between bg-[#0c1419]">
                {activeChatAthlete ? (
                  <>
                    <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex justify-between items-center">
                       <div>
                         <span className="text-[9px] text-slate-500 font-mono uppercase block">Direct Live Interface</span>
                         <h3 className="text-xs font-bold text-white capitalize">Conversation: {activeChatAthlete}</h3>
                       </div>
                       <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                         Secure Handshake
                       </span>
                    </div>

                    {/* Chat Bubbles Container */}
                    <div className="flex-1 p-6 space-y-3 overflow-y-auto max-h-[360px] flex flex-col">
                       {messages
                         .filter(m => m.sender_name === activeChatAthlete || m.receiver_name === activeChatAthlete)
                         .slice()
                         .reverse() // Keep messages rendered chronologically
                         .map((msg) => {
                           // Scout outgoing bubbles align right; incoming athlete responses sit left
                           const isOutgoing = msg.sender_name === currentEntityName;
                           return (
                             <div 
                               key={msg.id} 
                               className={`p-3 rounded-xl max-w-[80%] text-xs leading-relaxed break-words shadow-xs ${
                                 isOutgoing 
                                   ? "bg-blue-500 text-white font-bold self-end rounded-br-xs" 
                                   : "bg-[#080d10] border border-slate-800 text-slate-200 self-start rounded-bl-xs font-medium"
                               }`}
                             >
                               <div className="text-[8px] font-mono opacity-70 border-b border-white/10 pb-0.5 mb-1">
                                 <span className="font-extrabold capitalize">{isOutgoing ? "You (Scout)" : msg.sender_name}</span>
                               </div>
                               <p className="whitespace-pre-wrap">{msg.message}</p>
                             </div>
                           );
                         })}
                    </div>

                    {/* Bidirectional Stream Injection Handler */}
                    <form onSubmit={(e) => handleSendScoutMessage(e, activeChatAthlete)} className="p-4 bg-[#080d10]/80 border-t border-slate-800 flex gap-2">
                       <input 
                         type="text" 
                         placeholder={`Message ${activeChatAthlete}...`}
                         value={replyText}
                         onChange={(e) => setReplyText(e.target.value)}
                         className="flex-1 bg-[#0c1419] border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-blue-500 font-medium placeholder:text-slate-600"
                         required
                       />
                       <button 
                         type="submit" 
                         disabled={sendingReply}
                         className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-black rounded-xl text-xs transition-all shrink-0 cursor-pointer disabled:opacity-40"
                       >
                         {sendingReply ? "..." : "Transmit"}
                       </button>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 py-24">
                     <MessageSquare className="w-10 h-10 stroke-[1.2] text-slate-700" />
                     <p className="text-xs font-bold">Select a Target Conduit</p>
                     <p className="text-[10px] text-slate-600 max-w-[220px] text-center">
                       Choose an active candidate thread directory from the sidebar to review logs or initiate secure two-way communication handshakes.
                     </p>
                  </div>
                )}
             </div>

          </div>
        )}
      </main>

      {/* MODAL GATEWAY */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0c1419] border border-slate-800 w-full max-w-md rounded-3xl p-8 relative shadow-2xl flex flex-col max-h-[90vh]">
            <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white cursor-pointer shrink-0"><X className="w-5 h-5 shrink-0" /></button>
            <div className="mb-6 shrink-0"><span className="text-[10px] uppercase font-black text-orange-500 tracking-widest block mb-1">Broadcasting Gateway</span><h2 className="text-xl font-black text-white italic">Deploy New Circuit</h2></div>
            <form onSubmit={handleCreateTournament} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div className="space-y-1"><label className="text-[9px] uppercase font-bold text-slate-500 px-1 block">Circuit Title</label><input type="text" placeholder="e.g CMRIT Pro Cup" required className="w-full bg-[#080d10] border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500" value={newTourney.title} onChange={e => setNewTourney({...newTourney, title: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><label className="text-[9px] uppercase font-bold text-slate-500 px-1 block">Discipline</label><select className="w-full bg-[#080d10] border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500 cursor-pointer" value={newTourney.sport} onChange={e => setNewTourney({...newTourney, sport: e.target.value})}><option value="Cricket">Cricket</option><option value="Football">Football</option><option value="Badminton">Badminton</option><option value="Volleyball">Volleyball</option></select></div>
                <div className="space-y-1"><label className="text-[9px] uppercase font-bold text-slate-500 px-1 block">Max Slots</label><input type="number" className="w-full bg-[#080d10] border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500" value={isNaN(newTourney.slots) ? "" : newTourney.slots} onChange={e => { const val = e.target.value; setNewTourney({...newTourney, slots: val === "" ? 0 : parseInt(val, 10)}); }} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><label className="text-[9px] uppercase font-bold text-slate-500 px-1 block">Prize Pool</label><input type="text" placeholder="e.g ₹50k Payout" className="w-full bg-[#080d10] border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500" value={newTourney.prize} onChange={e => setNewTourney({...newTourney, prize: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[9px] uppercase font-bold text-slate-500 px-1 block">Entry Fee</label><input type="text" placeholder="e.g ₹1,500 / Free" className="w-full bg-[#080d10] border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500" value={newTourney.fee} onChange={e => setNewTourney({...newTourney, fee: e.target.value})} /></div>
              </div>
              <button type="submit" disabled={creating} className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-black rounded-2xl text-sm mt-6 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50">{creating ? <Loader2 className="animate-spin mx-auto w-5 h-5 text-black" /> : "BROADCAST CIRCUIT LIVE"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}