"use client"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useUser } from "@/hooks/useUser"
import NewsCard from "@/components/ui/NewsCard"
import GenZContentPanel from "@/components/ui/GenZContentPanel"
import Navbar from "@/components/layout/Navbar"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { Article } from "@/types"

export default function NewsPage() {
  const { user } = useUser()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [summaryModal, setSummaryModal] = useState<{show: boolean, article?: Article, summary?: string}>({show: false})

  useEffect(() => {
    fetchNews()
  }, [selectedCategory])

  const fetchNews = async () => {
    setLoading(true)
    try {
      const params = selectedCategory !== "all" ? `?category=${selectedCategory}` : ""
      const response = await fetch(`/api/v1/news${params}`)

      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSummarize = async (article: Article) => {
    setSummaryModal({show: true, article, summary: undefined})

    try {
      const response = await fetch('/api/v1/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: article.content || article.description,
          persona: user?.persona || 'ZenGPT'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSummaryModal(prev => ({...prev, summary: data.summary}))
      }
    } catch (error) {
      console.error('Error generating summary:', error)
      setSummaryModal(prev => ({...prev, summary: 'Sorry, failed to generate summary. Please try again.'}))
    }
  }

  const handleShare = (article: Article) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: article.url,
      })
    } else {
      navigator.clipboard.writeText(article.url)
      // Show toast notification
    }
  }

  const categories = [
    { id: "all", name: "All", icon: "📰" },
    { id: "ai", name: "AI", icon: "🤖" },
    { id: "tech", name: "Tech", icon: "💻" },
    { id: "startup", name: "Startup", icon: "🚀" },
    { id: "culture", name: "Culture", icon: "🎭" },
    { id: "science", name: "Science", icon: "🔬" }
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <GenZContentPanel />

      <div className="ml-80 pt-20 px-6 pb-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">🔥 Latest AI News</h1>
            <p className="text-gray-400">
              Stay ahead of the curve with AI-powered summaries and Gen-Z perspectives
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* News Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {articles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <NewsCard
                    article={article}
                    user={user}
                    onSummarize={handleSummarize}
                    onShare={handleShare}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && articles.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📰</div>
              <h3 className="text-xl font-bold text-white mb-2">No articles found</h3>
              <p className="text-gray-400">Try selecting a different category or check back later</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Summary Modal */}
      {summaryModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">🤖 AI Summary</h2>
                <p className="text-sm text-purple-400">by {user?.persona || 'ZenGPT'}</p>
              </div>
              <button
                onClick={() => setSummaryModal({show: false})}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-white mb-2">{summaryModal.article?.title}</h3>
              <p className="text-xs text-gray-400">{summaryModal.article?.sourceName}</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              {summaryModal.summary ? (
                <p className="text-gray-300 leading-relaxed">{summaryModal.summary}</p>
              ) : (
                <div className="flex items-center space-x-3">
                  <LoadingSpinner size="sm" />
                  <span className="text-gray-400">Generating personalized summary...</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-6">
              <a
                href={summaryModal.article?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                🔗 Read Full Article
              </a>
              {summaryModal.summary && (
                <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm">
                  Share Summary
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}