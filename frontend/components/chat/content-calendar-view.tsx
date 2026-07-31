"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Copy, Check, Sparkles, Image as ImageIcon, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExportMenu } from "@/components/chat/export-menu";

export interface CalendarItem {
  day_number?: number;
  day_label?: string;
  platform?: string;
  theme?: string;
  post_content?: string;
  best_time?: string;
  image_prompt?: string;
}

interface ContentCalendarViewProps {
  calendar: CalendarItem[];
  exports?: Record<string, string>;
}

const PLATFORM_COLORS: Record<string, string> = {
  x: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  twitter: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  linkedin: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  instagram: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  tiktok: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  threads: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

export function ContentCalendarView({ calendar, exports }: ContentCalendarViewProps) {
  const [timeframe, setTimeframe] = useState<"week" | "month">("week");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (!calendar || calendar.length === 0) return null;

  const displayCalendar = timeframe === "week" ? calendar.slice(0, 7) : calendar;

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="my-4 rounded-xl border border-purple-500/30 bg-gradient-to-br from-card via-card/95 to-indigo-950/10 p-4 sm:p-5 shadow-lg backdrop-blur-sm space-y-4">
      {/* Header & Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              Content Calendar Schedule
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-indigo-500/30 text-indigo-300 bg-indigo-500/10">
                {displayCalendar.length} Scheduled Posts
              </Badge>
            </h3>
            <p className="text-[11px] text-muted-foreground">Multi-channel posting plan with optimal times and themes</p>
          </div>
        </div>

        {/* Timeframe & View Toggles */}
        <div className="flex items-center gap-2">
          {/* Week / Month Toggle */}
          <div className="flex items-center bg-background/60 border border-border/50 rounded-lg p-0.5">
            <button
              onClick={() => setTimeframe("week")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${timeframe === "week"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Week View (7D)
            </button>
            <button
              onClick={() => setTimeframe("month")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${timeframe === "month"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Full Schedule ({calendar.length}D)
            </button>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-background/60 border border-border/50 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded text-xs transition-colors ${viewMode === "grid" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded text-xs transition-colors ${viewMode === "list" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              title="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Items Container */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" : "space-y-3"}>
        {displayCalendar.map((item, idx) => {
          const dayLabel = item.day_label || `Day ${item.day_number || idx + 1}`;
          const plat = (item.platform || "x").toLowerCase();
          const platBadgeClass = PLATFORM_COLORS[plat] || "bg-primary/20 text-primary border-primary/30";
          const theme = item.theme || "Pillar Strategy";
          const content = item.post_content || "";
          const time = item.best_time || "09:00 AM EST";

          return (
            <div
              key={idx}
              className="rounded-xl border border-border/60 bg-card/60 p-3.5 shadow-sm backdrop-blur-sm flex flex-col justify-between hover:border-indigo-500/30 transition-all"
            >
              <div>
                {/* Day Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-foreground bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      {dayLabel}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${platBadgeClass}`}>
                      {plat}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(content, idx)}
                    className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    {copiedIdx === idx ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Check className="w-3 h-3" /> Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy className="w-3 h-3" /> Copy
                      </span>
                    )}
                  </Button>
                </div>

                {/* Theme & Posting Time */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                  <span className="flex items-center gap-1 text-indigo-300 font-medium truncate">
                    <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                    {theme}
                  </span>
                  <span className="flex items-center gap-1 font-mono shrink-0">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    {time}
                  </span>
                </div>

                {/* Post Copy */}
                <div className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed bg-background/40 p-2.5 rounded-lg border border-border/30">
                  {content}
                </div>

                {/* Optional Image Prompt */}
                {item.image_prompt && (
                  <div className="mt-2 text-[10px] text-muted-foreground italic bg-purple-950/20 p-2 rounded border border-purple-500/20 flex items-start gap-1.5">
                    <ImageIcon className="w-3 h-3 text-purple-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">Prompt: {item.image_prompt}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Export Menu */}
      <ExportMenu exports={exports} title="Export Calendar" />
    </div>
  );
}
