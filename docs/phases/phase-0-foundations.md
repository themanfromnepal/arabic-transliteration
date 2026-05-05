# Phase 0: Foundations

> **Status: ✅ Complete**

## Goal

Stand up an empty but production-shaped repository so that subsequent phases can build features
without revisiting tooling. By the end of this phase the static site scaffold boots, all quality
gates run locally and in CI, the Vercel project is linked, and the full documentation set is in
place.

## Inputs

- Locked tech stack as defined in [../tech-stack.md](../tech-stack.md) and
  [../adr/0001-tech-stack.md](../adr/0001-tech-stack.md).
- Decision to ship as a free and open-source MIT-licensed static site per
  [../adr/0002-no-backend-no-accounts-v1.md](../adr/0002-no-backend-no-accounts-v1.md).
- The canonical Git remote at `https://github.com/themanfromnepal/arabic-transliteration`.

## Deliverables

- Next.js 15 App Router scaffold (planned in this phase, implemented when the repo is bootstrapped).
- TypeScript configured in strict mode.
- Tailwind v4 with the shadcn/ui base layer installed.
- ESLint and Prettier wired with shared config.
- Vitest configured for unit tests; Playwright configured for end-to-end tests.
- GitHub Actions CI skeleton running lint, typecheck, test, and build.
- Vercel project linked to the repository with preview deployments on every PR.
- MIT `LICENSE` file at the repository root.
- The `docs/` suite, including this documentation set.

## Workstreams

1. Bootstrap the repository (initial commit, `.gitignore`, `LICENSE`, `README`).
2. Install the locked stack and pin compatible versions.
3. Configure quality gates (lint, format, typecheck, unit, e2e).
4. Wire CI in GitHub Actions with cached dependencies.
5. Link the Vercel project and confirm preview deploys.
6. Author the documentation set under `docs/`.

## Acceptance criteria

1. `npm run dev` boots a working Next.js page locally.
2. `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` all pass on a clean
   checkout.
3. CI is green on the first pull request.
4. A Vercel preview URL deploys successfully from a pull request.
5. All documentation files listed in [README.md](../README.md#documentation-map) are present in
   `docs/` and cross-link correctly.

## Risks and mitigations

| Risk                                    | Mitigation                                                   |
| --------------------------------------- | ------------------------------------------------------------ |
| shadcn/ui Tailwind v4 compatibility lag | Pin compatible versions and follow shadcn/ui release notes.  |
| CI cold-start time on every push        | Cache `node_modules` and Next.js build artifacts in Actions. |
| Tooling drift between contributors      | Commit shared ESLint, Prettier, and editor configs.          |

## Related decisions and docs

- [../adr/0001-tech-stack.md](../adr/0001-tech-stack.md)
- [../adr/0002-no-backend-no-accounts-v1.md](../adr/0002-no-backend-no-accounts-v1.md)
- [../tech-stack.md](../tech-stack.md)
- [../contributing.md](../contributing.md)
