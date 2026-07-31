"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Image as ImageIcon,
  Calendar,
  BarChart3,
  Bot,
  User,
  ArrowUpRight,
  AlertTriangle,
  RefreshCw,
  Zap,
  Mic,
  CheckCircle2,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@/context/chat-context";
import { AgentStepsAccordion } from "@/components/chat/agent-steps-accordion";
import { PlatformPostCards } from "@/components/chat/platform-post-cards";
import { ImagePromptCard } from "@/components/chat/image-prompt-card";
import { VoiceRecorderButton } from "@/components/chat/voice-recorder-button";

export function ChatInterface() {
  const {
    messages,
    isLoading,
    sendMessage,
    sendVoiceMessage,
    executeAction,
    apiError,
    clearApiError,
    selectedPlatforms,
    selectedMode,
  } = useChat();

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;
    setInputMessage("");
    await sendMessage(text);
  };

  const handleVoiceRecorded = async (blob: Blob) => {
    await sendVoiceMessage(blob);
  };

  const suggestedPrompts = [
    {
      title: "Viral X Thread & LinkedIn Strategy",
      prompt: "Draft a 5-part X thread and a polished LinkedIn post about our new AI social media manager launch.",
      icon: Sparkles,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Instagram Carousel & Visual Prompts",
      prompt: "Create an Instagram Carousel script with 4 slides on '5 Social Media Metrics That Actually Matter' plus image prompts.",
      icon: ImageIcon,
      color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    },
    {
      title: "Content Calendar & Weekly Schedule",
      prompt: "Generate a full 7-day multi-channel content calendar for a B2B SaaS startup with high-converting hooks.",
      icon: Calendar,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Optimize Existing Post Virality",
      prompt: "Optimize this hook for max engagement: 'We launched our new product today and here is what happened...'",
      icon: BarChart3,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Background Accent Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-[350px] h-[350px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Backend API Error Banner */}
      {apiError && (
        <div className="bg-rose-950/80 border-b border-rose-500/40 px-4 py-2 text-xs text-rose-200 flex items-center justify-between z-20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{apiError}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearApiError}
            className="h-6 text-[10px] text-rose-300 hover:text-rose-100 hover:bg-rose-900/50"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Messages Scroll Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full">
        {messages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${isUser ? "flex-row-reverse" : "flex-row"} group`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-md ${
                  isUser
                    ? "bg-secondary text-foreground border border-border/80"
                    : "bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-500/20"
                }`}
              >
                {isUser ? (
                  <User className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Message Box */}
              <div className={`max-w-[85%] sm:max-w-[80%] space-y-2`}>
                <div
                  className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
                      : "bg-card border border-border/60 text-foreground rounded-tl-none shadow-sm backdrop-blur-sm"
                  } ${msg.error ? "border-rose-500/40 bg-rose-950/20" : ""}`}
                >
                  {/* Voice Transcription Tag */}
                  {msg.transcription && (
                    <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      <Mic className="w-3 h-3 text-purple-400" />
                      <span>Transcribed Voice Input</span>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                  {/* Render Agent Execution Steps */}
                  {msg.agentSteps && msg.agentSteps.length > 0 && (
                    <AgentStepsAccordion steps={msg.agentSteps} />
                  )}

                  {/* Render Platform Specific Posts */}
                  {msg.platformPosts && Object.keys(msg.platformPosts).length > 0 && (
                    <PlatformPostCards posts={msg.platformPosts} />
                  )}

                  {/* Render Image Prompts */}
                  {msg.imagePrompts && msg.imagePrompts.length > 0 && (
                    <ImagePromptCard prompts={msg.imagePrompts} />
                  )}

                  {/* Render Quick Actions */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/40 flex flex-wrap gap-2">
                      {msg.actions.map((act, idx) => (
                        <Button
                          key={idx}
                          size="sm"
                          variant="outline"
                          onClick={() => executeAction(act)}
                          className="h-7 px-2.5 text-xs bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-200 rounded-lg flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3 text-purple-400" />
                          <span>{act.label}</span>
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp & Agent info */}
                  <div
                    className={`text-[10px] mt-2 opacity-60 flex items-center justify-between ${
                      isUser ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    <span>
                      {!isUser && msg.agentName && (
                        <span className="font-mono text-[9px] text-purple-400/90 mr-1.5">
                          [{msg.agentName}]
                        </span>
                      )}
                    </span>
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-purple-500/20">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-card border border-border/60 rounded-2xl rounded-tl-none p-4 text-xs text-muted-foreground flex items-center gap-3 backdrop-blur-sm">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce delay-150" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce delay-300" />
              </div>
              <span className="font-medium text-foreground">
                Claire multi-agent orchestrator is researching & generating content...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Empty State / Suggested Prompt Cards */}
      {messages.length <= 1 && (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 mb-3">
          <div className="text-xs text-muted-foreground mb-2.5 flex items-center justify-between font-medium">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Suggested Strategy Prompts</span>
            </div>
            <span className="text-[10px] text-muted-foreground/60 font-mono">Click to launch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedPrompts.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleSend(item.prompt)}
                  className="flex items-start justify-between p-3 rounded-xl border border-border/50 bg-card/40 hover:bg-accent/60 hover:border-purple-500/40 transition-all text-left group"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 border ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-foreground font-semibold group-hover:text-purple-300 transition-colors truncate">
                        {item.title}
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5 font-sans">
                        {item.prompt}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors mt-0.5" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Bar & Controls */}
      <div className="p-3 sm:p-4 border-t border-border/60 bg-card/30 backdrop-blur-md shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-2 bg-background border border-border/80 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/30 rounded-2xl p-2 transition-all shadow-xl">
          {/* Voice Microphone Component */}
          <VoiceRecorderButton
            onAudioRecorded={handleVoiceRecorded}
            disabled={isLoading}
          />

          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask Claire to write posts, analyze strategy, create visual prompts..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-xs sm:text-sm placeholder:text-muted-foreground/60"
          />

          <Button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
            className="rounded-xl shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Input Bar Footer Details */}
        <div className="max-w-4xl mx-auto flex items-center justify-between text-[10px] text-muted-foreground/70 mt-2 px-2">
          <div className="flex items-center gap-2">
            <span>Mode: <strong className="text-foreground capitalize">{selectedMode}</strong></span>
            <span>•</span>
            <span>Channels: <strong className="text-foreground">{selectedPlatforms.length} selected</strong></span>
          </div>
          <span className="hidden sm:inline">Press Enter to send</span>
        </div>
      </div>
    </div>
  );
}
