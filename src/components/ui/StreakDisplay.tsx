"use client"
import { motion } from "framer-motion"
import { useStreak } from "@/hooks/useStreak"

interface StreakDisplayProps {
  className?: string
}

export default function StreakDisplay({ className = "" }: StreakDisplayProps) {
  const { dailyProgress, streak, weeklyGoal, progressPercentage } = useStreak()

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const today = new Date().getDay()

  return (
    <motion.div
      data-testid="streak-display"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-800 rounded-2xl p-6 ${className}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">🔥 Daily Streak</h3>
        <motion.span 
          className="text-2xl font-bold text-orange-400"
          animate={{ scale: streak > 0 ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.5 }}
        >
          {streak}
        </motion.span>
      </div>

      {/* Weekly Progress Visual */}
      <div className="flex justify-between mb-4">
        {daysOfWeek.map((day, index) => {
          const dayIndex = index === 6 ? 0 : index + 1 // Adjust for Sunday being 0
          const isCompleted = dayIndex <= today && streak >= dayIndex

          return (
            <div key={day} className="flex flex-col items-center">
              <span className="text-xs text-gray-400 mb-1">{day}</span>
              <motion.div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                  isCompleted ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400'
                }`}
                whileHover={{ scale: 1.1 }}
              >
                {isCompleted ? '🔥' : '○'}
              </motion.div>
            </div>
          )
        })}
      </div>

      {/* Daily Goal Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Daily Goal</span>
          <span className="text-white">{dailyProgress}/{weeklyGoal}</span>
        </div>

        <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        <p className="text-sm text-gray-400">
          {dailyProgress >= weeklyGoal ? (
            <span className="text-green-400">🎉 Daily goal completed!</span>
          ) : (
            `${weeklyGoal - dailyProgress} more to complete daily goal`
          )}
        </p>
      </div>

      {/* Streak Milestones */}
      {streak > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Next milestone:</span>
            <span className="text-purple-400">
              {streak < 7 ? `${7 - streak} days to Weekly Champion` :
               streak < 30 ? `${30 - streak} days to Monthly Master` :
               "🏆 Streak Legend!"}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}