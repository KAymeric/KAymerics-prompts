---
name: cospirit-youtrack
description: Read or update a Cospirit YouTrack ticket through the REST API (https://cospirit.myjetbrains.com/youtrack) - read a ticket, move it to a board column (State), add the user as assignee. Use whenever a YouTrack ticket must be read or updated, including from the cospirit-pr and cospirit-preprod skills.
---

# YouTrack (Cospirit)

- Instance: `https://cospirit.myjetbrains.com/youtrack`
- Token: in `~/.config/youtrack/token`, created by the user. If it is missing, tell the user and stop the YouTrack step (never ask them to paste the token in the chat).

## Absolute rules

- **The token is secret.** Never print, echo, log, copy or commit it, never put it in a file, a variable shown in output, a URL or an env var in `~/.claude`. Only ever use it inline as `$(cat ~/.config/youtrack/token)` inside the curl header, so the command never contains its value.
- **Never modify a ticket's content (description, comments, attachments), title (summary) or tags.** Nothing else than what the rules below allow: moving it to a column (State) and adding the user as assignee, each only when the user's rules or answer call for it.
- Never remove anyone from the assignees, never change other fields.

## Calls

```bash
YT=https://cospirit.myjetbrains.com/youtrack/api
AUTH="Authorization: Bearer $(cat ~/.config/youtrack/token)"
```
(Set both in the same command as the curl; never `echo "$AUTH"`.)

- **Read a ticket** with its fields and the possible values of each:
  `curl -sf -H "$AUTH" -H 'Accept: application/json' "$YT/issues/<id>?fields=idReadable,summary,customFields(name,value(name,login),projectCustomField(bundle(values(name))))"`
- **Current user**: `curl -sf -H "$AUTH" "$YT/users/me?fields=login,fullName"`
- **Apply a command** (state change, assignee):
  `curl -sf -H "$AUTH" -H 'Content-Type: application/json' -X POST "$YT/commands" -d '{"query":"<command>","issues":[{"idReadable":"<id>"}],"silent":false}'`

## Move a ticket to a column

Board columns are values of the `State` field. The user's column names map to these State values:

| Column (user's words) | State value |
|---|---|
| À vérifier | `To Verify` |
| En recette | `Staging` |

1. Read the ticket and take the State field's possible values.
2. Use the mapping above; for any other column, match it against the values ignoring case and accents. If the value is not among the ticket's possible values, or nothing / several match, ask the user which value to use.
3. If the ticket is already in that state, do nothing. Otherwise apply `State <value>` (wrap a multi-word value in braces: `State {To Verify}`).
4. Read it again to check the new state, and report it.

## Add the user as assignee

1. Read the ticket; the assignee field is `Assignee` (multi-user). If a project has none, ask.
2. If the user (`users/me` login) is already in it, do nothing.
3. Otherwise apply `add <field name> me` for a multi-value field, `<field name> me` only if the field is single-value **and empty** (never replace someone else: ask the user instead).
4. Read it again to check, and report it.
