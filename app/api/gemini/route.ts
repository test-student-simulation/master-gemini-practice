import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        // モデル一覧
        // https://aistudio.google.com/docs/models
        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
        });

        return NextResponse.json({
            answer: response.text,
        });
    } catch (error: any) {
        const data = JSON.parse(error.message ?? '{}').error;
        return NextResponse.json(
            { error: `Gemini APIの呼び出しに失敗しました code(${data?.code}) message(${data?.message.substring(0, 120)}...)` },
            { status: 500 }
        );
    }
}
