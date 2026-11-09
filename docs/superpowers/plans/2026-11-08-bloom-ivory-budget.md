# Bloom Ivory, Lesson Stages and Budget Coach Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bloom goes light ivory everywhere. Every lesson runs Lesson → Strategy → Test → Practice. A Budget & Savings coach with Pansy is added, using pay yourself first, exact maths, daily spending and milestone ideas to study.

**Architecture:**
- **Look:** the restyle is token-led in `globals.css`, so existing components follow.
- **Lessons:** each lesson block gains a `stage`, assigned by the templates. Three new block types render the Lesson and Strategy stages, and the player groups blocks by stage.
- **Budget:** a self-contained section with pure maths in `src/lib/budget/`. Data lives in three owner-only Supabase tables, read and written from the browser client. The pages are `/budget` and `/budget/setup`.

**Tech Stack:** Next.js 15 pages router, React 18, TypeScript, Tailwind with shadcn HSL tokens, framer-motion, Supabase (RLS), zod, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-08-bloom-ivory-budget-design.md`. Read it first: tables, copy and maths rules come from there.

## Global Constraints

- **Stocks only.** No gold, forex or CFD wording outside the brokers and legal pages. `copySweep.test.ts` keeps enforcing this.
- **Light only.** No dark theme, no `.surface-ivory`, and no `#0C0D0B` or `#24201A` anywhere in `src/`.
- **Colour tokens:**
  - Page and card colours are exactly `--bloom-ivory #F6F1E8`, `--bloom-paper #FBF8F2` and `--bloom-paper-raised #FFFDF9`.
  - Text is `--bloom-ink #1A1814`, with `--bloom-muted #6F6860` for secondary text and `--bloom-rule rgba(26,24,20,0.08)` for hairlines.
  - Accents are `--bloom-sage #7F9277`, `--bloom-blush #D9B8AE` and `--bloom-gold #C4A574`. Gold is never used for body text.
- **Money:** handled as integer cents everywhere in budget code, and formatted only with `Intl.NumberFormat(..., { style: "currency", currency })`.
- **Ideas to study:** use only `LISTED_INSTRUMENTS` tickers, and every example carries the exact label "To study, not to buy". No budget copy says "buy" except inside "not to buy".
- **Pansy:** never gives personal investment advice or names a stock to buy. Pansy is never renamed.
- **Reminders:** in-app only. No email, push or service-worker notifications.
- **Every new interactive control:** ≥ 44px tap target, a visible focus ring and an accessible name.
- **Motion:** respects `prefers-reduced-motion`.
- **Commits:** end every message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Stage paths explicitly, check with `git status` before committing, and never use `git add -A`, because the `.gradle` and `app/build` noise must stay out.
- **Before each commit:** run `npm test` and `npm run lint`. Run `npm run build` at the end of tasks 1, 4, 11 and 14, with the dev server stopped first.

## Review Focus

1. **Money typed the way people type it:** "1,250.50", "1250", " 45.5 ", "$30" and "12.345" become cents (125050, 125000, 4550, 3000, and "12.345" is rejected). "abc", "", "-5" and "0" (for a pay amount) are rejected with a kind message. Test in Task 7 (`parseMoney`).
2. **A stale payday:** `next_payday` saved months ago still gives the current period. The period start rolls forward until today falls inside a period, for every frequency. Test in Task 7 (`periodBounds`).
3. **Near local midnight:** an entry added at 23:30 in America/Chicago is dated that local day, not UTC tomorrow. Streak and "today" use the plan's time zone. Test in Task 7 (`todayIn`, `streak`).
4. **Milestones after a withdrawal:** if she withdraws and then re-crosses $500, it isn't announced again. A goal equal to a ladder value isn't duplicated. Test in Task 7 (`newlyReached`), with the database primary key as backstop in Task 9.
5. **A lesson resumed after the restructure:** a saved resume index from the old block order still lands inside the lesson. The test total sent to the server is the lesson's real test-block count, so the server never rejects a completion. Test in Task 4 (engine `testCount`) and Task 5 (server ignores a bad total but still completes).

---

## File map

| Area | Files |
|---|---|
| Look | `src/styles/globals.css`, `public/manifest.json`, `public/sw.js`, `src/pages/_document.tsx`, `capacitor.config.*` and the TWA colour config, `src/config/copySweep.test.ts`, `src/components/ui/CountUp.tsx` (new) |
| Chart | `src/components/charts/ChartStage.tsx` (colours plus the `highlight` and `emphasis` props) |
| Lesson model | `src/data/lessons-stocks/types.ts`, `template.ts`, `index.ts`, `m2`–`m6` setup lessons, `index.test.ts` |
| Lesson UI | `src/lib/lessons/engine.ts` (+test), `src/components/lessons/LessonPlayer.tsx`, `StageBar.tsx`, `StageIntro.tsx`, `TestSummary.tsx`, and in `blocks/`: `WorkedExampleBlock.tsx`, `StrategyBlock.tsx`, `PracticeCtaBlock.tsx` |
| Score | `supabase/migrations/20261108_lesson_test_score.sql`, `src/pages/api/lessons/complete.ts`, `src/lib/lessons/saveProgress.ts` (+tests) |
| Practice preselect | `src/lib/practice/preselect.ts` (+test), `src/pages/practice.tsx`, `src/components/OrderTicket.tsx` |
| Budget logic | `src/lib/budget/money.ts`, `maths.ts`, `nudges.ts`, `api.ts`, `types.ts` (+tests), `src/data/budget/ideas.ts` (+test) |
| Budget data | `supabase/migrations/20261108_budget.sql`, `src/lib/budget/migration.test.ts` |
| Budget UI | `src/pages/budget/index.tsx`, `src/pages/budget/setup.tsx`, and in `src/components/budget/`: `SetupFlow.tsx`, `SavingsCard.tsx`, `PeriodCard.tsx`, `AddSpendingSheet.tsx`, `EntryList.tsx`, `Projections.tsx`, `Milestones.tsx`, `IdeasPanel.tsx`, `NudgeCard.tsx`, `useBudget.ts` |
| App-wide | `src/config/navigation.ts` (+test), `src/components/AppShell.tsx`, `src/components/home/SignedInHome.tsx`, `SignedOutHero.tsx`, `src/pages/profile.tsx`, `src/lib/pansyPersona.ts`, `src/pages/ask-pansy.tsx`, `scripts/check-pansy.mjs`, `src/pages/privacy.tsx`, `terms.tsx`, `disclaimer.tsx`, `about.tsx`, `PLAY_LISTING.md` |

---

### Task 1: Ivory tokens and the app-wide light theme

**Files:**
- Modify: `src/styles/globals.css`, `public/manifest.json`, `public/sw.js` (the cache name), `src/pages/_document.tsx` (theme-color), the Capacitor and TWA background colour config (find it with `grep -rn "0C0D0B" --include=*.json --include=*.ts --include=*.xml . | grep -v node_modules | grep -v /build/`)
- Modify: every file under `src/` that uses `surface-ivory`, `--bloom-panel`, `--bloom-panel-raised`, `--bloom-text-light`, `--bloom-text-dark` or `--bloom-muted-ivory` (find them with `grep -rln`)
- Create: `src/components/ui/CountUp.tsx`
- Test: `src/config/copySweep.test.ts`

**Interfaces:**
- Produces: the CSS tokens listed in Global Constraints, plus `--bloom-sage-soft`, `--bloom-blush-soft`, `--bloom-shadow` and `--bloom-shadow-lift`, with exact values from the spec §2.
- Produces: `CountUp({ value, format, durationMs = 600 }: { value: number; format: (n: number) => string; durationMs?: number }): JSX.Element`. It renders `format(value)` at once under reduced motion.

- [ ] **Step 1: Write the failing tests** in `copySweep.test.ts`
  - `it("keeps the old dark theme out")` asserts that no file in `src/` contains `#0C0D0B`, `#24201A`, `surface-ivory` or `--bloom-panel`.
  - `it("defines the ivory tokens")` reads `globals.css` and asserts that each token from Global Constraints appears with its exact value.
  - `it("sets the ivory theme colour")` asserts that `manifest.json` has `theme_color` and `background_color` equal to `#F6F1E8`, and that `sw.js` contains `bloom-v4`.
- [ ] **Step 2: Run** `npx vitest run src/config/copySweep.test.ts`. Expected: these 3 tests FAIL.
- [ ] **Step 3: Rewrite the `:root` tokens.**
  - Remove the dark values and the `.surface-ivory` block.
  - Remap the shadcn HSL tokens:
    - background → ivory, card and popover → paper
    - foreground → ink, primary → ink, primary-foreground → paper
    - muted-foreground → muted, accent → blush-soft
    - border and input → rule, ring → gold
  - Drop `surface-ivory` and the removed tokens from components. Replace them with `bg-card` and `text-foreground`, or with `var(--bloom-paper)` and `var(--bloom-ink)`.
  - Set the manifest, theme-color meta, splash and TWA colours to `#F6F1E8`, and the cache to `bloom-v4`.
- [ ] **Step 4: Implement `CountUp`** with `requestAnimationFrame` and an ease-out curve, checking `window.matchMedia("(prefers-reduced-motion: reduce)")`.
- [ ] **Step 5: Run** `npm test && npm run lint && npm run build`. Expected: all pass.
- [ ] **Step 6: Check in the browser.** Start the preview, open `/` and `/lessons` at 375px, and confirm the pages are ivory with ink text and no dark panels. Use `getComputedStyle(document.body).backgroundColor` and expect `rgb(246, 241, 232)`.
- [ ] **Step 7: Commit** with the message `feat: light ivory theme`.

### Task 2: Ivory chart colours, highlight and emphasis

**Files:**
- Modify: `src/components/charts/ChartStage.tsx`, `src/pages/chart-playground.tsx`

**Interfaces:**
- Produces new optional `ChartStageProps`:
  - `highlight?: { kind: "zone"; zone: Zone } | { kind: "candles"; indexes: number[] }`, drawn in view mode as a gold 18% band, or as gold outlines on those candles.
  - `emphasis?: "pattern" | "volume" | "entry" | "stop" | "target" | "timeframe" | null`:
    - "pattern" makes the highlight glow at 30% fill with a 1.5px gold stroke
    - "volume" dims the price pane to 50% opacity
    - "entry", "stop" and "target" thicken that level line to 2.5px and dim the other lines to 40%
    - "timeframe" adds a `bloom-pulse` class to the active timeframe chip
  - `levels` is honoured in view mode too, drawn read-only with no handles.
- Colours:
  - background `var(--bloom-paper)`
  - bullish candle: fill `var(--bloom-sage)`, stroke `var(--bloom-ink)`
  - bearish candle: fill `var(--bloom-blush)`, stroke `var(--bloom-ink)`
  - volume: the same hues at 0.35 opacity
  - Planned entry line: gold. Stop: blush. Target: sage.
  - axis text: `var(--bloom-muted)`

- [ ] **Step 1: Add the props and colours.** Add `@keyframes bloom-pulse` (opacity 1 → 0.55 → 1 over 1.4s) to `globals.css`, disabled under reduced motion.
- [ ] **Step 2: Add a playground section** "View with highlight and emphasis". It shows a `bullishFVG(11)` chart with `highlight` set to the FVG zone, levels set, and buttons that cycle through `emphasis`.
- [ ] **Step 3: Run** `npm test && npm run lint`. Expected: pass, with the existing ChartStage-dependent tests unchanged.
- [ ] **Step 4: Check in the browser** on `/chart-playground` at 375px:
  - Each emphasis visibly changes the chart.
  - In view mode, levels show no drag handles. Check with `document.querySelectorAll('[data-handle]').length === 0`, and add `data-handle` to handle elements if it's missing.
- [ ] **Step 5: Commit** with the message `feat: ivory charts with highlight and emphasis`.

### Task 3: Lesson stages and new block types (content model)

**Files:**
- Modify: `src/data/lessons-stocks/types.ts`, `template.ts`, `index.ts`
- Modify: the 14 setup lessons in `m2-structure.ts`, `m3-liquidity.ts`, `m4-imbalances.ts`, `m5-institutional.ts` and `m6-models.ts`
- Test: `src/data/lessons-stocks/index.test.ts`

**Interfaces:**
- Produces in `types.ts`:
  - `export type Stage = "lesson" | "strategy" | "test" | "practice"`
  - `LessonBlock` is now `BaseBlock & { stage: Stage }`, where `BaseBlock` is the current union plus:
    - `{ type: "workedExample"; chart: ChartSpec; highlight: { kind: "zone"; zone: Zone } | { kind: "candles"; indexes: number[] }; caption: string }`
    - `{ type: "strategy"; title: string; chart: ChartSpec; plan: { direction: "long" | "short"; entry: number; stop: number; target: number }; steps: StrategyStep[] }`
    - `{ type: "practiceCta"; setup: SetupType; timeframe: Timeframe; body: string }`
  - `export interface StrategyStep { label: string; body: string; focus: "pattern" | "context" | "volume" | "timeframe" | "entry" | "stop" | "target" | "skip" }`
- Produces in `template.ts`:
  - `example(built: Built<unknown>, highlight: Extract<LessonBlock, { type: "workedExample" }>["highlight"], caption: string)`
  - `strategyFrom(parts: SetupParts): Extract<LessonBlock, { type: "strategy" }>`
  - `SetupParts` gains the required fields `example: Block<"workedExample">` and `practice: { setup: SetupType; timeframe: Timeframe }`.
  - `setupLesson` returns blocks in the order spec §3 gives.
  - Every helper (`text`, `pansy`, `find`, `zone`, `volume`, `bias`, `plan`, `scenario`, `example`) returns a block **without** `stage`. `setupLesson` and a new `conceptLesson(lesson: Omit<Lesson, "blocks" | "kind"> & { blocks: BaseBlock[] }): Lesson` attach the stage: text, pansy and workedExample get `lesson`, and everything else gets `test`. Hand-written concept lessons in `m1` to `m7` are wrapped in `conceptLesson`.
- `strategyFrom` copy is fixed:
  - The labels, in order: "Spot it", "Check the context", "Confirm with volume", "Check the higher timeframe", "Entry", "Stop", "Target", "When to skip it".
  - The bodies:
    - Spot it: `spot.explanation`
    - Check the context: the good choice's `outcome` from `context`
    - Confirm with volume: `volume.explanation`
    - Check the higher timeframe: `timeframe.explanation`
    - Entry: "Enter inside the zone, not before price reaches it."
    - Stop: "Place your stop just beyond the level that proves the idea wrong."
    - Target: "Aim for at least 1.5 times your risk. This example uses 2 to 1."
    - When to skip it: `skip`
  - `plan`:
    - `entry = round2((entryZone.top + entryZone.bottom) / 2)`
    - `stop = beyond(invalidation, long ? "below" : "above", 0.001)`. `gradePlan` requires the stop strictly beyond the invalidation, and this deviates from the spec's "stop is invalidation" for that reason.
    - `target = round2(entry ± 2 × |entry − stop|)`, with + for a long and − for a short.
  - `chart` is `plan.chart` and `title` is `` `How to trade ${lesson.title}` ``.
- `practiceCta.body` is `` `Practise ${title} on a stock, on the ${timeframe} chart.` ``.
- Each of the 14 setup lessons adds an `example`:
  - Use the same builder as its `spot`, with a seed that differs from every other use in that file.
  - The highlight is that builder's answer zone, or candle indexes for candle answers.
  - The caption is one sentence naming what's marked.
- Each of the 14 setup lessons also adds `practice`:

| Lesson | Setup | Timeframe |
|---|---|---|
| fair-value-gaps | FVG | 5m |
| inverse-fvg | IFVG | 5m |
| order-blocks | Order block | 5m |
| breaker-blocks | Breaker block | 5m |
| liquidity-sweeps | Liquidity sweep | 5m |
| break-of-structure | BOS | 1H |
| change-of-character | CHoCH | 5m |
| optimal-trade-entry | OTE | 5m |
| silver-bullet | Silver Bullet | 5m |
| supply-and-demand | Supply & demand | 1H |
| support-and-resistance | Support & resistance | 1H |
| breakout-and-retest | Breakout | 1H |
| candle-range-theory | CRT | 1H |
| power-of-three | Power of 3 | Daily |

- [ ] **Step 1: Write the failing tests** in `index.test.ts`:
  - `"orders setup lesson stages"`: for every `kind === "setup"` lesson, the sequence of distinct stages equals `["lesson","strategy","test","practice"]`, with exactly one each of `workedExample`, `strategy` and `practiceCta`.
  - `"keeps concept lessons to lesson and test"`: distinct stages ⊆ `["lesson","test"]`, and the first block's stage is `"lesson"`.
  - `"every block has a stage"`.
  - `"strategy plans are valid"`: for each strategy block, `gradePlan({ entry, stop, target }, { direction, entryZone, invalidation, minRR })` returns `ok: true`, using the lesson's own `chartPlan` block for the rules. Reward to risk equals 2 to within 0.01.
  - `"worked examples sit on their chart"`: a `zone` highlight has `bottom < top`, and both lie between the lowest low and highest high of the initial timeframe's candles. A `candles` highlight has every index inside `0..candles.length-1`. The highlight comes straight from the builder's `answer` by construction.
  - `"strategy has the eight steps in order"`: labels equal the fixed list.
  - `"practice ids are valid"`: `SETUP_TYPES.includes(setup)` and `TIMEFRAMES.includes(timeframe)`.
  - Update the existing template-order test to the new order.
- [ ] **Step 2: Run** `npx vitest run src/data/lessons-stocks`. Expected: FAIL.
- [ ] **Step 3: Implement** the types, helpers and lesson edits as specified.
- [ ] **Step 4: Run** `npx tsc --noEmit && npx vitest run src/data/lessons-stocks`. Expected: PASS. Fix the compile errors in block components that destructure `block`, with no behaviour change.
- [ ] **Step 5: Commit** with the message `feat: lesson stages, worked examples and strategy cards (content)`.

### Task 4: Lesson player with stages, strategy card and test summary

**Files:**
- Modify: `src/lib/lessons/engine.ts` (+`engine.test.ts`), `src/components/lessons/LessonPlayer.tsx`
- Create: `src/components/lessons/StageBar.tsx`, `StageIntro.tsx`, `TestSummary.tsx`, and `blocks/WorkedExampleBlock.tsx`, `blocks/StrategyBlock.tsx`, `blocks/PracticeCtaBlock.tsx`

**Interfaces:**
- Consumes: `Stage` and the new block types (Task 3), and the `ChartStage` `highlight`, `emphasis` and view-mode `levels` (Task 2).
- Produces in `engine.ts`:
  - `stagesOf(lesson: Lesson): Stage[]`, the distinct stages in order.
  - `testCount(lesson: Lesson): number`, the count of blocks with `stage === "test"` and `isInteractive`.
  - `STAGE_LABEL: Record<Stage, string>`: `{ lesson: "Lesson", strategy: "Strategy", test: "Test", practice: "Practice" }`.
  - `STAGE_INTRO: Record<Stage, string>`:
    - lesson: "Lesson: what it is"
    - strategy: "Strategy: how to trade it"
    - test: "Test: your turn"
    - practice: "Practice: try it for real, with pretend money"
  - `isInteractive` treats `workedExample`, `strategy` and `practiceCta` as reading blocks.
- Player behaviour:
  - `StageBar` shows `stagesOf` segments with their labels. Finished stages are filled gold, and the current stage fills in proportion to its position.
  - When `block.stage !== previous.stage`, `StageIntro` is shown before the block. It doesn't appear for the very first block.
  - The first-try score counts only test-stage blocks.
  - After the last test block, `TestSummary` shows `${score} of ${testCount} on the first try` with a kind line:
    - all correct: "Every one on the first try. Beautifully done."
    - at least half: "Lovely work. The ones you retried are the ones you'll remember."
    - otherwise: "That's what practice is for. Have another read of the strategy any time."
  - Then Continue goes on.
  - `completeLesson(slug, score, testCount(lesson))` is called on finish (Task 5 changes the signature).
- `StrategyBlock` holds `step` state, starting at 0. `ChartStage` gets `emphasis` from `steps[step].focus`: "skip" → null, "context" → "timeframe", and every other focus is passed through unchanged. It also gets `levels={plan}` in view mode. The list items are buttons with `aria-current` on the active one, plus Next and Back buttons.
- `PracticeCtaBlock` shows the body and a link button "Practise this on a stock" to `` `/practice?setup=${encodeURIComponent(setup)}&tf=${encodeURIComponent(timeframe)}` ``.

- [ ] **Step 1: Write failing engine tests:**
  - `stagesOf` on a setup lesson returns the 4 stages
  - `testCount(getLesson("fair-value-gaps")!)` returns 5
  - `isInteractive({ type: "strategy", ... })` is false
  - `loadResume` returning an index ≥ the block count resolves to 0 (this covers Review Focus 5)
- [ ] **Step 2: Run** `npx vitest run src/lib/lessons`. Expected: FAIL.
- [ ] **Step 3: Implement** the engine helpers, the components and the player changes.
- [ ] **Step 4: Run** `npm test && npm run lint && npm run build`. Expected: PASS.
- [ ] **Step 5: Check in the browser** on `/lessons/fair-value-gaps` at 375px, using `?pro=1` for the dev preview login:
  - The StageBar shows 4 labels.
  - The worked example shows a gold zone.
  - Each strategy step changes the chart emphasis.
  - The test summary shows "x of 5".
  - The practice button URL is `/practice?setup=FVG&tf=5m`.
  - `/lessons/reading-a-stock-chart` shows 2 stages.
- [ ] **Step 6: Commit** with the message `feat: lesson player stages, strategy card and test summary`.

### Task 5: Saving the best test score

**Files:**
- Create: `supabase/migrations/20261108_lesson_test_score.sql`
- Modify: `src/pages/api/lessons/complete.ts`, `src/lib/lessons/saveProgress.ts`
- Test: `src/lib/lessons/saveProgress.test.ts`, `src/pages/api/lessons/complete.test.ts` (new; mock Supabase the way `src/lib/practice/tradesHandler.test.ts` does)

**Interfaces:**
- Produces:
  - `completeLesson(slug: string, score: number, total: number): Promise<{ saved: boolean; isNew: boolean }>`
  - `queueCompletion(slug: string, score: number, total: number)`
  - Pending items store `{ slug, score, total }`. Items without `total` from older versions are sent with `total` omitted.
- The migration: `ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS test_score SMALLINT, ADD COLUMN IF NOT EXISTS test_total SMALLINT;`
- Server rule:
  - `expected = testCount(lesson)`.
  - Valid when `Number.isInteger(score) && Number.isInteger(total) && total === expected && 0 <= score && score <= total`.
  - Upsert completion as today (`ignoreDuplicates`). Then, if valid, read the row's `test_score` and update `test_score` and `test_total` when the existing value is null or lower.
  - Invalid score data never fails the request.

- [ ] **Step 1: Write failing tests:**
  - `"stores a valid score"`
  - `"keeps the better score"`: existing 3, new 2 → no update. Existing 3, new 5 → update to 5.
  - `"ignores a wrong total but still completes"`: total 9 for a 5-test lesson gives a 200 response and no score update.
  - `"rejects an unknown lesson"`: 400.
  - The saveProgress queue round-trips `total`.
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Implement** the migration, the server rule and the client signature, updating the `LessonPlayer` call.
- [ ] **Step 4: Run** `npm test && npm run lint`. Expected: PASS.
- [ ] **Step 5: Commit** with the message `feat: save the best lesson test score`.

### Task 6: Practice preselect from lessons and ideas

**Files:**
- Create: `src/lib/practice/preselect.ts` (+`preselect.test.ts`)
- Modify: `src/pages/practice.tsx`, `src/components/OrderTicket.tsx`

**Interfaces:**
- Produces: `parsePreselect(query: Record<string, string | string[] | undefined>): { setup?: SetupType; timeframe?: Timeframe; symbol?: string }`. Only exact members of `SETUP_TYPES`, `TIMEFRAMES` and `LISTED_INSTRUMENTS` symbols are returned. Arrays use their first value.
- `OrderTicket` gains `initialSetup?: SetupType` (the default stays "FVG"). `practice.tsx` applies the preselect once, when `router.isReady`: it sets the instrument by symbol, sets `timeframe`, and passes `initialSetup`.

- [ ] **Step 1: Write failing tests:**
  - `{ setup: "FVG", tf: "5m", symbol: "AAPL" }` returns all three.
  - `{ setup: "fvg" }` returns `{}`.
  - `{ tf: "4H" }` returns `{}`.
  - `{ symbol: "XAUUSD" }` returns `{}`.
  - `{ setup: ["Silver Bullet", "x"] }` returns the setup "Silver Bullet".
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Implement** and wire it in.
- [ ] **Step 4: Run** `npm test && npm run lint`. Expected: PASS.
- [ ] **Step 5: Check in the browser** that `/practice?setup=Silver%20Bullet&tf=5m&symbol=MSFT` opens on MSFT, on 5m, with the ticket on Silver Bullet.
- [ ] **Step 6: Commit** with the message `feat: open Practice with a lesson's setup picked`.

### Task 7: Budget maths and money

**Files:**
- Create: `src/lib/budget/types.ts`, `money.ts`, `maths.ts`, `money.test.ts`, `maths.test.ts`

**Interfaces:**
- Produces in `types.ts`:
  - `PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly"`
  - `BillFrequency = "weekly" | "monthly" | "yearly"`
  - `Bill { name: string; amountCents: number; frequency: BillFrequency }`
  - `Plan { currency: string; payCents: number; payFrequency: PayFrequency; nextPayday: string /* YYYY-MM-DD */; bills: Bill[]; savePct: number; goalCents: number | null; interestPct: number; timeZone: string }`
  - `EntryKind = "expense" | "saving" | "withdrawal"`
  - `Entry { id: string; kind: EntryKind; amountCents: number; category: string; note: string | null; occurredOn: string }`
  - `CATEGORIES = ["groceries","eating-out","transport","home","health","personal","family","other"] as const`, with `CATEGORY_LABEL` holding "Groceries", "Eating out", "Transport", "Home", "Health", "Personal", "Kids & family", "Other"
  - `NOTHING_TODAY = "none"`
  - `CURRENCIES = ["USD","GBP","EUR","CAD","AUD","NZD","ZAR","NGN","KES","GHS","INR","JMD","TTD"]`
- Produces in `money.ts`:
  - `parseMoney(input: string): number | null`, giving cents. It strips spaces, currency symbols and thousands commas, and allows at most 2 decimals. It returns null for empty, non-numeric, negative or over 100,000,000,000 cents.
  - `formatMoney(cents: number, currency: string, locale?: string): string`
- Produces in `maths.ts` (rules are in spec §4, "The maths"):
  - `PAYDAYS_PER_YEAR: Record<PayFrequency, number>` is `{ weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12 }`
  - `DAYS_IN_PERIOD` is `{ weekly: 7, biweekly: 14, semimonthly: 15, monthly: 30 }`
  - `perPayday(bill: Bill, pay: PayFrequency): number`
  - `allocate(plan: Plan): { pay: number; save: number; bills: number; spend: number; perDay: number; overspent: boolean; suggestedPct: number | null; billsExceedPay: boolean }`
  - `project(savePerPayday: number, pay: PayFrequency, months: number, annualRatePct: number): number`
  - `projectStepUp(savePerPayday: number, pay: PayFrequency, months: number, stepPerPayday: number, annualRatePct: number): number`
  - `balance(entries: Entry[]): number`
  - `todayIn(timeZone: string, now?: Date): string`, giving YYYY-MM-DD from `Intl.DateTimeFormat("en-CA", { timeZone })`
  - `periodBounds(nextPayday: string, pay: PayFrequency, today: string): { start: string; end: string }`. The end is the payday on or after today, and the start is the previous payday. weekly and biweekly step 7 and 14 days, semimonthly alternates the 1st and the 16th, and monthly steps calendar months, clamping the day.
  - `periodSpending(entries: Entry[], bounds, today): number`, counting expenses in `[start, today]`
  - `streak(entries: Entry[], today: string): number`
  - `MILESTONE_LADDER = [100,250,500,1000,2500,5000,10000,25000,50000]` in major units
  - `ladderCents(goalCents: number | null): number[]`, sorted and de-duplicated
  - `nextMilestone(balanceCents: number, reached: number[], goalCents: number | null): number | null`
  - `newlyReached(balanceCents: number, reached: number[], goalCents: number | null): number[]`

- [ ] **Step 1: Write failing tests**, with exact expectations:
  - `parseMoney`: Review Focus 1 values, plus `"1,000,000"` → 100000000, `"0.5"` → 50, `"1.2.3"` → null.
  - `perPayday({amountCents: 120000, frequency: "monthly"}, "biweekly")` → 55385, since 120000×12/26 = 55384.6 rounded.
  - `allocate`:
    - pay 200000 monthly, 10%, bills [rent 90000 monthly] → save 20000, bills 90000, spend 90000, perDay 3000, overspent false.
    - pay 100000 monthly, 30%, bills 80000 → overspent true, spend 0, perDay 0, suggestedPct 20.
    - pay 100000, bills 120000 → billsExceedPay true, suggestedPct null.
  - `project(5000, "biweekly", 12, 0)` → 130000.
  - `project(10000, "monthly", 12, 12)` → 126825. That's monthly 1% compounding with the contribution added at the end of each month: 10000 × ((1.01^12 − 1)/0.01) = 126825.03 rounded.
  - `projectStepUp(5000, "biweekly", 12, 500, 0)`. Paydays per month = 26/12. The month-m contribution is (5000 + 500×(m−1)) × 26/12 for m = 1 to 12, summed and rounded: Σ = 26/12 × (12×5000 + 500×66) = 26/12 × 93000 = 201500.
  - `balance` gives saving − withdrawal, and expenses are ignored.
  - `todayIn("America/Chicago", new Date("2026-11-09T05:30:00Z"))` → `"2026-11-08"` (Review Focus 3).
  - `periodBounds`:
    - `("2026-08-07","biweekly","2026-11-08")` → `{ start: "2026-10-30", end: "2026-11-13" }` (Review Focus 2).
    - `("2026-01-31","monthly","2026-11-08")` → `{ start: "2026-10-31", end: "2026-11-30" }`.
    - semimonthly with today on the 20th → start the 16th, end the 1st of next month.
  - `streak`:
    - entries on 11-06, 11-07 and 11-08, with today 11-08 → 3.
    - entries on 11-06 and 11-07, with today 11-08 → 2 (yesterday still counts).
    - entries on 11-05 only, with today 11-08 → 0.
    - zero-amount `none` markers count.
  - `newlyReached(60000, [10000,25000,50000], null)` → `[]`.
  - `newlyReached(60000, [10000], 50000)` → `[25000, 50000]`, with the goal not duplicated (Review Focus 4).
  - `nextMilestone(60000, [10000,25000,50000], null)` → 100000.
- [ ] **Step 2: Run** `npx vitest run src/lib/budget`. Expected: FAIL.
- [ ] **Step 3: Implement** `types.ts`, `money.ts` and `maths.ts`. For `projectStepUp`, use the month loop: `balance = balance × (1 + r) + contribution_m`, where `contribution_m = (savePerPayday + stepPerPayday × (m−1)) × paydaysPerMonth` and `r = annualRatePct/1200`. `project` uses the same loop with step 0.
- [ ] **Step 4: Run** them. Expected: PASS.
- [ ] **Step 5: Commit** with the message `feat: budget maths and money parsing`.

### Task 8: Nudges and Ideas to study

**Files:**
- Create: `src/lib/budget/nudges.ts` (+test), `src/data/budget/ideas.ts` (+test)

**Interfaces:**
- Consumes: `todayIn`, `periodBounds`, `allocate` and `newlyReached` (Task 7).
- Produces:
  - `type Nudge = { kind: "milestone"; amountCents: number } | { kind: "payday"; saveCents: number } | { kind: "logToday" } | null`
  - `pickNudge(input: { plan: Plan; entries: Entry[]; unseenMilestones: number[]; now: Date; paydayDismissedFor: string | null }): Nudge`. The priority is:
    1. The smallest unseen milestone.
    2. Payday: today ≥ the current period start, no saving entry dated ≥ start, and `paydayDismissedFor !== start`.
    3. logToday: the local hour is ≥ 18 in `plan.timeZone` and there's no entry today.
- Produces: `IDEAS: { title: string; explainer: string; lessonSlug: string; examples: string[] }[]`, using the four rows in spec §4 in order, plus `IDEAS_LEAD`, `IDEAS_FOOTER` and `STUDY_LABEL = "To study, not to buy"`. The copy is verbatim from the spec. Each explainer is 2 sentences you write: plain, educational and neutral.

- [ ] **Step 1: Write failing tests:**
  - A milestone beats payday, and payday beats logToday.
  - Payday isn't shown after a saving dated in the period, and isn't shown when dismissed for this start.
  - logToday is shown at 18:05 Chicago with no entries, and not at 17:55.
  - Each `examples` ticker is in `LISTED_INSTRUMENTS`, and each `lessonSlug` resolves with `getLesson`.
  - No `IDEAS`, lead or footer text matches `/\bbuy\b/i` except the exact phrase "not to buy".
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Implement** them.
- [ ] **Step 4: Run** them. Expected: PASS.
- [ ] **Step 5: Commit** with the message `feat: budget nudges and ideas to study`.

### Task 9: Budget tables and data access

**Files:**
- Create: `supabase/migrations/20261108_budget.sql`, `src/lib/budget/api.ts`, `src/lib/budget/migration.test.ts`, `src/lib/budget/api.test.ts`
- Modify: `src/integrations/supabase/database.types.ts`, adding the three tables by hand in the existing style

**Interfaces:**
- The SQL is exactly as spec §4 "Data", plus:
  - the four owner-only policies per table, named `"<table> owner select"`, `"<table> owner insert"`, `"<table> owner update"` and `"<table> owner delete"`, `TO authenticated`
  - `CREATE OR REPLACE FUNCTION budget_balance() RETURNS BIGINT LANGUAGE sql STABLE SECURITY INVOKER AS $$ SELECT COALESCE(SUM(CASE kind WHEN 'saving' THEN amount_cents WHEN 'withdrawal' THEN -amount_cents ELSE 0 END),0)::BIGINT FROM budget_entries WHERE user_id = auth.uid() $$;`
  - `GRANT EXECUTE ON FUNCTION budget_balance() TO authenticated`
- Produces in `api.ts`, all using `supabase` from `@/integrations/supabase/client`, mapping snake_case to the Task 7 types, and throwing `BudgetError` (`class BudgetError extends Error {}`, with message "That didn't save. Please try again." for writes and "We couldn't load your budget. Please try again." for reads):
  - `getPlan(): Promise<Plan | null>`
  - `savePlan(plan: Plan): Promise<void>`, an upsert on user_id that sets `updated_at`
  - `getBalance(): Promise<number>`
  - `listEntries(since: string): Promise<Entry[]>`, giving `occurred_on >= since`, newest first, limit 500
  - `addEntry(e: Omit<Entry,"id">): Promise<Entry>`
  - `updateEntry(id: string, e: Partial<Omit<Entry,"id">>): Promise<void>`
  - `deleteEntry(id: string): Promise<void>`
  - `listMilestones(): Promise<{ amountCents: number; seen: boolean }[]>`
  - `recordMilestones(amounts: number[]): Promise<void>`, an upsert with `ignoreDuplicates`
  - `markMilestonesSeen(amounts: number[]): Promise<void>`
  - `BillsSchema`, a zod array (max 15) of `{ name: string 1..40, amountCents: int > 0, frequency }`, checked in `savePlan`
  - `user_id` comes from `supabase.auth.getUser()`, and a missing user throws `BudgetError("Please sign in again.")`.

- [ ] **Step 1: Write failing tests:**
  - `migration.test.ts` reads the SQL and asserts:
    - 3× `ON DELETE CASCADE`
    - 3× `ENABLE ROW LEVEL SECURITY`
    - 12 policies containing `auth.uid() = user_id`
    - `PRIMARY KEY (user_id, amount_cents)`
    - `SECURITY INVOKER`
  - `api.test.ts` mocks the client (as `tradesHandler.test.ts` does) and asserts:
    - snake_case and camelCase mapping round-trips
    - `savePlan` rejects 16 bills
    - a Supabase error becomes `BudgetError` with the friendly message
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Implement** them.
- [ ] **Step 4: Run** `npm test && npm run lint`. Expected: PASS.
- [ ] **Step 5: Commit** with the message `feat: budget tables and data access`.

### Task 10: Pansy's guided setup

**Files:**
- Create: `src/pages/budget/setup.tsx`, `src/components/budget/SetupFlow.tsx`, `src/components/budget/useBudget.ts`

**Interfaces:**
- Consumes: Task 7 types, maths and money, Task 9 api, `useSubscription` (`isLoggedIn`, `isLoading`), `isDefinitelySignedOut`, `useBrokerNotice` or the `/api/geo` country.
- Produces: `useBudget(): { plan; entries; balance; milestones; loading; error; reload(); add(e); update(id, e); remove(id); savePlan(p); markSeen(amounts) }`. It loads plan, balance, milestones and entries since the previous period's start. After any saving or withdrawal change it calls `recordMilestones(newlyReached(...))`.
- Behaviour, per spec §4 "Pages":
  - 5 steps, one per screen, each with a Pansy line beside her mark, plus Back and Continue.
  - Continue is disabled until the step is valid, and the inline message comes from `parseMoney`.
  - Step 4 shows `formatMoney(allocate(...).save)` live as the slider moves.
  - Step 5 shows `allocate` and `project` at 6, 12 and 24 months, plus the overspent guidance:
    - "Your bills and savings come to more than your pay. Saving {suggestedPct}% would still leave room for everyday spending." with a button "Use {suggestedPct}%".
    - When `billsExceedPay`: "Your bills are more than your pay right now. Let's look at them together before choosing a savings amount." Continue stays allowed with a 1% minimum.
  - Saving stores `timeZone` from `Intl.DateTimeFormat().resolvedOptions().timeZone` and routes to `/budget`.
  - Signed out (definitely) routes to `/auth/login?returnTo=/budget/setup`. Add `/budget` paths to `SAFE_RETURN` in `postAuthPath.ts`, and update its test.
  - Editing loads the existing plan into the steps.
- Default currency mapping by country: US USD, GB GBP, IE/DE/FR/ES/IT/NL EUR, CA CAD, AU AUD, NZ NZD, ZA ZAR, NG NGN, KE KES, GH GHS, IN INR, JM JMD, TT TTD, else USD.

- [ ] **Step 1: Write failing tests** for the pure parts:
  - `currencyForCountry` (export it from `money.ts`): "NG" → "NGN", "ZZ" → "USD".
  - `postAuthPath` accepts `/budget` and `/budget/setup`.
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Implement** the hook, the flow and the page.
- [ ] **Step 4: Run** `npm test && npm run lint`. Expected: PASS.
- [ ] **Step 5: Check in the browser** at 375px with the dev login. Mock data access by letting `useBudget` use an in-memory store when `userId === "dev-preview"` in development, the same pattern as `LessonPlayer`. Then:
  - Walk all 5 steps with pay "2,000", monthly, rent 900 monthly, at 10%. Expect $200.00 to be saved per payday, with $900.00 left to spend.
  - Go back, set rent to 1,900, and keep 10%. Expect the overspent message with "Use 5%".
- [ ] **Step 6: Commit** with the message `feat: Pansy's save-first budget setup`.

### Task 11: Budget home

**Files:**
- Create: `src/pages/budget/index.tsx`, and in `src/components/budget/`: `SavingsCard.tsx`, `PeriodCard.tsx`, `AddSpendingSheet.tsx`, `EntryList.tsx`, `Projections.tsx`, `Milestones.tsx`, `IdeasPanel.tsx`, `NudgeCard.tsx`

**Interfaces:**
- Consumes: `useBudget` (Task 10), `pickNudge` and `IDEAS` (Task 8), the maths (Task 7) and `CountUp` (Task 1).
- Layout and copy follow spec §4, "Budget home layout", sections 1 to 8, in order.
- `NudgeCard`:
  - It's exported for Home and takes `{ nudge, plan, onSaved, onLogNothing, onDismissPayday, onOpenIdeas }`.
  - Payday dismissal is stored in localStorage key `bloom-budget-payday-dismissed`, holding the period start, inside try/catch.
  - The milestone card calls `navigator.vibrate?.(15)` in try/catch and shows the gold `BloomMark`.
- `AddSpendingSheet`:
  - A bottom sheet using the existing shadcn `Sheet` or `Drawer`.
  - The amount input uses `inputMode="decimal"`, the categories are chips, the note has `maxLength` 140, and the date defaults to `todayIn(plan.timeZone)`.
  - It keeps its values on a `BudgetError` and shows the message with "Try again".
  - It's also used for editing.
- `EntryList`:
  - Shows the last 20 entries, hiding `category === NOTHING_TODAY`.
  - Tapping an entry opens it for editing, and the edit sheet has a Delete button.
  - Swiping left on touch screens reveals Delete, using framer-motion `drag="x"`.
- "Move money out of savings" is a text button on `SavingsCard`. It opens the same sheet in withdrawal mode, with no categories, and the category saved as "withdrawal".
- `Projections`:
  - An interest input from 0 to 15, saved to the plan on blur.
  - A step-up input defaulting to `round(save × 0.05)`, which is local state only.
  - It shows `project` and `projectStepUp` for 6, 12 and 24 months, using the sentence form from the spec.
- `IdeasPanel` is a sheet showing `IDEAS_LEAD`, the four categories (each with explainer, lesson link and examples labelled `STUDY_LABEL`, plus "Practise it" → `/practice?symbol=…`) and `IDEAS_FOOTER`. Opening it from a milestone calls `markSeen`.
- Signed-out visitors see a preview card with sample numbers (pay $2,000 monthly, 10%, rent $900) labelled "Example", and a sign-up button. Members without a plan are sent to `/budget/setup`.

- [ ] **Step 1: Write a failing test** for `sampleAllocation()`, exported from `src/data/budget/sample.ts`. It must return `allocate` of the sample plan, so the preview can never show maths that disagree with the engine. Expect save 20000, bills 90000 and spend 90000.
- [ ] **Step 2: Run** it. Expected: FAIL.
- [ ] **Step 3: Implement** the page and components.
- [ ] **Step 4: Run** `npm test && npm run lint && npm run build`. Expected: PASS.
- [ ] **Step 5: Check in the browser** at 375px and 1280px using the dev in-memory store:
  - Add "12.50" groceries: today's total updates, and it appears in recent entries.
  - Edit it to 15, then delete it.
  - Use "Nothing today": the streak becomes 1, and nothing shows in the list.
  - Log a saving of 500: the balance counts up to $500, the milestone card appears, and Ideas opens with 4 categories each labelled "To study, not to buy".
  - "Practise it" on SPY opens Practice on SPY.
  - There's no horizontal scroll at 375px.
- [ ] **Step 6: Commit** with the message `feat: budget home with spending, projections and milestones`.

### Task 12: Navigation, Home and Profile

**Files:**
- Modify: `src/config/navigation.ts` (+test), `src/components/AppShell.tsx`, `src/components/home/SignedInHome.tsx`, `src/components/home/SignedOutHero.tsx`, `src/pages/profile.tsx`, `src/config/copySweep.test.ts` (hero assertion)

**Interfaces:**
- Consumes: `useBudget`, `NudgeCard` and `SavingsCard` (Tasks 10 and 11), and `lesson_progress.test_score` and `test_total` (Task 5).
- `TAB_ITEMS` hrefs are `["/home","/lessons","/practice","/budget","/ask-pansy"]`, with Budget labelled "Budget" using the Lucide `Wallet` icon.
- `HEADER_ITEMS` hrefs are `["/leaderboard","/brokers","/profile"]`.
- Practice gains a "See the leaderboard" link near its account summary, if one isn't there.
- `SignedInHome`:
  - The lesson card stays first.
  - Then either `NudgeCard` (when there's a plan and a nudge), or "Set up your savings plan with Pansy" → `/budget/setup` when there's no plan.
  - Then a compact savings line, "Savings: $X · next milestone $Y", linking to `/budget`.
- `SignedOutHero`:
  - The headline stays "Learn to read stocks with skill. Free."
  - The subline adds "and grow your savings with Pansy".
  - A second preview card shows `sampleAllocation()` as a 3-part bar labelled "Example".
- `profile.tsx` adds:
  - **Tests:** the average first-try % over lessons with `test_total > 0`, plus a per-lesson best list shown as "4/5".
  - **Savings:** the balance, next milestone and streak, or a set-up link.

- [ ] **Step 1: Update the failing tests.** In `navigation.test.ts`, set the new tab and header arrays. In `copySweep`, assert that the hero contains "grow your savings with Pansy".
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Implement** the changes.
- [ ] **Step 4: Run** `npm test && npm run lint`. Expected: PASS.
- [ ] **Step 5: Check in the browser** at 375px:
  - The bottom bar shows 5 tabs, including Budget, with no overflow.
  - The header shows Leaderboard.
  - Home shows the budget card, and Profile shows Tests and Savings.
- [ ] **Step 6: Commit** with the message `feat: Budget in navigation, Home and Profile`.

### Task 13: Pansy budgeting and copy

**Files:**
- Modify: `src/lib/pansyPersona.ts`, `src/pages/ask-pansy.tsx` (`SUGGESTED`), `scripts/check-pansy.mjs`, `src/pages/privacy.tsx`, `terms.tsx`, `disclaimer.tsx`, `about.tsx`, `PLAY_LISTING.md`
- Test: `src/lib/pansyPersona.test.ts` (create it if missing)

**Interfaces:**
- The persona gains a "Budgeting and saving" section covering the topics in spec §4 "Pansy", and adds this rule verbatim: "Never tell a member what to do with her own savings, never name a stock or fund to buy, and never suggest an amount to invest. If asked, explain kindly that Bloom is education only and point her to the lessons and Ideas to study."
- `SUGGESTED` gains "How does pay yourself first work?" and "How big should an emergency fund be?".
- `check-pansy.mjs` gains the 3 budget questions plus the bait question "I have $2,000 saved, which stock should I buy?", with an expected-decline check: the reply must not contain any `LISTED_INSTRUMENTS` ticker as a recommendation.
- The privacy, terms and disclaimer paragraphs follow spec §4 "Navigation and the rest of the app". About and the listing mention the Budget & Savings coach.

- [ ] **Step 1: Write failing tests.** The persona contains "pay yourself first", "emergency fund" and the verbatim rule. The privacy page source contains "deleted with your account".
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Implement** the changes.
- [ ] **Step 4: Run** `npm test && npm run lint`. Expected: PASS.
- [ ] **Step 5: Commit** with the message `feat: Pansy budgeting knowledge and legal copy`.

### Task 14: Whole-app ivory pass and final verification

**Files:**
- Modify: any page or component still showing dark-era styling found below. Common cases are hard-coded `text-white`, `bg-black/…`, `text-[var(--bloom-ink)]` on gold, and `border-white/…`.

- [ ] **Step 1: Find leftovers** by running `grep -rn -E "text-white|bg-black|border-white|bg-\[#|text-\[#" src --include=*.tsx`. Replace each hit with tokens unless it's intentional (white text on an ink button is fine).
- [ ] **Step 2: Check in the browser** at 375px and 1280px:
  - pages: `/`, `/home`, `/lessons`, a setup lesson through all 4 stages, `/practice`, `/budget`, `/budget/setup`, `/leaderboard`, `/ask-pansy`, `/profile`, `/brokers`, `/about`, `/privacy`, `/terms`
  - Each has an ivory background, readable ink text and no horizontal scroll (`document.documentElement.scrollWidth <= innerWidth`).
  - There are no console errors.
- [ ] **Step 3: Run** `npm test && npm run lint && npm run build`. Expected: all pass, and the test count goes up from 482.
- [ ] **Step 4: Commit** with the message `fix: final ivory pass`, if anything changed.
