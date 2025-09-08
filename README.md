# Tone Slyder 🎚️

An AI-powered tone adjustment tool that simplifies content rewriting through intuitive slider controls.

## 🎯 Vision & Mission

**Problem**: Prompting is hard, and AI-generated text often lacks uniqueness and becomes repetitive.

**Solution**: Tone Slyder provides an easy-to-use, integrated tone editing tool that allows users to adjust tone and content through straightforward slider adjustments, making the rewriting process simple and efficient.

**Mission**: To provide an accessible and integrated tone editing tool for all people, regardless of application and budget.

## ✨ Key Features

### Core MVP Features
- **4 Core Sliders** for precise tone control:
  - 🎩 **Formality**: Casual ↔ Professional language
  - 💬 **Conversational**: Personal ↔ Impersonal tone
  - 📊 **Informativeness**: Brief ↔ Detailed content
  - 👑 **Authoritativeness**: Tentative ↔ Confident tone

- **Custom Sliders**: Community-driven custom tone dimensions
- **Presets**: Quick-apply configurations (Business, Academic, Social, Editorial)
- **Guardrails**: Protect required words and ban unwanted terms
- **Model Agnostic**: Works with GPT, Claude, and other LLM providers

### Platform Integration
- 📄 **Google Workspace** (Docs, Gmail)
- 🌐 **Chrome Extension**
- 📝 **Microsoft Office** (Word)

## 🏗️ Architecture

### Phase 1: Core Rewrite Engine (MVP)
1. **Input Processing & Tone Vector Normalization** (-1.0 to +1.0)
2. **Instruction Mapping Engine** (Bucket mapping to qualitative levels)
3. **Core Prompt Generation System**
4. **Guardrail Enforcement System**

### Phase 2: Quality & Cost Control
1. **Conflict Resolution & Prioritization Logic**
2. **Metering, Caching & Cost Control System**
3. **Preset & Customization Management**

### Phase 3: Advanced Features
1. **Composite Slider Decomposition Engine**
2. **Community Platform & Marketplace**
3. **Advanced Guardrail Verification**

## 📁 Project Structure

```
tone-slyder/
├── backend/                 # Node.js/TypeScript API server
│   ├── src/
│   │   ├── core/           # Core rewriting logic
│   │   ├── api/            # REST API endpoints
│   │   ├── services/       # External service integrations
│   │   ├── middleware/     # Authentication, validation
│   │   └── config/         # Configuration files
│   └── tests/
├── frontend/               # React web interface
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS/styling
│   └── public/
├── extensions/             # Browser extensions & add-ons
│   ├── chrome/            # Chrome extension
│   ├── google-workspace/  # Google Workspace add-on
│   └── office/            # Microsoft Office add-in
├── shared/                # Shared code between components
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Common utilities
└── docs/                  # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tone-slyder
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies
   cd ../frontend && npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Add your API keys
   # OPENAI_API_KEY=your_openai_key_here
   # CLAUDE_API_KEY=your_claude_key_here
   ```

4. **Start development servers**
   ```bash
   # Start backend (from root)
   npm run dev:backend
   
   # Start frontend (from root)
   npm run dev:frontend
   ```

## 🎛️ Core Logic Deep Dive

### Tone Vector Normalization
- Slider values (10-90%) → Normalized weights (-1.0 to +1.0)
- Formula: `weight = (value - 50) / 40`

### Instruction Mapping
- Normalized weights → Qualitative levels (very low, low, moderate, high, very high)
- Model-agnostic prompt instructions

### Conflict Resolution
- Primary sliders (top 3 by weight) take precedence
- Secondary sliders provide nuance
- Intelligent merging for contradictory instructions

## 💰 Pricing Strategy

### Free Tier
- GPT-3.5 model
- Limited monthly rewrites
- Basic guardrails
- Core sliders only

### Premium Tiers ($3-5/month)
- Model choice (GPT-4, Claude, etc.)
- Unlimited rewrites
- Advanced guardrails
- Custom sliders
- Community presets

### Enterprise
- SSO integration
- Custom model endpoints
- Advanced analytics
- Dedicated support

## 🛣️ Roadmap

### Q1 2024 - MVP Launch
- [ ] Core rewriting engine
- [ ] 4 fundamental sliders
- [ ] Google Docs integration
- [ ] Basic preset system

### Q2 2024 - Platform Expansion
- [ ] Chrome extension
- [ ] Microsoft Word add-in
- [ ] Custom slider creation
- [ ] Community preset gallery

### Q3 2024 - Advanced Features
- [ ] Composite sliders
- [ ] Advanced guardrails
- [ ] Multi-language support
- [ ] Enterprise features

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- 📧 Email: support@toneslyder.com
- 💬 Discord: [Join our community](https://discord.gg/toneslyder)
- 📖 Documentation: [docs.toneslyder.com](https://docs.toneslyder.com)

---

Made with ❤️ by the Tone Slyder team
