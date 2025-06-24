"use client"
import { motion } from "framer-motion"
import { useUser } from "@/hooks/useUser"
import { useStreak } from "@/hooks/useStreak"
import StreakDisplay from "@/components/ui/StreakDisplay"
import PersonaSelector from "@/components/ui/PersonaSelector"
import SocialFeed from "@/components/ui/SocialFeed"
import GenZContentPanel from "@/components/ui/GenZContentPanel"
import AchievementCard from "@/components/ui/AchievementCard"
import Navbar from "@/components/layout/Navbar"
import { useState, useEffect } from "react"

export default function DashboardPage() {
  const { user, loading } = useUser()
  const { incrementProgress } = useStreak()
  const [achievements, setAchievements] = useState([])
  const [showPersonaSelector, setShowPersonaSelector] = useState(false)

  useEffect(() => {
    // Load user achievements
    if (user) {
      fetchAchievements()
    }
  }, [user])

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/v1/achievements')
      if (response.ok) {
        const data = await response.json()
        setAchievements(data.achievements || [])
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <GenZContentPanel />

      <div className="ml-80 pt-20 px-6 pb-6">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name || 'AI Explorer'}! 👋
            </h1>
            <p className="text-gray-400">
              Ready to dive into the latest AI trends and level up your knowledge?
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Streak Display */}
              <StreakDisplay />

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800 rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold text-white mb-4">🚀 Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => window.location.href = '/news'}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-xl text-white font-medium hover:shadow-lg transition-all"
                  >
                    📰 Read Latest News
                  </button>
                  <button
                    onClick={() => setShowPersonaSelector(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-xl text-white font-medium hover:shadow-lg transition-all"
                  >
                    🤖 Switch AI Persona
                  </button>
                  <button
                    onClick={() => window.location.href = '/community'}
                    className="bg-gradient-to-r from-green-600 to-blue-600 p-4 rounded-xl text-white font-medium hover:shadow-lg transition-all"
                  >
                    👥 Join Community
                  </button>
                  <button
                    onClick={() => incrementProgress()}
                    className="bg-gradient-to-r from-orange-600 to-red-600 p-4 rounded-xl text-white font-medium hover:shadow-lg transition-all"
                  >
                    ⚡ Daily Challenge
                  </button>
                </div>
              </motion.div>

              {/* Recent Achievements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 rounded-2xl p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">🏆 Recent Achievements</h2>
                  <button className="text-purple-400 hover:text-purple-300 text-sm">
                    View All
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {achievements.slice(0, 6).map((achievement, index) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      earned={user?.achievements?.includes(achievement.id)}
                      className="min-h-[120px]"
                    />
                  ))}
                </div>
              </motion.div>

              {/* AI Insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800 rounded-2xl p-6"
              >
                <h2 className="text-xl font-bold text-white mb-4">🧠 AI Insights</h2>
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2">📈 Your Learning Trend</h3>
                    <p className="text-gray-300 text-sm">
                      You've been consistently engaging with AI and tech content. 
                      Your {user?.persona || 'ZenGPT'} persona suggests focusing on emerging technologies this week.
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2">🎯 Recommended Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Machine Learning', 'Web3', 'AR/VR', 'Quantum Computing', 'Blockchain'].map((topic) => (
                        <span key={topic} className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Social & Stats */}
            <div className="space-y-6">
              {/* User Stats Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                    {user?.persona === "ZenGPT" ? "🧘‍♀️" : 
                     user?.persona === "HustleBot" ? "🔥" : 
                     user?.persona === "DataDaddy" ? "📊" : "💪"}
                  </div>
                  <h3 className="font-bold text-lg">{user?.name || 'AI Explorer'}</h3>
                  <p className="text-white/80 text-sm mb-4">Level {user?.level || 1} • {user?.persona || 'ZenGPT'}</p>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{user?.xp || 0}</div>
                      <div className="text-white/80 text-xs">Total XP</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{user?.streak || 0}</div>
                      <div className="text-white/80 text-xs">Day Streak</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{user?.articlesRead || 0}</div>
                      <div className="text-white/80 text-xs">Articles Read</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{user?.summariesUsed || 0}</div>
                      <div className="text-white/80 text-xs">AI Summaries</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Social Feed */}
              <SocialFeed />
            </div>
          </div>
        </div>
      </div>

      {/* Persona Selector Modal */}
      {showPersonaSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Choose Your AI Mentor</h2>
              <button
                onClick={() => setShowPersonaSelector(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <PersonaSelector onPersonaChange={() => setShowPersonaSelector(false)} />
          </motion.div>
        </div>
      )}
    </div>
  )
}