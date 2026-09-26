# DevStation Local AI Proxy

The hosted DevStation runs on GitHub Pages, while Ollama runs on your laptop. Browsers block the direct cross-origin request to Ollama, so this tiny local proxy sits between them.

## Requirements

- Node.js 18+ (Node 20+ recommended)
- Ollama running on the laptop
- The selected model installed, for example `qwen2.5-coder:7b`

## Start

From the repository root:

```bash
node local-ai-proxy/server.mjs
```

Keep that terminal open while using Local AI.

The proxy listens on:

```
http://127.0.0.1:8787
```

Health check:

```
http://127.0.0.1:8787/health
```

Then open the hosted DevStation and use **Local AI**.

## What it does

```
GitHub Pages workstation
        |
        | HTTP
        v
127.0.0.1:8787 local proxy
        |
        | HTTP
        v
Ollama :11434
        |
        v
qwen2.5-coder:7b
```

The proxy does not expose Ollama to the public internet. It listens only on the laptop's loopback interface.
