# cospirit-pr setup

Only read when `config.md` is missing. Creates it once, then the skill never reads this file again.

1. Check `gh auth status`. If not logged in, ask the user to run `! gh auth login` and wait.
2. Get the GitHub login: `gh api user -q .login`.
3. Ask the user (one AskUserQuestion call):
   - the GitHub logins of their reviewers (excluding themselves);
   - the YouTrack issue URL prefix, proposing `https://cospirit.myjetbrains.com/youtrack/issue/` by default.
4. PhpStorm consoles glob, from the OS:
   - Linux: `~/.config/JetBrains/PhpStorm*/consoles/db/*/`
   - macOS: `~/Library/Application Support/JetBrains/PhpStorm*/consoles/db/*/`
   - Windows: `%APPDATA%/JetBrains/PhpStorm*/consoles/db/*/`
5. Write `config.md` next to `SKILL.md` from `config.example.md`, show it to the user, and continue with the skill.
