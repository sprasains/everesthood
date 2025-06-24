"use client"
import { motion } from "framer-motion"
import { useState } from "react"
import { useUser } from "@/hooks/useUser"
import PersonaSelector from "@/components/ui/PersonaSelector"
import StreakDisplay from "@/components/ui/StreakDisplay"
import Navbar from "@/components/layout/Navbar"

export default function ProfilePage() {
  const { user, updateUser } = useUser()
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    weeklyGoal: user?.weeklyGoal || 5
  })

  const handleSave = async () => {
    await updateUser(formData)
    setIsEditing(false)
  }

  const tabs = [
    { id: "overview", name: "Overview", icon: "📊" },
    { id: "persona", name: "AI Persona", icon: "🤖" },
    { id: "achievements", name: "Achievements", icon: "🏆" },
    { id: "settings", name: "Settings", icon: "⚙️" }
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <div className="pt-20 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-8 text-white"
          >
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl">
                {user?.persona === "ZenGPT" ? "🧘‍♀️" : 
                 user?.persona === "HustleBot" ? "🔥" : 
                 user?.persona === "DataDaddy" ? "📊" : "💪"}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{user?.name || 'AI Explorer'}</h1>
                <p className="text-white/80 mb-4">
                  Level {user?.level || 1} • {user?.persona || 'ZenGPT'} • Member since {new Date().getFullYear()}
                </p>
                <div className="flex space-x-6">
                  <div>
                    <div className="text-2xl font-bold">{user?.xp || 0}</div>
                    <div className="text-white/80 text-sm">Total XP</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{user?.streak || 0}</div>
                    <div className="text-white/80 text-sm">Day Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{user?.articlesRead || 0}</div>
                    <div className="text-white/80 text-sm">Articles Read</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                ✏️ Edit Profile
              </button>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-gray-800 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StreakDisplay />
                <div className="bg-gray-800 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">📈 Learning Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">AI Summaries Used</span>
                      <span className="text-white font-bold">{user?.summariesUsed || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Content Shared</span>
                      <span className="text-white font-bold">{user?.sharesCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subscription</span>
                      <span className={`font-bold ${user?.subscriptionStatus === 'premium' ? 'text-purple-400' : 'text-gray-400'}`}>
                        {user?.subscriptionStatus === 'premium' ? '✨ Premium' : '🆓 Free'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "persona" && (
              <div className="bg-gray-800 rounded-2xl p-6">
                <PersonaSelector />
              </div>
            )}

            {activeTab === "achievements" && (
              <div className="bg-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">🏆 Your Achievements</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Mock achievements */}
                  {[
                    { name: "First Steps", icon: "👣", earned: true },
                    { name: "Week Warrior", icon: "🗓️", earned: true },
                    { name: "AI Enthusiast", icon: "🤖", earned: user?.summariesUsed! > 10 },
                    { name: "Social Sharer", icon: "📱", earned: user?.sharesCount! > 5 },
                    { name: "Streak Master", icon: "🔥", earned: user?.streak! >= 7 },
                    { name: "Knowledge Seeker", icon: "📚", earned: user?.articlesRead! > 50 },
                    { name: "Level Up", icon: "⬆️", earned: user?.level! >= 5 },
                    { name: "Premium Elite", icon: "✨", earned: user?.subscriptionStatus === 'premium' }
                  ].map((achievement, index) => (
                    <div
                      key={index}
                      className={`bg-gray-700 rounded-lg p-4 text-center ${
                        achievement.earned ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'opacity-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <div className="font-semibold text-white text-sm">{achievement.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">⚙️ Account Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Weekly Goal (articles)
                      </label>
                      <input
                        type="number"
                        value={formData.weeklyGoal}
                        onChange={(e) => setFormData({...formData, weeklyGoal: parseInt(e.target.value)})}
                        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-purple-500 focus:outline-none"
                        min="1"
                        max="50"
                      />
                    </div>
                    <button
                      onClick={handleSave}
                      className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white font-medium transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">🔔 Notifications</h3>
                  <div className="space-y-3">
                    {[
                      "Daily streak reminders",
                      "New article alerts", 
                      "Achievement unlocks",
                      "Weekly summaries"
                    ].map((setting, index) => (
                      <label key={index} className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="text-purple-600" />
                        <span className="text-gray-300">{setting}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Edit Profile Modal */}
          {isEditing && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 rounded-2xl p-6 max-w-md w-full"
              >
                <h3 className="text-xl font-bold text-white mb-4">✏️ Edit Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Weekly Goal</label>
                    <input
                      type="number"
                      value={formData.weeklyGoal}
                      onChange={(e) => setFormData({...formData, weeklyGoal: parseInt(e.target.value)})}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg text-white font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-white font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}