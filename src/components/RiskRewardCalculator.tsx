import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator } from "lucide-react";

export function RiskRewardCalculator() {
  const [entryPrice, setEntryPrice] = useState<number>(100);
  const [stopLoss, setStopLoss] = useState<number>(95);
  const [targetPrice, setTargetPrice] = useState<number>(115);
  const [accountSize, setAccountSize] = useState<number>(10000);
  const [riskPercentage, setRiskPercentage] = useState<number>(2);

  // Calculate risk and reward amounts
  const riskPerShare = entryPrice - stopLoss;
  const rewardPerShare = targetPrice - entryPrice;
  
  // Calculate risk to reward ratio
  const riskRewardRatio = riskPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : "0.00";
  
  // Calculate position sizing
  const riskAmount = (accountSize * riskPercentage) / 100;
  const positionSize = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0;
  const rewardAmount = positionSize * rewardPerShare;

  // Get Dahlia's commentary based on ratio
  const getDahliaCommentary = (ratio: string) => {
    const r = parseFloat(ratio);
    if (r < 1) {
      return {
        message: "This trade is not worth it sis. Loss potential bigger than gain. Skip it 🚫",
        color: "destructive" as const,
      };
    } else if (r >= 1 && r < 2) {
      return {
        message: "Okay but not great. Look for better setups 🤔",
        color: "secondary" as const,
      };
    } else if (r >= 2 && r < 3) {
      return {
        message: "Now we are talking! Solid setup worth considering 👍",
        color: "default" as const,
      };
    } else {
      return {
        message: "This is exactly what we wait for! Great risk to reward 🔥",
        color: "default" as const,
      };
    }
  };

  const commentary = getDahliaCommentary(riskRewardRatio);

  return (
    <Card className="border-accent">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-xl shadow-md">
            🌺
          </div>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Risk to Reward Calculator
            </CardTitle>
            <CardDescription>
              Let Dahlia help you calculate if a trade is worth taking
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="entryPrice">Entry Price ($)</Label>
            <Input
              id="entryPrice"
              type="number"
              value={entryPrice}
              onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stopLoss">Stop Loss Price ($)</Label>
            <Input
              id="stopLoss"
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetPrice">Target Price ($)</Label>
            <Input
              id="targetPrice"
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountSize">Account Size ($)</Label>
            <Input
              id="accountSize"
              type="number"
              value={accountSize}
              onChange={(e) => setAccountSize(parseFloat(e.target.value) || 0)}
              step="100"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="riskPercentage">Risk Percentage (default 2%)</Label>
            <Input
              id="riskPercentage"
              type="number"
              value={riskPercentage}
              onChange={(e) => setRiskPercentage(parseFloat(e.target.value) || 0)}
              step="0.1"
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4 rounded-lg bg-muted p-4">
          <h4 className="font-semibold text-foreground">Results:</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Risk Amount</p>
              <p className="font-semibold text-destructive">
                ${riskAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reward Amount</p>
              <p className="font-semibold text-primary">
                ${rewardAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risk to Reward Ratio</p>
              <p className="text-2xl font-bold text-foreground">
                1:{riskRewardRatio}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Position Size</p>
              <p className="font-semibold text-foreground">
                {positionSize} shares
              </p>
            </div>
          </div>
        </div>

        {/* Dahlia's Commentary */}
        <Card className={commentary.color === "destructive" ? "border-destructive bg-destructive/10" : "border-primary bg-accent/20"}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-xl shadow-md">
                🌺
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">Dahlia's Take</p>
                  {parseFloat(riskRewardRatio) >= 3 && (
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      Excellent
                    </Badge>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                  {commentary.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Educational Note */}
        <p className="text-xs text-muted-foreground">
          This calculator helps you size positions properly and evaluate trade quality.
          Remember: Never risk more than 3% per trade. Discipline over intelligence
          every time 💪
        </p>
      </CardContent>
    </Card>
  );
}