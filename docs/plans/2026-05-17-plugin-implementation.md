# Plugin implementation plan

## Context

- Spec: `docs/spec/2026-05-17-opencode-replace-text-plugin-implementation.md`
- Goal: Implement `src/index.ts` with `replaceText()` + `ReplaceTextPlugin`, real tests, updated README
- Non-goals: npm publishing, npx, other hooks, double-space normalization
- Dependencies: `@opencode-ai/plugin` (peer dep, types only), Bun runtime
- Acceptance criteria: 8 items from spec (AC 1-8, 10, 11)

---

## Tasks

### Task 1: `replaceText()` - tests + implementation (TDD)

- [ ] Status: pending
- Files/areas:
    - `tests/index.test.ts` (replaces `tests/placeholder.test.ts`)
    - `src/index.ts` (create)
- Implementation:
    - **Signature:**
        ```typescript
        export function replaceText(
            input: string,
            replacements: Record<string, string>,
        ): string;
        ```
    - **Logic:** Iterate over `replacements` entries. For each `[key, value]`, apply `input.replaceAll(key, value)`. Chain replacements through the accumulating result. Empty input returns empty string. Empty replacements returns input unchanged.
    - **No regex, no special cases.** Pure string replacement only.
- Tests (write first, red; then implement, green):
    - Test file: `tests/index.test.ts`
    - **Test: empty input returns empty string** - `replaceText("", { " - ": "-" })` -> `""`
    - **Test: no matching characters returns input unchanged** - `replaceText("hello world", { " - ": "-" })` -> `"hello world"`
    - **Test: single replacement applied** - `replaceText("foo - bar", { " - ": "-" })` -> `"foo-bar"`
    - **Test: multiple replacements applied** - `replaceText("a - b - c", { " - ": "-" })` -> `"a-b-c"`
    - **Test: multiple different keys replaced** - `replaceText("a - b-c", { " - ": "-", "-": "-" })` -> `"a-b-c"`
    - **Test: overlapping keys replaced left-to-right** - `replaceText("abc", { "ab": "xy", "bc": "yz" })` -> `"xyc"` (first match wins, `ab` replaced before `bc` is evaluated on result)
    - **Test: empty replacements map returns input unchanged** - `replaceText("hello", {})` -> `"hello"`
    - **Test: key not found in input returns input unchanged** - `replaceText("hello", { "x": "y" })` -> `"hello"`
    - **Test: space-to-dash replacement** - `replaceText("hello world", { " ": "-" })` -> `"hello-world"`
    - **Test: multi-char key replaced** - `replaceText("abc", { "ab": "X" })` -> `"Xc"`
    - Each test imports `replaceText` from `../src/index` using `import { describe, expect, test } from "bun:test"`.
    - No test imports or references plugin infrastructure (`@opencode-ai/plugin`, `PluginInput`, hooks, etc.).
- Verification: `bun test` - 0 pass before implementation (import fails), all pass after
- Dependencies: none
- Acceptance criteria: AC 1 (exports `replaceText`), AC 2 (replaces all keys with values)

### Task 2: `ReplaceTextPlugin` - plugin export

- [ ] Status: pending
- Files/areas:
    - `src/index.ts` (extends with plugin export)
- Implementation:
    - **Constants:**
        ```typescript
        const DEFAULTS: Record<string, string> = {
            "\u2014": "-", // em dash
            "\u2013": "-", // en dash
            "\u201C": '"', // left double curly quote
            "\u201D": '"', // right double curly quote
            "\u2018": "'", // left single curly quote
            "\u2019": "'", // right single curly quote
        };
        ```
    - **Type:**
        ```typescript
        type ReplaceTextOptions = {
            replacements?: Record<string, string>;
        };
        ```
        Exported as `export type { ReplaceTextOptions }`.
    - **Signature** (canonical pattern from https://opencode.ai/docs/plugins/):

        ```typescript
        import type { Plugin } from "@opencode-ai/plugin"

        export const ReplaceTextPlugin: Plugin = async (ctx, options) => {
            ...
        }
        ```

        Return type `Promise<Hooks>` is inferred from `Plugin` type - no explicit annotation needed. `ctx` is `PluginInput` but none of its properties are used by this plugin.

    - **Defaults merge strategy:**

        ```typescript
        const replacements = options ? (options.replacements ?? {}) : DEFAULTS;
        ```

        - Auto-discovered (no `opencode.json` entry, no options) -> full `DEFAULTS` applied
        - Registered with empty options `{}` -> no replacements (empty, nothing applied)
        - Registered with `{ replacements: {...} }` -> only user-specified replacements applied

    - **Logic:**
        1. Merge user `options?.replacements` over `DEFAULTS` (as above)
        2. Return hooks object with two closures:
            - `"experimental.text.complete"`: `async (_input, output) => { output.text = replaceText(output.text, replacements) }`
            - `"tool.execute.before"`: `async (input, output) => { ... }`
                - If `input.tool === "write"` and `typeof output.args.content === "string"`: replace
                - If `input.tool === "edit"`:
                    - If `typeof output.args.oldString === "string"`: replace
                    - If `typeof output.args.newString === "string"`: replace
        3. Both hooks use the merged `replacements` from step 1.
    - No new tests (plugin hook behavior tested by OpenCode integration; unit-tested via `replaceText()` in Task 1).

- Verification: `bun test` still passes (Task 1 tests), `npx tsc --noEmit` for type checking
- Dependencies: Task 1 complete (`replaceText()` must exist)
- Acceptance criteria: AC 1 (exports `ReplaceTextPlugin`), AC 3 (built-in defaults), AC 4 (user overrides defaults), AC 5 (text.complete hook), AC 6 (tool.execute.before hook)

### Task 3: README + AGENTS.md + final verification

- [ ] Status: pending
- Files/areas:
    - `README.md` (5 explicit edits)
    - `AGENTS.md` (review only)
    - `tests/placeholder.test.ts` (delete, already replaced by `tests/index.test.ts` in Task 1)
- Implementation - apply these edits to `README.md` in order:

    **Edit 1** - Replace subtitle (line 5):

    ```
    OLD: OpenCode plugin that replaces Unicode characters in AI output with plain ASCII equivalents.
    NEW: OpenCode plugin that replaces characters in AI output and file writes. Originally created to replace em dashes with regular dashes.
    ```

    **Edit 2** - Replace "## Why?" paragraph (lines 7-9):

    ```
    OLD: AI models frequently generate text with curly/smart quotes, em dashes, en dashes, ellipsis, arrow symbols, and invisible characters (zero-width spaces, joins, BOM). I prefer to replace these in my code, which is the purpose of this plugin.
    NEW: AI models frequently emit smart quotes, em dashes, and en dashes. This plugin replaces them automatically.
    ```

    **Edit 3** - Remove "## Features" section (lines 11-19 entirely):

    ```
    OLD: ## Features

    - Replaces smart quotes -> straight quotes
    - Replaces em dashes -> `-`, en dashes -> `-`
    - Replaces arrows (right arrow -> `->`, double right arrow -> `=>`, etc.)
    - Strips invisible characters (zero-width, BOM, soft hyphens)
    - Normalizes double spaces
    - Hooks into AI response text and file writes (Write/Edit tools)
    - **Configurable replacements** - customize via `opencode.json`

    NEW: (empty - remove this section)
    ```

    **Edit 4** - Replace "## Installation" section (lines 21-61 entirely):

    ````
    OLD: ## Installation

    ### npm (coming soon)

    ```bash
    npx opencode-replace-text
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

    NEW: ## Installation

    Copy `src/index.ts` to your project's plugins directory:

    ```bash
    mkdir -p .opencode/plugins
    cp src/index.ts .opencode/plugins/replace-text.ts
    ```

    No `opencode.json` registration needed - local `.ts` plugins are auto-discovered at startup. Restart OpenCode after installing.

    > Global install coming soon.

    ```

    **Edit 5** - Replace "## Configuration" section (lines 63-65 entirely):
    ```

    OLD: ## Configuration

    Coming soon - configure which replacements to apply and add your own via `opencode.json`.

    NEW: ## Configuration

    Custom replacements via `opencode.json` plugin options:

    ```jsonc
    {
        "plugin": [
            [
                "./plugins/replace-text.ts",
                {
                    "replacements": {
                        "\↦": "->",
                        "\↥": "<-",
                    },
                },
            ],
        ],
    }
    ```

    When options are provided, only your replacements apply (built-in defaults are skipped).

    ### Built-in defaults

    | Character                     | Unicode  | Replaced with |
    | ----------------------------- | -------- | ------------- |
    | Em dash ( - )                 | `\u2014` | `-`           |
    | En dash ( - )                 | `\u2013` | `-`           |
    | Left double quote ( \u201c )  | `\u201C` | `"`           |
    | Right double quote ( \u201d ) | `\u201D` | `"`           |
    | Left single quote ( \u2018 )  | `\u2018` | `'`           |
    | Right single quote ( \u2019 ) | `\u2019` | `'`           |

    ```
    Note: The Unicode characters in the "Character" column are the actual glyphs, not HTML entities. @fixer must write the literal Unicode characters: em dash (U+2014), en dash (U+2013), left double quote (U+201C), right double quote (U+201D), left single quote (U+2018), right single quote (U+2019).

    **AGENTS.md:** No changes needed. Current content covers commands, PR titles, branching - all still accurate.

    **Delete:** `tests/placeholder.test.ts` - removed since `tests/index.test.ts` now exists.

    ```

- Verification: `make ci` passes (Task 1+2 tests + lint)
- Dependencies: Task 1, Task 2
- Acceptance criteria: AC 7 (placeholder test removed), AC 8 (`make ci` passes), AC 10 (README), AC 11 (AGENTS.md)

---

## Execution order

```
Task 1 (replaceText + tests) -> Task 2 (ReplaceTextPlugin) -> Task 3 (docs + ci)
```

Tasks 1 and 2 are sequential (Task 2 depends on `replaceText()` from Task 1).
Task 3 requires both 1 and 2 complete.

---

## Verification (final)

```bash
make ci # lint + test
```

All 8 acceptance criteria must pass.
