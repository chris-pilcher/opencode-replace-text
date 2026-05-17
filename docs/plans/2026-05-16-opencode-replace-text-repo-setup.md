# Plan: opencode-replace-text repo scaffolding

**Date:** 2026-05-16
**Spec:** `docs/spec/2026-05-16-opencode-replace-text-repo-setup.md`

## Context

- Bare repo at `~/src/github.com/chris-pilcher/opencode-replace-text` (cloned, only README.md + LICENSE)
- Branch: `chore/repo-scaffolding` off `main`
- No plugin code - scaffolding only
- Conventional commit: `chore: scaffold repo with tooling and CI`
- **Status:** All tasks complete. PR open at https://github.com/chris-pilcher/opencode-replace-text/pull/1

### Deviations from plan

- **Task 2** deviated: `actions/checkout@v4` -> `@v6` (Node 24), add `pr-title.yml` (separate workflow), PR template simplified
- **Task 1** deviated: `prettier` -> `bun x prettier` (CI PATH fix), `@types/bun` added to devDeps
- **Task 4** (verification) deviated: `actions/github-script@v9` instead of `amannn/action-semantic-pull-request`
- **Added ESLint**: `eslint`, `@eslint/js`, `typescript-eslint` with flat config
- **Added npm scripts**: package.json `scripts` block wrapping Makefile targets
- **Makefile**: `[pass] ci` output style, `bun x prettier` for PATH safety
- **CI**: job named `CI`, steps named (`Checkout`, `Setup Bun`, etc.), `Run CI` step
- **PR template**: simplified to description-only (no checklist)
- **AGENTS.md**: rewritten for AI agents (PR title examples, before-PR checklist)
- **README**: removed redundant License section
- Bun runtime, `bun:test` runner, Prettier for lint, TypeScript for typecheck

---

## Task 1: Infrastructure files (package.json, tsconfig, editorconfig, prettier, gitignore, npmignore, Makefile)

**Status:** complete
**Parallelizable:** Yes (independent of Tasks 2, 3)

### Files to create (exact content - do not modify, do not add, do not remove)

#### 1a. `package.json`

```json
{
    "name": "opencode-replace-text",
    "version": "0.0.0",
    "description": "OpenCode plugin to replace Unicode characters (smart quotes, em dashes, arrows, invisible chars) with plain ASCII equivalents",
    "license": "MIT",
    "author": "Chris Pilcher",
    "type": "module",
    "main": "src/index.ts",
    "files": ["src/"],
    "peerDependencies": {
        "@opencode-ai/plugin": "*"
    },
    "devDependencies": {
        "@opencode-ai/plugin": "*",
        "@types/bun": "latest",
        "prettier": "^3.0.0",
        "typescript": "^5.0.0"
    }
}
```

#### 1b. `tsconfig.json`

```json
{
    "compilerOptions": {
        "lib": ["ESNext"],
        "target": "ESNext",
        "module": "Preserve",
        "moduleDetection": "force",
        "allowJs": true,
        "types": ["bun"],
        "moduleResolution": "bundler",
        "allowImportingTsExtensions": true,
        "verbatimModuleSyntax": true,
        "noEmit": true,
        "strict": true,
        "skipLibCheck": true,
        "noFallthroughCasesInSwitch": true,
        "noUncheckedIndexedAccess": true,
        "noUnusedLocals": false,
        "noUnusedParameters": false
    },
    "include": ["src/**/*.ts", "tests/**/*.ts"]
}
```

#### 1c. `.editorconfig`

```ini
root = true

[*]
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
charset = utf-8

[*.{ts,json,yml,yaml,md}]
indent_style = space
indent_size = 4

[Makefile]
indent_style = tab
```

#### 1d. `.prettierrc`

```json
{
    "semi": true,
    "singleQuote": false,
    "trailingComma": "all",
    "tabWidth": 4
}
```

#### 1e. `.gitignore`

```
node_modules/
dist/
bun.lockb
*.log
.DS_Store
```

#### 1f. `.npmignore`

```
tests/
.github/
Makefile
.editorconfig
.prettierrc
.gitignore
AGENTS.md
CONTRIBUTING.md
tsconfig.json
bun.lock
```

#### 1g. `Makefile`

```makefile
.PHONY: ci build test lint format clean

ci: lint test
	@echo "=== ci passed ==="

build:
	@echo "No source to build yet (src/index.ts not implemented)"

test:
	bun test

lint:
	prettier --check .

format:
	prettier --write .

clean:
	rm -rf dist node_modules
```

**IMPORTANT Makefile notes:**

- Use TAB characters for indentation, NOT spaces (`.editorconfig` enforces this)
- `ci` target runs lint then test (no build until source exists - build target is a placeholder echo)
- Each recipe line MUST start with a TAB

### Verification

After all 7 files are written, run:

```bash
cd ~/src/github.com/chris-pilcher/opencode-replace-text
cat package.json tsconfig.json .editorconfig .prettierrc .gitignore .npmignore Makefile
```

Confirm all 7 files exist and have content.

---

## Task 2: CI workflow, PR template, and documentation (README, AGENTS, CONTRIBUTING)

**Status:** complete
**Parallelizable:** Yes (independent of Tasks 1, 3)

### Files to create (exact content)

#### 2a. `.github/workflows/ci.yml`

```yaml
name: ci

on:
    push:
        branches: [main]
    pull_request:
        branches: [main]

jobs:
    ci:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: oven-sh/setup-bun@v2
            - run: bun install
            - run: make ci
```

#### 2b. `.github/pull_request_template.md`

```md
<!-- Thanks for contributing to opencode-replace-text! -->

## Checklist

- [ ] Code is formatted (`make format`)
- [ ] Linting passes (`make lint`)
- [ ] Tests pass (`make test`)
- [ ] Commit messages follow [conventional commits](https://www.conventionalcommits.org/)
```

#### 2c. `README.md`

````md
# opencode-replace-text

[![ci](https://github.com/chris-pilcher/opencode-replace-text/actions/workflows/ci.yml/badge.svg)](https://github.com/chris-pilcher/opencode-replace-text/actions/workflows/ci.yml)

OpenCode plugin that replaces Unicode characters in AI output with plain ASCII equivalents.

## Why?

AI models frequently generate text with curly/smart quotes, em dashes, en dashes, ellipsis, arrow symbols, and invisible characters (zero-width spaces, joins, BOM). I prefer to replace these in my code, which is the purpose of this plugin.

This plugin silently replaces all of those with clean ASCII before text hits your files.

## Features

- Replaces smart quotes -> straight quotes
- Replaces em dashes -> `-`, en dashes -> `-`
- Replaces arrows (`->` -> `->`, `=>` -> `=>`, etc.)
- Strips invisible characters (zero-width, BOM, soft hyphens)
- Normalizes double spaces
- Hooks into AI response text and file writes (Write/Edit tools)
- **Configurable replacements** - customize via `opencode.json`

## Installation

### npm (coming soon)

```bash
npx opencode-replace-text
```
````

Then add to your `opencode.json`:

```json
{
    "plugin": ["opencode-replace-text"]
}
```

### Manual (use now)

Copy `src/index.ts` to your OpenCode plugins directory:

```bash
# Project-local
mkdir -p .opencode/plugins
cp src/index.ts .opencode/plugins/replace-text.ts

# Or global
cp src/index.ts ~/.config/opencode/plugins/replace-text.ts
```

Then register in `opencode.json`:

```jsonc
{
    // Project-local:
    "plugin": ["./plugins/replace-text.ts"],
    // Global:
    // "plugin": ["./plugins/replace-text.ts"]
}
```

Restart OpenCode after installing.

## Configuration

Coming soon - configure which replacements to apply and add your own via `opencode.json`.

## License

MIT

````

#### 2d. `AGENTS.md`
```md
# AGENTS.md - opencode-replace-text

This file is a placeholder. The repo owner will update it with detailed architecture and development guidance.

## Quick reference

- Build: `make build`
- Test: `make test` (runs `bun test`)
- Lint: `make lint` (runs `prettier --check .`)
- Format: `make format` (runs `prettier --write .`)
- Full CI: `make ci` (runs lint then test)

## Conventions

- **Conventional commits** - use `feat:`, `fix:`, `chore:`, `docs:`, `test:` prefixes
- **Conventional branching** - branch names follow the same prefixes: `feat/`, `fix/`, `chore/`, `docs/`, `test/`
- **Squash merge** - PRs are squashed into `main` for a clean linear history
- **Format then commit** - run `make format` before committing; CI will reject unformatted code

## Testing

```bash
make test # run all tests
bun test # same, direct
````

Tests use Bun's built-in test runner (`bun:test`). No additional test framework required.

## CI

GitHub Actions runs `make ci` on push and PR to `main`. Format violations fail the build.

````

#### 2e. `CONTRIBUTING.md`
```md
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
````

### Verification

After all 5 files are written, run:

```bash
cd ~/src/github.com/chris-pilcher/opencode-replace-text
ls .github/workflows/ci.yml .github/pull_request_template.md README.md AGENTS.md CONTRIBUTING.md
```

---

## Task 3: Source scaffolding (src/.gitkeep, tests/placeholder.test.ts)

**Status:** complete
**Parallelizable:** Yes (independent of Tasks 1, 2)

### Files to create (exact content)

#### 3a. `src/.gitkeep`

Create an empty file named `.gitkeep` inside the `src/` directory. The file itself should be empty (zero bytes).

Steps:

```bash
mkdir -p src
touch src/.gitkeep
```

#### 3b. `tests/placeholder.test.ts`

```typescript
import { describe, expect, test } from "bun:test";

describe("placeholder", () => {
    test("ci is wired up", () => {
        expect(true).toBe(true);
    });
});
```

Steps:

```bash
mkdir -p tests
# Write the content above to tests/placeholder.test.ts
```

### Verification

```bash
cd ~/src/github.com/chris-pilcher/opencode-replace-text
ls src/.gitkeep tests/placeholder.test.ts
```

---

## Task 4: Install dependencies and verify everything works

**Status:** complete
**Dependencies:** Tasks 1, 2, 3 must be complete first

### Steps (run in order)

```bash
cd ~/src/github.com/chris-pilcher/opencode-replace-text

# 1. Create branch off main
git checkout main
git pull origin main
git checkout -b chore/repo-scaffolding

# 2. Install dependencies
bun install

# 3. Run lint (should pass - all files are formatted per .prettierrc)
make lint

# 4. Run tests (should pass - single placeholder test)
make test

# 5. Format (should be no-op if lint passed)
make format
```

If any step fails, stop and report the error. Do not proceed to git operations.

### Git operations (only if all verification passes)

````bash
cd ~/src/github.com/chris-pilcher/opencode-replace-text

# Stage all files
git add -A

# Commit with conventional commit message
git commit -m "chore: scaffold repo with tooling and CI

- Add package.json, tsconfig.json, .editorconfig, .prettierrc
- Add .gitignore, .npmignore, Makefile with ci/lint/test/format targets
- Add GitHub Actions CI (calls make ci)
- Add PR template, README, AGENTS.md, CONTRIBUTING.md
- Add placeholder test (bun:test) and src/.gitkeep"

# Push branch
git push -u origin chore/repo-scaffolding

# Create PR
gh pr create \
  --title "chore: scaffold repo with tooling and CI" \
  --body "$(cat <<'EOF'
## Summary

Scaffolds the opencode-replace-text repo with development tooling and documentation. No plugin code yet.

### What's included

- **package.json** - `opencode-replace-text`, MIT, Bun/TypeScript, `@opencode-ai/plugin` peer dep
- **tsconfig.json** - Bun-recommended config (`module: Preserve`, `types: ["bun"]`, `noEmit`)
- **.editorconfig + .prettierrc** - 4-space indent, semicolons, LF line endings
- **Makefile** - `make ci` (lint -> test), `make build`, `make test`, `make lint`, `make format`, `make clean`
- **.github/workflows/ci.yml** - runs `bun install && make ci` on push/PR
- **.github/pull_request_template.md** - simple checklist
- **README.md** - what it does, why, install options (npm coming soon + local copy)
- **AGENTS.md** - placeholder with conventional commits + Makefile targets reference
- **CONTRIBUTING.md** - PR guidelines, conventional commits, squash merge
- **.gitignore + .npmignore** - Bun-aware exclusions
- **tests/placeholder.test.ts** - single `expect(true).toBe(true)` to verify CI
- **src/.gitkeep** - placeholder for future plugin code

### Verification

```bash
make ci # runs lint + test
````

CI will run automatically on push.
EOF
)"

```

---

## Acceptance criteria (post-PR)

1. All 14 files exist on the `chore/repo-scaffolding` branch
2. `bun install` succeeds
3. `make lint` passes
4. `make test` passes (1 test, green)
5. `make format` is a no-op
6. PR is open at `github.com/chris-pilcher/opencode-replace-text`
7. CI workflow triggers and passes on the PR
```
