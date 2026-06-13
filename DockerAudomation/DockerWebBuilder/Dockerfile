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
