# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Setup and Installation
```bash
# Install all dependencies (root and workspaces)
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with required API keys: OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.
```

### Development Servers
```bash
# Start both backend and frontend simultaneously
npm run dev

# Start individual services
npm run dev:backend      # Backend API server on port 3001
npm run dev:frontend     # Frontend React app on port 5173 (Vite)
```

### Building
```bash
# Build all components
npm run build

# Build individual components
npm run build:shared     # Shared TypeScript types and utilities
npm run build:backend    # Node.js API server
npm run build:frontend   # React production build
```

### Testing
```bash
# Run all tests
npm run test

# Component-specific testing
cd backend && npm run test               # Backend Jest unit tests
cd backend && npm run test:integration   # Integration tests
cd backend && npm run test:coverage     # Coverage reports
cd frontend && npm run test             # Frontend React Testing Library
cd frontend && npm run test:watch       # Frontend watch mode
```

### Code Quality
```bash
# Lint all code
npm run lint

# Format code with Prettier
npm run format

# Type checking
npm run type-check
```

### Individual Test Execution
```bash
# Run specific backend test file
cd backend && npm run test -- src/core/rewriteEngine.test.ts

# Run specific frontend test
cd frontend && npm run test -- components/Slider.test.tsx

# Run tests matching pattern
cd backend && npm run test -- --testNamePattern="tone vector"
```

## Architecture Overview

Tone Slyder is an AI-powered tone adjustment tool built with a modular, model-agnostic architecture across three main components:

### Monorepo Structure
- **Root**: Workspace management with concurrently running dev servers
- **Backend**: Node.js/Express API server with TypeScript
- **Frontend**: React 18 + Vite application with TypeScript  
- **Shared**: Common TypeScript types and utilities using Zod
- **Extensions**: Browser extensions and productivity app integrations (planned)

### Core Rewriting Engine (Backend)
The heart of the system transforms user slider inputs through a three-stage process:

1. **Tone Vector Normalization**: Converts slider percentages (10-90%) to normalized weights (-1.0 to +1.0)
2. **Instruction Mapping**: Maps normalized weights to qualitative instructions via bucket system
3. **Prompt Generation**: Assembles model-agnostic prompts with tone instructions and guardrails

Key files:
- `backend/src/core/rewriteEngine.ts` - Core business logic
- `backend/src/api/rewrite.ts` - Main rewriting endpoint
- `backend/src/config/` - Environment and logging configuration

### Frontend Architecture
React-based UI with component hierarchy:
- **SliderPanel**: Contains 4 core sliders (Formality, Conversational, Informativeness, Authoritativeness)  
- **PresetSelector**: Quick-apply tone configurations
- **TextEditor**: Input/output areas for content rewriting
- **GuardrailControls**: Required/banned word management

State management uses React Context and hooks, with Zustand for complex state and localStorage for persistence.

### Model Integration
Currently supports:
- OpenAI GPT models (gpt-3.5-turbo, gpt-4)
- Anthropic Claude models
- Extensible design for additional LLM providers

### Critical Business Logic
The tone adjustment algorithm uses mathematical normalization and conflict resolution:
- Primary sliders (top 3 by weight) take precedence
- Secondary sliders provide nuance
- Intelligent merging prevents contradictory instructions
- Caching system (Redis) prevents duplicate API calls within 10-minute windows

## Environment Configuration

Required environment variables in `.env`:
- `OPENAI_API_KEY` - OpenAI API access
- `ANTHROPIC_API_KEY` - Claude API access  
- `DATABASE_URL` - PostgreSQL connection (future)
- `REDIS_URL` - Redis for caching (default: localhost:6379)
- `JWT_SECRET` - Authentication secret
- `CORS_ORIGINS` - Allowed frontend origins (localhost:3000,localhost:5173)

## Key Development Concepts

### Tone Vector System
Sliders operate on a normalized scale where:
- Raw input: 10-90% (avoiding extremes)
- Normalized: -1.0 to +1.0 via formula `(value - 50) / 40`
- Mapped to qualitative buckets: "very casual" → "very formal"

### Workspace Dependencies
This is a TypeScript workspace project with path mappings:
- `@tone-slyder/shared/*` - Shared utilities accessible from all packages
- Workspace references in root `tsconfig.json` enable cross-package imports
- Each package has isolated `package.json` with specific dependencies

### Testing Strategy
- **Backend**: Jest unit tests + Supertest integration tests
- **Frontend**: Jest + React Testing Library + jsdom environment
- **Shared**: Jest unit tests for type utilities
- Test files follow `*.test.ts` or `*.spec.ts` naming

### Extension Architecture (Planned)
Future multi-platform support:
- Chrome Extension (Manifest V3)
- Google Workspace Add-on (Apps Script)
- Microsoft Office Add-in (Office.js)
- Shared UI components across platforms

## Development Notes

- Backend runs on Express with middleware for CORS, compression, rate limiting
- Frontend uses Vite for fast development and building
- Shared package uses Zod for runtime type validation
- All packages use strict TypeScript configuration
- ESLint + Prettier enforce code style consistency
- Redis caching prevents redundant API calls and controls costs
- JWT authentication system ready for user management
- Rate limiting configured for API protection

## Integration Points

The system is designed for integration with:
- Google Workspace (Docs, Gmail)  
- Microsoft Office (Word)
- General web pages via Chrome extension
- Any text input through API endpoints

When working with integrations, note the content script architecture and cross-origin communication patterns defined in the extension specifications.
