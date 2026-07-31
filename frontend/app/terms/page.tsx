"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0A0D14] text-foreground font-sans selection:bg-purple-500/30 selection:text-purple-200 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background ambient blurs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-900/15 rounded-full blur-[140px]" />
        <div className="absolute top-[50%] -right-[10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]" />
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
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Terms of Service
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
              Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or using Claire AI (&quot;the Service&quot;), including any associated APIs, user interfaces, or agent orchestration features, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-xs">02.</span>
              Description of Service
            </h2>
            <p>
              Claire AI provides an autonomous, multi-agent AI social media orchestration suite. The system utilizes specialized LLM agents (Strategist, Researcher, Writer, Optimizer) to generate social content, brand voice profiles, content calendars, and social media analytics support. Service access is available via Email/Password authentication or Guest Demo mode.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-xs">03.</span>
              User Accounts & Security
            </h2>
            <p>
              When you register an account with Claire AI, you are responsible for maintaining the confidentiality of your account credentials, password, and session access. You agree to accept full responsibility for all activities and content generated under your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-xs">04.</span>
              Acceptable Use Policy
            </h2>
            <p>
              You agree not to use Claire AI to generate, schedule, or distribute:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-neutral-400 text-xs sm:text-sm">
              <li>Harmful, deceptive, fraudulent, or illegal content.</li>
              <li>Spam, automated abuse, or content violating platform policies (X, LinkedIn, Meta, TikTok).</li>
              <li>Infringing material violating intellectual property or copyright laws.</li>
              <li>Malicious prompts designed to exploit or compromise underlying AI infrastructure.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-xs">05.</span>
              Intellectual Property & Content Ownership
            </h2>
            <p>
              You retain full ownership of all prompts, brand profiles, and custom parameters you input into Claire AI. All output content generated specifically for your brand profile remains yours to publish, edit, and commercialize without limitation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-xs">06.</span>
              Limitation of Liability
            </h2>
            <p>
              Claire AI provides AI-assisted content generation &quot;as is&quot; without warranties of any kind. AI models may occasionally produce unexpected or inaccurate formatting. Users are advised to review and verify all generated content prior to public posting.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-xs">07.</span>
              Contact Information
            </h2>
            <p>
              For questions regarding these Terms of Service, please contact our support team at{" "}
              <a href="mailto:support@claire.ai" className="text-purple-400 hover:underline">
                support@claire.ai
              </a>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Claire AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-neutral-300 transition">
              Privacy Policy
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
