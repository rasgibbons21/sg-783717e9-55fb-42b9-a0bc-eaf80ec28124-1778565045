import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { ActiveTradeCard } from "@/components/ActiveTradeCard";
import DynamicChart, { type OHLCBar } from "@/components/DynamicChart";
import { OrderTicket } from "@/components/OrderTicket";
import { RiskNote } from "@/components/RiskNote";
import { Botanical } from "@/components/brand/Botanical";
import { INSTRUMENTS, getInstrument, type Instrument } from "@/config/instruments";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { marketRestingMessage } from "@/lib/practice/marketHours";
import { marginFor } from "@/lib/practice/maths";
import { exitReasonAt } from "@/lib/practice/stops";
import { money, practiceFetch, type PracticeAccount, type PracticeTrade } from "@/lib/practice/api";
import { cn } from "@/lib/utils";

const PRICE_REFRESH_MS = 30_000;

function SignedOutCard() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 text-center">
      <Botanical variant="bloom" className="mx-auto h-24 w-24" />
      <h1 className="mt-3 text-3xl font-semibold text-foreground">Practise what you just learned, safely</h1>
      <p className="mt-2 text-base text-muted-foreground">Join free and get a simulated account to try gold and other markets. No real money, ever.</p>
      <Link href="/onboarding" className="mt-5 inline-flex h-12 items-center rounded-full bg-primary px-7 font-semibold text-primary-foreground">
        Start free
      </Link>
    </div>
  );
}

function PracticeDesk() {
  const [instrument, setInstrument] = useState<Instrument>(INSTRUMENTS[0]);
  const [account, setAccount] = useState<PracticeAccount | null>(null);
  const [trades, setTrades] = useState<PracticeTrade[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [marketOpen, setMarketOpen] = useState(true);
  const [priceProblem, setPriceProblem] = useState(false);
  const [bars, setBars] = useState<OHLCBar[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmingRestart, setConfirmingRestart] = useState(false);
  const closingIds = useRef(new Set<string>());

  const open = trades.filter((trade) => trade.status === "open");
  const closed = trades.filter((trade) => trade.status === "closed");

  const loadAccount = useCallback(async () => {
    const [accountRes, tradesRes] = await Promise.all([
      practiceFetch<{ account: PracticeAccount }>("/api/practice/account"),
      practiceFetch<{ trades: PracticeTrade[] }>("/api/practice/trades"),
    ]);
    if (accountRes.ok) setAccount(accountRes.data.account);
    if (tradesRes.ok) setTrades(tradesRes.data.trades ?? []);
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

  // Refresh prices for the chosen instrument and every open trade, closing any that reached their stop or target.
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

  useEffect(() => {
    let active = true;
    setBars([]);
    practiceFetch<{ bars: OHLCBar[] }>(`/api/practice/ohlc?ticker=${instrument.symbol}&timeframe=daily`).then(({ ok, data }) => {
      if (active && ok) setBars((data.bars ?? []).slice(-90));
    });
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

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <header>
        <h1 className="text-3xl font-semibold leading-tight text-foreground">Practise what you just learned, safely</h1>
        <p className="mt-1 text-base text-muted-foreground">This is simulated money, so every mistake here is free.</p>
      </header>

      <section className="grid grid-cols-2 gap-3 rounded-3xl bg-secondary p-5">
        <div>
          <p className="text-sm text-muted-foreground">Simulated balance</p>
          <p className="font-serif text-2xl font-semibold text-foreground">{money(balance)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Results so far</p>
          <p className={cn("font-serif text-2xl font-semibold", totalResult >= 0 ? "text-primary" : "text-[#8A5B44]")}>
            {totalResult >= 0 ? "+" : "-"}
            {money(Math.abs(totalResult))}
          </p>
        </div>
      </section>

      {notice && (
        <p role="status" className="rounded-2xl bg-accent/70 p-4 text-base text-foreground">
          {notice}
        </p>
      )}

      <section aria-label="Choose what to practise">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
          {INSTRUMENTS.map((item) => (
            <motion.button
              key={item.symbol}
              whileTap={{ scale: 0.95 }}
              aria-pressed={item.symbol === instrument.symbol}
              onClick={() => setInstrument(item)}
              className={cn(
                "h-10 shrink-0 rounded-full border px-4 text-sm font-medium",
                item.symbol === instrument.symbol ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground",
              )}
            >
              {item.name}
            </motion.button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-card p-5 shadow-[var(--bloom-shadow)]">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{instrument.name}</h2>
            <p className="text-sm text-muted-foreground">{instrument.plainName}</p>
          </div>
          <p className="font-serif text-2xl font-semibold text-foreground">{price != null ? price.toFixed(instrument.decimals) : "..."}</p>
        </div>
        {priceProblem && <p className="mt-2 text-sm text-foreground">We can&apos;t get a price just now. We&apos;ll keep trying, and nothing can be charged in the meantime.</p>}
        {!marketOpen && <p className="mt-2 text-sm text-foreground">{marketRestingMessage(instrument.symbol)}</p>}
        <div className="mt-3 overflow-hidden rounded-2xl">
          {bars.length > 0 ? (
            <DynamicChart data={bars} height={220} />
          ) : (
            <div className="flex h-[220px] items-center justify-center bg-secondary px-6 text-center text-sm text-muted-foreground">The chart will appear here when prices are available.</div>
          )}
        </div>
      </section>

      <OrderTicket instrument={instrument} price={price} marketOpen={marketOpen} buyingPower={cash} balance={balance} onPlaced={loadAccount} />

      <section aria-label="Open trades">
        <h2 className="text-2xl font-semibold text-foreground">Open trades</h2>
        {open.length === 0 ? (
          <p className="mt-2 text-base text-muted-foreground">Nothing open yet. A tiny gold trade with a stop is a lovely place to begin.</p>
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
          <h2 className="text-2xl font-semibold text-foreground">Past trades</h2>
          <Link href="/journal" className="text-sm font-semibold text-primary underline underline-offset-2">
            My journal
          </Link>
        </div>
        {closed.length === 0 ? (
          <p className="mt-2 text-base text-muted-foreground">
            Your closed trades will gather here and count towards the{" "}
            <Link href="/leaderboard" className="underline underline-offset-2">Practice gains leaderboard</Link>.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border rounded-3xl bg-card px-4">
            {closed.slice(0, 20).map((trade) => {
              const pnl = Number(trade.pnl ?? 0);
              return (
                <li key={trade.id} className="flex items-center justify-between gap-3 py-3">
                  <span>
                    <span className="block font-medium text-foreground">{getInstrument(trade.ticker)?.name ?? trade.ticker}</span>
                    <span className="block text-sm text-muted-foreground">{trade.direction === "long" ? "Bought" : "Sold"}{trade.exit_reason ? ` · ${trade.exit_reason}` : ""}</span>
                  </span>
                  <span className={cn("font-semibold", pnl >= 0 ? "text-primary" : "text-[#8A5B44]")}>
                    {pnl >= 0 ? "+" : "-"}
                    {money(Math.abs(pnl))}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border border-border p-5" aria-label="Start again">
        <h2 className="text-lg font-semibold text-foreground">Want a fresh start?</h2>
        <p className="mt-1 text-base text-muted-foreground">You can restore your simulated balance at any time. Open trades will close with no result, and past results stay on your record.</p>
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
          <button onClick={() => setConfirmingRestart(true)} className="mt-3 h-11 rounded-full border border-primary px-5 text-sm font-semibold text-primary transition-transform active:scale-95">
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
      <SEO title="Practice - Bloom" description="Practise gold and other markets safely, with simulated money." />
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
