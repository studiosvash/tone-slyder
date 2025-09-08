# Contributing to Tone Slyder

We welcome contributions from the community! This document provides guidelines for contributing to the Tone Slyder project.

## 🤝 How to Contribute

### Reporting Issues
- Use the GitHub issue tracker
- Provide detailed bug reports with steps to reproduce
- Include environment information (OS, browser, versions)
- Check existing issues before creating new ones

### Suggesting Features
- Open an issue with the "enhancement" label
- Provide clear use cases and expected behavior
- Consider the project scope and MVP priorities

### Code Contributions
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** following our coding standards
4. **Test your changes** thoroughly
5. **Submit a pull request** with a clear description

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended)
- API keys for testing (OpenAI, etc.)

### Local Development
```bash
# Clone your fork
git clone https://github.com/your-username/tone-slyder.git
cd tone-slyder

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Start development servers
npm run dev
```

## 📝 Coding Standards

### TypeScript
- Use strict TypeScript configuration
- Provide explicit types for function parameters and returns
- Use interfaces for object shapes
- Follow consistent naming conventions

### Code Style
- Use Prettier for formatting
- Follow ESLint rules
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Project Structure
```
backend/
├── src/
│   ├── core/           # Core business logic
│   ├── api/            # API routes and controllers
│   ├── services/       # External service integrations
│   ├── middleware/     # Express middleware
│   └── config/         # Configuration files
frontend/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utility functions
│   └── styles/         # CSS and styling
```

### Git Workflow
- Use conventional commit messages
- Keep commits focused and atomic
- Rebase feature branches before merging
- Write descriptive pull request descriptions

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test           # Unit tests
npm run test:integration  # Integration tests
npm run test:coverage     # Coverage report
```

### Frontend Testing
```bash
cd frontend
npm run test           # Jest + React Testing Library
npm run test:watch     # Watch mode
```

### Extension Testing
- Manual testing in target environments
- Chrome extension: Load unpacked extension
- Google Workspace: Apps Script editor
- Office: Sideload for testing

## 🎯 Priority Areas for Contribution

### High Priority
1. **Core Rewriting Engine**: Tone vector normalization, instruction mapping
2. **Slider Components**: React components for tone controls
3. **API Design**: RESTful endpoints for rewriting operations
4. **Extension Integration**: Chrome, Google Workspace, Office

### Medium Priority
1. **User Interface**: Improved design and UX
2. **Preset System**: Default and custom presets
3. **Guardrail Logic**: Required/banned word enforcement
4. **Cost Control**: Caching and metering systems

### Future Enhancements
1. **Community Features**: Public preset sharing
2. **Advanced Sliders**: Composite slider architecture  
3. **Multi-language Support**: i18n implementation
4. **Enterprise Features**: SSO, analytics, etc.

## 🚀 Pull Request Process

1. **Description**: Clearly describe what your PR does
2. **Testing**: Include tests for new functionality
3. **Documentation**: Update relevant docs
4. **Review**: Address feedback promptly
5. **Squash commits** when ready to merge

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

## 🧰 Development Guidelines

### Core Logic Development
- Follow the three-phase architecture
- Maintain model-agnostic design
- Ensure proper error handling
- Add comprehensive logging

### UI/UX Development
- Follow existing design patterns
- Ensure accessibility compliance
- Test across different screen sizes
- Maintain consistent styling

### Extension Development
- Follow platform-specific guidelines
- Handle security restrictions properly
- Test in target environments
- Optimize for performance

## 📚 Resources

### Documentation
- [Architecture Overview](ARCHITECTURE.md)
- [API Documentation](API.md)
- [Deployment Guide](DEPLOYMENT.md)

### External Resources
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Chrome Extension Development](https://developer.chrome.com/docs/extensions/)
- [Google Apps Script](https://developers.google.com/apps-script)
- [Office Add-ins](https://docs.microsoft.com/en-us/office/dev/add-ins/)

## 🎖️ Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes for significant contributions
- Community Discord server (coming soon)

## 📞 Getting Help

- **Discord**: [Join our community](https://discord.gg/toneslyder)
- **Issues**: GitHub issue tracker for bugs
- **Discussions**: GitHub discussions for questions
- **Email**: dev@toneslyder.com for sensitive matters

## 📜 Code of Conduct

### Our Pledge
We pledge to create a welcoming and inclusive environment for all contributors regardless of background, experience level, or identity.

### Standards
- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Enforcement
Violations can be reported to the project maintainers. All complaints will be reviewed and investigated promptly.

---

Thank you for contributing to Tone Slyder! Together, we're building the future of AI-powered content creation. 🎚️✨
