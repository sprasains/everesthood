import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateSummary(content: string, persona: string = 'ZenGPT') {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" })

  const personaPrompts = {
    ZenGPT: "You are ZenGPT, a calm and mindful AI guide. Summarize this content in a peaceful, balanced tone that promotes mindfulness and work-life balance:",
    HustleBot: "You are HustleBot, a high-energy startup mentor. Summarize this content with enthusiasm, focusing on growth opportunities and hustle mentality:",
    DataDaddy: "You are DataDaddy, an analytical insights master. Summarize this content with data-driven insights, charts, and statistical perspectives:",
    CoachAda: "You are CoachAda, a supportive career coach. Summarize this content with encouragement and career development focus:"
  }

  const prompt = `${personaPrompts[persona as keyof typeof personaPrompts] || personaPrompts.ZenGPT}

${content}

Please provide a concise, engaging summary that captures the key insights for Gen-Z readers.`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Failed to generate AI summary')
  }
}