import cron from 'node-cron';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const generateAndStoreDigest = async () => {
  console.log('Task starting: Generating daily AI news digest...');
  try {
    const newsResponse = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: '("artificial intelligence" OR "machine learning") AND (breakthrough OR funding OR research)',
        language: 'en',
        pageSize: 5,
        sortBy: 'publishedAt',
        apiKey: process.env.NEWS_API_KEY,
      },
    });
    const articles = newsResponse.data.articles;
    if (!articles || articles.length === 0) {
      console.log('No new articles found. Task ending.');
      return;
    }
    type Article = { title: string; description: string };
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `
      You are an expert tech editor for a dashboard called "everesthood".
      Your audience is savvy about AI.
      Based on the following JSON of news articles, write a concise and engaging "AI Daily Digest".
      Summarize the top 2-3 most important stories.
      Use markdown for formatting, including headings (###) for each story.
      Keep the entire digest under 200 words.
      Articles:
      ${JSON.stringify((articles as Article[]).map((a: Article) => ({ title: a.title, description: a.description })))}
    `;
    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    await prisma.dailyDigest.upsert({
      where: { id: 1 },
      update: { content: summary },
      create: { id: 1, content: summary },
    });
    console.log('Successfully generated and stored the daily AI digest.');
  } catch (error) {
    console.error('Error during daily digest generation:', error);
  }
};

console.log('Scheduling the daily digest cron job.');
cron.schedule('0 5 * * *', () => {
  generateAndStoreDigest();
}, {
  timezone: "UTC"
});
// Optional: Run the task once on server startup for immediate content
// generateAndStoreDigest(); 