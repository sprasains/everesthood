import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// The persona prompt is now resolved in the API route, so this function is simpler
export async function generateSummary(content: string, personaPrompt: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" })

  const finalPrompt = `${personaPrompt}\n\n${content}\n\nPlease provide a concise, engaging summary that captures the key insights for Gen-Z readers.`

  try {
    const result = await model.generateContent(finalPrompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Failed to generate AI summary')
  }
}