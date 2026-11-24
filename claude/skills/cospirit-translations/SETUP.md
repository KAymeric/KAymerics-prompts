# cospirit-translations setup

Only read when `config.md` is missing. Creates it once.

1. PhpStorm consoles directory of the most recent PhpStorm version:
   - Linux: `~/.config/JetBrains/PhpStorm*/consoles/db/`
   - macOS: `~/Library/Application Support/JetBrains/PhpStorm*/consoles/db/`
   - Windows: `%APPDATA%/JetBrains/PhpStorm*/consoles/db/`
2. Back data source: read `<projects dir>/cospirit-api/.idea/dataSources.xml` (`name` and `uuid` of each `data-source`). Propose the local one (name containing `localhost`, not `universe` or `auth`); ask the user if unsure.
3. Write `config.md` next to `SKILL.md` with `phpstorm_consoles_dir` and `back_datasource`, show it to the user, and continue with the skill.
