"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, Lightbulb, Calendar, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { ExportMenu } from "@/components/chat/export-menu";

interface DiagnosisCardProps {
  diagnosis: {
    whats_working?: string[];
    whats_not?: string[];
    content_gaps?: string[];
    improvement_plan_7d?: Array<{
      day: string;
      focus: string;
      action: string;
    }>;
  };
  exports?: Record<string, string>;
  optimizedPosts?: Record<string, string>;
}

export function DiagnosisCard({ diagnosis, exports, optimizedPosts }: DiagnosisCardProps) {
  const [isPlanExpanded, setIsPlanExpanded] = useState(true);

  if (!diagnosis) return null;

  const whatsWorking = diagnosis.whats_working || [];
  const whatsNot = diagnosis.whats_not || [];
  const contentGaps = diagnosis.content_gaps || [];
  const plan = diagnosis.improvement_plan_7d || [];

  return (
    <div className="my-4 rounded-xl border border-purple-500/30 bg-gradient-to-br from-card via-card/90 to-purple-950/10 p-4 sm:p-5 shadow-lg backdrop-blur-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">Content Audit & Growth Diagnosis</h3>
            <p className="text-[11px] text-muted-foreground">Actionable bottlenecks & platform optimization plan</p>
          </div>
        </div>
      </div>

      {/* Grid of Working / Not Working / Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* What's Working */}
        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>What's Working</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-foreground/90 leading-snug">
            {whatsWorking.length > 0 ? (
              whatsWorking.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-400">•</span>
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground italic">No key strengths detected.</li>
            )}
          </ul>
        </div>

        {/* What's Not Working */}
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Needs Improvement</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-foreground/90 leading-snug">
            {whatsNot.length > 0 ? (
              whatsNot.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-400">•</span>
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground italic">No critical bottlenecks found.</li>
            )}
          </ul>
        </div>

        {/* Content Gaps */}
        <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
            <Lightbulb className="w-4 h-4 shrink-0" />
            <span>Content Gaps & Angles</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-foreground/90 leading-snug">
            {contentGaps.length > 0 ? (
              contentGaps.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-purple-400">•</span>
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground italic">No missing angles identified.</li>
            )}
          </ul>
        </div>
      </div>

      {/* 7-Day Improvement Plan Accordion */}
      {plan.length > 0 && (
        <div className="border border-border/50 rounded-xl bg-background/40 overflow-hidden">
          <button
            onClick={() => setIsPlanExpanded(!isPlanExpanded)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-foreground hover:bg-accent/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>7-Day Growth Action Plan</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-mono">
                {plan.length} Steps
              </span>
            </div>
            {isPlanExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>

          {isPlanExpanded && (
            <div className="p-3 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plan.map((step, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-border/40 bg-card/60 flex items-start gap-2.5"
                >
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono shrink-0">
                    {step.day || `Day ${idx + 1}`}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">
                      {step.focus}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                      {step.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Export Options */}
      <ExportMenu exports={exports} posts={optimizedPosts} title="Export Audit Report" />
    </div>
  );
}
