# BYOK AI App Marketplace

**Cloud-First AI Application Platform** - The marketplace where developers create specialized AI applications with optimized cloud provider integration. Built for rapid scaling and profitability using proven BYOK (Bring Your Own Key) architecture.

## 🎯 Strategic Focus: Cloud-Optimized Performance

Based on extensive research of successful AI wrapper apps, we prioritize **cloud providers** for reliability and cost-effectiveness:
- **Gemini Flash**: $0.075/1M tokens (most cost-effective)
- **Claude 3 Haiku**: $0.25/1M tokens (fastest response)  
- **GPT-4o Mini**: $0.15/1M tokens (most popular)

**Target**: $10K+ MRR within 6-12 months following proven solo developer blueprint.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Auth0 account
- Git

### Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd marketplace-platform
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

3. **Database Setup**
   ```bash
   # Run database migrations
   npm run db:migrate
   
   # Seed with sample data (optional)
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to see the marketplace.

## 🏗️ Architecture

Built as a modular monolith supporting hybrid AI infrastructure:
- **Next.js 14+** with App Router and TypeScript
- **PostgreSQL** with Prisma ORM for app runtime and execution tracking
- **Auth0** authentication with MFA support
- **Tailwind CSS** for styling
- **BYOK Security** with Google Cloud KMS encryption
- **Multi-Provider Integration**: OpenAI, Anthropic, Google AI, Azure OpenAI
- **Local AI Support**: Ollama, LlamaC++, GGML integration
- **App Runtime Environment**: Sandboxed JavaScript/Python execution

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (dashboard)/       # Protected dashboard routes
│   └── globals.css
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── features/         # Feature-specific components
│   └── layouts/          # Layout components
├── lib/                  # Utilities and services
│   ├── auth/            # Authentication logic
│   ├── db/              # Database connection
│   └── utils/           # Helper functions
├── types/               # TypeScript definitions
└── constants/           # App constants
```

## 🔑 Key Features

### For Developers 🧑‍💻
- **App Runtime Environment**: Deploy JavaScript/Python AI apps in sandboxed containers
- **Multi-Provider SDK**: Build once, run on any AI provider (cloud + local)
- **Revenue Model**: Monetize specialized AI applications through the marketplace
- **Developer Tools**: Templates, CLI tools, and comprehensive documentation
- **Local AI Integration**: Support Ollama, LlamaC++, and custom models
- **Analytics Dashboard**: Track app performance, usage, and revenue

### For Users 🎯
- **Hybrid AI Choice**: Use cloud APIs (OpenAI, Anthropic) or local models (Ollama)
- **Cost Optimization**: 50-90% savings vs AI subscriptions through BYOK
- **Privacy Control**: Keep sensitive data local with on-device AI processing
- **Specialized Apps**: Access professional tools built for specific industries
- **Usage Analytics**: Transparent cost tracking across all AI providers
- **Enterprise Security**: Google Cloud KMS encryption and audit trails

### For Enterprises 🏢
- **Compliance Ready**: HIPAA, SOC2, GDPR-compatible architecture
- **Vendor Independence**: No lock-in to single AI provider
- **Cost Transparency**: Detailed usage and cost analytics
- **Local Deployment**: Run AI entirely on-premises for sensitive data
- **Team Management**: Centralized billing and usage controls

## 🛠️ Development

### 🚨 Server Stability & Troubleshooting

**IMPORTANT:** Before development, review our server stability documentation:

- 📋 [Development Checklist](./docs/DEVELOPMENT_CHECKLIST.md) - **MANDATORY** pre-change verification
- 🔧 [Server Troubleshooting Guide](./SERVER_TROUBLESHOOTING.md) - Complete recovery procedures  
- ⚡ [Quick Reference Card](./docs/QUICK_REFERENCE.md) - Emergency procedures (2-minute recovery)
- 🤖 [Agent Directive Template](./docs/AGENT_DIRECTIVE_TEMPLATE.md) - For AI development assistants
- 📝 [Error Resolution Log](./docs/ERROR_RESOLUTION_LOG.md) - Historical issues and solutions

### Available Scripts

```bash
# Development
npm run dev              # Start development server with app runtime
npm run build           # Build marketplace platform for production
npm run start           # Start production server

# Server Health & Monitoring (NEW)
npm run health-check     # Verify server health and critical endpoints
npm run test-endpoints   # Test all critical routes and API endpoints
npm run pre-change-check # Complete pre-development verification
npm run post-change-verify # Verify stability after changes
npm run emergency-restart # Emergency server recovery procedure
npm run server-status    # Check what's running on port 3000
npm run monitor-logs     # Monitor logs for errors and warnings
npm run validate-env     # Check development environment setup

# Database
npm run db:migrate      # Apply database schema with app runtime models
npm run db:seed         # Seed with sample developer apps and runtimes
npm run db:studio       # Open Prisma Studio to manage app data
npm run db:reset        # Reset database (removes all apps and executions)

# Developer Tools
npm run app:create      # Create new app template
npm run app:deploy      # Deploy app to marketplace
npm run app:test        # Test app runtime environment

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript checks
npm run format          # Format code with Prettier
npm run test            # Run tests including app runtime tests
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

- **Database**: PostgreSQL connection string for app runtime storage
- **Auth0**: Authentication configuration with MFA for developers/users
- **Google Cloud KMS**: API key encryption and app runtime security
- **Stripe**: Payment processing for developer revenue sharing
- **App Runtime**: Container configuration for sandboxed execution
- **Local AI**: Ollama server configuration and model paths

## 🔐 Security

- **Google Cloud KMS**: Enterprise-grade API key encryption and app secrets
- **Sandboxed Execution**: App runtime isolation with resource limits
- **BYOK Architecture**: Users maintain complete control of AI provider keys
- **Multi-Tenant Security**: Isolated app execution environments
- **Audit Trails**: Complete logging of app executions and API usage
- **Role-Based Access**: User, developer, enterprise admin, and platform admin roles
- **Zero-Trust Model**: All API calls authenticated and encrypted

## 💰 Developer Economics

**For Platform Operators:**
- Target operational costs: <$200/month
- Vercel Pro deployment (~$20/month)
- PostgreSQL with app runtime storage (~$25/month)
- Google Cloud KMS (~$5/month)
- Container runtime infrastructure (~$50/month)
- Auth0 Developer tier (~$35/month)

**For Developers:**
- 15% platform commission on app revenue
- Free app hosting and runtime execution
- Built-in payment processing and analytics
- No upfront costs or monthly fees

**For Users:**
- 50-90% cost savings vs AI subscriptions
- Pay only for actual AI usage (cloud or local)
- No monthly subscription fees
- Transparent per-token pricing

## 📊 Analytics & Monitoring

**App Performance:**
- Real-time execution metrics and latency tracking
- Error rates and debugging information
- Resource usage (CPU, memory, tokens)
- Success rates across different AI providers

**Business Intelligence:**
- App popularity and download statistics
- Developer revenue and commission tracking
- User engagement and retention metrics
- Cost optimization recommendations

**Platform Health:**
- Infrastructure performance and uptime
- Security events and audit trails
- API rate limiting and usage patterns
- Local AI model performance vs cloud APIs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📚 Documentation

- [Developer Guide](./docs/developers/README.md) - Build and deploy apps
- [App Runtime API](./docs/runtime/README.md) - Execution environment docs
- [Local AI Integration](./docs/local-ai/README.md) - Ollama and local model setup
- [Architecture Guide](./docs/architecture/README.md) - Platform architecture
- [API Documentation](./docs/api/) - REST API reference
- [Security Guide](./docs/security/README.md) - BYOK and encryption details

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: [docs.aiappmarketplace.com](https://docs.aiappmarketplace.com)
- **Issues**: [GitHub Issues](https://github.com/aiappmarketplace/platform/issues)
- **Support**: [support@aiappmarketplace.com](mailto:support@aiappmarketplace.com)

---

## 🎯 Market Opportunity

Based on comprehensive market research, the BYOK developer marketplace addresses a $432B opportunity gap where only 3-5% of 1.7B AI users convert to subscriptions. Key drivers:

- **Professional Demand**: Legal AI adoption jumped 19% to 79% in one year
- **Cost Savings**: BYOK offers 50-90% savings vs AI subscriptions  
- **Privacy Requirements**: 60% of knowledge workers limit AI use due to privacy concerns
- **Local AI Growth**: r/LocalLLaMA community grew 179.6% annually to 483K+ members

**Target Markets:**
- **Legal Tech**: $3.9B-$14.62B projected by 2030
- **Healthcare AI**: $187.69B by 2030 (36.76% CAGR)  
- **Developer Tools**: $33B+ market with 76% AI adoption
- **Enterprise Compliance**: HIPAA, SOC2, GDPR-ready architecture

Built with ❤️ to democratize AI development and give users control over their AI infrastructure.