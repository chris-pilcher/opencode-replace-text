import { describe, expect, test } from "bun:test";
import { replaceText } from "../src/index";

describe("replaceText", () => {
    test("empty input returns empty string", () => {
        expect(replaceText("", { x: "y" })).toBe("");
    });

    test("no matching characters returns input unchanged", () => {
        expect(replaceText("hello world", { x: "y" })).toBe("hello world");
    });

    test("single replacement applied", () => {
        expect(replaceText("foo-bar", { "-": "_" })).toBe("foo_bar");
    });

    test("multiple occurrences replaced", () => {
        expect(replaceText("a-b-c", { "-": "_" })).toBe("a_b_c");
    });

    test("multiple different keys replaced", () => {
        expect(replaceText("a-b c", { "-": "_", " ": "-" })).toBe("a_b-c");
    });

    test("empty replacements map returns input unchanged", () => {
        expect(replaceText("hello", {})).toBe("hello");
    });

    test("key not found in input returns input unchanged", () => {
        expect(replaceText("hello", { x: "y" })).toBe("hello");
    });

    test("em dash replaced with regular dash", () => {
        expect(replaceText("foo\u2014bar", { "\u2014": "-" })).toBe("foo-bar");
    });

    test("smart double quote replaced with straight quote", () => {
        expect(
            replaceText("\u201Ctest\u201D", { "\u201C": '"', "\u201D": '"' }),
        ).toBe('"test"');
    });

    test("multi-char key replaced", () => {
        expect(replaceText("abcde", { ab: "X" })).toBe("Xcde");
    });
});
