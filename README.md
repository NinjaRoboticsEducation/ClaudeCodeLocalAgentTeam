# Native Claude Team Tutorial

How to build a React website with Claude Code Agent Teams, a local AI model through Ollama, and a small team of specialist agents running on your own computer.

---

## What You Will Build

By the end of this tutorial, you will have:

- A React website project created with Vite
- A local AI model running through Ollama
- Claude Code configured to use that local model
- Claude Code Agent Teams enabled
- Three specialist agents:
  - UI/UX Designer
  - Content Generator
  - React Architect
- Optional Nano Banana image generation through Gemini
- A safe beginner workflow where Claude Code asks before important actions
- A local website preview in your browser

---

## Important Privacy and Safety Note

This workflow is local-first, not cloud-free.

The main AI model runs locally through Ollama. That means your coding prompts and generated code can be processed on your own computer.

However, some tools still use the internet:

- Gemini image generation sends image prompts to Google.
- npm, uv, and GitHub downloads contact package servers.
- Claude Code may make non-essential network requests unless disabled.
- Any web search or web-fetching tool contacts external websites.

Plain English version: the coding model can stay local, but optional internet tools are still internet tools.

---

## Table of Contents

- [Native Claude Team Tutorial](#native-claude-team-tutorial)
  - [What You Will Build](#what-you-will-build)
  - [Important Privacy and Safety Note](#important-privacy-and-safety-note)
  - [Table of Contents](#table-of-contents)
- [1. Basic Setup: Local Agent Team](#1-basic-setup-local-agent-team)
  - [1.1 What This Workflow Means](#11-what-this-workflow-means)
  - [1.2 Key Concepts](#12-key-concepts)
  - [1.3 Hardware Requirements](#13-hardware-requirements)
  - [1.4 Install Required Software](#14-install-required-software)
    - [1.4.1 Install Homebrew on Mac](#141-install-homebrew-on-mac)
    - [1.4.2 Install Node.js and npm](#142-install-nodejs-and-npm)
    - [1.4.3 Install Git](#143-install-git)
    - [1.4.4 Install Ollama](#144-install-ollama)
    - [1.4.5 Install Claude Code](#145-install-claude-code)
    - [1.4.6 Install uv](#146-install-uv)
  - [1.5 Create the React Project](#15-create-the-react-project)
  - [1.6 Install a Local AI Model](#16-install-a-local-ai-model)
  - [1.7 Create a Larger Context Model](#17-create-a-larger-context-model)
  - [1.8 Configure Claude Code for Ollama](#18-configure-claude-code-for-ollama)
  - [1.9 Enable Agent Teams and Project Settings](#19-enable-agent-teams-and-project-settings)
  - [1.10 Install Agent Skills](#110-install-agent-skills)
  - [1.11 Add the Nano Banana Image Tool](#111-add-the-nano-banana-image-tool)
  - [1.12 Create the Agent Team](#112-create-the-agent-team)
    - [1.12.1 UI/UX Designer Agent](#1121-uiux-designer-agent)
    - [1.12.2 React Architect Agent](#1122-react-architect-agent)
    - [1.12.3 Content Generator Agent](#1123-content-generator-agent)
  - [1.13 Run the Agent Team](#113-run-the-agent-team)
    - [1.13.1 Test with One Agent First](#1131-test-with-one-agent-first)
    - [1.13.2 Launch the Full Team](#1132-launch-the-full-team)
  - [1.14 Preview and Clean Up](#114-preview-and-clean-up)
  - [1.15 Reuse the Pattern](#115-reuse-the-pattern)
- [2. Troubleshooting](#2-troubleshooting)
  - [Claude Code cannot connect to Ollama](#claude-code-cannot-connect-to-ollama)
  - [Model not found](#model-not-found)
  - [Agent Teams do not appear](#agent-teams-do-not-appear)
  - [Teammates use the wrong model](#teammates-use-the-wrong-model)
  - [Nano Banana does not appear](#nano-banana-does-not-appear)
  - [The local model is too slow](#the-local-model-is-too-slow)
  - [Build fails](#build-fails)
- [3. Quick Reference](#3-quick-reference)
  - [Basic local launch](#basic-local-launch)
  - [Basic local environment](#basic-local-environment)
  - [Ollama commands](#ollama-commands)
  - [React commands](#react-commands)
  - [Nano Banana commands](#nano-banana-commands)
  - [Agent folders](#agent-folders)
- [4. Appendix: Plain-English Terms](#4-appendix-plain-english-terms)
- [5. Sources Checked](#5-sources-checked)

---

# 1. Basic Setup: Local Agent Team

This section creates the safe beginner setup from the video.

## 1.1 What This Workflow Means

In this tutorial:

- Claude Code runs directly on your computer.
- Claude Code uses a local Ollama model instead of Anthropic cloud models.
- Agent Teams run inside the normal Claude Code interface.
- You approve sensitive actions when Claude Code asks.
- Three specialist agents work together to build a React coffee shop website.
- Nano Banana can generate images if you provide a Gemini API key.

Recommended launch command:

```bash
claude --model qwen3.5-9b-64k:latest --permission-mode default --teammate-mode in-process
```

What this command does:

- `claude` starts Claude Code.
- `--model qwen3.5-9b-64k:latest` tells Claude Code which local Ollama model to use.
- `--permission-mode default` makes Claude Code ask before edits and commands that need approval.
- `--teammate-mode in-process` keeps teammate agents inside one Claude Code terminal view.

Why it is needed:

- This is the safest beginner mode. It lets you learn how agents behave before using full automation.

---

## 1.2 Key Concepts

| Term | Plain-English meaning |
|:--|:--|
| Claude Code | A command-line coding assistant from Anthropic. It can read, edit, and run files in your project. |
| Agent Teams | An experimental Claude Code feature where one lead agent coordinates multiple teammate agents. |
| Lead agent | The main Claude Code session. It acts like the project manager. |
| Teammate agent | A specialist agent with a clear role, such as design, content, or React code. |
| Ollama | A local AI model runner. It lets your computer run models without sending every prompt to a cloud model. |
| qwen3.5 | A local model family. This tutorial uses the 9B version because it is light enough for a 32 GB Mac. |
| Gemma4 | A local model family from Google. You can use it as an alternative if you prefer it. |
| React | A JavaScript library for building websites and apps. |
| Vite | A fast tool for creating and running React projects. |
| Context window | The amount of text and code an AI model can keep in mind at once. Bigger context helps coding, but uses more memory. |
| MCP | Model Context Protocol. A way to connect Claude Code to extra tools, such as image generation. |
| Nano Banana | An MCP image-generation server that uses Gemini. |
| API key | A private password-like value that lets software call an online service. |

---

## 1.3 Hardware Requirements

Recommended for this tutorial:

| Component | Minimum | Recommended |
|:--|:--|:--|
| Memory | 16 GB | 32 GB or more |
| Storage | 25 GB free | 50 GB free |
| Processor | Apple Silicon, Intel Mac, or Linux PC | Apple Silicon Mac with 32 GB or more |
| Internet | Needed for installs and optional image generation | Stable connection |

Why 32 GB is recommended:

- The local model itself can use a large amount of memory.
- A larger context window uses extra memory.
- Agent Teams may create multiple sessions.
- Your browser, editor, and operating system also need memory.

If your computer has 16 GB of memory:

- Use a smaller model.
- Use a smaller context size such as 32768 instead of 65536.
- Use fewer agents.
- Expect slower responses.

---

## 1.4 Install Required Software

The examples are written for macOS. Windows users should use WSL, which means Windows Subsystem for Linux. WSL lets Windows run Linux command-line tools.

### 1.4.1 Install Homebrew on Mac

Homebrew is a Mac package manager. A package manager is like an app store for command-line tools.

Check whether Homebrew is installed:

```bash
brew --version
```

What this command does:

- It asks your computer whether Homebrew is installed.

Why it is needed:

- We use Homebrew to install Node.js and Git if they are missing.

If the command says `brew` is not found, install Homebrew:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

What this command does:

- It downloads and runs the official Homebrew installer.

Why it is needed:

- Homebrew makes the rest of the setup much easier on macOS.

### 1.4.2 Install Node.js and npm

Node.js runs JavaScript outside the browser. npm is the package installer that comes with Node.js.

Install Node.js:

```bash
brew install node
```

Check the versions:

```bash
node --version
npm --version
```

What these commands do:

- `brew install node` installs Node.js and npm.
- `node --version` shows the installed Node.js version.
- `npm --version` shows the installed npm version.

Why they are needed:

- React projects and Vite use Node.js.
- Node 20 or newer is recommended for this workflow.

### 1.4.3 Install Git

Git saves project history. Think of it as a save-game system for code.

Check whether Git is installed:

```bash
git --version
```

If Git is missing, install it:

```bash
brew install git
```

What these commands do:

- `git --version` shows the installed Git version.
- `brew install git` installs Git through Homebrew.

Why they are needed:

- Git lets you save a safe checkpoint before AI agents edit files.

### 1.4.4 Install Ollama

Ollama runs the local AI model.

1. Open [https://ollama.com](https://ollama.com)
2. Download Ollama for your computer.
3. Install it.
4. Start the Ollama app.

Check that Ollama works:

```bash
ollama --version
```

What this command does:

- It prints the installed Ollama version.

Why it is needed:

- Claude Code will send local model requests to Ollama.

### 1.4.5 Install Claude Code

Claude Code is the coding assistant that coordinates the agents.

Official recommended installer:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Check Claude Code:

```bash
claude --version
```

What these commands do:

- The installer installs the `claude` command.
- `claude --version` shows your installed Claude Code version.

Why they are needed:

- Agent Teams require Claude Code version `2.1.32` or later.

### 1.4.6 Install uv

uv is a Python tool runner. It is useful because the Nano Banana image tool runs through a Python package.

Install uv:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Check uv:

```bash
uv --version
```

What these commands do:

- They install uv and confirm it works.

Why they are needed:

- The optional image-generation MCP server is easiest to run with `uvx`, which comes with uv.

---

## 1.5 Create the React Project

Create a clean project folder:

```bash
mkdir -p ~/Desktop/REACTWebBuilder
cd ~/Desktop/REACTWebBuilder
```

What these commands do:

- `mkdir -p ~/Desktop/REACTWebBuilder` creates a project folder on your Desktop.
- `cd ~/Desktop/REACTWebBuilder` moves your terminal into that folder.

Why they are needed:

- All later project files should live in one clear folder.

Create the React app:

```bash
npm create vite@latest . -- --template react
```

What this command does:

- It creates a new React project in the current folder.
- The `.` means "use this folder."
- `--template react` means "make a React app."

Why it is needed:

- This gives the agents a working website project to edit.

Install the project packages:

```bash
npm install
```

What this command does:

- It downloads the packages listed in `package.json`.

Why it is needed:

- The React app cannot run or build until its packages are installed.

Save the first Git checkpoint:

```bash
git init
git add .
git commit -m "Initial Vite React scaffold"
```

What these commands do:

- `git init` starts Git history for this folder.
- `git add .` stages all current files.
- `git commit -m "Initial Vite React scaffold"` saves the first checkpoint.

Why they are needed:

- If an agent makes a mistake later, Git gives you a known-good starting point.

Add a safety `.gitignore`:

```bash
cat >> .gitignore <<'EOF'

# Local secrets and Claude Code working files
.env
.env.local
.mcp.json
.claude/worktrees/
EOF
```

What this command does:

- It adds common secret and temporary files to `.gitignore`.
- `.gitignore` tells Git which files not to upload or save in commits.

Why it is needed:

- API keys and temporary agent work folders should not be committed to GitHub.

Test the app:

```bash
npm run build
```

What this command does:

- It builds the React app into a production-ready `dist` folder.

Why it is needed:

- It proves the starter app works before agents modify it.

---

## 1.6 Install a Local AI Model

This tutorial recommends `qwen3.5:9b` first for local multi-agent work on a 32 GB Mac.

Install qwen3.5:9b:

```bash
ollama pull qwen3.5:9b
```

What this command does:

- It downloads the qwen3.5 9B model into Ollama.

Why it is needed:

- This is the local model Claude Code will use for coding tasks.

Check that the model downloaded:

```bash
ollama list
```

What this command does:

- It lists models available in Ollama.

Why it is needed:

- You should see `qwen3.5:9b` before continuing.

Alternative Gemma4 model:

```bash
ollama pull gemma4:e4b
```

Why you might use it:

- Gemma4 is a strong general-purpose alternative. Use it if qwen3.5 does not work well on your machine.

---

## 1.7 Create a Larger Context Model

For coding, the model needs enough memory to read instructions, code files, and conversation history. This is called context.

The model may support a large context window, but you should still set the context explicitly and verify it.

Create a Qwen Modelfile:

```bash
cat > Modelfile <<'EOF'
FROM qwen3.5:9b
PARAMETER num_ctx 65536
PARAMETER num_predict -1
EOF
```

What this file does:

- `FROM qwen3.5:9b` starts from the model you downloaded.
- `PARAMETER num_ctx 65536` sets the context window to 65,536 tokens.
- `PARAMETER num_predict -1` allows the model to generate long replies when needed.

Why it is needed:

- A larger context helps the model understand more files and longer agent instructions.

Create the custom Ollama model:

```bash
ollama create qwen3.5-9b-64k -f Modelfile
```

What this command does:

- It creates a new Ollama model named `qwen3.5-9b-64k:latest`.

Why it is needed:

- Claude Code will use this named model instead of the original default model.

Quick test:

```bash
ollama run qwen3.5-9b-64k:latest "Reply with one short sentence."
```

What this command does:

- It asks the model for a simple test reply.

Why it is needed:

- It confirms the custom model can run.

Gemma4 version of the same setup:

```bash
cat > Modelfile <<'EOF'
FROM gemma4:e4b
PARAMETER num_ctx 65536
PARAMETER num_predict -1
EOF

ollama create gemma4-e4b-64k -f Modelfile
ollama run gemma4-e4b-64k:latest "Reply with one short sentence."
```

Use this only if you choose Gemma4 instead of qwen3.5.

---

## 1.8 Configure Claude Code for Ollama

Claude Code normally talks to Anthropic's cloud models. This section tells Claude Code to talk to Ollama instead.

For qwen3.5:9b, run:

```bash
export ANTHROPIC_AUTH_TOKEN=ollama
export ANTHROPIC_API_KEY=""
export ANTHROPIC_BASE_URL=http://localhost:11434
export ANTHROPIC_DEFAULT_HAIKU_MODEL=qwen3.5-9b-64k:latest
export ANTHROPIC_DEFAULT_SONNET_MODEL=qwen3.5-9b-64k:latest
export ANTHROPIC_DEFAULT_OPUS_MODEL=qwen3.5-9b-64k:latest
export CLAUDE_CODE_SUBAGENT_MODEL=qwen3.5-9b-64k:latest
```

What these settings do:

- `ANTHROPIC_AUTH_TOKEN=ollama` gives Claude Code a placeholder token for Ollama.
- `ANTHROPIC_API_KEY=""` clears any Anthropic cloud API key in this terminal.
- `ANTHROPIC_BASE_URL=http://localhost:11434` sends Claude Code requests to Ollama on your computer.
- `ANTHROPIC_DEFAULT_HAIKU_MODEL`, `ANTHROPIC_DEFAULT_SONNET_MODEL`, and `ANTHROPIC_DEFAULT_OPUS_MODEL` map Claude Code's model tiers to your local model.
- `CLAUDE_CODE_SUBAGENT_MODEL` tells teammate agents which model to use.

Why they are needed:

- Without these settings, the lead agent or teammate agents may try to call Anthropic cloud models instead of your local model.

Make the settings permanent for zsh:

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

What this snippet does:

- It adds the local-model environment variables to your zsh startup file.
- `source ~/.zshrc` reloads that file immediately.

Why it is needed:

- You will not need to type the same exports every time you open a new terminal.

Test Claude Code with Ollama:

```bash
claude --model qwen3.5-9b-64k:latest --permission-mode default --teammate-mode in-process
```

Inside Claude Code, type:

```text
Hi!
```

If you get a reply, the connection works.

Exit Claude Code:

```text
/exit
```

---

## 1.9 Enable Agent Teams and Project Settings

Agent Teams is experimental. It must be turned on before Claude Code can spawn teammate agents.

Create the project Claude settings:

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

What this file does:

- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` turns on Agent Teams.
- `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` reduces background Claude Code network traffic.
- The `ANTHROPIC_*` settings route Claude Code to Ollama.
- `CLAUDE_CODE_SUBAGENT_MODEL` sets the model for teammate agents.
- `teammateMode: "auto"` lets Claude Code choose the best teammate display mode.
- `permissions.deny` blocks access to common secret files and dangerous shell commands.

Why it is needed:

- Agent Teams will not appear unless the experimental flag is enabled.
- Teammates may not use the local model unless the subagent model is set.
- Basic safety rules reduce the chance of accidental secret access or destructive commands.

Create a project instruction file:

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

What this file does:

- It gives Claude Code standing instructions for this project.

Why it is needed:

- Claude Code reads `CLAUDE.md` to understand your project rules before working.

Save the setup files:

```bash
git add .claude/settings.json CLAUDE.md .gitignore
git commit -m "Configure Claude Code local agent setup"
```

What these commands do:

- They save the Claude Code settings and instructions in Git.

Why they are needed:

- This gives you another safe checkpoint before agents start editing code.

---

## 1.10 Install Agent Skills

Skills are instruction packages. They teach Claude Code how to do a specific type of work.

In the video workflow, we install Anthropic's web-building skills manually.

```bash
mkdir -p .claude/skills
git clone https://github.com/anthropics/skills.git /tmp/anthropic-skills
cp -r /tmp/anthropic-skills/skills/frontend-design .claude/skills/
cp -r /tmp/anthropic-skills/skills/web-artifacts-builder .claude/skills/
cp -r /tmp/anthropic-skills/skills/theme-factory .claude/skills/
cp -r /tmp/anthropic-skills/skills/webapp-testing .claude/skills/
rm -rf /tmp/anthropic-skills
```

What these commands do:

- They create a local skills folder.
- They download Anthropic's official skills repository.
- They copy four useful web-building skills into your project.
- They delete the temporary download folder.

Why they are needed:

- `frontend-design` helps prevent generic-looking AI websites.
- `web-artifacts-builder` gives stronger web app building instructions.
- `theme-factory` provides professional theme guidance.
- `webapp-testing` helps with browser-based testing practices.

Save the skills:

```bash
git add .claude/skills
git commit -m "Add Claude Code web skills"
```

---

## 1.11 Add the Nano Banana Image Tool

Skip this section if you do not need AI-generated images.

Nano Banana is an MCP server. MCP means Model Context Protocol. It lets Claude Code connect to extra tools that it cannot use by itself, such as image generation.

Nano Banana uses Google's Gemini API for image generation, so you need a Gemini API key.

Get a Gemini API key:

1. Open [https://aistudio.google.com](https://aistudio.google.com)
2. Click "Get API key."
3. Create a new API key.
4. Copy it and store it somewhere safe.

Important safety rule:

Do not put API keys inside project files that might be committed to Git.

Set your Gemini key in the terminal:

```bash
export GEMINI_API_KEY="PASTE-YOUR-GEMINI-KEY-HERE"
```

What this command does:

- It stores your Gemini API key in the current terminal session.

Why it is needed:

- The Nano Banana MCP server needs this key to call Gemini.

Add the MCP server with local scope:

```bash
claude mcp add --scope local --env GEMINI_API_KEY="$GEMINI_API_KEY" nanobanana -- uvx nanobanana-mcp-server@latest
```

What this command does:

- `claude mcp add` adds a new tool server.
- `--scope local` stores the MCP configuration locally for you, not as a shared project file.
- `--env GEMINI_API_KEY="$GEMINI_API_KEY"` passes your key to the tool server.
- `nanobanana` is the name of this tool server.
- `-- uvx nanobanana-mcp-server@latest` runs the server through uvx.

Why it is needed:

- This gives the Content Generator agent a way to generate website images without committing your API key to the project.

Check the MCP server:

```bash
claude mcp list
```

What this command does:

- It lists the MCP servers Claude Code knows about.

Why it is needed:

- You should see `nanobanana` in the list before asking agents to generate images.

---

## 1.12 Create the Agent Team

Agent definition files live in `.claude/agents/`.

Each file tells Claude Code:

- The agent's name
- When to use that agent
- Which tools it can use
- How it should behave

Create the agent folder:

```bash
mkdir -p .claude/agents
```

### 1.12.1 UI/UX Designer Agent

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

What this file does:

- It creates a design-focused teammate.
- `model: inherit` means the agent can use the model selected by Claude Code.
- The `tools` list controls what the agent may use.

Why it is needed:

- Separating design work from React logic reduces confusion and file conflicts.

### 1.12.2 React Architect Agent

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

What this file does:

- It creates a React implementation teammate.
- `Bash` is included so this agent can run build commands.

Why it is needed:

- React code and build errors need a coding-focused agent.

### 1.12.3 Content Generator Agent

This version of the Content Generator can use Nano Banana when image generation is available.

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

What this file does:

- It creates a content-focused teammate.
- `mcpServers` exposes the Nano Banana tool to this agent.
- `disallowedTools: Bash` blocks shell commands for this agent.

Why it is needed:

- Website copy and image prompts are easier to manage when a separate agent owns them.

Verify the agent files:

```bash
ls -la .claude/agents
```

What this command does:

- It lists the agent definition files.

Why it is needed:

- You should see `ui-ux-designer.md`, `react-architect.md`, and `content-generator.md`.

Save the agents:

```bash
git add .claude/agents
git commit -m "Add local website agent team"
```

---

## 1.13 Run the Agent Team

Start Claude Code:

```bash
claude --model qwen3.5-9b-64k:latest --permission-mode default --teammate-mode in-process
```

What this command does:

- It starts Claude Code using your local Qwen model.
- It keeps the workflow in one terminal.
- It uses the safest normal permission mode.

Why it is needed:

- This is the basic, no-Docker, no-tmux launch command.

### 1.13.1 Test with One Agent First

Give Claude Code this small test prompt:

```text
Create an Agent Team with one teammate. Use the react-architect agent.
Ask the teammate to inspect this Vite React project and summarize the folder structure.
Do not edit files yet.
```

What this prompt does:

- It tests whether Agent Teams can spawn a teammate.
- It does not allow file edits yet.

Why it is needed:

- Local models can vary in how well they follow Agent Team protocols. Test small before giving a big task.

### 1.13.2 Launch the Full Team

If the small test works, give the full website prompt:

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

What this prompt does:

- It gives the lead agent a clear project goal.
- It names the teammate roles.
- It gives a safe step-by-step workflow.
- It asks for generated images, but still works if the image tool is unavailable.

Why it is needed:

- Agent Teams work better when responsibilities are clear.

Important note:

- Local models may be slower than cloud models.
- If Claude Code asks for approval, read the action.
- If it looks safe, approve it.
- If there is a pause, wait. Your laptop may be working hard.

---

## 1.14 Preview and Clean Up

When the agents finish, run one final build:

```bash
npm run build
```

What this command does:

- It confirms the final React app compiles.

Why it is needed:

- A project is not complete until it builds successfully.

Preview the website locally:

```bash
npm run dev
```

What this command does:

- It starts the Vite development server.
- Vite will show a local URL, usually something like `http://localhost:5173`.

Why it is needed:

- It lets you open the finished website in your browser before publishing it anywhere.

If Nano Banana ran out of quota or failed:

- The agents may create image placeholders instead of real images.
- This is okay for the tutorial.
- You can add real images later or rerun the image step after your quota resets.

Clean up the team before exiting:

```text
Clean up the team. All tasks are complete.
```

What this prompt does:

- It asks the lead agent to stop any teammate activity.

Why it is needed:

- It reduces the chance of agents continuing to run in the background.

Exit Claude Code:

```text
/exit
```

---

## 1.15 Reuse the Pattern

The coffee shop website is only one example.

The useful skill is learning how to build your own agent team for many tasks:

- Documentation
- Testing
- Refactoring
- Data dashboards
- Security reviews
- Accessibility reviews
- Launch checklists

The repeatable pattern:

1. Create a dedicated project folder.
2. Write a `CLAUDE.md` project brief.
3. Create `.claude/settings.json`.
4. Design specialist roles before creating agent files.
5. Create one Markdown file per agent in `.claude/agents/`.
6. Save a Git checkpoint.
7. Test one agent first.
8. Run the full team.

Plain English rule:

- A good agent team is not about having many agents.
- It is about clear roles, clear boundaries, and a clear definition of done.

---

# 2. Troubleshooting

## Claude Code cannot connect to Ollama

Check Ollama:

```bash
ollama list
```

If this fails, start Ollama from the app or run:

```bash
ollama serve
```

Why it matters:

- Claude Code cannot use local models if Ollama is not running.

## Model not found

Check available models:

```bash
ollama list
```

Fix:

- Use the exact model name shown in the list.
- For this tutorial, the custom model should appear as `qwen3.5-9b-64k:latest`.
- Include `:latest` in Claude Code commands and environment variables.

## Agent Teams do not appear

Check the project settings file:

```bash
rg "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS" .claude/settings.json
```

Expected setting:

```text
"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
```

Fix:

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

## Teammates use the wrong model

Check the teammate model setting:

```bash
rg "CLAUDE_CODE_SUBAGENT_MODEL" .claude/settings.json
```

Fix for Qwen:

```bash
export CLAUDE_CODE_SUBAGENT_MODEL=qwen3.5-9b-64k:latest
```

Fix for Gemma4:

```bash
export CLAUDE_CODE_SUBAGENT_MODEL=gemma4-e4b-64k:latest
```

## Nano Banana does not appear

Check the MCP list:

```bash
claude mcp list
```

Fix:

```bash
export GEMINI_API_KEY="PASTE-YOUR-GEMINI-KEY-HERE"
claude mcp add --scope local --env GEMINI_API_KEY="$GEMINI_API_KEY" nanobanana -- uvx nanobanana-mcp-server@latest
claude mcp list
```

Common causes:

- The Gemini API key was not set in the current terminal.
- uv was not installed.
- The MCP server was added in another environment.

## The local model is too slow

Try a smaller context:

```bash
cat > Modelfile <<'EOF'
FROM qwen3.5:9b
PARAMETER num_ctx 32768
PARAMETER num_predict -1
EOF

ollama create qwen3.5-9b-32k -f Modelfile
```

Launch with:

```bash
claude --model qwen3.5-9b-32k:latest --permission-mode default --teammate-mode in-process
```

Why it helps:

- Smaller context uses less memory and may run faster.

## Build fails

Run:

```bash
npm run build
```

Then ask Claude Code:

```text
The build failed. Read the error message, fix the build, and run npm run build again.
```

Why this helps:

- Build errors usually show the exact file and line that need attention.

---

# 3. Quick Reference

## Basic local launch

```bash
cd ~/Desktop/REACTWebBuilder
claude --model qwen3.5-9b-64k:latest --permission-mode default --teammate-mode in-process
```

## Basic local environment

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

## Ollama commands

```bash
ollama list
ollama ps
ollama pull qwen3.5:9b
ollama create qwen3.5-9b-64k -f Modelfile
ollama run qwen3.5-9b-64k:latest
```

## React commands

```bash
npm install
npm run dev
npm run build
```

## Nano Banana commands

```bash
export GEMINI_API_KEY="PASTE-YOUR-GEMINI-KEY-HERE"
claude mcp add --scope local --env GEMINI_API_KEY="$GEMINI_API_KEY" nanobanana -- uvx nanobanana-mcp-server@latest
claude mcp list
```

## Agent folders

```text
.claude/settings.json
.claude/agents/ui-ux-designer.md
.claude/agents/react-architect.md
.claude/agents/content-generator.md
.claude/skills/
CLAUDE.md
```

---

# 4. Appendix: Plain-English Terms

| Term | Meaning |
|:--|:--|
| Agent | An AI worker with a specific role. |
| Agent Team | A group of Claude Code agents coordinated by a lead agent. |
| API key | A private key that lets software use an online service. Treat it like a password. |
| CLI | Command-Line Interface. A program controlled by typed commands. |
| Context | The amount of text and code an AI model can consider at one time. |
| Environment variable | A setting saved in your terminal before a program starts. |
| Git checkpoint | A saved project state you can return to later. |
| LLM | Large Language Model. An AI model that reads and writes text or code. |
| MCP | Model Context Protocol. A way to connect AI agents to external tools. |
| Nano Banana | An MCP server for image generation through Gemini. |
| npm | Node Package Manager. A tool for installing JavaScript packages. |
| Ollama | A program that runs AI models locally on your computer. |
| Permission mode | A Claude Code setting that controls when the AI must ask before acting. |
| React | A JavaScript library for building websites and apps. |
| Token | A small piece of text used by AI models. |
| Vite | A fast tool for creating and running web projects. |

---

# 5. Sources Checked

This tutorial was prepared from:

- `NativeClaudeTeam_transcript_v3.md`
- `ClaudeAgentSetupTutorial_EN.md`

Supporting references:

- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [Claude Code model configuration](https://code.claude.com/docs/en/model-config)
- [Claude Code settings](https://code.claude.com/docs/en/settings)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Ollama Claude Code integration](https://docs.ollama.com/integrations/claude-code)
- [Ollama Modelfile reference](https://docs.ollama.com/modelfile)
- [Anthropic skills repository](https://github.com/anthropics/skills)
