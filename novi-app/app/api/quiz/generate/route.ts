//This route handles automatic quiz generation from document text.
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text, numQuestions = 5 } = await req.json()

    //check document length
    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Document text is too short. Please upload a more detailed document.' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured.' },
        { status: 500 }
      )
    }

        const prompt = `You are a quiz generator. Based on the following document text, generate exactly ${numQuestions} multiple-choice questions.

Each question must have:
- A clear question string
- Exactly 4 answer options (A, B, C, D)
- The index (0-3) of the correct answer

Return ONLY a valid JSON array in this exact format, no extra text or markdown:
[
  {
    "question": "What is ...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0
  }
]

Document text:
"""
${text.slice(0, 6000)}
"""`

}
