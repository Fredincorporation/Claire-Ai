"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  ArrowUpRight,
  AlertTriangle,
  Zap,
  Mic,
  Paperclip,
  FileText,
  X,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/context/chat-context";
import { AgentStepsAccordion } from "@/components/chat/agent-steps-accordion";
import { PlatformPostCards } from "@/components/chat/platform-post-cards";
import { ImagePromptCard } from "@/components/chat/image-prompt-card";
import { DiagnosisCard } from "@/components/chat/diagnosis-card";
import { ContentCalendarView } from "@/components/chat/content-calendar-view";
import { VoiceRecorderButton } from "@/components/chat/voice-recorder-button";
import { PROMPT_STARTERS, MODE_STARTER_LABELS } from "@/lib/prompt-starters";

interface AttachedFile {
  id: string;
  name: string;
  content: string;
  sizeFormatted: string;
}

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
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const sizeFormatted = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      reader.onload = (event) => {
        const content = event.target?.result as string || "";
        setAttachedFiles((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            content: content,
            sizeFormatted,
          },
        ]);
      };

      reader.readAsText(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSend = async (textToSend?: string) => {
    const baseText = textToSend || inputMessage;
    if ((!baseText.trim() && attachedFiles.length === 0) || isLoading) return;

    let finalPrompt = baseText;
    if (attachedFiles.length > 0) {
      const attachmentsText = attachedFiles
        .map((f) => `--- ATTACHED CONTENT (${f.name}) ---\n${f.content}`)
        .join("\n\n");
      finalPrompt = baseText
        ? `${baseText}\n\n${attachmentsText}`
        : `Please analyze and optimize the following content:\n\n${attachmentsText}`;
    }

    setInputMessage("");
    setAttachedFiles([]);
    await sendMessage(finalPrompt);
  };

  const handleVoiceRecorded = async (blob: Blob) => {
    await sendVoiceMessage(blob);
  };

  const suggestedPrompts = PROMPT_STARTERS[selectedMode] ?? PROMPT_STARTERS.auto;
  const starterLabel = MODE_STARTER_LABELS[selectedMode] ?? MODE_STARTER_LABELS.auto;

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

                  {/* Agent Steps Accordion */}
                  {msg.agentSteps && msg.agentSteps.length > 0 && (
                    <div className="mt-3">
                      <AgentStepsAccordion steps={msg.agentSteps} />
                    </div>
                  )}

                  {/* Content Audit & Growth Diagnosis */}
                  {msg.diagnosis && (
                    <DiagnosisCard
                      diagnosis={msg.diagnosis}
                      exports={msg.exports}
                      optimizedPosts={msg.optimizedPosts}
                    />
                  )}

                  {/* Content Calendar Schedule */}
                  {msg.calendar && msg.calendar.length > 0 && (
                    <ContentCalendarView calendar={msg.calendar} exports={msg.exports} />
                  )}

                  {/* Platform Post Cards */}
                  {(msg.platformPosts || msg.optimizedPosts) && (
                    <PlatformPostCards
                      posts={msg.platformPosts || msg.optimizedPosts || {}}
                      exports={msg.exports}
                    />
                  )}

                  {/* Image Prompt Cards */}
                  {msg.imagePrompts && msg.imagePrompts.length > 0 && (
                    <ImagePromptCard prompts={msg.imagePrompts} />
                  )}

                  {/* Interactive Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-border/40">
                      {msg.actions.map((act, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => executeAction(act)}
                          className="text-xs h-7 border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-300"
                        >
                          <Zap className="w-3 h-3 mr-1 text-purple-400" />
                          {act.label}
                        </Button>
                      ))}
                    </div>
                  )}

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
              <span>{starterLabel}</span>
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
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          accept=".txt,.md,.json,.csv,.js,.ts,.tsx,.jsx,.html,.css,.doc,.docx"
          className="hidden"
        />

        {/* Attached Files Chips Bar */}
        {attachedFiles.length > 0 && (
          <div className="max-w-4xl mx-auto mb-2 flex flex-wrap gap-1.5 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
            <div className="text-[11px] font-semibold text-purple-300 flex items-center gap-1.5 w-full mb-1">
              <Paperclip className="w-3.5 h-3.5 text-purple-400" />
              <span>Attached Files ({attachedFiles.length})</span>
            </div>
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background/80 border border-purple-500/30 text-xs text-foreground font-medium shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate max-w-[150px]">{file.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono">({file.sizeFormatted})</span>
                <button
                  type="button"
                  onClick={() => removeAttachedFile(file.id)}
                  className="p-0.5 rounded hover:bg-rose-500/20 hover:text-rose-300 text-muted-foreground transition-colors ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Optimize Mode Helper Banner */}
        {selectedMode === "optimize" && attachedFiles.length === 0 && (
          <div className="max-w-4xl mx-auto mb-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Optimize Mode: Paste copy below or attach a draft file to optimize virality & hooks.</span>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="font-medium text-xs underline underline-offset-2 hover:text-white shrink-0 ml-2"
            >
              Attach File
            </button>
          </div>
        )}

        <div className="max-w-4xl mx-auto flex items-center gap-2 bg-background border border-border/80 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/30 rounded-2xl p-2 transition-all shadow-xl">
          {/* Voice Microphone Component */}
          <VoiceRecorderButton
            onAudioRecorded={handleVoiceRecorded}
            disabled={isLoading}
          />

          {/* Paperclip File Upload Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            title="Attach file / draft document"
            className="rounded-xl h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent shrink-0 relative"
          >
            <Paperclip className="w-4 h-4" />
            {attachedFiles.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-background" />
            )}
          </Button>

          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={
              selectedMode === "optimize"
                ? "Paste post copy to optimize or ask Claire to analyze..."
                : "Ask Claire to write posts, analyze strategy, create visual prompts..."
            }
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-xs sm:text-sm placeholder:text-muted-foreground/60"
          />

          <Button
            type="button"
            onClick={() => handleSend()}
            disabled={(!inputMessage.trim() && attachedFiles.length === 0) || isLoading}
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
