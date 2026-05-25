import React from "react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

const FINANCIAL_TERMS: Record<string, string> = {
  "P/E Ratio": "Price-to-Earnings ratio. It shows how much you pay for $1 of the company's earnings. A lower number might mean it's a bargain!",
  "P/E": "Price-to-Earnings ratio. It shows how much you pay for $1 of the company's earnings.",
  "EBITDA": "The raw cash the business makes before accounting rules (Interest, Taxes, Depreciation, Amortization).",
  "Moving Average": "The average price of the stock over a certain time. It smooths out the bumps so we can see the real trend.",
  "RSI": "Relative Strength Index. Over 70 = 'overbought' (too hot). Under 30 = 'oversold' (might be a deal!).",
  "MACD": "Helps spot when a trend is changing direction by comparing moving averages.",
  "Market Cap": "The total value of all the company's shares. How much it would cost to buy the whole company.",
  "Dividend": "A little thank-you cash the company pays you regularly just for owning their stock.",
  "Bullish": "Optimistic! Thinking the price will go UP 📈",
  "Bearish": "Pessimistic! Thinking the price will go DOWN 📉",
  "Support": "A price level where a falling stock tends to stop and bounce back up. Like a floor!",
  "Resistance": "A price level where a rising stock tends to hit its head and fall back down. Like a ceiling!",
  "Volume": "How many shares were traded. High volume means lots of people are paying attention.",
  "EPS": "Earnings Per Share. How much profit the company made for each individual share of its stock.",
  "Revenue": "The total amount of money the company brought in before any expenses are taken out.",
  "Volatility": "How much the stock's price jumps around. High volatility means a bumpy ride!",
  "ETF": "Exchange-Traded Fund. A basket of different stocks you can buy all at once. Great for diversifying!",
  "Index": "A measurement of a section of the stock market, like the S&P 500.",
  "Yield": "The percentage of the stock price that a company pays out in dividends each year.",
  "Blue Chip": "A huge, well-known, financially sound company. Think Apple or Microsoft.",
  "Overbought": "When a stock has gone up too fast and might be due for a cool-down drop.",
  "Oversold": "When a stock has dropped too fast and might be due for a bounce-back."
};

export function TextWithPansyTooltips({ text }: { text: string }) {
  if (!text) return null;

  // Sort terms by length descending to match longest phrases first (e.g. "P/E Ratio" before "P/E")
  const termKeys = Object.keys(FINANCIAL_TERMS).sort((a, b) => b.length - a.length);
  const escapedTerms = termKeys.map(t => t.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
  
  // Match exact terms surrounded by punctuation, spacing, or string boundaries
  const regex = new RegExp(`(?<=^|\\s|[.,!?;:()"'\\[\\]])(${escapedTerms.join('|')})(?=[.,!?;:()"'\\[\\]]|\\s|$)`, 'gi');
  
  const parts = text.split(regex);

  return (
    <TooltipProvider delayDuration={100}>
      {parts.map((part, i) => {
        const termMatch = termKeys.find(t => t.toLowerCase() === part.toLowerCase());
        
        if (termMatch) {
          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <span className="underline decoration-accent underline-offset-4 decoration-dashed font-semibold text-foreground hover:text-primary transition-colors cursor-help">
                  {part}
                </span>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="w-72 p-4 bg-background border border-accent/50 shadow-2xl rounded-2xl !text-foreground z-[100]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-sm shrink-0 shadow-md">
                    🌺
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-bold text-foreground opacity-70">Pansy says:</p>
                    <p className="text-sm font-medium text-foreground leading-relaxed">
                      {FINANCIAL_TERMS[termMatch]}
                    </p>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        }
        
        // Handle regular text, preserving line breaks
        return (
          <span key={i}>
            {part.split('\n').map((line, j, arr) => (
              <React.Fragment key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </span>
        );
      })}
    </TooltipProvider>
  );
}