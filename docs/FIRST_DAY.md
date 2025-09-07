# 👋 Your First Day at EverestHood

Welcome to the team! This guide will help you get everything set up and running on your first day. Let's make your onboarding as smooth as possible!

## 📋 First Day Checklist

### 1. 🔧 Development Environment Setup
- [ ] Install Node.js (v18+)
- [ ] Install Git
- [ ] Install VS Code
- [ ] Install PostgreSQL
- [ ] Install Redis

### 2. 🛠 Project Setup
```bash
# Clone the repository
git clone https://github.com/sprasains/everesthood.git
cd everesthood

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Start development server
npm run dev
```

### 3. 📚 VS Code Extensions
Install these essential extensions:
- [ ] ESLint
- [ ] Prettier
- [ ] Prisma
- [ ] Tailwind CSS IntelliSense
- [ ] GitLens

### 4. 🎨 VS Code Settings
Copy these settings (Cmd/Ctrl + Shift + P → "Preferences: Open Settings (JSON)"):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## 🗺 Project Overview

### Key Technologies
- **Frontend**: Next.js 13, React 18, TypeScript
- **Styling**: TailwindCSS, Material-UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma
- **Authentication**: NextAuth.js
- **State Management**: React Query, Context API
- **Testing**: Jest, Testing Library
- **Queue System**: BullMQ with Redis
- **Content Management**: News aggregation, RSS feeds, content curation

### Main Folders
```
everestHood/
├── app/             # Pages and API routes
│   ├── news/        # News & Content Curation pages
│   ├── api/news/    # News API endpoints
│   └── ...
├── components/      # React components
├── lib/            # Shared utilities
├── prisma/         # Database schema
└── public/         # Static files
```

## 🚀 Getting Started with Development

### 1. Start the Development Environment
```bash
# Terminal 1: Start PostgreSQL
# Windows
net start postgresql-x64-14
# Mac/Linux
brew services start postgresql

# Terminal 2: Start Redis
# Windows
net start redis
# Mac/Linux
brew services start redis

# Terminal 3: Start development server
npm run dev
```

### 2. Access Local Environment
- Frontend: http://localhost:3000
- News Feed: http://localhost:3000/news
- News Sources (Admin): http://localhost:3000/news/sources
- Prisma Studio: http://localhost:5555 (run with `npx prisma studio`)
- API Documentation: http://localhost:3000/api-docs

### 3. Test Your Setup
```bash
# Run type checking
npm run typecheck

# Run tests
npm run test

# Run linting
npm run lint
```

## 📖 Key Documentation

1. [Junior Developer Guide](./JUNIOR_DEV_GUIDE.md)
   - Complete project documentation
   - Code examples
   - Best practices

2. [News & Content Curation](./NEWS_CONTENT_CURATION_IMPLEMENTATION.md)
   - News feed implementation
   - Content curation features
   - API endpoints and usage

3. [Troubleshooting Guide](./TROUBLESHOOTING.md)
   - Common issues
   - Solutions
   - Debugging tips

4. [API Documentation](./API.md)
   - Endpoints
   - Request/Response formats
   - Authentication

## 👥 Team Communication

### Daily Schedule
- **9:30 AM**: Daily standup
- **2:00 PM**: Team sync
- **4:00 PM**: Code review session

### Communication Channels
- **Slack**: Primary communication
  - #team-dev: Development discussion
  - #help-dev: Technical questions
  - #general: Team announcements
- **GitHub**: Code reviews and issues
- **Notion**: Documentation and specs

## 🎯 First Week Goals

### Day 1
- [ ] Set up development environment
- [ ] Run project locally
- [ ] Read through documentation
- [ ] Meet the team

### Day 2
- [ ] Review codebase structure
- [ ] Set up debugging tools
- [ ] Complete first PR review

### Day 3
- [ ] Work on first small task
- [ ] Submit first PR
- [ ] Participate in code review

### Days 4-5
- [ ] Work on feature task
- [ ] Collaborate with team
- [ ] Document learnings

## 💡 Tips for Success

### Code Style
- Use TypeScript strictly
- Follow ESLint rules
- Write tests for new features
- Document complex logic

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make commits
git add .
git commit -m "feat: description"

# Push changes
git push origin feature/your-feature
```

### Asking for Help
1. Check documentation first
2. Search existing issues
3. Ask in #help-dev channel
4. Be specific about your problem
5. Share what you've tried

## 🎓 Learning Resources

### Official Docs
- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [TailwindCSS](https://tailwindcss.com/docs)

### Internal Resources
- Team wiki
- Architecture diagrams
- Style guide
- Best practices

## 🤝 Need Help?

### Your Support Network
- **Mentor**: [Mentor Name] - Direct support
- **Team Lead**: [Lead Name] - Technical guidance
- **Tech Support**: #it-support channel
- **HR**: [HR Contact] - Administrative questions

Remember:
- Ask questions early
- Share your learnings
- Help others when you can
- Take good notes
- Enjoy the journey! 🚀

Welcome aboard! We're excited to have you on the team! 🎉
