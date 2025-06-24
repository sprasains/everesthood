import { useState, useEffect } from "react"
import { GenZContent } from "@/types"

export function useGenZContent() {
  const [content, setContent] = useState<GenZContent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    fetchContent()
  }, [selectedCategory])

  const fetchContent = async () => {
    setLoading(true)
    try {
      const params = selectedCategory !== "all" ? `?category=${selectedCategory}` : ""
      const response = await fetch(`/api/v1/genz-content${params}`)

      if (response.ok) {
        const data = await response.json()
        setContent(data.content || [])
      }
    } catch (error) {
      console.error("Error fetching Gen-Z content:", error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: "all", name: "All", icon: "🌟" },
    { id: "fashion", name: "Fashion", icon: "👗" },
    { id: "culture", name: "Culture", icon: "🎭" },
    { id: "tech", name: "Tech", icon: "💻" },
    { id: "lifestyle", name: "Lifestyle", icon: "✨" },
    { id: "social", name: "Social", icon: "📱" }
  ]

  return {
    content,
    loading,
    selectedCategory,
    setSelectedCategory,
    categories,
    refreshContent: fetchContent
  }
}