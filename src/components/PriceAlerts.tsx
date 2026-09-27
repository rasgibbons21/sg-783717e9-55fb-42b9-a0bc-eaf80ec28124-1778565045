import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { notificationService } from "@/services/notificationService";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Trash2, ChevronDown, ChevronUp, Plus } from "lucide-react";

interface PriceAlert {
  id: string;
  ticker: string;
  alert_type: string;
  threshold: number;
  enabled: boolean;
  last_triggered_at: string | null;
}

interface PriceAlertsProps {
  ticker: string;
  currentPrice: number;
}

export function PriceAlerts({ ticker, currentPrice }: PriceAlertsProps) {
  const { isLoggedIn, userId, entitlements } = useSubscription();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [isAdding, setIsAdding] = useState(false);
  const [totalAlerts, setTotalAlerts] = useState(0);

  const loadAlerts = useCallback(async () => {
    if (!userId) return;
    const all = await notificationService.getPriceAlerts(userId);
    setTotalAlerts(all.length);
    setAlerts(all.filter((a: PriceAlert) => a.ticker === ticker));
  }, [userId, ticker]);

  useEffect(() => {
    if (isLoggedIn && userId) loadAlerts();
  }, [isLoggedIn, userId, loadAlerts]);

  const handleAdd = async () => {
    if (!userId || !targetPrice) return;
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) return;

    if (totalAlerts >= entitlements.maxAlerts) return;

    setIsAdding(true);
    const threshold = direction === "above" ? price : -price;
    await notificationService.createPriceAlert(userId, ticker, "target_price", threshold);
    setTargetPrice("");
    await loadAlerts();
    setIsAdding(false);
  };

  const handleToggle = async (alertId: string, enabled: boolean) => {
    await notificationService.toggleAlert(alertId, !enabled);
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleDelete = async (alertId: string) => {
    await notificationService.deleteAlert(alertId);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    setTotalAlerts((prev) => prev - 1);
  };

  if (!isLoggedIn) return null;

  const atLimit = totalAlerts >= entitlements.maxAlerts;
  const tickerAlerts = alerts;

  return (
    <Card className="bg-[#0D1117] border-white/5 overflow-hidden">
      {/* Header — always visible */}
      <motion.button
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(39,183,200,0.15)" }}
          >
            <Bell className="w-4 h-4" style={{ color: "#27B7C8" }} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[#F3EDE3]">Price Alerts</p>
            <p className="text-[10px] text-[#F3EDE3]/40">
              {tickerAlerts.length > 0
                ? `${tickerAlerts.length} alert${tickerAlerts.length > 1 ? "s" : ""} set`
                : "Get notified when price moves"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {tickerAlerts.length > 0 && (
            <Badge className="bg-[#27B7C8]/20 text-[#27B7C8] text-[10px]">
              {tickerAlerts.filter((a) => a.enabled).length} active
            </Badge>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-[#F3EDE3]/30" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#F3EDE3]/30" />
          )}
        </div>
      </motion.button>

      {/* Expandable content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {/* Add new alert */}
              <div className="pt-3 space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setDirection("above")}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    style={{
                      background: direction === "above" ? "#49B06E" : "rgba(255,255,255,0.05)",
                      color: direction === "above" ? "#070B12" : "#F3EDE3",
                      border: `1px solid ${direction === "above" ? "#49B06E" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    Above
                  </button>
                  <button
                    onClick={() => setDirection("below")}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    style={{
                      background: direction === "below" ? "#EF4444" : "rgba(255,255,255,0.05)",
                      color: direction === "below" ? "#fff" : "#F3EDE3",
                      border: `1px solid ${direction === "below" ? "#EF4444" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    Below
                  </button>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#F3EDE3]/40">$</span>
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      placeholder={currentPrice.toFixed(2)}
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      className="pl-7 bg-[#070B12] border-white/10 text-[#F3EDE3] placeholder:text-[#F3EDE3]/20 h-9 text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleAdd}
                    disabled={isAdding || !targetPrice || atLimit}
                    className="h-9 px-3 bg-[#27B7C8] hover:bg-[#27B7C8]/90 text-[#070B12] font-semibold text-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {atLimit && (
                  <p className="text-[10px] text-[#EF4444]">
                    Alert limit reached ({entitlements.maxAlerts}). Upgrade for more.
                  </p>
                )}

                <p className="text-[10px] text-[#F3EDE3]/25">
                  Current: ${currentPrice.toFixed(2)} — alerts fire once then auto-disable
                </p>
              </div>

              {/* Existing alerts */}
              {tickerAlerts.length > 0 && (
                <div className="space-y-1.5">
                  {tickerAlerts.map((alert) => {
                    const isAbove = alert.threshold > 0;
                    const target = Math.abs(alert.threshold);
                    const pctAway = ((target - currentPrice) / currentPrice * 100);

                    return (
                      <motion.div
                        key={alert.id}
                        layout
                        className="flex items-center gap-2 py-2 px-3 rounded-lg"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                              style={{
                                background: isAbove ? "rgba(73,176,110,0.15)" : "rgba(239,68,68,0.15)",
                                color: isAbove ? "#49B06E" : "#EF4444",
                              }}
                            >
                              {isAbove ? "ABOVE" : "BELOW"}
                            </span>
                            <span className="text-sm font-bold text-[#F3EDE3]">
                              ${target.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-[#F3EDE3]/30">
                              ({pctAway > 0 ? "+" : ""}{pctAway.toFixed(1)}%)
                            </span>
                          </div>
                          {alert.last_triggered_at && (
                            <p className="text-[10px] text-[#F3EDE3]/25 mt-0.5">
                              Triggered {new Date(alert.last_triggered_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleToggle(alert.id, alert.enabled)}
                          className="p-1.5 rounded-md transition-colors"
                          style={{ background: "rgba(255,255,255,0.05)" }}
                        >
                          {alert.enabled ? (
                            <Bell className="w-3.5 h-3.5 text-[#27B7C8]" />
                          ) : (
                            <BellOff className="w-3.5 h-3.5 text-[#F3EDE3]/30" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDelete(alert.id)}
                          className="p-1.5 rounded-md transition-colors"
                          style={{ background: "rgba(255,255,255,0.05)" }}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#EF4444]/60" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
