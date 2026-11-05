# Bloom redesign: free, feminine, gold-first education

Date: 2026-11-05
Status: awaiting review

## 1. Outcome

Bloom becomes a warm, feminine, completely free place for women to learn gold and other instruments from zero.

The core loop:

**Sign up free → first interactive gold lesson → progress and blooms → practise it safely → climb the leaderboards → open a free broker demo when ready.**

Nothing in the product should feel like signals, scanners, pro tools or a trading desk.

### Success criteria

- A new visitor reaches the first interactive lesson within about a minute of arriving, with no payment step.
- Every lesson has at least one interaction beyond reading.
- A member can place a paper trade on XAUUSD and see the closed result on the leaderboard.
- No screen in the app mentions signals, scanners, Pro, upgrades or trials, apart from the legal history in the refund policy.
- Pansy explains concepts and declines to give trade calls.
- All screens work at phone width in the new light theme.

## 2. Decisions already made

| Topic | Decision |
|---|---|
| Audience | Global. US visitors get a clear notice and can still use lessons, practice and Pansy. No separate US broker path. |
| Pricing | 100% free. All Pro checks and upgrade prompts go. |
| Existing subscriber | There is one. Roy cancels it in Stripe or Google Play and handles any refund. Billing code is removed after that is confirmed. |
| Revenue | Broker affiliate links, with commission disclosure. |
| After lessons | Every lesson ends by pointing gently towards brokers. |
| Motivation | Two leaderboards: learning progress and paper-trading P&L. |
| Pansy's name | Never renamed. Only the description and voice change. |
| Finishing polish | MotionSites free plan (2 prompt opens left), saved for the final stage. |

## 3. Decisions made by default (say if you disagree)

- **Ads:** AdMob banners are removed, to keep Bloom calm and because affiliate links are now the revenue model.
- **Referrals:** the reward was bonus trial days, which no longer mean anything, so the referral feature is retired.
- **Gold prices:** Financial Modeling Prep (FMP) first, since Bloom already holds a key and uses it for chart data. Stage 4 begins by confirming the current plan returns XAUUSD, forex and index quotes. If it does not, stage 4 pauses for a decision on a paid or alternative feed.
- **Illustrations:** botanical art and the Pansy mark are built as SVG. Illustrations of women learning are generated in stage 6, only after Roy approves any image-tool cost.
- **Dark mode:** removed. Bloom is light only.

## 4. Visual system

Colour tokens replace the existing dark values in `src/styles/globals.css`, so retained screens change at once. Hardcoded colours in retained pages are then replaced with tokens.

| Token | Value | Use |
|---|---|---|
| Paper | `#FBF8F2` | Page background |
| Warm paper | `#F6F1E8` | Section bands |
| Cream card | `#FFFDF8` | Cards |
| Ink | `#2A241C` | Text |
| Stone | `#6F6860` | Secondary text |
| Sage | `#3F4F3E` | Primary buttons, active states |
| Bloom teal | `#27B7C8` | Small decorative accents only, never body text, because contrast on ivory is too low |
| Blush | `#EFD9D3` | Highlights, completion states |
| Clay | `#B98A72` | Illustration, secondary accents |
| Soft gold | `#C2A15A` | Gold motifs, blooms |

- **Type:** Fraunces for headings and DM Sans for body text. Body text is at least 16px on mobile.
- **Shape:** large rounded corners, soft low-contrast shadows and generous spacing.
- **Motion:** gentle press feedback and haptic on bloom moments, respecting reduced-motion settings.
- **Gains and losses:** muted sage and muted clay rather than trading green and red.
- **Charts:** only inside lessons and Practice.

## 5. Navigation

- **Mobile tab bar (5):** Home, Lessons, Practice, Leaderboard, Pansy.
- **Header:** Bloom mark, Brokers link and profile avatar.
- **Desktop:** the same seven destinations in a top navigation.
- **Removed:** search pill, stock watchlist bookmark and floating Pansy dock.

`AppShell.tsx` is rebuilt and becomes the only shell. `Layout.tsx` usages in retained pages move onto it.

## 6. Sections

### Home (`/`, and `/home` when signed in)

- **Signed out:** hero headed "Learn gold & markets from zero. Free.", with Pansy, a single "Start free" action, a preview of the first lesson and a risk note.
- **Signed in:** "Continue your lesson" card, bloom garden progress, leaderboard position and the gap to the next place.

### Sign-up

The current 12-step onboarding quiz is replaced by a single screen: name, email and password. Success goes straight to `/lessons/what-is-gold-trading`. If email confirmation is on, the confirmation callback lands in the same lesson.

### Lessons (`/lessons`, `/lessons/[slug]`)

A new block-based format in `src/data/lessons-v2/`, rendered by one `LessonPlayer` component:

| Block | Interaction |
|---|---|
| `text` | Short plain-English passage |
| `pansy` | A note from Pansy |
| `chartTap` | Tap the right part of a simple chart |
| `quiz` | Multiple choice with kind explanations |
| `order` | Drag the steps into order, with tap-based reordering as the accessible alternative |
| `scenario` | Choose what to do and see what happens |
| `slider` | Move a value, such as leverage, and watch the outcome change |

Chart data is static and labelled as illustrative.

Curriculum, in sequence:

1. **Gold basics:** what gold trading is (XAUUSD CFD), why gold moves, how a gold price is quoted.
2. **How it works:** lots and ounces, leverage, spreads and overnight costs.
3. **Your first chart:** reading candles, simple support and resistance, spotting a trend.
4. **Staying safe:** the 1% idea, stop losses, position sizing, common beginner mistakes.
5. **Your demo account:** what a demo is, opening one at XM or IC Markets, placing a practice order.
6. **Beyond gold:** major forex pairs, indices, silver and other metals, adapted from the existing forex lessons.

Each lesson ends with a bloom moment and two calm next steps: practise this lesson's skill, and "When you feel ready, try a free demo" linking to Brokers. Finishing a module shows a fuller broker panel.

Progress uses the existing `lesson_progress` table with `quiz_completed = true`, so gems are earned without changing `gems.ts`. Stage 3 confirms that table accepts the new lesson ids before relying on this.

### Practice (`/practice`)

Soft interface, opening with "Practise what you just learned, safely."

Instruments: XAUUSD, XAGUSD, EURUSD, GBPUSD, USDJPY, US30 and US500. Stock search is removed.

A new `src/config/instruments.ts` holds each instrument's name, lot size, leverage, decimal places and data-source symbol. Members choose lot sizes (from 0.01) while the existing `shares` column stores the resulting units, so no destructive migration is needed. For example, 0.01 lot of gold is 1 ounce.

Changes to `trades.ts`, `close.ts`, `close-half.ts`, `update.ts`, `ohlc.ts` and `serverQuote.ts`:

- Fills and charts use the instrument's data-source symbol, and only configured instruments are accepted.
- Buying-power checks use margin (notional divided by leverage).
- USDJPY P&L is converted to dollars at the exit rate.
- Mandatory stops stay in place, because they teach good habits.
- Past stock trades still count towards P&L.

`paper-trader-v2.tsx` is merged away so there is one simulator.

### Leaderboard (`/leaderboard`)

One page with two tabs, using the existing APIs:

- **Learning:** ranked by gems, shown to members as "blooms".
- **Practice gains:** ranked by total P&L from closed paper trades, clearly labelled as simulated money.

To keep people coming back: your rank is always visible, you see the gap to the next place, and sharing stays available. Home and each lesson's ending show your position.

Privacy changes:

- Display names use the chosen challenge name, or first name only. The current fallback to full name is removed.
- A new additive `profiles.show_on_leaderboard` column (default true) and a Profile toggle let members hide themselves.

### Ask Pansy (`/ask-pansy`)

The persona in `pansyPersona.ts` is rewritten as a warm companion who explains gold, instruments, brokers and the member's learning path in plain language.

Pansy does not give entries, stops, targets or buy and sell calls, and does not comment on what a particular market will do next. Asked for one, Pansy gently explains why and offers to teach the skill instead. `outputFilter.ts` backs this up, and a Pansy-specific test script checks a list of trade-call prompts.

Endpoints that exist to produce trade setups (`pansy-picks`, `analyze`, `daily-briefing` and similar) are removed. Pansy's story about Roy's late mother stays.

### Brokers (`/brokers`)

Education first: what a demo account is, what to look for, and what XM Global and IC Markets each offer for gold and other instruments, followed by other active brokers in `brokers.ts`. No urgency or hard sell. Commission disclosure stays.

- Stock-focused content moves down or is removed so the page centres on gold and CFDs.
- **IC Markets:** currently inactive with no affiliate link. It displays as information only until Roy supplies the link.
- **US notice:** country comes from Vercel's `x-vercel-ip-country` header. US visitors see a plain note that these brokers do not generally accept US residents, in place of open-account buttons, with a link back to Practice. Everyone else sees "Availability depends on your country."
- Broker facts are re-verified against each broker's site and `verifiedAt` is updated.

### Profile (`/profile`)

Lesson progress, paper-trading summary, leaderboard toggle, certificate if earned, account settings and account deletion. All subscription UI is removed.

## 7. Retired

Retired pages get permanent redirects in `next.config.mjs`, so existing links and search traffic land somewhere useful.

| Retired | Redirects to |
|---|---|
| `/scanner/*`, `/signals`, `/gap-scanner`, `/gap-and-go-scanner`, `/free-stock-screener`, `/backtest`, `/stock-alerts`, `/discover`, `/stock/*`, `/research`, `/compare`, `/earnings-calendar`, `/news`, `/market-insights/*`, `/portfolio` | `/lessons` |
| `/learn`, `/university/*`, `/forex/*`, `/academy/*`, `/progression`, `/daily-bloom` | `/lessons` |
| `/budget-tracker`, `/side-hustle`, `/goals` | `/lessons` |
| `/subscription*`, `/ebook-premium`, `/refer` | `/` |
| `/app/debug-scanner` | Removed |

Also removed:

- Both scheduled jobs in `vercel.json` (`signal-alerts`, `send-weekly-stocks`), after checking who currently receives them.
- Scanner APIs and libraries.
- `UpgradeModal`, `LockedFeatureModal`, `TrialCountdown`, `FoundersPricingModal` and similar.
- `requireProUser` becomes a login check during stage 1, then is renamed once nothing depends on the old name.

Data is not deleted. Existing tables and rows stay, and old lesson progress still counts towards gems so nobody loses their rank.

## 8. Tone and compliance

- Warm, clear and encouraging, with jargon explained immediately. No "edge", urgency or income promises.
- A risk note appears in the footer, in lessons on leverage, in Practice and on Brokers: educational only, not financial advice, and CFDs, forex and gold trading are high risk and can lose money quickly.
- Practice P&L is always labelled as simulated.
- Terms, disclaimer, refund policy, privacy, About, `PLAY_LISTING.md` and SEO metadata are updated to match the new product.

## 9. Mobile

The Capacitor and Android shells load the live site, so most changes arrive with the web deploy. These also change: `capacitor.config.ts` background, PWA manifest, theme colour, splash and offline page. Colours baked into the native apps need a new build, and store listing updates are published by Roy.

## 10. Delivery

Work happens on a branch, `redesign/feminine-gold`, because pushing `main` deploys to production. Review uses a Vercel preview. Merging and pushing to `origin` and `gitlab` happen only when Roy approves.

| Stage | Contents | Done when |
|---|---|---|
| 1. Foundation | Tokens, fonts, shell, nav, free entitlements, redirects, retired pages and jobs | Build passes and no retired feature is reachable |
| 2. Front door | Home, sign-up, `LessonPlayer`, first gold lesson | A new account reaches and finishes the first lesson |
| 3. Curriculum | All six modules, progress, broker endings | The whole path can be completed on mobile |
| 4. Practice and leaderboards | Instruments, feed check, trade logic, two-tab leaderboard, privacy changes | A gold trade opens, closes and appears on the leaderboard |
| 5. Pansy and Brokers | Persona, filter, Brokers education, US notice, disclosures | Trade-call prompts are declined and the US notice shows |
| 6. Finish | Profile, copy sweep, legal, MotionSites polish on Home, illustrations, mobile shell | Success criteria in section 1 all pass |

## 11. Testing

- `npm run lint` and `npm run build` at the end of each stage.
- Browser preview checks at phone and desktop widths for each changed flow.
- Unit tests for lot, margin and P&L calculations and for lesson scoring, adding Vitest as a dev dependency because the project has no test runner.
- A final search of `src` for signal, scanner, upgrade and Pro wording.

## 12. Not in this project

- Real trading or brokerage connections.
- A US-specific broker path.
- New languages.
- Deleting old database tables.
