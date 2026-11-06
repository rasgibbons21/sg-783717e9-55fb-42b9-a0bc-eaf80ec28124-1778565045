import { bullishFVG } from "@/lib/charts/patterns";
import { beyond, plan, scenario, text } from "./template";
import type { Lesson } from "./types";

const checklistChart = bullishFVG(21);

export const M7_EXECUTION: Lesson[] = [
  {
    slug: "the-execution-checklist",
    moduleId: "execution",
    title: "The execution checklist",
    subtitle: "Putting every skill together, step by step.",
    minutes: 7,
    kind: "concept",
    practiceHint: "In Practice, run the full checklist on SPY before placing a single trade.",
    blocks: [
      text(
        "Every setup you've learned fits into the same checklist. Working through it in order is what turns pattern-spotting into a plan.\n\n1. Bias: what are the Daily and 1H doing?\n2. Location: is price at a key zone, in discount for buys or premium for sells?\n3. Liquidity: has an obvious high or low just been swept?\n4. Confirmation: is there displacement, a break of structure or a gap on the 5m?\n5. Volume: did real participation back the move?\n6. Plan: entry, a stop beyond the point where the idea is wrong, and a target at least 1.5 times the risk.\n7. Size: risk a small, fixed part of your balance.",
      ),
      {
        type: "order",
        prompt: "Put the checklist in order.",
        steps: [
          "Read the bias on the higher timeframe",
          "Find a key zone in the right location",
          "Look for a liquidity sweep",
          "Wait for confirmation on the 5m",
          "Plan entry, stop and target",
          "Size the trade",
        ],
        explanation: "That's the full sequence. Skipping steps is where most trading mistakes begin.",
      },
      text(
        "Applying it to US stocks\n\nThese ideas work best on liquid stocks and ETFs, such as SPY, QQQ and large companies that trade millions of shares a day. In thinly traded stocks, patterns are less reliable and prices can jump.\n\nThe first few minutes after the 9:30am New York open are often wild, so many traders wait. Be especially careful around company earnings, when prices can gap far past any stop.",
      ),
      plan(
        checklistChart,
        "long",
        checklistChart.answer.fvg.zone,
        beyond(checklistChart.candles[checklistChart.answer.fvg.indexes[0]].low, "below"),
        "Everything on the checklist lines up. Plan the buy from the gap.",
        "That's a complete plan, built on every step of the checklist.",
      ),
    ],
  },
  {
    slug: "position-sizing-and-skipping",
    moduleId: "execution",
    title: "Position sizing and skipping",
    subtitle: "How much to trade, and when not to trade at all.",
    minutes: 5,
    kind: "concept",
    practiceHint: "In Practice, work out your share size from your stop before every trade.",
    blocks: [
      text(
        "Your stop decides your size, not the other way round. First decide how much of your balance you're willing to lose if the idea is wrong. Many traders use 1% or less.\n\nThen divide that amount by the distance between your entry and your stop. The answer is how many shares to trade.",
      ),
      {
        type: "quiz",
        q: "Your practice balance is $10,000 and you'll risk 1%, which is $100. Your entry is $50 and your stop is $48. How many shares?",
        options: ["20 shares", "50 shares", "200 shares"],
        correct: 1,
        explanation: "Yes. The stop is $2 away, so $100 divided by $2 is 50 shares.",
      },
      scenario(
        "Your checklist is only half complete, but the chart is moving fast and you're worried about missing out. What's the disciplined choice?",
        ["Skip it. Another setup will come.", "Exactly. Skipping a half-formed setup is a skill, and it protects both your balance and your confidence."],
        ["Take it with a bigger size to make it worth it.", "That combines two of the most common mistakes: trading without a plan and risking too much."],
      ),
      {
        type: "quiz",
        q: "When is skipping a trade the right call?",
        options: ["Only when you've already lost money today", "Whenever the checklist isn't met", "Never, you should always be in a trade"],
        correct: 1,
        explanation: "Right. No checklist, no trade. It's that simple.",
      },
    ],
  },
  {
    slug: "journaling-your-analysis",
    moduleId: "execution",
    title: "Journaling your analysis",
    subtitle: "How good traders learn from every trade.",
    minutes: 4,
    kind: "concept",
    practiceHint: "In Practice, add a note to your next trade explaining your setup, timeframe and plan.",
    blocks: [
      text(
        "A trading journal records your reasoning, not just your results. For each trade, note the setup, the timeframes you used, why you took it, where your stop and target were, and how it felt.\n\nOver time, your journal shows which setups suit you and which mistakes you repeat. A winning trade taken without a plan teaches less than a well-planned loss.",
      ),
      {
        type: "order",
        prompt: "Put these journal entries in a useful order.",
        steps: ["The setup and timeframe you used", "Why you took it", "Your entry, stop and target", "What happened", "What you'd do differently"],
        explanation: "That's a complete journal entry. Bloom's Practice area records your setup and timeframe for you, and you can add the rest as a note.",
      },
      {
        type: "quiz",
        q: "Which trade teaches you the most?",
        options: ["A lucky win with no plan", "A well-planned trade, win or lose, that you journaled honestly", "A trade you can't remember"],
        correct: 1,
        explanation: "Exactly. Process is what you can improve. Results follow from a good process over many trades.",
      },
    ],
  },
];
