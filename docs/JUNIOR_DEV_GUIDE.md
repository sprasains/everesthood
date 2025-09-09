# 🚀 EverestHood Developer Guide

Welcome to EverestHood! This guide will help you get started with our codebase. We've designed it to be as beginner-friendly as possible. Let's get you up and running!

## 📚 Table of Contents
1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Tech Stack](#tech-stack)
4. [Development Environment](#development-environment)
5. [News & Content Curation](#news--content-curation)
6. [Debugging & Troubleshooting](#debugging--troubleshooting)
7. [Common Tasks](#common-tasks)
8. [Tips and Tricks](#tips-and-tricks)

## 🎬 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Git
- VS Code (recommended)

### First-Time Setup
```bash
# 1. Clone the repository
git clone https://github.com/sprasains/everesthood.git
cd everesthood

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

### 🔑 Environment Variables
Copy these into your `.env.local` file:
```env
# Database (Required)
DATABASE_URL="postgresql://username:password@localhost:5432/everesthood"

# Authentication (Required)
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Redis (Required for queues)
REDIS_URL="redis://localhost:6379"

# News & Content Curation (Optional)
NEWS_API_KEY="your-news-api-key"
RSS_FETCH_INTERVAL="3600"

# Optional Services
STRIPE_SECRET_KEY="your-stripe-key"
AWS_ACCESS_KEY="your-aws-key"
AWS_SECRET_KEY="your-aws-secret"
```

## 📁 Project Structure

```plaintext
everestHood/
├── app/                    # Next.js 13 App Router pages
│   ├── api/               # API routes
│   ├── (auth)/           # Authentication pages
│   ├── (dashboard)/      # Dashboard pages
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── forms/           # Form components
│   └── nav/             # Navigation components
├── lib/                 # Utility functions and shared code
│   ├── api/             # API utilities
│   ├── auth/            # Authentication helpers
│   ├── db/              # Database utilities
│   └── utils/           # General utilities
├── prisma/              # Database schema and migrations
├── public/              # Static files
└── styles/              # Global styles
```

### 📦 Key Folders Explained

#### `app/` - Pages and Routes
- Uses Next.js 13 App Router
- Each folder represents a route
- `layout.tsx` files define shared layouts
- `page.tsx` files are the actual pages
- `loading.tsx` files show loading states
- `error.tsx` files handle errors

#### `components/` - React Components
- `ui/` - Basic UI components (buttons, inputs, etc.)
- `forms/` - Form-related components
- `nav/` - Navigation-related components
- All components are TypeScript/React components

#### `lib/` - Shared Code
- `api/` - API-related utilities
- `auth/` - Authentication helpers
- `db/` - Database utilities
- `utils/` - General utility functions

#### `prisma/` - Database
- `schema.prisma` - Database schema
- `migrations/` - Database migrations
- `seed.ts` - Seed data for development

## 🛠 Tech Stack

### Core Technologies
- **Next.js 13+**: React framework with App Router
- **React 18+**: UI library
- **TypeScript**: Type-safe JavaScript
- **Prisma**: Database ORM
- **PostgreSQL**: Main database
- **Redis**: Queue and caching
- **TailwindCSS**: Utility-first CSS

### Key Packages
```json
{
  "dependencies": {
    "next": "^13.4.0",
    "react": "^18.2.0",
    "typescript": "^5.0.0",
    "@prisma/client": "^4.14.0",
    "next-auth": "^4.22.1",
    "tailwindcss": "^3.3.0",
    "zod": "^3.21.4",
    "redis": "^4.6.7",
    "bullmq": "^4.1.0"
  }
}
```

## 📰 News & Content Curation

### Overview
The News & Content Curation system is a comprehensive feature that provides personalized news feeds, content aggregation, and AI-powered recommendations. It's designed to keep users informed with relevant, curated content.

### Key Components

#### Database Models
```typescript
// News Source - Where content comes from
model NewsSource {
  id          String         @id @default(cuid())
  name        String         // "TechCrunch", "Hacker News"
  url         String         // RSS feed or API endpoint
  type        NewsSourceType // RSS, API, MANUAL, SCRAPED
  isActive    Boolean        @default(true)
  categories  NewsCategory[] // TECHNOLOGY, BUSINESS, etc.
  tags        String[]       // ["ai", "startup", "funding"]
}

// News Article - Individual articles
model NewsArticle {
  id          String            @id @default(cuid())
  sourceId    String
  title       String
  content     String
  summary     String?
  url         String
  imageUrl    String?
  category    NewsCategory      // TECHNOLOGY, AI_ML, etc.
  tags        String[]
  viewCount   Int               @default(0)
  likeCount   Int               @default(0)
  isFeatured  Boolean           @default(false)
  isTrending  Boolean           @default(false)
  source      NewsSource        @relation(fields: [sourceId], references: [id])
}

// User Preferences - Personalization
model UserNewsPreference {
  id         String        @id @default(cuid())
  userId     String
  categories NewsCategory[] // User's preferred categories
  sources    String[]      // Preferred news sources
  tags       String[]      // Keywords of interest
  keywords   String[]      // Custom keywords
}
```

#### API Endpoints

**Get Personalized News Feed**
```typescript
// GET /api/news?category=TECHNOLOGY&page=1&limit=20
const response = await fetch('/api/news?category=TECHNOLOGY');
const { articles, pagination } = await response.json();
```

**Interact with Articles**
```typescript
// Like an article
await fetch(`/api/news/${articleId}/interact`, {
  method: 'POST',
  body: JSON.stringify({ type: 'like' })
});

// Bookmark an article
await fetch(`/api/news/${articleId}/interact`, {
  method: 'POST',
  body: JSON.stringify({ type: 'bookmark' })
});
```

**Manage User Preferences**
```typescript
// Update preferences
await fetch('/api/news/preferences', {
  method: 'PUT',
  body: JSON.stringify({
    categories: ['TECHNOLOGY', 'AI_ML', 'PROGRAMMING'],
    keywords: ['react', 'typescript', 'nextjs']
  })
});
```

#### Frontend Components

**News Feed Page (`/news`)**
- Personalized article feed
- Advanced filtering and search
- Tabbed navigation (All, Featured, Trending, Bookmarks)
- User preferences management

**Article Detail Page (`/news/[id]`)**
- Full article content
- Engagement features (like, share, bookmark)
- Source information
- Related articles

**Admin Source Management (`/news/sources`)**
- Add/edit news sources
- Configure RSS feeds and APIs
- Monitor source performance
- Content curation tools

### Content Categories
The system supports 18 different categories:
- **Technology**: Tech news, gadgets, software updates
- **AI/ML**: Artificial intelligence, machine learning
- **Programming**: Software development, coding

## 🔧 Debugging & Troubleshooting

### Quick Debug Commands
```bash
# Start with debug mode enabled
npm run debug

# Check system health
npm run debug:health

# View real-time logs
npm run debug:logs

# Open debug panel
npm run debug:panel

# Check environment variables
npm run debug:env

# View performance metrics
npm run debug:performance
```

### Debug Panel
The debug panel is your best friend when things go wrong! Access it at:
- **URL**: `http://localhost:3000/debug`
- **Access**: Requires admin user role
- **Features**: 
  - System health monitoring
  - Error log viewer with filtering
  - API request/response debugging
  - Database query tool
  - Environment variables checker

### Common Debugging Scenarios

#### 1. API Not Responding
```bash
# Check system health
npm run debug:health

# View recent requests
npm run debug:requests

# Check error logs
npm run debug:logs
```

#### 2. Database Issues
```bash
# Check database health
npm run debug:health

# Test database connection
curl http://localhost:3000/api/debug/database?model=User&limit=1

# View database schema
npm run debug:schema
```

#### 3. Authentication Problems
```bash
# Check environment variables
npm run debug:env

# Test authentication endpoint
curl -X POST http://localhost:3000/api/debug/test \
  -H "Content-Type: application/json" \
  -d '{"method":"GET","url":"http://localhost:3000/api/auth/session"}'
```

#### 4. Performance Issues
```bash
# Check performance metrics
npm run debug:performance

# Monitor system resources
npm run debug:health
```

### Debug API Endpoints
All debug endpoints require admin privileges:

- **`/api/debug/health`** - System health monitoring
- **`/api/debug/logs`** - Error log viewer with filtering
- **`/api/debug/requests`** - API request/response debugging
- **`/api/debug/database`** - Database query tool
- **`/api/debug/performance`** - Performance metrics
- **`/api/debug/env`** - Environment variables checker
- **`/api/debug/schema`** - Database schema inspector
- **`/api/debug/trace`** - Request flow tracer
- **`/api/debug/test`** - API endpoint testing tool

### Log Analysis
```bash
# View all logs
npm run debug:logs

# View only errors
npm run debug:errors

# View only warnings
npm run debug:warnings

# View only info logs
npm run debug:info
```

### Database Debugging
```bash
# Open Prisma Studio
npm run debug:db

# Test database query
curl -X POST http://localhost:3000/api/debug/database \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT COUNT(*) FROM User"}'
```

### Redis Debugging
```bash
# Monitor Redis commands
npm run debug:redis

# Check cache contents
npm run debug:cache
```

### Queue Debugging
```bash
# Open BullMQ dashboard
npm run debug:queue

# Check queue health
curl http://localhost:3000/api/queue/health
```

### Emergency Procedures
If something goes really wrong:

1. **Check logs first**: `npm run debug:logs`
2. **Check system health**: `npm run debug:health`
3. **Check environment**: `npm run debug:env`
4. **Restart services**: `docker-compose restart` (if using Docker)
5. **Check documentation**: [docs/DEBUGGING.md](./DEBUGGING.md)

### Best Practices
1. **Always check logs first** - Most issues are visible in logs
2. **Use the debug panel** - It provides a comprehensive system overview
3. **Test API endpoints** - Verify functionality step by step
4. **Monitor performance** - Keep an eye on system resources
5. **Document issues** - Keep track of problems and solutions
- **Business**: Corporate news, market updates
- **Science**: Scientific discoveries, research
- **Health**: Medical news, wellness
- **Entertainment**: Movies, TV, music
- **Sports**: Athletic events, team news
- **Politics**: Government, policy, elections
- **Education**: Academic news, learning
- **Lifestyle**: Fashion, travel, food
- **Gaming**: Video games, esports
- **Startups**: Startup news, funding
- **Crypto**: Cryptocurrency, blockchain
- **Other**: Miscellaneous content

### AI-Powered Recommendations
The system uses a hybrid recommendation algorithm:

1. **Preference-based**: Matches user's selected categories and sources
2. **Trending**: Identifies popular content based on engagement
3. **Similar Content**: Finds articles similar to user's liked content
4. **Hybrid**: Combines all approaches for optimal recommendations

### Admin Features
- **Content Curation**: Feature articles for homepage promotion
- **Trending Management**: Mark articles as trending
- **Source Management**: Add/edit news sources and RSS feeds
- **Analytics**: Track engagement and performance metrics
- **Moderation**: Archive or remove inappropriate content

### Development Tips

**Adding a New News Source**
```typescript
// 1. Create source via API
const source = await fetch('/api/news/sources', {
  method: 'POST',
  body: JSON.stringify({
    name: 'New Tech Blog',
    url: 'https://example.com/rss',
    type: 'RSS',
    categories: ['TECHNOLOGY'],
    tags: ['tech', 'innovation']
  })
});

// 2. The system will automatically fetch and process articles
```

**Customizing User Preferences**
```typescript
// Users can customize their feed by updating preferences
const preferences = {
  categories: ['TECHNOLOGY', 'AI_ML'], // Preferred categories
  sources: ['source-id-1', 'source-id-2'], // Trusted sources
  keywords: ['react', 'typescript'], // Keywords of interest
  tags: ['frontend', 'webdev'] // Topic tags
};
```

**Content Curation Workflow**
```typescript
// Admins can curate content
await fetch('/api/news/curate', {
  method: 'POST',
  body: JSON.stringify({
    action: 'feature', // or 'trending', 'archive'
    articleIds: ['article-1', 'article-2'],
    reason: 'High engagement and quality content'
  })
});
```

### Testing the News System

**1. Access the News Feed**
- Navigate to `http://localhost:3000/news`
- Browse articles and test filtering
- Try different categories and sources

**2. Test User Interactions**
- Like, share, and bookmark articles
- Check that interactions are saved
- Verify engagement counts update

**3. Test Personalization**
- Update your news preferences
- Check that the feed updates accordingly
- Test the recommendation system

**4. Admin Features (Admin Role Required)**
- Navigate to `http://localhost:3000/news/sources`
- Add a new RSS feed source
- Test content curation tools

### Common Issues and Solutions

**Issue**: News feed is empty
**Solution**: Check if news sources are active and have fetched articles

**Issue**: Recommendations not working
**Solution**: Ensure user has set preferences and interacted with articles

**Issue**: RSS feeds not updating
**Solution**: Check source configuration and fetch intervals

**Issue**: Admin features not accessible
**Solution**: Verify user has ADMIN or SUPER_ADMIN role

## 💻 Development Environment

### VS Code Setup
1. Install recommended extensions:
   - ESLint
   - Prettier
   - Prisma
   - Tailwind CSS IntelliSense
   - GitLens

2. Recommended settings.json:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Running the Project
```bash
# Development mode
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Testing
npm run test
npm run test:e2e

# Building for production
npm run build
```

## 🔨 Common Tasks

### Creating a New Page
1. Create a new folder in `app/`
2. Add `page.tsx` inside the folder:
```tsx
export default function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
    </div>
  );
}
```

### Adding an API Route
1. Create a new file in `app/api/`
2. Use this template:
```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  try {
    // Your code here
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Creating a New Component
1. Create a new file in `components/`
2. Use this template:
```tsx
'use client';

interface Props {
  // Define your props here
}

export function MyComponent({ /* props */ }: Props) {
  return (
    <div>
      {/* Your component content */}
    </div>
  );
}
```

### Database Operations
1. Check the schema in `prisma/schema.prisma`
2. Use the Prisma client:
```typescript
import { prisma } from '@/lib/prisma';

// Create
const user = await prisma.user.create({
  data: {
    name: 'John',
    email: 'john@example.com',
  },
});

// Read
const users = await prisma.user.findMany({
  where: {
    isActive: true,
  },
});

// Update
const updated = await prisma.user.update({
  where: { id: userId },
  data: { name: 'New Name' },
});

// Delete
const deleted = await prisma.user.delete({
  where: { id: userId },
});
```

## 💡 Tips and Tricks

### TypeScript
- Use `zod` for runtime type validation
- Enable strict mode in `tsconfig.json`
- Use type inference when possible
- Create types for API responses

### Next.js
- Use Server Components by default
- Add 'use client' for client components
- Use route handlers for API endpoints
- Implement proper error boundaries

### Prisma
- Run migrations with `npx prisma migrate dev`
- Generate types with `npx prisma generate`
- Use Prisma Studio with `npx prisma studio`

### State Management
- Use React Query for server state
- Use React Context for global state
- Use local state for component state

### Performance
- Use Image component for images
- Implement proper loading states
- Use proper error boundaries
- Optimize database queries

## 🎯 Common Problems and Solutions

### Database Connection Issues
```bash
# Reset database
npx prisma migrate reset

# Update schema
npx prisma generate
npx prisma migrate dev
```

### Type Errors
```bash
# Clear TypeScript cache
rm -rf .next
rm -rf node_modules/.cache

# Regenerate Prisma types
npx prisma generate
```

### Build Errors
```bash
# Clean install
rm -rf node_modules
rm -rf .next
npm install

# Clear cache and rebuild
npm run clean
npm run build
```

## 🎓 Learning Resources

### Official Docs
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

### Internal Resources
- [API Documentation](./API.md)
- [Component Library](./COMPONENTS.md)
- [Database Schema](./SCHEMA.md)

## 🤝 Need Help?

1. Check the documentation first
2. Search existing issues on GitHub
3. Ask in the #dev-help Slack channel
4. Reach out to your mentor

Remember: There are no stupid questions! We're here to help you succeed. 🌟
