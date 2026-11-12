#!/usr/bin/env bash
# Install the repo's Claude Code config on a machine (repo -> machine).
# Existing files are backed up to ~/.claude/backups/prompts-<date>/ first.
set -euo pipefail

REPO="$(cd "$(dirname "$0")" && pwd)"
DEST="$HOME/.claude"
BACKUP="$DEST/backups/prompts-$(date +%Y%m%d-%H%M%S)"

mkdir -p "$DEST/skills" "$BACKUP"

for f in CLAUDE.md settings.json; do
  [ -f "$DEST/$f" ] && cp "$DEST/$f" "$BACKUP/"
done
[ -d "$DEST/local-mods" ] && cp -r "$DEST/local-mods" "$BACKUP/"

cp "$REPO/claude/CLAUDE.md" "$DEST/CLAUDE.md"
# settings.json holds absolute paths to this home directory.
sed "s#/home/aymeric#$HOME#g" "$REPO/claude/settings.json" > "$DEST/settings.json"

for skill in "$REPO"/claude/skills/*/; do
  name="$(basename "$skill")"
  [ -d "$DEST/skills/$name" ] && cp -r "$DEST/skills/$name" "$BACKUP/"
  rsync -a --delete "$skill" "$DEST/skills/$name/"
done

rsync -a --delete "$REPO/claude/local-mods/" "$DEST/local-mods/"

echo "Installed. Backup of previous files: $BACKUP"
echo "Memory files are in $REPO/memory: copy them into the project's memory folder if needed."
echo "Then run: claude plugin marketplace update local-mods && claude plugin install usage-blueprint@local-mods"
