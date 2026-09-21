import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import {
  evaluateGapAndGo,
  evaluateHodBreakout,
  evaluateRedToGreen,
} from "@/lib/strategies";
import { fetchGainers, fetchQuotes } from "@/lib/marketData";

interface DiagnosticResult {
  timestamp: string;
  steps: {
    dataFetch: { status: string; data?: any; error?: string };
    strategyMatch: { status: string; matches?: any; error?: string };
    alertLogic: { status: string; triggered?: any; error?: string };
    notificationSend: { status: string; sent?: number; error?: string };
    databaseRecord: { status: string; records?: any; error?: string };
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const fmpKey = process.env.FMP_API_KEY;
  const finnhubKey = process.env.FINNHUB_API_KEY;

  if (!fmpKey && !finnhubKey) {
    return res.status(500).json({ error: "No API keys configured (need FMP_API_KEY or FINNHUB_API_KEY)" });
  }

  const result: DiagnosticResult = {
    timestamp: new Date().toISOString(),
    steps: {
      dataFetch: { status: "pending" },
      strategyMatch: { status: "pending" },
      alertLogic: { status: "pending" },
      notificationSend: { status: "pending" },
      databaseRecord: { status: "pending" },
    },
  };

  try {
    // STEP 1: Fetch market data (FMP → Finnhub fallback)
    console.log("STEP 1: Fetching market data...");

    try {
      const { gainers, source: gainersSource } = await fetchGainers(fmpKey, finnhubKey);

      const eligible = gainers.filter(
        (g: any) => g.price >= 1 && g.price <= 20 && g.changesPercentage >= 5 && g.volume > 50_000,
      );

      const testSymbols = eligible.slice(0, 5).map((g: any) => g.symbol);

      let quotes: any[] = [];
      if (testSymbols.length > 0) {
        const qResult = await fetchQuotes(testSymbols, fmpKey, finnhubKey);
        quotes = qResult.quotes;
      }

      result.steps.dataFetch = {
        status: gainers.length > 0 ? "success" : "empty",
        data: {
          source: gainersSource,
          fmpKeySet: !!fmpKey,
          finnhubKeySet: !!finnhubKey,
          totalGainers: gainers.length,
          eligible: eligible.length,
          testSymbols,
          quotes: quotes.map((q: any) => ({
            symbol: q.symbol,
            price: q.price,
            change: q.change,
            changePercent: q.changesPercentage,
            volume: q.volume,
            avgVolume: q.avgVolume,
            rvol: q.avgVolume > 0 ? Math.round((q.volume / q.avgVolume) * 10) / 10 : 0,
            open: q.open,
            previousClose: q.previousClose,
            dayHigh: q.dayHigh,
          })),
        },
      };

      console.log(`Data fetched via ${gainersSource}: ${gainers.length} gainers, ${eligible.length} eligible, testing ${testSymbols.length}`);
    } catch (error) {
      result.steps.dataFetch = { status: "failed", error: String(error) };
      console.error("Data fetch failed:", error);
    }

    // STEP 2: Run actual strategy evaluators against the data
    console.log("STEP 2: Running strategy evaluators...");

    const quotes = result.steps.dataFetch.data?.quotes;
    if (!quotes || quotes.length === 0) {
      result.steps.strategyMatch = { status: "no_data", error: "No quotes to evaluate" };
    } else {
      const matches: any[] = [];

      for (const q of quotes) {
        const gapResult = evaluateGapAndGo(
          {
            price: q.price,
            changesPercentage: q.changePercent,
            volume: q.volume,
            avgVolume: q.avgVolume,
            previousClose: q.previousClose,
            dayHigh: q.dayHigh,
            open: q.open,
          },
          null,
          false,
        );

        const hodResult = evaluateHodBreakout({
          price: q.price,
          dayHigh: q.dayHigh,
          volume: q.volume,
          avgVolume: q.avgVolume,
          changesPercentage: q.changePercent,
        });

        const r2gResult = evaluateRedToGreen({
          price: q.price,
          open: q.open,
          previousClose: q.previousClose,
          volume: q.volume,
          avgVolume: q.avgVolume,
        });

        matches.push({
          symbol: q.symbol,
          price: q.price,
          changePercent: q.changePercent,
          strategies: {
            "gap-and-go": { state: gapResult.state, score: gapResult.score, passed: gapResult.conditionsPassed, failed: gapResult.conditionsFailed, missing: gapResult.conditionsMissing, reason: gapResult.reason },
            "hod-breakout": { state: hodResult.state, score: hodResult.score, passed: hodResult.conditionsPassed, failed: hodResult.conditionsFailed, missing: hodResult.conditionsMissing, reason: hodResult.reason },
            "red-to-green": { state: r2gResult.state, score: r2gResult.score, passed: r2gResult.conditionsPassed, failed: r2gResult.conditionsFailed, reason: r2gResult.reason },
          },
        });
      }

      result.steps.strategyMatch = { status: "success", matches };
      console.log(`Strategy evaluation complete for ${matches.length} symbols`);
    }

    // STEP 3: Check alert logic — which strategies would trigger?
    console.log("STEP 3: Checking alert trigger logic...");

    const allMatches = result.steps.strategyMatch.matches || [];
    const triggered: any[] = [];

    for (const m of allMatches) {
      for (const [stratId, strat] of Object.entries(m.strategies) as [string, any][]) {
        if (strat.state === "ACTIVE" || strat.state === "NEAR_TRIGGER") {
          triggered.push({ symbol: m.symbol, strategy: stratId, state: strat.state, score: strat.score, reason: strat.reason });
        }
      }
    }

    result.steps.alertLogic = {
      status: triggered.length > 0 ? "success" : "no_triggers",
      triggered,
    };
    console.log(`${triggered.length} alerts would trigger`);

    // STEP 4: Check notification infrastructure
    console.log("STEP 4: Checking notification infrastructure...");

    try {
      const { data: tokens, error: tokenErr } = await supabase
        .from("notification_tokens")
        .select("id, user_id")
        .limit(5);

      result.steps.notificationSend = {
        status: tokenErr ? "error" : "checked",
        sent: tokens?.length ?? 0,
        error: tokenErr?.message,
      };
      console.log(tokenErr ? `Token check error: ${tokenErr.message}` : `Found ${tokens?.length ?? 0} notification tokens (sample)`);
    } catch (error) {
      result.steps.notificationSend = { status: "error", error: String(error) };
    }

    // STEP 5: Check database for alert storage
    console.log("STEP 5: Checking database tables...");

    const tableChecks: Record<string, string> = {};

    for (const table of ["notification_tokens", "profiles", "price_alerts", "subscriptions", "watchlist"] as const) {
      try {
        const { data, error } = await supabase.from(table).select("*").limit(1);
        tableChecks[table] = error ? `error: ${error.message}` : `exists (${data?.length ?? 0} sample rows)`;
      } catch {
        tableChecks[table] = "not accessible";
      }
    }

    result.steps.databaseRecord = {
      status: "checked",
      records: tableChecks,
    };
  } catch (error) {
    console.error("Diagnostic failed:", error);
    return res.status(500).json({ error: String(error), result });
  }

  console.log("\nDIAGNOSTIC COMPLETE\n", JSON.stringify(result, null, 2));
  res.status(200).json(result);
}
