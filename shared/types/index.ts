export interface SliderConfig {
  id: string;
  label: string;
  description: string;
  min: number;
  max: number;
  defaultValue: number;
  step: number;
  isCore: boolean;
  category?: string;
}

export interface CoreSliders {
  formality: number;
  conversational: number;
  informativeness: number;
  authoritativeness: number;
}

export interface CustomSlider extends SliderConfig {
  creator: string;
  isComposite: boolean;
  mappings?: CompositeMapping[];
  tags: string[];
  public: boolean;
  rating?: number;
  usage_count?: number;
}

export interface CompositeMapping {
  condition: 'low' | 'medium' | 'high';
  range: [number, number];
  instructions: string[];
}

export interface TonePreset {
  id: string;
  name: string;
  description: string;
  sliderValues: Record<string, number>;
  creator?: string;
  public: boolean;
  tags: string[];
  rating?: number;
  usage_count?: number;
}

export interface Guardrails {
  required: string[];
  banned: string[];
}

export interface RewriteRequest {
  originalText: string;
  sliderValues: Record<string, number>;
  guardrails: Guardrails;
  model?: string;
  userId?: string;
}

export interface RewriteResponse {
  rewrittenText: string;
  originalText: string;
  model: string;
  processingTime: number;
  tokensUsed: number;
  guardrailViolations?: string[];
}

export interface ToneInstruction {
  dimension: string;
  level: 'very low' | 'low' | 'moderate' | 'high' | 'very high';
  weight: number;
}

export interface SliderWeight {
  dimension: string;
  weight: number;
  instruction: string;
}

export interface ConflictResolution {
  primary: SliderWeight[];
  secondary: SliderWeight[];
}

export interface User {
  id: string;
  email: string;
  tier: 'free' | 'premium' | 'enterprise';
  usage: {
    monthly_rewrites: number;
    monthly_limit: number;
    tokens_used: number;
  };
  preferences: {
    default_model: string;
    favorite_presets: string[];
    custom_sliders: string[];
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type ModelProvider = 'openai' | 'anthropic' | 'local';

export interface ModelConfig {
  provider: ModelProvider;
  model: string;
  maxTokens: number;
  temperature: number;
  costPerToken: number;
}

export interface CacheKey {
  originalText: string;
  sliderValues: Record<string, number>;
  guardrails: Guardrails;
  model: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  originalText: string;
  rewrittenText: string;
  sliderValues: Record<string, number>;
  model: string;
}

export interface ExtensionMessage {
  type: 'rewrite' | 'preset' | 'slider' | 'config';
  payload: any;
  requestId: string;
}

export interface ExtensionConfig {
  apiUrl: string;
  apiKey?: string;
  defaultPreset?: string;
  showDebugInfo: boolean;
}

// Core slider definitions
export const CORE_SLIDERS: Record<keyof CoreSliders, SliderConfig> = {
  formality: {
    id: 'formality',
    label: 'Formality',
    description: 'Controls casual vs. professional language—shifts wording from colloquial/slang to professional/polite',
    min: 10,
    max: 90,
    defaultValue: 50,
    step: 1,
    isCore: true,
    category: 'tone'
  },
  conversational: {
    id: 'conversational',
    label: 'Conversational',
    description: 'Adjusts the level of dialog-like, friendly tone—personal pronouns, informal phrasing',
    min: 10,
    max: 90,
    defaultValue: 50,
    step: 1,
    isCore: true,
    category: 'tone'
  },
  informativeness: {
    id: 'informativeness',
    label: 'Informativeness',
    description: 'Influences the detail/factual density—adds/removes elaboration and explanation',
    min: 10,
    max: 90,
    defaultValue: 50,
    step: 1,
    isCore: true,
    category: 'content'
  },
  authoritativeness: {
    id: 'authoritativeness',
    label: 'Authoritativeness',
    description: 'Sets confidence level—assertiveness, directness, and expert phrasing versus caution or neutrality',
    min: 10,
    max: 90,
    defaultValue: 50,
    step: 1,
    isCore: true,
    category: 'tone'
  }
};

// Default presets
export const DEFAULT_PRESETS: TonePreset[] = [
  {
    id: 'business',
    name: 'Business',
    description: 'Professional, formal tone suitable for business communications',
    sliderValues: {
      formality: 80,
      conversational: 30,
      informativeness: 70,
      authoritativeness: 85
    },
    public: true,
    tags: ['business', 'professional', 'formal']
  },
  {
    id: 'academic',
    name: 'Academic',
    description: 'Scholarly tone for research papers and academic writing',
    sliderValues: {
      formality: 85,
      conversational: 10,
      informativeness: 90,
      authoritativeness: 80
    },
    public: true,
    tags: ['academic', 'scholarly', 'research']
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Casual, friendly tone for social media and personal communications',
    sliderValues: {
      formality: 20,
      conversational: 85,
      informativeness: 40,
      authoritativeness: 30
    },
    public: true,
    tags: ['social', 'casual', 'friendly']
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Balanced tone for articles, blogs, and editorial content',
    sliderValues: {
      formality: 60,
      conversational: 50,
      informativeness: 75,
      authoritativeness: 70
    },
    public: true,
    tags: ['editorial', 'balanced', 'journalism']
  }
];
