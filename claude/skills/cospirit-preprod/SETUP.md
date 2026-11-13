# cospirit-preprod setup

Only read when `config.md` is missing. Creates it once, then the skill never reads this file again.

1. Check `gh auth status`. If not logged in, ask the user to run `! gh auth login` and wait.
2. Find the directory holding the local clones of `cospirit-api`, `lc-spirit`, `back-office`, `cockpit`, `ml-spirit` (ask the user if not obvious).
3. PhpStorm consoles directory of the most recent PhpStorm version:
   - Linux: `~/.config/JetBrains/PhpStorm*/consoles/db/`
   - macOS: `~/Library/Application Support/JetBrains/PhpStorm*/consoles/db/`
   - Windows: `%APPDATA%/JetBrains/PhpStorm*/consoles/db/`
4. Preprod data sources: read `<project>/.idea/dataSources.xml` of `cospirit-api` and `lc-spirit` (`name` and `uuid` attributes of each `data-source`). Propose the one whose name contains `preprod`; if there is none or several, ask the user which one to use.
5. Write `config.md` next to `SKILL.md` from `config.example.md`, show it to the user, and continue with the skill.
