# Tone Slyder Technical Architecture

## Overview

Tone Slyder is built as a modular, model-agnostic system that transforms user-friendly slider inputs into AI model instructions for precise tone control in text rewriting.

## Core Components

### 1. Input Processing & Tone Vector Normalization

**Purpose**: Convert raw slider percentages into standardized mathematical format.

**Input**: Slider values (10-90%)
**Output**: Normalized weights (-1.0 to +1.0)

**Logic**:
```typescript
function normalizeSliderValue(sliderValue: number): number {
  // Convert 10-90% range to -1.0 to +1.0 scale
  return (sliderValue - 50) / 40;
}
```

**Constraints**:
- Sliders limited to 10-90% to avoid extremes and jitter
- Bipolar scale ensures consistent mathematical operations

### 2. Instruction Mapping Engine (Bucket Mapping)

**Purpose**: Translate normalized vectors into qualitative, model-agnostic instructions.

**Mapping Logic**:
```typescript
interface ToneBucket {
  range: [number, number];
  instruction: string;
}

const formalityBuckets: ToneBucket[] = [
  { range: [-1.0, -0.6], instruction: "very casual" },
  { range: [-0.6, -0.2], instruction: "casual" },
  { range: [-0.2, 0.2], instruction: "moderate" },
  { range: [0.2, 0.6], instruction: "formal" },
  { range: [0.6, 1.0], instruction: "very formal" }
];
```

**Benefits**:
- Model-agnostic approach
- Human-readable instructions
- Consistent interpretation across different AI providers

### 3. Core Prompt Generation System

**Purpose**: Assemble complete prompts with tone instructions and user content.

**Template Structure**:
```
TONE INSTRUCTIONS:
- Formality: [level]
- Conversational: [level]
- Informativeness: [level]
- Authoritativeness: [level]

GUARDRAILS:
- Required words: [list]
- Banned words: [list]

CONTENT TO REWRITE:
[user_text]

TASK: Rewrite the above content following the tone instructions while maintaining the original meaning.
```

### 4. Conflict Resolution & Prioritization Logic

**Purpose**: Handle conflicting slider settings intelligently.

**Algorithm**:
1. Sort sliders by absolute weight
2. Top 3 weights → Primary instructions
3. Remaining weights → Secondary instructions
4. Generate hierarchical prompt: "Primary tone: X. Secondary adjustments: Y, Z"

**Example**:
```typescript
interface SliderWeight {
  dimension: string;
  weight: number;
  instruction: string;
}

function resolveConflicts(weights: SliderWeight[]): {
  primary: SliderWeight[];
  secondary: SliderWeight[];
} {
  const sorted = weights
    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
  
  return {
    primary: sorted.slice(0, 3),
    secondary: sorted.slice(3)
  };
}
```

## System Architecture

### Backend Services

#### Core Rewriting Service
- **Location**: `backend/src/core/`
- **Responsibilities**:
  - Tone vector normalization
  - Instruction mapping
  - Prompt generation
  - LLM API orchestration

#### API Layer
- **Location**: `backend/src/api/`
- **Endpoints**:
  - `POST /api/rewrite` - Main rewriting endpoint
  - `GET/POST /api/presets` - Preset management
  - `GET/POST /api/custom-sliders` - Custom slider CRUD

#### Cost Control & Caching
- **Redis Integration**: Request deduplication (10-minute window)
- **Token Metering**: Track usage per user/tier
- **Rate Limiting**: Prevent API abuse

### Frontend Architecture

#### React Component Hierarchy
```
App
├── SliderPanel
│   ├── CoreSlider (x4)
│   ├── CustomSlider (dynamic)
│   └── PresetSelector
├── TextEditor
│   ├── InputArea
│   └── OutputArea
├── GuardrailControls
│   ├── RequiredWords
│   └── BannedWords
└── HistoryPanel
```

#### State Management
- **Local State**: React hooks for UI state
- **Global State**: Context for slider values, presets
- **Persistence**: localStorage for user preferences

### Extension Integration

#### Chrome Extension
- **Manifest V3** compliance
- **Content Scripts**: Inject UI into web pages
- **Background Scripts**: Handle API communication
- **Integration Points**: Gmail, Google Docs, general web pages

#### Google Workspace Add-on
- **Google Apps Script** implementation
- **Card Service** for sidebar UI
- **Document.app API** for text manipulation

#### Microsoft Office Add-in
- **Office.js** integration
- **Task Pane** UI
- **Word API** for content manipulation

## Data Flow

### Rewriting Request Flow

1. **User Input**:
   - Selects text
   - Adjusts sliders
   - Sets guardrails
   - Clicks "Apply"

2. **Frontend Processing**:
   - Validates input
   - Normalizes slider values
   - Packages request

3. **Backend Processing**:
   - Authenticates request
   - Checks cache for identical request
   - Processes tone vectors
   - Generates prompt
   - Calls LLM API
   - Validates output against guardrails
   - Returns result

4. **Frontend Response**:
   - Replaces selected text
   - Updates history
   - Shows diff (optional)

### Caching Strategy

```typescript
interface CacheKey {
  originalText: string;
  sliderValues: Record<string, number>;
  guardrails: {
    required: string[];
    banned: string[];
  };
  model: string;
}

// Cache hit: Return cached result
// Cache miss: Process request, cache result (TTL: 10 minutes)
```

## Guardrail Implementation

### Stage 1: Prompt Injection
- Add explicit instructions to prompt
- Format: "Ensure these words remain unchanged: X, Y, Z"
- Format: "Avoid using these words: A, B, C"

### Stage 2: Post-Processing Verification
- Scan output for required/banned terms
- Auto-retry if violations detected
- User notification for persistent issues

## Custom Slider Architecture

### Slider Definition
```typescript
interface CustomSlider {
  id: string;
  label: string;
  description: string;
  creator: string;
  isComposite: boolean;
  mappings?: CompositeMapping[];
  tags: string[];
  public: boolean;
}

interface CompositeMapping {
  condition: string; // "low", "medium", "high"
  instructions: string[];
}
```

### Community Features
- **Storage**: Database for public sliders
- **Rating System**: User votes on slider quality
- **Moderation**: Review queue for public submissions
- **Discovery**: Search and filter by tags/categories

## Performance Considerations

### Cost Optimization
- **Request Deduplication**: Redis-based caching
- **Token Limits**: Per-tier usage tracking
- **Model Selection**: Cheaper models for free tier
- **Batch Processing**: Group similar requests

### Scalability
- **Horizontal Scaling**: Stateless backend services
- **Database Sharding**: User-based partitioning
- **CDN**: Static asset delivery
- **Auto-scaling**: Cloud platform integration

### Monitoring
- **Request Latency**: P95/P99 tracking
- **Error Rates**: By endpoint and model
- **Cost Tracking**: Per-user and aggregate
- **Quality Metrics**: User satisfaction ratings

## Security

### API Security
- **Authentication**: JWT tokens
- **Rate Limiting**: Per-user limits
- **Input Validation**: Sanitize all inputs
- **Prompt Injection Protection**: Content filtering

### Data Privacy
- **Minimal Storage**: Process and discard by default
- **Encryption**: At rest and in transit
- **GDPR Compliance**: Right to deletion
- **Audit Logs**: User action tracking

## Development Workflow

### Local Development
```bash
# Start all services
npm run dev

# Individual services
npm run dev:backend
npm run dev:frontend
npm run dev:extension
```

### Testing Strategy
- **Unit Tests**: Core logic modules
- **Integration Tests**: API endpoints
- **E2E Tests**: Full user workflows
- **Performance Tests**: Load testing

### Deployment
- **Backend**: Docker containers on cloud platform
- **Frontend**: Static hosting with CDN
- **Extensions**: Platform-specific stores
- **Database**: Managed PostgreSQL + Redis

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (main) + Redis (cache)
- **LLM APIs**: OpenAI, Anthropic (Claude)
- **Deployment**: Docker + Cloud Run/Lambda

### Frontend
- **Framework**: React 18 with TypeScript
- **State**: React Context + hooks
- **Styling**: CSS Modules + Tailwind
- **Build**: Vite
- **Testing**: Jest + React Testing Library

### Extensions
- **Chrome**: Manifest V3 + React
- **Google**: Apps Script + HTML Service
- **Office**: Office.js + React
- **Shared**: Common UI components

This architecture ensures scalability, maintainability, and model-agnostic operation while providing a smooth user experience across all platforms.
