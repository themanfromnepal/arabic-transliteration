# Contributing

## Welcome

Contributions are welcome from anyone whose work aligns with the project's mission: helping
English speakers bridge sound and script in Quranic Arabic. The project is free and open-source
under the MIT license, and it is built and curated in public so that learners and reviewers can
trace every change.

## Code of conduct

The project follows the spirit of the Contributor Covenant v2.1: respectful collaboration, good
faith review, and zero tolerance for harassment. Maintainers will moderate discussions in pull
requests, issues, and any future community channels accordingly.

> Assumption: The project adopts Contributor Covenant v2.1; a separate `CODE_OF_CONDUCT.md` will
> be added pre-launch.

## Ways to contribute

- Dictionary curation, which is the most needed form of contribution.
- Bug reports with clear reproduction steps.
- Feature suggestions, provided they align with the mission stated in [vision.md](vision.md).
- Documentation improvements across the `docs/` tree.
- Accessibility audits and findings against the WCAG 2.2 AA target.
- Translations of the user interface to other languages (post-v1 only).

## Repository setup

Clone the repository at `https://github.com/themanfromnepal/arabic-transliteration`, install
Node.js 22 LTS (use `nvm use` to match `.nvmrc`), run `npm install`, and start the
development server with `npm run dev`. These commands are illustrative; the canonical setup
instructions live next to the project's package manifest once it is created.

## Branching, commits, PRs

- Use short-lived feature branches off `main`; do not maintain long-running branches in v1.
- Name branches as `type/short-description`, for example `fix/translit-edge-case` or
  `data/lemma-curation-batch-3`.
- Use Conventional Commits for commit messages: `feat:`, `fix:`, `docs:`, `chore:`, `data:`.
- Pull requests use a template with a description, a linked issue, screenshots for any user
  interface change, and a checklist for the relevant tests.
- At least one approving review is required before merge.

## Dictionary contributions

Dictionary changes follow the curation workflow described in
[data-pipeline.md](data-pipeline.md#curation-workflow), including the CSV round-trip and the
expectation that reviewers are literate in Quranic Arabic. Pull requests that touch curated
entries are reviewed by maintainers with the required expertise before merge.

## Local quality checks

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run e2e`
- `npm run build`

CI runs the same gates on every pull request; see
[testing-strategy.md](testing-strategy.md#ci-gates) for the full table.

## Reporting bugs / vulnerabilities

Functional bugs are reported through GitHub Issues in the canonical repository. Suspected
security vulnerabilities are reported privately through the channel defined in
[security.md](security.md#reporting-policy) rather than as public issues.

## Licensing

Contributions to project code are accepted under the MIT license, which matches the project
license; contributors retain copyright in their work. Data submissions remain subject to the
licenses of the upstream sources from which they are derived; see
[data-pipeline.md](data-pipeline.md#licensing-and-attribution) for the source-by-source terms.
Code contributions are accepted under MIT. Data contributions derived from upstream sources may
be subject to a separate, more restrictive license — see
[ADR-0007](adr/0007-data-licensing-strategy.md) and
[data-pipeline.md](data-pipeline.md#licensing-and-attribution).

## Out of scope

> Out of scope: a Contributor License Agreement in v1 (revisit if and when the project's needs
> change) and any paid contributor program.
