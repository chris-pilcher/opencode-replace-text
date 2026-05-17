import type { Plugin } from "@opencode-ai/plugin";

const DEFAULTS: Record<string, string> = {
    "\u2014": "-", // em dash
    "\u2013": "-", // en dash
    "\u201C": '"', // left double curly quote
    "\u201D": '"', // right double curly quote
    "\u2018": "'", // left single curly quote
    "\u2019": "'", // right single curly quote
};

type ReplaceTextOptions = {
    replacements?: Record<string, string>;
};

export type { ReplaceTextOptions };

export const ReplaceTextPlugin: Plugin = async (ctx, options) => {
    let replacements: Record<string, string>;
    if (options) {
        replacements = (options.replacements ?? {}) as Record<string, string>;
    } else {
        replacements = DEFAULTS;
    }

    return {
        "experimental.text.complete": async (_input, output) => {
            output.text = replaceText(output.text, replacements);
        },
        "tool.execute.before": async (input, output) => {
            if (input.tool === "write") {
                if (typeof output.args.content === "string") {
                    output.args.content = replaceText(
                        output.args.content,
                        replacements,
                    );
                }
            }
            if (input.tool === "edit") {
                if (typeof output.args.oldString === "string") {
                    output.args.oldString = replaceText(
                        output.args.oldString,
                        replacements,
                    );
                }
                if (typeof output.args.newString === "string") {
                    output.args.newString = replaceText(
                        output.args.newString,
                        replacements,
                    );
                }
            }
        },
    };
};

export function replaceText(
    input: string,
    replacements: Record<string, string>,
): string {
    let result = input;
    for (const [key, value] of Object.entries(replacements)) {
        result = result.replaceAll(key, value);
    }
    return result;
}
