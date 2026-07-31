"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Shield, Lock, Eye, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0A0D14] text-foreground font-sans selection:bg-purple-500/30 selection:text-purple-200 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background ambient blurs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-900/15 rounded-full blur-[140px]" />
        <div className="absolute top-[50%] -left-[10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Navigation back */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <Link href="/">
            <Button variant="ghost" className="text-xs text-neutral-400 hover:text-white flex items-center gap-2 pl-0">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Claire AI</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">Claire AI</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-4">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-neutral-400">
            Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-neutral-300 text-sm leading-relaxed bg-white/[0.02] border border-white/5 p-6 sm:p-10 rounded-2xl backdrop-blur-xl">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-xs">01.</span>
              Information We Collect
            </h2>
            <p>
              Claire AI respects user privacy and collects only the necessary data required to deliver personal multi-agent social media management features:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-neutral-400 text-xs sm:text-sm">
              <li><strong className="text-white">Account Information:</strong> Email address and encrypted password hash (when creating an account via Supabase Auth).</li>
              <li><strong className="text-white">Brand Profiles & Settings:</strong> Target audience, tone of voice, guidelines, and social pillars configured in the workspace.</li>
              <li><strong className="text-white">Conversation History:</strong> Prompts and generated content saved to deliver multi-turn agent memory.</li>
              <li><strong className="text-white">Technical Logs:</strong> Latency metrics, IP address, and browser headers required for rate-limiting and service health monitoring.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-xs">02.</span>
              How We Use Your Information
            </h2>
            <p>
              Your data is exclusively used to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-neutral-400 text-xs sm:text-sm">
              <li>Process content requests through our specialized agent architecture.</li>
              <li>Maintain user-scoped session state and isolate brand profiles across users.</li>
              <li>Enforce rate limits and protect against automated bot activity.</li>
              <li>Improve response latency and model performance.</li>
            </ul>
            <p className="text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl mt-2">
              🔒 We never sell, lease, or monetize user data or generated post content to third-party advertisers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-xs">03.</span>
              Third-Party Infrastructure & AI Services
            </h2>
            <p>
              Claire AI integrates secure, enterprise-grade cloud providers:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-neutral-400 text-xs sm:text-sm">
              <li><strong className="text-white">Supabase:</strong> For JWT authentication, PostgreSQL database storage, and Row Level Security (RLS).</li>
              <li><strong className="text-white">Groq AI:</strong> Ultra-fast inferencing engine for Llama 3.3 70B and Whisper voice transcription.</li>
              <li><strong className="text-white">Cloudflare:</strong> CDN security, edge optimization, and AI media services.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-xs">04.</span>
              Guest Mode Data Retention
            </h2>
            <p>
              For users operating in Guest / Demo mode, data is processed ephemerally in volatile memory or local browser session storage and is automatically discarded when sessions expire.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-xs">05.</span>
              Your Privacy Rights & Data Deletion
            </h2>
            <p>
              You may clear your active conversation history directly within the workspace at any time. Registered users may request full account deletion and data purge by contacting{" "}
              <a href="mailto:privacy@claire.ai" className="text-purple-400 hover:underline">
                privacy@claire.ai
              </a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-xs">06.</span>
              Contact Us
            </h2>
            <p>
              If you have any questions or concerns regarding our Privacy Policy or data security practices, reach out to us at{" "}
              <a href="mailto:privacy@claire.ai" className="text-purple-400 hover:underline">
                privacy@claire.ai
              </a>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Claire AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-neutral-300 transition">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/" className="hover:text-neutral-300 transition">
              Launch App
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
