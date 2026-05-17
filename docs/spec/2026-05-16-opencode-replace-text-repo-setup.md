# Spec: opencode-replace-text repo scaffolding

**Date:** 2026-05-16  
**Status:** Approved

---

## Problem statement

The `sanitize-text` OpenCode plugin (built locally at `~/.config/opencode/plugins/sanitize-text.ts`) needs to become a public, configurable npm package. Before writing the configurable plugin, the repo needs scaffolding: tooling, CI, documentation, and a clean structure that mirrors ecosystem conventions.

The repo already exists at `github.com/chris-pilcher/opencode-replace-text` with only a bare README and LICENSE. No structure, no CI, no tooling.

---

## Goals and non-goals

### Goals

- Set up a clean, minimal repo structure (`src/`, `tests/`)
- Configure Bun as the test runner (`bun test`, zero extra test deps)
- Add a Makefile so `make ci` works identically for local dev, AI agents, and CI
- Add Prettier and TypeScript as dev dependencies
- Add `.editorconfig` for consistent formatting
- Add GitHub Actions CI that calls `make ci` and fails on lint/format violations
- Add a simple PR template
- Write a README that explains what the plugin does, why someone would use it, and installation options (npm coming soon + local copy instructions)
- Add a placeholder `AGENTS.md` for the repo owner to complete
- Use conventional commits

### Non-goals

- Any plugin implementation code (`src/` gets `.gitkeep` only)
- Config system design (deferred to next spec)
- npm publishing setup
- `docs/` folder (too small to warrant it)
- Any test that actually tests the plugin (placeholder only: `expect(true).toBe(true)`)

---

## User-visible behavior

A visitor to the repo sees:

1. `README.md` explaining the plugin (Unicode-to-ASCII text replacement for AI output, configurable, em dashes -> regular dashes, etc.)
2. Badges showing CI status (will work once code is pushed)
3. Installation instructions:
    - "Coming soon" npm install (`npx opencode-replace-text` or similar)
    - "Use now" local copy: download `src/index.ts` to `.opencode/plugins/` and register in `opencode.json`
4. PR template guiding contributors

---

## Technical constraints

- **Runtime:** Bun (OpenCode's native runtime, `bun test` built-in)
- **Language:** TypeScript
- **Dev dependencies (minimum):** `prettier`, `typescript`, `@opencode-ai/plugin` (types only)
- **No Makefile dependency in production** - Makefile is dev tooling only
- **CI must call `make ci`** - single entry point for local + CI + AI agents
- **Lint/format failures must block CI** - `make lint` runs Prettier check

---

## Proposed approach

### Directory structure

```
opencode-replace-text/
├── .github/
│ ├── workflows/
│ │ ├── ci.yml
│ │ └── pr-title.yml # PR title conventional commit validation
│ └── pull_request_template.md
├── src/
│ └── .gitkeep
├── tests/
│ └── placeholder.test.ts # expect(true).toBe(true)
├── .editorconfig
├── .gitignore
├── .npmignore
├── .prettierrc
├── AGENTS.md # references conventional commits + Makefile targets
├── CONTRIBUTING.md # PR guidelines, conventional commits, squash merge
├── LICENSE # MIT
├── Makefile
├── README.md
├── package.json
└── tsconfig.json
```

### Makefile targets

| Target   | Command                          | Notes                                                                  |
| -------- | -------------------------------- | ---------------------------------------------------------------------- |
| `ci`     | `make lint && make test`         | Entry point for GHA and AI agents (build excluded until source exists) |
| `build`  | `@echo "No source to build yet"` | Placeholder until src/index.ts exists                                  |
| `test`   | `bun test`                       | Runs `tests/` directory                                                |
| `lint`   | `bun x prettier --check .`       | Uses `bun x` so binary resolves in CI PATH                             |
| `format` | `bun x prettier --write .`       | Auto-fix formatting                                                    |
| `clean`  | `rm -rf dist node_modules`       | Reset                                                                  |

### CI workflow (ci.yml)

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
            - name: Checkout
              uses: actions/checkout@v6
            - name: Setup Bun
              uses: oven-sh/setup-bun@v2
            - name: Install dependencies
              run: bun install
            - name: Lint and test
              run: make ci
```

### PR title validation (pr-title.yml)

```yaml
name: pr-title
on:
    pull_request_target:
        types: [opened, reopened, edited, synchronize]
permissions: {}
jobs:
    validate:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/github-script@v9
              env:
                  PR_TITLE: ${{ github.event.pull_request.title }}
              with:
                  script: |
                      const prTitle = process.env.PR_TITLE;
                      const pattern = /^(feat|fix|chore|docs|test|refactor|perf|ci|build|revert)(\(.+\))?: .+/;
                      if (!pattern.test(prTitle)) {
                          core.setFailed(`PR title "${prTitle}" must follow conventional commits (type: description)`);
                      }
```

Uses `pull_request_target` with `permissions: {}` for zero-privilege operation. PR title is passed via env var for injection safety. `actions/github-script@v9` chosen over third-party action for simplicity and zero external deps.

### Test runner

`bun test` - no additional test framework. Uses `bun:test` built-in.

```typescript
// tests/placeholder.test.ts
import { describe, expect, test } from "bun:test";

describe("placeholder", () => {
    test("ci is wired up", () => {
        expect(true).toBe(true);
    });
});
```

### package.json

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

### .editorconfig

Standard sensible defaults:

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

### Prettier config

Minimal `.prettierrc`:

```json
{
    "semi": true,
    "singleQuote": false,
    "trailingComma": "all",
    "tabWidth": 4
}
```

---

## Alternatives considered

| Approach                          | Pros                                              | Cons                                                                                 | Verdict                                              |
| --------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| **npm scripts only, no Makefile** | Conforms to Node.js/OpenCode ecosystem convention | CI and local dev use different entry points; AI agents need to know npm script names | Rejected - Makefile is thin wrapper, user preference |
| **Vitest**                        | Reference repo uses it, familiar to Node devs     | Extra dependency, Bun already has built-in test runner                               | Rejected - user chose bun test                       |
| **Include `dist/` in scaffold**   | Ready for npm publish                             | No code yet, premature                                                               | Rejected - add when real code lands                  |
| **docs/ folder**                  | Follows reference repo pattern                    | Plugin is tiny, README is sufficient                                                 | Rejected - user preference                           |

---

## Acceptance criteria

1. [x] `src/.gitkeep` exists
2. [x] `tests/placeholder.test.ts` exists and passes (`expect(true).toBe(true)`)
3. [x] `.editorconfig` exists with LF, UTF-8, 4-space indent rules
4. [x] `.prettierrc` exists with semicolons, 4-space indent
5. [x] `Makefile` exists with `ci`, `build`, `test`, `lint`, `format`, `clean` targets
6. [x] `make lint` calls `bun x prettier --check .`
7. [x] `make test` calls `bun test`
8. [x] `make format` calls `bun x prettier --write .`
9. [x] `package.json` filled with name, description, version, peer/dev deps (including `@types/bun`)
10. [x] `tsconfig.json` exists (Bun-recommended config)
11. [x] `.github/workflows/ci.yml` runs `bun install && make ci` with `actions/checkout@v6` and named steps
12. [x] `.github/workflows/pr-title.yml` validates PR title with `actions/github-script@v9` (zero permissions)
13. [x] `.github/pull_request_template.md` exists (conventional commits + breaking changes checklist)
14. [x] `README.md` explains purpose, usage, install options (npm coming soon + local copy)
15. [x] `AGENTS.md` exists referencing conventional commits, branching, and Makefile targets
16. [x] `CONTRIBUTING.md` exists covering PR guidelines, conventional commits/branches, squash merging
17. [x] `.npmignore` exists (Bun-aware: exclude tests, config, CI, dev files from published package)
18. [x] `.gitignore` covers `node_modules/`, `dist/`, `*.lockb`
19. [x] All files conform to `.editorconfig` and Prettier rules
20. [x] CI workflow passes (lint green, test green: 1 pass, 0 fail)

---

## Approval

- **Author:** orchestrator
- **Approver:** Chris Pilcher
- **Date:** 2026-05-16
