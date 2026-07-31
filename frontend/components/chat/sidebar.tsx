"use client";

import { MessageSquare, Plus, Sparkles, Settings, Trash2, Layers, Compass, Zap, Search, FileEdit, Calendar, X, Loader2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@/context/chat-context";
import { BrandSelector } from "@/components/chat/brand-selector";
import { Mode } from "@/types/chat";

function BackendFooterStatus() {
  const { backendStatus } = useChat();

  const labels = {
    checking: "Connecting to backend…",
    online: "Backend connected",
    warming: "Server waking up…",
    offline: "Backend unreachable",
  } as const;

  const dotColors = {
    checking: "bg-amber-400 animate-pulse",
    online: "bg-emerald-400",
    warming: "bg-amber-400 animate-pulse",
    offline: "bg-rose-400",
  } as const;

  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${dotColors[backendStatus.status]}`} />
      <span className="text-[11px] font-medium text-foreground/80">{labels[backendStatus.status]}</span>
      {(backendStatus.status === "checking" || backendStatus.status === "warming") && (
        <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
      )}
      {backendStatus.status === "offline" && <WifiOff className="w-3 h-3 text-rose-400" />}
    </div>
  );
}

export function Sidebar() {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    selectedBrandId,
    setSelectedBrandId,
    selectedMode,
    setSelectedMode,
    selectedPlatforms,
    togglePlatform,
    createNewConversation,
    deleteConversation,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useChat();

  const modes: { id: Mode; label: string; icon: any; description: string }[] = [
    { id: "auto", label: "Auto Orchestrate", icon: Zap, description: "Smart Multi-Agent Workflow" },
    { id: "create", label: "Create Content", icon: Sparkles, description: "Draft Posts & Threads" },
    { id: "optimize", label: "Optimize Existing", icon: FileEdit, description: "Refine Hooks & Virality" },
    { id: "research", label: "Deep Research", icon: Search, description: "Analyze Market Trends" },
    { id: "calendar", label: "Content Calendar", icon: Calendar, description: "Plan & Schedule Posts" },
  ];

  const availablePlatforms = [
    { id: "x", label: "X / Twitter", badge: "280c" },
    { id: "linkedin", label: "LinkedIn", badge: "B2B" },
    { id: "instagram", label: "Instagram", badge: "Visual" },
    { id: "tiktok", label: "TikTok", badge: "Video" },
    { id: "threads", label: "Threads", badge: "Social" },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 border-r border-border/60 bg-card/95 backdrop-blur-xl flex flex-col h-full select-none transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header Branding */}
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground tracking-tight text-sm">Claire</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-purple-500/30 text-purple-300 bg-purple-500/10 font-mono">
                  Pro AI
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground font-sans">Multi-Agent Social Engine</p>
            </div>
          </div>

          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Action */}
        <div className="p-3">
          <Button
            onClick={() => {
              createNewConversation();
              if (typeof window !== "undefined" && window.innerWidth < 1024) setIsMobileSidebarOpen(false);
            }}
            className="w-full justify-start gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs rounded-xl shadow-md shadow-purple-500/20 py-2.5"
          >
            <Plus className="w-4 h-4" />
            New Campaign Strategy
          </Button>
        </div>

        {/* Brand Selector Section */}
        <div className="px-3 py-2 space-y-1">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase px-1 tracking-wider">
            Brand Context
          </div>
          <BrandSelector selectedBrandId={selectedBrandId} onSelectBrand={setSelectedBrandId} />
        </div>

        {/* Mode Switcher */}
        <div className="px-3 py-2 space-y-1 border-t border-border/40 my-1">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase px-1 tracking-wider">
            Agent Mode
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {modes.map((m) => {
              const Icon = m.icon;
              const isSelected = selectedMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMode(m.id)}
                  className={`flex flex-col items-start p-2 rounded-xl text-left border transition-all ${
                    isSelected
                      ? "bg-purple-500/15 border-purple-500/40 text-purple-200 shadow-sm"
                      : "bg-card/40 border-border/30 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-purple-400" : "text-muted-foreground"}`} />
                    <span className="text-[11px] font-medium leading-none">{m.label.split(" ")[0]}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground/80 line-clamp-1">{m.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Platforms Toggle */}
        <div className="px-3 py-2 space-y-1.5 border-t border-border/40">
          <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground uppercase px-1 tracking-wider">
            <span>Target Channels</span>
            <span className="text-purple-400 font-mono text-[9px] lowercase">
              {selectedPlatforms.length} active
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {availablePlatforms.map((p) => {
              const isSelected = selectedPlatforms.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    isSelected
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "bg-accent/40 text-muted-foreground/60 border border-transparent hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Conversations Scroll */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 border-t border-border/40 mt-1">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase px-1 tracking-wider">
            Conversations
          </div>
          {conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <div
                key={conv.id}
                className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all ${
                  isActive
                    ? "bg-accent text-foreground font-medium border border-border/60 shadow-sm"
                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                }`}
              >
                <button
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    if (typeof window !== "undefined" && window.innerWidth < 1024) setIsMobileSidebarOpen(false);
                  }}
                  className="flex items-center gap-2 truncate flex-1 text-left"
                >
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-purple-400" : "opacity-60"}`} />
                  <span className="truncate">{conv.title}</span>
                </button>

                {conversations.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity rounded"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-border/50 bg-background/30 flex items-center justify-between text-xs text-muted-foreground">
          <BackendFooterStatus />
          <span className="text-[10px] font-mono text-muted-foreground/60">v1.2.0</span>
        </div>
      </aside>
    </>
  );
}
