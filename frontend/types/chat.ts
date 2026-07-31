export type Role = 'user' | 'assistant' | 'system';

export type Platform = 'x' | 'linkedin' | 'instagram' | 'tiktok' | 'threads';

export type Mode = 'auto' | 'create' | 'optimize' | 'research' | 'calendar';

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
  optimizedPosts?: Record<string, string>;
  diagnosis?: Record<string, any>;
  calendar?: Record<string, any>[];
  exports?: Record<string, string>;
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
  tagline?: string;
  tone_of_voice: string;
  target_audience: string;
  tone?: string;
  targetAudience?: string;
  content_pillars?: string[];
  style_guidelines?: string;
  visual_style?: string;
  do_not_use?: string[];
  color?: string;
}
