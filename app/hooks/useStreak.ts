import { useState, useEffect } from "react"
import { useUser } from "@/hooks/useUser";

export function useStreak() {
  const { user, updateUser } = useUser()
  const [dailyProgress, setDailyProgress] = useState(0)
  const [canIncrement, setCanIncrement] = useState(true)

  useEffect(() => {
    if (user) {
      // Use articlesRead as daily progress since dailyProgress doesn't exist
      setDailyProgress(user.articlesRead || 0)

      // Check if user can still increment today
      const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null
      const today = new Date()
      const isToday = lastActive && lastActive.toDateString() === today.toDateString()

      // Use a default weekly goal of 5
      const weeklyGoal = 5
      setCanIncrement(!isToday || (user.articlesRead || 0) < weeklyGoal)
    }
  }, [user])

  const incrementProgress = async (activity: string = "article_read") => {
    if (!user || !canIncrement) return

    const newProgress = (user.articlesRead || 0) + 1
    const today = new Date()

    // Calculate streak
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let newStreak = user.streak || 0

    if (!lastActive) {
      newStreak = 1 // First day
    } else if (lastActive.toDateString() === yesterday.toDateString()) {
      newStreak += 1 // Consecutive day
    } else if (lastActive.toDateString() !== today.toDateString()) {
      newStreak = 1 // Streak broken, restart
    }

    // Calculate XP gain
    const xpGain = 10 + (newStreak * 2) // Base 10 XP + streak bonus
    const newXP = (user.xp || 0) + xpGain
    const newLevel = Math.floor(newXP / 100) + 1

    await updateUser({
      articlesRead: newProgress,
      streak: newStreak,
      lastActiveDate: today,
      xp: newXP,
      level: newLevel
    })

    setDailyProgress(newProgress)

    // Check if goal completed
    const weeklyGoal = 5
    if (newProgress >= weeklyGoal) {
      setCanIncrement(false)
    }

    return { xpGain, newLevel: newLevel > (user.level || 1) }
  }

  return {
    dailyProgress,
    currentStreak: user?.streak || 0,
    weeklyGoal: 5, // Default weekly goal
    canIncrement,
    incrementProgress,
    progressPercentage: Math.min(((user?.articlesRead || 0) / 5) * 100, 100)
  }
}