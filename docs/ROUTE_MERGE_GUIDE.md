# Route merge & similarity workflow (developer guide)

Purpose: help maintainers review and safely merge near-duplicate routes/components discovered by the fuzzy similarity scan.

Quick checklist
- Run the similarity scan: `npm run check:routes -- --similar` or `npx ts-node scripts/find-duplicate-routes.ts --fuzzy`.
- Generate a human-friendly report: `npm run report:similarity -- 25`.
- Inspect the top candidates using the VS Code diff helper: `npm run open:route-diff -- <index>`.
- For a candidate you want to merge, run the propose tool to create a branch and append only missing exports: `npm run propose:route-merges -- --top 1 --branch my/route-merge`.
- Review the branch, run tests and typecheck, then push and open a PR.

Typecheck gate
- The proposer will run `npm run typecheck` before committing changes. If typecheck fails the commit is aborted to keep the branch green. Use `--skip-checks` with the proposer to override this (not recommended).

Why this is safe
- The proposer script only appends missing named/default exports from the source file into the chosen target. It does not rewrite internal function bodies or attempt semantic merges.
- Deletion of weaker files is disabled by default. Use `--delete` explicitly and only after manual review.

Recommended review steps
1. Open the candidate in a diff: `npm run open:route-diff -- <index>`.
2. Confirm the exports you expect to keep/merge. If the files are simple re-exports or identical components, the proposer will likely find no new exports (no-op).
3. Run the project's typecheck and tests locally before approving the PR:

```powershell
npm run typecheck
npm test || npm run test:e2e  # adjust to your test runner
```

Creating the PR (manual but recommended)
1. Push the created branch:

```powershell
git push -u origin <branch-name>
```

2. Create a PR with the GitHub CLI or UI:

```powershell
gh pr create --fill --title "chore: propose route merges" --body-file SIMILARITY_REPORT.md
```

If the proposer made no changes (no new exports), the branch will be empty; this often means one file is richer or they are already canonical.

CI/automation ideas
- Add a scheduled workflow that runs the fuzzy scan weekly and opens an issue with top candidates for human triage.
- Gate any automated `--delete` PRs behind a successful typecheck and test run.

Where to look
- `SIMILARITY_REPORT.md` — top N candidate pairs (human-friendly links)
- `.route-similarity.json` — raw machine-readable candidates
- `scripts/propose-route-merges.ts` — the proposer script (AST-based, uses `ts-morph`)
- `scripts/open-vscode-diff.ts` — open file diffs quickly in VS Code

Safety note: always run tests and typecheck before merging. Keep backups in `.route-merge-backups` (created automatically by scripts).
