"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useGenZContent } from "@/hooks/useGenZContent";
import { useState } from "react";

export default function GenZContentPanel() {
  const {
    content,
    loading,
    selectedCategory,
    setSelectedCategory,
    categories,
  } = useGenZContent();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      {/* Toggle Button */}
      {/* <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed left-4 top-20 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white z-50"
      >
        {isVisible ? "✕" : "🌟"}
      </button> */}

      {isVisible && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          className="fixed left-0 top-20 h-[calc(100vh-5rem)] bg-gray-900 border-r border-gray-700 transition-all duration-300 z-40 w-80"
        >
          <div className="p-4 h-full flex flex-col">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white mb-2">
                🌟 Gen-Z Vibes
              </h2>
              <p className="text-sm text-gray-400">
                Trending culture & lifestyle....
              </p>
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${
                      selectedCategory === category.id
                        ? "bg-purple-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="h-3 bg-gray-700 rounded mb-2"></div>
                        <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                content.map((item) => (
                  <motion.a
                    key={item.id}
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="block bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white line-clamp-2 mb-1">
                          {item.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <span className="bg-gray-700 px-2 py-0.5 rounded">
                            {item.sourceName}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(item.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Engagement indicator */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700">
                      <div className="flex space-x-2">
                        {item.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-xs text-purple-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        🔥 {item.engagement}
                      </span>
                    </div>
                  </motion.a>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500 text-center">
                Stay updated with the latest Gen-Z trends
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
