# Docker Automation チュートリアル

Claude Code Agent Team を Docker サンドボックス内で動かし、完全自動化モードをより安全に使い、完成した React サイトを Firebase Hosting にデプロイする手順です。

このチュートリアルは、技術に慣れていない方でも進められるように書いています。コマンドはコピー＆ペーストできる形を基本にし、重要な設定では「何をするのか」と「なぜ必要なのか」を平易に説明します。

この文書は `DockerAutomation_tutorial_EN.md` をもとに、日本語話者に自然に伝わるよう再構成したものです。

---

## このチュートリアルで学ぶこと

最後まで進めると、次の内容が分かります。

- Claude Code 用の Docker サンドボックスを作る方法
- Docker から自分のコンピュータ上の Ollama に接続する方法
- Docker 内で `--dangerously-skip-permissions` を使う方法
- locked-down mode と shared project mode の違い
- Docker 内で Nano Banana MCP 画像ツールを再登録する理由
- 自動化された React サイト制作プロンプトの使い方
- Firebase Hosting で完成サイトを公開する方法
- Docker コンテナとイメージを片付ける方法

このチュートリアルは `NativeClaudeTeam_tutorial_JP.md` の続きです。

---

## 重要な安全メモ

このチュートリアルでは、強力な自動化モードを使います。

```bash
--dangerously-skip-permissions
```

名前が大げさなのは理由があります。このフラグを使うと、Claude Code は毎回あなたに確認せず、ファイル編集やコマンド実行を進められます。

注意点：

- Docker はリスクを減らします。
- ただし、何でも安全にする魔法ではありません。
- 実プロジェクトフォルダを Docker にマウントすると、AI はそのフォルダ内のファイルを編集・削除できます。
- ホームフォルダ、SSH キー、パスワードファイル、ブラウザプロファイル、クラウド認証情報はマウントしないでください。
- shared project mode を使う前に、必ず Git チェックポイントを作ってください。

Docker に慣れていない場合は、まず locked-down mode から始めてください。

---

## 前提条件

始める前に、次の準備ができている想定です。

- `~/Desktop/REACTWebBuilder` に React プロジェクトがある
- Ollama がローカルで動いている
- `qwen3.5-9b-64k:latest` というカスタムモデルがある
- `.claude/settings.json` に Claude Code のプロジェクト設定がある
- `.claude/agents/` にエージェント定義ファイルがある
- 必要に応じて Nano Banana MCP が設定済み

まだの場合は、先に `NativeClaudeTeam_tutorial_JP.md` を完了してください。

---

## 目次

1. [Docker 自動化セットアップ](#1-docker-自動化セットアップ)
   - [1.1 Docker 自動化とは](#11-docker-自動化とは)
   - [1.2 Docker モードを選ぶ](#12-docker-モードを選ぶ)
   - [1.3 Docker Desktop を入れる](#13-docker-desktop-を入れる)
   - [1.4 Docker サンドボックスを作る](#14-docker-サンドボックスを作る)
   - [1.5 Docker イメージをビルドする](#15-docker-イメージをビルドする)
   - [1.6 方法 A：Locked-Down Mode](#16-方法-alocked-down-mode)
   - [1.7 方法 B：Shared Project Mode](#17-方法-bshared-project-mode)
   - [1.8 自動化プロンプトを実行する](#18-自動化プロンプトを実行する)
   - [1.9 Gemma4 を使う場合](#19-gemma4-を使う場合)
   - [1.10 Firebase Hosting にデプロイする](#110-firebase-hosting-にデプロイする)
   - [1.11 tmux はどうするか](#111-tmux-はどうするか)
   - [1.12 片付ける](#112-片付ける)
2. [トラブルシューティング](#2-トラブルシューティング)
3. [クイックリファレンス](#3-クイックリファレンス)
4. [付録：やさしい用語集](#4-付録やさしい用語集)
5. [確認した情報源](#5-確認した情報源)

---

# 1. Docker 自動化セットアップ

この章では、動画で扱った発展的な構成を作ります。

Docker を使います。

Docker 内では Claude Code の権限確認をスキップします。

AI モデルは、引き続き自分のコンピュータ上の Ollama を使います。

ローカル Ollama モデルでは tmux の詳細な分割ペイン表示が安定しにくいため、チームメイトは 1 つの Claude Code 画面内で動かします。

## 1.1 Docker 自動化とは

初心者向けワークフローでは、Claude Code は重要な操作の前に確認します。

- このファイルを編集してよいですか？
- このコマンドを実行してよいですか？
- このパッケージをインストールしてよいですか？
- ビルドしてよいですか？

安全ですが、エージェント作業は遅くなりがちです。

Docker ワークフローでは、Claude Code をコンテナ内で動かし、次のフラグを使います。

```bash
--dangerously-skip-permissions
```

このフラグは、Claude Code が毎回確認せずに編集やコマンド実行を進めるためのものです。

便利な理由：

- エージェントが止まりにくくなり、より自動的に作業できます。

Docker が必要な理由：

- メインのコンピュータ上で直接 skip-permissions を使うのはおすすめしません。
- Docker により、AI に渡す作業範囲を制御できます。

---

## 1.2 Docker モードを選ぶ

このチュートリアルでは 2 つのモードを扱います。

| モード | 意味 | 向いている場面 |
|:--|:--|:--|
| Locked-down mode | 実プロジェクトフォルダを Docker に接続しません。AI は Docker 内で作業し、最後にファイルを取り出します。 | 初心者、安全寄りの実験 |
| Shared project mode | 実プロジェクトフォルダを Docker に接続します。変更はすぐ自分のコンピュータ上にも反映されます。 | Git チェックポイントを作ったうえで素早く進めたい場合 |

分かりやすく言うと：

- locked-down mode は安全寄りですが、少し手間が増えます。
- shared project mode は便利ですが、実ファイルが即座に変わります。

迷う場合は locked-down mode から始めてください。

---

## 1.3 Docker Desktop を入れる

1. [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/) を開きます。
2. 自分のコンピュータ用の Docker Desktop をダウンロードします。
3. Mac の場合、M1 / M2 / M3 / M4 は Apple Silicon、古い Mac は Intel を選びます。
4. 通常のアプリと同じようにインストールします。
5. Docker Desktop を起動します。

確認します。

```bash
docker --version
docker info
```

`docker --version` は Docker のバージョンを表示します。`docker info` は Docker Desktop が起動しているか確認します。

`docker info` が失敗する場合は、Docker Desktop を開き、起動が終わるまで待ってからもう一度実行してください。

---

## 1.4 Docker サンドボックスを作る

React プロジェクトへ移動します。

```bash
cd ~/Desktop/REACTWebBuilder
```

Dockerfile を作ります。Dockerfile は、どんなコンテナを作るかを Docker に伝えるレシピです。

```bash
cat > Dockerfile <<'EOF'
FROM node:22-bookworm-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    git \
    g++ \
    make \
    procps \
    python3 \
    ripgrep \
    tmux \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g @anthropic-ai/claude-code@latest

RUN mkdir -p /home/node && \
    echo 'set -s extended-keys on' > /home/node/.tmux.conf && \
    echo "set -as terminal-features 'xterm*:extkeys'" >> /home/node/.tmux.conf && \
    echo 'set -g allow-passthrough on' >> /home/node/.tmux.conf && \
    echo 'set -g mouse on' >> /home/node/.tmux.conf && \
    echo 'set -g history-limit 50000' >> /home/node/.tmux.conf && \
    chown node:node /home/node/.tmux.conf

WORKDIR /workspace
USER node
CMD ["/bin/bash"]
EOF
```

この Dockerfile は、Node.js 22 入りの小さな Linux 環境に、Git、Python、ripgrep、tmux、Claude Code、uv / uvx を入れます。`USER node` により root ではなく通常ユーザーで動かします。

---

## 1.5 Docker イメージをビルドする

```bash
docker build -t claude-agent-sandbox .
```

このコマンドは Dockerfile を読み、必要なものをダウンロードし、`claude-agent-sandbox` という名前の Docker イメージを作ります。

初回ビルドには数分かかることがあります。正常です。

---

## 1.6 方法 A：Locked-Down Mode

locked-down mode は最も安全寄りの Docker モードです。

実プロジェクトフォルダを Docker に接続しません。AI は Docker 内だけで作業します。

### 1.6.1 locked コンテナを起動する

Nano Banana を使う場合は、ホスト側のターミナルで Gemini キーを設定します。

```bash
export GEMINI_API_KEY="PASTE-YOUR-GEMINI-KEY-HERE"
```

以前の実行が失敗して named container だけ残っている場合は、先に削除します。

```bash
docker rm claude-agent-locked
```

コンテナを起動します。

```bash
docker run -it \
  --name claude-agent-locked \
  --user root \
  -e HOME="/home/node" \
  -e ANTHROPIC_AUTH_TOKEN="ollama" \
  -e ANTHROPIC_API_KEY="" \
  -e GEMINI_API_KEY="${GEMINI_API_KEY}" \
  -e ANTHROPIC_BASE_URL="http://host.docker.internal:11434" \
  -e ANTHROPIC_DEFAULT_HAIKU_MODEL="qwen3.5-9b-64k:latest" \
  -e ANTHROPIC_DEFAULT_SONNET_MODEL="qwen3.5-9b-64k:latest" \
  -e ANTHROPIC_DEFAULT_OPUS_MODEL="qwen3.5-9b-64k:latest" \
  -e CLAUDE_CODE_SUBAGENT_MODEL="qwen3.5-9b-64k:latest" \
  -e CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS="1" \
  -e CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="1" \
  claude-agent-sandbox \
  /bin/bash -lc 'chown -R node:node /workspace /home/node && exec su -p node -s /bin/bash'
```

重要な点：

- `docker run -it` は入力できるコンテナを起動します。
- `--name claude-agent-locked` はコンテナ名です。
- `--user root` は `/workspace` の所有者を直すためだけに root で開始します。
- `HOME=/home/node` は npm と Claude Code のユーザーファイルを node ユーザーのホームに置きます。
- 最後の `/bin/bash -lc ...` は `/workspace` を node ユーザーが書き込めるようにしてから、通常の node シェルへ切り替えます。
- `host.docker.internal` は Docker Desktop から見た Mac / Windows ホストの名前です。
- `ANTHROPIC_BASE_URL` により、Docker 内の Claude Code がホスト側の Ollama に接続できます。

プロンプトが次のようになれば、コンテナ内に入っています。

```text
node@container-id:/workspace$
```

### 1.6.2 コンテナ内にプロジェクトを作る

```bash
npm create vite@latest . -- --template react
npm install
git init
git config --global user.email "builder@local"
git config --global user.name "Builder"
git add .
git commit -m "Initial Vite React scaffold"
```

locked-down mode の `/workspace` は空なので、Docker 内でプロジェクトを作ります。

実運用では、`.claude/settings.json`、`.claude/agents/`、`CLAUDE.md` も追加してください。`NativeClaudeTeam_tutorial_JP.md` の内容をコピーして再作成できます。

### 1.6.3 コンテナ内で Nano Banana を追加する

```bash
claude mcp add nanobanana --scope local -e KEY1="$GEMINI_API_KEY" -- uvx nanobanana-mcp-server@latest
claude mcp list
```

Docker には独自のホームフォルダがあります。Mac 側で設定した MCP は自動では使えないため、コンテナ内でも登録します。

### 1.6.4 自動化モードで Claude Code を起動する

```bash
claude --model qwen3.5-9b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

このコマンドで、Claude Code はローカルモデルを使い、確認を挟まずに作業できます。Docker により、万一の影響範囲を小さくできます。

### 1.6.5 ファイルを取り出す

Claude Code を終了します。

```text
/exit
```

コンテナから出ます。

```bash
exit
```

成果物をコピーします。

```bash
docker cp claude-agent-locked:/workspace/. ./docker-output/
```

停止したコンテナを削除します。

```bash
docker rm claude-agent-locked
```

---

## 1.7 方法 B：Shared Project Mode

shared project mode は、実プロジェクトフォルダを Docker に接続します。

便利ですが、安全性は下がります。Docker 内の変更が、そのまま実プロジェクトに反映されます。

重要：

- マウントされたフォルダは本物のプロジェクトです。
- Claude Code が `/workspace` 内でファイルを削除すると、実プロジェクトからも削除されます。
- skip-permissions を使う前に必ず Git チェックポイントを作ってください。

### 1.7.1 Git チェックポイントを保存する

通常の Mac ターミナルで実行します。

```bash
cd ~/Desktop/REACTWebBuilder
git status
git add .
git commit -m "Checkpoint before Docker automation"
```

Git が「nothing to commit」と表示した場合は、すでにきれいな状態なので問題ありません。

### 1.7.2 shared コンテナを起動する

Nano Banana を使う場合：

```bash
export GEMINI_API_KEY="PASTE-YOUR-GEMINI-KEY-HERE"
```

コンテナを起動します。

```bash
docker run -it --rm \
  --mount type=bind,source="$(pwd)",target=/workspace \
  -e ANTHROPIC_AUTH_TOKEN="ollama" \
  -e ANTHROPIC_API_KEY="" \
  -e GEMINI_API_KEY="${GEMINI_API_KEY}" \
  -e ANTHROPIC_BASE_URL="http://host.docker.internal:11434" \
  -e ANTHROPIC_DEFAULT_HAIKU_MODEL="qwen3.5-9b-64k:latest" \
  -e ANTHROPIC_DEFAULT_SONNET_MODEL="qwen3.5-9b-64k:latest" \
  -e ANTHROPIC_DEFAULT_OPUS_MODEL="qwen3.5-9b-64k:latest" \
  -e CLAUDE_CODE_SUBAGENT_MODEL="qwen3.5-9b-64k:latest" \
  -e CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS="1" \
  -e CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="1" \
  claude-agent-sandbox
```

`--mount type=bind,source="$(pwd)",target=/workspace` は、今いるフォルダを Docker 内の `/workspace` として共有します。`--rm` は終了後にコンテナを自動削除します。

### 1.7.3 コンテナ内を準備する

```bash
git config --global user.email "builder@local"
git config --global user.name "Builder"
claude mcp add nanobanana --scope local -e KEY1="$GEMINI_API_KEY" -- uvx nanobanana-mcp-server@latest
claude mcp list
```

Docker 内では Git の名前・メールと Nano Banana を改めて設定します。

### 1.7.4 Claude Code を起動する

```bash
claude --model qwen3.5-9b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

---

## 1.8 自動化プロンプトを実行する

Claude Code が起動したら、次のプロンプトを渡します。

```text
Build a polished, responsive React website for an upscale coffee shop called Brew and Bean.

Use the existing project agents:
- ui-ux-designer for layout and styling
- content-generator for copy, image prompts, and Nano Banana image generation
- react-architect for React components and build fixes

Work autonomously.
Keep changes focused.
Use the Nano Banana MCP server to generate 2 or 3 website images that match the content.
Save generated images under public/assets/images.
Run npm run build.
Fix all build errors.
Do not deploy.
When finished, summarize the changed files and the final build result.
```

このプロンプトは、ゴール、役割、画像生成、ビルド確認、デプロイ禁止を明確にします。完全自動化では境界をはっきり書くことが大切です。

作業が終わったら終了します。

```text
/exit
```

コンテナ内にいる場合は出ます。

```bash
exit
```

---

## 1.9 Gemma4 を使う場合

Gemma4 を使っている場合は、すべての

```text
qwen3.5-9b-64k:latest
```

を次に置き換えます。

```text
gemma4-e4b-64k:latest
```

例：

```bash
claude --model gemma4-e4b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

---

## 1.10 Firebase Hosting にデプロイする

Firebase Hosting は、Web サイトをインターネットに公開する Google のサービスです。

初心者は Docker 内ではなく、通常の Mac ターミナルからデプロイしてください。Firebase のログイントークンは通常ホスト側に保存されるためです。

### 1.10.1 Firebase プロジェクトを作る

1. [https://console.firebase.google.com](https://console.firebase.google.com) を開きます。
2. Google アカウントでログインします。
3. 「Create a project」をクリックします。
4. `brew-and-bean-site` のような名前を付けます。
5. このチュートリアルでは Google Analytics は任意です。
6. 作成を完了します。

### 1.10.2 ターミナルからログインする

Docker 内ではなく、通常のターミナルで実行します。

```bash
npx -y firebase-tools@latest login
```

ブラウザで Google ログインが開きます。

### 1.10.3 Hosting を初期化する

```bash
cd ~/Desktop/REACTWebBuilder
npx -y firebase-tools@latest init hosting
```

推奨回答：

| Firebase の質問 | 回答 |
|:--|:--|
| Use an existing project? | Yes。作成したプロジェクトを選びます。 |
| Public directory? | `dist` |
| Configure as a single-page app? | Yes |
| Set up automatic builds with GitHub? | No |
| Overwrite `dist/index.html`? | すでにビルド済みなら No |

### 1.10.4 ビルドする

shared mode で Docker 内の `npm run build` が成功していれば、ビルド済みファイルはすでに Mac 側にあります。

必要なら実行します。

```bash
npm run build
```

### 1.10.5 デプロイする

```bash
npx -y firebase-tools@latest deploy --only hosting
```

完了すると公開 URL が表示されます。

設定を保存します。

```bash
git add firebase.json .firebaserc
git commit -m "Add Firebase Hosting config"
```

---

## 1.11 tmux はどうするか

tmux は 1 つのターミナルを複数ペインに分けるツールです。

チームメイトごとに別ペインで見たい場合がありますが、重要な制限があります。

- 詳細な tmux チームメイトペインは、現時点では Anthropic のクラウドモデルで安定しやすいです。
- ローカル Ollama モデルでは、通常 1 つの Claude Code 画面内に表示されます。

ローカル Docker 自動化では次を使います。

```bash
--teammate-mode in-process
```

tmux の複数ペイン体験を使いたい場合は、Anthropic クラウドモデルの設定が必要で、利用料金が発生する可能性があります。

---

## 1.12 片付ける

ターミナルウィンドウをそのまま閉じず、まず Claude Code を終了します。

```text
/exit
```

コンテナから出ます。

```bash
exit
```

shared mode で `--rm` を使った場合、コンテナは自動削除されます。

locked container を使った場合は確認して削除します。

```bash
docker ps -a
docker rm claude-agent-locked
```

ディスク容量を空けたい場合は、イメージも削除できます。

```bash
docker rmi claude-agent-sandbox
```

削除した場合、次回使う前に `docker build -t claude-agent-sandbox .` で再ビルドが必要です。

---

# 2. トラブルシューティング

## Docker が起動していない

```bash
docker info
```

失敗する場合は Docker Desktop を開き、起動が完了してから再実行してください。

## Docker から Ollama に届かない

Mac / Windows の Docker Desktop では次を使います。

```text
http://host.docker.internal:11434
```

Docker 内の `localhost` は Mac ではなくコンテナ自身を指します。

Ollama が接続を拒否する場合は、Mac の通常ターミナルで次を試します。

```bash
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

Linux の場合、`docker run` に次が必要なことがあります。

```bash
--add-host=host.docker.internal:host-gateway
```

## Docker 内でモデルが見つからない

Mac 側で確認します。

```bash
ollama list
```

一覧に表示された正確なモデル名を Docker の環境変数にも使ってください。

## Docker 内で Nano Banana が表示されない

コンテナ内で確認します。

```bash
echo $GEMINI_API_KEY
claude mcp list
```

再登録：

```bash
claude mcp add nanobanana --scope local -e KEY1="$GEMINI_API_KEY" -- uvx nanobanana-mcp-server@latest
claude mcp list
```

## まだ権限確認が出る

起動コマンドに次が含まれているか確認します。

```bash
claude --model qwen3.5-9b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

## shared mode で予期しない変更が起きた

```bash
git status
git diff
```

shared mode は実プロジェクトを直接編集します。変更を捨てる破壊的な Git コマンドは、意味を理解している場合だけ使ってください。

## Firebase deploy が失敗する

```bash
npx -y firebase-tools@latest login
npm run build
npx -y firebase-tools@latest deploy --only hosting
```

確認点：

- `firebase.json` の `"public"` が `"dist"` になっているか
- デプロイ前に `npm run build` が成功しているか
- Docker 内ではなく通常の Mac ターミナルからデプロイしているか

## ローカルモデルで tmux ペインが分割されない

これは想定内です。ローカル Ollama モデルでは、通常 1 つの Claude Code 画面内で Agent Teams が動きます。

```bash
claude --model qwen3.5-9b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

---

# 3. クイックリファレンス

## Docker イメージをビルド

```bash
cd ~/Desktop/REACTWebBuilder
docker build -t claude-agent-sandbox .
```

## locked-down container

```bash
docker run -it \
  --name claude-agent-locked \
  --user root \
  -e HOME="/home/node" \
  -e ANTHROPIC_AUTH_TOKEN="ollama" \
  -e ANTHROPIC_API_KEY="" \
  -e GEMINI_API_KEY="${GEMINI_API_KEY}" \
  -e ANTHROPIC_BASE_URL="http://host.docker.internal:11434" \
  -e ANTHROPIC_DEFAULT_HAIKU_MODEL="qwen3.5-9b-64k:latest" \
  -e ANTHROPIC_DEFAULT_SONNET_MODEL="qwen3.5-9b-64k:latest" \
  -e ANTHROPIC_DEFAULT_OPUS_MODEL="qwen3.5-9b-64k:latest" \
  -e CLAUDE_CODE_SUBAGENT_MODEL="qwen3.5-9b-64k:latest" \
  -e CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS="1" \
  -e CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="1" \
  claude-agent-sandbox \
  /bin/bash -lc 'chown -R node:node /workspace /home/node && exec su -p node -s /bin/bash'
```

## shared project container

```bash
cd ~/Desktop/REACTWebBuilder
docker run -it --rm \
  --mount type=bind,source="$(pwd)",target=/workspace \
  -e ANTHROPIC_AUTH_TOKEN="ollama" \
  -e ANTHROPIC_API_KEY="" \
  -e GEMINI_API_KEY="${GEMINI_API_KEY}" \
  -e ANTHROPIC_BASE_URL="http://host.docker.internal:11434" \
  -e ANTHROPIC_DEFAULT_HAIKU_MODEL="qwen3.5-9b-64k:latest" \
  -e ANTHROPIC_DEFAULT_SONNET_MODEL="qwen3.5-9b-64k:latest" \
  -e ANTHROPIC_DEFAULT_OPUS_MODEL="qwen3.5-9b-64k:latest" \
  -e CLAUDE_CODE_SUBAGENT_MODEL="qwen3.5-9b-64k:latest" \
  -e CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS="1" \
  -e CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="1" \
  claude-agent-sandbox
```

## Docker 内セットアップ

```bash
git config --global user.email "builder@local"
git config --global user.name "Builder"
claude mcp add nanobanana --scope local -e KEY1="$GEMINI_API_KEY" -- uvx nanobanana-mcp-server@latest
claude mcp list
```

## 自動化 Claude 起動

```bash
claude --model qwen3.5-9b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

## Firebase デプロイ

```bash
cd ~/Desktop/REACTWebBuilder
npm run build
npx -y firebase-tools@latest login
npx -y firebase-tools@latest init hosting
npx -y firebase-tools@latest deploy --only hosting
```

## クリーンアップ

```bash
docker ps -a
docker rm claude-agent-locked
docker rmi claude-agent-sandbox
```

---

# 4. 付録：やさしい用語集

| 用語 | 意味 |
|:--|:--|
| Bind mount | 自分のコンピュータ上の実フォルダを Docker コンテナに接続する仕組みです。 |
| Container | Docker が作る、隔離された小さなソフトウェア環境です。 |
| Docker | ソフトウェアをコンテナ内で動かすツールです。 |
| Dockerfile | Docker イメージを作るためのレシピです。 |
| Docker image | Dockerfile から作られる、コンテナのひな型です。 |
| 環境変数 | プログラムを起動する前に渡す設定です。 |
| Firebase Hosting | Web サイトを公開するための Google サービスです。 |
| Git チェックポイント | 後で比較・復元できる保存済みプロジェクト状態です。 |
| Host computer | Docker の外側にある自分の実コンピュータです。 |
| MCP | AI エージェントに外部ツールを接続する仕組みです。 |
| Nano Banana | Gemini 経由で画像生成を行う MCP サーバーです。 |
| Ollama | 自分のコンピュータ上で AI モデルを動かすプログラムです。 |
| Permission prompt | Claude Code が編集やコマンド前に出す確認です。 |
| Sandbox | ソフトウェアが触れる範囲を制限した作業場所です。 |
| Skip permissions | Claude Code が毎回確認せずに作業するモードです。境界設定が重要です。 |
| tmux | 1 つのターミナルを複数ペインに分けるツールです。 |

---

# 5. 確認した情報源

このチュートリアルは次の文書をもとに作成しました。

- `DockerAutomation_tutorial_EN.md`
- `DockerAutomation_transcript_v2.md`
- `ClaudeAgentSetupTutorial_EN.md`
- `NativeClaudeTeam_tutorial_JP.md`

参考情報：

- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [Claude Code model configuration](https://code.claude.com/docs/en/model-config)
- [Claude Code settings](https://code.claude.com/docs/en/settings)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Ollama Claude Code integration](https://docs.ollama.com/integrations/claude-code)
- [Docker bind mounts](https://docs.docker.com/engine/storage/bind-mounts/)
- [Docker Desktop networking](https://docs.docker.com/desktop/features/networking/networking-how-tos/)
- [Firebase Hosting quickstart](https://firebase.google.com/docs/hosting/quickstart)
- [Firebase CLI documentation](https://firebase.google.com/docs/cli)
