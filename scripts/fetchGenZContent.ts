import { PrismaClient } from "@prisma/client";
import RSSParser from "rss-parser";
import { GENZ_SOURCES } from "../src/lib/genz-sources";

const prisma = new PrismaClient();
const parser = new RSSParser();

async function fetchGenZContent() {
  console.log("🌟 Starting Gen-Z content aggregation from live sources...");

  for (const source of GENZ_SOURCES) {
    if (!source.rssUrl) {
      console.log(`🟡 Skipping ${source.name}: No RSS URL provided.`);
      continue;
    }

    try {
      console.log(`🔄 Fetching from ${source.name} via ${source.rssUrl}...`);
      const feed = await parser.parseURL(source.rssUrl);
      let newContentCount = 0;

      for (const item of feed.items) {
        if (!item.link || !item.title) {
          continue;
        }

        // Use a default image if one isn't provided in the feed
        const imageUrl =
          item.enclosure?.url ||
          item.itunes?.image ||
          `https://source.unsplash.com/random/400x300/?${source.category}`;

        try {
          const result = await prisma.genZContent.upsert({
            where: { sourceUrl: item.link },
            update: {
              // Optional: Update engagement or other fields on existing articles
              engagement: { increment: Math.floor(Math.random() * 3) + 1 },
            },
            create: {
              title: item.title,
              description:
                item.contentSnippet ||
                item.content?.substring(0, 150) ||
                "No description available.",
              content: item.content || "",
              sourceName: source.name,
              sourceUrl: item.link,
              imageUrl: imageUrl,
              publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
              category: source.category,
              tags: item.categories || [source.category],
              engagement: Math.floor(Math.random() * 50) + 10,
            },
          });
          if (result) {
            newContentCount++;
          }
        } catch (dbError) {
          console.error(
            `❌ Error upserting item "${item.title}" from ${source.name}:`,
            dbError
          );
        }
      }
      console.log(
        `✅ Completed ${source.name}. Added ${newContentCount} new items.`
      );
    } catch (fetchError) {
      console.error(
        `❌ Error fetching or parsing feed from ${source.name}:`,
        fetchError
      );
    }
  }

  console.log("🎉 Gen-Z content aggregation finished.");
}

fetchGenZContent()
  .catch((e) => {
    console.error(
      "A critical error occurred during the Gen-Z fetch process:",
      e
    );
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
