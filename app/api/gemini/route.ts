import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
        });

        return NextResponse.json({
            answer: response.text,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Gemini APIの呼び出しに失敗しました' },
            { status: 500 }
        );
    }
}
