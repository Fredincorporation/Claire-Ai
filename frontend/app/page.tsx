"use client";

import { ChatProvider } from "@/context/chat-context";
import { Sidebar } from "@/components/chat/sidebar";
import { Header } from "@/components/chat/header";
import { ChatInterface } from "@/components/chat/chat-interface";

export default function Home() {
  return (
    <ChatProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          <Header />
          <ChatInterface />
        </div>
      </div>
    </ChatProvider>
  );
}
