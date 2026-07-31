import {
  Sparkles,
  Image as ImageIcon,
  Calendar,
  BarChart3,
  Search,
  FileEdit,
  TrendingUp,
  Zap,
  LucideIcon,
} from "lucide-react";
import { Mode } from "@/types/chat";

export interface PromptStarter {
  title: string;
  prompt: string;
  icon: LucideIcon;
  color: string;
}

export const PROMPT_STARTERS: Record<Mode, PromptStarter[]> = {
  auto: [
    {
      title: "Full Multi-Platform Campaign",
      prompt:
        "Run the full agent pipeline: research trends, draft a strategy, and create native posts for X, LinkedIn, and Instagram with image prompts.",
      icon: Zap,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Viral X Thread + LinkedIn Post",
      prompt:
        "Draft a 5-part X thread and a polished LinkedIn post about our new AI social media manager launch.",
      icon: Sparkles,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Weekly Content Calendar",
      prompt:
        "Generate a 7-day multi-channel content calendar for a B2B SaaS startup with high-converting hooks.",
      icon: Calendar,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Market Trend Snapshot",
      prompt:
        "Research what's trending in AI marketing this week and suggest 3 campaign angles we should pursue.",
      icon: TrendingUp,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
  ],
  create: [
    {
      title: "X Thread on Product Launch",
      prompt:
        "Write a punchy 5-tweet X thread announcing our new feature — hook-first, no corporate fluff, under 280 chars each.",
      icon: Sparkles,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Instagram Carousel + Visuals",
      prompt:
        "Create an Instagram carousel script with 4 slides on '5 Social Media Metrics That Actually Matter' plus image prompts.",
      icon: ImageIcon,
      color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    },
    {
      title: "LinkedIn Thought Leadership",
      prompt:
        "Write a LinkedIn post with a strong hook, white-space formatting, and 3 bullet insights about scaling organic reach in 2026.",
      icon: FileEdit,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "TikTok Script + Hooks",
      prompt:
        "Write a 30-second TikTok video script with [HOOK], [VISUAL], [VOICEOVER], and [ON-SCREEN TEXT] about social media automation.",
      icon: Zap,
      color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    },
  ],
  optimize: [
    {
      title: "Fix a Weak Hook",
      prompt:
        "Optimize this hook for max engagement: 'We launched our new product today and here is what happened...'",
      icon: BarChart3,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Boost LinkedIn Readability",
      prompt:
        "Rewrite this LinkedIn post for better mobile readability and a stronger CTA: 'Our team has been working hard on AI tools for marketers.'",
      icon: FileEdit,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "X Post Virality Pass",
      prompt:
        "Critique and rewrite this X post to be punchier and more shareable: 'Excited to share that we hit 10k users! Thank you everyone for the support.'",
      icon: Sparkles,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Hashtag & CTA Tune-Up",
      prompt:
        "Optimize this Instagram caption — tighten the hook, improve the CTA, and refine hashtags: 'Check out our latest update! Link in bio. #marketing #AI #startup'",
      icon: ImageIcon,
      color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    },
  ],
  research: [
    {
      title: "Competitor Content Analysis",
      prompt:
        "Research what top AI SaaS brands are posting on LinkedIn and X this month — summarize patterns and gaps we can exploit.",
      icon: Search,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      title: "Trending Topics Deep Dive",
      prompt:
        "Find trending topics in social media marketing for Q3 2026 and recommend 5 content angles with audience hooks.",
      icon: TrendingUp,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Audience Pain Points",
      prompt:
        "Research the top frustrations growth marketers have with content creation and turn findings into a positioning brief.",
      icon: BarChart3,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Platform Algorithm Insights",
      prompt:
        "Research recent algorithm changes on Instagram and TikTok — what formats are getting the most reach right now?",
      icon: Sparkles,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
  ],
  calendar: [
    {
      title: "7-Day Multi-Channel Plan",
      prompt:
        "Build a complete 7-day multi-channel content calendar for our brand with post themes, hooks, and optimal posting times.",
      icon: Calendar,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Monthly Campaign Strategy",
      prompt:
        "Draft a 4-week content calendar strategy focusing on feature launches, user testimonials, and industry insights.",
      icon: Sparkles,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Product Launch Calendar",
      prompt:
        "Create a 14-day pre-launch and post-launch content cadence with daily post ideas across X, LinkedIn, and Instagram.",
      icon: TrendingUp,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Weekly Content Batch",
      prompt:
        "Schedule 5 standalone post concepts for this week with hooks, visuals, call-to-actions, and target platforms.",
      icon: Zap,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
  ],
};

export const MODE_STARTER_LABELS: Record<Mode, string> = {
  auto: "Suggested Orchestration Prompts",
  create: "Create Content — Starter Prompts",
  optimize: "Optimize Posts — Starter Prompts",
  research: "Research & Trends — Starter Prompts",
  calendar: "Content Calendar — Starter Prompts",
};
