---
name: cospirit-preprod
description: Put YouTrack tickets / PRs into preprod on Cospirit projects (github.com/cospirit - lc-spirit, back-office, cospirit-api, cockpit, ml-spirit) - find the PRs, merge them locally into preprod (or the latest lc-spirit release), then update the preprod PR descriptions (PRs liées, SQL, init_preprod.sh) and gather the new SQL in a PhpStorm console. Use whenever the user asks to put tickets/PRs in preprod.
---

# Putting tickets into preprod on Cospirit projects

## Absolute rules

- **Never deploy from the `docker-deployment` project. Never run anything there for a deployment, and never even suggest it.**
- Only for repos of the GitHub organization `cospirit` (https://github.com/cospirit).
- Projects concerned: `lc-spirit`, `back-office`, `cospirit-api`, `cockpit`, `ml-spirit` (local clones in `<config: projects_dir>/<repo>`).
- Never resolve a merge conflict yourself.
- Never close, merge (on GitHub) or approve a PR: feature PRs are only merged locally into the preprod branch for testing; they are merged into their base branch later by the team.
- Never push. The user tests and pushes.
- **Never execute the SQL queries yourself**, on any database (no PhpStorm SQL tool, no `psql`, no `docker compose exec ... psql`, nothing). You only write them into the PR descriptions and the PhpStorm console; the user runs them.
- No Claude attribution anywhere.

## Personal settings

Read `config.md` next to this file: it holds the projects directory, the PhpStorm consoles path and the preprod data sources, referred to below as `<config: ...>`.
If `config.md` does not exist, read `SETUP.md` next to this file, follow it, then continue here.

## Preprod branch per project

- `lc-spirit`: the latest release branch:
  `git fetch origin && git branch -r --list 'origin/release/*' | sed 's#.*origin/##' | sort -V | tail -1`
- Other projects: `preprod`.

The "preprod PR" of a project is the open PR whose head is that branch:
`gh pr list -R cospirit/<repo> --head <preprod branch> --state open --json number,url`.

## Input

A list of YouTrack tickets, one per line, e.g.:

`[pml-1042](https://cospirit.myjetbrains.com/youtrack/issue/pml-1042) Intégrer calculette pour presta dans le frais de prod Affichage`

The ticket id is the link text (`pml-1042`).

## Phase 1 - Merge into preprod (ticket by ticket)

Keep a running list of everything merged: ticket, repo, PR number, URL, head branch.

For each ticket, in the given order:

1. **Find its PRs.** Their title always contains `[<ticket-id>]`. Search every project:
   `gh pr list -R cospirit/<repo> --state open --search '"[<ticket-id>]" in:title' --json number,title,url,headRefName,baseRefName,mergeable,mergeStateStatus`
   Keep only titles that really contain `[<ticket-id>]` (case-insensitive). If none is found, tell the user and go on with the next ticket.
2. **Working copy check.** In each concerned project, `git status --porcelain` must be empty. If not, stop and tell the user (never stash, reset or discard their changes).
3. **Update the PR branch:** `git checkout <head branch> && git fetch && git pull`.
4. **Conflict warning.** Warn the user and wait for their decision on this ticket when all three are true:
   - the PR branch is not up to date with its base branch (`git merge-base --is-ancestor origin/<base> HEAD` fails),
   - none of its commits is on the preprod branch yet (`git log origin/<preprod branch>..HEAD` lists all the PR's commits, i.e. `git merge-base --is-ancestor` of any PR commit into `origin/<preprod branch>` fails for all of them),
   - GitHub reports conflicts with the base branch (`mergeable` is `CONFLICTING` / `mergeStateStatus` is `DIRTY`).
5. **Merge into preprod**, for each concerned project:
   `git checkout <preprod branch> && git pull && git merge --no-verify <head branch>`
6. **Conflict:** if the merge reports a conflict, stop. Tell the user there is a conflict and name the project(s) concerned (and the branch being merged). Do not touch the conflicted files, do not abort the merge. Wait until the user says the conflicts are resolved, check `git status` shows no merge in progress, then resume with the next project / ticket.
7. No conflict: go on with the next ticket.

**Migrations.** Before the first merge of the run, note the preprod HEAD of `cospirit-api` and `lc-spirit` (`git rev-parse HEAD` on the preprod branch). Once every ticket is merged, list the migration files added since then:
- `cospirit-api`: `git diff --name-only --diff-filter=A <noted HEAD>..HEAD -- migrations/`
- `lc-spirit`: `git diff --name-only --diff-filter=A <noted HEAD>..HEAD -- app/migrations/`

If any were added, tell the user which ones and propose to run `make development@migrations.apply` in the project(s) concerned. Run it only if the user says yes; never run it on your own.

When every ticket is merged: **do not push**. Give the user the list of merged PRs per project and pause: they test, then push. Wait until they say it is pushed (check `git status` / `git log origin/<preprod branch>..<preprod branch>` is empty).

## Phase 2 - Update the preprod PR descriptions (after the user pushed)

For each project that received merges, edit its preprod PR body (`gh pr view <n> -R cospirit/<repo> --json body -q .body` → edit a file in the scratchpad → `gh pr edit <n> -R cospirit/<repo> --body-file <file>`). Change only what follows, keep everything else byte for byte.

1. **Changelog**: never modify.
2. **PRs liées**: append the URL of each PR merged in this run as a list item (`- https://github.com/cospirit/<repo>/pull/<n>`), unless it is already listed. If the section does not exist (e.g. the lc-spirit release PR), ask the user where to add it.
3. **SQL**: for each merged PR, read its body. If it has a SQL section (`### Requête SQL` or `### SQL`), copy each of its queries into the `### SQL` section of the target preprod PR, unless the query is already there. Target:
   - `cospirit-api`, `ml-spirit`, `cockpit`, `back-office` PRs → the preprod PR of **cospirit-api** (all of them share its database);
   - `lc-spirit` PRs → the lc-spirit release PR.
   Add the queries inside the existing ```sql block, at its end. If the target has no SQL section, add one at the end of the body (`---` then `### SQL` and a ```sql block).
   Keep track of every query added in this run (only those).
4. **init_preprod.sh** (all projects except `lc-spirit`, which has no such section): in the `### Réinitialisation de la branche \`preprod\`` section, after the last `branches=` line of the script, add for each merged PR whose branch is not already listed:
   `branches="${branches} origin/<head branch>" # https://github.com/cospirit/<repo>/pull/<n>`

## Phase 3 - SQL console

If queries were added in Phase 2, create a new PhpStorm database console with only those queries (not the ones that were already there):
- path: `<config: phpstorm_consoles_dir><data source uuid>/preprod-<YYYY-MM-DD>.sql`, using the preprod data source from `<config: preprod_datasources>` for the database concerned (cospirit-api or lc-spirit). Add a `-2`, `-3`... suffix if the file exists.
- one file per database; group the queries by PR with a `-- <PR url>` comment above each group.
- never execute them (see Absolute rules): creating the console file is the only action.

## Phase 4 - Wrap-up

- Open each preprod PR that was modified in the user's browser: `gh pr view <n> -R cospirit/<repo> --web`.
- Give the user the list of merged PRs, grouped by ticket then project, with full URLs.
- If a console was created, tell the user its name and path, and that it appears in PhpStorm under *Scratches and Consoles > Database Consoles > <data source>* so they can open it.
- At the very end of the final message, give a Teams message ready to copy, listing the YouTrack tickets as the user provided them (only those actually put into preprod, in the given order).
  Teams does not render Markdown pasted as plain text, so never put it in a code block. Show it with the `show_widget` tool (call `read_me` first) as a card with a one-click "Copier pour Teams" button that copies it as rich text, so the ticket id stays a clickable link. Use exactly this widget, with one `<li>` per ticket (ticket id as the link text, the rest of the ticket text after it):

  ```html
  <h2 class="sr-only">Message Teams des tickets en preprod, avec un bouton pour le copier</h2>
  <div style="background: var(--surface-2); border: 0.5px solid var(--border); border-radius: 12px; padding: 1rem 1.25rem;">
    <div id="msg" style="font-size: 15px; line-height: 1.7; color: var(--text-primary);">
      <p style="margin: 0;">Bonjour, les tickets suivants sont en preprod :</p>
      <ul style="margin: 4px 0 0; padding-left: 20px;">
        <li><a href="https://cospirit.myjetbrains.com/youtrack/issue/pml-1042">pml-1042</a> Intégrer calculette pour presta dans le frais de prod Affichage</li>
      </ul>
    </div>
    <div style="display: flex; align-items: center; gap: 12px; margin-top: 12px;">
      <button id="copy"><i class="ti ti-copy" aria-hidden="true" style="margin-right: 6px;"></i>Copier pour Teams</button>
      <span id="status" style="font-size: 13px; color: var(--text-secondary);"></span>
    </div>
  </div>
  <script>
  const btn = document.getElementById('copy');
  const status = document.getElementById('status');
  btn.addEventListener('click', async () => {
    const el = document.getElementById('msg');
    const html = el.innerHTML;
    const text = el.innerText;
    try {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' })
      })]);
      status.textContent = 'Copié';
    } catch (e) {
      try {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges(); sel.addRange(range);
        const ok = document.execCommand('copy');
        sel.removeAllRanges();
        status.textContent = ok ? 'Copié' : 'Copie bloquée : sélectionne le texte et fais Ctrl+C';
      } catch (e2) {
        status.textContent = 'Copie bloquée : sélectionne le texte et fais Ctrl+C';
      }
    }
  });
  </script>
  ```

  Show this widget last, after the final text message. If `show_widget` is not available, fall back to rendered Markdown (not a code block) after a `---` line.
  If some tickets were skipped (no PR found, conflict not resolved...), leave them out and say so above the message. Never send it yourself.
