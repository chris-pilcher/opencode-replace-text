# opencode-replace-text

[![ci](https://github.com/chris-pilcher/opencode-replace-text/actions/workflows/ci.yml/badge.svg)](https://github.com/chris-pilcher/opencode-replace-text/actions/workflows/ci.yml)

OpenCode plugin that replaces characters in AI output and file writes. Originally created to replace em dashes with regular dashes.

## Why?

AI models frequently emit smart quotes, em dashes, and en dashes. This plugin replaces them automatically.

## Installation

Copy `src/index.ts` to your project's plugins directory:

```bash
mkdir -p .opencode/plugins
cp src/index.ts .opencode/plugins/replace-text.ts
```

No `opencode.json` registration needed - local `.ts` plugins are auto-discovered at startup. Restart OpenCode after installing.

> Global install coming soon.

## Configuration

Custom replacements via `opencode.json` plugin options:

```jsonc
{
    "plugin": [
        [
            "./plugins/replace-text.ts",
            {
                "replacements": {
                    "↦": "->",
                    "↥": "<-",
                },
            },
        ],
    ],
}
```

When options are provided, only your replacements apply (built-in defaults are skipped).

### Built-in defaults

| Character                | Unicode  | Replaced with |
| ------------------------ | -------- | ------------- |
| Em dash ( — )            | `\u2014` | `-`           |
| En dash ( – )            | `\u2013` | `-`           |
| Left double quote ( “ )  | `\u201C` | `"`           |
| Right double quote ( ” ) | `\u201D` | `"`           |
| Left single quote ( ‘ )  | `\u2018` | `'`           |
| Right single quote ( ’ ) | `\u2019` | `'`           |
