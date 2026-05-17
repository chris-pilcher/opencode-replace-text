# Spec: opencode-replace-text plugin implementation

**Date:** 2026-05-17
**Status:** Draft

---

## Problem statement

The repo is scaffolded (see 2026-05-16 spec) but `src/index.ts` is empty and `tests/placeholder.test.ts` is a stub. The plugin's core behavior - character replacement in text - needs to be implemented as a configurable OpenCode plugin, with real tests.

The plugin was originally created to replace em dashes with regular dashes in AI-generated code output.

---

## Goals and non-goals

### Goals

- Implement a working `src/index.ts` that exports a `ReplaceTextPlugin` (OpenCode `Plugin`)
- Main function is `replaceText`
- Make character replacements configurable via `opencode.json` plugin options
- Ship with **minimal built-in defaults**: em dashes, en dashes, smart/curly quotes
- Hook into `"experimental.text.complete"` (AI response text) and `"tool.execute.before"` (file write/edit operations)
- Write real unit tests for `replaceText()` (replace placeholder)
- Update README: copy-paste install, no `opencode.json` registration required, no npm/npx section
- Update AGENTS.md if needed (should stay short and succinct)

### Non-goals

- npm publishing / packaging / npx installation
- Double-space normalization (removed per design decision)
- Other hooks (`experimental.text.complete` and `tool.execute.before` cover the use case; `tool.execute.after` and `experimental.chat.messages.transform` exist but aren't needed for character replacement in AI output and file writes)
- Config file other than `opencode.json` plugin options
- Arrow replacement, invisible character stripping (users add these via config)

---

## User-visible behavior

1. User copies `src/index.ts` to `.opencode/plugins/replace-text.ts` (project-local) or `~/.config/opencode/plugins/` (global)
2. **No `opencode.json` registration needed** - local `.ts` plugins are auto-discovered at startup
3. For custom replacements, users optionally add to `opencode.json`:
   ```jsonc
   {
       "plugin": [
           ["./plugins/replace-text.ts", {
               "replacements": {
                   "↦": "->",
                   "↥": "<-"
               }
           }]
       ]
   }
   ```
4. Plugin intercepts AI-generated text and file writes, replacing configured Unicode characters with their ASCII equivalents
5. Without config, the plugin applies built-in defaults (em dash, en dash, smart quotes). Explicit empty options applies no replacements.

---

## Technical constraints

- **Runtime:** Bun
- **Language:** TypeScript
- **Dev dependencies:** `@opencode-ai/plugin` (types only), `@types/bun`, `prettier`, `typescript`
- **Test runner:** `bun test` (built-in)
- **Module format:** ESM (`"type": "module"` in package.json)

---

## Proposed approach

### Architecture

A single file `src/index.ts` containing:

1. **`replaceText(input: string, replacements: Record<string, string>): string`** - pure function that iterates over a replacements map and applies each replacement. No regex magic, no special cases. Users define what to replace and with what.

2. **`ReplaceTextPlugin: Plugin`** - the OpenCode plugin export. Reads `options?.replacements` from plugin options. Auto-discovered (no options) applies `DEFAULTS`; explicit empty options applies no replacements; explicit replacements applies only those. Registers two hooks:
   - `"experimental.text.complete"` - replaces characters in AI response text after generation
   - `"tool.execute.before"` - replaces characters in `write` (content) and `edit` (oldString, newString) tool args before execution

### Plugin options schema

```typescript
interface ReplaceTextOptions {
    replacements?: Record<string, string>;
}
```

Registered as `[plugin_path, options]` in `opencode.json`.

### Built-in defaults

| Unicode | Replacement |
| ------- | ----------- |
| `\u2014` ( — ) | `-` |
| `\u2013` ( – ) | `-` |
| `\u201C` ( “ ) | `"` |
| `\u201D` ( ” ) | `"` |
| `\u2018` ( ‘ ) | `'` |
| `\u2019` ( ’ ) | `'` |

### File structure

```
src/
  index.ts # replaceText() + ReplaceTextPlugin
tests/
  index.test.ts # replaces placeholder.test.ts
```

### Tests

`tests/index.test.ts` tests `replaceText()` directly (unit test, no plugin infrastructure needed):

- Empty input -> empty output
- No matching characters -> unchanged
- Default replacements applied
- Custom replacements override defaults
- Multiple occurrences of same character
- Mixed content (text with multiple different characters)

---

## Alternatives considered

| Approach | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| Static hardcoded list in code | Simplest | Can't customize without editing source | Rejected |
| Environment variable config | Simple for single-file copy | Not idiomatic for OpenCode plugins | Rejected |
| `opencode.json` plugin options | Idiomatic, discoverable, typed | Slightly more verbose registration | **Chosen** |
| Separate config file | Isolated config | Two files to copy, not standard plugin pattern | Rejected |

---

## Acceptance criteria

1. [ ] `src/index.ts` exports `replaceText()` and `ReplaceTextPlugin`
2. [ ] `replaceText(input, replacements)` replaces all keys with their values
3. [ ] Built-in defaults cover em dash, en dash, smart double quotes, smart single quotes
4. [ ] Registered with empty options applies no replacements; registered with `replacements` applies only user-specified
5. [ ] `"experimental.text.complete"` hook replaces characters in `output.text`
6. [ ] `"tool.execute.before"` hook replaces characters in `write` (content) and `edit` (oldString, newString) args
7. [ ] `tests/index.test.ts` replaces `tests/placeholder.test.ts` with real tests
8. [ ] `make ci` passes (lint + test)
10. [ ] README updated: short & succinct, single copy-paste install (no npm/npx section), no `opencode.json` registration needed for basic use, config example for custom replacements, mention em dash origin
11. [ ] AGENTS.md reviewed for accuracy (no unnecessary changes)

---

## Approval

- **Author:** orchestrator
- **Approver:** [pending]
- **Date:** 2026-05-17
