"use client"
import { motion } from "framer-motion"
import { useState } from "react"
import { Article, User } from "@/types"
import { trackEngagement } from "@/lib/analytics"

interface NewsCardProps {
  article: Article
  user?: User
  onSummarize?: (article: Article) => void
  onLike?: (articleId: string) => void
  onShare?: (article: Article) => void
}

export default function NewsCard({ article, user, onSummarize, onLike, onShare }: NewsCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.(article.id)
    trackEngagement.articleRead(article.id, 30, user?.id)
  }

  const handleSummarize = () => {
    onSummarize?.(article)
    trackEngagement.aiSummaryUsed(user?.persona || "ZenGPT", article.id, user?.id)
  }

  const handleShare = () => {
    onShare?.(article)
    trackEngagement.socialShare("native", "article", user?.id)
  }

  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(139, 92, 246, 0.3)"
      }}
      whileTap={{ scale: 0.98 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900 to-pink-900 p-6 transition-all duration-300"
    >
      {/* Engagement Indicators */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <div className="bg-black/30 backdrop-blur rounded-full px-3 py-1">
          <span className="text-xs text-white">⚡ 2 min read</span>
        </div>
        <div className="bg-black/30 backdrop-blur rounded-full px-3 py-1">
          <span className="text-xs text-yellow-300">🔥 Trending</span>
        </div>
      </div>

      {/* Article Image */}
      {article.imageUrl && (
        <div className="mb-4 rounded-xl overflow-hidden">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <span className="bg-purple-600 px-2 py-1 rounded text-xs">{article.sourceName}</span>
          <span>•</span>
          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
        </div>

        <h2 className="text-lg font-bold text-white leading-tight">{article.title}</h2>

        {article.description && (
          <p className="text-sm text-gray-300 line-clamp-3">{article.description}</p>
        )}

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Actions */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-600">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          className="flex items-center space-x-2 text-sm transition-colors"
        >
          <span className={`text-lg ${isLiked ? "text-pink-400" : "text-gray-400"}`}>
            {isLiked ? "💖" : "🤍"}
          </span>
          <span className="text-purple-300">+5 XP</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSummarize}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"
          disabled={!user || user.subscriptionStatus === "free" && user.summariesUsed >= 3}
        >
          🤖 AI Summarize
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleShare}
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
        >
          🔗 Share
        </motion.button>
      </div>

      {/* Daily Progress Indicator */}
      {user && (
        <div className="mt-4 space-y-2">
          <div className="bg-gray-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((user.dailyProgress / user.weeklyGoal) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 flex justify-between">
            <span>{user.dailyProgress}/{user.weeklyGoal} articles today</span>
            <span>🔥 {user.streak} day streak</span>
          </p>
        </div>
      )}
    </motion.div>
  )
}