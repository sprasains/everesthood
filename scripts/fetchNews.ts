import axios from "axios";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function fetchNews() {
  try {
    console.log("🔄 Starting news aggregation...");

    const NEWS_API_KEY = process.env.NEWS_API_KEY;
    if (!NEWS_API_KEY) {
      throw new Error("NEWS_API_KEY is not set in environment variables");
    }

    // Fetch AI and tech news
    const categories = [
      { query: "artificial intelligence", category: "ai" },
      { query: "machine learning", category: "ai" },
      { query: "startup tech", category: "startup" },
      { query: "web3 blockchain", category: "tech" },
      { query: "quantum computing", category: "tech" },
      { query: "cybersecurity", category: "tech" },
    ];

    for (const { query, category } of categories) {
      try {
        const response = await axios.get(`https://newsapi.org/v2/everything`, {
          params: {
            q: query,
            language: "en",
            sortBy: "publishedAt",
            pageSize: 10,
            apiKey: NEWS_API_KEY,
          },
        });

        const articles = response.data.articles || [];
        console.log(`📰 Found ${articles.length} articles for "${query}"`);

        for (const item of articles) {
          if (!item.title || !item.url) continue;

          try {
            await prisma.newsArticle.upsert({
              where: { link: item.url },
              update: {},
              create: {
                title: item.title,
                link: item.url,
                description: item.description || "",
                imageUrl: item.urlToImage || "",
                publishedAt: item.publishedAt
                  ? new Date(item.publishedAt)
                  : new Date(),
                sourceName: item.source?.name || "Unknown",
              },
            });
          } catch (error) {
            console.error(`Error upserting article: ${item.title}`, error);
          }
        }
      } catch (error: any) {
        console.error(
          `Error fetching articles for "${query}":`,
          error.response?.data || error.message
        );
      }
    }

    console.log("✅ News aggregation completed successfully");
  } catch (error: any) {
    console.error("❌ News aggregation failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script only if it's the main entry point
if (require.main === module) {
  fetchNews();
}
