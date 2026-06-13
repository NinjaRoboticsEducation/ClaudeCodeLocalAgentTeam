# Docker Automation 教程

这份教程会带你把 Claude Code Agent Team 放进 Docker 沙盒中运行，更安全地使用完全自动化模式，并用 Firebase Hosting 部署完成的 React 网站。

内容面向非技术背景用户。所有命令尽量保持可以直接复制粘贴；重要设置会用通俗语言说明“它做什么”和“为什么需要它”。

本文档基于 `DockerAutomation_tutorial_EN.md` 制作，并针对简体中文读者重新组织表达方式。

---

## 你会学到什么

完成后，你会理解：

- 如何创建 Claude Code 用的 Docker 沙盒
- 如何让 Docker 连接回你电脑上的本地 Ollama 模型
- 如何在 Docker 中使用 `--dangerously-skip-permissions`
- locked-down mode 与 shared project mode 的区别
- 为什么 Nano Banana MCP 图像工具需要在 Docker 内重新添加
- 如何使用自动化 React 网站构建提示
- 如何用 Firebase Hosting 发布网站
- 如何清理 Docker 容器和镜像

这份教程延续 `NativeClaudeTeam_tutorial_CN.md` 的本地代理人团队流程。

---

## 重要安全提醒

本教程会使用强力自动化模式：

```bash
--dangerously-skip-permissions
```

这个名称很夸张，但不是开玩笑。它代表 Claude Code 可以不再每次询问你，就直接编辑文件或执行命令。

请记住：

- Docker 可以降低风险。
- Docker 不会神奇地让所有事情都安全。
- 如果你把真实项目文件夹挂载到 Docker，AI 就能编辑或删除那个文件夹中的文件。
- 不要挂载家目录、SSH key、密码文件、浏览器配置文件或云端凭据。
- 使用 shared project mode 前，一定要创建 Git 检查点。

如果你不熟 Docker，请先从 locked-down mode 开始。

---

## 前置条件

开始前，你应该已经有：

- 位于 `~/Desktop/REACTWebBuilder` 的 React 项目
- 正在本地运行的 Ollama
- 名为 `qwen3.5-9b-64k:latest` 的自定义模型
- `.claude/settings.json` 里的 Claude Code 项目设置
- `.claude/agents/` 里的代理人定义文件
- 可选的 Nano Banana MCP 设置

如果还没有，请先完成 `NativeClaudeTeam_tutorial_CN.md`。

---

## 目录

1. [Docker 自动化设置](#1-docker-自动化设置)
   - [1.1 Docker 自动化代表什么](#11-docker-自动化代表什么)
   - [1.2 选择 Docker 模式](#12-选择-docker-模式)
   - [1.3 安装 Docker Desktop](#13-安装-docker-desktop)
   - [1.4 创建 Docker 沙盒](#14-创建-docker-沙盒)
   - [1.5 构建 Docker 镜像](#15-构建-docker-镜像)
   - [1.6 选项 A：Locked-Down Mode](#16-选项-alocked-down-mode)
   - [1.7 选项 B：Shared Project Mode](#17-选项-bshared-project-mode)
   - [1.8 运行自动化代理人提示](#18-运行自动化代理人提示)
   - [1.9 改用 Gemma4](#19-改用-gemma4)
   - [1.10 使用 Firebase Hosting 部署](#110-使用-firebase-hosting-部署)
   - [1.11 tmux 怎么办](#111-tmux-怎么办)
   - [1.12 清理](#112-清理)
2. [故障排查](#2-故障排查)
3. [快速参考](#3-快速参考)
4. [附录：通俗术语](#4-附录通俗术语)
5. [已核对来源](#5-已核对来源)

---

# 1. Docker 自动化设置

本章会搭建视频中的进阶流程。

会使用 Docker。

会在 Docker 内跳过 Claude Code 权限确认。

仍然使用你电脑上通过 Ollama 运行的本地模型。

由于本地 Ollama 模型通常不稳定支持详细 tmux 分屏，因此队友代理人会显示在同一个 Claude Code 界面中。

## 1.1 Docker 自动化代表什么

在入门流程中，Claude Code 会在重要操作前询问：

- 可以编辑这个文件吗？
- 可以运行这个命令吗？
- 可以安装这个包吗？
- 可以构建项目吗？

这更安全，但代理人工作会变慢。

Docker 自动化流程会把 Claude Code 放进容器中，并使用：

```bash
--dangerously-skip-permissions
```

这个标志会让 Claude Code 不再每次确认就直接工作。

好处：

- 代理人不太会一直停下来等你批准。
- 自动化程度更高。

为什么要搭配 Docker：

- 不建议在主机电脑上直接使用 skip-permissions。
- Docker 可以提供受控工作空间。

---

## 1.2 选择 Docker 模式

本教程提供两种模式。

| 模式 | 意思 | 适合 |
|:--|:--|:--|
| Locked-down mode | 不把真实项目文件夹接到 Docker。AI 在 Docker 内工作，最后再把文件复制出来。 | 初学者与安全实验 |
| Shared project mode | 把真实项目文件夹接到 Docker。变更会立刻出现在你的电脑上。 | 已有 Git 检查点、想快速工作时 |

白话区别：

- locked-down mode 更安全，但更麻烦。
- shared project mode 更方便，但会直接修改真实文件。

不确定时，请先用 locked-down mode。

---

## 1.3 安装 Docker Desktop

1. 打开 [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. 下载适合你电脑的 Docker Desktop。
3. Mac 用户请按机型选择 Apple Silicon 或 Intel。
4. 像普通 app 一样安装。
5. 启动 Docker Desktop。

确认：

```bash
docker --version
docker info
```

`docker --version` 显示 Docker 版本。`docker info` 确认 Docker Desktop 是否正在运行。

如果 `docker info` 失败，请打开 Docker Desktop，等它启动完成后再试一次。

---

## 1.4 创建 Docker 沙盒

进入 React 项目：

```bash
cd ~/Desktop/REACTWebBuilder
```

创建 Dockerfile。Dockerfile 是告诉 Docker 如何构建容器的配方。

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

这个 Dockerfile 会创建一个小型 Linux 开发环境，里面有 Node.js、Git、Python、ripgrep、tmux、Claude Code，以及 uv / uvx。`USER node` 避免以 root 身份运行 Claude Code。

---

## 1.5 构建 Docker 镜像

```bash
docker build -t claude-agent-sandbox .
```

这会读取 Dockerfile、下载需要的基础镜像、安装工具，并创建名为 `claude-agent-sandbox` 的 Docker 镜像。

第一次构建可能需要几分钟，这是正常的。

---

## 1.6 选项 A：Locked-Down Mode

locked-down mode 是最安全的 Docker 模式。

它不会连接你的真实项目文件夹。AI 只在 Docker 内部工作。

### 1.6.1 启动 locked 容器

如果使用 Nano Banana，先在主机终端设置 Gemini 密钥：

```bash
export GEMINI_API_KEY="PASTE-YOUR-GEMINI-KEY-HERE"
```

如果之前执行失败并留下了 named container，请先删除它：

```bash
docker rm claude-agent-locked
```

启动容器：

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

重点：

- `docker run -it` 启动可交互的容器。
- `--name claude-agent-locked` 给容器一个名称。
- `--user root` 只是在启动时临时用 root 修正 `/workspace` 的所有权。
- `HOME=/home/node` 让 npm 和 Claude Code 的用户文件放在 node 用户的 home 目录里。
- 最后的 `/bin/bash -lc ...` 会先让 node 用户可以写入 `/workspace`，然后切换回普通的 node shell。
- `host.docker.internal` 是 Docker Desktop 用来代表 Mac / Windows 主机的名称。
- `ANTHROPIC_BASE_URL` 让 Docker 内的 Claude Code 连接到主机上的 Ollama。

看到类似下面的提示符，代表你已在容器内：

```text
node@container-id:/workspace$
```

### 1.6.2 在容器内创建项目

```bash
npm create vite@latest . -- --template react
npm install
git init
git config --global user.email "builder@local"
git config --global user.name "Builder"
git add .
git commit -m "Initial Vite React scaffold"
```

locked-down mode 的 `/workspace` 一开始是空的，所以需要在 Docker 内创建项目。

实际使用时，也要添加 `.claude/settings.json`、`.claude/agents/` 和 `CLAUDE.md`。可以从 `NativeClaudeTeam_tutorial_CN.md` 复制相关内容。

### 1.6.3 在容器内添加 Nano Banana

```bash
claude mcp add nanobanana --scope local -e KEY1="$GEMINI_API_KEY" -- uvx nanobanana-mcp-server@latest
claude mcp list
```

Docker 有自己的 home 文件夹，所以 Mac 上的 MCP 设置不会自动出现在容器内。

### 1.6.4 以自动化模式启动 Claude Code

```bash
claude --model qwen3.5-9b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

这会用本地模型启动 Claude Code，并跳过每次操作前的确认。Docker 可以缩小出错时的影响范围。

### 1.6.5 复制文件出来

退出 Claude Code：

```text
/exit
```

离开容器：

```bash
exit
```

复制成果：

```bash
docker cp claude-agent-locked:/workspace/. ./docker-output/
```

删除停止的容器：

```bash
docker rm claude-agent-locked
```

---

## 1.7 选项 B：Shared Project Mode

shared project mode 会把真实项目文件夹连接到 Docker。

这更方便，但风险也更高。Docker 内的变更会立刻反映到你的真实项目。

重要提醒：

- 挂载的文件夹是真实项目。
- Claude Code 在 `/workspace` 删除文件，就等于从真实项目删除文件。
- 使用 skip-permissions 前，一定要创建 Git 检查点。

### 1.7.1 保存 Git 检查点

在普通 Mac 终端运行：

```bash
cd ~/Desktop/REACTWebBuilder
git status
git add .
git commit -m "Checkpoint before Docker automation"
```

如果 Git 显示 nothing to commit，表示项目已经是干净状态，没问题。

### 1.7.2 启动 shared 容器

如果使用 Nano Banana：

```bash
export GEMINI_API_KEY="PASTE-YOUR-GEMINI-KEY-HERE"
```

启动容器：

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

`--mount type=bind,source="$(pwd)",target=/workspace` 会把当前文件夹分享给 Docker，并在容器内显示为 `/workspace`。`--rm` 会在退出后自动删除容器。

### 1.7.3 准备容器内环境

```bash
git config --global user.email "builder@local"
git config --global user.name "Builder"
claude mcp add nanobanana --scope local -e KEY1="$GEMINI_API_KEY" -- uvx nanobanana-mcp-server@latest
claude mcp list
```

Docker 内需要重新设置 Git 名称、email，以及 Nano Banana。

### 1.7.4 启动 Claude Code

```bash
claude --model qwen3.5-9b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

---

## 1.8 运行自动化代理人提示

Claude Code 启动后，输入：

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

这个提示清楚指定目标、角色、图片生成、构建检查和不要部署。完全自动化时，边界越清楚越好。

完成后退出：

```text
/exit
```

如果还在容器内：

```bash
exit
```

---

## 1.9 改用 Gemma4

如果使用 Gemma4，请把所有

```text
qwen3.5-9b-64k:latest
```

替换为：

```text
gemma4-e4b-64k:latest
```

示例：

```bash
claude --model gemma4-e4b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

---

## 1.10 使用 Firebase Hosting 部署

Firebase Hosting 是 Google 的网站发布服务。

初学者请从普通 Mac 终端部署，不要从 Docker 部署。Firebase 登录 token 通常存在主机电脑上。

### 1.10.1 创建 Firebase 项目

1. 打开 [https://console.firebase.google.com](https://console.firebase.google.com)
2. 用 Google 账号登录。
3. 点击 “Create a project”。
4. 命名，例如 `brew-and-bean-site`。
5. 本教程中 Google Analytics 是可选项。
6. 完成项目创建。

### 1.10.2 从终端登录

请在普通终端运行，不要在 Docker 内。

```bash
npx -y firebase-tools@latest login
```

这会打开浏览器登录 Google。

### 1.10.3 初始化 Hosting

```bash
cd ~/Desktop/REACTWebBuilder
npx -y firebase-tools@latest init hosting
```

推荐回答：

| Firebase 问题 | 回答 |
|:--|:--|
| Use an existing project? | Yes，选择刚创建的项目。 |
| Public directory? | `dist` |
| Configure as a single-page app? | Yes |
| Set up automatic builds with GitHub? | No |
| Overwrite `dist/index.html`? | 已经构建过时选 No |

### 1.10.4 构建

如果你使用 shared mode，且 Docker 内已成功运行 `npm run build`，构建文件已在 Mac 上。

需要时运行：

```bash
npm run build
```

### 1.10.5 部署

```bash
npx -y firebase-tools@latest deploy --only hosting
```

完成后会显示公开 URL。

保存设置：

```bash
git add firebase.json .firebaserc
git commit -m "Add Firebase Hosting config"
```

---

## 1.11 tmux 怎么办

tmux 可以把一个终端切成多个分屏。

你可能会想把每个队友代理人放在不同分屏中，但有一个限制：

- 详细 tmux 队友分屏目前主要在 Anthropic 云端模型上稳定。
- 本地 Ollama 模型通常会在同一个 Claude Code 界面中显示队友。

本地 Docker 自动化请使用：

```bash
--teammate-mode in-process
```

如果想要多分屏 tmux 体验，需要 Anthropic 云端模型设置，而且可能产生费用。

---

## 1.12 清理

不要直接关闭终端。先退出 Claude Code：

```text
/exit
```

离开容器：

```bash
exit
```

如果 shared mode 使用 `--rm`，容器会自动删除。

如果使用 named locked container，请检查并删除：

```bash
docker ps -a
docker rm claude-agent-locked
```

如果想释放更多磁盘空间，可以删除镜像：

```bash
docker rmi claude-agent-sandbox
```

删除后，下次使用前需要重新运行 `docker build -t claude-agent-sandbox .`。

---

# 2. 故障排查

## Docker 没有启动

```bash
docker info
```

失败时请打开 Docker Desktop，等它启动完成后再试一次。

## Docker 连接不到 Ollama

Mac / Windows 的 Docker Desktop 中使用：

```text
http://host.docker.internal:11434
```

Docker 内的 `localhost` 是容器本身，不是你的 Mac。

如果 Ollama 拒绝连接，请在 Mac 的普通终端尝试：

```bash
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

Linux 可能需要在 `docker run` 加上：

```bash
--add-host=host.docker.internal:host-gateway
```

## Docker 内找不到模型

在 Mac 上确认：

```bash
ollama list
```

Docker 环境变量中的模型名称必须和列表完全一致。

## Docker 内看不到 Nano Banana

在容器内检查：

```bash
echo $GEMINI_API_KEY
claude mcp list
```

重新添加：

```bash
claude mcp add nanobanana --scope local -e KEY1="$GEMINI_API_KEY" -- uvx nanobanana-mcp-server@latest
claude mcp list
```

## 还是出现权限确认

确认启动命令包含：

```bash
claude --model qwen3.5-9b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

## shared mode 出现非预期变更

```bash
git status
git diff
```

shared mode 会直接修改真实项目。除非你确定要丢弃变更，否则不要运行破坏性 Git reset。

## Firebase deploy 失败

```bash
npx -y firebase-tools@latest login
npm run build
npx -y firebase-tools@latest deploy --only hosting
```

确认：

- `firebase.json` 的 `"public"` 是 `"dist"`
- 部署前 `npm run build` 成功
- 从普通 Mac 终端部署，而不是 Docker 内

## 本地模型没有切出 tmux 分屏

这是预期情况。本地 Ollama 模型通常在同一个 Claude Code 界面中运行 Agent Teams。

```bash
claude --model qwen3.5-9b-64k:latest --dangerously-skip-permissions --teammate-mode in-process
```

---

# 3. 快速参考

## 构建 Docker 镜像

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

## Docker 内设置

```bash
git config --global user.email "builder@local"
git config --global user.name "Builder"
claude mcp add nanobanana --scope local -e KEY1="$GEMINI_API_KEY" -- uvx nanobanana-mcp-server@latest
claude mcp list
```

## 自动化 Claude 启动

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

# 4. 附录：通俗术语

| 术语 | 含义 |
|:--|:--|
| Bind mount | 把电脑上的真实文件夹连接到 Docker 容器的方式。 |
| Container | Docker 创建的小型隔离软件环境。 |
| Docker | 在容器中运行软件的工具。 |
| Dockerfile | 创建 Docker 镜像的配方。 |
| Docker image | 由 Dockerfile 构建出的容器模板。 |
| 环境变量 | 程序启动前传入的设置。 |
| Firebase Hosting | Google 的网站发布服务。 |
| Git 检查点 | 可供之后比较或恢复的项目状态。 |
| Host computer | Docker 外面的真实电脑。 |
| MCP | 让 AI 代理人连接外部工具的方式。 |
| Nano Banana | 通过 Gemini 生成图片的 MCP 服务器。 |
| Ollama | 在自己电脑上运行 AI 模型的程序。 |
| Permission prompt | Claude Code 在编辑或执行命令前出现的确认。 |
| Sandbox | 限制软件可接触范围的受控工作区。 |
| Skip permissions | Claude Code 不再每次询问就执行工作的模式，必须搭配清楚边界。 |
| tmux | 把一个终端切成多个分屏的工具。 |

---

# 5. 已核对来源

本教程依据以下文件制作：

- `DockerAutomation_tutorial_EN.md`
- `DockerAutomation_transcript_v2.md`
- `ClaudeAgentSetupTutorial_EN.md`
- `NativeClaudeTeam_tutorial_CN.md`

参考信息：

- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [Claude Code model configuration](https://code.claude.com/docs/en/model-config)
- [Claude Code settings](https://code.claude.com/docs/en/settings)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Ollama Claude Code integration](https://docs.ollama.com/integrations/claude-code)
- [Docker bind mounts](https://docs.docker.com/engine/storage/bind-mounts/)
- [Docker Desktop networking](https://docs.docker.com/desktop/features/networking/networking-how-tos/)
- [Firebase Hosting quickstart](https://firebase.google.com/docs/hosting/quickstart)
- [Firebase CLI documentation](https://firebase.google.com/docs/cli)
