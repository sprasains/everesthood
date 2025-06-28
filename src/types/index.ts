export interface User {
  id: string
  name?: string
  email?: string
  image?: string
  coverPicture?: string
  // Gamification
  xp: number
  level: number
  streak: number
  lastActiveDate?: Date
  persona: string
  dailyProgress: number
  weeklyGoal: number
  achievements: string[]
  // Social
  friends: string[]
  publicProfile: boolean
  // Analytics
  articlesRead: number
  sharesCount: number
}

export interface Article {
  id: string
  title: string
  description?: string
  content?: string
  sourceName: string
  imageUrl?: string
  publishedAt: Date
  url: string

  // Engagement
  views: number
  likes: number
  shares: number

  // Categorization
  category?: string
  tags: string[]
}

export interface GenZContent {
  id: string
  title: string
  description?: string
  content?: string
  sourceName: string
  sourceUrl: string
  imageUrl?: string
  publishedAt: Date
  category: string
  tags: string[]
  engagement: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  rarity: "common" | "rare" | "epic" | "legendary"
  category: string
  requirements: any
}

export interface UserAchievement {
  id: string
  userId: string
  achievementId: string
  earnedAt: Date
  achievement: Achievement
}

export type Persona = "ZenGPT" | "HustleBot" | "DataDaddy" | "CoachAda"

export interface PersonaConfig {
  id: Persona
  name: string
  description: string
  theme: string
  unlocked: boolean
}