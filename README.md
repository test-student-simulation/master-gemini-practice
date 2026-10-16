# master-gemini-practice 作業記録

## 1. 実習の目的

Next.js + React + TypeScriptで、GoogleのGemini APIを利用するチャットアプリを作成する。

学生がAI APIの仕組みを理解し、Webアプリから生成AIを呼び出せるようになることを目標とする。

### 使用技術

- Next.js
- React
- TypeScript
- Tailwind CSS
- Google Gemini API
- Google AI Studio
- GitHub

### 完成するアプリ

1. ユーザーがテキストを入力する
2. 送信ボタンを押す
3. Next.jsのAPI RouteがGemini APIに問い合わせる
4. Geminiの回答を画面に表示する

## 2. Next.jsプロジェクトの作成

GitHubリポジトリ名：

`master-gemini-practice`

Next.jsプロジェクトを作成する。

```bash
npm create next-app@latest .
```

主な選択項目：

- TypeScript：Yes
- ESLint：Yes
- Tailwind CSS：Yes
- App Router：Yes

Next.jsでは、Reactによる画面表示に加え、サーバー側の処理も実装できる。

### 学習上のポイント

ViteとNext.jsの違いを理解する。

- Vite：主にフロントエンドアプリの開発・ビルド
- Next.js：フロントエンドとサーバー側の処理を組み合わせられる

今回はAPIキーをブラウザに公開しないため、Next.jsを採用した。

## 3. Google AI StudioでAPIキーを作成

Google AI Studioにアクセスする。

https://aistudio.google.com/

Googleアカウントでログインし、APIキーを作成する。

作業時に確認した項目：

- APIキー作成画面
- APIキーの名前
- Google Cloudプロジェクトとの関係
- 同じプロジェクトで複数のAPIキーを作成できること
- 無料枠や利用制限の確認

### 学習上のポイント

APIキーは、APIを利用するアプリを識別するための情報。

APIキーを第三者に公開すると、不正利用や意図しない課金につながる可能性がある。

APIキーをGitHubにアップロードしてはいけない。

## 4. Gemini APIライブラリの導入

GoogleのGemini APIを呼び出すためのライブラリをインストールする。

```bash
npm install @google/genai
```

### 学習上のポイント

- npmパッケージの役割
- SDKとAPIの関係
- JavaScriptから外部のAIサービスを呼び出す仕組み

※ 作業の過程では旧SDKの`@google/generative-ai`も扱った。AI先生用教材では、使用するSDKを統一する必要がある。

## 5. APIキーを環境変数に保存

プロジェクト直下に`.env.local`を作成する。

```env
GEMINI_API_KEY=取得したAPIキー
```

### 注意事項

- `=`の前後に余計なスペースを入れない
- APIキーを引用符で囲む必要は通常ない
- `.env.local`をGitHubにアップロードしない
- 環境変数を変更したらNext.jsの開発サーバーを再起動する

### 実際に遭遇した問題

`.env.local`のAPIキー設定に不要なスペースが含まれていた。

設定を修正し、Next.jsを再起動して確認した。

### 学習上のポイント

Next.jsでは、サーバー側のコードから次のように環境変数を参照できる。

```ts
process.env.GEMINI_API_KEY
```

`NEXT_PUBLIC_`を付けた環境変数はブラウザ側にも公開されるため、秘密のAPIキーには使用しない。

## 6. Gemini APIを呼び出すAPI Routeの作成

App RouterのAPI Routeを利用する。

作成するファイル：

`app/api/gemini/route.ts`

このファイルでPOSTリクエストを受け取り、Gemini APIを呼び出す。

### 処理の流れ

1. フロントエンドからPOSTリクエストを受信
2. JSON形式のリクエスト本文を取得
3. ユーザーの入力文を取り出す
4. Gemini APIを呼び出す
5. 生成された回答をJSON形式で返す

### 基本的なコード例

```ts
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
```

### 学習上のポイント

- HTTPのPOSTメソッド
- JSON形式のデータ
- API Route
- `async`と`await`
- `try`と`catch`
- HTTPステータスコード500

## 7. Reactでチャット画面を作成

編集するファイル：

`app/page.tsx`

画面には次の要素を配置する。

- 質問を入力するテキストエリア
- 送信ボタン
- Geminiの回答を表示する領域

### Reactの状態管理

```ts
const [prompt, setPrompt] = useState('')
const [answer, setAnswer] = useState('')
```

`prompt`はユーザーの入力文、`answer`はGeminiからの回答を保持する。

### 学習上のポイント

- `useState`による状態管理
- `textarea`による文字入力
- ボタンの`onClick`
- 非同期処理と画面更新

## 8. フロントエンドからAPI Routeを呼び出す

送信ボタンを押した際に、`fetch()`でAPI Routeを呼び出す。

```ts
const response = await fetch('/api/gemini', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ prompt }),
})

const data = await response.json()
setAnswer(data.answer)
```

### 通信の流れ

```text
ブラウザ
   │
   │ POST /api/gemini
   ↓
Next.js API Route
   │
   │ Gemini APIキーを使用
   ↓
Google Gemini API
   │
   │ 生成された回答
   ↓
Next.js API Route
   │
   │ JSON
   ↓
ブラウザに回答を表示
```

### 学習上のポイント

ブラウザからGemini APIを直接呼び出さない。

ブラウザは自分のNext.js API Routeに問い合わせ、サーバー側がGemini APIを呼び出す。

これにより、APIキーをブラウザへ渡さずに済む。

## 9. use clientに関するエラー

Reactの`useState`を使用したところ、Next.jsでエラーが発生した。

原因は、App Routerのコンポーネントが初期状態ではServer Componentとして扱われること。

`page.tsx`の先頭に次を追加した。

```tsx
'use client'
```

これにより、ブラウザ側で`useState`などのReact Hooksを利用できるようになった。

### 学習上のポイント

- Server ComponentとClient Component
- `use client`の意味
- ブラウザ側の処理とサーバー側の処理の違い

## 10. Tailwind CSSによる画面調整

Tailwind CSSで入力欄、ボタン、回答領域のレイアウトを調整した。

使用したクラスの例：

- `w-full`
- `rounded-xl`
- `shadow`
- `p-6`
- `m-4`

### 実際に遭遇した問題

`w-full`と外側のマージン指定を組み合わせた結果、画面に横スクロールが発生した。

要素の幅とマージンの合計が親要素の幅を超えていたことが原因。

幅や余白の指定を見直して調整した。

### 学習上のポイント

CSSの幅、マージン、パディングの関係を理解する。

## 11. Gemini APIのモデル指定に関する問題

Gemini APIを呼び出した際、モデル名に関するエラーが発生した。

`route.ts`のモデル指定を確認し、利用可能なモデルへの変更を検討した。

作業中には`gemini-2.5-flash`などのモデル名を扱った。

### 学習上のポイント

Gemini APIのモデルは、追加・変更・廃止される場合がある。

教材にモデル名を固定しても、将来同じコードが動くとは限らない。

エラーが発生した場合は、Googleの公式ドキュメントで現在利用可能なモデルIDを確認する。

モデル名を推測で変更するのではなく、APIが返したエラーメッセージを確認する。

## 12. 応答待ち表示とエラー確認

送信ボタンを押しても回答がすぐに表示されない場合があった。

処理が実行されていることを分かりやすくするため、問い合わせ開始時に次の表示を追加した。

```ts
setAnswer('Geminiに問い合わせ中...')
```

回答が返らない場合は、VS Codeのターミナルに表示されたエラーを確認した。

### 学習上のポイント

- APIの応答には時間がかかる場合がある
- 非同期処理中の画面表示
- エラーメッセージの確認
- ブラウザとサーバーのどちらでエラーが発生しているかの切り分け

## 13. ローカルネットワークでの動作確認

Next.jsの開発サーバーを起動し、PCのブラウザで動作を確認した。

```bash
npm run dev
```

スマートフォンなど別の端末から、PCのローカルIPアドレスを指定してアクセスすることも試した。

この際、Next.jsのクロスオリジンに関する警告が表示された。

`allowedDevOrigins`の設定について確認したが、設定を追加しなくてもIPアドレスでアクセスできたケースがあった。

### 学習上のポイント

- `localhost`とローカルIPアドレス
- 開発サーバーへのアクセス
- クロスオリジンに関する警告
- 開発環境と公開環境の違い

## 14. GitHubと公開方法

GitHubリポジトリ：

`master-gemini-practice`

### GitHub Pagesとの違い

今回のアプリはNext.jsのAPI Routeを使用している。

GitHub Pagesは静的ファイルの公開サービスなので、通常のGitHub Pages公開だけではAPI Routeを実行できない。

そのため、完成したアプリを公開する場合は、Next.jsのサーバー側処理に対応したホスティングサービスが必要となる。

## 15. vercelでの公開

vercelアカウントをgithubアカウントで作成して連携する。


## 16. セキュリティに関する重要事項

今回の実習では、APIキーをサーバー側に保持する構成を採用した。

ただし、APIキーをブラウザに公開しないことだけで、アプリ全体が安全になるわけではない。

公開されたAPI Routeに認証や利用制限がなければ、第三者から大量のリクエストを送られる可能性がある。

本番運用では、認証、利用回数制限、エラー処理、費用管理などが必要になる。

## 17. AI先生プロンプトを作る際の方針

学生に一度にすべてのコードを提示せず、次の順番で進める。

1. Next.jsプロジェクトを作成する
2. Google AI StudioでAPIキーを取得する
3. `.env.local`を設定する
4. Gemini APIライブラリを導入する
5. API Routeを作成する
6. Reactで入力画面を作成する
7. `fetch()`でAPI Routeを呼び出す
8. Geminiの回答を表示する
9. エラー処理と問い合わせ中の表示を追加する
10. GitHubに保存し、公開方法を理解する

### AI先生への指示

- 学生が各段階の動作を確認してから次へ進む
- コードはコピーできる形で提示する
- APIキーそのものをチャットに貼らせない
- エラーが発生したら、まずエラーメッセージを確認する
- モデル名は実習時点の公式情報に基づいて指定する
- ブラウザとサーバーの役割を区別して説明する
- APIキーの管理を重要な学習項目として扱う

## 18. 今回の実習のまとめ

**実施・確認した内容**

- Next.js + React + TypeScriptの準備
- Google AI StudioでのAPIキー作成
- Gemini APIライブラリの導入
- `.env.local`による環境変数管理
- API Routeの作成
- チャット画面の実装
- React Hooksと`use client`の確認
- Tailwind CSSによるレイアウト調整
- APIキー設定ミスの修正
- Geminiモデル指定の問題への対応
- 問い合わせ中の表示の追加

**今後の課題**

- APIエラーを画面上に分かりやすく表示する
- 送信中のボタン操作を制御する
- チャット履歴を管理する
- APIの利用回数や費用を管理する
- Next.js対応のホスティングサービスへ公開する

