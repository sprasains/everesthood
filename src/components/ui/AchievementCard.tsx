"use client"
import { motion } from "framer-motion"
import { Achievement } from "@/types"

interface AchievementCardProps {
  achievement: Achievement
  earned?: boolean
  progress?: number
  className?: string
}

export default function AchievementCard({ 
  achievement, 
  earned = false, 
  progress = 0, 
  className = "" 
}: AchievementCardProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "from-yellow-400 to-orange-500"
      case "epic": return "from-purple-500 to-pink-500"
      case "rare": return "from-blue-500 to-purple-500"
      default: return "from-gray-500 to-gray-600"
    }
  }

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "shadow-yellow-500/50"
      case "epic": return "shadow-purple-500/50"
      case "rare": return "shadow-blue-500/50"
      default: return "shadow-gray-500/50"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`
        relative overflow-hidden rounded-xl p-4 transition-all duration-300
        ${earned ? 'bg-gradient-to-r' : 'bg-gray-800 opacity-70'}
        ${earned ? getRarityColor(achievement.rarity) : ''}
        ${earned ? `shadow-lg ${getRarityGlow(achievement.rarity)}` : ''}
        ${className}
      `}
    >
      {/* Earned indicator */}
      {earned && (
        <div className="absolute top-2 right-2">
          <span className="text-white text-lg">✨</span>
        </div>
      )}

      {/* Achievement Icon */}
      <div className="text-center mb-3">
        <span className="text-4xl">{achievement.icon}</span>
      </div>

      {/* Achievement Info */}
      <div className="text-center">
        <h3 className={`font-bold mb-1 ${earned ? 'text-white' : 'text-gray-300'}`}>
          {achievement.name}
        </h3>
        <p className={`text-sm mb-2 ${earned ? 'text-white/80' : 'text-gray-400'}`}>
          {achievement.description}
        </p>

        {/* XP Reward */}
        <div className={`text-xs font-medium ${earned ? 'text-white' : 'text-gray-500'}`}>
          +{achievement.xpReward} XP
        </div>

        {/* Rarity Badge */}
        <div className="mt-2">
          <span className={`
            text-xs px-2 py-1 rounded-full uppercase font-bold
            ${earned ? 'bg-white/20 text-white' : 'bg-gray-700 text-gray-400'}
          `}>
            {achievement.rarity}
          </span>
        </div>

        {/* Progress Bar (if not earned) */}
        {!earned && progress > 0 && (
          <div className="mt-3">
            <div className="bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {Math.round(progress * 100)}% complete
            </p>
          </div>
        )}
      </div>

      {/* Locked overlay */}
      {!earned && progress === 0 && (
        <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
          <span className="text-white text-2xl">🔒</span>
        </div>
      )}
    </motion.div>
  )
}