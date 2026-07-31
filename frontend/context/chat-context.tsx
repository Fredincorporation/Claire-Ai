"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Message, Conversation, Mode, ActionItem } from "@/types/chat";

interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string;
  messages: Message[];
  selectedBrandId: string;
  selectedMode: Mode;
  selectedPlatforms: string[];
  isLoading: boolean;
  isMobileSidebarOpen: boolean;
  apiError: string | null;
  setActiveConversationId: (id: string) => void;
  setSelectedBrandId: (id: string) => void;
  setSelectedMode: (mode: Mode) => void;
  togglePlatform: (platform: string) => void;
  setIsMobileSidebarOpen: (open: boolean) => void;
  createNewConversation: () => void;
  deleteConversation: (id: string) => void;
  clearCurrentConversation: () => void;
  sendMessage: (text: string) => Promise<void>;
  sendVoiceMessage: (audioBlob: Blob) => Promise<void>;
  executeAction: (actionItem: ActionItem) => Promise<void>;
  clearApiError: () => void;
}

const INITIAL_WELCOME_MSG: Message = {
  id: "welcome-msg",
  role: "assistant",
  agentName: "Claire Supervisor",
  content:
    "Hello! I am **Claire**, your multi-agent AI Social Media Manager.\n\nI orchestrate a specialized team of AI agents—Research, Content Strategy, Copywriting, and Platform Optimization—to deliver viral campaigns and high-performing social posts across **X/Twitter**, **LinkedIn**, **Instagram**, **TikTok**, and **Threads**.\n\nHow can we elevate your social presence today?",
  createdAt: new Date().toISOString(),
};

const DEFAULT_CONVERSATION_ID = "conv_default_1";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: DEFAULT_CONVERSATION_ID,
      title: "Q2 Social Campaign & Strategy",
      brandId: "default",
      mode: "auto",
      messages: [INITIAL_WELCOME_MSG],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  const [activeConversationId, setActiveConversationId] = useState<string>(DEFAULT_CONVERSATION_ID);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("default");
  const [selectedMode, setSelectedMode] = useState<Mode>("auto");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "x",
    "linkedin",
    "instagram",
    "tiktok",
    "threads",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Get active conversation messages
  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConv ? activeConv.messages : [];

  const updateActiveMessages = (updater: (prevMsgs: Message[]) => Message[]) => {
    setConversations((prevConvs) =>
      prevConvs.map((conv) => {
        if (conv.id === activeConversationId) {
          const newMsgs = updater(conv.messages);
          // Auto generate title from first user message
          let newTitle = conv.title;
          const firstUserMsg = newMsgs.find((m) => m.role === "user");
          if (firstUserMsg && conv.title.startsWith("New Campaign")) {
            newTitle = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? "..." : "");
          }
          return {
            ...conv,
            messages: newMsgs,
            title: newTitle,
            updatedAt: new Date().toISOString(),
          };
        }
        return conv;
      })
    );
  };

  const createNewConversation = () => {
    const newId = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: "New Campaign",
      brandId: selectedBrandId,
      mode: selectedMode,
      messages: [INITIAL_WELCOME_MSG],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    setApiError(null);
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length === 0) {
        const freshId = `conv_${Date.now()}`;
        return [
          {
            id: freshId,
            title: "New Campaign",
            brandId: "default",
            mode: "auto",
            messages: [INITIAL_WELCOME_MSG],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
      }
      return filtered;
    });

    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      }
    }
  };

  const clearCurrentConversation = () => {
    updateActiveMessages(() => [INITIAL_WELCOME_MSG]);
    setApiError(null);
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const clearApiError = () => setApiError(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setApiError(null);
    const userMsgId = `user_${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    updateActiveMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build history payload for backend
      const historyPayload = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content,
          agent_name: m.agentName || undefined,
        }));

      const res = await fetch(`${baseUrl}/api/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversation_id: activeConversationId,
          brand_id: selectedBrandId,
          mode: selectedMode,
          platforms: selectedPlatforms,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error (${res.status})`);
      }

      const data = await res.json();

      const assistantMsg: Message = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content: data.reply,
        agentName: data.agent_name || "Claire Supervisor",
        platformPosts: data.platform_posts || undefined,
        imagePrompts: data.image_prompts || undefined,
        agentSteps: data.agent_steps || undefined,
        actions: data.actions || undefined,
        intent: data.intent || undefined,
        createdAt: new Date().toISOString(),
      };

      updateActiveMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Chat API error:", err);
      setApiError(err.message || "Failed to communicate with Claire backend");

      const errorAssistantMsg: Message = {
        id: `assistant_err_${Date.now()}`,
        role: "assistant",
        content: `I encountered an issue connecting to my backend server at \`${baseUrl}\`.\n\nPlease verify that your FastAPI backend is running on port 8000.`,
        error: true,
        createdAt: new Date().toISOString(),
      };
      updateActiveMessages((prev) => [...prev, errorAssistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    if (isLoading) return;

    setApiError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "user_voice_input.webm");
      formData.append("conversation_id", activeConversationId);
      formData.append("brand_id", selectedBrandId);
      formData.append("mode", selectedMode);

      const res = await fetch(`${baseUrl}/api/v1/voice`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Voice processing failed (${res.status})`);
      }

      const data = await res.json();
      const transcription = data.transcription || "Voice input";
      const chatResp = data.chat_response;

      const userVoiceMsg: Message = {
        id: `user_voice_${Date.now()}`,
        role: "user",
        content: transcription,
        transcription: transcription,
        createdAt: new Date().toISOString(),
      };

      const assistantMsg: Message = {
        id: `assistant_voice_${Date.now()}`,
        role: "assistant",
        content: chatResp.reply,
        agentName: chatResp.agent_name || "Claire Supervisor",
        platformPosts: chatResp.platform_posts || undefined,
        imagePrompts: chatResp.image_prompts || undefined,
        agentSteps: chatResp.agent_steps || undefined,
        actions: chatResp.actions || undefined,
        intent: chatResp.intent || undefined,
        createdAt: new Date().toISOString(),
      };

      updateActiveMessages((prev) => [...prev, userVoiceMsg, assistantMsg]);
    } catch (err: any) {
      console.error("Voice API error:", err);
      setApiError(err.message || "Failed to process voice input");

      const errorMsg: Message = {
        id: `assistant_err_voice_${Date.now()}`,
        role: "assistant",
        content: `Voice processing error: ${err.message || "Could not transcribe audio"}. Make sure Groq Whisper API key is configured on backend.`,
        error: true,
        createdAt: new Date().toISOString(),
      };
      updateActiveMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = async (actionItem: ActionItem) => {
    const actionText = `Execute action: ${actionItem.label}`;
    await sendMessage(actionText);
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        messages,
        selectedBrandId,
        selectedMode,
        selectedPlatforms,
        isLoading,
        isMobileSidebarOpen,
        apiError,
        setActiveConversationId,
        setSelectedBrandId,
        setSelectedMode,
        togglePlatform,
        setIsMobileSidebarOpen,
        createNewConversation,
        deleteConversation,
        clearCurrentConversation,
        sendMessage,
        sendVoiceMessage,
        executeAction,
        clearApiError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
