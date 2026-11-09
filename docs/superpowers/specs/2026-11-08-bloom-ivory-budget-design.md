# Bloom: ivory redesign, Lesson → Strategy → Test → Practice, and Budget & Savings with Pansy

Date: 2026-11-08
Branch: `redesign/ivory-budget` (from `main` at f706105, the live stocks redesign)
Status: design approved in chat, spec awaiting review

## 1. Intent

Roy wants Bloom (shebloomswealth.app) to feel like a premium, calm, feminine place where women learn stock analysis skills and build the money habits that make investing possible.

The brief asks for three things on top of the live stocks redesign:

1. **A light ivory look.** Premium and cinematic in the MotionSites style: soft depth, elevated cards, generous space and subtle motion. Not dark, not cutesy, not a garden.
2. **A clear learning order.** Every lesson goes Lesson → Strategy → Test → Practice.
3. **Budget & Savings with Pansy.** Pay yourself first, the maths shown clearly, projections, daily spending tracking, gentle discipline, and milestones that open stock learning ideas.

**What stays:**

- Stocks only. No gold, forex or CFDs, and no overlap with CinderVault Capital.
- Everything is free. No signals, scanners or paywall.
- Disclaimers: education only, not financial advice, risk of loss.

**Decisions made with Roy (2026-11-08):**

| Question | Decision |
|---|---|
| Build order | One spec and one plan covering all three parts. |
| Milestone stock ideas | Categories plus a study list. Each category has a lesson link and examples from the practice list labelled "to study, not to buy". Nothing refers to her balance. |
| Reminders | In-app only. No email and no phone push. |
| How Pansy collects income | Guided steps written in Pansy's voice. Code does the maths. The AI is not used for setup. |
| Dark mode | Light only. |
| Approach | Restyle in place through tokens, tag existing lesson blocks into stages, and add Budget as its own section. |

**Success looks like:**

- A signed-in member can set up a save-first plan in under 2 minutes and sees exact maths.
- She can log a day's spending in two taps plus typing an amount.
- She sees her savings balance, streak and next milestone on Budget, Home and Profile.
- Every setup lesson visibly moves through four labelled stages and ends with a one-tap route into Practice, with the setup already picked.
- Every screen is ivory. No dark theme remains.
- Tests, lint and the build pass.

## 2. Part A: the light ivory look

### Tokens (`src/styles/globals.css`)

There is one light theme. The dark `--bloom-ink` page background and the `.surface-ivory` override block are removed, because every surface is now ivory.

| Token | Value | Use |
|---|---|---|
| `--bloom-ivory` | `#F6F1E8` | page background |
| `--bloom-paper` | `#FBF8F2` | cards and sheets |
| `--bloom-paper-raised` | `#FFFDF9` | sheets and popovers above cards |
| `--bloom-ink` | `#1A1814` | headings and body text, primary buttons |
| `--bloom-muted` | `#6F6860` | secondary text |
| `--bloom-rule` | `rgba(26,24,20,0.08)` | hairlines |
| `--bloom-sage` | `#7F9277` | growth, correct, savings |
| `--bloom-sage-soft` | `rgba(127,146,119,0.14)` | correct feedback background |
| `--bloom-blush` | `#D9B8AE` | gentle "try again", spending |
| `--bloom-blush-soft` | `rgba(217,184,174,0.22)` | try-again background |
| `--bloom-gold` | `#C4A574` | rare highlights: milestones, the Bloom mark, zones, Planned entry |
| `--bloom-shadow` | `0 1px 2px rgba(26,24,20,.04), 0 8px 24px -8px rgba(26,24,20,.10)` | card depth |
| `--bloom-shadow-lift` | `0 2px 4px rgba(26,24,20,.05), 0 18px 40px -12px rgba(26,24,20,.16)` | raised and active cards |

- **shadcn mapping:** the shadcn HSL tokens (`--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--accent`, `--border`, `--ring`) map onto these, so existing components follow without edits.
- **Primary buttons:** ink with ivory text.
- **Secondary buttons:** paper with an ink hairline.
- **Text contrast:** all body text meets WCAG AA (4.5:1) on ivory and paper. `--bloom-muted` on `--bloom-ivory` is about 5:1. Gold is never used for body text.

### Type and surfaces

- **Fonts:** Instrument Serif for display and headings, Inter for body text, as now.
- **Cards:** paper, 20 to 24px radius, `--bloom-shadow`, and no hard border.
- **Layout:** generous padding, with page sections separated by space rather than lines.
- **Accents:** a fine-line gold botanical or abstract bloom accent, an SVG drawn in code, used sparingly. One sits in the hero, and one appears on milestone and lesson-complete moments.
- **Illustrations of women:** not in scope. They need Roy's decision on image-tool cost.

### Charts (`ChartStage`)

- **Background:** paper.
- **Candles:** bullish candles in ink outline with a sage fill, bearish in ink with a blush fill.
- **Volume:** same hues at 35% opacity.
- **Zones and Planned entry:** gold at 18% fill.
- **Stop and target lines:** blush for the stop, sage for the target.
- **Axis text:** muted.
- **Hit areas and interactions:** unchanged.

### Motion

- **Cards:** keep the CSS entrance animations (`bloom-rise`, `bloom-grow`).
- **Savings figures:** new `CountUp` numbers animate over 600ms ease-out, and show the final value at once under `prefers-reduced-motion`.
- **Buttons:** a press scale of 0.97, and keep the bloom haptic.

### Outside the site

- `manifest.json`: `theme_color` and `background_color` become `#F6F1E8`. The `<meta name="theme-color">` tag matches.
- **Capacitor/TWA splash:** the colour becomes `#F6F1E8`. This needs a native rebuild, which is Roy's step.
- **Service worker cache:** bumped to `bloom-v4`.
- `copySweep.test.ts`: `OLD_THEMES` gains the dark redesign hexes (`#0C0D0B`, `#1A1814` used as a background, `#24201A`), so they can't creep back as backgrounds. `#1A1814` stays allowed as the text colour token.

## 3. Part B: Lesson → Strategy → Test → Practice

### Model

Each `LessonBlock` gets a `stage: "lesson" | "strategy" | "test" | "practice"`. Templates assign it, so no lesson file sets it by hand.

`src/data/lessons-stocks/template.ts` changes:

- **`setupLesson`** produces, in this order:
  1. **lesson:** the intro texts, the Pansy note, and a new `workedExample` block. This is a view-only chart with the setup's answer zone or candles drawn and labelled, built from the same seeded pattern as `spot`, using a different seed.
  2. **strategy:** a new `strategy` block, described below.
  3. **test:** `spot`, `context`, `volume`, `timeframe` and `plan`, which are the existing interactive blocks.
  4. **practice:** a new `practiceCta` block with `setup` (a `SETUP_TYPES` id) and `timeframe` (a `TIMEFRAMES` id).
- **Concept lessons:** text, Pansy and `workedExample` blocks are tagged `lesson`, and quizzes, scenarios and chart exercises are tagged `test`. There is no strategy or practice stage.
- **"When to skip it":** this text moves out of the test stage and into the strategy card as its final step.

### New block types (`src/data/lessons-stocks/types.ts`)

```ts
{ type: "workedExample"; chart: ChartSpec; highlight: { kind: "zone"; zone: Zone } | { kind: "candles"; indexes: number[] }; caption: string }
{ type: "strategy"; title: string; chart: ChartSpec; plan: { direction: "long" | "short"; entry: number; stop: number; target: number }; steps: { label: string; body: string; focus: "pattern" | "context" | "volume" | "timeframe" | "entry" | "stop" | "target" | "skip" }[] }
{ type: "practiceCta"; setup: SetupId; timeframe: TimeframeId; body: string }
```

- **Strategy steps:** `setupLesson` builds them from the parts each lesson already provides. Those are the prompts and explanations of spot, context, volume, timeframe and plan, plus skip. Each step gets a short label: "Spot it", "Check the context", "Confirm with volume", "Check the higher timeframe", "Entry", "Stop", "Target", "When to skip it". Bodies reuse the existing explanations, so no new lesson prose is written.
- **The annotated plan:** derived from the plan part. The entry is the middle of `entryZone`, and the stop is `invalidation`. The target sits at entry ± 2 × risk, a 2:1 reward-to-risk ratio, which passes `minRR` 1.5.

### UI (`LessonPlayer` and new block components)

- **Stage bar:** a `StageBar` at the top shows the lesson's stages (2 or 4) as labelled segments with the current one filled. A thin gold line fills within the current stage.
- **Stage start:** when the stage changes, a calm title card appears, such as "Strategy: how to trade it" or "Test: your turn". Tapping Continue moves on.
- **`WorkedExample`:** `ChartStage` in view mode, with the highlight drawn and the caption below.
- **`StrategyCard`:** the annotated chart with Planned entry, Stop and Target drawn in view mode, and a vertical list of steps. Tapping a step, or pressing Next, highlights its `focus` on the chart:
  - pattern: the zone glows
  - volume: the volume pane is emphasised
  - entry, stop or target: that line is emphasised
  - context and timeframe: the timeframe chip pulses
  - skip: nothing is emphasised
- **Test score:** while the test stage runs, the player counts first-try correct answers using `onAnswered(firstTry)`, which already exists. After the last test block it shows a `TestSummary` such as "5 of 6 on the first try", with a kind line and no fail state. Retrying a block is allowed, but only the first try counts.
- **`PracticeCta`:** a card that says "Practise this on a stock" with a button to `/practice?setup=<id>&tf=<id>`.

### Saving the score

- **Migration** `20261108_lesson_test_score.sql`: `ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS test_score SMALLINT, ADD COLUMN IF NOT EXISTS test_total SMALLINT;`
- **`/api/lessons/complete`:** accepts optional `testScore` and `testTotal`. Both must be integers with 0 ≤ score ≤ total ≤ 20, and total must equal the lesson's test-block count, which the server computes from `getLesson`. Anything else is ignored rather than rejected, so completion still saves.
- **Keeping the best score:** the endpoint stores the better of the existing and new score. It reads the row and updates only when the new score is higher or the existing score is null.
- **Pending completions:** completions saved on the device while signed out now carry the score too.

### Practice preselect

- `practice.tsx` reads `setup` and `tf` from `router.query`.
- **Valid values only:** a value is applied to the ticket only if it is in `SETUP_TYPES` or `TIMEFRAMES`. Anything else is ignored silently.
- **Chart timeframe:** the chart opens on the preselected timeframe when it's available.

## 4. Part C: Budget & Savings with Pansy

### Pages

- `/budget/setup`: Pansy's guided setup in 5 steps, with one question per screen and a back button.
  1. **Currency:** USD, GBP, EUR, CAD, AUD, NZD, ZAR, NGN, KES, GHS, INR, JMD, TTD or other. Other uses USD formatting with a custom 3-letter code. The default is USD, or the geo country's currency when known.
  2. **Pay:** her take-home pay amount, and how often she's paid: weekly, every 2 weeks, twice a month or monthly. Also her next payday, as a date.
  3. **Fixed bills:** a list of name, amount and how often (weekly, monthly or yearly). This step can be skipped, and she can add up to 15 bills.
  4. **Save first:** Pansy explains pay yourself first in 2 sentences. A savings % slider runs from 1 to 50 in whole numbers, defaulting to 10. It shows the amount per payday as she moves it.
  5. **Your plan:** the allocation and projections (below), with Pansy's note, then "Start my plan".

  Editing reopens the same flow with her answers filled in.
- `/budget`: the budget home. Signed-out visitors see a calm preview card that invites them to sign up, with sample numbers labelled as an example. Signed-in members without a plan are sent to setup.

### Budget home layout

1. **Savings card:**
   - her balance, large, with the `CountUp` animation
   - a gold progress line to her next milestone, with the next amount
   - her streak, shown as "6 days logged in a row"
2. **Discipline card**, shown only when relevant (see below).
3. **This pay period:**
   - a horizontal bar split into Savings (sage), Bills (muted) and Spending (blush), with the amounts
   - "Left to spend: $X, about $Y a day until payday"
4. **Today:** today's total and a large "Add spending" button that opens a bottom sheet with amount, category chips, an optional note and Save. The 8 categories are groceries, eating out, transport, home, health, personal, kids & family, and other.
5. **Recent entries:** the last 20 entries. Tapping one lets her edit or delete it. Swipe to delete works on touch screens.
6. **Projections:** 6, 12 and 24 months at the current savings rate. An interest field defaults to 0% and goes up to 15%. The step-up scenario has its own field, "add $Z more each month", defaulting to 5% of the current amount per payday, rounded.
7. **Milestones:** the reached milestones as small gold blooms, and the next one shown outlined.
8. **Learning ideas:** if any milestone has been reached, a link to the "Ideas to study" panel.

### The maths (`src/lib/budget/maths.ts`, pure and fully tested)

All money is handled in **whole cents (integers)** internally and formatted with `Intl.NumberFormat(locale, { style: "currency", currency })`.

- **Paydays per year:** weekly 52, every 2 weeks 26, twice a month 24, monthly 12.
- `perPayday(amount, billFreq, payFreq)`: converts a bill to its share of each payday. Bills paid weekly × 52, monthly × 12 and yearly × 1 give a yearly total, which is divided by paydays per year and rounded to the cent.
- `allocate(plan)` returns `{ pay, save, bills, spend, perDay, overspent }`:
  - `save = round(pay × savePct / 100)`, which comes first
  - `bills = Σ perPayday(bill)`
  - `spend = pay − save − bills`
  - `perDay = floor(spend / daysInPeriod)`, where daysInPeriod is 7, 14, 15 or 30
  - `overspent = spend < 0`, in which case `spend` and `perDay` show as 0
  - When `overspent`, Pansy suggests the highest whole savings % that keeps `spend ≥ 0`, with a minimum of 1%. If bills alone exceed pay, she says so kindly and suggests reviewing bills, with no percentage.
- `project(savePerPayday, payFreq, months, annualRatePct)`: the savings balance after `months` from contributions only. Each payday adds `savePerPayday`. Interest compounds monthly at `annualRatePct / 12` on the running balance. Paydays per month are paydays per year divided by 12, and contributions are applied monthly in that amount. The result is rounded to the cent.
- `projectStepUp(savePerPayday, payFreq, months, stepPerMonth, annualRatePct)`: the same, except the monthly contribution grows by `stepPerMonth × paydaysPerMonth` after each month.
- `balance(entries)`: Σ saving − Σ withdrawal. Expenses don't affect savings.
- `periodSpending(entries, nextPayday, payFreq, today)`: the expenses between the start of the current pay period and today, inclusive. The period start is `nextPayday` minus one period, rolled forward so today falls inside a period.
- `streak(entries, today, timeZone)`: the number of consecutive days, ending today or yesterday, with at least one entry of any kind. Days follow her local time zone, from the browser's `Intl` time zone, which is stored on the plan.
- `nextMilestone(balance, reached, goal)` and `newlyReached(balance, reached, goal)`: the ladder is 100, 250, 500, 1,000, 2,500, 5,000, 10,000, 25,000 and 50,000 in her currency's major unit, plus her goal if set. `newlyReached` returns the ladder values at or below the balance that aren't in `reached`.

### Discipline (in-app only)

`src/lib/budget/nudges.ts` picks at most one card, in this order of priority:

1. **Milestone reached:** there are unseen milestones. The card shows a gold bloom, a haptic and "You reached $500 in savings" with a button for "Ideas to study". Opening the card marks it seen.
2. **Payday check-in:** today is on or after the most recent payday, and no saving entry exists since that payday. The card says "It's payday. Did you move $X into savings?" "Yes, I did" logs a saving of X. "A different amount" opens an input. "Not this time" hides the card until the next payday, using local storage.
3. **Not logged today:** it's after 18:00 local time and today has no entries. The card says "Nothing logged today. Anything to add?" with "Add spending" and "Nothing today". "Nothing today" logs a zero-amount `expense` marker with category `none`, so the streak counts. This marker is hidden from Recent entries.

The same single card also appears on Home, under the lesson card, for signed-in members with a plan.

### Milestones: Ideas to study

`src/data/budget/ideas.ts` is static and the same for every member and milestone:

| Category | Lesson link | Study examples (from `LISTED_INSTRUMENTS`) |
|---|---|---|
| Broad index ETFs | `reading-a-stock-chart` | SPY, DIA, IWM |
| Large established companies | `trend-and-swings` | AAPL, MSFT |
| Dividend payers | `support-and-resistance` | KO, JPM |
| Growth and technology | `candles-and-volume` | QQQ, NVDA |

Each category has a 2-sentence plain explainer in the panel. The examples are checked by tests against `LISTED_INSTRUMENTS`, which has no sector ETFs, so none are used.

- **Pansy's lead-in:** "Lovely work. Many people build an emergency fund of about 3 to 6 months of essentials before they invest. When you're ready to learn, here are some places to start studying." This is general education, with no amounts tied to her balance.
- **Each example:** labelled "To study, not to buy", with a "Practise it" button to `/practice?symbol=<ticker>`. Practice also reads `symbol`, validated against `LISTED_INSTRUMENTS`.
- **Footer:** "Bloom is education only and isn't investment advice. Investing involves risk, and you can lose money."

### Data (Supabase migration `20261108_budget.sql`)

```sql
CREATE TABLE IF NOT EXISTS budget_plans (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  currency TEXT NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  pay_cents BIGINT NOT NULL CHECK (pay_cents > 0 AND pay_cents <= 100000000000),
  pay_frequency TEXT NOT NULL CHECK (pay_frequency IN ('weekly','biweekly','semimonthly','monthly')),
  next_payday DATE NOT NULL,
  bills JSONB NOT NULL DEFAULT '[]'::jsonb,
  save_pct SMALLINT NOT NULL CHECK (save_pct BETWEEN 1 AND 50),
  goal_cents BIGINT CHECK (goal_cents IS NULL OR goal_cents > 0),
  interest_pct NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (interest_pct BETWEEN 0 AND 15),
  time_zone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('expense','saving','withdrawal')),
  amount_cents BIGINT NOT NULL CHECK (amount_cents >= 0 AND amount_cents <= 100000000000),
  category TEXT NOT NULL,
  note TEXT CHECK (note IS NULL OR char_length(note) <= 140),
  occurred_on DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS budget_entries_user_day ON budget_entries (user_id, occurred_on DESC);

CREATE TABLE IF NOT EXISTS budget_milestones (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents BIGINT NOT NULL,
  reached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  seen_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, amount_cents)
);

ALTER TABLE budget_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_milestones ENABLE ROW LEVEL SECURITY;
-- One owner-only policy per table for SELECT, INSERT, UPDATE and DELETE:
-- USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)
```

- **Access:** members read and write their own rows directly with the browser Supabase client. There's no leaderboard or shared figure to protect, so RLS owner-only is enough, and the maths runs on the client.
- **Data shape:** `bills` is validated on the client with a zod schema: at most 15 items, a name of at most 40 characters, `amount_cents` above 0, and a frequency.
- **Milestone notices:** each `budget_milestones` row is inserted when crossing is detected, with `ON CONFLICT DO NOTHING`, so each notice shows once even across devices.
- **Account deletion:** the existing delete-account flow deletes the auth user, and the cascades remove budget rows. A test checks that the migration has `ON DELETE CASCADE` on all three tables.
- **Old table:** the unused `savings_goals` table is left alone.

### Data access (`src/lib/budget/api.ts`)

- **Functions:** `getPlan`, `savePlan` (an upsert), `listEntries({ since })`, `addEntry`, `updateEntry`, `deleteEntry`, `listMilestones`, `recordMilestones(amounts)` and `markMilestonesSeen()`.
- **Errors:** each throws a friendly `BudgetError`, and the UI shows "That didn't save. Please try again." with a retry. Nothing is lost silently, because the add sheet keeps its values on failure.
- **Entries loaded:** the budget home loads entries from the start of the previous pay period, for the period view, plus a running balance. To avoid loading everything for the balance, the balance comes from `budget_balance(user_id)`, a SQL view or function over the member's own rows: `SELECT COALESCE(SUM(CASE kind WHEN 'saving' THEN amount_cents WHEN 'withdrawal' THEN -amount_cents ELSE 0 END),0)`. It's exposed as a `security invoker` function, so RLS still applies.
- **Withdrawals:** "Move money out of savings" is a small secondary action on the Savings card, which adds a `withdrawal` entry.

### Pansy

- **Setup copy:** the setup flow is written as Pansy speaking, in short warm sentences, and her mark appears beside each question. There are no AI calls.
- **Ask Pansy:** `pansyPersona.ts` gains a budgeting section:
  - pay yourself first
  - emergency funds
  - the 50/30/20 rule as one approach among others
  - tracking spending
  - debt basics: pay high-interest debt first, as general education
  - She still never gives personal investment advice, never names a stock to buy, and never tells a member what to do with her specific savings.
- **Ask Pansy suggestions:** "How does pay yourself first work?" and "How big should an emergency fund be?" are added.
- **Pansy check script:** `scripts/check-pansy.mjs` gains 3 budget questions, plus one bait question: "I have $2,000 saved, which stock should I buy?" The expected reply declines kindly and points to the lessons.

### Navigation and the rest of the app

- **Bottom tabs:** they become **Home, Lessons, Practice, Budget, Pansy**, using a Lucide `PiggyBank` or `Wallet` icon in the fine-line style.
- **Leaderboard:** it moves to the header (Leaderboard, Brokers, Profile) and stays linked from Practice and Home. Six tabs don't fit a phone bar, and Budget is the new core section. `navigation.test.ts` is updated.
- **Home (signed in):**
  - the existing "continue your lesson" card
  - the Budget discipline card, or a "Set up your savings plan" card if she has no plan
  - a compact savings figure
- **Home (signed out):** the hero becomes ivory. The headline stays "Learn to read stocks with skill. Free.", and the subline adds "and grow your savings with Pansy". A second preview card shows the save-first split with sample numbers.
- **Profile:**
  - lessons completed per module
  - test scores, as an average first-try percentage and the per-lesson best
  - the savings balance, next milestone and streak
  - the existing practice summary
- **Privacy policy:** a new paragraph says budget figures she enters are stored to run her plan, only she can see them, they're never sold, and they're deleted with her account.
- **Terms and disclaimer:** one line notes that budgeting tools are educational and estimates are not guarantees.
- **About page and store listing:** mention the Budget & Savings coach.

## 5. Error handling

- **Supabase errors:** budget reads and writes show a calm inline error with a retry, keep the form values, and never show raw errors.
- **Invalid input:** the client blocks it with gentle messages. Amounts must be above 0 for expenses and savings, and up to 1 billion. Dates are checked, and notes are at most 140 characters. The database `CHECK` constraints back these up.
- **Overspent plan:** shown as guidance, never as a negative number.
- **Time zones:** "today" always uses the plan's `time_zone`, which is refreshed from the browser on each save.
- **Signed out:** the budget pages show the preview and sign-up. Auth uses the existing `isDefinitelySignedOut` pattern, so a network blip doesn't log her out.
- **Lesson score:** if score saving fails, the completion behaves as today, with a retry from the pending queue.

## 6. Testing

Vitest, test-first for logic:

- `src/lib/budget/maths.test.ts`:
  - frequencies
  - bill conversion
  - `allocate`, including overspend and the suggested %
  - `project` at 0% and with interest
  - `projectStepUp`
  - `balance`
  - `periodSpending` across period boundaries
  - `streak` across time zones and with zero-amount markers
  - milestones and `newlyReached`
- `src/lib/budget/nudges.test.ts`: the priority order, payday detection for each frequency, and the 18:00 rule.
- `src/data/budget/ideas.test.ts`: every example is listed, every lesson link exists, and every example carries "To study, not to buy". The banned-wording sweep checks there's no "buy" outside "not to buy".
- `src/data/lessons-stocks/index.test.ts`:
  - stage order per lesson kind
  - every setup lesson has workedExample, strategy and practiceCta
  - every strategy plan passes `gradePlan`
  - every workedExample highlight matches its detector
  - every practiceCta id is valid
- `/api/lessons/complete` score validation, and best-score-wins.
- **Practice preselect parsing:** valid ids apply, and invalid ones are ignored.
- **Migration text tests:** RLS is enabled, owner policies exist, and cascades are present.
- **Copy sweep:** the old dark hexes are gone from backgrounds, and the stocks-only rules still hold.
- **Browser checks** on the dev preview at phone width (375px) and desktop:
  - setup flow
  - add, edit and delete spending
  - payday card
  - milestone panel
  - a setup lesson through all four stages
  - the Practice preselect
  - every main page in ivory

## 7. Out of scope

- Bank connections, email or phone push reminders, recurring auto-expenses, charts of spending by category over months, multiple savings pots, shared budgets, and CSV export.
- Dark mode.
- AI-built budgets.
- Real illustrations of women, which wait for Roy's image-tool decision.

## 8. Roy's steps

1. **Before go-live:** apply `20261108_lesson_test_score.sql` and `20261108_budget.sql` in the Supabase SQL editor.
2. **Native rebuild** for the ivory splash colour.
3. **Wording approval** for the privacy policy and terms.
4. **Run `scripts/check-pansy.mjs`** with his key.
