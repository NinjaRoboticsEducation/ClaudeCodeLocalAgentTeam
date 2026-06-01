# Native Claude Team 教學

這份教學會帶你用 Claude Code Agent Teams、透過 Ollama 執行的本機 AI 模型，以及一組有明確分工的小型代理人團隊，在自己的電腦上建立 React 網站。

內容是寫給非技術背景使用者看的。所有指令都盡量保持可以直接複製貼上；重要設定會用白話說明「它做什麼」以及「為什麼需要它」。

本文件依據 `NativeClaudeTeam_tutorial_EN.md` 製作，並針對繁體中文讀者重新整理語氣與說明方式。

---

## 你會建立什麼

完成後，你會擁有：

- 使用 Vite 建立的 React 網站專案
- 透過 Ollama 在本機執行的 AI 模型
- 已設定為使用本機模型的 Claude Code
- 已啟用的 Claude Code Agent Teams
- 三個專門代理人
  - UI/UX 設計師
  - 內容生成者
  - React 架構師
- 選用的 Nano Banana 圖像生成能力
- 重要操作前會詢問你的安全入門流程
- 可以在瀏覽器中打開的本機網站預覽

這份教學不使用 Docker，也不跳過權限確認。Docker 完全自動化流程請看 `DockerAutomation_tutorial_TC.md`。

---

## 隱私與安全注意事項

這個流程是「本機優先」，但不是「完全不使用雲端」。

主要 AI 模型可以透過 Ollama 在本機執行。也就是說，你的程式開發提示與產生的程式碼，可以在自己的電腦上處理。

不過，以下工具仍會連網：

- Gemini 圖像生成會把圖片提示送到 Google。
- npm、uv、GitHub 下載會連到套件伺服器。
- 除非停用，Claude Code 可能會發出非必要網路請求。
- Web 搜尋或 WebFetch 工具會連到外部網站。

白話來說：程式模型可以留在本機，但選用的網路工具仍然是網路工具。

---

## 目錄

1. [基本設定：本機 Agent Team](#1-基本設定本機-agent-team)
   - [1.1 這個工作流程代表什麼](#11-這個工作流程代表什麼)
   - [1.2 重要概念](#12-重要概念)
   - [1.3 硬體需求](#13-硬體需求)
   - [1.4 安裝必要軟體](#14-安裝必要軟體)
   - [1.5 建立 React 專案](#15-建立-react-專案)
   - [1.6 安裝本機 AI 模型](#16-安裝本機-ai-模型)
   - [1.7 建立較大 context 的模型](#17-建立較大-context-的模型)
   - [1.8 將 Claude Code 設定為使用 Ollama](#18-將-claude-code-設定為使用-ollama)
   - [1.9 啟用 Agent Teams 與專案設定](#19-啟用-agent-teams-與專案設定)
   - [1.10 安裝 Agent Skills](#110-安裝-agent-skills)
   - [1.11 加入 Nano Banana 圖像工具](#111-加入-nano-banana-圖像工具)
   - [1.12 建立 Agent Team](#112-建立-agent-team)
   - [1.13 執行 Agent Team](#113-執行-agent-team)
   - [1.14 預覽並清理](#114-預覽並清理)
   - [1.15 重複使用這個模式](#115-重複使用這個模式)
2. [疑難排解](#2-疑難排解)
3. [快速參考](#3-快速參考)
4. [附錄：白話術語](#4-附錄白話術語)
5. [已查核來源](#5-已查核來源)

---

# 1. 基本設定：本機 Agent Team

本章會建立影片中的安全入門流程。

不使用 Docker。不使用 tmux。不跳過權限確認。

你只需要一個一般終端機視窗。Claude Code 在進行重要檔案修改或執行指令前，會先詢問你。

## 1.1 這個工作流程代表什麼

在這份教學中，我們會讓：

- Claude Code 直接在你的電腦上執行。
- Claude Code 使用 Ollama 的本機模型，而不是 Anthropic 雲端模型。
- Agent Teams 在一般 Claude Code 介面中執行。
- Claude Code 要求確認敏感操作時，由你批准。
- 三個專門代理人一起建立 React 咖啡店網站。
- 如果你提供 Gemini API 金鑰，Nano Banana 可以協助生成圖片。

建議啟動指令：

```bash
claude --model qwen3.5-9b-64k:latest --permission-mode default --teammate-mode in-process
```

這個指令的作用：

- `claude` 啟動 Claude Code。
- `--model qwen3.5-9b-64k:latest` 指定本機 Ollama 模型。
- `--permission-mode default` 讓 Claude Code 在需要核准的編輯與指令前先詢問。
- `--teammate-mode in-process` 讓隊友代理人留在同一個 Claude Code 畫面。

為什麼需要：

- 這是最適合初學者的安全模式。先理解代理人如何工作，再進入完全自動化。

---

## 1.2 重要概念

| 名詞 | 白話意思 |
|:--|:--|
| Claude Code | Anthropic 的命令列程式開發助理，可以讀取、編輯並執行專案檔案。 |
| Agent Teams | Claude Code 的實驗性功能，讓一個主代理人協調多個隊友代理人。 |
| 主代理人 | 主要 Claude Code 工作階段，像專案經理一樣分派工作。 |
| 隊友代理人 | 有明確專長的代理人，例如設計、內容或 React 程式。 |
| Ollama | 本機 AI 模型執行器，讓模型在你的電腦上跑。 |
| qwen3.5 | 本機模型系列。本教學使用 9B 版本，較適合 32 GB Mac。 |
| Gemma4 | Google 的本機模型系列，可作為 qwen3.5 的替代選項。 |
| React | 用來建立網站與應用程式的 JavaScript 函式庫。 |
| Vite | 快速建立與執行 React 專案的工具。 |
| Context window | AI 一次能保留在記憶中的文字與程式碼量。越大越有利於程式專案，但也更吃記憶體。 |
| MCP | Model Context Protocol，可把圖像生成等額外工具接到 Claude Code。 |
| Nano Banana | 使用 Gemini 的圖像生成 MCP 伺服器。 |
| API 金鑰 | 軟體呼叫線上服務時使用的私密鑰匙，請像密碼一樣保護。 |

---

## 1.3 硬體需求

| 項目 | 最低需求 | 建議 |
|:--|:--|:--|
| 記憶體 | 16 GB | 32 GB 以上 |
| 儲存空間 | 25 GB 可用空間 | 50 GB 可用空間 |
| 處理器 | Apple Silicon、Intel Mac 或 Linux PC | 32 GB 以上的 Apple Silicon Mac |
| 網路 | 安裝與選用圖像生成時需要 | 穩定連線 |

為什麼建議 32 GB：

- 本機模型本身會使用不少記憶體。
- 較大的 context 會額外消耗記憶體。
- Agent Teams 可能建立多個工作階段。
- 瀏覽器、編輯器和作業系統也都需要記憶體。

如果只有 16 GB 記憶體：

- 使用較小模型。
- 把 context size 從 65536 降到 32768。
- 減少代理人數量。
- 預期回應會比較慢。

---

## 1.4 安裝必要軟體

範例以 macOS 為主。Windows 使用者建議使用 WSL，也就是 Windows Subsystem for Linux。

### 1.4.1 安裝 Homebrew

Homebrew 是 Mac 的套件管理工具，可以把它想成命令列工具的 app store。

```bash
brew --version
```

如果沒有 Homebrew，請安裝：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 1.4.2 安裝 Node.js 與 npm

Node.js 讓 JavaScript 可以在瀏覽器外執行。npm 是 Node.js 內建的套件工具。

```bash
brew install node
node --version
npm --version
```

React、Vite 與 Firebase 工具都需要 Node.js。建議 Node 20 或更新版本。

### 1.4.3 安裝 Git

Git 會保存專案變更歷史，可以理解成程式碼的存檔點。

```bash
git --version
```

若尚未安裝：

```bash
brew install git
```

在 AI 編輯檔案前建立安全檢查點，會讓整個流程安心很多。

### 1.4.4 安裝 Ollama

Ollama 負責執行本機 AI 模型。

1. 開啟 [https://ollama.com](https://ollama.com)
2. 下載適合你電腦的 Ollama。
3. 安裝它。
4. 啟動 Ollama app。

確認：

```bash
ollama --version
```

### 1.4.5 安裝 Claude Code

Claude Code 是協調代理人團隊的程式開發助理。

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

確認：

```bash
claude --version
```

Agent Teams 需要 Claude Code `2.1.32` 或更新版本。

### 1.4.6 安裝 uv

uv 是 Python 工具執行器。Nano Banana 圖像工具會透過 uv 內含的 `uvx` 執行。

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv --version
```

---

## 1.5 建立 React 專案

建立專案資料夾：

```bash
mkdir -p ~/Desktop/REACTWebBuilder
cd ~/Desktop/REACTWebBuilder
```

建立 React app：

```bash
npm create vite@latest . -- --template react
```

安裝套件：

```bash
npm install
```

建立第一個 Git 檢查點：

```bash
git init
git add .
git commit -m "Initial Vite React scaffold"
```

加入安全用 `.gitignore`：

```bash
cat >> .gitignore <<'EOF'

# Local secrets and Claude Code working files
.env
.env.local
.mcp.json
.claude/worktrees/
EOF
```

測試起始專案：

```bash
npm run build
```

如果建置成功，這個 React 專案就可以交給 AI 代理人團隊了。

---

## 1.6 安裝本機 AI 模型

本教學建議在 32 GB Mac 上使用 `qwen3.5:9b`。

```bash
ollama pull qwen3.5:9b
```

確認：

```bash
ollama list
```

你應該會看到 `qwen3.5:9b`。

如果想使用 Gemma4：

```bash
ollama pull gemma4:e4b
```

---

## 1.7 建立較大 context 的模型

程式開發需要模型同時閱讀指示、程式檔案與對話紀錄。這個可同時處理的範圍就是 context。

建立 Qwen Modelfile：

```bash
cat > Modelfile <<'EOF'
FROM qwen3.5:9b
PARAMETER num_ctx 65536
PARAMETER num_predict -1
EOF
```

建立自訂模型：

```bash
ollama create qwen3.5-9b-64k -f Modelfile
```

測試：

```bash
ollama run qwen3.5-9b-64k:latest "Reply with one short sentence."
```

Gemma4 版本：

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

## 1.8 將 Claude Code 設定為使用 Ollama

Claude Code 通常會連到 Anthropic 雲端模型。這裡要把它改成連到本機 Ollama。

```bash
export ANTHROPIC_AUTH_TOKEN=ollama
export ANTHROPIC_API_KEY=""
export ANTHROPIC_BASE_URL=http://localhost:11434
export ANTHROPIC_DEFAULT_HAIKU_MODEL=qwen3.5-9b-64k:latest
export ANTHROPIC_DEFAULT_SONNET_MODEL=qwen3.5-9b-64k:latest
export ANTHROPIC_DEFAULT_OPUS_MODEL=qwen3.5-9b-64k:latest
export CLAUDE_CODE_SUBAGENT_MODEL=qwen3.5-9b-64k:latest
```

這些設定告訴 Claude Code 與隊友代理人：「請使用這台電腦上的 Ollama，以及這個模型名稱。」

寫入 zsh 設定，避免每次開終端機都重打：

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

測試連線：

```bash
claude --model qwen3.5-9b-64k:latest --permission-mode default --teammate-mode in-process
```

在 Claude Code 裡輸入：

```text
Hi!
```

有回覆就代表連線成功。離開：

```text
/exit
```

---

## 1.9 啟用 Agent Teams 與專案設定

Agent Teams 是實驗性功能。先建立專案設定檔：

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

這份設定會啟用 Agent Teams、把 Claude Code 指向 Ollama，並阻擋常見秘密檔與危險指令。

建立專案指示檔：

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

保存設定：

```bash
git add .claude/settings.json CLAUDE.md .gitignore
git commit -m "Configure Claude Code local agent setup"
```

---

## 1.10 安裝 Agent Skills

Skills 是指示套件，會教 Claude Code 更好地處理特定工作。這裡手動安裝 Web 建置相關 skills。

```bash
mkdir -p .claude/skills
git clone https://github.com/anthropics/skills.git /tmp/anthropic-skills
cp -r /tmp/anthropic-skills/skills/frontend-design .claude/skills/
cp -r /tmp/anthropic-skills/skills/web-artifacts-builder .claude/skills/
cp -r /tmp/anthropic-skills/skills/theme-factory .claude/skills/
cp -r /tmp/anthropic-skills/skills/webapp-testing .claude/skills/
rm -rf /tmp/anthropic-skills
```

保存：

```bash
git add .claude/skills
git commit -m "Add Claude Code web skills"
```

---

## 1.11 加入 Nano Banana 圖像工具

不需要 AI 生成圖片時，可以跳過本節。

Nano Banana 是 MCP 伺服器，透過 Gemini API 生成圖片。

取得 Gemini API 金鑰：

1. 開啟 [https://aistudio.google.com](https://aistudio.google.com)
2. 點選「Get API key」。
3. 建立新的 API key。
4. 複製並安全保存。

請像保護密碼一樣保護 API 金鑰，不要提交到 GitHub。

設定金鑰：

```bash
export GEMINI_API_KEY="PASTE-YOUR-GEMINI-KEY-HERE"
```

加入 MCP 伺服器：

```bash
claude mcp add --scope local --env GEMINI_API_KEY="$GEMINI_API_KEY" nanobanana -- uvx nanobanana-mcp-server@latest
```

確認：

```bash
claude mcp list
```

看到 `nanobanana` 就代表可以使用。

---

## 1.12 建立 Agent Team

代理人定義檔放在 `.claude/agents/`。

```bash
mkdir -p .claude/agents
```

### 1.12.1 UI/UX 設計代理人

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

### 1.12.2 React 架構代理人

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

### 1.12.3 內容生成代理人

這個代理人在 Nano Banana 可用時，也會負責圖片生成。

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

確認並保存：

```bash
ls -la .claude/agents
git add .claude/agents
git commit -m "Add local website agent team"
```

---

## 1.13 執行 Agent Team

啟動 Claude Code：

```bash
claude --model qwen3.5-9b-64k:latest --permission-mode default --teammate-mode in-process
```

### 1.13.1 先測一個代理人

```text
Create an Agent Team with one teammate. Use the react-architect agent.
Ask the teammate to inspect this Vite React project and summarize the folder structure.
Do not edit files yet.
```

這會確認 Agent Teams 能否成功啟動隊友，而且不會先修改檔案。

### 1.13.2 啟動完整團隊

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

本機模型可能比雲端模型慢。Claude Code 要求批准時，請先讀清楚動作內容；看起來安全再批准。

---

## 1.14 預覽並清理

最後確認建置：

```bash
npm run build
```

本機預覽：

```bash
npm run dev
```

Vite 會顯示類似 `http://localhost:5173` 的網址。用瀏覽器打開即可檢查成果。

如果 Nano Banana 額度用完或失敗，代理人可能會建立圖片佔位內容。這在教學階段沒有問題。

離開前，請先要求清理團隊：

```text
Clean up the team. All tasks are complete.
```

退出 Claude Code：

```text
/exit
```

---

## 1.15 重複使用這個模式

咖啡店網站只是範例。這套方法也能用在：

- 文件撰寫
- 測試建立
- 重構
- 資料儀表板
- 安全性審查
- 無障礙審查
- 上線檢查清單

可重複使用的流程：

1. 建立專用專案資料夾。
2. 在 `CLAUDE.md` 寫專案簡報。
3. 建立 `.claude/settings.json`。
4. 先設計專門角色，再建立代理人檔案。
5. 在 `.claude/agents/` 為每個代理人建立 Markdown 檔。
6. 保存 Git 檢查點。
7. 先測試一個代理人。
8. 執行完整團隊。

好用的 Agent Team 不在於代理人多，而在於角色清楚、邊界清楚、完成標準清楚。

---

# 2. 疑難排解

## Claude Code 無法連到 Ollama

```bash
ollama list
```

失敗時啟動 Ollama app，或執行：

```bash
ollama serve
```

## 找不到模型

```bash
ollama list
```

請使用清單中完整模型名稱。本教學使用 `qwen3.5-9b-64k:latest`。

## Agent Teams 沒出現

```bash
rg "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS" .claude/settings.json
```

期望設定：

```text
"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
```

修正：

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

## 隊友使用錯誤模型

```bash
rg "CLAUDE_CODE_SUBAGENT_MODEL" .claude/settings.json
```

Qwen：

```bash
export CLAUDE_CODE_SUBAGENT_MODEL=qwen3.5-9b-64k:latest
```

Gemma4：

```bash
export CLAUDE_CODE_SUBAGENT_MODEL=gemma4-e4b-64k:latest
```

## Nano Banana 沒出現

```bash
claude mcp list
```

修正：

```bash
export GEMINI_API_KEY="PASTE-YOUR-GEMINI-KEY-HERE"
claude mcp add --scope local --env GEMINI_API_KEY="$GEMINI_API_KEY" nanobanana -- uvx nanobanana-mcp-server@latest
claude mcp list
```

## 本機模型太慢

```bash
cat > Modelfile <<'EOF'
FROM qwen3.5:9b
PARAMETER num_ctx 32768
PARAMETER num_predict -1
EOF

ollama create qwen3.5-9b-32k -f Modelfile
```

啟動：

```bash
claude --model qwen3.5-9b-32k:latest --permission-mode default --teammate-mode in-process
```

## 建置失敗

```bash
npm run build
```

然後請 Claude Code 修正：

```text
The build failed. Read the error message, fix the build, and run npm run build again.
```

---

# 3. 快速參考

## 基本本機啟動

```bash
cd ~/Desktop/REACTWebBuilder
claude --model qwen3.5-9b-64k:latest --permission-mode default --teammate-mode in-process
```

## 基本本機環境

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

## Ollama 指令

```bash
ollama list
ollama ps
ollama pull qwen3.5:9b
ollama create qwen3.5-9b-64k -f Modelfile
ollama run qwen3.5-9b-64k:latest
```

## React 指令

```bash
npm install
npm run dev
npm run build
```

## Nano Banana 指令

```bash
export GEMINI_API_KEY="PASTE-YOUR-GEMINI-KEY-HERE"
claude mcp add --scope local --env GEMINI_API_KEY="$GEMINI_API_KEY" nanobanana -- uvx nanobanana-mcp-server@latest
claude mcp list
```

## Agent 資料夾

```text
.claude/settings.json
.claude/agents/ui-ux-designer.md
.claude/agents/react-architect.md
.claude/agents/content-generator.md
.claude/skills/
CLAUDE.md
```

---

# 4. 附錄：白話術語

| 名詞 | 意思 |
|:--|:--|
| Agent | 有特定角色的 AI 工作者。 |
| Agent Team | 由主代理人協調的一組 Claude Code 代理人。 |
| API 金鑰 | 使用線上服務的私密金鑰，請像密碼一樣保護。 |
| CLI | Command-Line Interface，用輸入指令操作的程式。 |
| Context | AI 模型一次能參考的文字與程式碼量。 |
| 環境變數 | 程式啟動前由終端機提供的設定。 |
| Git 檢查點 | 可供之後回頭比較或恢復的專案狀態。 |
| LLM | Large Language Model，能讀寫文字或程式碼的 AI 模型。 |
| MCP | 讓 AI 代理人連接外部工具的方式。 |
| Nano Banana | 透過 Gemini 生成圖片的 MCP 伺服器。 |
| npm | 安裝 JavaScript 套件的工具。 |
| Ollama | 在自己電腦上執行 AI 模型的程式。 |
| Permission mode | 控制 Claude Code 何時必須先詢問的設定。 |
| React | 建立網站與應用程式的 JavaScript 函式庫。 |
| Token | AI 模型使用的小型文字單位。 |
| Vite | 快速建立與執行 Web 專案的工具。 |

---

# 5. 已查核來源

本教學依據以下文件製作：

- `NativeClaudeTeam_tutorial_EN.md`
- `NativeClaudeTeam_transcript_v3.md`
- `ClaudeAgentSetupTutorial_EN.md`

參考資訊：

- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [Claude Code model configuration](https://code.claude.com/docs/en/model-config)
- [Claude Code settings](https://code.claude.com/docs/en/settings)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Ollama Claude Code integration](https://docs.ollama.com/integrations/claude-code)
- [Ollama Modelfile reference](https://docs.ollama.com/modelfile)
- [Anthropic skills repository](https://github.com/anthropics/skills)
