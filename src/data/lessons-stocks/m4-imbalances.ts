import { consequentEncroachment } from "@/lib/charts/detectors";
import { bullishFVG, inverseFVG } from "@/lib/charts/patterns";
import { beyond, bias, find, plan, scenario, setupLesson, text, volume, zone, example } from "./template";
import type { RawLesson } from "./types";

const gap = bullishFVG(11);
const gapZone = gap.answer.fvg.zone;
const ceChart = bullishFVG(13);
const ceZone = ceChart.answer.fvg.zone;
const ce = consequentEncroachment(ceZone);
const money = (value: number) => `$${value.toFixed(2)}`;
const inverse = inverseFVG(7);
const displacementChart = bullishFVG(15);

export const M4_IMBALANCES: RawLesson[] = [
  setupLesson({
    slug: "fair-value-gaps",
    moduleId: "imbalances",
    title: "Fair value gaps (FVG)",
    subtitle: "The three-candle imbalance, and when it matters.",
    minutes: 7,
    intro: [
      "A fair value gap, or FVG, is a three-candle pattern where price moved so fast that it left a gap in trading.\n\nIn a bullish FVG, the low of the third candle sits above the high of the first candle. The space between them, which the middle candle raced through, is the gap. A bearish FVG is the mirror image: the third candle's high sits below the first candle's low.",
      "Gaps like this show one side was overwhelmingly in control. Price often comes back to them later, and traders watch for a reaction there. A gap matters most when it's created by a strong, high-volume candle, in the direction of the bigger trend, after liquidity has been taken.",
    ],
    pansyNote: "Look at the wicks, not the bodies. The gap is the space between the first candle's wick and the third candle's wick.",
    spot: find(gap, "Find the fair value gap. Tap its three candles.", gap.answer.fvg.indexes, "Exactly. The third candle's low never comes down to the first candle's high, so a gap is left between them."),
    context: scenario(
      "The gap formed in the lower half of the day's range, right after price swept an earlier low. Does that context help?",
      ["Yes. A sweep followed by a gap in discount is a strong combination.", "Exactly. When liquidity is taken first and the gap forms in discount, the setup is far more meaningful."],
      ["No. Context doesn't matter, only the gap.", "Gaps appear all the time. Context is what separates the meaningful ones from the noise."],
    ),
    volume: volume(
      gap,
      gap.answer.fvg.indexes[1],
      "Was the middle candle, the one that created the gap, backed by strong volume?",
      "Yes. Heavy volume on the gap candle means real buying created it, which makes it more likely to matter.",
      "Not really. A gap on ordinary volume is weaker.",
    ),
    timeframe: bias(
      gap,
      "Check the 1H before you plan.",
      "Rising. A bullish gap that agrees with the 1H is the one to practise.",
      "Falling. A bullish gap against a falling 1H calls for extra caution.",
    ),
    plan: plan(
      gap,
      "long",
      gapZone,
      beyond(gap.candles[gap.answer.fvg.indexes[0]].low, "below"),
      "Price has come back into the gap. Plan a buy from inside it, with your stop below the first candle of the pattern.",
      "Well planned. Entering inside the gap with a stop below its first candle keeps your risk defined and small.",
    ),
    skip: "Skip a gap that's tiny compared with the candles around it, one created on light volume, or one that goes against the higher timeframe. Skip it too if price has already traded back through the whole gap, because it has been filled.",
    practiceHint: "In Practice, find a bullish fair value gap on the NVDA 5m chart and plan a buy from inside it.",
    example: example(bullishFVG(17), { kind: "zone", zone: bullishFVG(17).answer.fvg.zone }, "Here the fair value gap is shaded: the space between the first candle's high and the third candle's low."),
    practice: { setup: "FVG", timeframe: "5m" },
  }),
  {
    slug: "consequent-encroachment",
    moduleId: "imbalances",
    title: "Consequent encroachment",
    subtitle: "The midpoint of a gap, and why traders watch it.",
    minutes: 4,
    kind: "concept",
    practiceHint: "In Practice, mark a gap on the AMD 5m chart and work out its midpoint.",
    blocks: [
      text(
        "Consequent encroachment, often shortened to CE, is simply the halfway point of a fair value gap.\n\nPrice often reacts at the CE rather than filling the whole gap. Some traders use it as their entry, and treat a close beyond it as a sign the gap is weakening.",
      ),
      zone(ceChart, "First, mark the whole gap on this chart.", ceZone, "Good. Now picture the line halfway between its top and bottom. That's the CE."),
      {
        type: "quiz",
        q: `This gap runs from ${money(ceZone.bottom)} to ${money(ceZone.top)}. Where is its consequent encroachment?`,
        options: [money(ceZone.bottom), money(ce), money(ceZone.top)],
        correct: 1,
        explanation: `Yes. Halfway between ${money(ceZone.bottom)} and ${money(ceZone.top)} is ${money(ce)}.`,
      },
    ],
  },
  setupLesson({
    slug: "inverse-fvg",
    moduleId: "imbalances",
    title: "Inverse fair value gaps (IFVG)",
    subtitle: "When a gap fails and flips sides.",
    minutes: 6,
    intro: [
      "An inverse fair value gap, or IFVG, is a gap that price closes straight through instead of respecting.\n\nWhen a bearish gap is broken by a strong close above it, it often flips roles. What used to push price down can start supporting it on the way back. The same works in reverse for a bullish gap broken to the downside.",
    ],
    spot: find(inverse, "Find the bearish gap that later fails. Tap its three candles.", inverse.answer.fvg.indexes, "Yes. This gap pointed down at first, but price later closed right through it."),
    context: scenario(
      "Price closes strongly above the bearish gap, then drifts back into it. What might you expect?",
      ["The old gap may now act as support.", "Exactly. That's the inversion: the failed gap flips from resistance to support."],
      ["Price must fall, because the gap was bearish.", "Once price has closed through a gap, its original meaning no longer holds."],
    ),
    volume: volume(
      inverse,
      inverse.answer.flipIndex,
      "Did the candle that closed through the gap come with strong volume?",
      "Yes. A powerful, high-volume close through the gap makes the inversion more convincing.",
      "Not really. A weak close through the gap is less convincing.",
    ),
    timeframe: bias(
      inverse,
      "Check the 1H before planning a buy from the flipped gap.",
      "Rising. The inversion agrees with the 1H, which supports a buy.",
      "Falling. An inversion against a falling 1H deserves caution.",
    ),
    plan: plan(
      inverse,
      "long",
      inverse.answer.fvg.zone,
      beyond(inverse.answer.fvg.zone.bottom, "below", 0.004),
      "Plan a buy as price returns to the flipped gap, with your stop below it.",
      "Well planned. If price falls back through the gap, the inversion has failed and your stop takes you out.",
    ),
    skip: "Skip an inversion where the close through the gap was weak or on light volume. Skip it too when price returns to the gap with heavy selling, which suggests it won't hold.",
    practiceHint: "In Practice, watch the SPY 5m chart for a gap that price closes through, then plan the retest.",
    example: example(inverseFVG(9), { kind: "zone", zone: inverseFVG(9).answer.fvg.zone }, "Here the bearish gap that later fails is shaded. Price closes right through it."),
    practice: { setup: "IFVG", timeframe: "5m" },
  }),
  {
    slug: "displacement",
    moduleId: "imbalances",
    title: "Displacement",
    subtitle: "The forceful move that leaves gaps behind.",
    minutes: 4,
    kind: "concept",
    practiceHint: "In Practice, find the largest-bodied candle on the TSLA 5m chart today and check its volume.",
    blocks: [
      text(
        "Displacement is a sudden, forceful move: one or more large-bodied candles with small wicks, usually on heavy volume.\n\nIt shows that one side has taken control. Displacement often breaks structure and leaves fair value gaps behind it, which is why so many setups begin with it.",
      ),
      find(displacementChart, "Tap the displacement candle: the large, forceful one.", [11], "Yes. A big body with little wick, moving far further than the candles around it."),
      volume(
        displacementChart,
        11,
        "Was that displacement backed by strong volume?",
        "Yes. Real displacement nearly always comes with a surge of volume.",
        "No. Without the volume, it's less likely to be true displacement.",
      ),
      {
        type: "quiz",
        q: "Which best describes displacement?",
        options: ["A slow drift with small candles", "A forceful move with large bodies, small wicks and heavy volume", "Any candle that closes higher"],
        correct: 1,
        explanation: "Exactly. Size, force and volume together are what make it displacement.",
      },
    ],
  },
];
