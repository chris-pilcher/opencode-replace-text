# Contributing

## Pull requests

1. Fork the repo and create a feature branch off `main`
2. Make your changes
3. Run `make format` to format code
4. Run `make lint` to verify formatting
5. Run `make test` to verify tests pass
6. Push to your fork and open a PR

## Branch naming

Branches follow the same prefixes as commits: `type/description`

- `feat/` - new features
- `fix/` - bug fixes
- `chore/` - tooling, CI, scaffolding
- `docs/` - documentation changes
- `test/` - test additions or fixes

Examples: `feat/configurable-replacements`, `fix/extra-whitespace`, `chore/repo-scaffolding`

## Commit conventions

This project follows [conventional commits](https://www.conventionalcommits.org/):

- `feat:` - new feature
- `fix:` - bug fix
- `chore:` - tooling, CI, scaffolding
- `docs:` - documentation changes
- `test:` - test additions or fixes

## Merge strategy

PRs are **squash merged** into `main`. The PR title becomes the squashed commit message, so make it descriptive.

## Code style

Formatting is enforced by Prettier (4-space indent, semicolons). CI will reject PRs that don't pass `make lint`.

Run `make format` before committing to auto-fix formatting.
