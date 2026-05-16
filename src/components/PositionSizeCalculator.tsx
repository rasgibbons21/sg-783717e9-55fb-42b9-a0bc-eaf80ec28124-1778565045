import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign, TrendingDown, Hash } from "lucide-react";

export function PositionSizeCalculator() {
  const [accountSize, setAccountSize] = useState("10000");
  const [riskPercent, setRiskPercent] = useState("2");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");

  const calculatePosition = () => {
    const account = parseFloat(accountSize) || 0;
    const risk = parseFloat(riskPercent) || 0;
    const entry = parseFloat(entryPrice) || 0;
    const stop = parseFloat(stopLoss) || 0;

    if (account <= 0 || risk <= 0 || entry <= 0 || stop <= 0) {
      return null;
    }

    if (stop >= entry) {
      return { error: "Stop loss must be below entry price" };
    }

    const riskAmount = account * (risk / 100);
    const riskPerShare = entry - stop;
    const shares = Math.floor(riskAmount / riskPerShare);
    const positionSize = shares * entry;

    return {
      riskAmount,
      riskPerShare,
      shares,
      positionSize,
      riskPercent: risk,
    };
  };

  const result = calculatePosition();

  const getPansyCommentary = () => {
    if (!result || result.error) return null;

    const { riskPercent } = result;

    if (riskPercent < 1) {
      return {
        text: "Ultra conservative approach. You'll need a lot of wins to grow but your account is super safe 🛡️",
        color: "text-blue-600",
      };
    } else if (riskPercent >= 1 && riskPercent <= 2) {
      return {
        text: "Perfect! This is the sweet spot for most traders. Conservative but effective 💪",
        color: "text-primary",
      };
    } else if (riskPercent > 2 && riskPercent <= 3) {
      return {
        text: "Acceptable risk level. Stay disciplined and this can work sis 👍",
        color: "text-accent",
      };
    } else if (riskPercent > 3 && riskPercent <= 5) {
      return {
        text: "Getting aggressive girl. Make sure you can emotionally handle these losses 😬",
        color: "text-yellow-600",
      };
    } else {
      return {
        text: "Way too risky sis! One bad streak and your account is toast. Lower this 🚫",
        color: "text-destructive",
      };
    }
  };

  const commentary = getPansyCommentary();

  return (
    <Card className="border-accent bg-gradient-to-br from-accent/10 to-primary/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary shadow-md">
            <Calculator className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Position Size Calculator</CardTitle>
            <CardDescription>
              Calculate exactly how many shares to buy based on your risk tolerance
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="account-size" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Account Size
            </Label>
            <Input
              id="account-size"
              type="number"
              placeholder="10000"
              value={accountSize}
              onChange={(e) => setAccountSize(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="risk-percent" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-accent" />
              Risk Per Trade (%)
            </Label>
            <Input
              id="risk-percent"
              type="number"
              min="0.5"
              max="10"
              step="0.5"
              placeholder="2"
              value={riskPercent}
              onChange={(e) => setRiskPercent(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entry-price">Entry Price</Label>
            <Input
              id="entry-price"
              type="number"
              step="0.01"
              placeholder="150.00"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stop-loss">Stop Loss Price</Label>
            <Input
              id="stop-loss"
              type="number"
              step="0.01"
              placeholder="145.00"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>

        {/* Results */}
        {result && !result.error ? (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-4 bg-background border-border">
                <p className="text-xs text-muted-foreground mb-1">Max Risk Amount</p>
                <p className="text-2xl font-bold text-foreground">
                  ${result.riskAmount.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.riskPercent}% of ${parseFloat(accountSize).toLocaleString()}
                </p>
              </Card>
              <Card className="p-4 bg-background border-border">
                <p className="text-xs text-muted-foreground mb-1">Risk Per Share</p>
                <p className="text-2xl font-bold text-foreground">
                  ${result.riskPerShare.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Entry - Stop Loss
                </p>
              </Card>
              <Card className="p-4 bg-accent/20 border-accent">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Shares to Buy
                </p>
                <p className="text-3xl font-bold text-primary">
                  {result.shares}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Optimal position size
                </p>
              </Card>
              <Card className="p-4 bg-primary/10 border-primary">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Total Position Cost
                </p>
                <p className="text-3xl font-bold text-primary">
                  ${result.positionSize.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.shares} × ${parseFloat(entryPrice).toFixed(2)}
                </p>
              </Card>
            </div>

            {/* Pansy's Commentary */}
            <Card className="border-accent bg-accent/5">
              <CardContent className="p-4">
                <p className="mb-2 text-sm font-semibold text-foreground">
                  Pansy's Take:
                </p>
                <p className={`text-sm leading-relaxed font-medium ${commentary.color}`}>
                  {commentary.text}
                </p>
              </CardContent>
            </Card>

            {/* Explanation */}
            <div className="pt-2 space-y-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold">How it works:</span> If you buy {result.shares} shares at ${parseFloat(entryPrice).toFixed(2)} 
                and your stop loss hits at ${parseFloat(stopLoss).toFixed(2)}, you'll lose exactly ${result.riskAmount.toFixed(2)} — 
                which is {result.riskPercent}% of your ${parseFloat(accountSize).toLocaleString()} account.
              </p>
              <p className="text-xs text-muted-foreground italic">
                This keeps your risk consistent across all trades regardless of stock price or volatility 🎯
              </p>
            </div>
          </div>
        ) : result?.error ? (
          <Card className="p-4 bg-destructive/10 border-destructive">
            <p className="text-sm text-destructive text-center">{result.error}</p>
          </Card>
        ) : (
          <Card className="p-6 bg-muted/50 border-border">
            <p className="text-sm text-muted-foreground text-center">
              Fill in all fields to calculate your optimal position size 💡
            </p>
          </Card>
        )}

        {/* Pansy's Note */}
        <Card className="mt-6 border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
          <CardContent className="p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-semibold">Pansy's Rule:</span> Never risk more than 3% per trade.
            </p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}