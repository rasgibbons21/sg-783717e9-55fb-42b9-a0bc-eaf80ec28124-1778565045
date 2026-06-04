/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LockedFeatureModal } from "@/components/LockedFeatureModal";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { supabase } from "@/integrations/supabase/client";
import { marketService } from "@/services/marketService";
import { pansyAnalysisService } from "@/services/pansyAnalysisService";
import { notificationService } from "@/services/notificationService";
import { TrendingUp, TrendingDown, Plus, Trash2, Loader2, Bell, BellOff, Target, DollarSign, Calendar, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface WatchlistItem {
  ticker: string;
  quote: any;
  loading: boolean;
}

interface GoalsProfile {
  age: number;
  retirementAge: number;
  monthlyContribution: number;
  riskTolerance: string;
  investmentGoals: string[];
}

export default function Portfolio() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [riskTolerance, setRiskTolerance] = useState<string>("moderate");
  const [investmentGoals, setInvestmentGoals] = useState<string[]>(["growth"]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTicker, setNewTicker] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState<any[]>([]);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState("");
  const [alertThreshold, setAlertThreshold] = useState("5");
  const [showLockedFeatureModal, setShowLockedFeatureModal] = useState(false);
  const [userPlan, setUserPlan] = useState<"free" | "pro">("free");
  
  // Goals & Projections state
  const [activeTab, setActiveTab] = useState<"watchlist" | "goals">("watchlist");
  const [goalsProfile, setGoalsProfile] = useState<GoalsProfile>({
    age: 25,
    retirementAge: 65,
    monthlyContribution: 500,
    riskTolerance: "Moderate",
    investmentGoals: ["Retirement"],
  });
  const [projectionData, setProjectionData] = useState<any[]>([]);
  const [portfolioRecommendation, setPortfolioRecommendation] = useState<string>("");
  const [loadingProjection, setLoadingProjection] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/");
      return;
    }
    
    // Force fresh profile fetch - no cache
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    
    setUser(profile);
    
    // Check if user is Pro based on is_pro column or active subscription
    if (profile?.is_pro || profile?.subscription_status === "active") {
      setUserPlan("pro");
    } else {
      setUserPlan("free");
    }
    
    // Load user's profile data for goals - use defaults since these fields don't exist in profiles
    if (profile) {
      setGoalsProfile(prev => ({
        ...prev,
        riskTolerance: "Moderate",
        investmentGoals: ["Retirement"],
      }));
    }
    
    await loadWatchlist();
    await loadPriceAlerts();
  };

  const loadPriceAlerts = async () => {
    const session = await authService.getCurrentSession();
    if (!session) return;

    const alerts = await notificationService.getPriceAlerts(session.user.id);
    setPriceAlerts(alerts);
  };

  const loadWatchlist = async () => {
    try {
      const saved = localStorage.getItem("bloom_watchlist");
      const savedTickers = saved ? JSON.parse(saved) : ["AAPL", "GOOGL", "MSFT"];
      
      const items: WatchlistItem[] = savedTickers.map((ticker: string) => ({
        ticker,
        quote: null,
        loading: true,
      }));
      
      setWatchlist(items);

      for (let i = 0; i < items.length; i++) {
        const quote = await marketService.getRealTimeQuote(items[i].ticker);
        setWatchlist(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], quote, loading: false };
          return updated;
        });
      }
    } catch (error) {
      console.error("Error loading watchlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWatchlist = async () => {
    if (!newTicker.trim()) return;

    // Check if user is logged in
    if (!user) {
      setShowLockedFeatureModal(true);
      return;
    }

    const ticker = newTicker.trim().toUpperCase();
    
    if (watchlist.some(item => item.ticker === ticker)) {
      setNewTicker("");
      setIsAddingNew(false);
      return;
    }

    setIsAddingNew(true);
    try {
      const quote = await marketService.getRealTimeQuote(ticker);
      if (!quote) {
        alert("Invalid ticker symbol");
        setIsAddingNew(false);
        return;
      }

      const newItem: WatchlistItem = { ticker, quote, loading: false };
      const updatedList = [...watchlist, newItem];
      setWatchlist(updatedList);

      const tickers = updatedList.map(item => item.ticker);
      localStorage.setItem("bloom_watchlist", JSON.stringify(tickers));

      setNewTicker("");
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      alert("Failed to add ticker to watchlist");
    } finally {
      setIsAddingNew(false);
    }
  };

  const handleRemove = async (ticker: string) => {
    if (!user?.id) return;

    try {
      const updatedList = watchlist.filter((item) => item.ticker !== ticker);
      setWatchlist(updatedList);

      const tickers = updatedList.map(item => item.ticker);
      localStorage.setItem("bloom_watchlist", JSON.stringify(tickers));
    } catch (error) {
      console.error("Error removing from watchlist:", error);
    }
  };

  const handleCreateAlert = async () => {
    if (!user?.id || !selectedTicker || !alertThreshold) return;

    const threshold = parseFloat(alertThreshold);
    if (isNaN(threshold) || threshold <= 0) {
      window.alert("Please enter a valid percentage");
      return;
    }

    const newAlert = await notificationService.createPriceAlert(
      user.id,
      selectedTicker,
      "price_change",
      threshold
    );

    if (newAlert) {
      await loadPriceAlerts();
      setShowAlertDialog(false);
      setSelectedTicker("");
      setAlertThreshold("5");
    } else {
      window.alert("Failed to create price alert. Please try again.");
    }
  };

  const getAlertForTicker = (ticker: string) => {
    return priceAlerts.find(
      (alert) => alert.ticker === ticker && alert.alert_type === "price_change"
    );
  };

  const toggleAlert = async (alertId: string, enabled: boolean) => {
    const success = await notificationService.toggleAlert(alertId, enabled);
    if (success) {
      await loadPriceAlerts();
    }
  };

  const calculateProjections = async () => {
    setLoadingProjection(true);
    try {
      const yearsToRetirement = goalsProfile.retirementAge - goalsProfile.age;
      const monthlyContribution = goalsProfile.monthlyContribution;
      
      // Historical average returns based on risk tolerance
      const averageReturns: Record<string, number> = {
        Conservative: 0.06,  // 6% annual
        Moderate: 0.08,      // 8% annual
        Aggressive: 0.10,    // 10% annual
      };
      
      const annualReturn = averageReturns[goalsProfile.riskTolerance] || 0.08;
      const monthlyReturn = annualReturn / 12;
      
      // Calculate compound growth year by year
      const projections = [];
      let totalValue = 0;
      let totalContributions = 0;
      
      for (let year = 0; year <= yearsToRetirement; year++) {
        const currentAge = goalsProfile.age + year;
        const monthsInvested = year * 12;
        
        // Future value of annuity formula
        if (year === 0) {
          totalValue = 0;
          totalContributions = 0;
        } else {
          totalContributions = monthlyContribution * monthsInvested;
          totalValue = monthlyContribution * ((Math.pow(1 + monthlyReturn, monthsInvested) - 1) / monthlyReturn);
        }
        
        const compoundGrowth = totalValue - totalContributions;
        
        projections.push({
          year: currentAge,
          totalValue: Math.round(totalValue),
          contributions: Math.round(totalContributions),
          growth: Math.round(compoundGrowth),
        });
      }
      
      setProjectionData(projections);
      
      // Generate Pansy's portfolio recommendation
      const recommendation = await pansyAnalysisService.generatePortfolioRecommendation({
        age: goalsProfile.age,
        retirementAge: goalsProfile.retirementAge,
        monthlyContribution: goalsProfile.monthlyContribution,
        riskTolerance: goalsProfile.riskTolerance,
        investmentGoals: goalsProfile.investmentGoals,
      });
      
      setPortfolioRecommendation(recommendation.fullText);
    } catch (error) {
      console.error("Error calculating projections:", error);
    } finally {
      setLoadingProjection(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    const loadUserData = async () => {
      const user = await userService.getCurrentUser();
      if (user) {
        setUserData(user);
        // Default values since these fields don't exist in profiles
        setRiskTolerance('moderate');
        setInvestmentGoals(['growth']);
      }
      setIsLoading(false);
    };
    loadUserData();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <SEO title="Portfolio - Bloom" description="Track your investment watchlist" />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Portfolio - Bloom" description="Track stocks and plan your retirement goals" />
      
      <div className="container-full py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="font-serif text-4xl font-bold text-foreground">Your Portfolio</h1>
          <p className="text-muted-foreground text-lg">Track investments and plan for your future</p>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="watchlist" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Watchlist
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-2">
              <Target className="w-4 h-4" />
              Goals & Projections
            </TabsTrigger>
          </TabsList>

          {/* Watchlist Tab */}
          <TabsContent value="watchlist" className="space-y-6 mt-6">
            <Card className="p-5 bg-card border-border rounded-2xl">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && addToWatchlist()}
                  placeholder="Enter ticker (e.g., AAPL, VOO, SCHD)"
                  className="flex-1 px-4 py-3 bg-popover border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isAddingNew}
                />
                <Button
                  onClick={addToWatchlist}
                  disabled={!newTicker.trim() || isAddingNew}
                  className="gap-2 rounded-xl px-6 bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  {isAddingNew ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  Add
                </Button>
              </div>
            </Card>

            {watchlist.length === 0 ? (
              <Card className="p-12 bg-card border-border rounded-2xl text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                  <span className="text-3xl">📊</span>
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground mb-2">Your watchlist is empty</h3>
                  <p className="text-muted-foreground">Add some stocks above to start tracking them!</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {watchlist.map((item) => (
                  <Link
                    key={item.ticker}
                    href={`/stock/${item.ticker}`}
                    className="block"
                  >
                    <Card className="p-5 bg-card border-border rounded-2xl hover:border-accent/50 transition-all h-full">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-xl text-foreground">{item.ticker}</h3>
                              {item.loading ? (
                                <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                              ) : item.quote?.dp !== undefined ? (
                                <Badge
                                  className={`text-xs ${
                                    item.quote.dp >= 0
                                      ? "bg-primary/20 text-primary hover:bg-primary/20"
                                      : "bg-rose/20 text-rose hover:bg-rose/20"
                                  }`}
                                >
                                  {item.quote.dp >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                  {item.quote.dp >= 0 ? "+" : ""}{item.quote.dp.toFixed(2)}%
                                </Badge>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {(() => {
                              const alert = getAlertForTicker(item.ticker);
                              return alert ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleAlert(alert.id, !alert.enabled);
                                  }}
                                  className={
                                    alert.enabled
                                      ? "text-accent hover:text-accent/80"
                                      : "text-muted-foreground hover:text-foreground"
                                  }
                                >
                                  {alert.enabled ? (
                                    <Bell className="w-4 h-4" />
                                  ) : (
                                    <BellOff className="w-4 h-4" />
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedTicker(item.ticker);
                                    setShowAlertDialog(true);
                                  }}
                                  className="text-muted-foreground hover:text-accent"
                                >
                                  <Bell className="w-4 h-4" />
                                </Button>
                              );
                            })()}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemove(item.ticker);
                              }}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {item.loading ? (
                          <div className="h-10 w-24 bg-muted rounded animate-pulse" />
                        ) : item.quote ? (
                          <div className="space-y-1">
                            <p className="text-3xl font-bold text-foreground tabular-nums">
                              ${item.quote.c.toFixed(2)}
                            </p>
                            <div className="flex items-center gap-2">
                              {item.quote.d >= 0 ? (
                                <TrendingUp className="w-4 h-4 text-primary" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-rose" />
                              )}
                              <span className={`text-sm font-semibold tabular-nums ${item.quote.d >= 0 ? "text-primary" : "text-rose"}`}>
                                {item.quote.d >= 0 ? "+" : ""}{item.quote.d.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No data</span>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            <Card className="p-5 bg-accent/10 border-accent/30 rounded-2xl">
              <div className="flex gap-4">
                <img
                  src="/bloom-logo.png"
                  alt="Pansy"
                  className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 space-y-3">
                  <p className="text-sm text-foreground leading-relaxed">
                    <span className="font-semibold">Tip from Pansy:</span> Building a watchlist is a great way to research before you invest. Take your time, read the news, and see how stocks move over a few weeks! No rush girl 💛
                  </p>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-accent text-accent hover:bg-accent/10"
                    onClick={() => router.push("/discover")}
                  >
                    Discover More Stocks
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Goals & Projections Tab */}
          <TabsContent value="goals" className="space-y-6 mt-6">
            {/* Input Section */}
            <Card className="p-6 bg-card border-border rounded-2xl">
              <CardHeader className="px-0 pt-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-2xl">
                    🎯
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-foreground">Plan Your Future</CardTitle>
                    <p className="text-sm text-muted-foreground">See how compound growth builds your wealth over time</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 px-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-accent" />
                      Current Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      value={goalsProfile.age}
                      onChange={(e) => setGoalsProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 25 }))}
                      min="18"
                      max="80"
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retirement" className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-accent" />
                      Target Retirement Age
                    </Label>
                    <Input
                      id="retirement"
                      type="number"
                      value={goalsProfile.retirementAge}
                      onChange={(e) => setGoalsProfile(prev => ({ ...prev, retirementAge: parseInt(e.target.value) || 65 }))}
                      min="40"
                      max="100"
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="contribution" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-accent" />
                      Monthly Contribution
                    </Label>
                    <Input
                      id="contribution"
                      type="number"
                      value={goalsProfile.monthlyContribution}
                      onChange={(e) => setGoalsProfile(prev => ({ ...prev, monthlyContribution: parseInt(e.target.value) || 500 }))}
                      min="50"
                      step="50"
                      className="bg-background border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                      How much can you invest each month? Even small amounts grow significantly over time.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={calculateProjections}
                  disabled={loadingProjection}
                  className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl gap-2"
                  size="lg"
                >
                  {loadingProjection ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Pansy is analyzing your goals...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate My Retirement Plan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Projections Display */}
            {projectionData.length > 0 && (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 rounded-2xl">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Estimated Portfolio Value</p>
                      <p className="text-3xl font-bold text-foreground">
                        {formatCurrency(projectionData[projectionData.length - 1].totalValue)}
                      </p>
                      <p className="text-xs text-muted-foreground">At age {goalsProfile.retirementAge}</p>
                    </div>
                  </Card>

                  <Card className="p-5 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 rounded-2xl">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Contributions</p>
                      <p className="text-3xl font-bold text-foreground">
                        {formatCurrency(projectionData[projectionData.length - 1].contributions)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {goalsProfile.retirementAge - goalsProfile.age} years of investing
                      </p>
                    </div>
                  </Card>

                  <Card className="p-5 bg-gradient-to-br from-rose/10 to-rose/5 border-rose/20 rounded-2xl">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Growth from Compounding</p>
                      <p className="text-3xl font-bold text-foreground">
                        {formatCurrency(projectionData[projectionData.length - 1].growth)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        The power of compound interest 🚀
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Growth Chart */}
                <Card className="p-6 bg-[#0a0a0f] border-border rounded-2xl">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-xl text-foreground">Your Wealth Growth Curve</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Watch how compound interest accelerates your growth over time
                    </p>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={projectionData}>
                          <defs>
                            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3d7a54" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3d7a54" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="contributionGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#c8953a" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#c8953a" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2c" />
                          <XAxis 
                            dataKey="year" 
                            stroke="#8080a0"
                            label={{ value: 'Age', position: 'insideBottom', offset: -5, fill: '#8080a0' }}
                          />
                          <YAxis 
                            stroke="#8080a0"
                            tickFormatter={(value) => formatCurrency(value).replace('.00', '')}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1a1a1f',
                              border: '1px solid #2a2a3f',
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                            formatter={(value: number) => formatCurrency(value)}
                          />
                          <Area
                            type="monotone"
                            dataKey="contributions"
                            stroke="#c8953a"
                            strokeWidth={2}
                            fill="url(#contributionGradient)"
                            name="Total Contributions"
                          />
                          <Area
                            type="monotone"
                            dataKey="totalValue"
                            stroke="#3d7a54"
                            strokeWidth={3}
                            fill="url(#growthGradient)"
                            name="Portfolio Value"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Pansy's Portfolio Recommendation */}
                {portfolioRecommendation && (
                  <Card className="border-accent/20 bg-gradient-to-br from-accent/10 to-primary/5 rounded-2xl">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-2xl">
                          🌺
                        </div>
                        <div>
                          <CardTitle className="text-xl text-accent">Pansy's Portfolio Recommendation</CardTitle>
                          <p className="text-sm text-muted-foreground">Personalized ETF strategy for your goals</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-invert max-w-none">
                        <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                          {portfolioRecommendation}
                        </div>
                      </div>
                      <div className="mt-6 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground italic">
                          This is for educational purposes only and is not financial advice. Investing involves risk including possible loss of principal. Historical performance does not guarantee future results. Always do your own research and consult a financial professional before investing 🌸
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Behavioral Finance Tip */}
                <Card className="p-6 bg-gradient-to-br from-rose/10 to-rose/5 border-rose/20 rounded-2xl">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose to-accent flex items-center justify-center text-2xl flex-shrink-0">
                      💡
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-foreground text-lg">The Compound Interest Snowball</h3>
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        Compounding works like a snowball rolling downhill — slow at first, then accelerating as returns build on previous returns. The earlier you start, the bigger your snowball becomes. This is why consistency beats timing every single time 🌸
                      </p>
                      <p className="text-xs text-muted-foreground italic mt-4">
                        Your {formatCurrency(goalsProfile.monthlyContribution)}/month might not feel like much right now, but give it {goalsProfile.retirementAge - goalsProfile.age} years and watch it grow to {formatCurrency(projectionData[projectionData.length - 1].totalValue)}. That's the power of staying consistent 💛
                      </p>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Price Alert Dialog */}
        <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Set Price Alert for {selectedTicker}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Get notified when {selectedTicker} moves by this percentage in a single day
              </p>
              <div className="space-y-2">
                <Label htmlFor="threshold" className="text-foreground">
                  Price Change Threshold (%)
                </Label>
                <Input
                  id="threshold"
                  type="number"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  placeholder="5"
                  className="bg-background border-border text-foreground"
                  min="1"
                  max="50"
                  step="1"
                />
                <p className="text-xs text-muted-foreground">
                  You'll get a notification if the price moves up or down by {alertThreshold}% or more
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAlertDialog(false)}
                className="border-border text-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAlert}
                className="bg-primary hover:bg-primary/90"
              >
                Create Alert
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card className="p-4 bg-muted/50 border-border/50 rounded-2xl">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            This is educational content only and does not constitute financial advice. Bloom is not liable for any investment decisions or losses.
          </p>
        </Card>

        {/* Locked Feature Modal for Logged-Out Users */}
        <LockedFeatureModal
          isOpen={showLockedFeatureModal}
          onClose={() => setShowLockedFeatureModal(false)}
          featureName="your watchlist"
          featureDescription="Save stocks, track your favorites, and get price alerts — all free."
        />
      </div>
    </Layout>
  );
}