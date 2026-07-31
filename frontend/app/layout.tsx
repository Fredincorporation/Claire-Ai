import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Claire AI - Autonomous AI Social Media Manager",
  description:
    "Claire coordinates an autonomous team of AI agents to optimize existing social media channels, craft viral multi-platform posts, and manage content calendars on autopilot.",
  keywords: [
    "AI Social Media Manager",
    "Social Media Automation",
    "Multi-Agent AI System",
    "Groq Llama 3.3",
    "Content Calendar Generator",
    "LinkedIn Strategy AI",
    "Twitter X Refactoring",
  ],
  authors: [{ name: "Claire AI Team" }],
  themeColor: "#0A0D14",
  openGraph: {
    title: "Claire AI - Autonomous AI Social Media Manager",
    description: "Multi-agent AI team for viral content creation, channel optimization, and strategic content calendars.",
    type: "website",
    siteName: "Claire AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claire AI - Autonomous AI Social Media Manager",
    description: "Autonomous multi-agent social media orchestrator.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}
