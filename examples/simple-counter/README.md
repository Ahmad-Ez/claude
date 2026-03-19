# Simple Counter — Claude Code Sandbox Example

A minimal React + Vite app demonstrating the containerized Claude Code workflow.

## Quick Start

### 1. Open in Container

From this directory in VS Code:
```
Ctrl+Shift+P → Dev Containers: Reopen in Container
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Dev Server

```bash
pnpm dev
```

Visit `http://localhost:5173` in your browser.

### 4. Try Claude Code

Create a feature branch:
```bash
git checkout -b feature/enhancement origin/dev
```

Run Claude to modify the app:
```bash
claude -p "Add a button to increment by 10 and decrement by 10" \
  --dangerously-skip-permissions
```

Review the changes:
```bash
git diff origin/dev
```

Merge if satisfied.

## What's Here

- `src/App.jsx` — React counter component
- `src/App.css` — Styled counter UI
- `vite.config.js` — Vite build config
- `index.html` — HTML entry point
- `.devcontainer/devcontainer.json` — Container config

## Firewall Notes

The container only allows:
- npm (to install dependencies)
- GitHub (for git operations)
- Anthropic API (Claude)

You cannot make external API calls from inside the container unless you whitelist them in `docker/init-firewall.sh`.

## Next Steps

- Modify the counter logic in `src/App.jsx`
- Ask Claude to add features (local storage, animations, etc.)
- Use `git diff` to review before merging
- Push to your remote when happy
