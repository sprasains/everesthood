import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the AI client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    let prompt = '';
    switch (topic) {
      case 'latest_news':
        prompt = `
          Act as an expert AI news analyst. Based on your most recent training data, provide a summary of 3 significant developments in Artificial Intelligence this week.
          For each development, provide:
          1. A short, catchy title.
          2. A one-paragraph summary (like a TLDR).
          3. A "Why it matters" section explaining its impact.
          Format the entire output as a JSON array.
        `;
        break;
      case 'career_coaching':
        prompt = `
          Act as an AI career coach. Generate a curated list of 3 actionable career tips for someone looking to get into the AI/ML field.
          For each tip, provide:
          1. A "title" for the tip.
          2. A "description" explaining the tip in detail.
          3. An "example" of how to apply it (e.g., a mini-project idea or a networking strategy).
          Format the entire output as a JSON array.
        `;
        break;
      case 'tldr_developments':
        prompt = `
          Act as a tech summarizer (like TLDR). Provide a bulleted list of the top 5 most important AI concepts or breakthroughs from the last year.
          For each item, provide a one-sentence summary and explain its significance in another sentence.
          Format the entire output as a JSON array of objects, with each object having "concept" and "significance" keys.
        `;
        break;
      default:
        return NextResponse.json({ error: 'Invalid topic' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // The model will return a stringified JSON. We need to parse it.
    const jsonData = JSON.parse(text);

    return NextResponse.json(jsonData);
  } catch (error) {
    console.error('Error generating AI content:', error);
    return NextResponse.json({ error: 'Failed to generate content from AI model.' }, { status: 500 });
  }
} 