import { breakoutRetest, candleRange, powerOf3, silverBullet } from "@/lib/charts/patterns";
import { beyond, bias, find, plan, scenario, setupLesson, volume, example } from "./template";
import type { RawLesson } from "./types";

const amd = powerOf3(3);
const amdRangeLow = Math.min(...amd.candles.slice(0, 10).map((c) => c.low));
const amdManipulation = amd.candles[amd.answer.manipulationIndex];
const window = silverBullet(2);
const crt = candleRange(5);
const crtRange = crt.candles[crt.answer.rangeIndex];
const crtSweep = crt.candles[crt.answer.sweepIndex];
const breakout = breakoutRetest(6);
const retest = breakout.candles[breakout.answer.retestIndex];

export const M6_MODELS: RawLesson[] = [
  setupLesson({
    slug: "power-of-three",
    moduleId: "models",
    title: "Power of 3",
    subtitle: "Accumulation, manipulation and distribution.",
    minutes: 6,
    intro: [
      "Power of 3 describes a common rhythm in a session. First comes accumulation: a quiet range. Then manipulation: a false move out of the range, often a sweep. Then distribution: the real move in the opposite direction.\n\nFor a bullish day, that often looks like a quiet open, a dip below the range, then a strong rally above it.",
    ],
    spot: find(amd, "Tap the manipulation candle: the false move below the quiet range.", [amd.answer.manipulationIndex], "Yes. It dips below the range to trap sellers before the real move up."),
    context: scenario(
      "The dip below the range swept the lows of the opening range, then reversed. What does that suggest?",
      ["The real move may be up.", "Exactly. A false move down that takes liquidity often comes before the true move up."],
      ["Price will keep falling.", "In Power of 3, the first move out of the range is often the false one."],
    ),
    volume: volume(
      amd,
      amd.answer.distributionStart,
      "Did the move that broke above the range come with strong volume?",
      "Yes. Strong volume on the real move is what you want to see in the distribution phase.",
      "Not really. A weak breakout above the range is less convincing.",
    ),
    timeframe: bias(
      amd,
      "Check the 1H before planning a buy.",
      "Rising. A bullish Power of 3 day inside a rising 1H is the cleaner pattern.",
      "Falling. A bullish rhythm against a falling 1H calls for caution.",
    ),
    plan: plan(
      amd,
      "long",
      { top: amdRangeLow, bottom: amdManipulation.low },
      beyond(amdManipulation.low, "below"),
      "Plan a buy during the manipulation, between the range low and the false move's low.",
      "Well planned. If price keeps falling below the false move, it wasn't manipulation after all.",
    ),
    skip: "Skip it when the range is wide and messy instead of quiet, or when the false move keeps going with heavy volume. Skip it too on days with major news, when the usual rhythm often breaks down.",
    practiceHint: "In Practice, watch the first hour of SPY on the 5m chart for a quiet range and a false move.",
    example: example(powerOf3(7), { kind: "candles", indexes: [powerOf3(7).answer.manipulationIndex] }, "Here the manipulation candle is marked: the false move below the quiet range before the real move up."),
    practice: { setup: "Power of 3", timeframe: "Daily" },
  }),
  setupLesson({
    slug: "silver-bullet",
    moduleId: "models",
    title: "The Silver Bullet",
    subtitle: "A gap that forms between 10am and 11am New York time.",
    minutes: 6,
    intro: [
      "The Silver Bullet is a timing model. It looks for a fair value gap that forms between 10:00 and 11:00am New York time, after the opening rush has settled.\n\nThe idea is that this hour often brings a clean move towards nearby liquidity. You look for the gap inside the window, in the direction of the bias, then plan an entry back into it.",
    ],
    spot: find(window, "Find the gap that forms inside the 10am to 11am window. Tap its three candles.", window.answer.fvg.indexes, "Yes. It forms just after 10:15am New York time, inside the Silver Bullet window.", [
      { fromIndex: window.candles.findIndex((c) => c.time === window.answer.windowStart), toIndex: window.candles.findIndex((c) => c.time === window.answer.windowEnd), label: "10:00 to 11:00 New York" },
    ]),
    context: scenario(
      "A gap forms at 9:40am, before the window opens. Does it count as a Silver Bullet?",
      ["No. The model only uses gaps formed from 10am to 11am.", "Right. Timing is the whole point of this model, so a gap outside the window doesn't count."],
      ["Yes. Any gap in the morning counts.", "The Silver Bullet is specifically the 10am to 11am window in New York time."],
    ),
    volume: volume(
      window,
      window.answer.fvg.indexes[1],
      "Was the candle that created the gap backed by strong volume?",
      "Yes. Real participation behind the gap makes it more meaningful.",
      "Not really. A low-volume gap is weaker.",
    ),
    timeframe: bias(
      window,
      "Check the 1H before planning a buy.",
      "Rising. A bullish Silver Bullet in a rising 1H is the one to practise.",
      "Falling. A bullish gap against a falling 1H calls for caution.",
    ),
    plan: plan(
      window,
      "long",
      window.answer.fvg.zone,
      beyond(window.candles[window.answer.fvg.indexes[0]].low, "below"),
      "Plan a buy back into the gap, with your stop below the first candle of the pattern.",
      "Well planned. Your risk is small and defined, which is the point of a precise timing model.",
    ),
    skip: "Skip it on days with major news inside the window, or when the gap goes against the higher timeframe. Skip it too if the window passes without a clean gap. There's always another day.",
    practiceHint: "In Practice, open QQQ on the 5m chart between 10am and 11am New York time and look for a gap.",
    example: example(silverBullet(4), { kind: "zone", zone: silverBullet(4).answer.fvg.zone }, "Here the gap that formed inside the 10am to 11am window is shaded."),
    practice: { setup: "Silver Bullet", timeframe: "5m" },
  }),
  setupLesson({
    slug: "candle-range-theory",
    moduleId: "models",
    title: "Candle range theory (CRT)",
    subtitle: "When one candle's range becomes the map.",
    minutes: 5,
    intro: [
      "Candle range theory, or CRT, treats one significant candle's high and low as a range. When the next candle sweeps one side of that range and closes back inside it, price often travels towards the other side.\n\nFor a bullish CRT, the next candle dips below the range candle's low, closes back inside, and the range high becomes the target.",
    ],
    spot: find(crt, "Tap the candle that sweeps below the range candle's low and closes back inside.", [crt.answer.sweepIndex], "Yes. It takes out the low, then closes back within the range."),
    context: scenario(
      "After the sweep, where does CRT point for a target?",
      ["Towards the range candle's high.", "Exactly. After one side of the range is swept, the other side becomes the natural target."],
      ["Further below the sweep.", "In CRT, a sweep that closes back inside the range points the other way."],
    ),
    volume: volume(
      crt,
      crt.answer.sweepIndex,
      "Was the sweep candle backed by strong volume?",
      "Yes. Strong volume on the sweep suggests stops were taken and absorbed.",
      "Not really. A quiet sweep is less convincing.",
    ),
    timeframe: bias(
      crt,
      "Check the 1H before planning a buy.",
      "Rising. A bullish CRT within a rising 1H is the one to practise.",
      "Falling. A bullish CRT against a falling 1H calls for caution.",
    ),
    plan: plan(
      crt,
      "long",
      { top: crtRange.low, bottom: crtSweep.low },
      beyond(crtSweep.low, "below"),
      "Plan a buy between the range low and the sweep low, with your stop below the sweep.",
      "Well planned. The range high gives you a natural target well beyond your risk.",
    ),
    skip: "Skip it when the sweep candle closes outside the range, because that's a breakout rather than a sweep. Skip it too if the range candle is tiny compared with recent candles.",
    practiceHint: "In Practice, pick a large 1H candle on AAPL and watch how the next candles treat its high and low.",
    example: example(candleRange(8), { kind: "candles", indexes: [candleRange(8).answer.sweepIndex] }, "Here the sweep candle is marked: it takes out the range candle's low, then closes back inside."),
    practice: { setup: "CRT", timeframe: "1H" },
  }),
  setupLesson({
    slug: "breakout-and-retest",
    moduleId: "models",
    title: "Breakout and retest",
    subtitle: "Waiting for the broken level to hold.",
    minutes: 5,
    intro: [
      "A breakout happens when price closes beyond a level it has struggled with. Rather than chasing the breakout, many traders wait for a retest: price comes back to the old level and holds it from the other side.\n\nOld resistance becoming new support is one of the oldest ideas in chart reading.",
    ],
    spot: find(breakout, "Tap the breakout candle: the first close above resistance.", [breakout.answer.breakIndex], "Yes. Its body closes clearly above the level that had capped price."),
    context: scenario(
      "After the breakout, price drifts back to the old resistance and holds above it. What does that suggest?",
      ["Old resistance may now be acting as support.", "Exactly. A held retest is what many traders wait for before buying."],
      ["The breakout has definitely failed.", "Coming back to the level is normal. What matters is whether it holds."],
    ),
    volume: volume(
      breakout,
      breakout.answer.breakIndex,
      "Was the breakout candle backed by strong volume?",
      "Yes. Strong volume on a breakout makes it far more trustworthy.",
      "Not really. Low-volume breakouts fail more often.",
    ),
    timeframe: bias(
      breakout,
      "Check the 1H before planning a buy on the retest.",
      "Rising. A breakout in the direction of the 1H is the cleaner one.",
      "Falling. A breakout against a falling 1H calls for caution.",
    ),
    plan: plan(
      breakout,
      "long",
      { top: Math.round(breakout.answer.level * 1.002 * 100) / 100, bottom: retest.low },
      beyond(retest.low, "below", 0.003),
      "Plan a buy on the retest, with your stop below the retest's low.",
      "Well planned. If price falls back below the old level, the breakout has failed and your stop limits the loss.",
    ),
    skip: "Skip breakouts on thin volume, or ones that come back and close well below the level. Skip it too if the breakout candle is so large that your stop would have to be very far away.",
    practiceHint: "In Practice, find a recent breakout on the IWM daily chart and plan the retest on the 5m.",
    example: example(breakoutRetest(9), { kind: "candles", indexes: [breakoutRetest(9).answer.breakIndex] }, "Here the breakout candle is marked: the first close above resistance."),
    practice: { setup: "Breakout", timeframe: "1H" },
  }),
];
