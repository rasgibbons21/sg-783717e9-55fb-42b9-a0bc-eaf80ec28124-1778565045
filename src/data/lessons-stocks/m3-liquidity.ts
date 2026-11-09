import { liquiditySweep, ote, supplyDemand } from "@/lib/charts/patterns";
import { beyond, bias, find, plan, scenario, setupLesson, text, volume, zone, example } from "./template";
import type { RawLesson } from "./types";

const pools = liquiditySweep(2, "low");
const sweep = liquiditySweep(4, "low");
const sweepCandle = sweep.candles[sweep.answer.sweepIndex];
const range = ote(3);
const rangeMiddle = Math.round(((range.answer.swingLow + range.answer.swingHigh) / 2) * 100) / 100;
const demand = supplyDemand(5, "demand");

export const M3_LIQUIDITY: RawLesson[] = [
  {
    slug: "where-liquidity-rests",
    moduleId: "liquidity",
    title: "Where liquidity rests",
    subtitle: "Why obvious highs and lows attract price.",
    minutes: 4,
    kind: "concept",
    practiceHint: "In Practice, look for two equal lows on the SPY 5m chart.",
    blocks: [
      text(
        "Liquidity means resting orders: places where many traders have stops or pending orders waiting.\n\nIt tends to gather just beyond obvious levels. Below equal lows sit the stops of people who bought. Above equal highs sit the stops of people who sold. The previous day's high and low are popular too.\n\nLarge players need that liquidity to fill big orders, which is one reason price is so often drawn to these levels.",
      ),
      find(pools, "Tap the two candles that made equal lows. Stops tend to rest just below them.", [10, 13], "Yes. Two lows at almost exactly the same price form an obvious level, and obvious levels collect stops."),
      {
        type: "quiz",
        q: "Where would buyers' stops most likely be resting?",
        options: ["Just above equal highs", "Just below equal lows", "In the middle of a range"],
        correct: 1,
        explanation: "Right. People who bought near a low usually place their stop just underneath it.",
      },
    ],
  },
  setupLesson({
    slug: "liquidity-sweeps",
    moduleId: "liquidity",
    title: "Liquidity sweeps",
    subtitle: "When price takes out the stops, then turns.",
    minutes: 6,
    intro: [
      "A liquidity sweep happens when price pushes just past an obvious level, triggers the stops resting there, and then closes back on the other side.\n\nThe wick through the level shows where stops were taken. The close back inside shows the move had no follow-through. Many setups in this course start with a sweep.",
    ],
    spot: find(sweep, "Tap the candle that swept below the equal lows and closed back above them.", [sweep.answer.sweepIndex], "That's the sweep. Its wick dips under the lows, then it closes back above them."),
    context: scenario(
      "A sweep happens below the lows of the day, in the lower part of the range, while the 1H is rising. Is that a helpful context?",
      ["Yes, several things line up in favour of buyers.", "Exactly. A sweep in discount, in the direction of the bigger trend, is the kind worth practising."],
      ["No, sweeps only matter at the highs.", "Sweeps can happen at highs or lows. What matters is where they happen and whether they agree with the bigger picture."],
    ),
    volume: volume(
      sweep,
      sweep.answer.sweepIndex,
      "Did the sweep candle trade on strong volume?",
      "Yes. A surge of volume on the sweep shows the stops really were triggered and absorbed.",
      "Not much. A quiet sweep is less convincing, so it's worth more caution.",
    ),
    timeframe: bias(
      sweep,
      "Check the 1H before planning a buy after the sweep.",
      "Rising. A sweep of lows inside a rising 1H is the cleaner kind to practise.",
      "Falling. Buying a sweep against a falling 1H is much riskier.",
    ),
    plan: plan(
      sweep,
      "long",
      { top: sweep.answer.level, bottom: sweepCandle.low },
      beyond(sweepCandle.low, "below"),
      "Plan a buy between the swept level and the sweep's low, with your stop below the sweep.",
      "Well planned. If price breaks below the sweep's low, the idea is wrong and your stop limits the loss.",
    ),
    skip: "Skip a sweep that closes below the level instead of back above it, because that's a breakdown, not a sweep. Skip it too when volume is thin, or when the sweep goes against a strong higher-timeframe trend.",
    practiceHint: "In Practice, look for a sweep of equal lows on the QQQ 5m chart and plan the trade on the chart.",
    example: example(liquiditySweep(6, "low"), { kind: "candles", indexes: [liquiditySweep(6, "low").answer.sweepIndex] }, "Here the sweep is marked: the wick dips under the equal lows, then the candle closes back above them."),
    practice: { setup: "Liquidity sweep", timeframe: "5m" },
  }),
  {
    slug: "premium-and-discount",
    moduleId: "liquidity",
    title: "Premium and discount",
    subtitle: "Buying low and selling high, made precise.",
    minutes: 4,
    kind: "concept",
    practiceHint: "In Practice, mark the halfway point of the latest swing on the AMZN 1H chart.",
    blocks: [
      text(
        "Take a swing from its low to its high and split it in half. The upper half is premium, where price is relatively expensive. The lower half is discount, where it's relatively cheap.\n\nIn a rising market, traders prefer to buy in discount. In a falling market, they prefer to sell in premium. The halfway point is sometimes called equilibrium.",
      ),
      zone(range, "Mark the discount half of this swing: from the swing low up to the halfway point.", { bottom: range.answer.swingLow, top: rangeMiddle }, "Yes. Everything below the halfway point of the swing is discount."),
      {
        type: "quiz",
        q: "In a rising market, where would a patient trader prefer to buy?",
        options: ["In premium, near the top of the swing", "In discount, below the halfway point", "Anywhere, as long as it's rising"],
        correct: 1,
        explanation: "Exactly. Buying in discount usually gives a closer stop and more room for the target.",
      },
    ],
  },
  setupLesson({
    slug: "supply-and-demand",
    moduleId: "liquidity",
    title: "Supply and demand",
    subtitle: "The quiet bases that big moves launch from.",
    minutes: 6,
    intro: [
      "A demand zone is a tight area where price paused before launching sharply higher. A supply zone is the opposite: a pause before a sharp drop.\n\nThe strength of the move away from the zone matters most. When price returns to a fresh zone, traders watch for it to react again.",
    ],
    spot: zone(demand, "Mark the demand zone: the tight base just before price launched higher.", demand.answer.zone, "Yes. That small cluster of candles is where buyers built up before the move."),
    context: scenario(
      "Price returns to the demand zone for the first time since it launched. Is that a better or worse sign than a zone tested five times?",
      ["Better. A fresh, untested zone tends to be stronger.", "Right. Each test can use up the buyers who were waiting there."],
      ["Worse. The more tests the better.", "Repeated tests often weaken a zone, because the waiting orders get filled each time."],
    ),
    volume: volume(
      demand,
      demand.answer.departureIndex,
      "Did the launch out of the zone come on strong volume?",
      "Yes. A powerful, high-volume departure is what makes a demand zone worth watching.",
      "Not really. A weak departure makes the zone less meaningful.",
    ),
    timeframe: bias(
      demand,
      "Check the 1H before planning from the zone.",
      "Rising. A demand zone in a rising market is the kind to practise.",
      "Falling. Demand zones in a falling market break more often.",
    ),
    plan: plan(
      demand,
      "long",
      demand.answer.zone,
      beyond(demand.answer.zone.bottom, "below"),
      "Price is back at the zone. Plan a buy from it, with your stop below the zone.",
      "Well planned. If price closes below the zone, the buyers who built it are gone and the idea is wrong.",
    ),
    skip: "Skip a zone that has already been tested several times, or one that price slices through with heavy volume. Skip it too if there's no room to a sensible target.",
    practiceHint: "In Practice, find a fresh demand zone on the JPM 1H chart and plan a buy on the 5m.",
    example: example(supplyDemand(7, "demand"), { kind: "zone", zone: supplyDemand(7, "demand").answer.zone }, "Here the demand zone is shaded: the tight base just before price launched higher."),
    practice: { setup: "Supply & demand", timeframe: "1H" },
  }),
];
