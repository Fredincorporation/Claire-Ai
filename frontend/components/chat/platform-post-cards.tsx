"use client";

import { useState } from "react";
import { Check, Copy, Share2, Sparkles, LayoutGrid, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PlatformPostCardsProps {
  posts: Record<string, string>;
}

const PLATFORM_CONFIG: Record<
  string,
  { name: string; maxChars: number; color: string; badgeBg: string; icon: string }
> = {
  x: {
    name: "X / Twitter",
    maxChars: 280,
    color: "border-sky-500/30 text-sky-400 bg-sky-500/10",
    badgeBg: "bg-sky-500/20 text-sky-300",
    icon: "𝕏",
  },
  twitter: {
    name: "X / Twitter",
    maxChars: 280,
    color: "border-sky-500/30 text-sky-400 bg-sky-500/10",
    badgeBg: "bg-sky-500/20 text-sky-300",
    icon: "𝕏",
  },
  linkedin: {
    name: "LinkedIn",
    maxChars: 3000,
    color: "border-blue-500/30 text-blue-400 bg-blue-500/10",
    badgeBg: "bg-blue-500/20 text-blue-300",
    icon: "in",
  },
  instagram: {
    name: "Instagram",
    maxChars: 2200,
    color: "border-pink-500/30 text-pink-400 bg-pink-500/10",
    badgeBg: "bg-pink-500/20 text-pink-300",
    icon: "📸",
  },
  tiktok: {
    name: "TikTok",
    maxChars: 4000,
    color: "border-purple-500/30 text-purple-400 bg-purple-500/10",
    badgeBg: "bg-purple-500/20 text-purple-300",
    icon: "🎵",
  },
  threads: {
    name: "Threads",
    maxChars: 500,
    color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    badgeBg: "bg-emerald-500/20 text-emerald-300",
    icon: "@",
  },
};

export function PlatformPostCards({ posts }: PlatformPostCardsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(Object.keys(posts)[0] || "");
  const [viewMode, setViewMode] = useState<"tabs" | "grid">("tabs");

  if (!posts || Object.keys(posts).length === 0) return null;

  const platformKeys = Object.keys(posts);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderCard = (key: string, text: string) => {
    const config = PLATFORM_CONFIG[key.toLowerCase()] || {
      name: key.toUpperCase(),
      maxChars: 2000,
      color: "border-primary/30 text-primary bg-primary/10",
      badgeBg: "bg-primary/20 text-primary",
      icon: "📱",
    };

    const charCount = text.length;
    const isOverLimit = charCount > config.maxChars;

    return (
      <div
        key={key}
        className={`rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-sm flex flex-col justify-between transition-all hover:border-purple-500/30`}
      >
        <div>
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${config.color}`}>
                {config.icon}
              </span>
              <span className="font-semibold text-sm text-foreground">{config.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-mono ${isOverLimit ? "text-rose-400 font-bold" : "text-muted-foreground"
                  }`}
              >
                {charCount}/{config.maxChars}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(key, text)}
                className="h-7 px-2 text-xs flex items-center gap-1.5 hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                {copiedKey === key ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Post Content */}
          <div className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed font-sans">
            {text}
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-4 pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/20">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Formatted for {config.name}
          </span>
          <span className="text-[10px] text-muted-foreground/60 font-mono">Ready to publish</span>
        </div>
      </div>
    );
  };

  return (
    <div className="my-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Share2 className="w-4 h-4 text-purple-400" />
          <span>Platform-Optimized Content</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-purple-500/30 text-purple-300">
            {platformKeys.length} Platforms
          </Badge>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-card/60 border border-border/50 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("tabs")}
            className={`p-1 rounded text-xs transition-colors ${viewMode === "tabs" ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            title="Tab view"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1 rounded text-xs transition-colors ${viewMode === "grid" ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            title="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {viewMode === "tabs" ? (
        <div className="space-y-3">
          {/* Tab Selection buttons */}
          <div className="flex flex-wrap gap-1.5 border-b border-border/40 pb-2">
            {platformKeys.map((key) => {
              const conf = PLATFORM_CONFIG[key.toLowerCase()] || { name: key };
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${isActive
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm"
                      : "bg-card/40 text-muted-foreground border border-border/30 hover:bg-accent hover:text-foreground"
                    }`}
                >
                  <span>{conf.icon}</span>
                  <span>{conf.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Content */}
          {activeTab && posts[activeTab] && renderCard(activeTab, posts[activeTab])}
        </div>
      ) : (
        /* Grid view */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {platformKeys.map((key) => renderCard(key, posts[key]))}
        </div>
      )}
    </div>
  );
}
