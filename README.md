# 🌟 Everhood - AI Vibe Hub for Gen-Z

## 🫂 Social & Gamification Hub (Friends & Achievements)

### 👫 Friends System

- **My Friends Page**: Manage your connections, view profiles, and unfriend users.
- **FriendCard Component**: Shows avatar, name, “Friends since…”, and actions.
- **Friend API Endpoints:**
  - `GET /api/v1/friends` — List your friends (id, name, avatar, since).
  - `DELETE /api/v1/friends/{friendId}` — Unfriend a user.
- **News Feed Filtering**: The News Feed’s “Following” tab shows only posts from your friends (`/api/v1/community/posts?filter=following`).
- **Seeded Social Graph**: The database is seeded with at least 10 friends for the main test user, and each friend has posts.

### 🏆 Achievements & Gamification

- **Achievements Page**: See all possible achievements, your unlocked ones, and progress.
- **AchievementCard Component**: Shows icon, name, description, unlock status, and date.
- **Gamification API Endpoints:**
  - `GET /api/v1/achievements` — List all master achievements.
  - `GET /api/v1/user/achievements` — List achievements unlocked by the current user.
- **Progress Bar**: Shows how many achievements you’ve unlocked.
- **Seeded Achievements**: At least 10 achievements exist, with 3–4 unlocked for the main user.

### 🔗 API Endpoints (Extended)

```typescript
// Social (Friends)
GET    /api/v1/friends                  # List your friends
DELETE /api/v1/friends/{friendId}       # Unfriend a user

// Community Posts
GET    /api/v1/community/posts?filter=following   # Posts from friends only

// Achievements
GET    /api/v1/achievements             # All achievements
GET    /api/v1/user/achievements        # User's unlocked achievements
```

### 🧩 Integration

- **Dashboard**: Friends count and achievements progress are shown in widgets.
- **News Feed**: “Following” tab is personalized to your social graph.
- **Community**: User and friend data is deeply integrated for a vibrant, interactive experience.

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

#### Database & Backend

- **Tipping System**: Added `isVerifiedCreator`, `tippingBalance`, and `creatorBalance` fields to `User` model.
  - Created `/api/v1/posts/[postId]/tip` endpoint for tipping functionality.
  - Updated Prisma schema and migrations for tipping system.
- **Profile Spotlight Microtransaction**: Added `profileSpotlightEndsAt` to `User` model.
  - Stripe integration for spotlight purchases.
  - Webhook logic to update spotlight status.
- **Resume Vibe Check**: Backend API scaffold at `/api/v1/resume/analyze` for AI resume analysis.
  - Frontend UI for uploading resumes and displaying feedback.

#### Frontend & UI

- **AppSidebar**: Unified navigation hub for all features.
  - Includes links to `/careers`, `/exclusive`, `/friends`, and more.
- **Dashboard Revamp**: Transformed into a dynamic "Command Center".
  - Added widgets for community feed, opportunities, and streak display.
- **Tipping UI**: Integrated tipping functionality into `PostCard`.
  - Placeholder button for tipping creators.
- **Profile Spotlight UI**: Placeholder UI for purchasing and viewing spotlight status.

#### DevOps & Misc

- Prisma migrations for tipping system and spotlight microtransactions.
- Hardened Stripe webhook logic for spotlight purchases.

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
├── app/                       # Next.js 14 App Router (routes, pages, API)
│   ├── components/            # Reusable UI and feature components
│   ├── api/                   # API routes (RESTful endpoints)
│   └── ...                    # Other app features (dashboard, news, etc.)
├── src/
│   ├── agents/                # Agent logic and registry
│   ├── scheduler/             # Job scheduling logic
│   ├── types/                 # TypeScript type definitions (NextAuth, Prisma, etc.)
│   ├── prisma/                # Prisma schema, seeds, and migrations
│   ├── tests/                 # E2E and integration tests
│   └── ...
├── lib/                       # Shared libraries and utilities (auth, redis, stripe, etc.)
├── worker/                    # Worker service (job queue, background jobs)
│   └── Dockerfile             # Worker Dockerfile
├── migrations/                # Prisma migration files
├── public/                    # Static assets and PWA files
├── scripts/                   # Data aggregation and cron scripts
├── fix-error-message-access.js      # Script: Fix unsafe error.message access
├── fix-use-client-directive.js      # Script: Add 'use client' directive
├── fix-import-paths.js              # Script: Log broken import paths
├── fix-missing-exports.js           # Script: Add missing exports
├── fix-mui-required-props.js        # Script: Log MUI required prop issues
├── fix-mui-grid-to-box.js           # Script: Log MUI Grid usages
├── fix-implicit-any.js              # Script: Log implicit any issues
├── fix-lint-errors.js               # Script: Auto-fix lint errors
├── package.json                # NPM scripts and dependencies
├── Dockerfile                  # Main app Dockerfile
├── docker-compose.yml          # Multi-service orchestration
└── README.md                   # This file
```

---

## 🤖 Automated Fix Scripts

A suite of Node.js scripts is provided in the project root to help you automatically find and fix common build and lint errors. These scripts can be run individually or collectively via npm scripts.

| Command                        | Description                                                      |
| ------------------------------ | ---------------------------------------------------------------- |
| `npm run fix:use-client-directive` | Add 'use client' to .tsx files using client-only features         |
| `npm run fix:import-paths`         | Log potentially broken or incorrect import paths                  |
| `npm run fix:missing-exports`      | Add missing export statements to top-level declarations           |
| `npm run fix:mui-required-props`   | Log MUI components missing required props                         |
| `npm run fix:mui-grid-to-box`      | Log all usages of <Grid> from MUI for refactor                    |
| `npm run fix:implicit-any`         | Log all function params/vars with implicit any                    |
| `npm run fix:error-message-access` | Fix unsafe error.message access in catch blocks                   |
| `npm run fix:lint`                 | Run ESLint with --fix to auto-fix lint errors                     |
| `npm run fix:all`                  | Run all the above fix scripts in sequence                         |

**Usage Example:**
```bash
npm run fix:all
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
GET    /api/v1/posts                    # Fetch posts (consolidated, replaces /news and /community/posts)
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

**Note:** Deprecated endpoints such as `/api/v1/news`, `/api/v1/community/posts`, `/api/v1/articles/[articleId]/like`, `/favorite`, `/repost` have been removed. Use `/api/v1/posts` for all post/article actions.

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
