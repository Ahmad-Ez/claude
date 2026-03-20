# Claude Code Sandbox — Automated Setup

This prompt automates the entire setup process. Run it with:

```bash
claude -p "$(cat AUTOMATION.md)" --dangerously-skip-permissions --max-turns 30
```

---

You are setting up Claude Code to run autonomously inside a containerized sandbox for a developer. Your job is to:

1. Ask the user about their preferences (auth, timezone, examples)
2. Build the Docker image with their timezone
3. Initialize a simple example project
4. Verify everything works

**Do NOT execute any of these steps until you have gathered all preferences and gotten explicit approval.**

## Phase 1: Gather Preferences

Ask the user these questions and wait for their answers before proceeding:

1. **Authentication method:**
   - Central auth (all containers share one login, recommended)
   - Per-container auth (each container logs in separately, more isolated)

2. **Timezone** (for container system time):
   - Ask the user to provide their timezone (e.g., `America/New_York`, `Asia/Tokyo`, `Europe/London`, `Africa/Cairo`)
   - No default — always ask

3. **Create an example project?**
   - Yes: set up a minimal React counter app
   - No: just set up the sandbox infrastructure

4. **Confirm this is the correct working directory:**
   - Show the current directory path
   - Ask user to confirm before proceeding

## Phase 2: Confirmation

Once you have all preferences, summarize them and ask for explicit approval before executing.

Example summary:
```
=== Setup Summary ===
Auth method: Central (shared login)
Timezone: Africa/Cairo
Example project: Yes (React counter)
Working directory: /path/to/project
Ready to proceed? (yes/no)
```

## Phase 3: Execute (ONLY after approval)

Once approved, perform these steps:

### Step 1: Verify host authentication
```bash
test -d ~/.claude && echo "✓ Found ~/.claude" || echo "✗ Need to authenticate first: curl -fsSL https://claude.ai/install.sh | bash"
```

If `~/.claude` doesn't exist, **stop and instruct the user to authenticate on their host machine first.**

### Step 2: Build the Docker image

```bash
cd docker/
docker build -t claude-sandbox:latest .
```

If the image already exists, skip this step.

Verify:
```bash
docker images | grep claude-sandbox
```

### Step 3: Update `.devcontainer/devcontainer.json` for auth preference

- **Central auth:** Use bind mount `"source=${localEnv:HOME}${localEnv:USERPROFILE}/.claude,target=/home/node/.claude,type=bind"`
- **Per-container:** Use named volume `"source=claude-code-config-${devcontainerId},target=/home/node/.claude,type=volume"`

The `${localEnv:HOME}${localEnv:USERPROFILE}` variable resolves automatically — no username needed.

### Step 4: (Optional) Create example project

If the user chose "Yes" for example project:

Create `examples/simple-counter/.devcontainer/devcontainer.json` (copy from root `.devcontainer/` template).

Then create `examples/simple-counter/package.json`:
```json
{
  "name": "simple-counter",
  "version": "1.0.0",
  "description": "A minimal React counter app",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.0.0"
  }
}
```

Create `examples/simple-counter/src/App.jsx`:
```jsx
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Counter: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

Create `examples/simple-counter/src/main.jsx`:
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

Create `examples/simple-counter/index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Counter App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### Step 5: Verify setup

Run these checks:
```bash
docker images | grep claude-sandbox  # verify image exists
test -f .devcontainer/devcontainer.json && echo "✓ devcontainer config found"
```

If example project was created:
```bash
test -f examples/simple-counter/package.json && echo "✓ Example project created"
```

## Phase 4: Success Summary

Once all steps complete, show:
```
✅ Docker image built: claude-sandbox:latest
✅ Container config ready: .devcontainer/devcontainer.json
✅ Authentication: [central/per-container]
✅ Timezone: [user's timezone]
```

Then provide next steps:
```
Next steps:
1. Open this project in VS Code
2. Ctrl+Shift+P → "Dev Containers: Reopen in Container"
3. Inside the container, try: claude --version

To run Claude autonomously:
  git checkout -b feature/task origin/dev
  claude --dangerously-skip-permissions
```

---

## Error Handling

If Docker build fails:
- Check Docker Desktop is running
- Check `docker/Dockerfile` exists and is valid
- Show the Docker error to the user

If auth is missing:
- Tell user to run: `curl -fsSL https://claude.ai/install.sh | bash` on their host machine
- Stop execution until they confirm auth is set up

If user denies confirmation at Phase 2:
- Ask what they'd like to change
- Loop back to Phase 1

---

**Remember:** Do NOT run Phase 3 until the user explicitly confirms in Phase 2.
