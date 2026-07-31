"use client";

import { Mic, Cpu, Menu, Trash2, Zap, Wifi, WifiOff, Loader2, User as UserIcon, LogOut, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useChat } from "@/context/chat-context";
import { useAuth } from "@/context/auth-context";
import { PRESET_BRANDS } from "@/components/chat/brand-selector";
import { BackendConnectionStatus } from "@/hooks/use-backend-status";

const STATUS_CONFIG: Record<
  BackendConnectionStatus,
  { label: string; dotClass: string; textClass: string; icon: typeof Wifi }
> = {
  checking: {
    label: "Connecting…",
    dotClass: "bg-amber-400 animate-pulse",
    textClass: "text-amber-300/90",
    icon: Loader2,
  },
  online: {
    label: "Connected",
    dotClass: "bg-emerald-400",
    textClass: "text-emerald-300/90",
    icon: Wifi,
  },
  warming: {
    label: "Waking up server…",
    dotClass: "bg-amber-400 animate-pulse",
    textClass: "text-amber-300/90",
    icon: Loader2,
  },
  offline: {
    label: "Backend offline",
    dotClass: "bg-rose-400",
    textClass: "text-rose-300/90",
    icon: WifiOff,
  },
};

export function Header({ onShowLanding }: { onShowLanding?: () => void }) {
  const {
    setIsMobileSidebarOpen,
    selectedBrandId,
    selectedMode,
    clearCurrentConversation,
    messages,
    backendStatus,
  } = useChat();

  const { user, isGuest, setIsAuthModalOpen, signOut } = useAuth();

  const activeBrand = PRESET_BRANDS.find((b) => b.id === selectedBrandId) || PRESET_BRANDS[0];
  const conn = STATUS_CONFIG[backendStatus.status];
  const ConnIcon = conn.icon;

  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : "G";

  return (
    <>
      {/* Cold Start Banner if backend is warming up */}
      {backendStatus.status === "warming" && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-300 px-4 py-1.5 text-xs flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300 z-40">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400 shrink-0" />
          <span>⚡ Backend is waking up (Render cold-start ~15s)... First response may take a moment.</span>
        </div>
      )}

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
            <div className="relative cursor-pointer" onClick={onShowLanding}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-purple-500/20">
                C
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-background rounded-full ${conn.dotClass}`}
                title={conn.label}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  onClick={onShowLanding}
                  className="font-semibold text-sm text-foreground tracking-tight cursor-pointer hover:text-purple-300 transition"
                >
                  Claire AI
                </span>
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

        {/* Right: Connection status, Brand & Mode + Controls + Auth */}
        <div className="flex items-center gap-2.5">
          {onShowLanding && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowLanding}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              title="Return to Landing Page"
            >
              <Home className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">Landing</span>
            </Button>
          )}

          {/* Subtle backend connection / cold-start indicator */}
          <div
            className={`hidden sm:flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full border border-border/40 bg-background/40 ${conn.textClass}`}
            title={
              backendStatus.latencyMs != null
                ? `${conn.label} (${backendStatus.latencyMs}ms)`
                : conn.label
            }
          >
            <ConnIcon
              className={`w-3 h-3 shrink-0 ${
                backendStatus.status === "checking" || backendStatus.status === "warming"
                  ? "animate-spin"
                  : ""
              }`}
            />
            <span className="font-medium">{conn.label}</span>
            {backendStatus.status === "online" && backendStatus.latencyMs != null && (
              <span className="text-muted-foreground/50 font-mono">{backendStatus.latencyMs}ms</span>
            )}
          </div>

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
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}

          {/* User Auth controls */}
          {user ? (
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 border border-purple-500/40">
                <AvatarFallback className="text-xs font-semibold bg-purple-500/20 text-purple-300">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-rose-400"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAuthModalOpen(true)}
              className="h-8 text-xs border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300"
            >
              <UserIcon className="w-3.5 h-3.5 mr-1" />
              <span>{isGuest ? "Sign In" : "Account"}</span>
            </Button>
          )}
        </div>
      </header>
    </>
  );
}
