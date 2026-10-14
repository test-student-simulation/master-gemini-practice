"use client";
import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");

  async function askGemini() {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    setAnswer(data.answer ?? data.error ?? "エラーが発生しました");
  }

  return (
    <div className="rounded-xl shadow m-4 p-6">
      <textarea
        className="w-full border border-gray-400 rounded p-3 text-black"
        placeholder="Geminiへの質問を入力してください"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        className="mt-3 rounded bg-blue-500 px-6 py-2 text-white"
        onClick={() => {
          setAnswer("読み込み中...");
          askGemini()
        }}
      >
        送信
      </button>
      <div className="mt-4 rounded bg-gray-100 p-4 text-black min-h-32">
        {answer}
      </div>
    </div>
  );
}
