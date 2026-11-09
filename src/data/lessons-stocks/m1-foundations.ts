import { bullishFVG, supportResistance } from "@/lib/charts/patterns";
import { bias, find, pansy, scenario, text, volume } from "./template";
import type { RawLesson } from "./types";

const firstChart = supportResistance(3);
const highestClose = firstChart.candles.reduce((best, c, i, all) => (c.close > all[best].close ? i : best), 0);
const volumeChart = bullishFVG(5);
const timeframeChart = bullishFVG(8);

export const M1_FOUNDATIONS: RawLesson[] = [
  {
    slug: "reading-a-stock-chart",
    moduleId: "foundations",
    title: "Reading a stock chart",
    subtitle: "What every candle tells you, in plain words.",
    minutes: 4,
    kind: "concept",
    practiceHint: "Open Practice, choose SPY and find the most recent candle.",
    blocks: [
      pansy("Welcome. I'm Pansy, and I'll be with you through every lesson. We'll go slowly and precisely, and there are no silly questions."),
      text(
        "A stock chart shows how a share price has moved over time. Most traders read it as candles. Each candle covers one stretch of time, such as five minutes, an hour or a day.\n\nA candle has a body and two thin wicks. The body runs from where price opened to where it closed. The wicks show the highest and lowest prices reached in that time. On Bloom, a sage candle closed higher than it opened, and a blush candle closed lower.",
      ),
      find(firstChart, "Tap the candle that closed at the highest price.", [highestClose], "That's the one. Look for the top of the body, not the top of the wick, because the close is where the candle finished."),
      {
        type: "quiz",
        q: "What do the thin wicks show?",
        options: ["Where price opened and closed", "The highest and lowest prices reached", "How many shares changed hands"],
        correct: 1,
        explanation: "Exactly. The body is open to close, and the wicks show how far price travelled in between.",
      },
      text("Everything else in this course builds on reading candles well. Take your time with it."),
    ],
  },
  {
    slug: "candles-and-volume",
    moduleId: "foundations",
    title: "Candles and volume",
    subtitle: "Why the bars under the chart matter so much.",
    minutes: 4,
    kind: "concept",
    practiceHint: "In Practice, look at the volume bars under the SPY chart and find the tallest one.",
    blocks: [
      text(
        "Under each chart sits a row of bars showing volume: how many shares traded during each candle.\n\nVolume tells you how much conviction sat behind a move. A large candle on heavy volume means many participants pushed price there. A large candle on light volume is easier to reverse.",
      ),
      volume(volumeChart, 11, "This large candle pushed price higher. Was it backed by strong volume?", "Yes. Its volume bar towers over the ones before it, so plenty of participants drove that move.", "Not really. Its volume is ordinary, so the move had little behind it."),
      volume(volumeChart, 5, "Now look at this quiet candle earlier on. Strong volume or not?", "Surprisingly, yes. Volume was heavier than usual even though price barely moved.", "No. This is ordinary volume during a calm stretch, which is exactly what quiet periods look like."),
      {
        type: "quiz",
        q: "A stock jumps sharply on very light volume. What's a sensible reading?",
        options: ["The move is certain to continue", "The move has little conviction behind it and may not hold", "Volume never matters"],
        correct: 1,
        explanation: "Right. Light volume doesn't mean the move will fail, but it does mean fewer participants are behind it.",
      },
    ],
  },
  {
    slug: "timeframes",
    moduleId: "foundations",
    title: "Timeframes",
    subtitle: "The same stock, seen from far away and up close.",
    minutes: 4,
    kind: "concept",
    practiceHint: "In Practice, switch the SPY chart between Daily, 1H and 5m and notice how the story changes.",
    blocks: [
      text(
        "A timeframe is how much time each candle covers. On a daily chart every candle is one trading day. On a 1-hour chart it's one hour, and on a 5-minute chart it's five minutes.\n\nHigher timeframes show the big picture and change slowly. Lower timeframes show detail and move quickly, so they're noisier.",
      ),
      bias(
        timeframeChart,
        "Switch to the 1H chart to see the bigger picture.",
        "Yes. On the 1H the highs and lows keep stepping higher, even if the 5m looks choppy up close.",
        "Yes. On the 1H the highs and lows keep stepping lower, even if the 5m looks choppy up close.",
      ),
      {
        type: "quiz",
        q: "Which timeframe changes direction most slowly?",
        options: ["5m", "1H", "Daily"],
        correct: 2,
        explanation: "Correct. Each daily candle holds a whole session, so it takes far more to change its direction.",
      },
    ],
  },
  {
    slug: "multi-timeframe-analysis",
    moduleId: "foundations",
    title: "Multi-timeframe analysis",
    subtitle: "Using a higher timeframe for direction and a lower one for timing.",
    minutes: 5,
    kind: "concept",
    practiceHint: "In Practice, decide the 1H direction on QQQ before you look at the 5m chart.",
    blocks: [
      text(
        "Experienced traders rarely use one timeframe alone. A common approach is top-down:\n\nThe Daily or 1H chart sets the direction, called the bias.\n\nThe 1H chart shows the key areas where price may react.\n\nThe 5m chart is where you wait for a precise entry pattern, in the direction of the bias.",
      ),
      {
        type: "order",
        prompt: "Put the top-down steps in order.",
        steps: ["Read the Daily or 1H chart for the bias", "Mark the key zones on the 1H chart", "Wait for an entry pattern on the 5m chart", "Plan your stop and target"],
        explanation: "That's the rhythm you'll use in every setup lesson from here on.",
      },
      bias(
        timeframeChart,
        "Check the 1H before you think about the 5m.",
        "Right. With a rising 1H bias, you'd mainly look for buying patterns on the 5m.",
        "Right. With a falling 1H bias, you'd mainly look for selling patterns on the 5m.",
      ),
      scenario(
        "The 1H is clearly rising, but you spot a perfect-looking selling pattern on the 5m. What fits a top-down approach?",
        ["Treat it with caution, or skip it, because it fights the bias.", "Exactly. Patterns that agree with the higher timeframe tend to be the cleaner ones to practise."],
        ["Take it anyway, the 5m is what matters.", "The 5m is only one piece. Going against the higher timeframe is one of the most common reasons good-looking patterns fail."],
      ),
    ],
  },
];
