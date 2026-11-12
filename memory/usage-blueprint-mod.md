---
name: usage-blueprint-mod
description: "Where the user's usage-band Claude Code mod lives and how it is installed"
metadata:
  node_type: memory
  type: project
  originSessionId: 8601bd55-b96b-4369-bee7-3239cd4a0423
  modified: 2026-11-06T14:49:55.723Z
---

The user's "usage-blueprint" mod (band above the prompt: model, tokens, 5h/weekly limits, cost; roomy layout in terminal, compact one-line in the app) is installed at user scope since 2026-11-06 from a local marketplace `local-mods` at `/home/aymeric/.claude/local-mods/` (plugin folder `usage-blueprint/`).

**Why:** the user wants it on every conversation, terminal and desktop app alike.

**How to apply:** edit the copy in `~/.claude/local-mods/usage-blueprint/`, bump `version` in its plugin.json, then `claude plugin marketplace update local-mods` and `claude plugin update usage-blueprint@local-mods` — the installed copy is cached under `~/.claude/plugins/cache/`. No `CLAUDE_CODE_PLUGIN_DIRS` line in ~/.zshrc anymore (removed to avoid double loading).
