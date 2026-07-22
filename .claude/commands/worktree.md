---
description: Create a git worktree for a requirement and implement it there
argument-hint: <requirement description>
---

Requirement: $ARGUMENTS

Do this:

1. Pick a short kebab-case name for the requirement (e.g. `pause-menu`, `high-scores`, `visual-themes`). Base it on the requirement content, not a generic name.
2. From repo root, create the worktree on a new branch:
   ```
   git worktree add .trees/<name> -b <name>
   ```
3. `cd .trees/<name>` and treat it as the working directory for everything below — all reads, edits, installs, tests, and commits happen there, not in the main tree.
4. Run `pnpm install` in the worktree (node_modules is not shared).
5. Implement the requirement in full, following this repo's `CLAUDE.md` conventions (module boundaries in `src/`, tests co-located per module, tunables in `constants.ts`, etc).
6. Run `pnpm typecheck` and `pnpm test` in the worktree; fix failures before finishing.
7. Report what changed and the worktree path. Do not merge or delete the worktree — leave that decision to the user.
