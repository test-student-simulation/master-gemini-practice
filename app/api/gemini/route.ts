import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // APIキーが読み込めていないときは、Geminiに問い合わせる前に知らせる
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
            { error: 'GEMINI_API_KEYが設定されていません。.env.localを確認し、npm run devを再起動してください' },
            { status: 500 }
        );
    }

    try {
        const { prompt } = await request.json();

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        // モデル一覧
        // https://aistudio.google.com/docs/models
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
        });

        return NextResponse.json({
            answer: response.text,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        let detail = message;
        try {
            // Geminiのサーバーから返ったエラーはJSON形式なので、codeとmessageを取り出す
            const data = JSON.parse(message).error;
            detail = `code(${data?.code}) message(${data?.message})`;
        } catch {
            // JSONでないエラー（通信エラーなど）は、そのまま表示する
        }
        return NextResponse.json(
            { error: `Gemini APIの呼び出しに失敗しました ${detail.substring(0, 160)}...` },
            { status: 500 }
        );
    }
}