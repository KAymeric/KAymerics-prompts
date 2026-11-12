#!/usr/bin/env bash
# Copy this machine's Claude Code config into the repo (machine -> repo).
set -euo pipefail

REPO="$(cd "$(dirname "$0")" && pwd)"
SRC="$HOME/.claude"
MEMORY="$SRC/projects/-home-aymeric-PhpstormProjects/memory"

mkdir -p "$REPO/claude/skills" "$REPO/memory"

cp "$SRC/CLAUDE.md" "$SRC/settings.json" "$REPO/claude/"

# Own skills only: skills/synced is managed by the Claude account.
for skill in "$SRC"/skills/*/; do
  name="$(basename "$skill")"
  [ "$name" = "synced" ] && continue
  rsync -a --delete "$skill" "$REPO/claude/skills/$name/"
done

rsync -a --delete --exclude node_modules "$SRC/local-mods/" "$REPO/claude/local-mods/"

[ -d "$MEMORY" ] && rsync -a --delete "$MEMORY/" "$REPO/memory/"

echo "Synced into $REPO"
