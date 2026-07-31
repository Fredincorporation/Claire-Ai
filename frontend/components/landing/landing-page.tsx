"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Zap,
  TrendingUp,
  Rocket,
  BrainCircuit,
  Bot,
  MessageSquare,
  Calendar,
  Mic,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Globe,
  Layers,
  Star,
  Users,
} from "lucide-react";

interface LandingPageProps {
  onLaunchApp: () => void;
}

export function LandingPage({ onLaunchApp }: LandingPageProps) {
  const { user, setIsAuthModalOpen } = useAuth();
  const [activeAudience, setActiveAudience] = useState<"optimize" | "full" | "zero">("optimize");

  const handlePrimaryCTA = () => {
    onLaunchApp();
  };

  const handleSignInCTA = () => {
    if (user) {
      onLaunchApp();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-foreground font-sans selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background Subtle Gradient Blurs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-900/15 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px]" />
        <div className="absolute top-[70%] -right-[10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <header className="py-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-neutral-200 to-purple-300 bg-clip-text text-transparent">
                Claire AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleSignInCTA}
              className="text-xs text-neutral-300 hover:text-white hover:bg-white/5"
            >
              {user ? `Account (${user.email?.split("@")[0]})` : "Sign In"}
            </Button>
            <Button
              onClick={handlePrimaryCTA}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-md shadow-purple-600/20"
            >
              Launch Workspace
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-16 pb-20 text-center flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-8 animate-in fade-in duration-500">
            <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>Autonomous Multi-Agent Social Media Infrastructure</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
            The Autonomous AI <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-300 bg-clip-text text-transparent">
              Social Media Manager
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Claire coordinates an autonomous team of specialized AI agents—Strategist, Researcher, Copywriter, and Optimizer—to craft, refine, and schedule high-impact posts across X, LinkedIn, Instagram, TikTok & Threads.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button
              onClick={handlePrimaryCTA}
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm px-8 py-3.5 rounded-xl shadow-xl shadow-purple-600/25 flex items-center justify-center gap-2 group transition"
            >
              <span>Try Claire Live Demo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => setIsAuthModalOpen(true)}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-white/10 bg-white/[0.02] hover:bg-white/[0.08] text-neutral-200 text-sm px-6 py-3.5 rounded-xl font-medium"
            >
              Sign Up / Authenticate
            </Button>
          </div>

          {/* Social Proof / Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 border-t border-white/5 pt-8 w-full max-w-3xl">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Multi-User Supabase Auth</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Sub-second Groq Inference</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Multi-Platform Native Specs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-pink-400" />
              <span>Voice-First Command Engine</span>
            </div>
          </div>
        </section>

        {/* 3 Audience Selector Section */}
        <section className="py-16 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Built specifically for your stage
            </h2>
            <p className="text-sm text-neutral-400 max-w-xl mx-auto">
              Select your primary goal to see how Claire&apos;s agent squad accelerates your social growth.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-3xl mx-auto p-1.5 bg-white/[0.03] border border-white/5 rounded-2xl">
            <button
              onClick={() => setActiveAudience("optimize")}
              className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 ${
                activeAudience === "optimize"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>1. Optimize Existing Accounts</span>
            </button>

            <button
              onClick={() => setActiveAudience("full")}
              className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 ${
                activeAudience === "full"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Bot className="w-4 h-4 shrink-0" />
              <span>2. Full AI Social Manager</span>
            </button>

            <button
              onClick={() => setActiveAudience("zero")}
              className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 ${
                activeAudience === "zero"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Rocket className="w-4 h-4 shrink-0" />
              <span>3. Starting From Zero</span>
            </button>
          </div>

          {/* Audience Active Details Card */}
          <div className="max-w-4xl mx-auto bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
            {activeAudience === "optimize" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 mb-2">
                      Account Growth & Audit
                    </Badge>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      Deep Account Diagnostics & Hook Refactoring
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
                      Already active on social media? Claire analyzes existing post performance, identifies missing hooks, corrects tone misalignments, and transforms weak posts into high-engagement viral formats.
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-emerald-400 shrink-0 hidden sm:block" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="font-semibold text-xs text-purple-300 mb-1">Instant Audit</p>
                    <p className="text-[11px] text-neutral-400">Pastes existing draft and outputs concrete 1-10 quality ratings & fixes.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="font-semibold text-xs text-purple-300 mb-1">Platform Tailoring</p>
                    <p className="text-[11px] text-neutral-400">Removes Twitter hashtags on LinkedIn and adapts hook length for Threads.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="font-semibold text-xs text-purple-300 mb-1">Voice Matching</p>
                    <p className="text-[11px] text-neutral-400">Guarantees all output matches your registered Brand Voice guidelines.</p>
                  </div>
                </div>
              </div>
            )}

            {activeAudience === "full" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge className="bg-purple-500/10 border-purple-500/20 text-purple-400 mb-2">
                      Autonomous Multi-Agent Team
                    </Badge>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      End-to-End Hands-Free Social Media Department
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
                      Replace fragmented single-prompt AI tools. Claire operates as a coordinated 5-agent team: Supervisor routes, Researcher gathers trends, Strategist plans calendar, Writer crafts posts, and Optimizer validates specs.
                    </p>
                  </div>
                  <Bot className="w-10 h-10 text-purple-400 shrink-0 hidden sm:block" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="font-semibold text-xs text-purple-300 mb-1">Visual Content Calendar</p>
                    <p className="text-[11px] text-neutral-400">Generates 7-day to 30-day structured calendars with time-based slots.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="font-semibold text-xs text-purple-300 mb-1">Voice Command Input</p>
                    <p className="text-[11px] text-neutral-400">Speak raw ideas or audio memos and let Claire transcribe and structure them.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="font-semibold text-xs text-purple-300 mb-1">Cloudflare AI Images</p>
                    <p className="text-[11px] text-neutral-400">Automatic generation of platform-sized visuals and graphics.</p>
                  </div>
                </div>
              </div>
            )}

            {activeAudience === "zero" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge className="bg-pink-500/10 border-pink-500/20 text-pink-400 mb-2">
                      New Creator Launchpad
                    </Badge>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      Zero to 10k Growth Blueprint & Brand Kit
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
                      Starting a fresh personal brand, product account, or startup channel from scratch? Claire establishes your core brand pillars, target audience profile, and initial 30-day content pipeline.
                    </p>
                  </div>
                  <Rocket className="w-10 h-10 text-pink-400 shrink-0 hidden sm:block" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="font-semibold text-xs text-purple-300 mb-1">Brand Voice Editor</p>
                    <p className="text-[11px] text-neutral-400">Defines tone, target audience, style guidelines, and negative keywords.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="font-semibold text-xs text-purple-300 mb-1">Niche Positioning</p>
                    <p className="text-[11px] text-neutral-400">Finds untapped content pillars and high-converting topic angles.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="font-semibold text-xs text-purple-300 mb-1">1-Click Multi-Export</p>
                    <p className="text-[11px] text-neutral-400">Download formatted Markdown, JSON, and CSV for scheduling tools.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-16 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Powering modern social teams
            </h2>
            <p className="text-sm text-neutral-400 max-w-xl mx-auto">
              Everything required to manage high-volume social output without sacrificing quality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-white mb-2">5-Agent Orchestration</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Supervised workflow ensures no single LLM hallucinates specs or outputs generic advice.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Mic className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-white mb-2">Voice-First Experience</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Powered by Groq Whisper for near-instant transcription of voice memos and brainstorming.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-white mb-2">Visual Content Calendar</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Structured multi-platform schedule view with direct copy and export options.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Footer Banner */}
        <section className="my-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-purple-900/30 border border-purple-500/20 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Ready to automate your social presence?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 mb-8">
              Start creating multi-platform content in seconds with Claire AI.
            </p>
            <Button
              onClick={handlePrimaryCTA}
              size="lg"
              className="bg-white text-neutral-950 hover:bg-neutral-100 font-bold text-sm px-8 py-3.5 rounded-xl shadow-xl"
            >
              Open Claire Workspace Now
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-white/5 text-center text-xs text-neutral-500 mt-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Claire AI Social Media Manager.</p>
          <div className="flex items-center gap-4">
            <span className="text-neutral-400">Fast Groq Engine</span>
            <span>•</span>
            <span className="text-neutral-400">Supabase Persistent Storage</span>
            <span>•</span>
            <span className="text-neutral-400">Cloudflare Workers AI</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
