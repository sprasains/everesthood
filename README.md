# 🌟 Everhood - AI Vibe Hub for Gen-Z

**Everhood** is a production-grade, full-stack AI-powered platform designed for Gen-Z techies. It combines real-time AI news aggregation, LLM-based summarization, career roadmaps, and a premium freemium model — deployed on scalable cloud infrastructure using modern tools like Prisma, Next.js 14+, Stripe, and Azure.

![Everhood Banner](https://img.shields.io/badge/Everhood-AI%20Vibe%20Hub-8b5cf6?style=for-the-badge&logo=react)

---

## 🚀 Key Features

### 🎯 **Core Platform**

- ✅ **AI-Powered Summaries** - Personalized content summaries with 4 unique AI personas
- ✅ **Gen-Z Content Curation** - Real-time feeds from Hypebeast, The Tab, Dazed, Nylon
- ✅ **Gamified Learning** - XP system, streaks, achievements, and leaderboards
- ✅ **Social Community** - Discord-style social features and friend systems
- ✅ **Premium Subscription** - Stripe-powered freemium model with trials

### 🤖 **AI Personas**

- **ZenGPT** 🧘‍♀️ - Calm, mindful AI guide for balanced insights
- **HustleBot** 🔥 - High-energy startup mentor for growth focus
- **DataDaddy** 📊 - Analytical insights master with data-driven perspectives
- **CoachAda** 💪 - Supportive career coach for professional development

### 🌟 **Gen-Z Integration** (NEW!)

- **Left Content Panel** - Live feeds from popular Gen-Z websites
- **Trending Culture** - Fashion, tech, lifestyle content curation
- **Mobile-First UX** - TikTok-style interactions and gestures
- **Dark Mode** - Soft grays optimized for extended screen time

---

## 🆕 Major Recent Changes (2025)

### Database & Backend

- Added **Like** model for articles (many-to-many User <-> Article)
- Updated `User` and `Article` models for likes, and added `likeCount` field
- Created `/api/v1/articles/[articleId]/like` endpoint for like/unlike (with optimistic UI)
- News API now returns `likeCount` and `isLiked` for each article
- Community feature: `Post` model, `/api/v1/community/posts` API, and frontend page
- All Prisma schema changes require `npx prisma generate` after migration
- **Achievements API**: `/api/v1/achievements` returns all achievements and user's earned achievements
- **AchievementCard** UI and `/achievements` page: visually display all achievements, earned vs. locked
- **Achievement Service**: `src/lib/achievements.ts` awards achievements based on user actions
- **Seeding Script**: `scripts/seedAchievements.ts` seeds 20+ achievements into the database
- **Awarding Logic**: `/api/v1/user/progress/route.ts` now calls `awardAchievement` after stat updates (e.g., reading, streaks)
- **Scaffolded all navigation-linked pages**: `/summaries`, `/achievements`, `/community`, `/settings`, `/api-docs`, `/privacy`, `/terms`, `/security`, `/contact`
- **Modern MUI v7 Grid**: All grids updated to use `item` prop and breakpoint props for compatibility

### Frontend & UI

- News feed (`/news`) fully rebuilt with MUI v7 Grid, icon filters, and modern cards
- NewsCard now supports like/unlike with instant feedback
- Community page and SocialFeed now live and interactive
- Achievements page fetches and displays all achievements, with earned/locked distinction
- All dashboard sidebar/footer links scaffolded with placeholder pages
- Navbar, Sidebar, and Footer navigation fully mapped to pages

### DevOps & Misc

- Hardened Stripe flow: 30-day free trial, webhook userId logic
- Centralized NextAuth config, robust OAuth account linking
- Environment variables for all keys (see `.env`)
- **Instructions for dependency issues**: If you see MUI Grid errors, delete `node_modules` and `package-lock.json`, then run `npm install` and restart your dev server.

---

## 📦 Tech Stack

| Layer         | Technology Stack                                    |
| ------------- | --------------------------------------------------- |
| **Frontend**  | Next.js 14 (App Router), TailwindCSS, Framer Motion |
| **Backend**   | Node.js + TypeScript, Prisma ORM, RESTful APIs      |
| **AI Engine** | Google Gemini Pro, OpenAI (optional)                |
| **Database**  | PostgreSQL (via Prisma)                             |
| **Auth**      | NextAuth.js (Google, GitHub, Email/Password)        |
| **Payments**  | Stripe Subscriptions & Webhooks                     |
| **DevOps**    | Docker, Azure VM, Nginx, PM2                        |
| **PWA**       | Next-PWA, Service Workers, Offline Support          |

---

## 🏗️ Project Structure

```
everhood-platform/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (main)/            # Main app pages
│   │   │   ├── dashboard/     # User dashboard
│   │   │   ├── news/          # News feed with AI summaries
│   │   │   ├── subscribe/     # Stripe subscription flow
│   │   │   └── profile/       # User profile & settings
│   │   ├── api/v1/            # RESTful API routes
│   │   │   ├── news/          # Article management
│   │   │   ├── ai/summarize/  # AI summarization
│   │   │   ├── genz-content/  # Gen-Z content feeds
│   │   │   ├── user/          # User management
│   │   │   └── stripe/        # Payment processing
│   │   ├── globals.css        # TailwindCSS + custom styles
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── ui/                # UI components
│   │   │   ├── NewsCard.tsx   # Enhanced article cards
│   │   │   ├── GenZContentPanel.tsx # NEW: Gen-Z content sidebar
│   │   │   ├── StreakDisplay.tsx    # Gamification streaks
│   │   │   ├── PersonaSelector.tsx  # AI persona switcher
│   │   │   └── SocialFeed.tsx       # Community features
│   │   └── layout/            # Layout components
│   ├── lib/                   # Core utilities
│   │   ├── prisma.ts          # Database client
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── stripe.ts          # Stripe integration
│   │   ├── gemini.ts          # AI summarization
│   │   └── genz-sources.ts    # NEW: Gen-Z content sources
│   ├── hooks/                 # React hooks
│   │   ├── useUser.ts         # User state management
│   │   ├── useStreak.ts       # Gamification logic
│   │   └── useGenZContent.ts  # NEW: Gen-Z content hook
│   └── types/                 # TypeScript definitions
├── prisma/
│   └── schema.prisma          # Database schema with gamification
├── scripts/
│   ├── fetchNews.ts           # News aggregation cron
│   └── fetchGenZContent.ts    # NEW: Gen-Z content aggregation
├── public/
│   └── manifest.json          # PWA configuration
├── docker-compose.yml         # Full-stack development
├── Dockerfile                 # Production deployment
└── README.md                  # This file
```

---

## ⚡ Quick Start

### 🐳 **Option 1: Docker (Recommended)**

```bash
# Clone and setup
git clone <your-repo>
cd everhood-platform

# Copy environment variables
cp .env.example .env
# Edit .env with your API keys and secrets

# Run with Docker
docker-compose up --build

# Visit http://localhost:3000
```

### 💻 **Option 2: Local Development**

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma generate

# Start development server
npm run dev

# Run news aggregation (separate terminal)
npm run cron:news

# Run Gen-Z content aggregation (separate terminal)
npm run cron:genz
```

---

## 🔧 Environment Variables

Create a `.env` file with these required variables:

```env
# 🌐 App
NEXTAUTH_SECRET=your-super-secret-key-at-least-32-characters
NEXTAUTH_URL=http://localhost:3000

# 🔐 OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# 💳 Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 🧠 AI Services
GEMINI_API_KEY=your-gemini-api-key
NEWS_API_KEY=your-newsapi-key

# 🗄️ Database
DATABASE_URL=postgresql://user:password@localhost:5432/everhood

# 🧑 Admin
ADMIN_EMAIL=your-admin-email@example.com
```

---

## 🌟 New Gen-Z Features

### 📱 **Gen-Z Content Panel**

- **Live Feeds**: Real-time content from Hypebeast, The Tab, Dazed, Nylon
- **Category Filters**: Fashion, Culture, Tech, Lifestyle, Social
- **Engagement Metrics**: Track trending content and viral posts
- **Mobile Optimized**: Collapsible sidebar for mobile devices

### 🎮 **Enhanced Gamification**

- **XP System**: Earn points for reading, sharing, using AI summaries
- **Streak Tracking**: Daily and weekly engagement tracking
- **Achievements**: 20+ unlockable badges and milestones
- **Leaderboards**: Compete with friends and community

### 🤖 **AI Persona System**

- **ZenGPT**: Mindful, balanced content summaries
- **HustleBot**: High-energy startup and growth insights
- **DataDaddy**: Data-driven analysis with charts and metrics
- **CoachAda**: Career-focused guidance and encouragement

---

## 🚀 Deployment

### 🌊 **Azure VM Deployment**

```bash
# On your Azure VM (Ubuntu 22.04)
sudo apt update
sudo apt install nodejs npm nginx postgresql

# Clone your repository
git clone <your-repo>
cd everhood-platform

# Install dependencies
npm install
npx prisma migrate deploy
npm run build

# Start with PM2
npm install -g pm2
pm2 start npm --name "everhood" -- start

# Setup Nginx reverse proxy
sudo nano /etc/nginx/sites-available/everhood
# Add Nginx configuration

# Enable HTTPS with Certbot
sudo certbot --nginx -d yourdomain.com
```

### 🐳 **Docker Production**

```bash
# Build production image
docker build -t everhood-platform .

# Run with environment variables
docker run -p 3000:3000 --env-file .env everhood-platform
```

---

## 🧪 Scripts & Automation

| Command                  | Description                |
| ------------------------ | -------------------------- |
| `npm run dev`            | Start development server   |
| `npm run build`          | Build for production       |
| `npm run start`          | Start production server    |
| `npm run lint`           | Lint codebase              |
| `npm run cron:news`      | Fetch latest news articles |
| `npm run cron:genz`      | Fetch Gen-Z content        |
| `npx prisma studio`      | Open database GUI          |
| `npx prisma migrate dev` | Run database migrations    |

---

## 📊 API Documentation

### **Core Endpoints**

```typescript
// News & Content
GET    /api/v1/news                    # Fetch articles
GET    /api/v1/genz-content           # Fetch Gen-Z content
POST   /api/v1/ai/summarize           # Generate AI summary

// User Management
GET    /api/v1/user/profile           # Get user data
PATCH  /api/v1/user/profile           # Update user
POST   /api/v1/user/progress          # Track user activity

// Payments
POST   /api/v1/stripe/create-checkout-session  # Create payment
POST   /api/v1/stripe/webhook                  # Handle webhooks

// Authentication
POST   /api/v1/auth                   # Signup/Signin
```

### **Example API Usage**

```typescript
// Generate AI Summary
const response = await fetch("/api/v1/ai/summarize", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    content: "Article content here...",
    persona: "HustleBot",
  }),
});
const { summary } = await response.json();
```

---

## 🎯 Roadmap

### **Phase 1: Core Platform** ✅

- [x] Authentication system
- [x] AI summarization
- [x] News aggregation
- [x] Stripe payments
- [x] Basic gamification

### **Phase 2: Gen-Z Features** ✅

- [x] Gen-Z content panel
- [x] Enhanced UI/UX
- [x] Persona system
- [x] Social features
- [x] Mobile optimization

### **Phase 3: Advanced Features** 🚧

- [ ] Real-time chat/community
- [ ] Advanced analytics dashboard
- [ ] Custom AI training
- [ ] Influencer partnerships
- [ ] Mobile app (React Native)

### **Phase 4: Scale & Growth** 📋

- [ ] Multi-language support
- [ ] Advanced personalization
- [ ] Enterprise features
- [ ] API marketplace
- [ ] Global expansion

---

## 👥 Contributing

We welcome contributions from the community! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. \*\*Open a Pull Request`

### **Development Guidelines**

- Follow TypeScript best practices
- Use TailwindCSS for styling
- Write tests for new features
- Update documentation
- Ensure mobile responsiveness

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Prisma Team** - For the excellent database toolkit
- **Stripe** - For seamless payment processing
- **Google AI** - For Gemini Pro API
- **Gen-Z Community** - For inspiration and feedback

---

## 📞 Support

- **Documentation**: [docs.everhood.ai](https://docs.everhood.ai)
- **Discord Community**: [discord.gg/everhood](https://discord.gg/everhood)
- **Email Support**: [hello@everhood.ai](mailto:hello@everhood.ai)
- **GitHub Issues**: [Create an Issue](https://github.com/everhood/issues)

---

<div align="center">

**Built with 💜 for Gen-Z by Gen-Z**

[Website](https://everhood.ai) • [Documentation](https://docs.everhood.ai) • [Discord](https://discord.gg/everhood) • [Twitter](https://twitter.com/everhood)

</div>
