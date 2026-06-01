# Native Claude Team チュートリアル

Claude Code Agent Teams、Ollama で動かすローカル AI モデル、そして専門役割を持つ小さなエージェントチームを使って、自分のコンピュータ上で React サイトを作るための手順です。

このチュートリアルは、技術に慣れていない方でも進められるように書いています。コマンドはコピー＆ペーストできる形を基本にし、重要な設定では「何をするのか」と「なぜ必要なのか」を平易に説明します。

この文書は `NativeClaudeTeam_tutorial_EN.md` をもとに、日本語話者に自然に伝わるよう再構成したものです。

---

## このチュートリアルで作るもの

最後まで進めると、次のものが用意できます。

- Vite で作成した React サイトプロジェクト
- Ollama 経由で動くローカル AI モデル
- そのローカルモデルを使うよう設定した Claude Code
- 有効化された Claude Code Agent Teams
- 3 つの専門エージェント
  - UI/UX デザイナー
  - コンテンツ生成担当
  - React アーキテクト
- 必要に応じた Nano Banana による画像生成
- 重要な操作の前に Claude Code が確認する、安全寄りの初心者向けワークフロー
- ブラウザで確認できるローカルプレビュー

この手順では Docker は使いません。権限確認もスキップしません。Docker で完全自動化する手順は `DockerAutomation_tutorial_JP.md` で扱います。

---

## プライバシーと安全性について

このワークフローは「ローカル優先」ですが、「完全にクラウドを使わない」という意味ではありません。

中心となる AI モデルは Ollama でローカル実行できます。その場合、コーディングの依頼文や生成されたコードは自分のコンピュータ上で処理できます。

ただし、次のようなツールはインターネットを使います。

- Gemini 画像生成は画像プロンプトを Google に送信します。
- npm、uv、GitHub からのダウンロードはパッケージサーバーに接続します。
- 無効化しない限り、Claude Code が必須ではないネットワーク通信を行う場合があります。
- Web 検索や WebFetch 系のツールは外部サイトに接続します。

要するに、コーディング用のモデルはローカルにできますが、任意のインターネット連携ツールはインターネットを使います。

---

## 目次

1. [基本セットアップ：ローカル Agent Team](#1-基本セットアップローカル-agent-team)
   - [1.1 このワークフローの意味](#11-このワークフローの意味)
   - [1.2 重要な用語](#12-重要な用語)
   - [1.3 ハードウェア要件](#13-ハードウェア要件)
   - [1.4 必要なソフトウェアを入れる](#14-必要なソフトウェアを入れる)
   - [1.5 React プロジェクトを作る](#15-react-プロジェクトを作る)
   - [1.6 ローカル AI モデルを入れる](#16-ローカル-ai-モデルを入れる)
   - [1.7 大きめのコンテキストモデルを作る](#17-大きめのコンテキストモデルを作る)
   - [1.8 Claude Code を Ollama 用に設定する](#18-claude-code-を-ollama-用に設定する)
   - [1.9 Agent Teams とプロジェクト設定を有効にする](#19-agent-teams-とプロジェクト設定を有効にする)
   - [1.10 Agent Skills を入れる](#110-agent-skills-を入れる)
   - [1.11 Nano Banana 画像ツールを追加する](#111-nano-banana-画像ツールを追加する)
   - [1.12 Agent Team を作る](#112-agent-team-を作る)
   - [1.13 Agent Team を実行する](#113-agent-team-を実行する)
   - [1.14 プレビューして片付ける](#114-プレビューして片付ける)
   - [1.15 この型を再利用する](#115-この型を再利用する)
2. [トラブルシューティング](#2-トラブルシューティング)
3. [クイックリファレンス](#3-クイックリファレンス)
4. [付録：やさしい用語集](#4-付録やさしい用語集)
5. [確認した情報源](#5-確認した情報源)

---

# 1. 基本セットアップ：ローカル Agent Team

この章では、動画で扱った安全寄りの初心者向け構成を作ります。

Docker は使いません。tmux も使いません。権限確認はスキップしません。

通常のターミナルを 1 つ使い、Claude Code が重要なファイル変更やコマンド実行の前に確認を求める形で進めます。

## 1.1 このワークフローの意味

このチュートリアルでは、次の状態を作ります。

- Claude Code を自分のコンピュータ上で直接動かす
- Anthropic のクラウドモデルではなく、Ollama のローカルモデルを使う
- Agent Teams を通常の Claude Code 画面内で動かす
- Claude Code が確認を求めたら、人間が承認する
- 3 つの専門エージェントで React のコーヒーショップサイトを作る
- Gemini API キーを用意した場合は、Nano Banana で画像生成も使える

推奨する起動コマンドは次のとおりです。

```bash
claude --model qwen3.5-9b-64k:latest --permission-mode default --teammate-mode in-process
```

このコマンドでしていること：

- `claude` で Claude Code を起動します。
- `--model qwen3.5-9b-64k:latest` で使うローカル Ollama モデルを指定します。
- `--permission-mode default` で、承認が必要な編集やコマンドの前に確認を出します。
- `--teammate-mode in-process` で、チームメイトエージェントを 1 つの Claude Code 画面内に表示します。

なぜ必要か：

- 初めて Agent Teams を試すには、このモードが最も安全です。完全自動化の前に、エージェントがどう動くかを学べます。

---

## 1.2 重要な用語

| 用語 | 分かりやすい意味 |
|:--|:--|
| Claude Code | Anthropic のコマンドライン型コーディング支援ツール。プロジェクト内のファイルを読み、編集し、コマンドを実行できます。 |
| Agent Teams | 1 人のリードエージェントが複数のチームメイトエージェントをまとめる Claude Code の実験的機能です。 |
| リードエージェント | メインの Claude Code セッションです。プロジェクトマネージャーのように振る舞います。 |
| チームメイトエージェント | デザイン、コンテンツ、React 実装など、明確な役割を持つ専門担当です。 |
| Ollama | ローカル AI モデルを実行するツールです。すべての依頼をクラウドモデルへ送らずに済みます。 |
| qwen3.5 | ローカルモデルの系列です。この手順では 32 GB Mac で扱いやすい 9B 版を使います。 |
| Gemma4 | Google のローカルモデル系列です。qwen3.5 の代替として使えます。 |
| React | Web サイトやアプリを作るための JavaScript ライブラリです。 |
| Vite | React プロジェクトを高速に作成・実行するツールです。 |
| コンテキストウィンドウ | AI が一度に覚えて扱えるテキストやコードの量です。大きいほど便利ですがメモリを使います。 |
| MCP | Model Context Protocol。画像生成などの追加ツールを Claude Code に接続する仕組みです。 |
| Nano Banana | Gemini を使う画像生成用 MCP サーバーです。 |
| API キー | オンラインサービスを使うためのパスワードのような値です。秘密にしてください。 |

---

## 1.3 ハードウェア要件

| 項目 | 最低ライン | 推奨 |
|:--|:--|:--|
| メモリ | 16 GB | 32 GB 以上 |
| ストレージ | 空き 25 GB | 空き 50 GB |
| プロセッサ | Apple Silicon、Intel Mac、または Linux PC | 32 GB 以上の Apple Silicon Mac |
| インターネット | インストールと任意の画像生成に必要 | 安定した回線 |

32 GB を推奨する理由：

- ローカルモデル自体が多くのメモリを使います。
- 大きなコンテキストはさらにメモリを使います。
- Agent Teams は複数のセッションを作ることがあります。
- ブラウザ、エディタ、OS も同時にメモリを使います。

16 GB のコンピュータで試す場合：

- より小さいモデルを使ってください。
- コンテキストサイズを 65536 ではなく 32768 などに下げてください。
- エージェント数を減らしてください。
- 応答は遅くなる前提で進めてください。

---

## 1.4 必要なソフトウェアを入れる

例は macOS 向けです。Windows の場合は WSL、つまり Windows Subsystem for Linux の利用を推奨します。

### 1.4.1 Homebrew を入れる

Homebrew は Mac 用のパッケージマネージャーです。コマンドラインツール用のアプリストアのようなものです。

```bash
brew --version
```

Homebrew がなければ、次でインストールします。

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 1.4.2 Node.js と npm を入れる

Node.js はブラウザの外で JavaScript を動かすための実行環境です。npm は Node.js に付属するパッケージ管理ツールです。

```bash
brew install node
node --version
npm --version
```

React、Vite、Firebase ツールは Node.js を使います。Node 20 以降を推奨します。

### 1.4.3 Git を入れる

Git はプロジェクトの変更履歴を保存します。コード用のセーブポイントだと考えると分かりやすいです。

```bash
git --version
```

入っていない場合：

```bash
brew install git
```

AI がファイルを編集する前に、安全なチェックポイントを作るために必要です。

### 1.4.4 Ollama を入れる

Ollama はローカル AI モデルを動かします。

1. [https://ollama.com](https://ollama.com) を開きます。
2. 自分のコンピュータ用の Ollama をダウンロードします。
3. インストールします。
4. Ollama アプリを起動します。

確認します。

```bash
ollama --version
```

### 1.4.5 Claude Code を入れる

Claude Code はエージェントチームをまとめるコーディングアシスタントです。

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

確認します。

```bash
claude --version
```

Agent Teams には Claude Code `2.1.32` 以降が必要です。

### 1.4.6 uv を入れる

uv は Python ツールを実行するためのランナーです。Nano Banana 画像ツールを動かすときに使う `uvx` が含まれます。

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv --version
```

---

## 1.5 React プロジェクトを作る

作業用フォルダを作ります。

```bash
mkdir -p ~/Desktop/REACTWebBuilder
cd ~/Desktop/REACTWebBuilder
```

React アプリを作ります。

```bash
npm create vite@latest . -- --template react
```

パッケージをインストールします。

```bash
npm install
```

最初の Git チェックポイントを保存します。

```bash
git init
git add .
git commit -m "Initial Vite React scaffold"
```

安全用の `.gitignore` を追加します。

```bash
cat >> .gitignore <<'EOF'

# Local secrets and Claude Code working files
.env
.env.local
.mcp.json
.claude/worktrees/
EOF
```

スターターアプリを確認します。

```bash
npm run build
```

ビルドが成功すれば、AI エージェントチームに渡せる React プロジェクトの準備ができています。

---

## 1.6 ローカル AI モデルを入れる

このチュートリアルでは、32 GB Mac でのローカル複数エージェント作業向けに `qwen3.5:9b` を推奨します。

```bash
ollama pull qwen3.5:9b
```

確認します。

```bash
ollama list
```

一覧に `qwen3.5:9b` が表示されてから進んでください。

Gemma4 を使いたい場合：

```bash
ollama pull gemma4:e4b
```

qwen3.5 が自分の環境でうまく動かない場合の代替候補です。

---

## 1.7 大きめのコンテキストモデルを作る

コーディングでは、指示文、コードファイル、会話履歴をまとめて扱える記憶領域が必要です。これをコンテキストと呼びます。

Qwen 用の Modelfile を作ります。

```bash
cat > Modelfile <<'EOF'
FROM qwen3.5:9b
PARAMETER num_ctx 65536
PARAMETER num_predict -1
EOF
```

このファイルは、`qwen3.5:9b` をもとに、65,536 トークンのコンテキストを使うモデルを作るための設定です。

カスタムモデルを作成します。

```bash
ollama create qwen3.5-9b-64k -f Modelfile
```

簡単にテストします。

```bash
ollama run qwen3.5-9b-64k:latest "Reply with one short sentence."
```

Gemma4 を使う場合：

```bash
cat > Modelfile <<'EOF'
FROM gemma4:e4b
PARAMETER num_ctx 65536
PARAMETER num_predict -1
EOF

ollama create gemma4-e4b-64k -f Modelfile
ollama run gemma4-e4b-64k:latest "Reply with one short sentence."
```

---

## 1.8 Claude Code を Ollama 用に設定する

Claude Code は通常 Anthropic のクラウドモデルに接続します。ここでは Ollama に接続するよう設定します。

```bash
export ANTHROPIC_AUTH_TOKEN=ollama
export ANTHROPIC_API_KEY=""
export ANTHROPIC_BASE_URL=http://localhost:11434
export ANTHROPIC_DEFAULT_HAIKU_MODEL=qwen3.5-9b-64k:latest
export ANTHROPIC_DEFAULT_SONNET_MODEL=qwen3.5-9b-64k:latest
export ANTHROPIC_DEFAULT_OPUS_MODEL=qwen3.5-9b-64k:latest
export CLAUDE_CODE_SUBAGENT_MODEL=qwen3.5-9b-64k:latest
```

これらの設定は、Claude Code とチームメイトエージェントに「このコンピュータ上の Ollama と、このモデル名を使う」と伝えます。

zsh で毎回入力しなくて済むようにします。

```bash
cat >> ~/.zshrc <<'EOF'

# Claude Code local Ollama setup
export ANTHROPIC_AUTH_TOKEN=ollama
export ANTHROPIC_API_KEY=""
export ANTHROPIC_BASE_URL=http://localhost:11434
export ANTHROPIC_DEFAULT_HAIKU_MODEL=qwen3.5-9b-64k:latest
export ANTHROPIC_DEFAULT_SONNET_MODEL=qwen3.5-9b-64k:latest
export ANTHROPIC_DEFAULT_OPUS_MODEL=qwen3.5-9b-64k:latest
export CLAUDE_CODE_SUBAGENT_MODEL=qwen3.5-9b-64k:latest
EOF

source ~/.zshrc
```

接続をテストします。

```bash
claude --model qwen3.5-9b-64k:latest --permission-mode default --teammate-mode in-process
```

Claude Code の中で入力します。

```text
Hi!
```

返答があれば接続できています。終了します。

```text
/exit
```

---

## 1.9 Agent Teams とプロジェクト設定を有効にする

Agent Teams は実験的機能です。チームメイトエージェントを起動できるように、プロジェクト設定で有効にします。

```bash
mkdir -p .claude
cat > .claude/settings.json <<'EOF'
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
    "ANTHROPIC_AUTH_TOKEN": "ollama",
    "ANTHROPIC_API_KEY": "",
    "ANTHROPIC_BASE_URL": "http://localhost:11434",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "qwen3.5-9b-64k:latest",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "qwen3.5-9b-64k:latest",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "qwen3.5-9b-64k:latest",
    "CLAUDE_CODE_SUBAGENT_MODEL": "qwen3.5-9b-64k:latest"
  },
  "teammateMode": "auto",
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.local)",
      "Read(./.mcp.json)",
      "Bash(rm -rf *)",
      "Bash(sudo *)"
    ]
  }
}
EOF
```

この設定では、Agent Teams を有効にし、Claude Code を Ollama に向け、秘密情報ファイルや危険なコマンドへのアクセスを抑えます。

プロジェクト指示ファイルを作ります。

```bash
cat > CLAUDE.md <<'EOF'
# Project Instructions

This is a Vite React website project.

Use the local Ollama model configured in this project.

Work carefully:
- Ask before destructive commands.
- Do not read `.env`, `.env.local`, or `.mcp.json`.
- Run `npm run build` before saying the project is complete.
- Keep changes focused on the requested website.
- If using agents, assign clear responsibilities so agents do not edit the same files at the same time.

Default workflow:
1. Plan the website structure.
2. Ask a UI/design teammate for layout and styling.
3. Ask a React teammate to implement components.
4. Ask a content teammate to draft page copy.
5. Build and fix errors.
EOF
```

設定を保存します。

```bash
git add .claude/settings.json CLAUDE.md .gitignore
git commit -m "Configure Claude Code local agent setup"
```

---

## 1.10 Agent Skills を入れる

Skills は Claude Code に作業方法を教えるための指示パッケージです。動画では Web 制作用の公式スキルを手動で入れます。

```bash
mkdir -p .claude/skills
git clone https://github.com/anthropics/skills.git /tmp/anthropic-skills
cp -r /tmp/anthropic-skills/skills/frontend-design .claude/skills/
cp -r /tmp/anthropic-skills/skills/web-artifacts-builder .claude/skills/
cp -r /tmp/anthropic-skills/skills/theme-factory .claude/skills/
cp -r /tmp/anthropic-skills/skills/webapp-testing .claude/skills/
rm -rf /tmp/anthropic-skills
```

これにより、デザイン、Web アプリ構築、テーマ、テストのための追加指示がプロジェクトに入ります。

保存します。

```bash
git add .claude/skills
git commit -m "Add Claude Code web skills"
```

---

## 1.11 Nano Banana 画像ツールを追加する

AI 画像生成が不要なら、この章は飛ばして構いません。

Nano Banana は MCP サーバーです。MCP は Claude Code に追加ツールを接続する仕組みで、この場合は Gemini API を使って画像を生成します。

Gemini API キーを取得します。

1. [https://aistudio.google.com](https://aistudio.google.com) を開きます。
2. 「Get API key」をクリックします。
3. 新しい API キーを作成します。
4. キーをコピーし、安全な場所に保管します。

API キーはパスワードのようなものです。GitHub にアップロードしたり、他人に共有したりしないでください。

ターミナルにキーを設定します。

```bash
export GEMINI_API_KEY="PASTE-YOUR-GEMINI-KEY-HERE"
```

Nano Banana MCP サーバーを追加します。

```bash
claude mcp add --scope local --env GEMINI_API_KEY="$GEMINI_API_KEY" nanobanana -- uvx nanobanana-mcp-server@latest
```

確認します。

```bash
claude mcp list
```

`nanobanana` が表示されれば準備完了です。

---

## 1.12 Agent Team を作る

エージェント定義ファイルは `.claude/agents/` に置きます。

```bash
mkdir -p .claude/agents
```

### 1.12.1 UI/UX デザイナーエージェント

```bash
cat > .claude/agents/ui-ux-designer.md <<'EOF'
---
name: ui-ux-designer
description: Designs the visual layout, colors, typography, spacing, responsive behavior, and accessibility of a React website.
model: inherit
tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
---
You are an expert UI/UX Designer.

Your job is to make the website look polished, readable, and easy to use.

Responsibilities:
- Design layout, colors, typography, spacing, and responsive behavior.
- Keep the site accessible for keyboard and screen-reader users.
- Prefer simple, maintainable CSS.
- Coordinate with the React Architect before changing component structure.

Rules:
- Do not change business logic.
- Do not run deployment commands.
- Run or request `npm run build` after major styling changes.
EOF
```

### 1.12.2 React アーキテクトエージェント

```bash
cat > .claude/agents/react-architect.md <<'EOF'
---
name: react-architect
description: Builds React components, organizes source files, manages app structure, and fixes build errors.
model: inherit
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
---
You are a Senior React Software Engineer.

Your job is to implement the website structure and keep the app working.

Responsibilities:
- Build React components.
- Organize files clearly.
- Integrate content and styling from other agents.
- Run `npm run build` before reporting completion.
- Fix build errors.

Rules:
- Do not deploy the site.
- Do not generate marketing copy unless asked.
- Do not overwrite another agent's work without explaining why.
EOF
```

### 1.12.3 コンテンツ生成エージェント

このエージェントは、Nano Banana が使える場合に画像生成も担当します。

```bash
cat > .claude/agents/content-generator.md <<'EOF'
---
name: content-generator
description: Writes website copy, headings, calls to action, product descriptions, image prompts, and generates images with the Nano Banana MCP server when available.
model: inherit
mcpServers:
  - nanobanana
disallowedTools:
  - Bash
---
You are an expert website copywriter and content planner.

Your job is to create clear, useful website content.

Responsibilities:
- Write headlines, body copy, button text, and section descriptions.
- Prepare image prompts when images are needed.
- Use the Nano Banana MCP server to generate website images when the server is available.
- Save generated images in `public/assets/images/` with clear filenames.
- Save long-form content in clear files such as `src/content/siteContent.js` or Markdown files.

Rules:
- Do not change React component logic.
- Do not deploy the site.
- If image generation tools are unavailable, write image prompts instead of failing.
EOF
```

確認して保存します。

```bash
ls -la .claude/agents
git add .claude/agents
git commit -m "Add local website agent team"
```

---

## 1.13 Agent Team を実行する

Claude Code を起動します。

```bash
claude --model qwen3.5-9b-64k:latest --permission-mode default --teammate-mode in-process
```

### 1.13.1 最初は 1 エージェントだけでテストする

```text
Create an Agent Team with one teammate. Use the react-architect agent.
Ask the teammate to inspect this Vite React project and summarize the folder structure.
Do not edit files yet.
```

このテストでは、Agent Teams がチームメイトを起動できるかを確認します。まだファイル編集は許可しません。

### 1.13.2 フルチームを起動する

小さなテストが成功したら、次の依頼を入力します。

```text
I want to build a polished, responsive React website for an upscale boutique coffee shop called Brew and Bean.

Create an Agent Team and coordinate these teammates:
- ui-ux-designer: visual design, layout, CSS, spacing, colors, accessibility
- content-generator: headings, section copy, calls to action, image prompts, and image generation
- react-architect: React components, app structure, build fixes

Workflow:
1. First make a short plan.
2. Assign content and image generation work to content-generator.
3. Ask content-generator to use the Nano Banana MCP server to generate 2 or 3 website images that match the content.
4. Save generated images under public/assets/images.
5. Assign visual design work to ui-ux-designer.
6. Assign React implementation work to react-architect.
7. Keep agents from editing the same file at the same time.
8. Run npm run build.
9. Fix all build errors.
10. Do not deploy until I approve.

Start now.
```

ローカルモデルはクラウドモデルより遅いことがあります。Claude Code が承認を求めたら、内容を読んで、安全そうなら承認してください。

---

## 1.14 プレビューして片付ける

最後にビルドを確認します。

```bash
npm run build
```

ローカルでプレビューします。

```bash
npm run dev
```

Vite が `http://localhost:5173` のような URL を表示します。ブラウザで開くと、ローカル AI チームが作ったサイトを確認できます。

Nano Banana の無料枠が切れていたり、画像生成に失敗したりした場合、エージェントは画像プレースホルダーを作ることがあります。チュートリアルとしては問題ありません。

終了前に、チームを片付けます。

```text
Clean up the team. All tasks are complete.
```

Claude Code を終了します。

```text
/exit
```

---

## 1.15 この型を再利用する

コーヒーショップサイトは一例です。同じ考え方は次のような作業にも使えます。

- ドキュメント作成
- テスト作成
- リファクタリング
- データダッシュボード
- セキュリティレビュー
- アクセシビリティレビュー
- ローンチチェックリスト

再利用できる流れ：

1. 専用のプロジェクトフォルダを作る。
2. `CLAUDE.md` にプロジェクト概要を書く。
3. `.claude/settings.json` を作る。
4. ファイルを作る前に専門役割を設計する。
5. `.claude/agents/` にエージェントごとの Markdown ファイルを作る。
6. Git チェックポイントを保存する。
7. まず 1 エージェントだけでテストする。
8. フルチームを実行する。

良い Agent Team は、人数の多さではなく、役割、境界、完了条件が明確であることが大切です。

---

# 2. トラブルシューティング

## Claude Code が Ollama に接続できない

```bash
ollama list
```

失敗する場合は Ollama アプリを起動するか、次を実行します。

```bash
ollama serve
```

## モデルが見つからない

```bash
ollama list
```

一覧に表示された正確なモデル名を使ってください。この手順では `qwen3.5-9b-64k:latest` を使います。

## Agent Teams が表示されない

```bash
rg "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS" .claude/settings.json
```

期待される設定：

```text
"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
```

修正：

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

## チームメイトが違うモデルを使う

```bash
rg "CLAUDE_CODE_SUBAGENT_MODEL" .claude/settings.json
```

Qwen の修正：

```bash
export CLAUDE_CODE_SUBAGENT_MODEL=qwen3.5-9b-64k:latest
```

Gemma4 の修正：

```bash
export CLAUDE_CODE_SUBAGENT_MODEL=gemma4-e4b-64k:latest
```

## Nano Banana が表示されない

```bash
claude mcp list
```

修正：

```bash
export GEMINI_API_KEY="PASTE-YOUR-GEMINI-KEY-HERE"
claude mcp add --scope local --env GEMINI_API_KEY="$GEMINI_API_KEY" nanobanana -- uvx nanobanana-mcp-server@latest
claude mcp list
```

## ローカルモデルが遅すぎる

コンテキストを小さくします。

```bash
cat > Modelfile <<'EOF'
FROM qwen3.5:9b
PARAMETER num_ctx 32768
PARAMETER num_predict -1
EOF

ollama create qwen3.5-9b-32k -f Modelfile
```

起動：

```bash
claude --model qwen3.5-9b-32k:latest --permission-mode default --teammate-mode in-process
```

## ビルドが失敗する

```bash
npm run build
```

Claude Code に次のように依頼します。

```text
The build failed. Read the error message, fix the build, and run npm run build again.
```

---

# 3. クイックリファレンス

## 基本のローカル起動

```bash
cd ~/Desktop/REACTWebBuilder
claude --model qwen3.5-9b-64k:latest --permission-mode default --teammate-mode in-process
```

## 基本のローカル環境変数

```bash
export ANTHROPIC_AUTH_TOKEN=ollama
export ANTHROPIC_API_KEY=""
export ANTHROPIC_BASE_URL=http://localhost:11434
export ANTHROPIC_DEFAULT_HAIKU_MODEL=qwen3.5-9b-64k:latest
export ANTHROPIC_DEFAULT_SONNET_MODEL=qwen3.5-9b-64k:latest
export ANTHROPIC_DEFAULT_OPUS_MODEL=qwen3.5-9b-64k:latest
export CLAUDE_CODE_SUBAGENT_MODEL=qwen3.5-9b-64k:latest
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

## Ollama コマンド

```bash
ollama list
ollama ps
ollama pull qwen3.5:9b
ollama create qwen3.5-9b-64k -f Modelfile
ollama run qwen3.5-9b-64k:latest
```

## React コマンド

```bash
npm install
npm run dev
npm run build
```

## Nano Banana コマンド

```bash
export GEMINI_API_KEY="PASTE-YOUR-GEMINI-KEY-HERE"
claude mcp add --scope local --env GEMINI_API_KEY="$GEMINI_API_KEY" nanobanana -- uvx nanobanana-mcp-server@latest
claude mcp list
```

## Agent 関連フォルダ

```text
.claude/settings.json
.claude/agents/ui-ux-designer.md
.claude/agents/react-architect.md
.claude/agents/content-generator.md
.claude/skills/
CLAUDE.md
```

---

# 4. 付録：やさしい用語集

| 用語 | 意味 |
|:--|:--|
| Agent | 特定の役割を持つ AI 作業者です。 |
| Agent Team | リードエージェントがまとめる Claude Code エージェントのグループです。 |
| API キー | オンラインサービスを使うための秘密のキーです。パスワードのように扱います。 |
| CLI | Command-Line Interface。文字入力で操作するプログラムです。 |
| コンテキスト | AI モデルが一度に参照できる文章やコードの量です。 |
| 環境変数 | プログラムを起動する前にターミナルへ渡す設定です。 |
| Git チェックポイント | 後で戻れるように保存したプロジェクト状態です。 |
| LLM | Large Language Model。文章やコードを読み書きする AI モデルです。 |
| MCP | AI エージェントに外部ツールを接続する仕組みです。 |
| Nano Banana | Gemini 経由で画像生成を行う MCP サーバーです。 |
| npm | JavaScript パッケージを入れるツールです。 |
| Ollama | 自分のコンピュータで AI モデルを動かすプログラムです。 |
| Permission mode | AI が実行前に確認を求めるかを制御する Claude Code 設定です。 |
| React | Web サイトやアプリを作る JavaScript ライブラリです。 |
| Token | AI モデルが扱う小さなテキスト単位です。 |
| Vite | Web プロジェクトを高速に作成・実行するツールです。 |

---

# 5. 確認した情報源

このチュートリアルは次の文書をもとに作成しました。

- `NativeClaudeTeam_tutorial_EN.md`
- `NativeClaudeTeam_transcript_v3.md`
- `ClaudeAgentSetupTutorial_EN.md`

参考情報：

- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [Claude Code model configuration](https://code.claude.com/docs/en/model-config)
- [Claude Code settings](https://code.claude.com/docs/en/settings)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Ollama Claude Code integration](https://docs.ollama.com/integrations/claude-code)
- [Ollama Modelfile reference](https://docs.ollama.com/modelfile)
- [Anthropic skills repository](https://github.com/anthropics/skills)
