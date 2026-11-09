import { bearishFVG, orderBlock, structureBreak, supportResistance } from "@/lib/charts/patterns";
import { beyond, bias, find, plan, scenario, setupLesson, text, volume, example } from "./template";
import type { RawLesson } from "./types";

const swings = structureBreak(2, "BOS");
const bos = structureBreak(4, "BOS");
const bosPlan = orderBlock(6, "bullish");
const choch = structureBreak(5, "CHoCH");
const chochPlan = bearishFVG(9);
const support = supportResistance(6);
const supportLevel = support.answer.level;

export const M2_STRUCTURE: RawLesson[] = [
  {
    slug: "trend-and-swings",
    moduleId: "structure",
    title: "Trend and swings",
    subtitle: "How price climbs and falls in steps.",
    minutes: 4,
    kind: "concept",
    practiceHint: "In Practice, find the last swing high and swing low on the AAPL 1H chart.",
    blocks: [
      text(
        "Price rarely moves in a straight line. It moves in swings: a push, a pause, then another push.\n\nA swing high is a peak with lower highs on both sides. A swing low is a dip with higher lows on both sides.\n\nIn a rising trend, each swing high and swing low is higher than the last. In a falling trend, each is lower. When swings overlap with no clear direction, the market is ranging.",
      ),
      find(swings, "Tap the first clear swing high: a peak with lower highs on both sides.", [2], "Yes. The candles either side of it peak lower, which is what makes it a swing high."),
      {
        type: "quiz",
        q: "What defines a rising trend?",
        options: ["Every candle closes higher", "Higher swing highs and higher swing lows", "Volume rises every day"],
        correct: 1,
        explanation: "Exactly. Individual candles can fall in a rising trend, as long as the swings keep stepping higher.",
      },
    ],
  },
  setupLesson({
    slug: "break-of-structure",
    moduleId: "structure",
    title: "Break of structure (BOS)",
    subtitle: "When a trend confirms itself by taking out a swing.",
    minutes: 6,
    intro: [
      "A break of structure, or BOS, happens when price closes beyond the most recent swing in the direction of the trend. In a rising trend, that's a close above the last swing high.\n\nA BOS tells you the trend is still in control. Traders often wait for price to pull back after a BOS, then look for an entry in the trend's direction.",
    ],
    spot: find(bos, "Tap the candle that closes above the last swing high, the break of structure.", [6], "That's it. The body closes clearly above the earlier peak, not just a wick poking through."),
    context: scenario(
      "Price has just made a BOS to the upside. Where would you look for a buying opportunity?",
      ["On a pullback into a zone that started the move.", "Exactly. Waiting for a pullback gives you a clearer place for your stop and a better price."],
      ["Straight away, at the very top of the breakout candle.", "Chasing the top usually leaves your stop far away and your reward small. Patience tends to pay here."],
    ),
    volume: volume(
      bos,
      6,
      "Did the breaking candle come with strong volume?",
      "Yes. Heavy volume on the break shows real participation, which makes the break more trustworthy.",
      "Not especially. A break on ordinary volume is weaker, so it's worth waiting for more confirmation.",
    ),
    timeframe: bias(
      bosPlan,
      "Before planning, check the bigger picture on the 1H.",
      "Rising. A bullish break on the 5m agrees with the 1H, which is the cleanest kind to practise.",
      "Falling. A bullish break against a falling 1H deserves extra caution.",
    ),
    plan: plan(
      bosPlan,
      "long",
      bosPlan.answer.zone,
      beyond(bosPlan.answer.zone.bottom, "below"),
      "After the break, price pulled back into the zone that started the move. Plan a buy from that zone.",
      "Well planned. Your entry sits in the zone, your stop sits below where the idea would be wrong, and your reward is worth the risk.",
    ),
    skip: "Skip a break that only pokes through with a wick, or happens on thin volume. Skip it too when the higher timeframe is clearly pointing the other way, or when price is already far from any zone to plan from.",
    practiceHint: "In Practice, find a recent break of structure on the MSFT 5m chart, then plan a pullback entry.",
    example: example(structureBreak(7, "BOS"), { kind: "candles", indexes: [structureBreak(7, "BOS").answer.index] }, "Here the break of structure is marked: the candle whose body closes above the last swing high."),
    practice: { setup: "BOS", timeframe: "1H" },
  }),
  setupLesson({
    slug: "change-of-character",
    moduleId: "structure",
    title: "Change of character (CHoCH)",
    subtitle: "The first sign a trend may be turning.",
    minutes: 6,
    intro: [
      "A change of character, or CHoCH, is the first break against the current trend. In a rising trend, it's the first close below the most recent swing low.\n\nOne CHoCH doesn't guarantee a reversal. It's an early warning that the sellers have shown strength, and many traders wait for more confirmation before acting on it.",
    ],
    spot: find(choch, "Price was rising. Tap the candle that closes below the last swing low.", [8], "Yes. After a run of higher swings, this is the first close beneath a swing low, the change of character."),
    context: scenario(
      "You see a CHoCH on the 5m chart, but the Daily trend is still strongly rising. How should you treat it?",
      ["As a possible short-term pullback, not a full reversal.", "That's a careful reading. Lower-timeframe shifts inside a strong higher-timeframe trend are often just pullbacks."],
      ["As proof the whole trend has reversed.", "A single CHoCH on a low timeframe rarely overturns a strong daily trend on its own."],
    ),
    volume: volume(
      choch,
      8,
      "Was the change of character candle backed by strong volume?",
      "Yes. Strong volume on the shift shows sellers stepped in with real size.",
      "Not really. A shift on ordinary volume is a weaker warning, so treat it as a maybe.",
    ),
    timeframe: bias(
      chochPlan,
      "Check the 1H before planning a sell.",
      "Rising. That means this falling 5m pattern goes against the bigger picture, so it calls for extra caution and smaller size.",
      "Falling. A bearish shift that agrees with the 1H is the cleaner kind to practise.",
    ),
    plan: plan(
      chochPlan,
      "short",
      chochPlan.answer.fvg.zone,
      beyond(chochPlan.candles[10].high, "above"),
      "After the shift, price left a gap on the way down. Plan a sell from that gap.",
      "Well planned. For a sell, your stop sits above where the idea would be wrong and your target sits below.",
    ),
    skip: "Skip a CHoCH that forms in the middle of a choppy range, where swings don't mean much. Be very careful acting on one that fights a strong higher-timeframe trend.",
    practiceHint: "In Practice, look for a change of character on the NVDA 5m chart and note whether the 1H agrees.",
    example: example(structureBreak(8, "CHoCH"), { kind: "candles", indexes: [structureBreak(8, "CHoCH").answer.index] }, "Here the change of character is marked: the first close below the last swing low after a rise."),
    practice: { setup: "CHoCH", timeframe: "5m" },
  }),
  setupLesson({
    slug: "support-and-resistance",
    moduleId: "structure",
    title: "Support and resistance",
    subtitle: "Price levels the market keeps reacting to.",
    minutes: 5,
    intro: [
      "Support is a level where falling price has repeatedly found buyers. Resistance is a level where rising price has repeatedly met sellers.\n\nThe more times a level holds, the more people notice it. But levels aren't walls. They're areas, and they do break.",
    ],
    spot: find(support, "Tap every candle that touched the support level and held.", support.answer.touches, "Yes. Three separate touches near the same price, each one bouncing, is what makes this a support level."),
    context: scenario(
      "Price falls back to a support level that has held three times. What's a measured approach?",
      ["Watch how price reacts at the level before planning anything.", "Good. A level is a place to pay attention, not an automatic reason to trade."],
      ["Buy the moment it touches, because it always holds.", "Levels can break, and each extra touch can weaken them as buyers get used up."],
    ),
    volume: volume(
      support,
      7,
      "Was the most recent bounce from support backed by strong volume?",
      "Yes. Buyers showed up with size at the level, which strengthens it.",
      "No. The bounce came on ordinary volume, so it's worth waiting for more confirmation before trusting it.",
    ),
    timeframe: bias(
      support,
      "Check the 1H to see which way the bigger trend leans.",
      "Rising. Support in a rising market tends to be the more reliable kind.",
      "Falling. Support in a falling market is more likely to give way eventually.",
    ),
    plan: plan(
      support,
      "long",
      { bottom: supportLevel, top: Math.round(supportLevel * 1.004 * 100) / 100 },
      beyond(supportLevel, "below", 0.003),
      "Plan a buy just above support, with your stop below the level.",
      "Well planned. If price closes clearly below support, the idea is wrong and your stop takes you out with a small loss.",
    ),
    skip: "Skip a level that has been touched so often it looks worn, or one where price is grinding into it with heavy selling volume. Skip it too when the higher timeframe is falling hard.",
    practiceHint: "In Practice, mark a support level on the KO daily chart and see how price reacted the last three times.",
    example: example(supportResistance(3), { kind: "candles", indexes: supportResistance(3).answer.touches }, "Here the three touches of support are marked, each one holding at the same price."),
    practice: { setup: "Support & resistance", timeframe: "1H" },
  }),
];

