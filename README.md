# opencode-replace-text

[![ci](https://github.com/chris-pilcher/opencode-replace-text/actions/workflows/ci.yml/badge.svg)](https://github.com/chris-pilcher/opencode-replace-text/actions/workflows/ci.yml)

OpenCode plugin that replaces Unicode characters in AI output with plain ASCII equivalents.

## Why?

AI models frequently generate text with curly/smart quotes, em dashes, en dashes, ellipsis, arrow symbols, and invisible characters (zero-width spaces, joins, BOM). I prefer to replace these in my code, which is the purpose of this plugin.

## Features

- Replaces smart quotes -> straight quotes
- Replaces em dashes -> `-`, en dashes -> `-`
- Replaces arrows (right arrow -> `->`, double right arrow -> `=>`, etc.)
- Strips invisible characters (zero-width, BOM, soft hyphens)
- Normalizes double spaces
- Hooks into AI response text and file writes (Write/Edit tools)
- **Configurable replacements** - customize via `opencode.json`

## Installation

### npm (coming soon)

```bash
npx opencode-replace-text
```

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
