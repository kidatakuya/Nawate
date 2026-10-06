# 畑ノート

畑ノートは、畑を場所のマスタとして管理し、「プロジェクト」単位で作物の栽培、畑の割り当て、個体の生育記録を扱う日本語の農業管理アプリです。現在のデータはReactのContext + `useReducer`でインメモリ管理し、ブラウザーのストレージやSupabaseへの農業データ保存は行いません。

## 主な機能

- ダッシュボード（`/`）
  - 進行中プロジェクトの年度、作物、使用畑数、個体数を表示
  - プロジェクトと畑ごとの生育状態をバーで可視化
  - 畝×列ヒートマップからプロジェクト詳細へ移動
- プロジェクト（`/projects`）
  - 開始日が新しい順にプロジェクトを表示
  - 年度、作物、使用畑数、期間、進行中／終了の状態を確認
- プロジェクト作成（`/projects/new`）
  - プロジェクト名、年度、作物、使用畑、開始日、任意の終了日を登録
  - 作成時点では個体を作らず、畑構成を適用した時点で生成
- プロジェクト詳細（`/projects/[projectId]`）
  - プロジェクトごとに畑の畝・列・個体数を設定
  - 構成を再適用しても範囲内の作物登録済み個体を位置に基づいて保持
  - 個体数を減らして登録済み個体が範囲外になる場合は確認
  - 畝、列、個体を順に選び、個体の作物名・植え付け日・状態を編集
  - 個体モーダルから生育記録を追加・削除。追加時に個体の現在状態も更新
  - プロジェクトの終了と削除（関連する設定・個体・記録も削除）
- 畑マスタ（`/fields`）
  - 畑名だけを登録する場所マスタ
  - 畝数・列数はプロジェクトごとに設定
  - 進行中プロジェクトで使われている畑は削除不可
- 生育記録（`/records`）
  - 終了プロジェクトを選び、最終個体数・収穫済・枯死・空き数を確認
  - 畑ごとの状態と日付降順の記録一覧を表示、記録削除が可能
- 生育状態
  - 空き、発芽、生育中、開花、収穫済、枯死を色分け表示
- 認証
  - ローカル開発環境では認証をスキップ
  - リモート／本番環境ではSupabase Authで認証

## 技術スタック

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui 風のUIコンポーネント
- Lucide React

## プロジェクト構成

```text
.
├─ app/
│  ├─ (protected)/      # ログイン必須の画面と認証チェック
│  │  ├─ fields/        # 畑マスタ
│  │  ├─ projects/      # プロジェクト一覧・作成・詳細
│  │  ├─ records/       # 終了プロジェクトの振り返り
│  │  └─ page.tsx       # ダッシュボード
│  ├─ (public)/         # ログイン不要の画面
│  │  └─ login/         # ログイン画面
│  └─ layout.tsx        # 全画面共通レイアウト
├─ components/
│  ├─ projects/         # プロジェクト中心の画面・カード
│  └─ farm/             # 共通Providerとヘッダー
├─ hooks/               # useReducer状態へアクセスするカスタムフック
├─ lib/                 # 型、Reducer、サンプルデータ、ユーティリティ
├─ public/              # 画像やアイコンなどの静的ファイル
├─ package.json         # プロジェクト設定と依存関係
├─ pnpm-lock.yaml       # pnpm ロックファイル
├─ next.config.mjs      # Next.js 設定
├─ tsconfig.json        # TypeScript 設定
├─ postcss.config.mjs   # PostCSS 設定
├─ components.json      # UI コンポーネント設定
└─ README.md            # このファイル
```

`(protected)` と `(public)` はNext.jsのルートグループです。括弧内の名前はURLに含まれません。保護画面は `(protected)/layout.tsx` で認証状態を確認し、`proxy.ts` でセッションを更新します。

## セットアップ

依存関係をインストールします。

```bash
pnpm install
```

## Supabase Authの設定

このアプリはリモート環境でSupabase Authのメールアドレス・パスワード認証を使います。ログイン画面は `/login` です。ログインしていない状態で他のページを開くとログイン画面へ移動し、ログイン後は元のページへ戻ります。画面上部の「ログアウト」からセッションを終了できます。

ローカル開発サーバー（`pnpm dev`）では、実装作業を進められるよう認証をスキップします。`/` や `/fields` などを直接開いてください。`/login` を開くと `/` に移動します。**本番環境では認証が必須**で、Supabaseの接続情報が未設定ならアプリ画面へ進めません。

### 1. Supabaseの接続情報を設定

1. Supabaseでプロジェクトを作成または開きます。
2. Supabaseの **Project Settings → API** で **Project URL** と **anon key**（または **publishable key**）を確認します。
3. プロジェクトのルートにある `.env.example` を `.env.local` にコピーします。
4. `.env.local` の次の2つにSupabaseの値を入力します。

```env
NEXT_PUBLIC_SUPABASE_URL=ここにProject_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=ここにanon_key
```

新しいSupabaseプロジェクトでpublishable keyを使う場合は、`NEXT_PUBLIC_SUPABASE_ANON_KEY` の代わりに `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` という名前で設定できます。

コード側で参照する場所は `lib/supabase/client.ts`、`lib/supabase/server.ts`、`proxy.ts` です。通常はコードを変更せず、`.env.local` の値だけを設定してください。環境変数を変更したら開発サーバーを再起動します。

### 2. 管理者アカウントを1つ作成

Supabaseの **Authentication → Users** から **Add user** を選び、管理者のメールアドレスとパスワードを登録してください。ユーザー登録画面はアプリに用意していません。

一般の利用者が自分でアカウントを作れないよう、Supabaseの **Authentication → Sign In / Providers → Email** で新規サインアップを無効にしてください。Supabaseの画面表示が異なる場合は、Authenticationの設定内にあるメール認証の「Allow new users to sign up」相当の項目をオフにします。パスワードはSupabaseの管理画面で安全に管理してください。

### 3. 起動して確認

```bash
pnpm dev
```

`pnpm dev` で起動したローカル環境は認証なしで利用できます。リモート環境で認証を有効にするには、Supabaseの管理者アカウントと環境変数を設定してください。接続情報が未設定の場合はログイン画面に設定案内が表示されます。

本番環境にデプロイする場合も、ホスティング先の環境変数設定にProject URLとどちらか一方の公開キーを登録してください。キーをソースコードへ直接書いたり、`service_role` / secret keyをブラウザー向けの環境変数に設定したりしないでください。

> Supabaseは認証にのみ使用しています。畑マスタ・プロジェクト・個体・生育記録はサンプルデータで初期化し、メモリ上で管理しています。ページを再読み込みすると変更は初期データに戻ります。`localStorage` / `sessionStorage` は使いません。

## GitHub ActionsによるVercelデプロイ

`.github/workflows/deploy.yml` でGitHub ActionsからVercelへデプロイします。

| ブランチ／イベント | 動作 |
| --- | --- |
| `develop` へのpush | Vercel Preview環境へデプロイ |
| `main` へのpush | Vercel Production環境へデプロイ |
| `develop` または `main` 向けPull Request | `pnpm build` のみ実行し、デプロイしない |

### 初回設定

1. VercelでこのGitHubリポジトリをプロジェクトとして登録し、Production Branchを `main` に設定します。
2. Vercelのプロジェクト設定で `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY`（または `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`）をPreviewとProductionの両方に登録します。
3. GitHubリポジトリの **Settings → Secrets and variables → Actions** に、次のRepository secretsを登録します。
   - `VERCEL_TOKEN`: VercelのAccount Settingsで発行したアクセストークン
   - `VERCEL_ORG_ID`: Vercelチーム／アカウントID
   - `VERCEL_PROJECT_ID`: VercelプロジェクトID
4. `develop` と `main` ブランチをGitHubに作成し、`develop` にpushしてPreviewデプロイを確認します。問題なければPull Requestを作成して `main` にマージします。

`VERCEL_ORG_ID` と `VERCEL_PROJECT_ID` は、Vercel CLIで対象プロジェクトにリンクしたときに作成される `.vercel/project.json` から確認できます。`.vercel` ディレクトリはGitにコミットせず、値はGitHub Secretsへ登録してください。ワークフロー実行後はGitHubの **Actions** で各ステップとデプロイ結果を確認できます。

GitHub ActionsとVercelのGit連携による二重デプロイを避けるため、Vercel側のGit自動デプロイを無効化するか、VercelのGit設定で自動デプロイを無効にしてください。Supabaseの公開キーはVercelの環境変数として登録し、`service_role` キーはブラウザー向け環境変数に設定しないでください。

### 農業データ用テーブル定義（将来のSupabase連携用）

`supabase/schema.sql` は、農業データをSupabaseで管理するときにSQL Editorから一括実行する初期スキーマです。現状のアプリは引き続きインメモリ管理であり、このSQLを実行してもアプリが自動的にSupabaseへ読み書きするようにはなりません。

テーブルは畑マスタ、プロジェクト、プロジェクトと畑の割り当て、畑ごとの構成、個体、生育記録の6つです。個体の状態は個体ごとの行として保存し、プロジェクト・畑・畝・列・番号で一意に管理します。個体ごとの一括変更や生育記録との参照整合性を保つため、畝全体を1つのJSONB列に重複保存しません。

畝単位の画面データは `project_ridge_states` ビューから取得できます。返却される `state` オブジェクトの形は次のとおりです。

```json
{
  "projectFieldId": "畑設定のUUID",
  "ridgeNumber": 1,
  "rows": [
    {
      "rowNumber": 1,
      "plants": [
        {
          "id": "個体のUUID",
          "plantNumber": 1,
          "cropName": "トマト",
          "plantedAt": "2026-03-15",
          "status": "growing"
        }
      ]
    }
  ]
}
```

`growth_records` は個体IDを参照するため、生育記録から対象の畑・畝・列・番号を辿れます。プロジェクト削除時は関連する設定・個体・記録がカスケード削除されます。進行中プロジェクトで使っている畑はデータベース側でも削除を拒否します。RLSはログイン済みユーザーにCRUDを許可する設定です。管理者1名だけに限定する運用ではSupabase Authの新規サインアップを無効にし、管理者ユーザーだけを作成してください。

セットアップ時はSupabaseの **SQL Editor** を開き、`supabase/schema.sql` の内容を貼り付けて実行します。アプリをデータベース接続へ切り替える作業（取得・保存処理、構成適用時の個体生成など）は別途必要です。

## 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで `http://localhost:3000` を開くとアプリを確認できます。

## 本番ビルド

```bash
pnpm build
```

## 本番起動

```bash
pnpm start
```

## 使い方の流れ

1. 畑マスタページで畑を登録する
2. 新規プロジェクトを作成し、使用する畑と期間を設定する
3. プロジェクト詳細で各畑の畝数・列数・個体数を設定する
4. 個体カードから作物、植え付け日、生育状態を編集し、記録を追加する
5. ダッシュボードで進行中プロジェクトを確認し、終了後は生育記録ページで振り返る

## 補足

このプロジェクトは、Next.js をベースにした個体管理型の農業アプリとして構成されており、UI は日本語で実装されています。今後、データ永続化や認証、CSV 出力などの機能拡張にも対応しやすい構成です。

## ライセンス

本プロジェクトのライセンスは未設定です。利用や公開の際は、各自で運用方針に合わせて整理してください。
