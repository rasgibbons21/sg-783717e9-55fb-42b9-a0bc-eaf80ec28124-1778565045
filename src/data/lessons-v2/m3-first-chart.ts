import type { Candle, Lesson } from "./types";

const c = (open: number, high: number, low: number, close: number): Candle => ({ open, high, low, close });

const GENTLE_RISE: Candle[] = [
  c(4000, 4006, 3996, 4004),
  c(4004, 4010, 4001, 4008),
  c(4008, 4012, 4003, 4005),
  c(4005, 4016, 4004, 4014),
  c(4014, 4020, 4011, 4018),
  c(4018, 4021, 4012, 4014),
  c(4014, 4026, 4013, 4024),
];

const ONE_BIG_FALL: Candle[] = [
  c(4020, 4024, 4017, 4022),
  c(4022, 4026, 4019, 4024),
  c(4024, 4027, 4021, 4025),
  c(4025, 4026, 4000, 4003),
  c(4003, 4007, 3999, 4005),
  c(4005, 4010, 4002, 4008),
];

const FLOOR_AT_4000: Candle[] = [
  c(4018, 4021, 4008, 4010),
  c(4010, 4012, 4000, 4002),
  c(4002, 4014, 4001, 4012),
  c(4012, 4016, 4005, 4007),
  c(4007, 4009, 4000, 4001),
  c(4001, 4015, 4000, 4013),
  c(4013, 4020, 4011, 4018),
];

export const M3_FIRST_CHART: Lesson[] = [
  {
    slug: "reading-candles",
    moduleId: "first-chart",
    title: "Reading a candle",
    subtitle: "What each little shape on a gold chart is telling you.",
    minutes: 4,
    practiceHint: "In Practice, open the gold chart and find a rising candle and a falling one.",
    blocks: [
      {
        type: "text",
        body: "Most gold charts are made of candles. Each candle sums up the price over a chosen stretch of time, such as an hour or a day.\n\nThe thick part is the body. It shows where the price opened and closed. The thin lines are the wicks, showing the highest and lowest prices reached.\n\nOn these charts, a sage candle closed higher than it opened, and a clay candle closed lower.",
      },
      {
        type: "chartTap",
        prompt: "Tap the candle where the price fell the most.",
        candles: ONE_BIG_FALL,
        correctIndexes: [3],
        explanation: "Yes, that long clay candle. The price opened high, then closed much lower. You've just read your first chart.",
      },
      {
        type: "quiz",
        q: "What do the thin wicks on a candle show?",
        options: ["The highest and lowest prices reached", "How many people are trading", "The broker's fee"],
        correct: 0,
        explanation: "Right. The body shows open and close, and the wicks show how far the price travelled in between.",
      },
    ],
  },
  {
    slug: "spotting-a-trend",
    moduleId: "first-chart",
    title: "Spotting a trend",
    subtitle: "Is the price generally rising, falling or going nowhere?",
    minutes: 3,
    practiceHint: "In Practice, zoom out on the gold chart and describe its direction in one word.",
    blocks: [
      {
        type: "text",
        body: "A trend is simply the general direction of the price. In a rising trend, the price keeps making higher highs and higher lows, even with small dips along the way.\n\nA trend tells you what has been happening. It doesn't promise what happens next.",
      },
      {
        type: "chartTap",
        prompt: "This chart is rising overall. Tap the candle that shows a small dip along the way.",
        candles: GENTLE_RISE,
        correctIndexes: [2, 5],
        explanation: "Well spotted. Small dips are normal, even when the bigger picture is rising.",
      },
      {
        type: "scenario",
        prompt: "Gold has risen for five days. What's the most honest thing you can say?",
        choices: [
          {
            label: "It will definitely keep rising tomorrow.",
            outcome: "It might, but no chart can promise that.",
            good: false,
          },
          {
            label: "It has been rising, but it could still change.",
            outcome: "That's exactly the right mindset. Describe what you can see, and stay open to being wrong.",
            good: true,
          },
        ],
      },
    ],
  },
  {
    slug: "support-and-resistance",
    moduleId: "first-chart",
    title: "Floors and ceilings",
    subtitle: "A plain-English look at support and resistance.",
    minutes: 4,
    practiceHint: "In Practice, find a price on the gold chart where the market has turned around more than once.",
    blocks: [
      {
        type: "text",
        body: "Sometimes the price falls to a certain level and bounces, more than once. Traders call that level support. You can think of it as a floor.\n\nA ceiling works the other way. The price rises to a level and turns back down, and that's called resistance.\n\nFloors and ceilings aren't solid. They're just areas where many people have made decisions before, and they do break.",
      },
      {
        type: "chartTap",
        prompt: "The price keeps bouncing near 4,000. Tap a candle that touched this floor and closed well above it.",
        candles: FLOOR_AT_4000,
        correctIndexes: [2, 5],
        explanation: "Yes. The price dipped to around 4,000, then buyers pushed it back up. That's what a floor looks like.",
      },
      {
        type: "quiz",
        q: "What should you remember about a floor, or support level?",
        options: ["It can never break", "It's an area that has held before, but it can break", "It's a rule set by the broker"],
        correct: 1,
        explanation: "Exactly. It's a helpful clue, not a promise. That's why stop losses matter, and they're coming up next.",
      },
    ],
  },
];
