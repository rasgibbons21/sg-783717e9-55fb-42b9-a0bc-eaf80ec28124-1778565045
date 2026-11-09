import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { ActiveTradeCard } from "@/components/ActiveTradeCard";
import { ChartStage, type Levels } from "@/components/charts/ChartStage";
import { OrderTicket } from "@/components/OrderTicket";
import { RiskNote } from "@/components/RiskNote";
import { BloomMark } from "@/components/brand/BloomMark";
import { LISTED_INSTRUMENTS, getInstrument, type Instrument } from "@/config/instruments";
import { TIMEFRAMES, type SetupType, type Timeframe } from "@/config/setups";
import { useSubscription } from "@/contexts/SubscriptionContext";
import type { Candle } from "@/lib/charts/types";
import { toCandles } from "@/lib/practice/bars";
import { marketRestingMessage } from "@/lib/practice/marketHours";
import { marginFor } from "@/lib/practice/maths";
import { processScore } from "@/lib/practice/process";
import { exitReasonAt } from "@/lib/practice/stops";
import { parsePreselect } from "@/lib/practice/preselect";
import { money, practiceFetch, type PracticeAccount, type PracticeTrade } from "@/lib/practice/api";
import { cn } from "@/lib/utils";

const PRICE_REFRESH_MS = 30_000;
const BARS_SHOWN = 90;

function SignedOutCard() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 text-center">
      <div className="mx-auto w-fit">
        <BloomMark size={56} />
      </div>
      <h1 className="mt-4 text-4xl text-foreground">Practise what you just learned, with structure</h1>
      <p className="mt-3 text-base text-muted-foreground">Join free for a simulated account to plan trades on US stocks. No real money, ever.</p>
      <Link href="/onboarding" className="mt-6 inline-flex h-12 items-center rounded-full bg-primary px-7 font-semibold text-primary-foreground">
        Start free
      </Link>
    </div>
  );
}

function PracticeDesk() {
  const [instrument, setInstrument] = useState<Instrument>(LISTED_INSTRUMENTS[0]);
  const [account, setAccount] = useState<PracticeAccount | null>(null);
  const [trades, setTrades] = useState<PracticeTrade[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [marketOpen, setMarketOpen] = useState(true);
  const [priceProblem, setPriceProblem] = useState(false);
  const [charts, setCharts] = useState<Record<Timeframe, Candle[]>>({ Daily: [], "1H": [], "5m": [] });
  const [chartsLoaded, setChartsLoaded] = useState<Record<Timeframe, boolean>>({ Daily: false, "1H": false, "5m": false });
  const [timeframe, setTimeframe] = useState<Timeframe>("1H");
  const [planning, setPlanning] = useState(false);
  const [levels, setLevels] = useState<Levels>({});
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmingRestart, setConfirmingRestart] = useState(false);
  const closingIds = useRef(new Set<string>());
  const router = useRouter();
  const [initialSetup, setInitialSetup] = useState<SetupType | undefined>();

  // A lesson or an idea can open Practice with a stock, timeframe and setup already picked.
  useEffect(() => {
    if (!router.isReady) return;
    const picked = parsePreselect(router.query);
    const stock = picked.symbol ? getInstrument(picked.symbol) : undefined;
    if (stock) setInstrument(stock);
    if (picked.timeframe) setTimeframe(picked.timeframe);
    if (picked.setup) setInitialSetup(picked.setup);
    // Applied once, when the address is ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const open = trades.filter((trade) => trade.status === "open");
  const closed = trades.filter((trade) => trade.status === "closed");

  const loadAccount = useCallback(async () => {
    const [accountRes, tradesRes] = await Promise.all([
      practiceFetch<{ account: PracticeAccount }>("/api/practice/account"),
      practiceFetch<{ trades: PracticeTrade[] }>("/api/practice/trades"),
    ]);
    if (accountRes.ok) setAccount(accountRes.data.account);
    if (tradesRes.ok) setTrades(tradesRes.data.trades ?? []);
    if (!accountRes.ok) setNotice("We couldn't load your practice account just now. Please refresh in a moment.");
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const closeTrade = useCallback(
    async (trade: PracticeTrade, reason: string) => {
      if (closingIds.current.has(trade.id)) return;
      closingIds.current.add(trade.id);
      const { ok, status, data } = await practiceFetch("/api/practice/close", {
        method: "POST",
        body: JSON.stringify({ trade_id: trade.id, exit_reason: reason }),
      });
      closingIds.current.delete(trade.id);
      if (ok) {
        setNotice(reason === "Stopped out" ? "Your stop closed a trade. That's your plan doing its job." : "Your trade is closed and added to your results.");
        await loadAccount();
      } else {
        setNotice(status === 409 ? marketRestingMessage(trade.ticker) : (data.error ?? "We couldn't close that just now. Your trade is safe, so please try again."));
      }
    },
    [loadAccount],
  );

  // Refresh prices for the chosen stock and every open trade, closing any that reached their stop or target.
  const openRef = useRef(open);
  openRef.current = open;
  const refreshPrices = useCallback(async () => {
    const symbols = [...new Set([instrument.symbol, ...openRef.current.map((trade) => trade.ticker)])];
    const results = await Promise.all(
      symbols.map(async (symbol) => [symbol, await practiceFetch<{ price: number; marketOpen: boolean }>(`/api/practice/quote?ticker=${symbol}`)] as const),
    );
    const next: Record<string, number> = {};
    const tradable = new Set<string>();
    for (const [symbol, result] of results) {
      if (result.ok) next[symbol] = result.data.price;
      if (result.ok && result.data.marketOpen) tradable.add(symbol);
      if (symbol === instrument.symbol) {
        setPriceProblem(!result.ok);
        if (result.ok) setMarketOpen(result.data.marketOpen);
      }
    }
    setPrices((current) => ({ ...current, ...next }));
    for (const trade of openRef.current) {
      const price = next[trade.ticker];
      if (price == null || !tradable.has(trade.ticker) || !getInstrument(trade.ticker)) continue;
      const reason = exitReasonAt(
        { direction: trade.direction, stop_price: trade.stop_price == null ? null : Number(trade.stop_price), target_price: trade.target_price == null ? null : Number(trade.target_price) },
        price,
      );
      if (reason) closeTrade(trade, reason);
    }
  }, [closeTrade, instrument.symbol]);

  useEffect(() => {
    refreshPrices();
    const timer = setInterval(refreshPrices, PRICE_REFRESH_MS);
    return () => clearInterval(timer);
  }, [refreshPrices]);

  // Load all three timeframes for the chosen stock.
  useEffect(() => {
    let active = true;
    setCharts({ Daily: [], "1H": [], "5m": [] });
    setChartsLoaded({ Daily: false, "1H": false, "5m": false });
    setLevels({});
    setPlanning(false);
    for (const label of TIMEFRAMES) {
      practiceFetch<{ bars: { time: string | number; open: number; high: number; low: number; close: number; volume: number }[] }>(
        `/api/practice/ohlc?ticker=${instrument.symbol}&timeframe=${encodeURIComponent(label)}`,
      ).then(({ ok, data }) => {
        if (!active) return;
        if (ok) setCharts((current) => ({ ...current, [label]: toCandles(data.bars ?? []).slice(-BARS_SHOWN) }));
        setChartsLoaded((current) => ({ ...current, [label]: true }));
      });
    }
    return () => {
      active = false;
    };
  }, [instrument.symbol]);

  const startAgain = async () => {
    const { ok, data } = await practiceFetch("/api/practice/account", { method: "POST" });
    setConfirmingRestart(false);
    setNotice(ok ? "You're starting afresh with your full simulated balance. Past results stay on your record." : (data.error ?? "We couldn't start again just now. Please try again."));
    if (ok) await loadAccount();
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Loading" />
      </div>
    );
  }

  const cash = Number(account?.cash_balance ?? 0);
  const reserved = open.reduce((sum, trade) => sum + marginFor(trade.ticker, Number(trade.entry_price), Number(trade.shares)), 0);
  const balance = cash + reserved;
  const price = prices[instrument.symbol] ?? null;
  const totalResult = closed.reduce((sum, trade) => sum + Number(trade.pnl ?? 0), 0);
  const scored = closed.filter((trade) => trade.setup_type);
  const averageProcess = scored.length ? Math.round(scored.reduce((sum, trade) => sum + processScore(trade), 0) / scored.length) : null;
  const visible = charts[timeframe];

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-6">
      <header>
        <h1 className="text-4xl leading-tight text-foreground">Practise what you just learned, with structure</h1>
        <p className="mt-2 text-base text-muted-foreground">Simulated money on real US stocks. What matters here is the quality of your plan.</p>
      </header>

      <section className="grid grid-cols-3 gap-3 rounded-3xl border border-[var(--bloom-rule)] bg-card p-5">
        <div>
          <p className="text-xs text-muted-foreground">Simulated balance</p>
          <p className="font-serif text-2xl text-foreground">{money(balance)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Results</p>
          <p className={cn("font-serif text-2xl", totalResult >= 0 ? "text-[var(--bloom-sage)]" : "text-[var(--bloom-blush)]")}>
            {totalResult >= 0 ? "+" : "-"}
            {money(Math.abs(totalResult))}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Average process</p>
          <p className="font-serif text-2xl text-[var(--bloom-gold)]">{averageProcess ?? "-"}</p>
        </div>
      </section>

      {notice && (
        <p role="status" className="rounded-2xl bg-accent p-4 text-base text-foreground">
          {notice}
        </p>
      )}

      <section aria-label="Choose a stock">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
          {LISTED_INSTRUMENTS.map((item) => (
            <motion.button
              key={item.symbol}
              whileTap={{ scale: 0.95 }}
              aria-pressed={item.symbol === instrument.symbol}
              onClick={() => setInstrument(item)}
              className={cn(
                "h-10 shrink-0 rounded-full border px-4 text-sm font-medium",
                item.symbol === instrument.symbol ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground",
              )}
            >
              {item.symbol}
            </motion.button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-2xl text-foreground">{instrument.name}</h2>
            <p className="text-sm text-muted-foreground">{instrument.plainName}</p>
          </div>
          <p className="font-serif text-2xl text-foreground">{price != null ? `$${price.toFixed(instrument.decimals)}` : "..."}</p>
        </div>
        {priceProblem && <p className="text-sm text-foreground">We can&apos;t get a price just now. We&apos;ll keep trying, and nothing can be charged in the meantime.</p>}
        {!marketOpen && <p className="text-sm text-foreground">{marketRestingMessage(instrument.symbol)}</p>}

        {visible.length > 0 ? (
          <ChartStage
            timeframes={TIMEFRAMES.map((label) => ({ label, candles: charts[label] }))}
            initialTimeframe={timeframe}
            onTimeframeChange={(label) => setTimeframe(label as Timeframe)}
            mode={planning ? "placeLevels" : "view"}
            levels={levels}
            onLevelsChange={setLevels}
            caption={`${instrument.symbol} · ${timeframe}`}
          />
        ) : (
          <div className="rounded-3xl border border-[var(--bloom-rule)] bg-card p-4">
            <div className="mb-3 grid grid-flow-col gap-1 rounded-full bg-secondary p-1" role="tablist" aria-label="Timeframe">
              {TIMEFRAMES.map((label) => (
                <button
                  key={label}
                  type="button"
                  role="tab"
                  aria-selected={timeframe === label}
                  onClick={() => setTimeframe(label)}
                  className={cn("h-9 rounded-full text-sm font-medium", timeframe === label ? "bg-[var(--bloom-gold)] text-[var(--bloom-ink)]" : "text-[var(--bloom-muted)]")}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="flex h-[200px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
              {!chartsLoaded[timeframe]
                ? "Loading the chart..."
                : timeframe === "Daily"
                  ? "The chart will appear here when prices are available."
                  : "This timeframe isn't available right now. Try Daily."}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setPlanning((value) => !value);
            if (planning) setLevels({});
          }}
          disabled={visible.length === 0}
          className="h-11 rounded-full border border-primary px-5 text-sm font-semibold text-[var(--bloom-gold)] transition-transform active:scale-95 disabled:opacity-40"
        >
          {planning ? "Clear the plan from the chart" : "Plan on chart"}
        </button>
        {planning && <p className="text-sm text-muted-foreground">Drag the Entry, Stop and Target lines. The stop and target fill the plan below.</p>}
      </section>

      <OrderTicket instrument={instrument} price={price} marketOpen={marketOpen} buyingPower={cash} balance={balance} levels={levels} timeframe={timeframe} onPlaced={loadAccount} initialSetup={initialSetup} />

      <section aria-label="Open trades">
        <h2 className="text-2xl text-foreground">Open trades</h2>
        {open.length === 0 ? (
          <p className="mt-2 text-base text-muted-foreground">Nothing open yet. Plan one trade carefully, with a stop, and see how it plays out.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {open.map((trade) => (
              <ActiveTradeCard key={trade.id} trade={trade} currentPrice={prices[trade.ticker] ?? null} onClose={closeTrade} />
            ))}
          </div>
        )}
        {open.length > 0 && <p className="mt-2 text-sm text-muted-foreground">Stops and targets are checked while this screen is open.</p>}
      </section>

      <section aria-label="Past trades">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl text-foreground">Past trades</h2>
          <Link href="/journal" className="text-sm font-semibold text-[var(--bloom-gold)] underline underline-offset-4">
            My journal
          </Link>
        </div>
        {closed.length === 0 ? (
          <p className="mt-2 text-base text-muted-foreground">
            Your closed trades gather here and count towards the{" "}
            <Link href="/leaderboard" className="underline underline-offset-2">Practice gains leaderboard</Link>.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--bloom-rule)] rounded-3xl border border-[var(--bloom-rule)] bg-card px-4">
            {closed.slice(0, 20).map((trade) => {
              const pnl = Number(trade.pnl ?? 0);
              return (
                <li key={trade.id} className="flex items-center justify-between gap-3 py-3">
                  <span>
                    <span className="block font-medium text-foreground">
                      {getInstrument(trade.ticker)?.symbol ?? trade.ticker}
                      {trade.setup_type ? ` · ${trade.setup_type}` : ""}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {trade.direction === "long" ? "Bought" : "Sold"}
                      {trade.timeframe ? ` on the ${trade.timeframe}` : ""}
                      {trade.exit_reason ? ` · ${trade.exit_reason}` : ""}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className={cn("block font-semibold", pnl >= 0 ? "text-[var(--bloom-sage)]" : "text-[var(--bloom-blush)]")}>
                      {pnl >= 0 ? "+" : "-"}
                      {money(Math.abs(pnl))}
                    </span>
                    {trade.setup_type && <span className="block text-xs text-muted-foreground">Process {processScore(trade)}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border border-[var(--bloom-rule)] p-5" aria-label="Start again">
        <h2 className="text-xl text-foreground">Want a fresh start?</h2>
        <p className="mt-1 text-base text-muted-foreground">You can restore your simulated balance at any time. Open trades close with no result, and past results stay on your record.</p>
        {confirmingRestart ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={startAgain} className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95">
              Yes, start again
            </button>
            <button onClick={() => setConfirmingRestart(false)} className="h-11 rounded-full border border-border px-5 text-sm font-medium text-foreground">
              Keep going
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmingRestart(true)} className="mt-3 h-11 rounded-full border border-primary px-5 text-sm font-semibold text-[var(--bloom-gold)] transition-transform active:scale-95">
            Start again
          </button>
        )}
      </section>

      <RiskNote />
    </div>
  );
}

export default function PracticePage() {
  const { isLoggedIn, isLoading } = useSubscription();

  return (
    <>
      <SEO title="Practice - Bloom" description="Plan and practise trades on US stocks with simulated money and a process score." />
      <Layout>
        {isLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Loading" />
          </div>
        ) : isLoggedIn ? (
          <PracticeDesk />
        ) : (
          <SignedOutCard />
        )}
      </Layout>
    </>
  );
}
