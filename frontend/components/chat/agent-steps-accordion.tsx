"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Clock, Sparkles, Cpu, Layers } from "lucide-react";
import { AgentStep } from "@/types/chat";

interface AgentStepsAccordionProps {
  steps: AgentStep[];
}

export function AgentStepsAccordion({ steps }: AgentStepsAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!steps || steps.length === 0) return null;

  const totalDuration = steps.reduce((acc, step) => acc + (step.execution_time_ms || 0), 0);

  const getAgentColor = (agent: string) => {
    const name = agent.toLowerCase();
    if (name.includes("supervisor")) return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    if (name.includes("research")) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (name.includes("write") || name.includes("editor")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (name.includes("optimiz") || name.includes("strateg")) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  return (
    <div className="my-3 rounded-xl border border-border/60 bg-card/40 overflow-hidden text-xs transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-accent/40 transition-colors text-left font-medium text-muted-foreground hover:text-foreground"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-purple-500/10 text-purple-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span>Claire Execution Graph</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-accent text-muted-foreground">
            {steps.length} {steps.length === 1 ? "agent step" : "agent steps"}
          </span>
          {totalDuration > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
              <Clock className="w-3 h-3" />
              {totalDuration}ms
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 border-t border-border/40 space-y-2 bg-background/40 backdrop-blur-sm">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-card/60 border border-border/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.2 text-[10px] font-mono rounded border uppercase ${getAgentColor(step.agent)}`}>
                      {step.agent}
                    </span>
                    <span className="font-medium text-foreground truncate">{step.step}</span>
                  </div>
                  {step.execution_time_ms && (
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      {step.execution_time_ms}ms
                    </span>
                  )}
                </div>
                {step.details && (
                  <p className="text-[11px] text-muted-foreground leading-normal font-sans">
                    {step.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
