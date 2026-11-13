---
name: cospirit-pr
description: Open a pull request on a Cospirit repository (remote github.com:cospirit/*) - title convention, base branch, filling the repo's PR/changelog template, linked PRs, SQL, reviewers. Use whenever creating or editing a PR on a Cospirit repo.
---

# Opening a PR on a Cospirit repository

Applies to any repo whose `origin` is `github.com:cospirit/<repo>`. Use the `gh` CLI (logged in as `KAymeric`).
No Claude attribution anywhere (title, body, commits).

## 0. Input: the YouTrack ticket

The user always provides the YouTrack ticket, e.g.:

`lcspirit-1366 Lot 1.3 emails - Automatisation du contact régie`

The ticket id is the first token (`lcspirit-1366`). If no ticket was given, ask for it.

## 1. Code review first

Before creating anything, review the code that is about to go into the PR (`git diff <base>...HEAD`, plus uncommitted changes if any): bugs, regressions, security, leftovers (debug, dumps, commented code), missing migrations/translations, consistency with the surrounding code.
Report the problems found to the user and wait for their go before creating the PR. If nothing is found, say so explicitly.

## 2. Base branch

- `lc-spirit`: the latest release branch. Find it with
  `git fetch origin && git branch -r --list 'origin/release/*' | sed 's#.*origin/##' | sort -V | tail -1`
- Every other repo: the default branch (`master` or `main`, see `git symbolic-ref refs/remotes/origin/HEAD`).

## 3. Title

`[<ticket-id>] <commit message>`

- Single commit (or one obvious main commit): reuse its message as is, e.g. `[lcspirit-1366] feat(mail): add recipient from contactRegie`.
- Several commits: write a short English title in the same conventional style, deduced from the commits, e.g. `[lcspirit-1366] feat(mail): automate ad agency contact recipient`.

## 4. Body: fill the repo's own template

Read `.github/pull_request_template.md` of the current repo and keep its structure (headings, `---` separators, order). Remove the instruction HTML comments and every placeholder text.
Repos without a template (`dev-stack`, `docker-deployment`, `front-component`, `ml-client`): use the `Changelog` / `PRs liées` / `Ticket YouTrack` structure below.

### Changelog
Very short, in French. One single line. Only for a big PR with several distinct features: one line per feature (`- ...`).
Example: `Ajout automatique du contact régie en tant que recipient des nouveaux mails`

### PRs liées
- When the work spans several repos (e.g. back `cospirit-api` + front `back-office`/`cockpit`/`lc-spirit`), create one PR per repo, then edit each so that its "PRs liées" lists the other PR(s) as a list of full URLs:
  ```
  - https://github.com/cospirit/back-office/pull/233
  ```
  (Create all PRs first, then `gh pr edit <n> -R cospirit/<repo> --body-file ...` to add the cross-references.)
- Single PR: remove the whole section (heading and its `---` separator).

### Ticket YouTrack
Paste the ticket provided by the user as is, as a list item. Past PRs render it as
`- [lcspirit-1366](https://cospirit.myjetbrains.com/youtrack/issue/lcspirit-1366) Lot 1.3 emails - Automatisation du contact régie`
so if the user gave plain text, link the id that way and keep the rest of the text unchanged.

### Requête SQL
Put in it every SQL command when either:
- we worked on SQL queries during this work, or
- a PhpStorm database console is named after the ticket id: search case-insensitively in
  `~/.config/JetBrains/PhpStorm*/consoles/db/*/` for a file whose name contains the ticket id (e.g. `lcspirit-1366.sql`; use the most recent PhpStorm version if several match) and include all its commands.

Otherwise, ask the user whether the section can be removed. Never remove it without asking.

## 5. Labels

- Support / bugfix PRs: add the `bug` label (`--label bug`).

## 6. Reviewers

Same reviewers on every Cospirit repo: `Puillet`, `doninj`, `Jagagon`, `lotholf`, `jbdz`.
Never request the PR author (`KAymeric`) as reviewer.

## 7. Create it

Never as a draft unless the user asks for it. Show the user the title, base and body, then push the branch and run:

```bash
gh pr create --base <base> --title "<title>" --body-file <file> --reviewer Puillet,doninj,Jagagon,lotholf,jbdz [--label bug]
```

## 8. Always return the PR link

Once a PR is created, always send the user its full URL (e.g. `https://github.com/cospirit/back-office/pull/235`), alone on its own line at the top of your final message so it is easy to click. One line per PR when several were created. Never skip this, even when other steps (edits, cross-references) follow.
