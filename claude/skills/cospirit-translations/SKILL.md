---
name: cospirit-translations
description: Add the translations of the current Cospirit work (ml-spirit, cockpit, back-office) - find the new translation keys in the local changes and write the SQL insert into a new PhpStorm console on the local back database, named after the YouTrack ticket. Use whenever the user asks to add / create the translations ("ajoute les traductions").
---

# Adding translations on Cospirit projects

## Absolute rules

- **Never execute the SQL query yourself** (no PhpStorm SQL tool, no `psql`, no `docker compose exec ... psql`). Creating the console file is the only action; the user runs it.
- No Claude attribution anywhere.

## Personal settings

Read `config.md` next to this file (`<config: ...>` below). If it does not exist, read `SETUP.md` next to this file, follow it, then continue here.

## Input

The YouTrack ticket, given like this:

`[pml-1129](https://cospirit.myjetbrains.com/youtrack/issue/pml-1129) Ajout contact prestataire`

The ticket id is the link text (`pml-1129`). If the ticket was not given in the conversation, **ask the user for it** before creating anything.

## Steps

1. **Context** from the application being worked on:
   - back-office → `bo`
   - cockpit → `ptf`
   - ml-spirit → `ml-spirit`
2. **Find the new keys** in our local changes (`git diff` + untracked files of the project, against its base branch if the work is already committed on the feature branch): every translation key newly used (e.g. `'key' | trans`, `"key" | trans`, `trans("key")`...) that did not exist before. Skip keys already used elsewhere in the project on the base branch (they already exist in the database). One line per new key.
3. **Target text**: the French translation, deduced from the context (mockup, label, usage). Escape single quotes by doubling them (`d''achat`).
4. **Create the console** `<config: phpstorm_consoles_dir><config: back_datasource uuid>/<ticket id>.sql` (e.g. `pml-1129.sql`). If it already exists, append the query to it instead of overwriting.
5. **Query format**, exactly:

   ```sql
   insert into translation (id, uuid, language_id, source, target, context) values
   (nextval('translation_id_seq'), gen_random_uuid(), 1, 'translationKey', 'Traduction', 'contexte'),
   (nextval('translation_id_seq'), gen_random_uuid(), 1, 'otherKey', 'Autre traduction', 'contexte')
   ;
   ```

   One row per new translation, comma-separated, `;` alone on the last line.
6. **Wrap-up**: list the keys with their translation, give the console name and path, and tell the user it appears in PhpStorm under *Scratches and Consoles > Database Consoles > cospirit@localhost*. Ask them to check the French texts.
