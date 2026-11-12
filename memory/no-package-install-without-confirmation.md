---
name: no-package-install-without-confirmation
description: Never add or install a package/dependency without asking the user first
metadata:
  node_type: memory
  type: feedback
  originSessionId: a5b5b28b-c5e6-4817-b0d8-2d5175c6af46
  modified: 2026-11-09T14:24:00.332Z
---

Never add a package to package.json / composer.json or install one (npm, composer, etc.) without asking the user for confirmation first.

**Why:** I added `sass` to back-office devDependencies on my own to support SCSS files; the user was angry and had me remove it immediately.

**How to apply:** If a change needs a new dependency, stop and ask before touching the manifest or running an install; propose an alternative that uses existing deps when possible.
