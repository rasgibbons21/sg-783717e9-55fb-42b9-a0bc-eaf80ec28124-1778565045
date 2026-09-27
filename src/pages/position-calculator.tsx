import { useState, useMemo, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Calculator, Info } from "lucide-react";
import { trackPositionCalcUse } from "@/lib/analytics";

const RISK_PRESETS = [0.5, 1, 2, 3];

export default function PositionCalculatorPage() {
  const [accountSize, setAccountSize] = useState("");
  const [riskPct, setRiskPct] = useState("1");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");

  useEffect(() => { trackPositionCalcUse(); }, []);

  const result = useMemo(() => {
    const account = parseFloat(accountSize);
    const risk = parseFloat(riskPct);
    const entry = parseFloat(entryPrice);
    const stop = parseFloat(stopPrice);
    const target = targetPrice ? parseFloat(targetPrice) : null;

    if (!account || !risk || !entry || !stop || account <= 0 || entry <= 0 || stop <= 0) return null;
    if (entry === stop) return null;

    const isLong = entry > stop;
    const riskPerShare = Math.abs(entry - stop);
    const dollarRisk = account * (risk / 100);
    const shares = Math.floor(dollarRisk / riskPerShare);
    if (shares <= 0) return null;

    const positionValue = shares * entry;
    const pctOfAccount = (positionValue / account) * 100;

    let riskReward: number | null = null;
    let targetProfit: number | null = null;
    if (target && target > 0) {
      const rewardPerShare = isLong ? target - entry : entry - target;
      if (rewardPerShare > 0) {
        riskReward = rewardPerShare / riskPerShare;
        targetProfit = shares * rewardPerShare;
      }
    }

    return {
      shares,
      dollarRisk,
      riskPerShare,
      positionValue,
      pctOfAccount,
      isLong,
      riskReward,
      targetProfit,
    };
  }, [accountSize, riskPct, entryPrice, stopPrice, targetPrice]);

  return (
    <Layout>
      <SEO
        title="Radar | Position Calculator"
        description="Calculate your position size based on account size and risk tolerance."
      />
      <div className="max-w-lg mx-auto px-4 pt-4 pb-32">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(39,183,200,0.15)" }}
          >
            <Calculator className="w-5 h-5" style={{ color: "#27B7C8" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#F3EDE3]">Position Calculator</h1>
            <p className="text-xs text-[#F3EDE3]/40">Size your trades by risk, not by feel</p>
          </div>
        </div>

        {/* Inputs */}
        <Card className="p-4 space-y-4 bg-[#0D1117] border-white/5">
          {/* Account Size */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F3EDE3]/60">Account Size</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#F3EDE3]/40">$</span>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="10,000"
                value={accountSize}
                onChange={(e) => setAccountSize(e.target.value)}
                className="pl-7 bg-[#070B12] border-white/10 text-[#F3EDE3] placeholder:text-[#F3EDE3]/20"
              />
            </div>
          </div>

          {/* Risk % */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F3EDE3]/60">Risk per Trade</label>
            <div className="flex gap-2">
              {RISK_PRESETS.map((pct) => (
                <motion.button
                  key={pct}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setRiskPct(String(pct))}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold transition-colors"
                  style={{
                    background: parseFloat(riskPct) === pct ? "#27B7C8" : "rgba(255,255,255,0.05)",
                    color: parseFloat(riskPct) === pct ? "#070B12" : "#F3EDE3",
                    border: `1px solid ${parseFloat(riskPct) === pct ? "#27B7C8" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {pct}%
                </motion.button>
              ))}
              <Input
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="%"
                value={!RISK_PRESETS.includes(parseFloat(riskPct)) ? riskPct : ""}
                onChange={(e) => setRiskPct(e.target.value)}
                className="w-16 text-center bg-[#070B12] border-white/10 text-[#F3EDE3] placeholder:text-[#F3EDE3]/20 text-xs"
              />
            </div>
          </div>

          {/* Entry Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F3EDE3]/60">Entry Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#F3EDE3]/40">$</span>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="25.50"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="pl-7 bg-[#070B12] border-white/10 text-[#F3EDE3] placeholder:text-[#F3EDE3]/20"
              />
            </div>
          </div>

          {/* Stop-Loss Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F3EDE3]/60">Stop-Loss Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#F3EDE3]/40">$</span>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="24.00"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                className="pl-7 bg-[#070B12] border-white/10 text-[#F3EDE3] placeholder:text-[#F3EDE3]/20"
              />
            </div>
          </div>

          {/* Target Price (optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F3EDE3]/60">
              Target Price <span className="text-[#F3EDE3]/20">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#F3EDE3]/40">$</span>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="28.00"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="pl-7 bg-[#070B12] border-white/10 text-[#F3EDE3] placeholder:text-[#F3EDE3]/20"
              />
            </div>
          </div>
        </Card>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-3"
          >
            {/* Primary result */}
            <Card className="p-5 bg-gradient-to-br from-[#27B7C8]/10 to-[#27B7C8]/5 border-[#27B7C8]/30">
              <div className="text-center">
                <p className="text-xs text-[#F3EDE3]/50 mb-1">Shares to Buy</p>
                <p className="text-4xl font-bold text-[#27B7C8]">{result.shares.toLocaleString()}</p>
                <p className="text-xs text-[#F3EDE3]/40 mt-1">
                  {result.isLong ? "Long" : "Short"} position
                </p>
              </div>
            </Card>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3.5 bg-[#0D1117] border-white/5">
                <p className="text-[10px] text-[#F3EDE3]/40 mb-0.5">Dollar Risk</p>
                <p className="text-lg font-bold text-[#EF4444]">
                  ${result.dollarRisk.toFixed(2)}
                </p>
              </Card>
              <Card className="p-3.5 bg-[#0D1117] border-white/5">
                <p className="text-[10px] text-[#F3EDE3]/40 mb-0.5">Risk / Share</p>
                <p className="text-lg font-bold text-[#F3EDE3]">
                  ${result.riskPerShare.toFixed(2)}
                </p>
              </Card>
              <Card className="p-3.5 bg-[#0D1117] border-white/5">
                <p className="text-[10px] text-[#F3EDE3]/40 mb-0.5">Position Value</p>
                <p className="text-lg font-bold text-[#F3EDE3]">
                  ${result.positionValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </Card>
              <Card className="p-3.5 bg-[#0D1117] border-white/5">
                <p className="text-[10px] text-[#F3EDE3]/40 mb-0.5">% of Account</p>
                <p className="text-lg font-bold text-[#F3EDE3]">
                  {result.pctOfAccount.toFixed(1)}%
                </p>
              </Card>
            </div>

            {/* Risk:Reward */}
            {result.riskReward && result.targetProfit !== null && (
              <Card className="p-3.5 bg-[#0D1117] border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#F3EDE3]/40 mb-0.5">Risk : Reward</p>
                    <p className="text-lg font-bold text-[#49B06E]">
                      1 : {result.riskReward.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#F3EDE3]/40 mb-0.5">Target Profit</p>
                    <p className="text-lg font-bold text-[#49B06E]">
                      +${result.targetProfit.toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 mt-6 px-1">
          <Info className="w-3.5 h-3.5 text-[#F3EDE3]/20 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-[#F3EDE3]/20 leading-relaxed">
            This calculator is for educational purposes only. It does not constitute financial advice.
            Always manage your own risk and consult a licensed professional.
          </p>
        </div>
      </div>
    </Layout>
  );
}
