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

}
