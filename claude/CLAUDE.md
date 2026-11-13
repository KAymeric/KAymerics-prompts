# Global instructions

## Command execution: always inside containers

All projects run in Docker containers. Never run project commands (php, composer, bin/console, npm, yarn, node, phpunit, etc.) directly in the host machine's terminal.

1. First read the project's `Makefile` to find an existing target for what you need, and run it with `make <target>`.
2. If no target fits, run the command directly in the container: `docker compose exec <service> <command>` (check `docker-compose.yml` / `compose.yaml` for the service name).
3. Only plain host-level tooling (git, file reads/search, docker/make themselves) runs on the host.

## Commits and pull requests: no Claude attribution

- Never add a `Co-Authored-By:` line for Claude in commit messages.
- Never add "Generated with Claude Code" (or any similar mention) to commit messages or PR descriptions.
- No attribution to Claude of any kind in commits or PR descriptions (no trailers, no links, no emoji signatures).

## Deployments: never from docker-deployment

Never deploy from the `docker-deployment` project (github.com:cospirit/docker-deployment), never run its deployment commands, and never suggest doing so. Deployments are always done by the user.

## Preprod on Cospirit repos

To put tickets/PRs into preprod on Cospirit projects, always follow the `cospirit-preprod` skill (`~/.claude/skills/cospirit-preprod/SKILL.md`).

## Pull requests on Cospirit repos

For any repo whose remote is `github.com:cospirit/*`, always follow the `cospirit-pr` skill (`~/.claude/skills/cospirit-pr/SKILL.md`) to create a PR: base branch, title convention, filling the repo's template, labels and reviewers.

## Personal config repo: KAymerics-prompts

My Claude Code config lives in the private repo `github.com:KAymeric/KAymerics-prompts` (local clone: `~/PhpstormProjects/KAymerics-prompts`).
Whenever we create or change a skill, mod, global CLAUDE.md, global settings or memory, run its `./sync.sh`, then commit and push to that repo without asking (conventional commit message, no Claude attribution). Clone it first if missing.
