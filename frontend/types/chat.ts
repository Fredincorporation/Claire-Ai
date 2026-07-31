export type Role = 'user' | 'assistant' | 'system';

export type Platform = 'x' | 'linkedin' | 'instagram' | 'tiktok' | 'threads';

export type Mode = 'auto' | 'create' | 'optimize' | 'research';

export interface ActionItem {
  id?: string;
  label: string;
  action: string;
  payload?: Record<string, unknown>;
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
}

export interface AgentStep {
  agent: string;
  step: string;
  details?: string;
  status?: 'completed' | 'in_progress' | 'failed' | string;
  execution_time_ms?: number;
}

export interface ImagePrompt {
  platform?: string;
  prompt: string;
  style?: string;
  aspect_ratio?: string;
  negative_prompt?: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  transcription?: string;
  agentName?: string;
  platformPosts?: Record<string, string>;
  imagePrompts?: ImagePrompt[];
  agentSteps?: AgentStep[];
  actions?: ActionItem[];
  intent?: string;
  createdAt: Date | string;
  isStreaming?: boolean;
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  brandId: string;
  mode: Mode;
  messages: Message[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BrandProfile {
  id: string;
  name: string;
  tagline: string;
  tone: string;
  targetAudience: string;
  color: string;
}
