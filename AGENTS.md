# Portfolio Repository Guidance

## Validate and ship

- For app-wide changes, run `npm run lint`, `npm run typecheck`, and `npm run build`; use narrower relevant checks for scoped changes.
- After validation, commit and push only the completed task's files to the current remote branch. Preserve unrelated changes; never ship partial or failing work, secrets, or credentials.
- If publishing is blocked, report why and leave the validated commit intact locally.

## Maintain these instructions

- Keep only durable, repository-specific rules that address repeated friction, a non-obvious constraint, or a verified workflow.
- When editing this file, remove stale, duplicated, speculative, or tool-default guidance and verify every referenced command. Put detailed workflows in linked documentation and subtree-only rules in a nested `AGENTS.md`.
