export interface Achievement {
  key: string;
  title: string;
  description: string;
  emoji: string;
  category: "learning" | "trading" | "streak" | "social" | "milestone";
  xpReward: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Learning
  { key: "first-lesson", title: "First Step", description: "Complete your first lesson", emoji: "🌱", category: "learning", xpReward: 10 },
  { key: "five-lessons", title: "Knowledge Seeker", description: "Complete 5 lessons", emoji: "📚", category: "learning", xpReward: 25 },
  { key: "ten-lessons", title: "Dedicated Learner", description: "Complete 10 lessons", emoji: "🎓", category: "learning", xpReward: 50 },
  { key: "twenty-lessons", title: "Scholar", description: "Complete 20 lessons", emoji: "🏅", category: "learning", xpReward: 75 },
  { key: "all-lessons", title: "Full Bloom Graduate", description: "Complete all lessons", emoji: "🌸", category: "learning", xpReward: 150 },
  { key: "first-quiz", title: "Quiz Taker", description: "Pass your first quiz", emoji: "✅", category: "learning", xpReward: 15 },
  { key: "strategy-explorer", title: "Strategy Explorer", description: "Visit the Bloom Strategy Lab", emoji: "🧪", category: "learning", xpReward: 10 },

  // Trading
  { key: "first-trade", title: "Market Debut", description: "Place your first paper trade", emoji: "📈", category: "trading", xpReward: 15 },
  { key: "first-win", title: "First Green", description: "Close your first profitable trade", emoji: "💚", category: "trading", xpReward: 20 },
  { key: "ten-trades", title: "Active Trader", description: "Close 10 trades", emoji: "📊", category: "trading", xpReward: 40 },
  { key: "fifty-trades", title: "Seasoned Trader", description: "Close 50 trades", emoji: "🏆", category: "trading", xpReward: 100 },
  { key: "win-streak-3", title: "Hot Hand", description: "Win 3 trades in a row", emoji: "🔥", category: "trading", xpReward: 30 },
  { key: "win-streak-5", title: "On Fire", description: "Win 5 trades in a row", emoji: "⚡", category: "trading", xpReward: 60 },
  { key: "risk-manager", title: "Risk Manager", description: "Close a trade with 2:1+ R/R", emoji: "🛡️", category: "trading", xpReward: 25 },
  { key: "thesis-trader", title: "Thesis Trader", description: "Place 5 trades with a written thesis", emoji: "📝", category: "trading", xpReward: 30 },

  // Streaks
  { key: "streak-3", title: "Getting Started", description: "Maintain a 3-day streak", emoji: "🌿", category: "streak", xpReward: 15 },
  { key: "streak-7", title: "Week Warrior", description: "Maintain a 7-day streak", emoji: "💪", category: "streak", xpReward: 35 },
  { key: "streak-14", title: "Two Week Titan", description: "Maintain a 14-day streak", emoji: "⭐", category: "streak", xpReward: 70 },
  { key: "streak-30", title: "Monthly Master", description: "Maintain a 30-day streak", emoji: "👑", category: "streak", xpReward: 150 },

  // Milestones
  { key: "first-challenge", title: "Challenge Accepted", description: "Complete your first daily challenge", emoji: "⚡", category: "milestone", xpReward: 10 },
  { key: "journal-writer", title: "Journal Writer", description: "Write your first journal entry", emoji: "📓", category: "milestone", xpReward: 15 },
  { key: "leaderboard-top10", title: "Top 10", description: "Reach the top 10 on the leaderboard", emoji: "🥇", category: "milestone", xpReward: 50 },
];

export function getAchievement(key: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.key === key);
}
