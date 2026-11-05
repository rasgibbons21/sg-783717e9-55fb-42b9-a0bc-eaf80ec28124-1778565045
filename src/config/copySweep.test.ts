import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const ROOTS = ["src/pages", "src/components"];
const SKIP = [/[\\/]api[\\/]/, /[\\/]ui[\\/]/, /refund-policy\.tsx$/, /\.test\.tsx?$/, /[\\/]admin/, /PansyStory\.tsx$/];

const BANNED_WORDS = /\b(signals?|scanners?|gap[- ]and[- ]go|screener|upgrade|free trial|go pro|pro plan|bloom pro|setups?|trading desk|watchlist)\b/i;
const DARK_COLOURS = /#(07080C|0C1016|121821|171E28|0E1B30|06060a|F3EDE3|27B7C8)\b/i;

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry.name) && !SKIP.some((rule) => rule.test(full)) ? [full] : [];
  });
}

/** Only what a person could read: JSX text and quoted strings, not imports or variable names. */
function readableText(source: string): string[] {
  const withoutImports = source.replace(/^import .*$/gm, "");
  const strings = withoutImports.match(/"[^"\n]*"|'[^'\n]*'|`[^`\n]*`/g) ?? [];
  const jsxText = withoutImports.match(/>[^<>{}\n]+</g) ?? [];
  return [...strings, ...jsxText];
}

const files = ROOTS.flatMap(sourceFiles);

describe("copy sweep", () => {
  it("has no signal, scanner or paid wording in what members read", () => {
    const offenders = files.flatMap((file) =>
      readableText(fs.readFileSync(file, "utf8"))
        .filter((text) => BANNED_WORDS.test(text))
        .map((text) => `${file}: ${text.slice(0, 80)}`),
    );
    expect(offenders).toEqual([]);
  });

  it("has no leftover dark theme colours", () => {
    const offenders = files.filter((file) => DARK_COLOURS.test(fs.readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });
});
