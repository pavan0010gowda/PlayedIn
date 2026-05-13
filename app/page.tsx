"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, User, Compass, Calendar, ArrowRight, Shield, Lock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState("athlete");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  
  const router = useRouter();

  const roles = [
    {
      id: "athlete",
      title: "Athlete",
      description: "Build your identity, find mentors, and earn before getting famous.",
      icon: User,
      badge: "Popular",
    },
    {
      id: "mentor",
      title: "Coach & Mentor",
      description: "Monetize your expertise, host sessions, and guide local rising stars.",
      icon: Trophy,
      badge: "Earn",
    },
    {
      id: "scout",
      title: "Scout / Academy",
      description: "Discover hyperlocal talent, track stats, and recruit top players.",
      icon: Compass,
    },
    {
      id: "organizer",
      title: "Tournament Organizer",
      description: "Manage registrations, generate fixtures, and secure local sponsorships.",
      icon: Calendar,
    },
  ];

  // Verify active user sessions natively on component initialization
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserSession(session);
        await routeUserToDashboard(session.user.id);
      }
    };
    checkUser();
  }, []);

  // Secure dashboard routing logic evaluating database state
  const routeUserToDashboard = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("ecosystem_role")
      .eq("id", userId)
      .single();

    if (data?.ecosystem_role) {
      // CRITICAL UPGRADE: Route directly to the Unified Platform Home Hub
      router.push("/home");
    } else {
      setNeedsOnboarding(true);
    }
  };

  // Unified submission handling across cloud authentication interfaces
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          setUserSession(data.session);
          setNeedsOnboarding(true);
        } else {
          setErrorMessage("Registration successful! Check your email inbox to verify your secure token.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
          setUserSession(data.session);
          await routeUserToDashboard(data.session.user.id);
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || "An error occurred during authentication processing.");
    } finally {
      setLoading(false);
    }
  };

  // Commit dynamic user names alongside their base ecosystem roles
  const handleRoleLockIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSession?.user?.id) return;
    setLoading(true);
    setErrorMessage("");

    try {
      const fallbackName = userSession.user.email?.split("@")[0] || "Athlete";
      const cleanName = fullName.trim() !== "" ? fullName : fallbackName;

      const { error } = await supabase
        .from("profiles")
        .insert([
          { 
            id: userSession.user.id, 
            email: userSession.user.email,
            name: cleanName,
            ecosystem_role: selectedRole 
          }
        ]);

      if (error) throw error;
      
      // Route newly onboarded profiles straight to the common homepage
      router.push("/home");
    } catch (error: any) {
      setErrorMessage("Could not finalize your identity profile. Please attempt submission again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d10] text-slate-100 flex flex-col justify-between relative selection:bg-emerald-500 selection:text-black">
      {/* Decorative Background Lighting Layouts */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Global Application Nav Header */}
      <header className="border-b border-slate-800/80 bg-[#080d10]/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-black text-xl tracking-tighter">
              PI
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-white">Played</span>
              <span className="text-emerald-400 font-extrabold text-2xl tracking-tight">In</span>
              <span className="text-xs block text-slate-500 tracking-widest uppercase font-semibold">Sports OS</span>
            </div>
          </div>
          
          {!userSession && (
            <button 
              onClick={() => { setShowAuthForm(true); setIsSignUp(false); }}
              className="px-5 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-sm font-semibold transition-all cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Primary Grid Workspace */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Value Proposition Messaging */}
        <motion.div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" /> Empowering Grassroots Sports
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Athletes should <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">earn before</span> <br />
            they become famous.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
            The complete ecosystem for local athletes, coaches, and organizers. Build your digital sports identity, book mentorships, and unlock hyperlocal sponsorships today.
          </p>
        </motion.div>

        {/* Dynamic Interactive Portal Engine */}
        <motion.div className="lg:col-span-6">
          <div className="bg-[#0c1419] border border-slate-800/80 rounded-3xl p-6 sm:p-8 glow-emerald relative">
            
            {/* STAGE 1: Unauthenticated Home View */}
            {!userSession && !showAuthForm && (
              <div className="space-y-4">
                <div className="mb-2">
                  <h3 className="text-xl font-bold text-white">Get Started</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Initialize an account to manage custom sports network workflows</p>
                </div>
                <button 
                  onClick={() => { setShowAuthForm(true); setIsSignUp(true); }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold transition-all cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                >
                  Create Free Account <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button 
                  onClick={() => { setShowAuthForm(true); setIsSignUp(false); }}
                  className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold text-sm border border-slate-700 hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Log In with Existing Account
                </button>
              </div>
            )}

            {/* STAGE 2: Interactive Authorization Inputs */}
            {!userSession && showAuthForm && (
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-white">{isSignUp ? "Create Account" : "Welcome Back"}</h3>
                  <button 
                    type="button" 
                    onClick={() => setShowAuthForm(false)} 
                    className="text-xs text-slate-500 hover:text-white"
                  >
                    ← Back Options
                  </button>
                </div>
                {errorMessage && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">{errorMessage}</div>}
                
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-semibold">Email Address</label>
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#080d10] border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500" 
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-semibold">Password</label>
                  <input 
                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#080d10] border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500" 
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold rounded-xl mt-2 cursor-pointer transition-all">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isSignUp ? "Sign Up" : "Log In")}
                </button>
              </form>
            )}

            {/* STAGE 3: Persistent Identity Selection & Display Name Registration */}
            {userSession && needsOnboarding && (
              <form onSubmit={handleRoleLockIn} className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Account Token Issued
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">Configure Identity Matrix</h3>
                </div>
                {errorMessage && <div className="p-3 bg-red-500/10 text-red-400 text-xs rounded-lg">{errorMessage}</div>}
                
                <div>
                  <label className="text-xs font-bold text-emerald-400 block mb-1 uppercase tracking-wider">
                    Profile Display Name
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Aarav Shetty"
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#080d10] border border-emerald-500/40 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-400" 
                  />
                  <p className="text-[10px] text-slate-500 mt-1">This display signature will render publicly on scouting charts.</p>
                </div>

                <label className="text-xs text-slate-400 block pt-1 font-semibold">Select Ecosystem Framework:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roles.map((role) => {
                    const IconComponent = role.icon;
                    return (
                      <button
                        key={role.id} type="button" onClick={() => setSelectedRole(role.id)}
                        className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[90px] ${selectedRole === role.id ? "bg-emerald-500/10 border-emerald-500" : "bg-[#111a20] border-slate-800"}`}
                      >
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4 text-emerald-400" />
                          <h4 className="font-bold text-white text-xs">{role.title}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{role.description}</p>
                      </button>
                    );
                  })}
                </div>

                <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold rounded-xl mt-4 cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Commit Profile Identity"} <Lock className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

          </div>
        </motion.div>
      </main>
    </div>
  );
}