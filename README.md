# Claude Code Containerized Sandbox

Run Claude Code autonomously inside an isolated Docker container with network firewall restrictions. Share code generation safely with friends.

**Key features:**
- 🔒 OS-level isolation (Docker container)
- 🛡️ Network firewall (whitelist GitHub, npm, Anthropic API only)
- 💻 Per-project dev containers
- 🔐 Central auth (single login, shared across projects)
- ↩️ Git branch safety net (rollback any changes)

---

## Quick Start

### 1. Prerequisites

- Docker Desktop (Windows 11 with WSL2 enabled)
- VS Code + Dev Containers extension
- Authenticate Claude Code once on your host:
  ```bash
  curl -fsSL https://claude.ai/install.sh | bash
  ```
  This stores credentials in `~/.claude/` which containers can access.

### 2. Build the Docker Image Once

```bash
cd docker/
docker build -t claude-sandbox:latest .
```

Takes ~3–5 minutes. You only do this once (or when updating Claude Code).

**Customize the timezone:** Edit `docker/Dockerfile`, change `ARG TZ=Africa/Cairo` to your location (e.g., `America/New_York`, `Asia/Tokyo`). Then rebuild.

### 3. Add Container Config to Your Project

Copy `.devcontainer/devcontainer.json` to your project:

```
your-project/
  .devcontainer/
    devcontainer.json
```

Or create `.devcontainer/` and copy the template from this repo.

### 4. Open in VS Code

1. Open your project folder in VS Code
2. `Ctrl+Shift+P` → **"Dev Containers: Reopen in Container"**
3. Wait for startup (near-instant, image already built)
4. You're isolated and ready to work

### 5. Create a Git Branch, Run Claude

```bash
git checkout --no-track -b feature/my-task origin/dev

# Interactive mode (you control the task)
claude --dangerously-skip-permissions

# Fully autonomous (pass a task prompt, Claude runs it)
claude -p "Implement the login page according to specs" \
  --dangerously-skip-permissions \
  --max-turns 80
```

Review the diff, merge only when satisfied. Claude never pushes.

---

## Authentication Options

### Option A: Central Auth (Recommended)

All containers share your host's `~/.claude/` credentials. Set once, use everywhere.

The `.devcontainer/devcontainer.json` is pre-configured for this:
```json
"source=${localEnv:HOME}${localEnv:USERPROFILE}/.claude,target=/home/node/.claude,type=bind"
```

Just replace `<username>` with your Windows username if needed.

### Option B: Per-Container Auth

Each container has isolated credentials (more storage overhead, but completely isolated).

Edit `.devcontainer/devcontainer.json`:
```json
"source=claude-code-config-${devcontainerId},target=/home/node/.claude,type=volume"
```

Then authenticate inside each container:
```bash
claude  # follow login prompts
```

---

## Network Firewall

The container blocks **all outbound traffic except:**

| Allowed | Blocked |
|---------|---------|
| GitHub (all IP ranges) | Social media |
| npm (registry.npmjs.org) | External APIs |
| Anthropic API | Crypto, ad networks |
| Google Cloud Storage | Everything else |
| Statsig | |
| VS Code marketplace | |
| Localhost + host network | |

To whitelist your own domain (e.g., a backend API), edit `docker/init-firewall.sh`, add your domain to the `for domain in` loop, then rebuild:

```bash
for domain in \
    "your-api.example.com" \
    "registry.npmjs.org" \
    # ... rest
```

---

## File Structure

```
.
├── README.md                      # This file
├── AUTOMATION.md                  # Prompt for automated setup with Claude
├── .gitignore                     # Excludes .claude/ auth directory
├── docker/
│   ├── Dockerfile                 # Container image definition
│   └── init-firewall.sh          # Network firewall script
├── .devcontainer/
│   └── devcontainer.json         # Template for projects
└── examples/
    └── simple-counter/           # Example project (React)
        ├── src/
        ├── package.json
        └── .devcontainer/
            └── devcontainer.json
```

---

## Automation: Set Up with Claude Code

For friends who want to automate the entire setup, use the prompt in [AUTOMATION.md](./AUTOMATION.md).

```bash
claude -p "$(cat AUTOMATION.md)" \
  --dangerously-skip-permissions \
  --max-turns 30
```

This will:
1. Ask about authentication preference (central vs per-container)
2. Ask for your timezone
3. Guide you through setup preferences
4. Build the Docker image
5. Set up example project with proper config

---

## Troubleshooting

**Docker container won't start**
- Docker Desktop → Settings → General → ensure "Use the WSL 2 based engine" is enabled
- Restart Docker Desktop

**Firewall blocks my backend API**
- Add your domain to `docker/init-firewall.sh`
- Run `Ctrl+Shift+P` → "Dev Containers: Rebuild Container"

**Claude can't find API key**
- Ensure you ran `curl -fsSL https://claude.ai/install.sh | bash` on your host first
- Or run `claude` inside the container to authenticate locally

**`pnpm` not found**
- Already included in the Dockerfile — restart your container

---

## Security

- ✅ `--dangerously-skip-permissions` is **only safe inside a container**
- ✅ Never use it on your host machine
- ✅ Git branch = rollback safety net
- ✅ Firewall = network safety net
- ✅ Don't commit `.claude/` or `.env` files (already in `.gitignore`)

---

## For Friends

Share this repo with friends who want to try autonomous Claude Code. They can:

1. Clone this repo
2. Follow "Quick Start" above, **OR**
3. Run the automated setup prompt (`AUTOMATION.md`)

Both paths are safe — the container and git branch prevent any unintended changes.

---

## Questions?

- Claude Code docs: `claude /help`
- Report issues: [anthropic/claude-code](https://github.com/anthropics/claude-code/issues)
