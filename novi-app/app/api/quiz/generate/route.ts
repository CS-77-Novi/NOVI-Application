import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
<<<<<<< Updated upstream
  try {
    const { text, numQuestions = 5 } = await req.json()

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
=======
    try {
        const { text, numQuestions = 5 } = await req.json()

        if (!text || text.trim().length < 50) {
            return NextResponse.json(
                { error: 'Document text is too short. Please upload a more detailed document.' },
                { status: 400 }
            )
        }

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Gemini API key is not configured.' },
                { status: 500 }
            )
        }

        const prompt = `You are a quiz generator. Based on the following document text, generate exactly ${numQuestions} multiple-choice questions.
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
${text.slice(0, 6000)}
"""`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      return NextResponse.json({ error: err.error?.message || 'OpenAI request failed' }, { status: 502 })
    }

    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content?.trim()

    // Strip optional markdown code fences
    const jsonStr = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '')
    const questions = JSON.parse(jsonStr)

    if (!Array.isArray(questions)) throw new Error('Invalid response format')

    return NextResponse.json({ questions })
  } catch (err: any) {
    console.error('Quiz generate error:', err)
    return NextResponse.json({ error: err.message || 'Failed to generate quiz' }, { status: 500 })
  }
=======
${text.slice(0, 15000)}
"""`

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                }
            }),
        })

        if (!response.ok) {
            const err = await response.json()
            return NextResponse.json({ error: err.error?.message || 'Gemini request failed' }, { status: 502 })
        }

        const data = await response.json()
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

        if (!raw) {
            throw new Error('No content returned from Gemini')
        }

        // Strip optional markdown code fences
        const jsonStr = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '')
        const questions = JSON.parse(jsonStr)

        if (!Array.isArray(questions)) throw new Error('Invalid response format')

        return NextResponse.json({ questions })
    } catch (err: any) {
        console.error('Quiz generate error:', err)
        return NextResponse.json({ error: err.message || 'Failed to generate quiz' }, { status: 500 })
    }
>>>>>>> Stashed changes
}
