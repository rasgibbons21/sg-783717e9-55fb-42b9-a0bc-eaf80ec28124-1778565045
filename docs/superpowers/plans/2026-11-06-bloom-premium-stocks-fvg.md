# Bloom Premium Stocks & FVG Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the live gold-focused Bloom with a premium dark-and-ivory stock analysis academy. It teaches FVGs and related price-action setups through interactive chart exercises, then lets members practise on US stocks.

**Architecture:** Reuse the existing shell, lesson engine, Practice safety work, leaderboards and Pansy rules. Add a shared SVG chart stage, built on tested pattern builders and detectors, that powers new lesson blocks and the Practice chart. Swap the curriculum data, the instrument list and the theme tokens.

**Tech Stack:** Next.js 15 pages router, React 18, TypeScript, Tailwind, Supabase, Vitest, Finnhub (stock quotes), FMP (candles).

**Spec:** `docs/superpowers/specs/2026-11-06-bloom-premium-stocks-fvg-design.md`

## Global Constraints

- Work on branch `redesign/premium-stocks`, cut from `main`. Never push `main` without Roy's approval. Stage files by explicit path only, and never run `git add` on a path that no longer exists, because that aborts the whole add.
- Colour tokens:
  - Ink `#0C0D0B`, Panel `#1A1814`, Ivory `#F6F1E8`, Paper `#FBF8F2`
  - Light text `#F3EEE4`, Dark text `#1A1814`, Muted `#A79E91` on dark and `#6F6860` on ivory
  - Gold `#C4A574`, Sage `#8FA088`, Blush `#D9B8AE`, Rule `rgba(196,165,116,0.25)`
- Gold is never used as text on ivory. Body text is at least 16px. No horizontal scroll at 375px.
- Entrance motion uses CSS (`bloom-rise`), not JavaScript, and respects `prefers-reduced-motion`.
- Fonts: Instrument Serif for headlines, Inter for body.
- Lessons, Home, Practice, Pansy and Profile copy never mentions gold, forex, XAUUSD, CFDs, ounces or lots. Brokers and the legal pages are the exceptions.
- No trade calls anywhere. Lesson charts are always captioned "Illustrative example".
- Practice instruments: SPY, QQQ, IWM, DIA, AAPL, MSFT, NVDA, AMZN, GOOGL, META, TSLA, AMD, JPM, KO, DIS. Whole shares only, with no leverage. Hours are 9:30am to 4pm New York time.
- Setup types: FVG, IFVG, Order block, Breaker block, Liquidity sweep, BOS, CHoCH, OTE, Silver Bullet, Supply & demand, Support & resistance, Breakout, CRT, Power of 3, Other.
- Timeframes: Daily, 1H, 5m.
- Process score: 25 points each for a stop, a planned reward-to-risk of at least 1.5, risk of 1% or less of the balance, and a non-empty note.
- Migrations are additive and applied by Roy. A Bash heredoc must not contain an apostrophe; use the Write tool for scripts instead.
- The dev server and `npm run build` must not run at the same time, because the build wipes `.next`.

## Review Focus

1. **Touch on small phones:** dragging a zone or a level must not scroll the page. Handles need at least a 44px hit area, and there must be a keyboard alternative. Pinned in Task 5, with `touch-action: none` and an arrow-key test.
2. **Reversed or sloppy drags:** a zone dragged with top below bottom, or levels placed in a mixed-up order, is normalised before grading and never crashes. Pinned in Task 6.
3. **Market closed or no intraday data:** outside stock hours, orders get the resting message. A missing 1H or 5m feed shows a kind chart fallback. Pinned in Tasks 10 and 12.
4. **Legacy gold, forex and index positions:** they can still be closed, never appear in the picker, and never count on the Practice gains leaderboard. Pinned in Tasks 10 and 11.
5. **Timeframe aggregation:** a partial last bucket and gaps must not produce invented candles. Pinned in Task 3.

---

## Stage 1: Look

### Task 1: Premium tokens, fonts and brand mark

**Files:**
- Modify: `src/styles/globals.css`, `tailwind.config.ts`, `src/pages/_document.tsx`, `public/manifest.json`, `public/sw.js`, `capacitor.config.ts`, `twa-manifest.json`, `src/components/brand/BloomMark.tsx`, `src/config/copySweep.test.ts`

**Interfaces:**
- Produces: CSS variables `--bloom-ink`, `--bloom-panel`, `--bloom-ivory`, `--bloom-paper`, `--bloom-text-light`, `--bloom-text-dark`, `--bloom-muted`, `--bloom-muted-ivory`, `--bloom-gold`, `--bloom-sage`, `--bloom-blush`, `--bloom-rule`. Utility classes `.surface-ivory` (ivory background, dark text, muted variable switched to `--bloom-muted-ivory`) and `.rule` (thin gold hairline).

Steps:

- [ ] **Step 1:** Create the branch with `git switch -c redesign/premium-stocks`, then commit the spec and plan.
- [ ] **Step 2: Write the failing test.** In `copySweep.test.ts`, replace `DARK_COLOURS` with `SOFT_THEME = /#(3F4F3E|EFD9D3|B98A72|C2A15A|E6ECE3|8A5B44)\b/i`. Add an assertion that no file imports `brand/Botanical` or `BloomGarden`. Run it. Expected: FAIL, listing current files.
- [ ] **Step 3:** Set the tokens. shadcn `--background` is ink, `--card` is panel, `--primary` is gold with ink foreground, `--muted-foreground` is the dark-surface muted tone, and `--accent` is blush at low alpha. Remap the legacy `--r-*` variables by role to the new tokens.
- [ ] **Step 4:** Swap the Google Fonts import to Instrument Serif and Inter, and update the Tailwind `serif` and `sans` families.
- [ ] **Step 5:** Redraw `BloomMark` as a fine-line geometric bloom: five gold-stroked outline petals with no fill, keeping the same props.
- [ ] **Step 6:** Set theme and background colours to `#0C0D0B` in the manifest, Capacitor config, TWA config and `theme-color`. Bump the service worker cache to `bloom-v3`.
- [ ] **Step 7:** Commit with `feat: premium dark-and-ivory theme`. The sweep test stays red until Task 2.

### Task 2: Restyle shell and remove garden visuals

**Files:**
- Create: `src/components/ProgressLine.tsx`
- Modify: `AppShell.tsx`, `Layout.tsx`, `RiskNote.tsx`, `SignUpBanner.tsx`, `onboarding.tsx`, `leaderboard.tsx`, `brokers.tsx`, `practice.tsx`, `profile.tsx`, `lessons/index.tsx`, `home/*`, `lessons/LessonComplete.tsx`, `lessons/blocks/*`
- Delete: `src/components/brand/Botanical.tsx`, `src/components/BloomGarden.tsx`

**Interfaces:**
- Produces: `<ProgressLine done={number} total={number} label?: string />`, a thin gold progress bar with a count.

Steps:

- [ ] **Step 1:** Replace every `Botanical` and `BloomGarden` usage with `ProgressLine`, or with nothing. Replace the soft hexes with tokens. Reading surfaces (lesson blocks, forms, legal text) use `.surface-ivory`, and chrome uses panel.
- [ ] **Step 2:** Run `npx vitest run` and `npx tsc --noEmit`. Expected: copy sweep PASS, everything green.
- [ ] **Step 3:** With the dev server running, check `/`, `/onboarding`, `/lessons`, `/practice?pro=1` and `/about` at 375px. Confirm no horizontal scroll and readable contrast, and take a screenshot.
- [ ] **Step 4:** Commit with `feat: premium shell and surfaces`.

## Stage 2: Chart stage

### Task 3: Chart types, scales, aggregation and detectors

**Files:**
- Create: `src/lib/charts/types.ts`, `src/lib/charts/scale.ts`, `src/lib/charts/aggregate.ts`, `src/lib/charts/detectors.ts`, plus `*.test.ts` for each

**Interfaces:**
- Produces:

```ts
interface Candle { time: number; open: number; high: number; low: number; close: number; volume: number }
interface Zone { top: number; bottom: number }
interface FVG { indexes: [number, number, number]; direction: "bullish" | "bearish"; zone: Zone }
interface Swing { index: number; type: "high" | "low"; price: number }
priceScale(min: number, max: number, height: number, pad?: number): { toY(p: number): number; toPrice(y: number): number }
aggregateCandles(candles: Candle[], size: number): Candle[]
findFVGs(candles: Candle[]): FVG[]
consequentEncroachment(zone: Zone): number
findSwings(candles: Candle[], lookback?: number): Swing[]
detectBreaks(candles: Candle[]): { index: number; kind: "BOS" | "CHoCH"; direction: "bullish" | "bearish"; level: number }[]
volumeConfirms(candles: Candle[], index: number, factor?: number, window?: number): boolean
isPremium(price: number, rangeLow: number, rangeHigh: number): boolean
riskReward(entry: number, stop: number, target: number): number
```

- `findFVGs` rules:
  - **Bullish:** `c[i+2].low > c[i].high`, with zone `{ bottom: c[i].high, top: c[i+2].low }`.
  - **Bearish:** `c[i+2].high < c[i].low`, with zone `{ top: c[i].low, bottom: c[i+2].high }`.
- `volumeConfirms`: the candle's volume is at least `factor` (default 1.5) times the average of the previous `window` (default 10) candles.
- `findSwings` defaults to a lookback of 2.
- `detectBreaks` labels the first close beyond the last opposite swing after a trend change as CHoCH, and continuation breaks as BOS.

Steps:

- [ ] **Step 1: Write failing tests**, each with hand-written candle arrays:
  - **FVG:** a bullish FVG is found with the exact zone, a bearish one likewise, and no gap when wicks overlap. Consequent encroachment of `{top:110, bottom:100}` is 105.
  - **Aggregation:** `aggregateCandles` of 7 candles with size 3 gives 3 candles, the last built from one source candle. Open is the first open, close the last close, high and low are the extremes, and volume is the sum.
  - **Scale:** `priceScale(100, 200, 300, 0)` maps 200 to 0 and 100 to 300, and `toPrice(toY(150)) === 150`.
  - **Volume:** `volumeConfirms` is true at 2x average and false at 1.2x.
  - **Premium:** `isPremium(80, 0, 100)` is true and `isPremium(20, 0, 100)` is false.
  - **Reward-to-risk:** `riskReward(100, 98, 106) === 3`.
  - **Breaks:** in an uptrend series a BOS is detected at the expected index, and after a reversal the first break is CHoCH.
- [ ] **Step 2:** Run them. Expected: FAIL, modules missing.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run them. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: chart maths and pattern detectors`.

### Task 4: Pattern builders

**Files:**
- Create: `src/lib/charts/patterns.ts`, `src/lib/charts/patterns.test.ts`

**Interfaces:**
- Consumes: Task 3.
- Produces: seeded, repeatable builders that each return `{ candles: Candle[]; answer: ... }`:

| Builder | Answer |
|---|---|
| `bullishFVG(seed)`, `bearishFVG(seed)` | `{ fvg: FVG }` |
| `inverseFVG(seed)` | `{ fvg: FVG; flipIndex: number }` |
| `liquiditySweep(seed, side)` | `{ sweepIndex: number; level: number }` |
| `orderBlock(seed, direction)` | `{ obIndex: number; zone: Zone; displacementIndex: number }` |
| `breakerBlock(seed)` | `{ zone: Zone; brokenIndex: number }` |
| `structureBreak(seed, kind)` | `{ index: number; level: number }` |
| `ote(seed)` | `{ swingLow: number; swingHigh: number; zone: Zone }` (62% to 79% retracement) |
| `supplyDemand(seed, kind)` | `{ zone: Zone }` |
| `supportResistance(seed)` | `{ level: number; touches: number[] }` |
| `breakoutRetest(seed)` | `{ level: number; breakIndex: number; retestIndex: number }` |
| `powerOf3(seed)` | `{ accumulation: [number, number]; manipulationIndex: number; distributionStart: number }` |
| `candleRange(seed)` | `{ rangeIndex: number; sweepIndex: number }` |
| `silverBullet(seed)` | 5-minute candles with New York times, `{ windowStart: number; windowEnd: number; fvg: FVG }` |

- Every builder sets realistic volume: displacement candles get at least 2x average volume, and quiet ranges stay below average.
- Every builder returns a `multi` pair `{ daily: Candle[]; h1: Candle[]; m5: Candle[] }`, made with `aggregateCandles`, wherever a lesson needs timeframes.

Steps:

- [ ] **Step 1: Write failing tests.** Across seeds 1 to 20, each builder's answer agrees with the detectors:
  - `findFVGs` contains the answer FVG.
  - `volumeConfirms` holds at the displacement candle.
  - `detectBreaks` finds the BOS or CHoCH index.
  - For `silverBullet`, the FVG candle times fall between 10:00 and 11:00 New York time.
  - Every candle is valid (`low <= open, close <= high`).
  - The same seed gives identical output.
- [ ] **Step 2:** Run them. Expected: FAIL.
- [ ] **Step 3:** Implement with a seeded random walk plus scripted pattern segments.
- [ ] **Step 4:** Run them. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: seeded chart pattern builders`.

### Task 5: ChartStage component

**Files:**
- Create: `src/components/charts/ChartStage.tsx`, `src/components/charts/useDrag.ts`, `src/lib/charts/keyboard.ts`, `src/lib/charts/keyboard.test.ts`

**Interfaces:**

```ts
type Mode = "view" | "tapCandles" | "markZone" | "placeLevels";
interface Levels { entry?: number; stop?: number; target?: number }
interface ChartStageProps {
  timeframes: { label: string; candles: Candle[] }[];
  initialTimeframe?: string;
  onTimeframeChange?: (label: string) => void;
  mode?: Mode;
  selected?: number[];
  onSelect?: (indexes: number[]) => void;
  zone?: Zone | null;
  onZoneChange?: (zone: Zone) => void;
  levels?: Levels;
  onLevelsChange?: (levels: Levels) => void;
  overlays?: { zones?: (Zone & { label?: string })[]; lines?: { price: number; label: string }[] };
  height?: number;
  caption?: string;
}
nudge(value: number, key: "ArrowUp" | "ArrowDown", step: number, min: number, max: number): number
```

- The stage draws a candle pane (about 75%) and a volume pane (about 25%).
- Handles are 44px tall, with `touch-action: none` on the stage.
- Focused handles move by `nudge` with the arrow keys, by one tick: 0.5% of the visible range.

Steps:

- [ ] **Step 1: Write a failing test** for `nudge`: it moves by `step`, clamps at `min` and `max`, and ignores other keys.
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3:** Implement `ChartStage` and `useDrag` with pointer events and pointer capture.
  - The timeframe switcher is a segmented control.
  - Default caption: "Illustrative example".
  - Selected candles get a gold outline.
  - Zones are gold at 15% opacity with handles.
  - Levels are lines labelled Entry, Stop and Target, with a live "R:R 1:x" readout.
- [ ] **Step 4:** Run tests and typecheck, then add a dev-only fixture page `src/pages/dev/chart.tsx` that returns 404 unless `NODE_ENV === "development"`. Check at 375px that drag doesn't scroll the page, and take a screenshot.
- [ ] **Step 5:** Commit with `feat: interactive chart stage`.

## Stage 3: Lessons

### Task 6: Chart lesson blocks and grading

**Files:**
- Create: `src/data/lessons-stocks/types.ts` (moved from `lessons-v2/types.ts` and extended), `src/lib/lessons/grading.ts`, `src/lib/lessons/grading.test.ts`, `src/components/lessons/blocks/{ChartFindBlock,ChartZoneBlock,ChartVolumeBlock,ChartTimeframeBlock,ChartPlanBlock}.tsx`
- Modify: `src/lib/lessons/engine.ts`, `LessonPlayer.tsx`, existing blocks' type imports
- Delete: `ChartTapBlock.tsx`, `SliderBlock.tsx` and the `slider` and `chartTap` types

**Interfaces:**

```ts
interface ChartSpec { timeframes: { label: string; candles: Candle[] }[]; initial: string }
type LessonBlock =
  | text | pansy | quiz | scenario | order   // unchanged
  | { type: "chartFind"; prompt: string; chart: ChartSpec; answer: number[]; explanation: string }
  | { type: "chartZone"; prompt: string; chart: ChartSpec; answer: Zone; explanation: string }
  | { type: "chartVolume"; prompt: string; chart: ChartSpec; index: number; confirms: boolean; explanation: string }
  | { type: "chartTimeframe"; prompt: string; chart: ChartSpec; expectTimeframe: string; q: string; options: string[]; correct: number; explanation: string }
  | { type: "chartPlan"; prompt: string; chart: ChartSpec; direction: "long" | "short"; entryZone: Zone; invalidation: number; minRR: number; explanation: string };
interface Lesson { slug; moduleId; title; subtitle; minutes; kind: "concept" | "setup"; blocks; practiceHint }
gradeFind(selected: number[], answer: number[]): boolean      // set equality
gradeZone(drawn: Zone, answer: Zone, minOverlap?: number): boolean  // normalises top/bottom; overlap / union >= 0.6
gradePlan(levels: Levels, rules: { direction; entryZone: Zone; invalidation: number; minRR: number }): { ok: boolean; reasons: string[] }
```

- `gradePlan` reasons use the exact copy:
  - "Your entry should sit inside the zone."
  - "Your stop should sit beyond the point where the idea is wrong."
  - "Aim for a reward at least 1.5 times your risk."
- `isInteractive` is true for every `chart*` type.

Steps:

- [ ] **Step 1: Write failing tests:**
  - **Find:** `gradeFind([3,2,4],[2,3,4])` is true.
  - **Zone:** a zone with swapped edges still passes, a zone with 50% overlap fails, and one with 80% passes.
  - **Plan:**
    - A long plan with entry inside, stop below invalidation and reward-to-risk of 2 is ok.
    - A stop above invalidation gives the stop reason.
    - A reward-to-risk of 1 gives the reward reason.
    - Missing levels are not ok and don't crash.
    - The mirrored short case works too.
- [ ] **Step 2:** Run them. Expected: FAIL.
- [ ] **Step 3:** Implement grading and the five blocks, using `ChartStage` in the matching mode.
  - Kind retry copy as before.
  - The volume block offers "Yes, volume confirms it" and "No, volume is weak".
  - The timeframe block requires switching to `expectTimeframe` before the question unlocks.
- [ ] **Step 4:** Run all tests and typecheck. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: chart lesson blocks with grading`.

### Task 7: Curriculum modules 1 to 3 and routing

**Files:**
- Create: `src/data/lessons-stocks/index.ts`, `m1-foundations.ts`, `m2-structure.ts`, `m3-liquidity.ts`, `index.test.ts`
- Modify: every importer of `@/data/lessons-v2`, `src/lib/postAuthPath.ts` and its test, `src/config/retiredRoutes.mjs` and its test
- Delete: `src/data/lessons-v2/*`

**Interfaces:**
- Produces: the same API as before (`MODULES`, `ALL_LESSONS`, `getLesson`, `nextLesson`, `lessonsInModule`, `firstIncomplete`, `hasFinishedCourse`).
- `FIRST_LESSON_PATH = "/lessons/reading-a-stock-chart"`.
- `RETIRED_ROUTES` gains the 19 old gold lesson slugs as `/lessons/<slug>`, redirecting to `/lessons`.

Steps:

- [ ] **Step 1:** Move the old data test to the new folder and update it:
  - Seven modules with ids `foundations`, `structure`, `liquidity`, `imbalances`, `institutional`, `models`, `execution`.
  - Exactly 26 lessons.
  - The first slug is `reading-a-stock-chart`.
  - Every lesson is interactive.
  - Every `kind: "setup"` lesson has, in order, (`chartFind` or `chartZone`), then `scenario`, then `chartVolume`, then `chartTimeframe`, then `chartPlan`.
  - Every chart answer matches its builder's answer.
  - Lesson text never matches `/\b(gold|forex|xauusd|cfds?|ounces?|lots?)\b/i`, the trade-call words, or `/\bkrm\b/i`.
  - Every setup lesson contains the phrase "When to skip it".
  - Update the `postAuthPath` and retired-route tests for the new first path and the old slugs.
- [ ] **Step 2:** Run them. Expected: FAIL.
- [ ] **Step 3:** Write modules 1 to 3, using these slugs:

| Module | Lessons |
|---|---|
| 1 | `reading-a-stock-chart`, `candles-and-volume`, `timeframes`, `multi-timeframe-analysis` |
| 2 | `trend-and-swings`, `break-of-structure`, `change-of-character`, `support-and-resistance` |
| 3 | `where-liquidity-rests`, `liquidity-sweeps`, `premium-and-discount`, `supply-and-demand` |

  Charts come from Task 4's builders at fixed seeds. Write the index with all seven modules listed.
- [ ] **Step 4:** Run the tests. They stay red only on the module count, until Task 8.
- [ ] **Step 5:** Commit with `feat: stock curriculum modules 1-3`.

### Task 8: Curriculum modules 4 to 7

**Files:**
- Create: `m4-imbalances.ts`, `m5-institutional.ts`, `m6-models.ts`, `m7-execution.ts`

Steps:

- [ ] **Step 1:** Write the modules, using these slugs:

| Module | Lessons |
|---|---|
| 4 | `fair-value-gaps`, `consequent-encroachment`, `inverse-fvg`, `displacement` |
| 5 | `order-blocks`, `breaker-blocks`, `optimal-trade-entry` |
| 6 | `power-of-three`, `silver-bullet`, `candle-range-theory`, `breakout-and-retest` |
| 7 | `the-execution-checklist`, `position-sizing-and-skipping`, `journaling-your-analysis` |

  - `fair-value-gaps` covers bullish and bearish gaps, the three-candle rule and when a gap matters.
  - Silver Bullet uses New York time.
  - Module 7 applies the checklist to liquid US stocks and ETFs and ends with the Practice handoff.
- [ ] **Step 2:** Run `npx vitest run src/data/lessons-stocks`. Expected: PASS.
- [ ] **Step 3:** Walk `fair-value-gaps` with `?pro=1` at 375px in the browser. Confirm every block completes and there are no console errors.
- [ ] **Step 4:** Commit with `feat: stock curriculum modules 4-7`.

### Task 9: Home, lessons index and endings

**Files:**
- Modify: `src/components/home/SignedOutHero.tsx`, `HeroCards.tsx` (replaced by `HeroPreview.tsx`), `SignedInHome.tsx`, `src/pages/lessons/index.tsx`, `LessonComplete.tsx`, `src/pages/index.tsx` (SEO)
- Delete: `HeroCards.tsx`

**Interfaces:**
- Consumes: `ChartStage`, `bullishFVG`, the lessons API.
- Produces: `POINTS_PER_LESSON = 5`, which replaces `BLOOMS_PER_LESSON`.

Steps:

- [ ] **Step 1:** Extend the copy-sweep test to ban `/\bblooms?\b/i` in pages and components, and require the exact string "Learn to read stocks with skill. Free." in `SignedOutHero.tsx`. Run it. Expected: FAIL.
- [ ] **Step 2:** Build the hero:
  - Headline: "Learn to read stocks with skill. Free."
  - One "Start free" button and "No card. Nothing to upgrade."
  - A `HeroPreview` running a static "Tap the three candles of the gap" `chartFind` demo on `bullishFVG(7)`.
- [ ] **Step 3:** Build the lessons index and signed-in Home:
  - **Lessons index:** module sections with `ProgressLine`, and "Up next".
  - **Signed-in Home:** continue card, progress by module, and leaderboard standing in points.
  - **LessonComplete:** "+5 points", with the broker card only at module ends, US rules unchanged.
- [ ] **Step 4:** Optionally use the last MotionSites free prompt open, only if a premium editorial dark hero matches. Adapt layout and motion only. If none fits, skip and record a ruling.
- [ ] **Step 5:** Run tests, then check `/`, `/lessons` and `/home?pro=1` at 375px and 1280px, and take screenshots.
- [ ] **Step 6:** Commit with `feat: premium home and lessons path`.

## Stage 4: Practice and leaderboards

### Task 10: Stock instruments, hours and trade plan API

**Files:**
- Create: `src/config/setups.ts`, `supabase/migrations/20261106_practice_trade_plan.sql`
- Modify: `src/config/instruments.ts`, `src/lib/practice/maths.ts`, `marketHours.ts`, `src/lib/serverQuote.ts`, `src/pages/api/practice/trades.ts`, `ohlc.ts`, plus the tests `maths.test.ts`, `marketHours.test.ts`, `serverQuote.test.ts`, `tradesHandler.test.ts`

**Interfaces:**
- `Instrument` gains `assetClass: "stock" | "etf" | "metal" | "forex" | "index"`, `listed: boolean` and `feed: "finnhub" | "fmp"`.
- The 15 stocks and ETFs are `listed: true`, `leverage: 1`, `unitsPerLot: 1`, `decimals: 2`, `feed: "finnhub"`, `feedSymbol` equal to the symbol.
- The old seven instruments are `listed: false` and unchanged otherwise.
- `LISTED_INSTRUMENTS = INSTRUMENTS.filter(i => i.listed)`.
- `SETUP_TYPES` and `TIMEFRAMES` are as in Global Constraints.
- POST `/api/practice/trades` body: `{ ticker, direction, shares, stop_price, target_price?, setup_type, timeframe, thesis? }`.
- Migration: `ALTER TABLE practice_trades ADD COLUMN IF NOT EXISTS setup_type TEXT, ADD COLUMN IF NOT EXISTS timeframe TEXT, ADD COLUMN IF NOT EXISTS risk_pct NUMERIC(6,2);`

Steps:

- [ ] **Step 1: Write failing tests:**
  - **Margin:** `marginFor("AAPL", 200, 5) === 1000`.
  - **Picker:** `LISTED_INSTRUMENTS` has exactly the 15 symbols, and `getInstrument("XAUUSD")?.listed === false`.
  - **Hours:** `isMarketOpen("AAPL", Wed 15:00Z) === true`, false at 14:00Z and on Saturday. XAUUSD keeps its old hours for closing.
  - **Quotes:** `getServerQuote("AAPL")` calls Finnhub with `AAPL`.
  - **Trades handler:**
    - `{ticker:"AAPL", shares:2, stop_price:190, setup_type:"FVG", timeframe:"1H"}` at fill 200 reserves 400 and stores `setup_type`, `timeframe` and `risk_pct: 0.2` against a 10000 balance.
    - Fractional or zero shares give 400.
    - XAUUSD on a new order gives 400 with "That market isn't available in Practice anymore."
    - A missing `setup_type` or `timeframe` gives 400.
    - The stock-hours resting message is returned with 409.
- [ ] **Step 2:** Run them. Expected: FAIL.
- [ ] **Step 3:** Implement:
  - Stocks quote through Finnhub and legacy instruments through FMP.
  - Stocks and ETFs follow the index hours.
  - `ohlc.ts` maps the timeframes Daily to `daily`, 1H to `1hour` and 5m to `5min`, and returns `{ bars: [] }` rather than an error when the feed has nothing.
  - Write the migration.
- [ ] **Step 4:** Run the whole suite. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: stock instruments and trade plan`. Ask Roy to apply the migration before deploy.

### Task 11: Process score and stock-only leaderboard

**Files:**
- Create: `src/lib/practice/process.ts`, `src/lib/practice/process.test.ts`
- Modify: `src/pages/api/practice/leaderboard.ts`, `src/lib/leaderboard/rank.ts` (if needed), `src/pages/leaderboard.tsx`

**Interfaces:**

```ts
processScore(trade: { entry_price: number; stop_price: number | null; target_price: number | null; risk_pct: number | null; thesis: string | null; direction: "long" | "short" }): number  // 0-100 in steps of 25
countsForStockBoard(ticker: string): boolean  // true for listed stocks/ETFs and for unknown legacy stock tickers; false for metals, forex, indices
```

- Each practice leaderboard row gains `avg_process: number`.

Steps:

- [ ] **Step 1: Write failing tests:**
  - **Score of 100:** stop 98, target 106, entry 100, risk 1, non-empty note.
  - **Score of 50:** no target and a blank note.
  - **Missing risk:** `risk_pct: null` scores 0 for that rule.
  - **Board filter:** `countsForStockBoard("XAUUSD") === false`, `"EURUSD"` false, `"US500"` false, `"AAPL"` true, and `"BRKB"` (unknown legacy) true.
- [ ] **Step 2:** Run them. Expected: FAIL.
- [ ] **Step 3:** Implement. The leaderboard API selects `ticker, pnl, entry_price, stop_price, target_price, risk_pct, thesis, direction`, filters with `countsForStockBoard`, and averages the process score. The page shows "Process 75" beside P&L, and the tab is titled "Practice gains (stocks)".
- [ ] **Step 4:** Run the suite. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: process score and stock-only practice board`.

### Task 12: Practice screen with chart tools

**Files:**
- Modify: `src/pages/practice.tsx`, `src/components/OrderTicket.tsx`, `src/components/ActiveTradeCard.tsx`
- Delete: `src/components/CandlestickChart.tsx`, `src/components/DynamicChart.tsx`, if unused

**Interfaces:**
- Consumes: `ChartStage` (`placeLevels` mode), `LISTED_INSTRUMENTS`, `SETUP_TYPES`, `TIMEFRAMES`, `processScore`.

Steps:

- [ ] **Step 1:** Build the Practice screen:
  - **Picker:** chips from `LISTED_INSTRUMENTS`, with SPY as the default.
  - **Chart:** a `ChartStage` with Daily, 1H and 5m loaded from `/api/practice/ohlc` (last 90 bars). When a timeframe has no bars, show "This timeframe isn't available right now. Try Daily."
  - **Levels:** "Plan on chart" switches to `placeLevels`, and the dragged entry, stop and target fill the ticket.
  - **Ticket:** a shares stepper (whole numbers, minimum 1), plus setup and timeframe selects (required), the stop, an optional target and a note. It shows R:R, risk in dollars and risk percentage.
  - **Results:** closed trades show their process score.
  - **Copy:** the heading reads "Practise what you just learned, with structure."
- [ ] **Step 2:** Run tests, typecheck and lint.
- [ ] **Step 3:** Check `/practice?pro=1` at 375px. Confirm the layout, no scroll while dragging, and the empty-feed fallback. Signed-in trading is for Roy on the preview.
- [ ] **Step 4:** Commit with `feat: stock practice with chart planning`.

## Stage 5: Pansy, Brokers, Profile and copy

### Task 13: Pansy for stock analysis

**Files:**
- Modify: `src/lib/pansyPersona.ts`, `src/lib/outputFilter.test.ts`, `src/pages/ask-pansy.tsx`, `scripts/check-pansy.mjs`

Steps:

- [ ] **Step 1: Add failing filter cases:**
  - **Flagged:** "Buy AAPL now", "short TSLA at 250", "enter NVDA above 140", "your stop on SPY at 580".
  - **Unchanged:** "A fair value gap forms when the first and third candles don't overlap." and "For example, imagine a made-up stock at $100 with a gap between 101 and 103."
  - Run them. Expected: the stop-on-ticker case FAILs.
- [ ] **Step 2:** Widen the stop pattern to allow a ticker between the word stop and the level.
- [ ] **Step 3:** Rewrite the persona:
  - Covers stocks and ETFs only, the seven modules, and the setups in section 2 of the spec, explained in general with labelled made-up examples.
  - Never marks up, predicts or plans a real ticker.
  - Covers brokers by region.
  - Doesn't discuss gold or forex trading, and points those questions back to stocks.
  - Update the suggested prompts and the `check-pansy` questions, adding "Where's the FVG on NVDA right now?".
- [ ] **Step 4:** Run the suite. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: Pansy for stock analysis`.

### Task 14: Brokers by region

**Files:**
- Modify: `src/lib/brokers/region.ts` and its test, `src/pages/brokers.tsx`, `src/config/brokers.ts`

**Interfaces:**
- `brokersFor(notice: BrokerNotice, all: BrokerConfig[]): BrokerConfig[]`:
  - **us:** active brokers whose regions include US, plus TradingView.
  - **general:** every active broker plus IC Markets as information only.
  - **unknown:** the same list as general, but with no buttons.

Steps:

- [ ] **Step 1: Write failing tests:**
  - `brokersFor("us")` contains `webull` and `tradingview`, and not `xm`.
  - `brokersFor("general")` contains `xm`, `exness`, `vantage`, `avatrade`, `deriv`, `icmarkets` and `tradingview`.
  - `canShowOpenButton` is unchanged.
- [ ] **Step 2:** Run them. Expected: FAIL.
- [ ] **Step 3:** Implement and rewrite the page.
  - **Heading:** "Where to practise for real".
  - **Broker notes:** a stocks-focused note per broker. CFD brokers read "Offers CFDs on US shares" with a CFD risk line ("CFDs are complex and carry a high risk of losing money quickly. Check the broker's own risk warning."). Webull reads "Real US shares".
  - **Unchanged:** the commission disclosure, the country notice and the US notice wording, adjusted for stocks.
  - Re-check each broker's stock offering on its public site. Record `verifiedAt` and `sourceNotes`, and use `null` where something isn't confirmed.
- [ ] **Step 4:** Run tests, then check `/brokers` at 375px.
- [ ] **Step 5:** Commit with `feat: regional brokers for stocks`.

### Task 15: Profile, About, legal, store and final copy sweep

**Files:**
- Modify: `src/pages/profile.tsx`, `about.tsx`, `terms.tsx`, `disclaimer.tsx`, `privacy.tsx`, `src/components/SEO.tsx`, `PLAY_LISTING.md`, `public/manifest.json` (name and description), `src/config/copySweep.test.ts`

Steps:

- [ ] **Step 1:** Extend the sweep. In pages and components, excluding `brokers.tsx`, legal pages, `api/` and `admin`, ban `/\b(gold|forex|xauusd|cfds?|ounces?)\b/i` in readable text. Run it. Expected: FAIL, listing offenders.
- [ ] **Step 2:** Fix each offender:
  - **Profile:** progress per module with `ProgressLine`, a practice summary with average process score, the leaderboard toggle and the account section.
  - **About and FAQ:** rewritten for stock analysis.
  - **Legal:** terms and disclaimer cover stocks, with the CFD warning kept for broker links. Mark them as a draft for Roy.
  - **Store and SEO:** the Play listing becomes "Bloom: Learn to Read Stocks", and SEO defaults and the manifest are updated to match.
- [ ] **Step 3:** Run tests, lint, typecheck and build, after stopping the dev server. Expected: all pass.
- [ ] **Step 4:** Commit with `feat: stock-focused profile, legal and listing`.

### Task 16: Final verification and review

Steps:

- [ ] **Step 1:** Restart the dev server and walk these pages at 375px and 1280px, checking console errors and taking screenshots:
  - `/`, `/onboarding`, `/lessons`
  - `/lessons/fair-value-gaps?pro=1`, `/lessons/silver-bullet?pro=1`
  - `/practice?pro=1`, `/leaderboard?pro=1`, `/ask-pansy?pro=1`, `/brokers`, `/profile?pro=1`
  - old gold lesson URLs, which should redirect
- [ ] **Step 2:** Check each success criterion in spec section 1, and report which were verified and which weren't.
- [ ] **Step 3:** Dispatch the whole-branch reviewer on `opus` with this plan's Review Focus. Fix Critical and Important findings test-first in one pass.
- [ ] **Step 4:** Present the integration options. The live deploy needs Roy's approval and the Task 10 migration applied first.
