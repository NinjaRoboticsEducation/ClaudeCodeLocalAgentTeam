# Docker Automation Tutorial

How to run a Claude Code Agent Team inside a Docker sandbox, use full automation mode more safely, and deploy the finished React website with Firebase Hosting.

This tutorial is written for non-technical users. Every command is meant to be copy-pasteable. Every important setting includes plain-English explanations:

- What it does
- Why it is needed

This tutorial is based on `DockerAutomation_transcript_v2.md` and uses `ClaudeAgentSetupTutorial_EN.md` as the structure, formatting, and readability reference.

---

## What You Will Build

By the end of this tutorial, you will understand how to:

- Build a Docker sandbox for Claude Code
- Connect Docker back to your local Ollama model
- Run Claude Code with `--dangerously-skip-permissions` inside Docker
- Choose between locked-down mode and shared project mode
- Re-add the Nano Banana MCP image tool inside Docker
- Run an automated React website-building prompt
- Deploy the finished website with Firebase Hosting
- Clean up Docker containers and images safely

This tutorial continues from the local agent team workflow in `NativeClaudeTeam_tutorial_EN.md`.

---

## Important Safety Note

This tutorial uses a powerful automation mode:

```bash
--dangerously-skip-permissions
```

The name is dramatic for a reason. It means Claude Code can edit files and run commands without asking you every time.

Plain English warning:

- Docker reduces risk.
- Docker does not make everything magically safe.
- If you mount your real project folder into Docker, the AI can edit or delete files in that project folder.
- Do not mount your home folder, SSH keys, password files, browser profiles, or cloud credentials.
- Always make a Git checkpoint before using shared project mode.

Use locked-down mode first if you are new to Docker.

---

## Prerequisites

Before starting this tutorial, you should already have:

- Ollama running locally
- A custom model named `qwen3.5-9b-64k:latest`
- Claude Code project settings in `.claude/settings.json`
- Agent files in `.claude/agents/`
- Optional Nano Banana MCP setup from the first tutorial

If you do not have these yet, complete `NativeClaudeTeam_tutorial_EN.md` first.

---

## Table of Contents

1. [Docker Automation Setup](#1-docker-automation-setup)
   - [1.1 What Docker Automation Means](#11-what-docker-automation-means)
   - [1.2 Choose a Docker Mode](#12-choose-a-docker-mode)
   - [1.3 Install Docker Desktop](#13-install-docker-desktop)
   - [1.4 Create the Docker Sandbox](#14-create-the-docker-sandbox)
   - [1.5 Build the Docker Image](#15-build-the-docker-image)
   - [1.6 Option A: Locked-Down Mode](#16-option-a-locked-down-mode)
   - [1.7 Option B: Shared Project Mode](#17-option-b-shared-project-mode)
   - [1.8 Run the Automated Agent Prompt](#18-run-the-automated-agent-prompt)
   - [1.9 Use Gemma4 Instead](#19-use-gemma4-instead)
   - [1.10 Deploy with Firebase Hosting](#110-deploy-with-firebase-hosting)
   - [1.11 What About tmux?](#111-what-about-tmux)
   - [1.12 Clean Up](#112-clean-up)
2. [Troubleshooting](#2-troubleshooting)
3. [Quick Reference](#3-quick-reference)
4. [Appendix: Plain-English Terms](#4-appendix-plain-english-terms)
5. [Sources Checked](#5-sources-checked)

---

# 1. Docker Automation Setup

This section shows the advanced setup from the video.

It uses Docker.

It skips Claude Code permission prompts inside Docker.

It still uses your local Ollama model on your computer.

It keeps teammate agents inside one Claude Code interface because local Ollama models usually do not show separate tmux panes reliably.

## 1.1 What Docker Automation Means

In the beginner workflow, Claude Code asks before important actions:

- Edit this file?
- Run this command?
- Install this package?
- Build the project?

That is safer, but it can slow down agent work.

In this Docker workflow, Claude Code runs inside a container and uses:

```bash
--dangerously-skip-permissions
```

What this flag does:

- It lets Claude Code edit files and run commands without asking each time.

Why it is useful:

- Agents can work more quickly and autonomously.

Why Docker is needed:

- Running skip-permissions directly on your main computer is not recommended.
- Docker gives the agents a controlled workspace.

---

## 1.2 Choose a Docker Mode

This tutorial covers two modes.

| Mode | What it means | Best for |
|:--|:--|:--|
| Locked-down mode | Docker does not mount your real project folder. The AI works inside Docker, and you copy files out later. | Beginners and safer experiments |
| Shared project mode | Docker mounts your real project folder. Changes appear immediately on your computer. | Faster work after you have Git checkpoints |

Plain English difference:

- Locked-down mode is safer but less convenient.
- Shared project mode is convenient but can change real files immediately.

Important rule:

- If you are not sure which mode to use, start with locked-down mode.

---

## 1.3 Install Docker Desktop

1. Open [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Download Docker Desktop for your computer.
3. If you are on Mac, choose Apple Silicon for M1, M2, M3, or M4 Macs, or Intel for older Intel Macs.
4. Install Docker Desktop like a normal app.
5. Start Docker Desktop.

Check Docker:

```bash
docker --version
docker info
```

What these commands do:

- `docker --version` shows the installed Docker version.
- `docker info` checks whether Docker Desktop is running.

Why they are needed:

- Docker commands will fail if Docker Desktop is not running.

If `docker info` fails:

- Open Docker Desktop.
- Wait until it finishes starting.
- Run `docker info` again.

---

## 1.4 Create the Docker Sandbox

Create a clean folder for the Docker tutorial:

```bash
mkdir -p ~/Desktop/DockerWebBuilder
cd ~/Desktop/DockerWebBuilder
```

What this command does:

- It creates a separate host folder for the Dockerfile and copied output.
- It moves your terminal into that clean Docker workspace.

Why it is needed:

- The locked-down React project will be created inside Docker first.
- Keeping the Docker tutorial in its own folder avoids mixing it with the project from the first tutorial.

Create a Dockerfile:

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

What this Dockerfile does:

- `FROM node:22-bookworm-slim` starts from a small Linux image with Node.js 22.
- `COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/` adds `uv` and `uvx` to the container.
- `apt-get install` adds common developer tools.
- `git` supports source control.
- `python3`, `g++`, and `make` help install packages that need build tools.
- `ripgrep` gives fast code search through the `rg` command.
- `tmux` is included for terminal support, even though local models usually use in-process teammate mode.
- `npm install -g @anthropic-ai/claude-code@latest` installs Claude Code.
- The tmux lines configure keyboard and mouse support.
- `WORKDIR /workspace` sets the default project folder inside the container.
- `USER node` avoids running Claude Code as root.
- `CMD ["/bin/bash"]` opens a shell when the container starts.

Why it is needed:

- This creates a repeatable, isolated environment for automated coding work.
- `uvx` is included so Nano Banana MCP can run inside Docker.

---

## 1.5 Build the Docker Image

Build the image:

```bash
docker build -t claude-agent-sandbox .
```

What this command does:

- It reads the Dockerfile.
- It downloads the base image.
- It installs the tools.
- It saves the result as `claude-agent-sandbox`.

Why it is needed:

- You need a Docker image before you can start a container.

Note:

- The first build can take a few minutes. This is normal.

---

## 1.6 Option A: Locked-Down Mode

Locked-down mode is the safest Docker mode.

It does not connect your real project folder to Docker.

The AI works inside Docker's own filesystem. It cannot directly touch your Mac files.

### 1.6.1 Start the Locked Container

If you use Nano Banana image generation, set your Gemini key in the host terminal before starting Docker:

```bash
export GEMINI_API_KEY="PASTE-YOUR-GEMINI-KEY-HERE"
```

If you do not use Nano Banana, you can skip this and remove the `GEMINI_API_KEY` line from the Docker command.

If a previous attempt failed after creating the named container, remove the stopped container first:

```bash
docker rm claude-agent-locked
```

Start the container:

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

What this command does:

- `docker run -it` starts an interactive container.
- `--name claude-agent-locked` gives the container a clear name.
- `--user root` starts the container as root only long enough to fix folder ownership.
- `HOME=/home/node` keeps npm and Claude Code user files under the node user's home folder.
- The `ANTHROPIC_*` variables route Claude Code to Ollama on your host computer.
- `GEMINI_API_KEY` passes the Nano Banana image-generation key into Docker.
- `host.docker.internal` is Docker Desktop's special name for your Mac or Windows host.
- The model variables point Claude Code and teammates at the local model.
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` enables Agent Teams.
- `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` reduces non-essential Claude Code network traffic.
- The final `/bin/bash -lc ...` command changes `/workspace` ownership to `node`, then switches into a normal `node` shell.

Why it is needed:

- This gives Claude Code a contained workspace while still letting it reach Ollama on your computer.
- The ownership fix prevents `EACCES: permission denied` errors when Vite, npm, or Git writes files in `/workspace`.

Your terminal prompt should change to something like:

```text
node@container-id:/workspace$
```

That means you are inside the container.

### 1.6.2 Create a Project Inside the Container

Inside the container, create a fresh React project:

```bash
npm create vite@latest . -- --template react
npm install
git init
git config --global user.email "builder@local"
git config --global user.name "Builder"
git add .
git commit -m "Initial Vite React scaffold"
```

What these commands do:

- They create a fresh React project inside Docker.
- They configure Git identity inside Docker.
- They save the first Git checkpoint.

Why they are needed:

- Locked-down mode starts with an empty `/workspace`.
- You need a project inside Docker before agents can build anything.

For a real workflow:

- Add your `.claude/settings.json`.
- Add your `.claude/agents/` files.
- Add your `CLAUDE.md`.
- You can copy them from `NativeClaudeTeam_tutorial_EN.md`.

### 1.6.3 Add Nano Banana Inside the Container

If this container needs Nano Banana, add the MCP server inside the container:

```bash
claude mcp add nanobanana --scope local -e KEY1="$GEMINI_API_KEY" -- uvx nanobanana-mcp-server@latest
claude mcp list
```

What these commands do:

- They register Nano Banana in this Docker container's Claude Code settings.

Why they are needed:

- Docker has its own home folder.
- Your Mac's local MCP setup is not automatically available inside the container.

### 1.6.4 Start Claude Code in Automated Mode

Run:

```bash
claude --model qwen3.5-9b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

What this command does:

- It starts Claude Code with the local model.
- `--dangerously-skip-permissions` skips permission prompts.
- `--teammate-mode in-process` keeps teammates in one Claude Code interface.

Why it is needed:

- This is the automation mode.
- Docker reduces the blast radius if the AI runs a bad command.

### 1.6.5 Copy Files Out

When you are done, exit Claude Code:

```text
/exit
```

Then exit the container:

```bash
exit
```

Copy the finished files out:

```bash
docker cp claude-agent-locked:/workspace/. ./docker-output/
```

What this command does:

- It copies everything from the container's `/workspace` folder into `./docker-output/` on your Mac.

Why it is needed:

- Locked-down mode does not automatically share files with your computer.

Remove the stopped container:

```bash
docker rm claude-agent-locked
```

---

## 1.7 Option B: Shared Project Mode

Shared project mode connects your real project folder to Docker.

This is more convenient, but less safe.

When the AI edits a file inside Docker, you immediately see that change on your computer.

Important warning:

- The mounted project folder is real.
- If Claude Code deletes a file inside `/workspace`, it deletes the file from your project folder.
- Always make a Git checkpoint before using shared mode with skipped permissions.

### 1.7.1 Save a Git Checkpoint

From your normal Mac terminal:

```bash
cd ~/Desktop/DockerWebBuilder/docker-output
git status
git add .
git commit -m "Checkpoint before Docker automation"
```

What these commands do:

- They move into your project folder.
- They show whether there are unsaved changes.
- They save the current project state.

Why they are needed:

- If automated work gets messy, Git gives you a checkpoint to compare against.

If Git says there is nothing to commit:

- That is fine.
- It means your project is already clean.

### 1.7.2 Start the Shared Container

Set your Gemini key if you use Nano Banana:

```bash
export GEMINI_API_KEY="PASTE-YOUR-GEMINI-KEY-HERE"
```

Start the shared container:

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

What this command does:

- `--mount type=bind,source="$(pwd)",target=/workspace` shares your current project folder with Docker.
- `$(pwd)` means "the folder I am currently in."
- Inside the container, your project appears as `/workspace`.
- `--rm` deletes the container after you exit.

Why it is needed:

- Shared mode lets agents work inside Docker while still editing your real project files.

### 1.7.3 Prepare the Container

Inside the shared container, run:

```bash
git config --global user.email "builder@local"
git config --global user.name "Builder"
claude mcp add nanobanana --scope local -e KEY1="$GEMINI_API_KEY" -- uvx nanobanana-mcp-server@latest
claude mcp list
```

What these commands do:

- They configure Git identity inside the container.
- They register Nano Banana inside the Docker sandbox.
- They confirm the MCP server is available.

Why they are needed:

- Docker has its own home folder.
- Your Mac's MCP setup is not automatically available inside Docker.

### 1.7.4 Launch Claude Code

Inside the container, run:

```bash
claude --model qwen3.5-9b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

What this command does:

- It starts Claude Code in automated mode.
- It uses the local Ollama model.
- It keeps teammates in one interface.

Why it is needed:

- This is the practical full-automation setup for local models.

---

## 1.8 Run the Automated Agent Prompt

After Claude Code starts inside Docker, give it this prompt:

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

What this prompt does:

- It gives the agents a website goal.
- It names the agent roles.
- It tells them to work without asking for permission.
- It asks for image generation when available.
- It requires `npm run build`.
- It prevents deployment until you decide to deploy.

Why it is needed:

- Full automation needs clear boundaries. The prompt tells the agents what to do and what not to do.

When the work is done:

```text
/exit
```

Then exit Docker if you are still inside the container:

```bash
exit
```

---

## 1.9 Use Gemma4 Instead

If you used Gemma4 in the first tutorial, replace every:

```text
qwen3.5-9b-64k:latest
```

with:

```text
gemma4-e4b-64k:latest
```

Example launch command:

```bash
claude --model gemma4-e4b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

What this replacement does:

- It points Claude Code at your Gemma4 Ollama model.

Why it is needed:

- Docker environment variables must match the model name you created in Ollama.

---

## 1.10 Deploy with Firebase Hosting

Firebase Hosting is a Google service that lets you publish websites online.

For beginners, deploy from your normal Mac terminal, not from Docker.

Why:

- Firebase login tokens are usually stored on your host computer.
- Passing cloud credentials into Docker is possible, but it adds security risk.

### 1.10.1 Create a Firebase Project

1. Open [https://console.firebase.google.com](https://console.firebase.google.com)
2. Sign in with your Google account.
3. Click "Create a project."
4. Give it a name, such as `brew-and-bean-site`.
5. Google Analytics is optional for this tutorial.
6. Finish project creation.

### 1.10.2 Log In from Your Terminal

Open a normal terminal window on your Mac, not inside Docker.

```bash
npx -y firebase-tools@latest login
```

What this command does:

- It runs the latest Firebase command-line tool without installing it globally.
- It opens a browser login page.

Why it is needed:

- Firebase needs to know which Google account is allowed to deploy the site.

### 1.10.3 Initialize Hosting

Go to your copied project folder:

```bash
cd ~/Desktop/DockerWebBuilder/docker-output
```

Initialize Hosting:

```bash
npx -y firebase-tools@latest init hosting
```

Recommended answers:

| Firebase question | Answer |
|:--|:--|
| Use an existing project? | Yes. Choose the project you created. |
| Public directory? | `dist` |
| Configure as a single-page app? | Yes |
| Set up automatic builds with GitHub? | No |
| Overwrite `dist/index.html`? | No, if it asks after you already built the app |

What this command does:

- It creates Firebase Hosting configuration files.

Why it is needed:

- Firebase needs to know which project to deploy to and which folder contains the built website.

### 1.10.4 Build

If the agents already ran `npm run build` successfully inside Docker and you used shared mode, the built files are already on your computer.

If not, run:

```bash
npm run build
```

What this command does:

- It creates the final production website in the `dist` folder.

Why it is needed:

- Firebase deploys built files, not raw React source files.

### 1.10.5 Deploy

```bash
npx -y firebase-tools@latest deploy --only hosting
```

What this command does:

- It uploads the `dist` folder to Firebase Hosting.

Why it is needed:

- This publishes the site and gives you a public URL.

Save Firebase config:

```bash
git add firebase.json .firebaserc
git commit -m "Add Firebase Hosting config"
```

What these commands do:

- They save the Firebase Hosting configuration files.

Why they are needed:

- You can deploy the same project again later without repeating setup.

---

## 1.11 What About tmux?

tmux is a terminal tool that can split one terminal window into multiple panes.

You might want each teammate agent in its own terminal pane.

Important limitation:

- Detailed tmux teammate panes currently work reliably with Anthropic cloud models, not local Ollama models.
- Local Ollama models may still run Agent Teams, but they usually show teammates inside one Claude Code interface.

For local Docker automation, use:

```bash
--teammate-mode in-process
```

Why:

- It is the most practical choice for local models.

If you want the multi-pane tmux experience:

- Use an Anthropic cloud model setup.
- Expect cloud model usage to cost money.
- Treat that as a separate advanced workflow.

---

## 1.12 Clean Up

Do not just close the terminal window.

Inside Claude Code, exit cleanly:

```text
/exit
```

Then exit the container:

```bash
exit
```

If you used shared mode with `--rm`:

- The container deletes itself automatically after you exit.
- Your project files remain on your computer.

If you used a named locked container, check and remove it:

```bash
docker ps -a
docker rm claude-agent-locked
```

What these commands do:

- `docker ps -a` lists containers, including stopped ones.
- `docker rm claude-agent-locked` removes the stopped locked container.

Why they are needed:

- Containers can use disk space after you are done.

To free more disk space later, remove the sandbox image:

```bash
docker rmi claude-agent-sandbox
```

What this command does:

- It deletes the Docker image.

Why it is needed:

- Docker images can take up disk space.

Note:

- If you delete the image, you must rebuild it with `docker build -t claude-agent-sandbox .` before using it again.

---

# 2. Troubleshooting

## Docker is not running

Check Docker:

```bash
docker info
```

If it fails:

- Open Docker Desktop.
- Wait until it finishes starting.
- Try again.

## Docker cannot reach Ollama

Inside Docker Desktop on Mac or Windows, use:

```text
http://host.docker.internal:11434
```

Why it matters:

- Inside Docker, `localhost` means the container itself, not your Mac.

If Ollama refuses the connection, try starting Ollama so it accepts host connections:

```bash
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

Use this in a separate normal terminal on your Mac.

If you are on Linux, you may need to add this to `docker run`:

```bash
--add-host=host.docker.internal:host-gateway
```

## Model not found inside Docker

Run this on your Mac:

```bash
ollama list
```

Fix:

- Use the exact model name shown in the list.
- If your model is `qwen3.5-9b-64k:latest`, every Docker environment variable should use that exact name.

## Nano Banana does not appear inside Docker

Inside the container, run:

```bash
echo $GEMINI_API_KEY
claude mcp list
```

If it is missing, add it again inside Docker:

```bash
claude mcp add nanobanana --scope local -e KEY1="$GEMINI_API_KEY" -- uvx nanobanana-mcp-server@latest
claude mcp list
```

Why it matters:

- Docker has its own home folder.
- MCP setup from your Mac is not automatically available inside Docker.

## Permission prompts still appear

Check that you launched Claude Code with:

```bash
claude --model qwen3.5-9b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

Why it matters:

- `--dangerously-skip-permissions` is the flag that turns on hands-off automation.

## Shared mode changed files unexpectedly

Run:

```bash
git status
```

What this command does:

- It shows which files changed.

Why it is needed:

- Shared mode edits your real project folder.

If the changes are messy, compare against your checkpoint:

```bash
git diff
```

Do not run destructive reset commands unless you are sure you want to discard the changes.

## Firebase deploy fails

Log in again:

```bash
npx -y firebase-tools@latest login
```

Build:

```bash
npm run build
```

Deploy:

```bash
npx -y firebase-tools@latest deploy --only hosting
```

Common checks:

- `firebase.json` should use `"public": "dist"`.
- Run `npm run build` before deploying.
- Do not deploy if the build fails.
- Deploy from your normal Mac terminal, not from inside Docker.

## tmux panes do not split with local models

This is expected.

Local Ollama models may run Agent Teams in one interface. Detailed tmux teammate panes are currently reliable with Anthropic cloud models.

Use this for local Docker automation:

```bash
claude --model qwen3.5-9b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

---

# 3. Quick Reference

## Build Docker image

```bash
cd ~/Desktop/DockerWebBuilder
docker build -t claude-agent-sandbox .
```

## Locked-down container

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

## Shared project container

```bash
cd ~/Desktop/DockerWebBuilder/docker-output
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

## Inside Docker setup

```bash
git config --global user.email "builder@local"
git config --global user.name "Builder"
claude mcp add nanobanana --scope local -e KEY1="$GEMINI_API_KEY" -- uvx nanobanana-mcp-server@latest
claude mcp list
```

## Automated Claude launch

```bash
claude --model qwen3.5-9b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

## Firebase deployment

```bash
cd ~/Desktop/DockerWebBuilder/docker-output
npm install
npm run build
npx -y firebase-tools@latest login
npx -y firebase-tools@latest init hosting
npx -y firebase-tools@latest deploy --only hosting
```

## Cleanup

```bash
docker ps -a
docker rm claude-agent-locked
docker rmi claude-agent-sandbox
```

---

# 4. Appendix: Plain-English Terms

| Term | Meaning |
|:--|:--|
| Bind mount | A way to connect a real folder from your computer into a Docker container. |
| Container | A small isolated software environment created by Docker. |
| Docker | A tool for running software inside containers. |
| Dockerfile | A recipe that tells Docker how to build a container image. |
| Docker image | A saved container template built from a Dockerfile. |
| Environment variable | A setting passed to a program before it starts. |
| Firebase Hosting | A Google service for publishing websites online. |
| Git checkpoint | A saved project state you can compare against or return to later. |
| Host computer | Your real computer outside Docker. |
| MCP | Model Context Protocol. A way to connect AI agents to external tools. |
| Nano Banana | An MCP server for image generation through Gemini. |
| Ollama | A program that runs AI models locally on your computer. |
| Permission prompt | A confirmation question before Claude Code edits files or runs commands. |
| Sandbox | A controlled workspace that limits what software can access. |
| Skip permissions | A mode where Claude Code does not ask before every edit or command. Use only with boundaries. |
| tmux | A terminal tool that splits one terminal into multiple panes. |

---

# 5. Sources Checked

This tutorial was prepared from:

- `DockerAutomation_transcript_v2.md`
- `ClaudeAgentSetupTutorial_EN.md`
- `NativeClaudeTeam_tutorial_EN.md`

Supporting references:

- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [Claude Code model configuration](https://code.claude.com/docs/en/model-config)
- [Claude Code settings](https://code.claude.com/docs/en/settings)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Ollama Claude Code integration](https://docs.ollama.com/integrations/claude-code)
- [Docker bind mounts](https://docs.docker.com/engine/storage/bind-mounts/)
- [Docker Desktop networking](https://docs.docker.com/desktop/features/networking/networking-how-tos/)
- [Firebase Hosting quickstart](https://firebase.google.com/docs/hosting/quickstart)
- [Firebase CLI documentation](https://firebase.google.com/docs/cli)
