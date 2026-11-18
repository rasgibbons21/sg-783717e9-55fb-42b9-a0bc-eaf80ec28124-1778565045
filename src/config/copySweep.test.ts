import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const ROOTS = ["src/pages", "src/components"];
const SKIP = [/[\\/]api[\\/]/, /[\\/]ui[\\/]/, /refund-policy\.tsx$/, /\.test\.tsx?$/, /[\\/]admin/, /PansyStory\.tsx$/];

// "Setup" is allowed now: the stock curriculum teaches named setups and Practice records which one was used.
const BANNED_WORDS = /\b(signals?|scanners?|gap[- ]and[- ]go|screener|upgrade|free trial|go pro|pro plan|bloom pro|trading desk|watchlist)\b/i;
const OLD_THEMES = /#(07080C|0C1016|121821|171E28|0E1B30|06060a|F3EDE3|27B7C8|3F4F3E|EFD9D3|B98A72|C2A15A|E6ECE3|8A5B44)\b/i;

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

  it("talks about points, not blooms", () => {
    const offenders = files.flatMap((file) =>
      readableText(fs.readFileSync(file, "utf8"))
        // "Bloom" the brand is fine; "blooms" as a points unit isn't.
        .map((text) => text.replace(/She Blooms Wealth/gi, ""))
        .filter((text) => /\b[Bb]looms\b|\b(a|new|your) bloom\b/.test(text))
        .map((text) => `${file}: ${text.slice(0, 80)}`),
    );
    expect(offenders).toEqual([]);
  });

  it("stays on stocks outside the broker and legal pages", () => {
    const allowed = /(brokers|terms|disclaimer|privacy|refund-policy|delete-account)\.tsx$/;
    const offenders = files
      .filter((file) => !allowed.test(file))
      .flatMap((file) =>
        readableText(fs.readFileSync(file, "utf8"))
          .filter((text) => /\b(gold|forex|xauusd|cfds?|ounces?)\b/i.test(text.replace(/bloom-gold/g, "")))
          .map((text) => `${file}: ${text.slice(0, 80)}`),
      );
    expect(offenders).toEqual([]);
  });

  it("opens with the blossom welcome", () => {
    const hero = fs.readFileSync("src/components/home/SignedOutHero.tsx", "utf8");
    expect(hero).toContain("Start Blooming");
    expect(hero).toContain("grow your savings with Pansy");
    expect(hero).toContain('from "@/components/brand/Botanical"');
  });

  it("uses the cream blossom icon, not the old navy bull", async () => {
    const sharp = (await import("sharp")).default;
    for (const file of ["public/icon-192.png", "public/icon-512.png", "public/apple-touch-icon.png"]) {
      const { data } = await sharp(file).extract({ left: 2, top: 2, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
      expect([data[0], data[1], data[2]], file).toEqual([246, 241, 232]);
    }
  });
});

describe("ivory theme", () => {
  const DARK = /#0C0D0B|#24201A|surface-ivory|--bloom-panel|--bloom-text-light|--bloom-text-dark|--bloom-muted-ivory/i;
  const everySource = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return everySource(full);
      return /\.(tsx?|css)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
    });

  it("keeps the old dark theme out", () => {
    const offenders = everySource("src").filter((file) => DARK.test(fs.readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });

  it("defines the ivory tokens", () => {
    const css = fs.readFileSync("src/styles/globals.css", "utf8");
    for (const token of [
      "--bloom-ivory: #F6F1E8;",
      "--bloom-paper: #FBF8F2;",
      "--bloom-paper-raised: #FFFDF9;",
      "--bloom-ink: #2E2B28;",
      "--bloom-alert: #A0522D;",
      "--bloom-muted: #6F6860;",
      "--bloom-rule: rgba(26, 24, 20, 0.08);",
      "--bloom-sage: #7F9277;",
      "--bloom-blush: #D9B8AE;",
      "--bloom-gold: #C4A574;",
    ]) {
      expect(css).toContain(token);
    }
  });

  it("sets the ivory theme colour", () => {
    const manifest = JSON.parse(fs.readFileSync("public/manifest.json", "utf8"));
    expect(manifest.theme_color).toBe("#F6F1E8");
    expect(manifest.background_color).toBe("#F6F1E8");
    expect(fs.readFileSync("public/sw.js", "utf8")).toContain("bloom-v4");
  });
});
