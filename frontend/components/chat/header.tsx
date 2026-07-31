"use client";

import { Sparkles, Mic, Cpu, Menu, Trash2, Zap, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useChat } from "@/context/chat-context";
import { PRESET_BRANDS } from "@/components/chat/brand-selector";

export function Header() {
  const {
    setIsMobileSidebarOpen,
    selectedBrandId,
    selectedMode,
    clearCurrentConversation,
    messages,
  } = useChat();

  const activeBrand = PRESET_BRANDS.find((b) => b.id === selectedBrandId) || PRESET_BRANDS[0];

  return (
    <header className="h-14 border-b border-border/60 bg-card/40 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between shrink-0 select-none z-30">
      {/* Left: Mobile Toggle & Agent Status */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-purple-500/20">
              C
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-background rounded-full animate-pulse"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground tracking-tight">Claire AI</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-purple-500/30 text-purple-300 bg-purple-500/10">
                Supervisor
              </Badge>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Cpu className="w-3 h-3 text-purple-400" />
              <span>Llama 3.3 70B</span>
              <span className="text-muted-foreground/30">•</span>
              <Mic className="w-3 h-3 text-pink-400" />
              <span>Whisper Voice</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Active Brand & Mode Badge + Controls */}
      <div className="flex items-center gap-2.5">
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-border/50 bg-background/50">
            <span className="text-muted-foreground">Brand:</span>
            <span className="font-medium text-foreground">{activeBrand.name.split(" ")[0]}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300">
            <Zap className="w-3 h-3 text-purple-400" />
            <span className="capitalize font-medium">{selectedMode} Mode</span>
          </div>
        </div>

        {messages.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCurrentConversation}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Clear active chat history"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Clear Chat</span>
          </Button>
        )}

        <Avatar className="w-8 h-8 border border-border/60">
          <AvatarFallback className="text-xs font-semibold bg-purple-500/20 text-purple-300">
            ME
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
