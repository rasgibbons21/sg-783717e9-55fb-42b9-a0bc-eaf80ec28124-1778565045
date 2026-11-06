import { breakerBlock, orderBlock, ote } from "@/lib/charts/patterns";
import { beyond, bias, find, plan, scenario, setupLesson, volume, zone } from "./template";
import type { Lesson } from "./types";

const block = orderBlock(8, "bullish");
const breaker = breakerBlock(4);
const retrace = ote(6);

export const M5_INSTITUTIONAL: Lesson[] = [
  setupLesson({
    slug: "order-blocks",
    moduleId: "institutional",
    title: "Order blocks",
    subtitle: "The last opposite candle before a powerful move.",
    minutes: 6,
    intro: [
      "A bullish order block is the last down candle before a strong move up that breaks structure. A bearish order block is the last up candle before a strong move down.\n\nThe idea is that large orders were placed in that candle. When price returns to it, traders watch for those orders to defend the level again. The whole candle, from its high to its low, is usually treated as the zone.",
    ],
    spot: find(block, "Tap the bullish order block: the last down candle before the strong move up.", [block.answer.obIndex], "Yes. It's the final down candle right before the displacement that broke structure."),
    context: scenario(
      "The order block sits in the lower half of the swing, and the move away from it broke structure. Is it a good one to practise?",
      ["Yes. It's in discount and it caused a real break.", "Exactly. An order block that broke structure, sitting in discount, is the kind worth practising."],
      ["No. Order blocks only work at the highs.", "Bullish order blocks are most useful in discount, below the middle of the swing."],
    ),
    volume: volume(
      block,
      block.answer.displacementIndex,
      "Was the move away from the order block backed by strong volume?",
      "Yes. A high-volume move away is what gives the order block its meaning.",
      "Not really. A weak move away makes the order block less important.",
    ),
    timeframe: bias(
      block,
      "Check the 1H before planning from the order block.",
      "Rising. A bullish order block that agrees with the 1H is the one to practise.",
      "Falling. A bullish order block against a falling 1H calls for caution.",
    ),
    plan: plan(
      block,
      "long",
      block.answer.zone,
      beyond(block.answer.zone.bottom, "below"),
      "Price is back at the order block. Plan a buy from it, with your stop below the block's low.",
      "Well planned. If price closes below the block, the orders defending it are gone and the idea is wrong.",
    ),
    skip: "Skip an order block that didn't lead to a break of structure, or one in premium when you're looking to buy. Skip it too when price has already returned to it several times.",
    practiceHint: "In Practice, find a bullish order block on the GOOGL 5m chart and plan the retest.",
  }),
  setupLesson({
    slug: "breaker-blocks",
    moduleId: "institutional",
    title: "Breaker blocks",
    subtitle: "A failed order block that switches sides.",
    minutes: 6,
    intro: [
      "A breaker block is an order block that failed. It often follows a liquidity sweep.\n\nFor a bullish breaker, price first sweeps below a low, then rallies and closes back above the last up candle before that drop. The old zone, which should have pushed price down, now acts as support.",
    ],
    spot: zone(breaker, "Mark the breaker block: the up candle that price later broke back above.", breaker.answer.zone, "Yes. That candle failed to hold price down, and now it can support it instead."),
    context: scenario(
      "Before price broke above the zone, it swept below an earlier low. Why does that matter?",
      ["The sweep took out sellers' fuel before the reversal.", "Exactly. A sweep followed by a break back through the zone is what makes a breaker convincing."],
      ["It doesn't matter at all.", "The sweep is a key part of the story. Without it, the pattern is much less reliable."],
    ),
    volume: volume(
      breaker,
      breaker.answer.brokenIndex,
      "Was the candle that broke back above the zone backed by strong volume?",
      "Yes. A strong, high-volume break confirms the zone has flipped.",
      "Not really. A weak break makes the flip less convincing.",
    ),
    timeframe: bias(
      breaker,
      "Check the 1H before planning a buy from the breaker.",
      "Rising. A bullish breaker that agrees with the 1H is the one to practise.",
      "Falling. A bullish breaker against a falling 1H calls for caution.",
    ),
    plan: plan(
      breaker,
      "long",
      breaker.answer.zone,
      beyond(breaker.answer.zone.bottom, "below", 0.004),
      "Price is retesting the breaker from above. Plan a buy, with your stop below the zone.",
      "Well planned. If price falls back below the zone, the breaker has failed.",
    ),
    skip: "Skip a breaker without a clear sweep first, or one where the break back through the zone was weak. Skip it too if the retest comes with heavy selling volume.",
    practiceHint: "In Practice, look for a sweep followed by a breaker on the META 5m chart.",
  }),
  setupLesson({
    slug: "optimal-trade-entry",
    moduleId: "institutional",
    title: "Optimal trade entry (OTE)",
    subtitle: "Buying the deeper pullback, between 62% and 79%.",
    minutes: 6,
    intro: [
      "Optimal trade entry, or OTE, is a pullback zone measured on a swing. Measure from the swing low to the swing high, then mark the area between 62% and 79% of the way back down.\n\nIt sits deep in discount, so a buy there usually comes with a closer stop and more room to the target. Many traders combine it with a gap or an order block inside the same area.",
    ],
    spot: zone(retrace, "Mark the OTE zone: between 62% and 79% of the way back down the swing.", retrace.answer.zone, "Yes. That band, deep in the pullback, is the optimal trade entry zone."),
    context: scenario(
      "Price pulls back into the OTE zone, and there's also an order block inside it. Is that helpful?",
      ["Yes. Two reasons in the same place make it stronger.", "Exactly. When several tools point to the same area, the level tends to be more meaningful."],
      ["No. You should only ever use one tool.", "Tools that agree with each other strengthen a level rather than confuse it."],
    ),
    volume: volume(
      retrace,
      13,
      "Look at the push up into the swing high. Was it backed by strong volume?",
      "Yes. A strong, high-volume swing makes its pullback zone more meaningful.",
      "Not especially. A swing on ordinary volume is a weaker base for the OTE.",
    ),
    timeframe: bias(
      retrace,
      "Check the 1H before planning a buy in the OTE.",
      "Rising. Buying a deep pullback within a rising 1H is the cleaner idea.",
      "Falling. Buying a pullback against a falling 1H calls for caution.",
    ),
    plan: plan(
      retrace,
      "long",
      retrace.answer.zone,
      beyond(retrace.answer.swingLow, "below"),
      "Price has reached the OTE zone. Plan a buy, with your stop below the swing low.",
      "Well planned. If price breaks below the swing low, the whole swing has failed and so has the idea.",
    ),
    skip: "Skip an OTE on a weak or choppy swing, or one that goes against the higher timeframe. Skip it too if price slices through the zone without slowing.",
    practiceHint: "In Practice, measure the latest swing on the DIS 1H chart and mark its OTE zone.",
  }),
];
