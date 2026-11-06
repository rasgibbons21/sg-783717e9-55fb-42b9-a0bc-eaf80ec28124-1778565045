# Bloom redesign 2: premium stock analysis education (FVG first)

Date: 2026-11-06
Status: awaiting review
Replaces: `2026-11-05-bloom-feminine-gold-redesign-design.md`. That design shipped and is live; this one supersedes its look, curriculum, Practice instruments and copy.

## 1. Outcome

Bloom becomes a premium, editorial, completely free place for women to learn to **analyse stocks** and apply concrete setups. It starts with Fair Value Gaps (FVGs) and builds into a full price-action toolkit.

Every setup is taught the same practical way:

> spot it → check the context → confirm with volume → line up timeframes → plan the trade → practise it.

Lessons and Practice cover stocks only. Nothing duplicates the gold and forex focus of CinderVault Capital.

### Success criteria

- A new visitor is inside the first interactive stock lesson within about a minute, with no payment step.
- Every setup lesson includes all of the following:
  - a "find it" exercise on a chart
  - a volume read
  - a timeframe switch
  - a trade-plan exercise where she drags entry, stop and target
- Practice trades only US stocks and ETFs, using the same chart tools as the lessons.
- Lessons, Home, Practice, Pansy and Profile contain no gold, forex, XAUUSD or CFD content. Brokers and the legal pages are the only exceptions, under the rules in section 8.
- The whole app uses the premium dark-and-ivory look at phone width, with no leftover soft-garden styling.

## 2. Decisions already made

| Topic | Decision |
|---|---|
| Market | US stocks and ETFs only, for both lessons and Practice. |
| Pricing | Still 100% free. Sign-up stays as it is now. |
| Kept | Free sign-up, the lesson engine, Practice safety work, both leaderboards, Pansy's no-trade-calls rules, redirects and disclaimers. |
| Curriculum | Built around the setups in Roy's reference: FVG, IFVG, order block, breaker block, liquidity sweep, BOS, CHoCH, OTE, Silver Bullet, supply and demand, support and resistance, breakouts, CRT and Power of 3. Every lesson covers execution, volume and timeframes. |
| KRM | Left out, because it isn't a standard term. Roy can define it later. |
| Brokers | All current brokers stay for visitors outside the US. US visitors see Webull and TradingView. |
| Reference video | Bloom writes its own lessons. Nothing from the video is copied. |
| Pansy's name | Never renamed. |

## 3. Decisions made by default (say if you disagree)

- **Points, not blooms:** the learning leaderboard counts "points" (5 per lesson). The garden visual is removed and replaced by a slim progress line.
- **Leaderboard counts stocks only:** Practice gains ranks closed trades on stocks and ETFs, including older stock trades. Gold, forex and index trades from this week stay in each member's own history but don't count.
- **Old open positions:** they can still be priced and closed. Those instruments are hidden from the picker.
- **Process score:** each closed trade gets a process score from its plan (described in section 6). The leaderboard shows it next to P&L but still ranks by P&L, as the brief asks.
- **Lesson charts:** these are made-up candles labelled "Illustrative example". They're built from tested pattern builders, so every "find the FVG" answer is genuinely correct.
- **Fonts:** Instrument Serif for headlines and Inter for body text.
- **Illustrations:** abstract geometric bloom marks and clean chart graphics. Illustrations of women studying charts are generated only after Roy approves the image-tool cost.
- **MotionSites:** the last free prompt open is used only if a premium hero layout fits. Otherwise the hero is built directly.

## 4. Visual system

| Token | Value | Use |
|---|---|---|
| Ink | `#0C0D0B` | App background |
| Panel | `#1A1814` | Dark cards, header, tab bar |
| Ivory | `#F6F1E8` | Reading surfaces: lesson cards, forms |
| Paper | `#FBF8F2` | Raised ivory surfaces |
| Light text | `#F3EEE4` | Text on ink and panel |
| Dark text | `#1A1814` | Text on ivory |
| Muted | `#A79E91` on dark, `#6F6860` on ivory | Secondary text |
| Gold | `#C4A574` | Accents, active states, thin rules, primary buttons (with ink text) |
| Sage | `#8FA088` | Bullish candles, gains |
| Blush | `#D9B8AE` | Bearish candles, losses, highlights |
| Rule | `rgba(196,165,116,0.25)` | Hairlines |

Rules:

- **Gold text:** used on ink or panel only, never on ivory, because the contrast is too low. On ivory, gold is used only for rules and borders.
- **Shape and spacing:** thin rules, 20 to 24px corner radius, generous padding and quiet shadows on ivory.
- **Motion:** restrained motion of 200 to 300ms ease-out, using CSS animations so content never depends on JavaScript timing, and respecting reduced-motion settings.
- **Charts:** dark chart stage, sage and blush candles, gold for zones and levels, and volume bars in muted tones under the candles.
- **Removed:** the botanical art and garden visuals. The Bloom mark is redrawn as a fine-line geometric bloom.

## 5. Navigation

Unchanged in structure:

- **Five tabs:** Home, Lessons, Practice, Leaderboard, Pansy.
- **Header:** Brokers link and profile avatar.
- **Desktop:** top navigation.

Only the styling changes.

## 6. Sections

### Home

- **Signed out:** headline "Learn to read stocks with skill. Free." followed by one "Start free" action, a preview of the "find the FVG" exercise and a risk note.
- **Signed in:** a "Continue your lesson" card, progress through the modules, and your leaderboard position with the gap to the next place.

### Lessons

**Chart stage.** A new shared chart component, built in SVG, used by both lessons and Practice. It has:

- a candle pane and a volume pane
- a timeframe switcher for the timeframes a lesson provides, such as Daily, 1H and 5m
- overlays for zones and price levels
- touch-first interactions:
  - **tap candles:** select one or more, for example the three candles of an FVG
  - **mark zone:** drag top and bottom handles to cover a price range
  - **place levels:** drag entry, stop and target lines, with live risk-to-reward and position size

**New lesson blocks**, added to the existing text, Pansy, quiz, scenario, order and slider blocks:

| Block | What she does | How it's checked |
|---|---|---|
| `chartFind` | Tap the candles that form a pattern | Against the indexes the pattern builder produced |
| `chartZone` | Drag a zone over a gap, order block or supply area | Within a tolerance of the true zone |
| `chartVolume` | Choose whether volume confirms the move | Against the volume series |
| `chartTimeframe` | Switch timeframe and answer a bias or entry question | Against the expected timeframe and answer |
| `chartPlan` | Place entry, stop and target | Stop beyond the invalidation level, risk-to-reward of at least 1.5, entry inside the zone |

**Pattern builders** (`src/lib/charts/patterns.ts`) generate repeatable made-up candles for each setup. Matching detectors (`findFVGs`, `findSwings`, `detectBOS` and others) check the lesson data in tests and grade answers in the app.

**Curriculum**, in sequence. There are about 26 lessons, each taking 4 to 7 minutes.

1. **Foundations:** reading a stock chart, candles, volume, timeframes and multi-timeframe analysis.
2. **Structure:** trend and swings, break of structure, change of character, support and resistance.
3. **Liquidity:** where liquidity rests, liquidity sweeps, premium and discount, supply and demand.
4. **Imbalances:** Fair Value Gaps (bullish and bearish, the three-candle rule, consequent encroachment, when a gap matters), inverse FVGs, displacement.
5. **Institutional zones:** order blocks, breaker blocks, optimal trade entry (OTE).
6. **Models and timing:** Power of 3, the Silver Bullet window (New York time), candle range theory, breakouts and retests.
7. **Execution and risk:** the full checklist from higher-timeframe bias down to entry, stop and target, plus position sizing, when to skip, journaling the analysis, and applying it to liquid US stocks and ETFs.

**Setup lesson template.** Every setup lesson in modules 2 to 6 follows these steps in order:

1. Spot it (`chartFind` or `chartZone`)
2. Context (a scenario, or premium and discount)
3. Volume (`chartVolume`)
4. Timeframes (`chartTimeframe`)
5. Plan (`chartPlan`)
6. Practice hint

**Endings and progress.** The lesson ending keeps the next lesson, "Practise this" and leaderboard position. The broker card appears only at module ends, with the US rules. Progress keeps using `lesson_progress` through `/api/lessons/complete`, and the gold lessons completed this week still count towards points.

### Practice

**Instruments:**

- SPY, QQQ, IWM, DIA, AAPL, MSFT, NVDA, AMZN, GOOGL, META, TSLA, AMD, JPM, KO, DIS
- whole shares, no leverage, so margin equals full cost
- prices from Finnhub, which is already used for stock quotes
- charts from FMP: daily, 1-hour and 5-minute candles with volume

**Hours.** US stock hours of 9:30am to 4pm New York time. There's a kind "resting" message outside them, and new trades wait until the market opens.

**Trade plan.** A trade needs:

- a setup type (from the curriculum list)
- the timeframe she used
- a stop

A target is optional but encouraged. Entry, stop and target can be set by dragging lines on the chart.

**Process score.** Each closed trade gets a process score out of 100:

| Points | Condition |
|---|---|
| 25 | Had a stop |
| 25 | Planned risk-to-reward of 1.5 or more |
| 25 | Risked 1% or less of the balance |
| 25 | Journal note added |

It appears on the trade, on Profile, and as an average on the leaderboard.

**Kept from this week:** server fills, atomic cash changes, risk cap, Start again, auto-close while the page is open, and the journal.

**Data changes.** A new additive migration adds `setup_type`, `timeframe` and `risk_pct` to `practice_trades`.

### Leaderboard

- **Tabs:** Learning (points) and Practice gains (closed stock trades), with your rank and the gap to the next place.
- **Practice gains rows:** each row shows P&L and the average process score.
- **Tone:** framed as progress and community, with premium styling.
- **Privacy:** unchanged. First name or chosen name only, and a hide option.

### Ask Pansy

The persona is updated to cover stocks, FVGs and price-action concepts, lessons, brokers and the learning path.

Pansy explains every setup in general, using made-up examples labelled as such. Pansy never:

- marks up or predicts a real ticker
- gives entries, stops or targets for a real trade
- says to buy or sell

The output filter stays, and stock tickers are tested, for example "Buy AAPL now".

### Brokers

- **Outside the US:**
  - **Listed:** every current broker (XM, IC Markets, Exness, Vantage, AvaTrade, Deriv), plus TradingView for charting.
  - **Copy:** describes what each offers for stocks, with each broker's own CFD risk warning, commission disclosure and "availability depends on your country".
  - **IC Markets:** stays information-only until the link arrives.
- **US:** Webull for real shares, and TradingView.
- **Country unknown:** information only, with no buttons, which is the current behaviour.

### Profile

Covers lesson progress by module, a practice summary including average process score, the leaderboard toggle, name and account.

## 7. Retired or replaced

- **Lessons:** the gold lessons (`src/data/lessons-v2`) are replaced by `src/data/lessons-stocks`. Old lesson URLs redirect to `/lessons`.
- **Visuals:** the botanical art, the garden visual and the soft theme are removed.
- **Practice:** gold, silver, forex and index instruments leave the picker but stay configured so old positions can close.
- **Copy:** gold and CFD copy is removed from Home, About, lessons, Pansy, the store listing and SEO.

## 8. Tone and compliance

- **Voice:** precise, calm and respectful. No hype, urgency or income claims. Every term is explained at first use.
- **Positioning:** setups are taught as ways to read a chart and plan risk, never as predictions. Every setup lesson includes a "when to skip it" point.
- **Risk notes:** shown in the footer, on Practice, in risk lessons and on Brokers. Bloom is education only and not financial advice. Trading stocks involves risk of loss, and practice results use simulated money.
- **Brokers page:** keeps a CFD-specific risk warning beside each CFD broker.
- **Legal pages:** terms and disclaimer are updated for stocks, and the updated wording needs Roy's approval.

## 9. Mobile

- **Theme colours:** dark theme colour `#0C0D0B` in the manifest, Capacitor and the TWA config.
- **Service worker:** cache version bumped.
- **Native builds:** still need a rebuild for the splash and background.

## 10. Delivery

Work happens on a new branch, `redesign/premium-stocks`, cut from `main`. The live site stays on the gold version until Roy approves a preview and the merge.

| Stage | Contents | Done when |
|---|---|---|
| 1. Look | Tokens, fonts, shell, Bloom mark, copy sweep update | Every existing page renders in the new theme at 375px |
| 2. Chart stage | SVG chart with volume, timeframes and interactions, pattern builders and detectors | Builder and detector tests pass, and the interactions work on touch |
| 3. Lesson blocks | `chartFind`, `chartZone`, `chartVolume`, `chartTimeframe`, `chartPlan` | Grading tests pass |
| 4. Curriculum | Seven modules, with first-lesson routing updated | Data tests show every setup lesson follows the template |
| 5. Practice | Stock instruments, stock hours, trade plan, chart tools, process score, migration | A stock trade opens, closes, scores and ranks |
| 6. Pansy, Brokers, Profile, legal, Home | Persona, regional broker logic, copy | Copy sweep passes and trade-call prompts are declined |
| 7. Review | Whole-branch review, fixes, browser checks | Review findings are fixed and the success criteria are checked |

## 11. Testing

- **Unit tests:**
  - pattern builders and detectors, checking each builder produces the pattern its detector finds
  - grading for every chart block
  - process score
  - stock market hours
  - instrument handling for legacy positions
  - leaderboard stock-only filtering
- **Data tests:** every setup lesson follows the template, and no lesson copy mentions gold, forex or CFDs.
- **Existing suite:** must stay green.
- **Checks:** browser checks at 375px and desktop, plus lint and build at each stage.

## 12. Not in this project

- Live chart drawing that persists between visits.
- Real brokerage connections.
- Alerts or scanners.
- KRM.
- New languages.
