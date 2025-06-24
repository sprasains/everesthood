import axios from "axios"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function fetchNews() {
  try {
    console.log('🔄 Starting news aggregation...')

    const NEWS_API_KEY = process.env.NEWS_API_KEY!

    // Fetch AI and tech news
    const categories = [
      { query: 'artificial intelligence', category: 'ai' },
      { query: 'machine learning', category: 'ai' },
      { query: 'startup tech', category: 'startup' },
      { query: 'web3 blockchain', category: 'tech' },
      { query: 'quantum computing', category: 'tech' },
      { query: 'cybersecurity', category: 'tech' }
    ]

    for (const { query, category } of categories) {
      try {
        const response = await axios.get(`https://newsapi.org/v2/everything`, {
          params: {
            q: query,
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: 10,
            apiKey: NEWS_API_KEY
          }
        })

        const articles = response.data.articles || []
        console.log(`📰 Found ${articles.length} articles for "${query}"`)

        for (const item of articles) {
          if (!item.title || !item.url) continue

          try {
            await prisma.article.upsert({
              where: { url: item.url },
              update: {
                views: { increment: 1 }
              },
              create: {
                title: item.title,
                description: item.description || '',
                content: item.content || '',
                sourceName: item.source?.name || 'Unknown',
                imageUrl: item.urlToImage,
                publishedAt: new Date(item.publishedAt),
                url: item.url,
                category,
                tags: [query.replace(' ', '-')]
              }
            })
          } catch (error) {
            console.error(`Error upserting article: ${item.title}`, error)
          }
        }
      } catch (error) {
        console.error(`Error fetching articles for "${query}":`, error)
      }
    }

    console.log('✅ News aggregation completed successfully')
  } catch (error) {
    console.error('❌ News aggregation failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
fetchNews()