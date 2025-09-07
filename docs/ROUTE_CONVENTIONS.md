# Route Conventions

This document describes the canonical routing rules for this Next.js project and how to avoid duplicate routes.

1. Prefer the `app/` directory for route definition when using Next 13+ App Router features (server components, streaming, layouts).
2. The `pages/` directory is legacy. If both `app/` and `pages/` implement the same route, `app/` is the canonical source.
3. File to route mapping rules:
   - `app/foo/page.tsx` -> `/foo`
   - `pages/foo/index.tsx` -> `/foo`
   - `pages/foo.tsx` -> `/foo`
   - dynamic segments should use `[param]` consistently in both directories.
4. Avoid exporting multiple route handlers or multiple default exports for the same path.
5. Use shared components in `src/components` or `components/` and import them into route files; do not duplicate code across route files.
6. When merging duplicates:
   - Keep the file with the highest "content richness" (length, component count, live fetches).
   - Move missing helper snippets from weaker files into the canonical file inside a commented `MERGED FROM <path>` block.
   - Add the banner comment `// ROUTE CANONICAL — merged from [paths], see docs/ROUTE_CONVENTIONS.md` at the top of the canonical file.
7. Testing and navigation updates:
   - Update any navigation components or tests that reference removed files to point to canonical routes.

Troubleshooting
--------------
- Dynamic routes: If duplicates occur for dynamic routes (e.g., `/posts/[id]`), prefer `app/` implementation unless `pages/` uses special `getServerSideProps` behavior not present in `app/`.
- I18n: If localized routes are present under a locale prefix, treat each locale's route as a separate route for de-duplication purposes.

Automation
----------
The repository contains `scripts/find-duplicate-routes.ts`. It scans `app/` and `pages/`, ranks duplicates, and emits `.route-duplicates.json` with a recommended keep/delete plan. Use `--apply` to attempt best-effort merges (backups placed in `.route-merge-backups/`).

Pre-commit hook
---------------
We recommend installing `husky` and enabling the provided `.husky/pre-commit` to block commits that introduce new duplicate routes.
