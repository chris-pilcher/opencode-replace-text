# opencode-replace-text

## Requirements

- [Bun](https://bun.sh/) runtime

## Commands

| Target    | Command                         |
| --------- | ------------------------------- |
| Full CI   | `make ci`                       |
| Lint only | `make lint` (ESLint + Prettier) |
| Test only | `make test`                     |
| Format    | `make format`                   |
| Build     | `make build`                    |
| Clean     | `make clean`                    |

`make ci` is the same pipeline run by GitHub Actions - if it passes locally, CI will pass.

## Before creating a PR

```bash
make format # auto-fix formatting (CI rejects unformatted code)
make ci # run the full pipeline
```

## PR titles

PR titles must follow conventional commits (enforced by CI on `main`). The PR title becomes the squashed commit message.

Examples:

- `feat: add configurable replacement rules`
- `fix: handle empty input gracefully`
- `chore: update dependencies`
- `docs: add installation guide`
- `feat!: remove deprecated API` (breaking change)

## Branch naming

Branches follow [conventional-branch](https://conventional-branch.github.io/#branch-naming-prefixes): `<type>/<description>`.

| Prefix     | Alias   | Purpose                           |
| ---------- | ------- | --------------------------------- |
| `feature/` | `feat/` | New features                      |
| `bugfix/`  | `fix/`  | Bug fixes                         |
| `hotfix/`  | -       | Urgent/critical fixes             |
| `release/` | -       | Release preparation               |
| `chore/`   | -       | Non-code tasks (deps, docs, etc.) |

Examples: `feat/configurable-replacements`, `chore/repo-scaffolding`
