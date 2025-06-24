import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { GENZ_SOURCES } from "../src/lib/genz-sources";

const prisma = new PrismaClient();

async function fetchGenZContent() {
  try {
    console.log("🌟 Starting Gen-Z content aggregation...");

    for (const source of GENZ_SOURCES) {
      try {
        console.log(`🔄 Fetching from ${source.name}...`);

        // Mock RSS/API fetching - in production, you'd implement actual RSS parsing
        // or API calls to each source
        const mockContent = generateMockContent(source);

        for (const item of mockContent) {
          try {
            await prisma.genZContent.upsert({
              where: { sourceUrl: item.sourceUrl },
              update: {
                engagement: { increment: Math.floor(Math.random() * 5) },
              },
              create: {
                title: item.title,
                description: item.description,
                content: item.content,
                sourceName: source.name,
                sourceUrl: item.sourceUrl,
                imageUrl: item.imageUrl,
                publishedAt: new Date(),
                category: source.category,
                tags: item.tags,
                engagement: Math.floor(Math.random() * 100),
              },
            });
          } catch (error) {
            console.error(`Error upserting content: ${item.title}`, error);
          }
        }

        console.log(`✅ Completed ${source.name}`);
      } catch (error) {
        console.error(`❌ Error fetching from ${source.name}:`, error);
      }
    }

    console.log("🎉 Gen-Z content aggregation completed successfully");
  } catch (error) {
    console.error("❌ Gen-Z content aggregation failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

function generateMockContent(source: any) {
  // Mock content generator - replace with actual RSS/API parsing
  const mockTitles: { [key: string]: string[] } = {
    Hypebeast: [
      "Supreme x Nike Air Force 1 Drops This Week",
      "Streetwear Trends That Define 2024",
      "BAPE Collaborates with Space Jam for New Collection",
      "Travis Scott Teases New Jordan Collaboration",
    ],
    "The Tab": [
      "University Students Are Using AI to Write Essays",
      "Gen-Z Dating Culture Has Changed Forever",
      "Why Everyone at Uni is Obsessed with This App",
      "The Real Cost of Student Life in 2024",
    ],
    "Dazed Digital": [
      "Digital Art is Revolutionizing Creative Expression",
      "Underground Music Scenes Thriving in VR Spaces",
      "Fashion Week Goes Virtual: The Future is Now",
      "Young Artists Using AI to Challenge Traditional Art",
    ],
    Nylon: [
      "Pop Culture Moments That Defined This Month",
      "Celebrity Style Icons Every Gen-Z Should Know",
      "The Rise of Micro-Influencers in Fashion",
      "Beauty Trends Straight from Social Media",
    ],
  };

  const titles = mockTitles[source.name as keyof typeof mockTitles] || [
    "Sample Content from " + source.name,
  ];

  return titles.map((title: string, index: number) => ({
    title,
    description: `Latest ${source.category} insights and trends from ${source.name}`,
    content: `Deep dive into ${title.toLowerCase()} and its impact on Gen-Z culture...`,
    sourceUrl: `${source.url}/article-${Date.now()}-${index}`,
    imageUrl: `https://picsum.photos/400/300?random=${Math.random()}`,
    tags: [source.category, "gen-z", "trending"],
  }));
}

// Run the script
fetchGenZContent();
