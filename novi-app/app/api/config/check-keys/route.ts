import { NextResponse } from 'next/server'

export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY
  const hasGemini = !!geminiKey && geminiKey !== 'your-gemini-api-key-here'
  
  return NextResponse.json({
    gemini: hasGemini,
  })
}
