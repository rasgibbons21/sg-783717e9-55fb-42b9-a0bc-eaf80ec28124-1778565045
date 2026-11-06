import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const ROOTS = ["src/pages", "src/components"];
const SKIP = [/[\\/]api[\\/]/, /[\\/]ui[\\/]/, /refund-policy\.tsx$/, /\.test\.tsx?$/, /[\\/]admin/, /PansyStory\.tsx$/];

// "Setup" is allowed now: the stock curriculum teaches named setups and Practice records which one was used.
const BANNED_WORDS = /\b(signals?|scanners?|gap[- ]and[- ]go|screener|upgrade|free trial|go pro|pro plan|bloom pro|trading desk|watchlist)\b/i;
const OLD_THEMES = /#(07080C|0C1016|121821|171E28|0E1B30|06060a|F3EDE3|27B7C8|3F4F3E|EFD9D3|B98A72|C2A15A|E6ECE3|8A5B44)\b/i;
const GARDEN_IMPORTS = /from\s+["']@\/components\/(brand\/Botanical|BloomGarden)["']/;

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

  it("has no colours left from the old dark or soft-garden themes", () => {
    const offenders = files.filter((file) => OLD_THEMES.test(fs.readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });

  it("has no garden visuals left", () => {
    const offenders = files.filter((file) => GARDEN_IMPORTS.test(fs.readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });
});
