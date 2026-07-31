"use client";

import React, { useState } from "react";
import { AuthProvider } from "@/context/auth-context";
import { ChatProvider } from "@/context/chat-context";
import { Sidebar } from "@/components/chat/sidebar";
import { Header } from "@/components/chat/header";
import { ChatInterface } from "@/components/chat/chat-interface";
import { LandingPage } from "@/components/landing/landing-page";
import { AuthModal } from "@/components/auth/auth-modal";

export default function Home() {
  const [view, setView] = useState<"landing" | "app">("landing");

  return (
    <AuthProvider>
      <ChatProvider>
        <AuthModal />
        {view === "landing" ? (
          <LandingPage onLaunchApp={() => setView("app")} />
        ) : (
          <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
              <Header onShowLanding={() => setView("landing")} />
              <ChatInterface />
            </div>
          </div>
        )}
      </ChatProvider>
    </AuthProvider>
  );
}

