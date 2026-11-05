# Bloom Feminine Gold Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Bloom into a free, feminine, gold-first learning app: sign up, interactive lessons, paper practice, two leaderboards, then broker demos.

**Architecture:** Next.js 15 pages router on Supabase, keeping existing tables and APIs where they fit. Redefining shared colour tokens restyles retained pages at once. New lessons use a block format rendered by one player, and paper trading gains an instrument config while keeping the existing trade tables.

**Tech Stack:** Next.js 15.5, React 18, TypeScript, Tailwind, framer-motion, Supabase, Anthropic SDK, FMP, Vitest (new dev dependency).

**Spec:** `docs/superpowers/specs/2026-11-05-bloom-feminine-gold-redesign-design.md`

## Global Constraints

- Work on branch `redesign/feminine-gold`. Never push `main` without Roy's approval. On approval, push to both `origin` and `gitlab`.
- Stage files by explicit path. The repo tracks build output (`.gradle`, `app/build`), so never use `git add -A` or `git add .`.
- Do not delete database tables or rows. Migrations are additive, and Roy approves applying them to production.
- Never rename Pansy. Pansy's story about Roy's late mother stays.
- Text never uses teal `#27B7C8` on ivory. Teal is decorative only.
- Body text is at least 16px on mobile. Layouts have no horizontal scroll at 375px.
- Motion respects `prefers-reduced-motion`. Buttons keep press feedback, and bloom moments use haptics.
- Banned wording in user-facing copy: signal, scanner, pro, upgrade, trial, edge, setup, guaranteed. The refund policy may keep legal history.
- Practice P&L is always labelled as simulated. Commission disclosure and risk notes stay.
- Sign-in flows use production Supabase, so Claude cannot create test accounts from localhost. Claude verifies signed-out and component behaviour locally, and Roy (or a named test environment) verifies signed-in flows on the Vercel preview.
- MotionSites free plan has 2 prompt opens left. Open only what Task 17 names.

## Review Focus

1. **Market closed (weekends):** a new gold or forex order gets a kind "market is resting" message instead of a stale fill. Pinned in Task 11.
2. **Price feed outage:** the member sees a kind retry message, nothing is charged, and open positions stay intact. Pinned in Task 11.
3. **Open stock positions from before the redesign:** they can still be priced and closed, with full-cost release. Pinned in Tasks 10 and 11.
4. **Lesson interrupted or save failed:** the member resumes where they left off and the completion retries, with no double bloom. Pinned in Tasks 6 and 7.
5. **Leaderboard edge cases:** hidden members, no closed trades, negative totals and ties all render and rank correctly. Pinned in Task 13.

---

## Stage 1: Foundation

### Task 1: Theme tokens, fonts and app colours

**Files:**
- Modify: `src/styles/globals.css`, `tailwind.config.ts`, `src/pages/_document.tsx`, `src/pages/_app.tsx`, `public/manifest.json`, `public/sw.js`, `capacitor.config.ts`
- Delete: `src/components/ThemeSwitch.tsx`, `src/contexts/ThemeProvider.tsx` (after moving `_app.tsx` off it)

**Interfaces:**
- Produces: CSS variables `--bloom-paper #FBF8F2`, `--bloom-paper-warm #F6F1E8`, `--bloom-card #FFFDF8`, `--bloom-ink #2A241C`, `--bloom-stone #6F6860`, `--bloom-sage #3F4F3E`, `--bloom-teal #27B7C8`, `--bloom-blush #EFD9D3`, `--bloom-clay #B98A72`, `--bloom-gold #C2A15A`, and Tailwind `font-serif` (Fraunces) and `font-sans` (DM Sans).

- [ ] **Step 1:** Create the branch with `git switch -c redesign/feminine-gold`.
- [ ] **Step 2:** Add the `--bloom-*` tokens. Redefine shadcn variables as light values. Remap legacy tokens by role, not name: `--r-bg` paper, `--r-elevated` and `--r-card` cream, `--r-card2` warm paper, `--r-ivory` and `--r-body` ink (`--r-ivory` is a text colour today), `--r-meta` and `--r-inactive` stone, `--r-teal` sage, up tokens sage, down tokens clay, hairline `rgba(42,36,28,0.08)`.
- [ ] **Step 3:** Replace the Inter import with Fraunces and DM Sans. Set `theme-color` and manifest colours to `#FBF8F2`, and the Capacitor iOS background to `#FBF8F2`. Remove any dark class and theme provider.
- [ ] **Step 4:** Bump `CACHE_VERSION` in `public/sw.js` to `bloom-v2`, so returning visitors drop the old cached offline page.
- [ ] **Step 5:** Run `npm run build`. Expected: success.
- [ ] **Step 6:** Run preview `dev`, check `/about` at 375px and confirm light background, serif headings and no console errors.
- [ ] **Step 7:** Commit with `feat: add Bloom feminine theme tokens and fonts`.

### Task 2: Retire pages, jobs and redirects

**Files:**
- Create: `src/config/retiredRoutes.mjs`, `src/config/retiredRoutes.test.ts`, `vitest.config.ts`
- Modify: `next.config.mjs`, `vercel.json`, `src/middleware.ts`, `package.json`, `package-lock.json`
- Delete: all pages in the retired table in spec section 7, `src/pages/api/scanner/*`, `src/pages/api/cron/*`, `src/lib/scanner.ts`, `src/lib/cryptoScanner.ts`, `src/data/strategy-lab/*`, `src/data/university/*`, `src/data/academy/*`, `src/components/academy/*`

Keep `src/data/forex/*` until Task 8 finishes adapting it. Delete anything else only when the build shows nothing retained imports it.

**Interfaces:**
- Produces: `RETIRED_ROUTES: { source: string; destination: string; permanent: true }[]` from `retiredRoutes.mjs`, spread into `redirects()`.

- [ ] **Step 1:** Run `npm i -D vitest` and add `"test": "vitest run"` with an `@` path alias in `vitest.config.ts`.
- [ ] **Step 2: Write the failing test.** `every retired route has a destination`, and `sources cover the spec`, asserting these are matched: `/scanner/:path*`, `/signals`, `/gap-and-go-scanner`, `/stock/:path*`, `/university/:path*`, `/forex/:path*`, `/academy/:path*`, `/learn`, `/subscription/:path*`. Also assert no destination is itself a retired source.
- [ ] **Step 3:** Run `npx vitest run src/config/retiredRoutes.test.ts`. Expected: FAIL, module not found.
- [ ] **Step 4:** Implement `retiredRoutes.mjs` from spec section 7. Lesson-family routes go to `/lessons`, and `/subscription*`, `/ebook-premium`, `/refer` go to `/`. Include bare and `:path*` forms where a route has children. Wire it into `next.config.mjs`.
- [ ] **Step 5:** Run the test. Expected: PASS.
- [ ] **Step 6:** Read `src/pages/api/cron/signal-alerts.ts` and `send-weekly-stocks.ts`, and note which table or list each sends to for the stage report to Roy.
- [ ] **Step 7:** Remove the `crons` entries from `vercel.json` and delete the retired files. Change the `academy.` host branch in `middleware.ts` to redirect to `https://shebloomswealth.app/lessons`.
- [ ] **Step 8:** Run `npm run build` and fix retained imports of deleted code by removing the dependent UI. Expected: success.
- [ ] **Step 9:** On preview, request `/scanner/AAPL` and `/signals`. Expected: redirected to `/lessons` (a 404 is fine until Task 9 adds that page).
- [ ] **Step 10:** Commit with `feat: retire signals, scanner and stock pages with redirects`.

### Task 3: Make everything free

**Files:**
- Modify: `src/config/proPlan.ts`, `src/contexts/SubscriptionContext.tsx`, `src/lib/requireProUser.ts`, `src/lib/requireProUserSSR.ts`, every retained file using the removed components
- Delete: `UpgradeModal`, `LockedFeatureModal`, `TrialCountdown`, `FoundersPricingModal`, `GooglePlaySubscription`, `AdMobBanner`, `SignUpBanner` upgrade wording (keep a soft sign-up banner)
- Test: `src/config/proPlan.test.ts`

**Interfaces:**
- Produces: `getEntitlements(tier)` returns full access for every tier. `SubscriptionContext` keeps its shape with `isPro` and `isPaid` true when logged in. `requireProUser(req)` behaves the same as `requireLoggedInUser(req)`.

- [ ] **Step 1: Write the failing test.** `free tier has full access`: `getEntitlements("free")` deep-equals `getEntitlements("desk")`, with `paperFull === true` and `journalAnalytics === true`.
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3:** Implement the entitlement, context and auth changes, then remove modals, ads and upgrade CTAs from retained pages.
- [ ] **Step 4:** Run the test and `npm run build`. Expected: PASS and success.
- [ ] **Step 5:** Commit with `feat: make all of Bloom free`.
- [ ] **Step 6: Gate.** Ask Roy to confirm the one subscriber is cancelled. Only then delete `src/pages/api/stripe/*`, `src/pages/api/google-play/*`, `src/lib/payments/*`, `src/lib/googlePlayVerification.ts`, `src/hooks/useGooglePlayBilling.ts`, and the Stripe and Play dependencies. Build, then commit with `chore: remove billing code`. If not yet confirmed, leave this open and list it in the stage report.

### Task 4: New shell and navigation

**Files:**
- Create: `src/config/navigation.ts`, `src/config/navigation.test.ts`, `src/components/brand/BloomMark.tsx`, `src/components/brand/Botanical.tsx`, `src/components/RiskNote.tsx`
- Modify: `src/components/AppShell.tsx`, `src/components/Layout.tsx`, `src/components/SplashScreen.tsx`

**Interfaces:**
- Produces: `TAB_ITEMS` (Home `/home`, Lessons `/lessons`, Practice `/practice`, Leaderboard `/leaderboard`, Pansy `/ask-pansy`), `HEADER_ITEMS` (Brokers `/brokers`, Profile `/profile`). `<RiskNote variant="footer" | "inline" />`, `<Botanical variant="sprig" | "bloom" | "corner" />`, `<BloomMark size />`.

- [ ] **Step 1: Write the failing test.** No item in `TAB_ITEMS` or `HEADER_ITEMS` matches a `RETIRED_ROUTES` source, and `TAB_ITEMS.length === 5`.
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3:** Rebuild `AppShell`: five-tab bar on mobile, top nav on desktop at `md` and up, Brokers link and avatar in the header, footer `RiskNote`. Remove the search pill, bookmark, Pansy dock and scanner prompts. Use a soft-styled public variant in `Layout` for `publicPages`.
- [ ] **Step 4:** Run the test and `npm run build`. Expected: PASS and success.
- [ ] **Step 5:** On preview at 375px and 1280px, confirm the tab bar, top nav, no horizontal scroll and no console errors. Take a screenshot.
- [ ] **Step 6:** Commit with `feat: rebuild navigation around the seven sections`.

## Stage 2: Front door

### Task 5: One-screen sign-up and routing

**Files:**
- Create: `src/lib/postAuthPath.ts`, `src/lib/postAuthPath.test.ts`
- Modify: `src/pages/onboarding.tsx` (full replacement), `src/pages/auth/callback.tsx`, `src/pages/auth/confirm.tsx`, `src/services/authService.ts`

**Interfaces:**
- Produces: `FIRST_LESSON_PATH = "/lessons/what-is-gold-trading"`. `postAuthPath(profile: { onboarding_complete?: boolean | null } | null, returnTo?: string | null): string`.

- [ ] **Step 1: Write the failing tests.** Incomplete or null profile returns `FIRST_LESSON_PATH`. Complete returns `/home`. A local `returnTo` starting with `/lessons/` wins. `returnTo = "https://evil.com"` and `"//evil.com"` are ignored.
- [ ] **Step 2:** Run them. Expected: FAIL.
- [ ] **Step 3:** Implement `postAuthPath`. Replace `onboarding.tsx` with one screen (name, email, password, reassurance that it is free with no card). In the callback, set `onboarding_complete = true` when false, then route with `postAuthPath`. Fix `confirm.tsx`, which pushes to `/signals`. Check-your-email state explains the next step warmly.
- [ ] **Step 4:** Run tests and build. Expected: PASS and success.
- [ ] **Step 5:** Commit with `feat: one-screen sign-up into the first lesson`.

### Task 6: Lesson format and blocks

**Files:**
- Create: `src/data/lessons-v2/types.ts`, `src/lib/lessons/engine.ts`, `src/lib/lessons/engine.test.ts`, `src/components/lessons/blocks/{TextBlock,PansyBlock,ChartTapBlock,QuizBlock,OrderBlock,ScenarioBlock,SliderBlock}.tsx`

**Interfaces:**
- Produces:

```ts
type LessonBlock =
  | { type: "text"; body: string }
  | { type: "pansy"; body: string }
  | { type: "chartTap"; prompt: string; candles: Candle[]; correctIndexes: number[]; explanation: string }
  | { type: "quiz"; q: string; options: string[]; correct: number; explanation: string }
  | { type: "order"; prompt: string; steps: string[]; explanation: string } // steps in correct order
  | { type: "scenario"; prompt: string; choices: { label: string; outcome: string; good: boolean }[] }
  | { type: "slider"; prompt: string; min: number; max: number; step: number; initial: number; unit: string; outcomeKey: "leverage" | "lotSize" | "riskPercent"; note: string };
interface Lesson { slug: string; moduleId: string; title: string; subtitle: string; minutes: number; blocks: LessonBlock[]; practiceHint: string; }
```

- Produces: `isOrderCorrect(steps, attempt)`, `isInteractive(block)`, `canAdvance(block, answered)`, `sliderOutcome(key, value)`, `shuffleNotSolved(steps, seed)` (never returns the correct order), `saveResume(slug, index)`, `loadResume(slug)` with storage wrapped in try/catch, returning 0 if storage is unavailable.

- [ ] **Step 1: Write failing tests.** Cover order correctness, `shuffleNotSolved` never solved across seeds, interactive blocks blocking advance until answered, and resume returning 0 when storage throws. Add `sliderOutcome("leverage", 20)` with $100 of margin controlling $2,000, and showing a 1% adverse move costing $20.
- [ ] **Step 2:** Run them. Expected: FAIL.
- [ ] **Step 3:** Implement the engine and block components. `OrderBlock` supports drag and also up/down buttons. Wrong answers get kind explanations and a retry, never a penalty. Charts are inline SVG captioned "Illustrative example".
- [ ] **Step 4:** Run tests and build. Expected: PASS and success.
- [ ] **Step 5:** Commit with `feat: add interactive lesson blocks`.

### Task 7: Lesson player, first lesson and broker ending

**Files:**
- Create: `src/components/lessons/LessonPlayer.tsx`, `src/components/lessons/LessonComplete.tsx`, `src/data/lessons-v2/index.ts`, `src/data/lessons-v2/m1-gold-basics.ts`, `src/lib/lessons/saveProgress.ts`, `src/lib/lessons/saveProgress.test.ts`, `src/pages/lessons/[slug].tsx`

**Interfaces:**
- Consumes: Task 6 types and engine, `FIRST_LESSON_PATH`, `RiskNote`.
- Produces: `ALL_LESSONS`, `MODULES`, `getLesson(slug)`, `nextLesson(slug)`. `completeLesson(client, userId, slug, score, retries = 2): Promise<boolean>` upserting `lesson_progress` with `completed`, `completed_at`, `quiz_score`, `quiz_completed: true`, using `onConflict: "user_id,lesson_id"` and `lesson_id = slug`.

- [ ] **Step 1: Write failing tests.** `completeLesson` passes `onConflict: "user_id,lesson_id"`, retries on error then returns false, and returns true on success. Add a data test: every lesson has at least one interactive block and a unique slug, and `getLesson("what-is-gold-trading")` exists.
- [ ] **Step 2:** Run them. Expected: FAIL.
- [ ] **Step 3:** Write lesson `what-is-gold-trading` and the rest of module 1 (why gold moves, how a gold price is quoted). Build the player with progress blooms and resume.
- [ ] **Step 4:** Build `LessonComplete`: bloom animation and haptic (confetti in brand colours), +5 blooms, leaderboard position, "Practise this" using `practiceHint`, and "When you feel ready, try a free demo" to `/brokers`. A failed save shows a gentle retry and keeps the screen.
- [ ] **Step 5:** Signed-out visitors to a lesson go to `/onboarding?returnTo=<path>`.
- [ ] **Step 6:** Run tests and build, then step through the first lesson's blocks on preview with a dev-only fixture at 375px. Expected: all blocks work, with no console errors.
- [ ] **Step 7:** Commit with `feat: first interactive gold lesson with broker ending`.

### Task 8: Rest of the curriculum

**Files:**
- Create: `src/data/lessons-v2/m2-how-it-works.ts`, `m3-first-chart.ts`, `m4-staying-safe.ts`, `m5-demo-account.ts`, `m6-beyond-gold.ts`
- Modify: `src/data/lessons-v2/index.ts`
- Delete: `src/data/forex/*` (after adapting), `src/data/lessons.ts`, `src/pages/learn.tsx` (if not already removed)

**Interfaces:**
- Consumes: `Lesson`, `LessonBlock`.

- [ ] **Step 1: Extend the data test.** Exactly 6 modules in spec order, every lesson has an interactive block, and no lesson text matches the banned wording or directive phrases such as "buy now". Slugs for leverage, risk and demo lessons include a risk block. Assert the module 5 demo lesson mentions XM and IC Markets and that availability depends on country.
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3:** Write modules 2 to 6, each topic from the spec, in plain English with jargon explained at first use. Module 6 adapts forex lessons into the block format, at 2 to 4 lessons per topic and 3 to 5 minutes each. Use a leverage `slider` and order placement `order` block where they fit.
- [ ] **Step 4:** Run tests and build. Expected: PASS and success.
- [ ] **Step 5:** Commit with `feat: add gold-first curriculum`.

### Task 9: Lessons index and Home

**Files:**
- Create: `src/pages/lessons/index.tsx`, `src/components/home/SignedOutHero.tsx`, `src/components/home/SignedInHome.tsx`
- Modify: `src/pages/index.tsx`, `src/pages/home.tsx`, `src/components/BloomGarden.tsx`

**Interfaces:**
- Consumes: `MODULES`, `ALL_LESSONS`, `lesson_progress`, `/api/gems/leaderboard`, `/api/practice/leaderboard`.
- Produces: `firstIncomplete(completedSlugs: string[]): Lesson | null`.

- [ ] **Step 1: Write failing tests** for `firstIncomplete`: none completed returns the first lesson, it skips completed ones, and all completed returns null.
- [ ] **Step 2:** Run them. Expected: FAIL.
- [ ] **Step 3:** Implement the lessons index as a calm path with module cards and blooms for completed lessons. Build `/` per the spec with the exact headline "Learn gold & markets from zero. Free." and one "Start free" action. Build `/home` with continue card, garden and leaderboard position with gap to next place, plus an all-complete state pointing to Practice and Brokers.
- [ ] **Step 4:** Run tests, build and check `/` at 375px and 1280px with a screenshot. Expected: PASS and clean console.
- [ ] **Step 5:** Commit with `feat: new home and lessons path`.

- [ ] **Stage report:** after Task 9, push the branch (with Roy's go-ahead) so Roy can try the preview before Practice work begins.

## Stage 3: Practice and leaderboards

### Task 10: Instruments and trade maths

**Files:**
- Create: `src/config/instruments.ts`, `src/lib/practice/maths.ts`, `src/lib/practice/maths.test.ts`

**Interfaces:**
- Produces:

```ts
interface Instrument { symbol: string; name: string; plainName: string; assetClass: "metal"|"forex"|"index"; unitsPerLot: number; leverage: number; decimals: number; feedSymbol: string; quoteInJpy?: boolean; }
INSTRUMENTS // XAUUSD(100,20,2), XAGUSD(5000,10,3), EURUSD(100000,30,4), GBPUSD(100000,30,4), USDJPY(100000,30,3,quoteInJpy), US30(1,20,1,feed ^DJI), US500(1,20,1,feed ^GSPC)
getInstrument(symbol: string): Instrument | undefined
lotsToUnits(symbol: string, lots: number): number
marginFor(ticker: string, price: number, units: number): number
pnlFor(ticker: string, direction: "long"|"short", entry: number, exit: number, units: number): number
```

`marginFor` for USD-base pairs (USDJPY) is `units / leverage`. Unknown tickers (old stock positions) have leverage 1, so margin is `price * units`.

- [ ] **Step 1: Write failing tests.** `lotsToUnits("XAUUSD", 0.01) === 1`. `marginFor("XAUUSD", 4000, 1) === 200`. `marginFor("EURUSD", 1.1, 1000) ≈ 36.67`. `marginFor("USDJPY", 150, 1000) ≈ 33.33`. `marginFor("AAPL", 200, 5) === 1000`. `pnlFor("XAUUSD","long",4000,4010,1) === 10`. `pnlFor("XAUUSD","short",4000,4010,1) === -10`. `pnlFor("USDJPY","long",150,151,1000) ≈ 6.62` (converted at exit rate). `pnlFor("AAPL","long",200,210,5) === 50`.
- [ ] **Step 2:** Run them. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run them. Expected: PASS.
- [ ] **Step 5:** Commit with `feat: add instruments and paper trade maths`.

### Task 11: Prices and trade APIs

**Files:**
- Create: `scripts/check-fmp-feed.mjs`, `src/lib/practice/marketHours.ts`, `src/lib/practice/marketHours.test.ts`, `src/lib/serverQuote.test.ts`
- Modify: `src/lib/serverQuote.ts`, `src/pages/api/practice/trades.ts`, `close.ts`, `close-half.ts`, `update.ts`, `ohlc.ts`

**Interfaces:**
- Consumes: Task 10.
- Produces: `isMarketOpen(symbol: string, now: Date): boolean` (metals, forex and indices closed from Friday 22:00 UTC to Sunday 22:00 UTC). `getServerQuote(ticker)` keeps its signature and routes configured instruments through FMP, and other tickers through Finnhub for closing old positions.

- [ ] **Step 1: Feed gate.** Write `check-fmp-feed.mjs`, which reads `FMP_API_KEY` from the environment and prints each `feedSymbol`'s price. Ask Roy to run it with the key from Vercel. **If any instrument fails, stop and ask Roy to choose:** drop that instrument, upgrade FMP, or use another feed.
- [ ] **Step 2: Write failing tests.** `isMarketOpen("XAUUSD", Saturday noon UTC) === false`, true on Wednesday, false Friday 22:30 UTC, true Sunday 22:30 UTC. `getServerQuote` with mocked fetch: XAUUSD calls FMP with `XAUUSD`; US500 uses `^GSPC` URL-encoded; AAPL still calls Finnhub; a failed fetch returns null.
- [ ] **Step 3:** Run them. Expected: FAIL.
- [ ] **Step 4:** Implement. In `trades.ts`: accept `lots` for configured instruments and reject unknown symbols for new orders with status 400; closed market returns 409 with `error: "The market is resting right now. It reopens Sunday evening UTC."`; null quote returns the existing 502 with kind wording and no charge; reserve `marginFor` instead of full cost. In `close.ts` and `close-half.ts`: use `pnlFor` and credit `marginFor(...) + pnl`, while old stock positions release full cost. Closing while the market is closed returns the same resting message. Keep stop validation, and do not store `entry_price` beyond the 4 decimal column.
- [ ] **Step 5:** Add a handler test for `trades.ts` with mocked Supabase and quote, checking margin reserved, 409 when closed, and no insert on null quote. Add a `close.ts` test for an old AAPL position crediting full cost plus P&L.
- [ ] **Step 6:** Run all tests and build. Expected: PASS and success.
- [ ] **Step 7:** Commit with `feat: gold, forex and index paper trading`.

### Task 12: Practice screen

**Files:**
- Modify: `src/pages/practice.tsx`, `src/components/OrderTicket.tsx`, `src/components/ActiveTradeCard.tsx`, `src/pages/journal.tsx`
- Delete: `src/pages/paper-trader-v2.tsx`, `src/components/MarketTicker.tsx` (if unused)

Add `/paper-trader-v2` to `RETIRED_ROUTES` with destination `/practice`.

**Interfaces:**
- Consumes: `INSTRUMENTS`, Task 11 API responses (`lots` in, `error` messages out).

- [ ] **Step 1:** Add `/paper-trader-v2` to the retired-route test, and run it. Expected: FAIL.
- [ ] **Step 2:** Rebuild the page: heading "Practise what you just learned, safely.", instrument picker with plain names (gold first, default XAUUSD), lot chips from 0.01 with plain-English meaning ("0.01 lot = 1 ounce of gold"), required stop explained kindly, simulated balance label and `RiskNote`. Old positions show normally and can be closed. Empty state links to the first lesson. Move journal into a Practice tab, restyled.
- [ ] **Step 3:** Run tests and build. Expected: PASS and success.
- [ ] **Step 4:** On preview, check signed-out and layout states at 375px, then ask Roy to place and close a gold trade on the Vercel preview (requires Step 1 of Task 11 to have passed).
- [ ] **Step 5:** Commit with `feat: soft practice screen for gold and other instruments`.

### Task 13: Two leaderboards and privacy

**Files:**
- Create: `supabase/migrations/20261105_leaderboard_visibility.sql`, `src/lib/leaderboard/rank.ts`, `src/lib/leaderboard/rank.test.ts`
- Modify: `src/pages/leaderboard.tsx`, `src/pages/api/practice/leaderboard.ts`, `src/pages/api/gems/leaderboard.ts`, `src/lib/gems.ts`, `src/components/GemsLeaderboard.tsx`, `src/components/LeaderboardMini.tsx`

**Interfaces:**
- Produces: `displayName(profile: { challenge_name?: string|null; full_name?: string|null }): string` (challenge name, else first name, else "Member"). `rankRows<T>(rows: T[], score: (r: T) => number, hiddenIds: Set<string>, getId: (r: T) => string): (T & { rank: number })[]` (ties share a rank). `gapToNext(rows, myId, score): number | null`.

- [ ] **Step 1: Write failing tests.** `displayName({ full_name: "Ana Maria Lopez" }) === "Ana"`. Hidden members are excluded and ranks close up. Ties share a rank. Negative totals sort last but stay listed. Empty input returns `[]`. `gapToNext` is null for first place and for someone not on the board.
- [ ] **Step 2:** Run them. Expected: FAIL.
- [ ] **Step 3:** Write the migration: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_on_leaderboard BOOLEAN NOT NULL DEFAULT true;`. **Ask Roy to approve applying it to production before this task's code is deployed.**
- [ ] **Step 4:** Implement. Both APIs filter hidden members, use `displayName` and return `gap_to_next`. The page has tabs "Learning" (blooms) and "Practice gains" with the label "Simulated money, real practice." A hidden member still sees their own stats with "Only you can see this." Friendly empty states link to the first lesson or Practice. Keep share.
- [ ] **Step 5:** Run tests and build, then check both tabs at 375px. Expected: PASS and clean console.
- [ ] **Step 6:** Commit with `feat: learning and practice leaderboards with privacy`.

## Stage 4: Pansy and Brokers

### Task 14: Pansy as a learning companion

**Files:**
- Create: `src/lib/outputFilter.test.ts`, `scripts/check-pansy.mjs`
- Modify: `src/lib/pansyPersona.ts`, `src/lib/outputFilter.ts`, `src/pages/api/ask-pansy.ts`, `src/pages/api/pansy.ts`, `src/pages/ask-pansy.tsx`, `src/components/PansyChat.tsx`, `src/hooks/usePansyContext.ts`
- Delete: `src/pages/api/pansy-picks.ts`, `analyze.ts`, `analyze-portfolio.ts`, `compare-analysis.ts`, `daily-briefing.ts`, `weekly-recap.ts`, `src/services/pansyAnalysisService.ts`, `src/lib/pansyWeeklyAnalysis.ts`, and other Pansy components that present setups

**Interfaces:**
- Produces: `PANSY_GENERAL_PERSONA` (same export name). `scrubDirectives` keeps its signature.

- [ ] **Step 1: Write failing tests.** `scrubDirectives` flags "Buy XAUUSD now", "sell gold at 4000", "enter around 4,010", "set your stop loss at 3990" and "take profit at 4050". It leaves "A stop loss is a level you choose to limit a loss" and "Many beginners buy too large a position" unchanged.
- [ ] **Step 2:** Run them. Expected: FAIL. The current ticker pattern stops at 5 letters and level patterns require `$`.
- [ ] **Step 3:** Rewrite the persona per the spec: warm, plain language, explains gold, instruments, brokers and learning path, gives no entries, stops, targets, buy or sell calls or market predictions, offers to teach the skill instead, and notes that it is educational and not financial advice when relevant. Knows the six modules and that XM and IC Markets may not accept US residents. Remove scanner, stock and live-market context from `usePansyContext`, and update suggested prompts to lesson questions.
- [ ] **Step 4:** Extend the filter patterns and change the replacement to warm wording: "I can't give trade calls, but I'd love to show you how to read this yourself."
- [ ] **Step 5:** Run tests and build. Expected: PASS and success.
- [ ] **Step 6:** Write `check-pansy.mjs`, which sends these prompts to the persona via the Anthropic SDK and prints the replies: "Should I buy gold today?", "Give me an entry and stop for XAUUSD", "Where is gold going this week?", "What is leverage?", "Which is better for a beginner, XM or IC Markets?". Run it with Roy's `ANTHROPIC_API_KEY`. Expected: no trade calls in the first three, and clear explanations in the last two. The model id in `ask-pansy.ts` stays as is unless Roy asks.
- [ ] **Step 7:** Commit with `feat: Pansy becomes a supportive learning companion`.

### Task 15: Brokers education and US notice

**Files:**
- Create: `src/lib/brokers/region.ts`, `src/lib/brokers/region.test.ts`, `src/pages/api/geo.ts`
- Modify: `src/pages/brokers.tsx`, `src/config/brokers.ts`, `src/config/brokerPromos.ts`, `src/components/BrokerCard.tsx`, `src/components/BrokerHubDisclaimer.tsx`, `src/components/lessons/LessonComplete.tsx`
- Delete: `src/components/FindMyBrokerWizard.tsx`, `BrokerStrip.tsx`, `FeaturedBrokerCard.tsx`, if unused after the rebuild

**Interfaces:**
- Produces: `GET /api/geo` returning `{ country: string | null }` from `x-vercel-ip-country`. `brokerNotice(country: string | null): "us" | "general"`. `canShowOpenButton(broker: BrokerConfig, notice): boolean`.

- [ ] **Step 1: Write failing tests.** `brokerNotice("US") === "us"`, `"GB"` and `null` give `"general"`. `canShowOpenButton` is false for US on CFD brokers, false for an empty `affiliateUrl` such as IC Markets today, and true for XM in GB.
- [ ] **Step 2:** Run them. Expected: FAIL.
- [ ] **Step 3:** Implement. Rebuild the page per the spec: what a demo is, what to look for, XM and IC Markets first, other active Forex and CFD brokers next, then TradingView under learning tools. Webull moves down, marked stocks only. Keep commission disclosure visible near buttons, plus `RiskNote` and "Availability depends on your country". Use the US notice in the spec. `LessonComplete` follows the same rule, so US visitors see Practice instead of a demo prompt.
- [ ] **Step 4:** Check XM and IC Markets facts against their official sites using the browser pane, without entering any data. Update `verifiedAt` and `sourceNotes`, using `null` for anything unverified. Ask Roy for the IC Markets affiliate link, and leave it information-only if not yet supplied.
- [ ] **Step 5:** Run tests and build, then check the page at 375px with `/api/geo` mocked as US and GB. Expected: PASS, correct notices.
- [ ] **Step 6:** Commit with `feat: gentle broker education with US notice`.

## Stage 5: Finish

### Task 16: Profile, retained pages, copy and legal

**Files:**
- Modify: `src/pages/profile.tsx`, `src/pages/more.tsx` (redirect to `/profile` and add to `RETIRED_ROUTES`), `about.tsx`, `terms.tsx`, `disclaimer.tsx`, `privacy.tsx`, `refund-policy.tsx`, `contact.tsx`, `certificate.tsx`, `404.tsx`, `offline.tsx`, `src/components/PansyStory.tsx`, `PLAY_LISTING.md`, `src/components/SEO.tsx`, `public/manifest.json`
- Test: `src/config/copySweep.test.ts`

**Interfaces:**
- Consumes: `show_on_leaderboard`, `displayName`, `ALL_LESSONS`.

- [ ] **Step 1: Write the failing test.** Scan retained user-facing files in `src/pages` and `src/components` (excluding `api`, `refund-policy.tsx`, `ui/` and identifiers such as `isPro`) for JSX text or string literals matching `/\b(signals?|scanners?|upgrade|free trial|go pro|pro plan|gap[- ]and[- ]go)\b/i`, and for hardcoded dark hex values `#07080C`, `#0C1016`, `#121821`, `#171E28`, `#0E1B30`, `#27B7C8`.
- [ ] **Step 2:** Run it. Expected: FAIL, listing offenders.
- [ ] **Step 3:** Fix each offender. Build Profile per the spec, including the leaderboard toggle and all empty states in the supportive voice. Update legal pages for free, no subscriptions and affiliate disclosure, keeping refund history for past purchases. **Mark legal wording as a draft for Roy to approve.**
- [ ] **Step 4:** Run tests and build. Expected: PASS and success.
- [ ] **Step 5:** Commit with `feat: finish profile, copy and legal for the redesign`.

### Task 17: MotionSites polish, illustrations and final checks

**Files:**
- Modify: `src/components/home/SignedOutHero.tsx`, `src/components/brand/*`, `README.md`, `twa-manifest.json`
- Create: `public/illustrations/*` (only with Roy's approval)

**Interfaces:**
- Consumes: `get_prompt` for `mindora-hero`.

- [ ] **Step 1:** Open `mindora-hero` with `get_prompt` (1 of 2 remaining). Adapt its layout and motion to Bloom's tokens, fonts and copy. Do not add new dependencies or import its colours. Reduced-motion disables animation. Keep the second open in reserve for one fix or section.
- [ ] **Step 2:** Preview free background videos only if they suit morning light and the terms allow use. Otherwise keep the botanical gradient. Any video must be muted, under 3MB on mobile or poster-only, and not delay first paint.
- [ ] **Step 3:** Ask Roy to approve image-tool cost for illustrations of women learning (diverse ages, gentle style). If declined, keep botanicals and record that this part of the brief is unmet.
- [ ] **Step 4:** Run `npm test`, `npm run lint`, `npm run build`. Expected: all pass, with no new lint errors.
- [ ] **Step 5:** On preview at 375px and 1280px, walk `/`, `/onboarding`, `/lessons`, a lesson, `/practice`, `/leaderboard`, `/ask-pansy`, `/brokers`, `/profile` and retired URLs, and check console errors. Take screenshots.
- [ ] **Step 6:** Check each success criterion in spec section 1 and report which were verified by Claude, which by Roy, and which are not verified.
- [ ] **Step 7:** Commit with `feat: final polish for the Bloom redesign`.
- [ ] **Step 8:** Request a whole-branch review. Fix findings. On Roy's approval, merge and push to `origin` and `gitlab`.
- [ ] **Step 9:** Tell Roy what needs a new native build (splash and background colours) and which store listing text in `PLAY_LISTING.md` to publish.
