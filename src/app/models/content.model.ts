export type ProductArea = 'dev-tools' | 'reveal' | 'slingshot';
export type ContentMedium = 'blog' | 'forum' | 'facebook' | 'linkedin' | 'twitter';
export type ContentStatus = 'published' | 'scheduled' | 'draft' | 'pipeline';
export type LlmModel =
  | 'gpt-5o'
  | 'gpt-5-turbo'
  | 'claude-4-5-sonnet'
  | 'claude-4-haiku'
  | 'gemini-3.1-pro-preview';

export interface ContentAnalytics {
  impressions: number;
  reactions: number;
  shares: number;
  clicks: number;
  engagementRate: number;
}

export interface ReviewerAssignment {
  id: string;
  name: string;
  email: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
}

export interface ContentItem {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  productArea: ProductArea;
  mediums: ContentMedium[];
  status: ContentStatus;
  model: LlmModel;
  tags: string[];
  createdAt: string;
  publishedAt?: string;
  scheduledAt?: string;
  analytics?: ContentAnalytics;
  ragContext?: string;
  prompt?: string;
  reviewers?: ReviewerAssignment[];
  reviewNote?: string;
}

export interface ProductAreaStats {
  area: ProductArea;
  totalContent: number;
  publishedCount: number;
  scheduledCount: number;
  pipelineCount: number;
  totalImpressions: number;
  totalReactions: number;
  avgEngagementRate: number;
  topContent?: ContentItem;
}

export interface RagRequest {
  input: string;
  productType?: string;
  sessionId?: string;
}

export interface RagResponse {
  output: string;
  title: string;
  sessionId: string;
  citations: string[];
  confidenceLevel: number;
}

export interface ContentCreationState {
  productArea: ProductArea | null;
  mediums: ContentMedium[];
  prompt: string;
  ragContext: string;
  augmentedPrompt: string;
  model: LlmModel | null;
  generatedContent: Record<ContentMedium, string>;
  finalContent: Record<ContentMedium, string>;
  scheduleDate: string | null;
  publishImmediately: boolean;
  chatMessages: ChatMessage[];
  reviewers: ReviewerAssignment[];
  reviewNote: string;
}

export const PRODUCT_AREA_LABELS: Record<ProductArea, string> = {
  'dev-tools': 'Dev Tools',
  reveal: 'Reveal',
  slingshot: 'Slingshot',
};

export const PRODUCT_AREA_ICONS: Record<ProductArea, string> = {
  'dev-tools': 'code',
  reveal: 'bar_chart',
  slingshot: 'rocket_launch',
};

export const PRODUCT_AREA_RAG_TYPE: Record<ProductArea, string> = {
  'dev-tools': 'igniteui',
  reveal: 'reveal',
  slingshot: 'master',
};

export const MEDIUM_LABELS: Record<ContentMedium, string> = {
  blog: 'Blog Post',
  forum: 'Forum Post',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  twitter: 'X (Twitter)',
};

export const MEDIUM_ICONS: Record<ContentMedium, string> = {
  blog: 'article',
  forum: 'forum',
  facebook: 'thumb_up',
  linkedin: 'work',
  twitter: 'tag',
};

export const LLM_MODEL_LABELS: Record<LlmModel, string> = {
  'gpt-5o': 'GPT-5o (OpenAI)',
  'gpt-5-turbo': 'GPT-5 Turbo (OpenAI)',
  'claude-4-5-sonnet': 'Claude 4.5 Sonnet (Anthropic)',
  'claude-4-haiku': 'Claude 4 Haiku (Anthropic)',
  'gemini-3.1-pro-preview': 'Gemini 3.1 Pro Preview (Google)',
};
