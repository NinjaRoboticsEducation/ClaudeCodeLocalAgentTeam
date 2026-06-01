# Native Claude Team 教程

这份教程会带你用 Claude Code Agent Teams、通过 Ollama 运行的本地 AI 模型，以及一组分工明确的小型代理人团队，在自己的电脑上构建 React 网站。

内容面向非技术背景用户。所有命令尽量保持可以直接复制粘贴；重要设置会用通俗语言说明“它做什么”和“为什么需要它”。

本文档基于 `NativeClaudeTeam_tutorial_EN.md` 制作，并针对简体中文读者重新组织表达方式。

---

## 你将搭建什么

完成后，你会拥有：

- 使用 Vite 创建的 React 网站项目
- 通过 Ollama 在本地运行的 AI 模型
- 已配置为使用本地模型的 Claude Code
- 已启用的 Claude Code Agent Teams
- 三个专业代理人
  - UI/UX 设计师
  - 内容生成者
  - React 架构师
- 可选的 Nano Banana 图像生成能力
- 重要操作前会询问你的安全入门流程
- 可以在浏览器中打开的本地网站预览

这份教程不使用 Docker，也不跳过权限确认。Docker 完全自动化流程请看 `DockerAutomation_tutorial_CN.md`。

---

## 隐私和安全说明

这个流程是“本地优先”，但不是“完全不使用云端”。

主要 AI 模型可以通过 Ollama 在本地运行。也就是说，你的编程提示和生成的代码，可以在自己的电脑上处理。

不过，以下工具仍会联网：

- Gemini 图像生成会把图片提示发送到 Google。
- npm、uv、GitHub 下载会连接软件包服务器。
- 除非停用，Claude Code 可能会发出非必要网络请求。
- Web 搜索或 WebFetch 工具会访问外部网站。

白话说：编程模型可以留在本地，但可选的联网工具仍然会联网。

---

## 目录

1. [基础设置：本地 Agent Team](#1-基础设置本地-agent-team)
   - [1.1 这个工作流代表什么](#11-这个工作流代表什么)
   - [1.2 关键概念](#12-关键概念)
   - [1.3 硬件要求](#13-硬件要求)
   - [1.4 安装必要软件](#14-安装必要软件)
   - [1.5 创建 React 项目](#15-创建-react-项目)
   - [1.6 安装本地 AI 模型](#16-安装本地-ai-模型)
   - [1.7 创建更大 context 的模型](#17-创建更大-context-的模型)
   - [1.8 将 Claude Code 配置为使用 Ollama](#18-将-claude-code-配置为使用-ollama)
   - [1.9 启用 Agent Teams 与项目设置](#19-启用-agent-teams-与项目设置)
   - [1.10 安装 Agent Skills](#110-安装-agent-skills)
   - [1.11 添加 Nano Banana 图像工具](#111-添加-nano-banana-图像工具)
   - [1.12 创建 Agent Team](#112-创建-agent-team)
   - [1.13 运行 Agent Team](#113-运行-agent-team)
   - [1.14 预览并清理](#114-预览并清理)
   - [1.15 复用这个模式](#115-复用这个模式)
2. [故障排查](#2-故障排查)
3. [快速参考](#3-快速参考)
4. [附录：通俗术语](#4-附录通俗术语)
5. [已核对来源](#5-已核对来源)

---

# 1. 基础设置：本地 Agent Team

本章会搭建视频中的安全入门流程。

不使用 Docker。不使用 tmux。不跳过权限确认。

你只需要一个普通终端窗口。Claude Code 在进行重要文件修改或执行命令前，会先询问你。

## 1.1 这个工作流代表什么

在这份教程中，我们会让：

- Claude Code 直接在你的电脑上运行。
- Claude Code 使用 Ollama 的本地模型，而不是 Anthropic 云端模型。
- Agent Teams 在普通 Claude Code 界面中运行。
- Claude Code 请求确认敏感操作时，由你批准。
- 三个专业代理人一起构建 React 咖啡店网站。
- 如果你提供 Gemini API 密钥，Nano Banana 可以协助生成图片。

推荐启动命令：

```bash
claude --model qwen3.5-9b-64k:latest --permission-mode default --teammate-mode in-process
```

这个命令的作用：

- `claude` 启动 Claude Code。
- `--model qwen3.5-9b-64k:latest` 指定本地 Ollama 模型。
- `--permission-mode default` 让 Claude Code 在需要批准的编辑和命令前先询问。
- `--teammate-mode in-process` 让队友代理人留在同一个 Claude Code 界面。

为什么需要：

- 这是最适合初学者的安全模式。先理解代理人如何工作，再进入完全自动化。

---

## 1.2 关键概念

| 术语 | 通俗解释 |
|:--|:--|
| Claude Code | Anthropic 的命令行编程助手，可以读取、编辑并运行项目文件。 |
| Agent Teams | Claude Code 的实验性功能，让一个主代理人协调多个队友代理人。 |
| 主代理人 | 主要 Claude Code 会话，像项目经理一样分配工作。 |
| 队友代理人 | 有明确专长的代理人，例如设计、内容或 React 代码。 |
| Ollama | 本地 AI 模型运行器，让模型在你的电脑上运行。 |
| qwen3.5 | 本地模型系列。本教程使用 9B 版本，较适合 32 GB Mac。 |
| Gemma4 | Google 的本地模型系列，可作为 qwen3.5 的替代选择。 |
| React | 用来构建网站和应用的 JavaScript 库。 |
| Vite | 快速创建和运行 React 项目的工具。 |
| Context window | AI 一次能保留在记忆中的文字和代码量。越大越适合编程项目，但也更占内存。 |
| MCP | Model Context Protocol，可把图像生成等额外工具接到 Claude Code。 |
| Nano Banana | 使用 Gemini 的图像生成 MCP 服务器。 |
| API 密钥 | 软件调用在线服务时使用的私密钥匙，请像密码一样保护。 |

---

## 1.3 硬件要求

| 项目 | 最低要求 | 推荐 |
|:--|:--|:--|
| 内存 | 16 GB | 32 GB 或更多 |
| 存储空间 | 25 GB 可用空间 | 50 GB 可用空间 |
| 处理器 | Apple Silicon、Intel Mac 或 Linux PC | 32 GB 以上的 Apple Silicon Mac |
| 网络 | 安装和可选图像生成时需要 | 稳定连接 |

为什么推荐 32 GB：

- 本地模型本身会使用不少内存。
- 更大的 context 会额外占用内存。
- Agent Teams 可能创建多个会话。
- 浏览器、编辑器和操作系统也需要内存。

如果只有 16 GB 内存：

- 使用较小模型。
- 把 context size 从 65536 降到 32768。
- 减少代理人数量。
- 预期响应会更慢。

---

## 1.4 安装必要软件

示例以 macOS 为主。Windows 用户建议使用 WSL，也就是 Windows Subsystem for Linux。

### 1.4.1 安装 Homebrew

Homebrew 是 Mac 的软件包管理工具，可以把它想成命令行工具的 app store。

```bash
brew --version
```

如果没有 Homebrew，请安装：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 1.4.2 安装 Node.js 和 npm

Node.js 让 JavaScript 可以在浏览器外运行。npm 是 Node.js 自带的软件包工具。

```bash
brew install node
node --version
npm --version
```

React、Vite 和 Firebase 工具都需要 Node.js。建议 Node 20 或更新版本。

### 1.4.3 安装 Git

Git 会保存项目变更历史，可以理解成代码的存档点。

```bash
git --version
```

若尚未安装：

```bash
brew install git
```

在 AI 编辑文件前建立安全检查点，会让整个流程安心很多。

### 1.4.4 安装 Ollama

Ollama 负责运行本地 AI 模型。

1. 打开 [https://ollama.com](https://ollama.com)
2. 下载适合你电脑的 Ollama。
3. 安装它。
4. 启动 Ollama app。

确认：

```bash
ollama --version
```

### 1.4.5 安装 Claude Code

Claude Code 是协调代理人团队的编程助手。

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

确认：

```bash
claude --version
```

Agent Teams 需要 Claude Code `2.1.32` 或更新版本。

### 1.4.6 安装 uv

uv 是 Python 工具运行器。Nano Banana 图像工具会通过 uv 自带的 `uvx` 运行。

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv --version
```

---

## 1.5 创建 React 项目

创建项目文件夹：

```bash
mkdir -p ~/Desktop/REACTWebBuilder
cd ~/Desktop/REACTWebBuilder
```

创建 React app：

```bash
npm create vite@latest . -- --template react
```

安装依赖：

```bash
npm install
```

创建第一个 Git 检查点：

```bash
git init
git add .
git commit -m "Initial Vite React scaffold"
```

添加安全用 `.gitignore`：

```bash
cat >> .gitignore <<'EOF'

# Local secrets and Claude Code working files
.env
.env.local
.mcp.json
.claude/worktrees/
EOF
```

测试初始项目：

```bash
npm run build
```

如果构建成功，这个 React 项目就可以交给 AI 代理人团队了。

---

## 1.6 安装本地 AI 模型

本教程建议在 32 GB Mac 上使用 `qwen3.5:9b`。

```bash
ollama pull qwen3.5:9b
```

确认：

```bash
ollama list
```

你应该能看到 `qwen3.5:9b`。

如果想使用 Gemma4：

```bash
ollama pull gemma4:e4b
```

---

## 1.7 创建更大 context 的模型

编程任务需要模型同时阅读指令、代码文件和对话记录。这个可同时处理的范围就是 context。

创建 Qwen Modelfile：

```bash
cat > Modelfile <<'EOF'
FROM qwen3.5:9b
PARAMETER num_ctx 65536
PARAMETER num_predict -1
EOF
```

创建自定义模型：

```bash
ollama create qwen3.5-9b-64k -f Modelfile
```

测试：

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

## 1.8 将 Claude Code 配置为使用 Ollama

Claude Code 通常会连接 Anthropic 云端模型。这里要把它改成连接本地 Ollama。

```bash
export ANTHROPIC_AUTH_TOKEN=ollama
export ANTHROPIC_API_KEY=""
export ANTHROPIC_BASE_URL=http://localhost:11434
export ANTHROPIC_DEFAULT_HAIKU_MODEL=qwen3.5-9b-64k:latest
export ANTHROPIC_DEFAULT_SONNET_MODEL=qwen3.5-9b-64k:latest
export ANTHROPIC_DEFAULT_OPUS_MODEL=qwen3.5-9b-64k:latest
export CLAUDE_CODE_SUBAGENT_MODEL=qwen3.5-9b-64k:latest
```

这些设置告诉 Claude Code 和队友代理人：“请使用这台电脑上的 Ollama，以及这个模型名称。”

写入 zsh 设置，避免每次打开终端都重打：

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

测试连接：

```bash
claude --model qwen3.5-9b-64k:latest --permission-mode default --teammate-mode in-process
```

在 Claude Code 中输入：

```text
Hi!
```

有回复就代表连接成功。退出：

```text
/exit
```

---

## 1.9 启用 Agent Teams 与项目设置

Agent Teams 是实验性功能。先创建项目设置文件：

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

这份设置会启用 Agent Teams、把 Claude Code 指向 Ollama，并阻止常见秘密文件和危险命令。

创建项目说明文件：

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

保存设置：

```bash
git add .claude/settings.json CLAUDE.md .gitignore
git commit -m "Configure Claude Code local agent setup"
```

---

## 1.10 安装 Agent Skills

Skills 是指令包，会教 Claude Code 更好地处理特定工作。这里手动安装 Web 构建相关 skills。

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

## 1.11 添加 Nano Banana 图像工具

不需要 AI 生成图片时，可以跳过本节。

Nano Banana 是 MCP 服务器，通过 Gemini API 生成图片。

获取 Gemini API 密钥：

1. 打开 [https://aistudio.google.com](https://aistudio.google.com)
2. 点击 “Get API key”。
3. 创建新的 API key。
4. 复制并安全保存。

请像保护密码一样保护 API 密钥，不要提交到 GitHub。

设置密钥：

```bash
export GEMINI_API_KEY="PASTE-YOUR-GEMINI-KEY-HERE"
```

添加 MCP 服务器：

```bash
claude mcp add --scope local --env GEMINI_API_KEY="$GEMINI_API_KEY" nanobanana -- uvx nanobanana-mcp-server@latest
```

确认：

```bash
claude mcp list
```

看到 `nanobanana` 就代表可以使用。

---

## 1.12 创建 Agent Team

代理人定义文件放在 `.claude/agents/`。

```bash
mkdir -p .claude/agents
```

### 1.12.1 UI/UX 设计代理人

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

### 1.12.2 React 架构代理人

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

### 1.12.3 内容生成代理人

这个代理人在 Nano Banana 可用时，也会负责图片生成。

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

确认并保存：

```bash
ls -la .claude/agents
git add .claude/agents
git commit -m "Add local website agent team"
```

---

## 1.13 运行 Agent Team

启动 Claude Code：

```bash
claude --model qwen3.5-9b-64k:latest --permission-mode default --teammate-mode in-process
```

### 1.13.1 先测试一个代理人

```text
Create an Agent Team with one teammate. Use the react-architect agent.
Ask the teammate to inspect this Vite React project and summarize the folder structure.
Do not edit files yet.
```

这会确认 Agent Teams 能否成功启动队友，而且不会先修改文件。

### 1.13.2 启动完整团队

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

本地模型可能比云端模型慢。Claude Code 请求批准时，请先读清楚操作内容；看起来安全再批准。

---

## 1.14 预览并清理

最后确认构建：

```bash
npm run build
```

本地预览：

```bash
npm run dev
```

Vite 会显示类似 `http://localhost:5173` 的网址。用浏览器打开即可检查成果。

如果 Nano Banana 额度用完或失败，代理人可能会创建图片占位内容。这在教程阶段没有问题。

退出前，先要求清理团队：

```text
Clean up the team. All tasks are complete.
```

退出 Claude Code：

```text
/exit
```

---

## 1.15 复用这个模式

咖啡店网站只是示例。这套方法也能用于：

- 文档撰写
- 测试创建
- 重构
- 数据仪表盘
- 安全性审查
- 可访问性审查
- 上线检查清单

可复用流程：

1. 创建专用项目文件夹。
2. 在 `CLAUDE.md` 写项目说明。
3. 创建 `.claude/settings.json`。
4. 先设计专业角色，再创建代理人文件。
5. 在 `.claude/agents/` 为每个代理人创建 Markdown 文件。
6. 保存 Git 检查点。
7. 先测试一个代理人。
8. 运行完整团队。

好用的 Agent Team 不在于代理人多，而在于角色清楚、边界清楚、完成标准清楚。

---

# 2. 故障排查

## Claude Code 无法连接 Ollama

```bash
ollama list
```

失败时启动 Ollama app，或运行：

```bash
ollama serve
```

## 找不到模型

```bash
ollama list
```

请使用列表中的完整模型名称。本教程使用 `qwen3.5-9b-64k:latest`。

## Agent Teams 没有出现

```bash
rg "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS" .claude/settings.json
```

期望设置：

```text
"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
```

修复：

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

## 队友使用错误模型

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

## Nano Banana 没有出现

```bash
claude mcp list
```

修复：

```bash
export GEMINI_API_KEY="PASTE-YOUR-GEMINI-KEY-HERE"
claude mcp add --scope local --env GEMINI_API_KEY="$GEMINI_API_KEY" nanobanana -- uvx nanobanana-mcp-server@latest
claude mcp list
```

## 本地模型太慢

```bash
cat > Modelfile <<'EOF'
FROM qwen3.5:9b
PARAMETER num_ctx 32768
PARAMETER num_predict -1
EOF

ollama create qwen3.5-9b-32k -f Modelfile
```

启动：

```bash
claude --model qwen3.5-9b-32k:latest --permission-mode default --teammate-mode in-process
```

## 构建失败

```bash
npm run build
```

然后请 Claude Code 修复：

```text
The build failed. Read the error message, fix the build, and run npm run build again.
```

---

# 3. 快速参考

## 基础本地启动

```bash
cd ~/Desktop/REACTWebBuilder
claude --model qwen3.5-9b-64k:latest --permission-mode default --teammate-mode in-process
```

## 基础本地环境变量

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

## Ollama 命令

```bash
ollama list
ollama ps
ollama pull qwen3.5:9b
ollama create qwen3.5-9b-64k -f Modelfile
ollama run qwen3.5-9b-64k:latest
```

## React 命令

```bash
npm install
npm run dev
npm run build
```

## Nano Banana 命令

```bash
export GEMINI_API_KEY="PASTE-YOUR-GEMINI-KEY-HERE"
claude mcp add --scope local --env GEMINI_API_KEY="$GEMINI_API_KEY" nanobanana -- uvx nanobanana-mcp-server@latest
claude mcp list
```

## Agent 文件夹

```text
.claude/settings.json
.claude/agents/ui-ux-designer.md
.claude/agents/react-architect.md
.claude/agents/content-generator.md
.claude/skills/
CLAUDE.md
```

---

# 4. 附录：通俗术语

| 术语 | 含义 |
|:--|:--|
| Agent | 有特定角色的 AI 工作者。 |
| Agent Team | 由主代理人协调的一组 Claude Code 代理人。 |
| API 密钥 | 使用在线服务的私密密钥，请像密码一样保护。 |
| CLI | Command-Line Interface，用输入命令操作的程序。 |
| Context | AI 模型一次能参考的文字和代码量。 |
| 环境变量 | 程序启动前由终端提供的设置。 |
| Git 检查点 | 可供之后回头比较或恢复的项目状态。 |
| LLM | Large Language Model，能读写文字或代码的 AI 模型。 |
| MCP | 让 AI 代理人连接外部工具的方式。 |
| Nano Banana | 通过 Gemini 生成图片的 MCP 服务器。 |
| npm | 安装 JavaScript 包的工具。 |
| Ollama | 在自己电脑上运行 AI 模型的程序。 |
| Permission mode | 控制 Claude Code 何时必须先询问的设置。 |
| React | 构建网站和应用的 JavaScript 库。 |
| Token | AI 模型使用的小型文字单位。 |
| Vite | 快速创建和运行 Web 项目的工具。 |

---

# 5. 已核对来源

本教程依据以下文件制作：

- `NativeClaudeTeam_tutorial_EN.md`
- `NativeClaudeTeam_transcript_v3.md`
- `ClaudeAgentSetupTutorial_EN.md`

参考信息：

- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [Claude Code model configuration](https://code.claude.com/docs/en/model-config)
- [Claude Code settings](https://code.claude.com/docs/en/settings)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Ollama Claude Code integration](https://docs.ollama.com/integrations/claude-code)
- [Ollama Modelfile reference](https://docs.ollama.com/modelfile)
- [Anthropic skills repository](https://github.com/anthropics/skills)
