import { useEffect, useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CalendarDays, Sun, Moon, Clock, Loader2, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { EarningsEntry } from "./api/earnings-calendar";
import { trackEarningsView } from "@/lib/analytics";
import { TickerMark } from "@/components/TickerMark";

const haptic = (ms = 8) => {
  try { navigator?.vibrate?.(ms); } catch {}
};

const TIME_LABELS: Record<string, { label: string; icon: typeof Sun; color: string }> = {
  bmo: { label: "Pre-market", icon: Sun, color: "#F59E0B" },
  amc: { label: "After-close", icon: Moon, color: "#A855F7" },
  dmh: { label: "During hours", icon: Clock, color: "#27B7C8" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatRevenue(val: number | null) {
  if (val === null) return "—";
  const abs = Math.abs(val);
  if (abs >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `$${(val / 1e6).toFixed(0)}M`;
  return `$${val.toLocaleString()}`;
}

function isToday(dateStr: string) {
  return dateStr === new Date().toISOString().slice(0, 10);
}

export default function EarningsCalendarPage() {
  const [entries, setEntries] = useState<EarningsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { trackEarningsView(); }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/earnings-calendar");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setEntries(data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error loading earnings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, EarningsEntry[]>();
    for (const e of entries) {
      const arr = map.get(e.date) || [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [entries]);

  return (
    <Layout>
      <SEO
        title="Radar | Earnings Calendar"
        description="Upcoming earnings reports — know what's reporting before you trade."
      />
      <div className="max-w-lg mx-auto px-4 pt-4 pb-32">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.15)" }}
          >
            <CalendarDays className="w-5 h-5" style={{ color: "#F59E0B" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#F3EDE3]">Earnings Calendar</h1>
            <p className="text-xs text-[#F3EDE3]/40">Next 2 weeks of reports</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-3 mb-4 flex-wrap">
          {Object.entries(TIME_LABELS).map(([key, { label, color }]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[10px] text-[#F3EDE3]/40">{label}</span>
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="w-5 h-5 text-[#F59E0B] animate-spin" />
            <span className="text-sm text-[#F3EDE3]/50">Loading earnings…</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 px-4 py-3 text-sm text-[#ef4444]">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && entries.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-[#F59E0B]/10 flex items-center justify-center mb-4">
              <CalendarDays className="w-6 h-6 text-[#F59E0B]/60" />
            </div>
            <p className="text-sm font-medium text-[#F3EDE3]/50 mb-1">No upcoming earnings</p>
            <p className="text-xs text-[#F3EDE3]/30">Check back during earnings season.</p>
          </div>
        )}

        {/* Calendar */}
        {!loading && !error && grouped.map(([date, items], gi) => {
          const today = isToday(date);
          return (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.04 }}
              className="mb-4"
            >
              {/* Day header */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: today ? "#F59E0B" : "#F3EDE3" + "60" }}
                >
                  {formatDate(date)}
                </span>
                {today && (
                  <Badge className="bg-[#F59E0B]/20 text-[#F59E0B] text-[9px] px-1.5 py-0">
                    Today
                  </Badge>
                )}
                <span className="text-[10px] text-[#F3EDE3]/25 ml-auto">
                  {items.length} report{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Entries */}
              <Card
                className="overflow-hidden"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                {items.map((entry, i) => {
                  const timeMeta = TIME_LABELS[entry.time];
                  const TimeIcon = timeMeta?.icon;

                  return (
                    <Link key={entry.symbol + i} href={`/stock/${entry.symbol}`}>
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        onClick={() => haptic()}
                        className="flex items-center gap-3 px-3.5 py-3 transition-colors hover:bg-white/5"
                        style={{
                          borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        }}
                      >
                        {/* Time indicator */}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: timeMeta ? `${timeMeta.color}15` : "rgba(255,255,255,0.05)" }}
                        >
                          {TimeIcon ? (
                            <TimeIcon className="w-4 h-4" style={{ color: timeMeta.color }} />
                          ) : (
                            <Clock className="w-4 h-4 text-[#F3EDE3]/30" />
                          )}
                        </div>

                        <TickerMark ticker={entry.symbol} />

                        {/* Ticker + timing */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold font-mono text-[#F3EDE3]">
                              {entry.symbol}
                            </span>
                            {timeMeta && (
                              <span
                                className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                                style={{
                                  background: `${timeMeta.color}15`,
                                  color: timeMeta.color,
                                }}
                              >
                                {timeMeta.label}
                              </span>
                            )}
                          </div>

                          {/* EPS + Revenue estimates */}
                          <div className="flex items-center gap-3 mt-0.5">
                            {entry.epsEstimated !== null && (
                              <span className="text-[10px] text-[#F3EDE3]/35">
                                EPS est: ${entry.epsEstimated.toFixed(2)}
                              </span>
                            )}
                            {entry.revenueEstimated !== null && (
                              <span className="text-[10px] text-[#F3EDE3]/35">
                                Rev est: {formatRevenue(entry.revenueEstimated)}
                              </span>
                            )}
                            {entry.epsEstimated === null && entry.revenueEstimated === null && (
                              <span className="text-[10px] text-[#F3EDE3]/20">No estimates</span>
                            )}
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-[#F3EDE3]/15 flex-shrink-0" />
                      </motion.div>
                    </Link>
                  );
                })}
              </Card>
            </motion.div>
          );
        })}

        {/* Disclaimer */}
        <div className="mt-6 px-1">
          <p className="text-[10px] text-[#F3EDE3]/20 leading-relaxed">
            Earnings dates and estimates are provided by third-party data sources and may change.
            Always verify dates with official company filings before making trading decisions.
          </p>
        </div>
      </div>
    </Layout>
  );
}
