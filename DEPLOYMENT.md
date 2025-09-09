# Tone Slyder Deployment Guide

## 🚀 Quick Start for Collaboration

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git
- AWS CLI (for production deployment)

### Local Development Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/YOUR_USERNAME/tone-slyder.git
   cd tone-slyder
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```
   
   This starts:
   - Backend API: http://localhost:8080
   - Frontend: http://localhost:3000  
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

4. **Or Start Individual Services**
   ```bash
   # Backend
   npm run dev:backend
   
   # Frontend  
   npm run dev:frontend
   ```

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend      │    │   Database      │
│   (React)       │◄──►│   (Node.js)      │◄──►│  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 8080     │    │   Port: 5432    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │      Redis      │
                       │   (Caching)     │
                       │   Port: 6379    │
                       └─────────────────┘
```

## 🌍 Cloud Deployment Options

### Option 1: AWS (Recommended)

**Infrastructure:**
- ECS Fargate for containers
- RDS PostgreSQL for database
- ElastiCache Redis for caching
- Application Load Balancer
- ECR for container registry

**Deploy Steps:**
1. Setup AWS credentials
2. Deploy infrastructure: `cd deploy/aws && terraform apply`
3. Push images to ECR
4. Deploy services with GitHub Actions

### Option 2: Google Cloud Platform

**Infrastructure:**
- Cloud Run for containers
- Cloud SQL for PostgreSQL
- Memory Store for Redis
- Cloud Load Balancing

### Option 3: Azure

**Infrastructure:**
- Container Instances
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Application Gateway

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```mermaid
graph LR
    A[Code Push] --> B[Test & Lint]
    B --> C[Security Scan]
    C --> D[Build Images]
    D --> E[Deploy to Staging]
    E --> F[Deploy to Production]
```

**Triggers:**
- `develop` branch → Staging deployment
- `main` branch → Production deployment
- Pull requests → Testing only

## 📁 Project Structure

```
tone-slyder/
├── backend/                    # Node.js API server
│   ├── src/
│   │   ├── api/               # REST endpoints
│   │   ├── core/              # Tone processing logic
│   │   ├── middleware/        # Auth, validation, etc.
│   │   └── services/          # External integrations
│   ├── Dockerfile
│   └── package.json
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── hooks/             # Custom hooks
│   │   └── types/             # TypeScript types
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── shared/                     # Shared utilities
├── deploy/                     # Cloud configurations
│   ├── aws/                   # AWS Terraform
│   ├── gcp/                   # GCP configs
│   └── azure/                 # Azure configs
├── scripts/                    # Database & utility scripts
├── docker-compose.yml          # Local development
└── .github/workflows/          # CI/CD pipelines
```

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# API Keys
OPENAI_API_KEY=sk-...
CLAUDE_API_KEY=sk-ant-...

# Database
DATABASE_URL=postgresql://user:pass@host:5432/toneslyder
REDIS_URL=redis://host:6379

# Security
JWT_SECRET=your-super-secure-secret-key

# Server
NODE_ENV=production
PORT=8080
```

### Environment-Specific Files

- `.env.development` - Local development
- `.env.staging` - Staging environment  
- `.env.production` - Production environment

## 🔒 Security Considerations

### API Security
- JWT authentication
- Rate limiting (100 req/min default)
- Input validation with Joi
- CORS configuration
- Helmet.js security headers

### Infrastructure Security
- Private subnets for databases
- Security groups restrict access
- Encrypted storage (RDS, Redis)
- SSL/TLS termination at load balancer

## 📊 Monitoring & Logging

### Application Monitoring
- Winston logging
- Health check endpoints
- Error tracking with Sentry (optional)
- Performance metrics

### Infrastructure Monitoring
- CloudWatch (AWS)
- Container insights
- Database performance metrics
- Cost tracking

## 🧪 Testing Strategy

### Test Types
- **Unit Tests**: Core logic modules
- **Integration Tests**: API endpoints
- **E2E Tests**: Full user workflows
- **Load Tests**: Performance validation

### Running Tests
```bash
# All tests
npm test

# Component-specific
npm run test:backend
npm run test:frontend

# With coverage
npm run test:coverage
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Backend: Multiple ECS tasks
- Frontend: CDN distribution
- Database: Read replicas
- Redis: Cluster mode

### Cost Optimization
- Request caching (10-minute TTL)
- Image optimization
- Auto-scaling based on CPU/memory
- Reserved instances for predictable workloads

## 🤝 Collaboration Workflow

### Branch Strategy
- `main` - Production code
- `develop` - Integration branch
- `feature/xyz` - Feature branches
- `hotfix/xyz` - Critical fixes

### Code Review Process
1. Create feature branch
2. Implement changes
3. Write tests
4. Create pull request
5. Code review & approval
6. Merge to develop
7. Deploy to staging
8. Merge to main for production

### Development Standards
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- 80%+ test coverage target

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear caches
   npm run clean
   docker system prune
   ```

2. **Database Connection Issues**
   ```bash
   # Check connection
   docker-compose logs postgres
   ```

3. **Environment Variables**
   ```bash
   # Verify .env file
   cat .env
   ```

### Support Channels
- GitHub Issues for bugs/features
- Discord: [Community Server]
- Documentation: [docs.toneslyder.com]

## 🔄 Deployment Commands

### Development
```bash
# Start everything
docker-compose up

# Backend only
npm run dev:backend

# Frontend only  
npm run dev:frontend
```

### Production
```bash
# Build images
docker build -t toneslyder-backend ./backend
docker build -t toneslyder-frontend ./frontend

# Deploy to AWS
cd deploy/aws
terraform init
terraform plan
terraform apply
```

### CI/CD
- Pushes to `develop` → Auto-deploy to staging
- Pushes to `main` → Auto-deploy to production
- Pull requests → Run tests only

---

## 🎯 Next Steps

1. Create GitHub repository
2. Set up cloud provider account
3. Configure secrets in GitHub
4. Deploy infrastructure
5. Invite collaborators
6. Start building features!

For detailed setup instructions, see the main [README.md](README.md).
