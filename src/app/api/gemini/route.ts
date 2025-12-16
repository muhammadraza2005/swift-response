import { NextRequest, NextResponse } from 'next/server';
import { GEMINI_API_BASE_URL, GEMINI_PROMPTS, type GeminiRequest } from '@/utils/gemini-config';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const body: GeminiRequest = await request.json();
    const { emergencyType, description, mode } = body;

    if (!emergencyType || !description || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields: emergencyType, description, mode' },
        { status: 400 }
      );
    }

    // Select appropriate prompt based on mode
    const systemPrompt = mode === 'self-help' 
      ? GEMINI_PROMPTS.selfHelp(emergencyType, description)
      : GEMINI_PROMPTS.helperMode(emergencyType, description);

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: systemPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE'
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get AI suggestion', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract the generated text from Gemini response
    const suggestion = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate suggestion at this time.';

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
