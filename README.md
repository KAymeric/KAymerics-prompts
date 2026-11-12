# KAymeric's prompts

My Claude Code configuration, skills and mods, to find them on any machine.

## Content

| Path | Installed to | What |
|---|---|---|
| `claude/CLAUDE.md` | `~/.claude/CLAUDE.md` | Global instructions (containers, no attribution, Cospirit PRs) |
| `claude/settings.json` | `~/.claude/settings.json` | Global settings (attribution off, local-mods marketplace) |
| `claude/skills/` | `~/.claude/skills/` | Personal skills (`cospirit-pr`, ...) |
| `claude/local-mods/` | `~/.claude/local-mods/` | Local plugin marketplace (`usage-blueprint` band) |
| `memory/` | project memory folder | Claude's memories (feedback, project notes) |

Skills synced by the Claude account (`~/.claude/skills/synced`), credentials and history are not stored here.

## Usage

Save this machine's config into the repo:

```bash
./sync.sh && git add -A && git commit -m "chore: sync config" && git push
```

Install on a new machine (existing files are backed up first):

```bash
./install.sh
```
