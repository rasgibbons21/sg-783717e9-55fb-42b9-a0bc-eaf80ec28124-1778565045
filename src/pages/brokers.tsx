import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import {
  CATEGORIES,
  getEnabledBrokers,
  getBrokersByCategory,
  type BrokerConfig,
} from "@/config/brokers";
import BrokerCard from "@/components/BrokerCard";
import BrokerDetailModal from "@/components/BrokerDetailModal";
import BrokerComparisonTable from "@/components/BrokerComparisonTable";
import BrokerHubDisclaimer from "@/components/BrokerHubDisclaimer";
import BrokerEducationCards from "@/components/BrokerEducationCards";
import OpenBrokerageGuide from "@/components/OpenBrokerageGuide";
import FindMyBrokerWizard from "@/components/FindMyBrokerWizard";
import { useSavedBrokers } from "@/hooks/useSavedBrokers";
import { supabase } from "@/integrations/supabase/client";
import {
  Compass,
  LayoutGrid,
  Search,
  BarChart3,
  X,
  Bookmark,
} from "lucide-react";

type ViewMode = "all" | "wizard" | "saved";
type SortOption = "default" | "name" | "beginner";

const FILTER_CHIPS = [
  { key: "beginner", label: "Beginner Friendly" },
  { key: "demo", label: "Demo Available" },
  { key: "stocks", label: "Stocks" },
  { key: "forex", label: "Forex" },
  { key: "crypto", label: "Crypto" },
  { key: "cfds", label: "CFDs" },
] as const;

type FilterKey = (typeof FILTER_CHIPS)[number]["key"];

export default function Brokers() {
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [detailBroker, setDetailBroker] = useState<BrokerConfig | null>(null);
  const [compareList, setCompareList] = useState<BrokerConfig[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const { savedIds, toggleSave, isSignedIn } = useSavedBrokers();
  const allBrokers = getEnabledBrokers();

  const toggleFilter = (key: FilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const matchesFilters = useCallback(
    (broker: BrokerConfig) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const haystack = [
          broker.name,
          broker.shortDescription,
          ...broker.bestFor,
          ...broker.markets,
          broker.category,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      for (const f of activeFilters) {
        if (f === "beginner" && !broker.beginnerFriendly) return false;
        if (f === "demo" && !broker.paperTrading) return false;
        if (f === "stocks" && !broker.supportedAssets.stocks) return false;
        if (f === "forex" && !broker.supportedAssets.forex) return false;
        if (f === "crypto" && !broker.supportedAssets.crypto) return false;
        if (f === "cfds" && !broker.supportedAssets.cfds) return false;
      }

      return true;
    },
    [searchQuery, activeFilters]
  );

  const sortBrokers = useCallback(
    (list: BrokerConfig[]) => {
      const sorted = [...list];
      switch (sortBy) {
        case "name":
          sorted.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "beginner":
          sorted.sort((a, b) => (b.beginnerFriendly ? 1 : 0) - (a.beginnerFriendly ? 1 : 0));
          break;
        default:
          break;
      }
      return sorted;
    },
    [sortBy]
  );

  const handleCompare = useCallback((broker: BrokerConfig) => {
    setCompareList((prev) => {
      if (prev.find((b) => b.id === broker.id)) {
        return prev.filter((b) => b.id !== broker.id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, broker];
    });
  }, []);

  const compareIds = new Set(compareList.map((b) => b.id));

  const trackClick = () => {
    if (!detailBroker) return;
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        supabase.from("broker_clicks").insert({
          broker_name: detailBroker.name,
          user_id: session?.user?.id ?? null,
        });
      });
    } catch {}
  };

  const savedBrokers = allBrokers.filter((b) => savedIds.has(b.id));

  return (
    <Layout>
      <SEO
        title="Best Brokers for Beginners — Compare Brokerages | Bloom"
        description="Compare the best online brokers and trading platforms for beginner investors. Take the Find My Broker quiz to match with the right brokerage. See pros, cons, fees, and features side by side. Designed for women starting their investing journey."
      />
      <div className="container-full py-8 space-y-6 pb-24">
        {/* ─── Section 1: Header ─── */}
        <div className="space-y-3">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Find Your Right Broker
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Compare brokers and platforms to find the right fit for your goals.
            Every provider listed here has a confirmed partnership with Bloom.
          </p>
        </div>

        {/* Pansy guidance */}
        <Card className="p-6 bg-primary/5 border-primary/20 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-xl shrink-0">
              🌺
            </div>
            <div className="space-y-2 flex-1">
              <p className="font-semibold text-foreground">
                How to think about choosing a platform
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                The right platform depends on where you are in your journey and
                what you need. If you&apos;re just starting, look for
                educational resources and demo accounts. If you&apos;re more
                experienced, focus on execution speed, available markets, and
                the tools that fit your strategy. Always check terms, fees, and
                regional availability on the provider&apos;s website before
                opening an account.
              </p>
              <p className="text-sm font-medium text-primary">— Pansy 🌺</p>
            </div>
          </div>
        </Card>

        {/* ─── Section 2: Mode toggle ─── */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setViewMode("all")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              viewMode === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-border/50"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            All Platforms
          </button>
          <button
            onClick={() => setViewMode("wizard")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              viewMode === "wizard"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-border/50"
            }`}
          >
            <Compass className="w-4 h-4" />
            Find My Platform
          </button>
          {isSignedIn && (
            <button
              onClick={() => setViewMode("saved")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                viewMode === "saved"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-border/50"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Saved ({savedIds.size})
            </button>
          )}
        </div>

        {/* ─── Section 3: Wizard ─── */}
        {viewMode === "wizard" && (
          <FindMyBrokerWizard
            onViewDetail={setDetailBroker}
            onCompare={handleCompare}
            compareIds={compareIds}
            savedIds={savedIds}
            onToggleSave={isSignedIn ? toggleSave : undefined}
          />
        )}

        {/* ─── Section 4: Filter / Search / Sort (all & saved modes) ─── */}
        {viewMode !== "wizard" && (
          <>
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search brokers..."
                  className="w-full rounded-xl border border-border/50 bg-muted/20 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter chips + sort */}
              <div className="flex flex-wrap items-center gap-2">
                {FILTER_CHIPS.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() => toggleFilter(chip.key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      activeFilters.has(chip.key)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/30 text-muted-foreground border border-border/50 hover:bg-muted/50"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
                <div className="ml-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="rounded-lg border border-border/50 bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground focus:outline-none focus:border-primary/50"
                  >
                    <option value="default">Sort: Default</option>
                    <option value="name">Sort: Name</option>
                    <option value="beginner">Sort: Beginner First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ─── Section 5: Broker cards ─── */}
            {viewMode === "saved" ? (
              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  Saved Platforms
                </h2>
                {savedBrokers.length === 0 ? (
                  <Card className="p-8 text-center bg-card/80 border-border/50 rounded-2xl">
                    <Bookmark className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      No saved platforms yet. Tap the bookmark icon on any
                      platform to save it here.
                    </p>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {sortBrokers(savedBrokers.filter(matchesFilters)).map(
                      (broker) => (
                        <BrokerCard
                          key={broker.id}
                          broker={broker}
                          isSaved
                          onToggleSave={toggleSave}
                          onCompare={handleCompare}
                          isInCompare={compareIds.has(broker.id)}
                          onViewDetail={setDetailBroker}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-10">
                {CATEGORIES.map((category) => {
                  const items = sortBrokers(
                    getBrokersByCategory(category).filter(matchesFilters)
                  );
                  if (items.length === 0) return null;
                  return (
                    <section key={category} className="space-y-4">
                      <h2 className="font-serif text-2xl font-bold text-foreground">
                        {category}
                      </h2>
                      <div className="grid gap-6 md:grid-cols-2">
                        {items.map((broker) => (
                          <BrokerCard
                            key={broker.id}
                            broker={broker}
                            isSaved={savedIds.has(broker.id)}
                            onToggleSave={
                              isSignedIn ? toggleSave : undefined
                            }
                            onCompare={handleCompare}
                            isInCompare={compareIds.has(broker.id)}
                            onViewDetail={setDetailBroker}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ─── Section 6: How to open a brokerage account ─── */}
        <OpenBrokerageGuide />

        {/* ─── Section 7: Education cards ─── */}
        <BrokerEducationCards />

        {/* ─── Section 7: Disclosures ─── */}
        <BrokerHubDisclaimer />

        {/* Bottom disclaimer */}
        <Card className="p-4 bg-muted/50 border-border rounded-2xl">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            Check availability and terms on each provider&apos;s website. Bloom
            does not guarantee eligibility, rewards, or account approval. This
            page is for informational purposes only and is not financial advice.
          </p>
        </Card>
      </div>

      {/* ─── Compare tray ─── */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border shadow-2xl px-4 py-3 safe-area-pb">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <BarChart3 className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm font-semibold text-foreground truncate">
                {compareList.length} platform{compareList.length > 1 ? "s" : ""}{" "}
                selected
              </span>
              <div className="flex gap-1.5 ml-2">
                {compareList.map((b) => (
                  <span
                    key={b.id}
                    className="rounded-full bg-muted/50 border border-border/50 px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {b.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowComparison(true)}
                disabled={compareList.length < 2}
                className="rounded-xl bg-primary hover:bg-primary/90 px-4 py-2 text-sm font-semibold text-primary-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Compare
              </button>
              <button
                onClick={() => setCompareList([])}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                aria-label="Clear comparison"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Comparison modal ─── */}
      {showComparison && (
        <BrokerComparisonTable
          brokers={compareList}
          onRemove={(id) =>
            setCompareList((prev) => prev.filter((b) => b.id !== id))
          }
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* ─── Detail drawer ─── */}
      {detailBroker && (
        <BrokerDetailModal
          broker={detailBroker}
          onClose={() => setDetailBroker(null)}
          onTrackClick={trackClick}
        />
      )}
    </Layout>
  );
}
