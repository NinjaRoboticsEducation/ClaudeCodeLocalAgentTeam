# Docker Automation 教學

這份教學會帶你把 Claude Code Agent Team 放進 Docker 沙盒中執行，更安全地使用完全自動化模式，並用 Firebase Hosting 部署完成的 React 網站。

內容是寫給非技術背景使用者看的。所有指令都盡量保持可以直接複製貼上；重要設定會用白話說明「它做什麼」以及「為什麼需要它」。

本文件依據 `DockerAutomation_tutorial_EN.md` 製作，並針對繁體中文讀者重新整理語氣與說明方式。

---

## 你會學到什麼

完成後，你會理解：

- 如何建立 Claude Code 用的 Docker 沙盒
- 如何讓 Docker 連回你電腦上的本機 Ollama 模型
- 如何在 Docker 中使用 `--dangerously-skip-permissions`
- locked-down mode 與 shared project mode 的差異
- 為什麼 Nano Banana MCP 圖像工具需要在 Docker 內重新加入
- 如何使用自動化 React 網站建置提示
- 如何用 Firebase Hosting 發布網站
- 如何清理 Docker 容器與映像

這份教學延續 `NativeClaudeTeam_tutorial_TC.md` 的本機代理人團隊流程。

---

## 重要安全提醒

本教學會使用強力自動化模式：

```bash
--dangerously-skip-permissions
```

這個名稱很誇張，但不是開玩笑。它代表 Claude Code 可以不再每次詢問你，就直接編輯檔案或執行指令。

請記住：

- Docker 可以降低風險。
- Docker 不會神奇地讓所有事情都安全。
- 如果你把真實專案資料夾掛載到 Docker，AI 就能編輯或刪除那個資料夾中的檔案。
- 不要掛載家目錄、SSH key、密碼檔、瀏覽器設定檔或雲端憑證。
- 使用 shared project mode 前，一定要建立 Git 檢查點。

如果你不熟 Docker，請先從 locked-down mode 開始。

---

## 前置條件

開始前，你應該已經有：

- 位於 `~/Desktop/REACTWebBuilder` 的 React 專案
- 正在本機執行的 Ollama
- 名為 `qwen3.5-9b-64k:latest` 的自訂模型
- `.claude/settings.json` 裡的 Claude Code 專案設定
- `.claude/agents/` 裡的代理人定義檔
- 選用的 Nano Banana MCP 設定

如果還沒有，請先完成 `NativeClaudeTeam_tutorial_TC.md`。

---

## 目錄

1. [Docker 自動化設定](#1-docker-自動化設定)
   - [1.1 Docker 自動化代表什麼](#11-docker-自動化代表什麼)
   - [1.2 選擇 Docker 模式](#12-選擇-docker-模式)
   - [1.3 安裝 Docker Desktop](#13-安裝-docker-desktop)
   - [1.4 建立 Docker 沙盒](#14-建立-docker-沙盒)
   - [1.5 建置 Docker 映像](#15-建置-docker-映像)
   - [1.6 選項 A：Locked-Down Mode](#16-選項-alocked-down-mode)
   - [1.7 選項 B：Shared Project Mode](#17-選項-bshared-project-mode)
   - [1.8 執行自動化代理人提示](#18-執行自動化代理人提示)
   - [1.9 改用 Gemma4](#19-改用-gemma4)
   - [1.10 使用 Firebase Hosting 部署](#110-使用-firebase-hosting-部署)
   - [1.11 tmux 怎麼辦](#111-tmux-怎麼辦)
   - [1.12 清理](#112-清理)
2. [疑難排解](#2-疑難排解)
3. [快速參考](#3-快速參考)
4. [附錄：白話術語](#4-附錄白話術語)
5. [已查核來源](#5-已查核來源)

---

# 1. Docker 自動化設定

本章會建立影片中的進階流程。

會使用 Docker。

會在 Docker 內跳過 Claude Code 權限確認。

仍然使用你電腦上透過 Ollama 執行的本機模型。

由於本機 Ollama 模型通常不穩定支援詳細 tmux 分窗格，因此隊友代理人會顯示在同一個 Claude Code 介面中。

## 1.1 Docker 自動化代表什麼

在入門流程中，Claude Code 會在重要操作前詢問：

- 可以編輯這個檔案嗎？
- 可以執行這個指令嗎？
- 可以安裝這個套件嗎？
- 可以建置專案嗎？

這比較安全，但代理人工作會變慢。

Docker 自動化流程會把 Claude Code 放進容器中，並使用：

```bash
--dangerously-skip-permissions
```

這個旗標會讓 Claude Code 不再每次確認就直接工作。

好處：

- 代理人比較不會一直停下來等你批准。
- 自動化程度更高。

為什麼要搭配 Docker：

- 不建議在主機電腦上直接使用 skip-permissions。
- Docker 可以提供受控工作空間。

---

## 1.2 選擇 Docker 模式

本教學提供兩種模式。

| 模式 | 意思 | 適合 |
|:--|:--|:--|
| Locked-down mode | 不把真實專案資料夾接到 Docker。AI 在 Docker 內工作，最後再把檔案複製出來。 | 初學者與安全實驗 |
| Shared project mode | 把真實專案資料夾接到 Docker。變更會立刻出現在你的電腦上。 | 已有 Git 檢查點、想快速工作時 |

白話差異：

- locked-down mode 比較安全，但比較麻煩。
- shared project mode 比較方便，但會直接修改真實檔案。

不確定時，請先用 locked-down mode。

---

## 1.3 安裝 Docker Desktop

1. 開啟 [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. 下載適合你電腦的 Docker Desktop。
3. Mac 使用者請依機型選 Apple Silicon 或 Intel。
4. 像一般 app 一樣安裝。
5. 啟動 Docker Desktop。

確認：

```bash
docker --version
docker info
```

`docker --version` 顯示 Docker 版本。`docker info` 確認 Docker Desktop 是否正在執行。

如果 `docker info` 失敗，請打開 Docker Desktop，等它啟動完成後再試一次。

---

## 1.4 建立 Docker 沙盒

進入 React 專案：

```bash
cd ~/Desktop/REACTWebBuilder
```

建立 Dockerfile。Dockerfile 是告訴 Docker 如何建出容器的配方。

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

這個 Dockerfile 會建立一個小型 Linux 開發環境，裡面有 Node.js、Git、Python、ripgrep、tmux、Claude Code，以及 uv / uvx。`USER node` 避免以 root 身分執行 Claude Code。

---

## 1.5 建置 Docker 映像

```bash
docker build -t claude-agent-sandbox .
```

這會讀取 Dockerfile、下載需要的基礎映像、安裝工具，並建立名為 `claude-agent-sandbox` 的 Docker 映像。

第一次建置可能需要幾分鐘，這是正常的。

---

## 1.6 選項 A：Locked-Down Mode

locked-down mode 是最安全的 Docker 模式。

它不會連接你的真實專案資料夾。AI 只在 Docker 內部工作。

### 1.6.1 啟動 locked 容器

如果使用 Nano Banana，先在主機終端機設定 Gemini 金鑰：

```bash
export GEMINI_API_KEY="PASTE-YOUR-GEMINI-KEY-HERE"
```

如果之前執行失敗並留下 named container，請先刪除它：

```bash
docker rm claude-agent-locked
```

啟動容器：

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

重點：

- `docker run -it` 啟動可互動的容器。
- `--name claude-agent-locked` 給容器一個名稱。
- `--user root` 只是在啟動時暫時用 root 修正 `/workspace` 的擁有權。
- `HOME=/home/node` 讓 npm 和 Claude Code 的使用者檔案放在 node 使用者的 home 目錄。
- 最後的 `/bin/bash -lc ...` 會先讓 node 使用者可以寫入 `/workspace`，然後切回一般的 node shell。
- `host.docker.internal` 是 Docker Desktop 用來代表 Mac / Windows 主機的名稱。
- `ANTHROPIC_BASE_URL` 讓 Docker 內的 Claude Code 連到主機上的 Ollama。

看到類似下面的提示符，代表你已在容器內：

```text
node@container-id:/workspace$
```

### 1.6.2 在容器內建立專案

```bash
npm create vite@latest . -- --template react
npm install
git init
git config --global user.email "builder@local"
git config --global user.name "Builder"
git add .
git commit -m "Initial Vite React scaffold"
```

locked-down mode 的 `/workspace` 一開始是空的，所以需要在 Docker 內建立專案。

實際使用時，也要加入 `.claude/settings.json`、`.claude/agents/` 和 `CLAUDE.md`。可以從 `NativeClaudeTeam_tutorial_TC.md` 複製相關內容。

### 1.6.3 在容器內加入 Nano Banana

```bash
claude mcp add nanobanana --scope local -e KEY1="$GEMINI_API_KEY" -- uvx nanobanana-mcp-server@latest
claude mcp list
```

Docker 有自己的 home 資料夾，所以 Mac 上的 MCP 設定不會自動出現在容器內。

### 1.6.4 以自動化模式啟動 Claude Code

```bash
claude --model qwen3.5-9b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

這會用本機模型啟動 Claude Code，並跳過每次操作前的確認。Docker 可以縮小出錯時的影響範圍。

### 1.6.5 複製檔案出來

退出 Claude Code：

```text
/exit
```

離開容器：

```bash
exit
```

複製成果：

```bash
docker cp claude-agent-locked:/workspace/. ./docker-output/
```

刪除停止的容器：

```bash
docker rm claude-agent-locked
```

---

## 1.7 選項 B：Shared Project Mode

shared project mode 會把真實專案資料夾連到 Docker。

這比較方便，但風險也更高。Docker 內的變更會立刻反映到你的真實專案。

重要提醒：

- 掛載的資料夾是真實專案。
- Claude Code 在 `/workspace` 刪除檔案，就等於從真實專案刪除檔案。
- 使用 skip-permissions 前，一定要建立 Git 檢查點。

### 1.7.1 保存 Git 檢查點

在一般 Mac 終端機執行：

```bash
cd ~/Desktop/REACTWebBuilder
git status
git add .
git commit -m "Checkpoint before Docker automation"
```

如果 Git 顯示 nothing to commit，表示專案已經是乾淨狀態，沒問題。

### 1.7.2 啟動 shared 容器

如果使用 Nano Banana：

```bash
export GEMINI_API_KEY="PASTE-YOUR-GEMINI-KEY-HERE"
```

啟動容器：

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

`--mount type=bind,source="$(pwd)",target=/workspace` 會把目前資料夾分享給 Docker，並在容器內顯示為 `/workspace`。`--rm` 會在退出後自動刪除容器。

### 1.7.3 準備容器內環境

```bash
git config --global user.email "builder@local"
git config --global user.name "Builder"
claude mcp add nanobanana --scope local -e KEY1="$GEMINI_API_KEY" -- uvx nanobanana-mcp-server@latest
claude mcp list
```

Docker 內需要重新設定 Git 名稱、email，以及 Nano Banana。

### 1.7.4 啟動 Claude Code

```bash
claude --model qwen3.5-9b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

---

## 1.8 執行自動化代理人提示

Claude Code 啟動後，輸入：

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

這個提示清楚指定目標、角色、圖片生成、建置檢查與不要部署。完全自動化時，邊界越清楚越好。

完成後退出：

```text
/exit
```

如果還在容器內：

```bash
exit
```

---

## 1.9 改用 Gemma4

如果使用 Gemma4，請把所有

```text
qwen3.5-9b-64k:latest
```

替換成：

```text
gemma4-e4b-64k:latest
```

範例：

```bash
claude --model gemma4-e4b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

---

## 1.10 使用 Firebase Hosting 部署

Firebase Hosting 是 Google 的網站發布服務。

初學者請從一般 Mac 終端機部署，不要從 Docker 部署。Firebase 登入 token 通常存在主機電腦上。

### 1.10.1 建立 Firebase 專案

1. 開啟 [https://console.firebase.google.com](https://console.firebase.google.com)
2. 用 Google 帳號登入。
3. 點選「Create a project」。
4. 命名，例如 `brew-and-bean-site`。
5. 本教學中 Google Analytics 是選用項目。
6. 完成專案建立。

### 1.10.2 從終端機登入

請在一般終端機執行，不要在 Docker 內。

```bash
npx -y firebase-tools@latest login
```

這會開啟瀏覽器登入 Google。

### 1.10.3 初始化 Hosting

```bash
cd ~/Desktop/REACTWebBuilder
npx -y firebase-tools@latest init hosting
```

建議回答：

| Firebase 問題 | 回答 |
|:--|:--|
| Use an existing project? | Yes，選擇剛建立的專案。 |
| Public directory? | `dist` |
| Configure as a single-page app? | Yes |
| Set up automatic builds with GitHub? | No |
| Overwrite `dist/index.html`? | 已經建置過時選 No |

### 1.10.4 建置

如果你使用 shared mode，且 Docker 內已成功執行 `npm run build`，建置檔已在 Mac 上。

需要時執行：

```bash
npm run build
```

### 1.10.5 部署

```bash
npx -y firebase-tools@latest deploy --only hosting
```

完成後會顯示公開 URL。

保存設定：

```bash
git add firebase.json .firebaserc
git commit -m "Add Firebase Hosting config"
```

---

## 1.11 tmux 怎麼辦

tmux 可以把一個終端機切成多個窗格。

你可能會想把每個隊友代理人放在不同窗格中，但有一個限制：

- 詳細 tmux 隊友窗格目前主要在 Anthropic 雲端模型上穩定。
- 本機 Ollama 模型通常會在同一個 Claude Code 介面中顯示隊友。

本機 Docker 自動化請使用：

```bash
--teammate-mode in-process
```

如果想要多窗格 tmux 體驗，需要 Anthropic 雲端模型設定，而且可能產生費用。

---

## 1.12 清理

不要直接關閉終端機。先退出 Claude Code：

```text
/exit
```

離開容器：

```bash
exit
```

如果 shared mode 使用 `--rm`，容器會自動刪除。

如果使用 named locked container，請檢查並刪除：

```bash
docker ps -a
docker rm claude-agent-locked
```

如果想釋放更多磁碟空間，可以刪除映像：

```bash
docker rmi claude-agent-sandbox
```

刪除後，下次使用前需要重新執行 `docker build -t claude-agent-sandbox .`。

---

# 2. 疑難排解

## Docker 沒有啟動

```bash
docker info
```

失敗時請打開 Docker Desktop，等它啟動完成後再試一次。

## Docker 連不到 Ollama

Mac / Windows 的 Docker Desktop 中使用：

```text
http://host.docker.internal:11434
```

Docker 內的 `localhost` 是容器本身，不是你的 Mac。

如果 Ollama 拒絕連線，請在 Mac 的一般終端機嘗試：

```bash
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

Linux 可能需要在 `docker run` 加上：

```bash
--add-host=host.docker.internal:host-gateway
```

## Docker 內找不到模型

在 Mac 上確認：

```bash
ollama list
```

Docker 環境變數中的模型名稱必須和清單完全一致。

## Docker 內看不到 Nano Banana

在容器內檢查：

```bash
echo $GEMINI_API_KEY
claude mcp list
```

重新加入：

```bash
claude mcp add nanobanana --scope local -e KEY1="$GEMINI_API_KEY" -- uvx nanobanana-mcp-server@latest
claude mcp list
```

## 還是出現權限確認

確認啟動指令包含：

```bash
claude --model qwen3.5-9b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

## shared mode 出現非預期變更

```bash
git status
git diff
```

shared mode 會直接修改真實專案。除非你確定要丟棄變更，否則不要執行破壞性 Git reset。

## Firebase deploy 失敗

```bash
npx -y firebase-tools@latest login
npm run build
npx -y firebase-tools@latest deploy --only hosting
```

確認：

- `firebase.json` 的 `"public"` 是 `"dist"`
- 部署前 `npm run build` 成功
- 從一般 Mac 終端機部署，而不是 Docker 內

## 本機模型沒有切出 tmux 窗格

這是預期情況。本機 Ollama 模型通常在同一個 Claude Code 介面中執行 Agent Teams。

```bash
claude --model qwen3.5-9b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

---

# 3. 快速參考

## 建置 Docker 映像

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

## Docker 內設定

```bash
git config --global user.email "builder@local"
git config --global user.name "Builder"
claude mcp add nanobanana --scope local -e KEY1="$GEMINI_API_KEY" -- uvx nanobanana-mcp-server@latest
claude mcp list
```

## 自動化 Claude 啟動

```bash
claude --model qwen3.5-9b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

## Firebase 部署

```bash
cd ~/Desktop/REACTWebBuilder
npm run build
npx -y firebase-tools@latest login
npx -y firebase-tools@latest init hosting
npx -y firebase-tools@latest deploy --only hosting
```

## 清理

```bash
docker ps -a
docker rm claude-agent-locked
docker rmi claude-agent-sandbox
```

---

# 4. 附錄：白話術語

| 名詞 | 意思 |
|:--|:--|
| Bind mount | 把電腦上的真實資料夾連到 Docker 容器的方式。 |
| Container | Docker 建立的小型隔離軟體環境。 |
| Docker | 在容器中執行軟體的工具。 |
| Dockerfile | 建立 Docker 映像的配方。 |
| Docker image | 由 Dockerfile 建出的容器模板。 |
| 環境變數 | 程式啟動前傳入的設定。 |
| Firebase Hosting | Google 的網站發布服務。 |
| Git 檢查點 | 可供之後比較或恢復的專案狀態。 |
| Host computer | Docker 外面的真實電腦。 |
| MCP | 讓 AI 代理人連接外部工具的方式。 |
| Nano Banana | 透過 Gemini 生成圖片的 MCP 伺服器。 |
| Ollama | 在自己電腦上執行 AI 模型的程式。 |
| Permission prompt | Claude Code 在編輯或執行指令前出現的確認。 |
| Sandbox | 限制軟體可接觸範圍的受控工作區。 |
| Skip permissions | Claude Code 不再每次詢問就執行工作的模式，必須搭配清楚邊界。 |
| tmux | 把一個終端機切成多個窗格的工具。 |

---

# 5. 已查核來源

本教學依據以下文件製作：

- `DockerAutomation_tutorial_EN.md`
- `DockerAutomation_transcript_v2.md`
- `ClaudeAgentSetupTutorial_EN.md`
- `NativeClaudeTeam_tutorial_TC.md`

參考資訊：

- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [Claude Code model configuration](https://code.claude.com/docs/en/model-config)
- [Claude Code settings](https://code.claude.com/docs/en/settings)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Ollama Claude Code integration](https://docs.ollama.com/integrations/claude-code)
- [Docker bind mounts](https://docs.docker.com/engine/storage/bind-mounts/)
- [Docker Desktop networking](https://docs.docker.com/desktop/features/networking/networking-how-tos/)
- [Firebase Hosting quickstart](https://firebase.google.com/docs/hosting/quickstart)
- [Firebase CLI documentation](https://firebase.google.com/docs/cli)
