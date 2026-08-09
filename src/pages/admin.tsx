import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, TrendingUp, DollarSign, Activity, BarChart3,
  Download, Mail, Settings, Target, Eye, BookOpen, Sparkles,
  ArrowUp, ArrowDown, ExternalLink, Lock, Loader2
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  overview: {
    totalUsers: number;
    signupsToday: number;
    signupsWeek: number;
    signupsMonth: number;
    signupsYear: number;
    proUsers: number;
    freeUsers: number;
    mrr: string;
  };
  brokers: Record<string, number>;
  stocks: [string, number][];
}

interface BrokerData {
  name: string;
  totalClicks: number;
  thisWeek: number;
  thisMonth: number;
  dailyClicks: Record<string, number>;
}

const COLORS = {
  primary: '#49B06E',
  accent: '#27B7C8',
  rose: '#ef4444',
  bg: '#0E1B30',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [brokerData, setBrokerData] = useState<BrokerData[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsCheckingAuth(false);
        return;
      }

      const res = await fetch("/api/admin/analytics", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        setIsAuthenticated(true);
        const data = await res.json();
        setAnalytics(data);
        loadBrokers(session.access_token);
        loadUsers(session.access_token);
      }
    } catch {
      // not admin
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const getToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  const loadBrokers = async (token: string) => {
    try {
      const res = await fetch("/api/admin/broker-clicks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBrokerData(data.brokers);
      }
    } catch {
      // ignore
    }
  };

  const loadUsers = async (token: string) => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserList(data.users ?? []);
      }
    } catch {
      // ignore
    } finally {
      setUsersLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setIsLoading(true);
    const token = await getToken();
    if (!token) return;
    try {
      const [analyticsRes, brokersRes] = await Promise.all([
        fetch('/api/admin/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/broker-clicks', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }

      if (brokersRes.ok) {
        const data = await brokersRes.json();
        setBrokerData(data.brokers);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (type: string) => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/export-csv?type=${type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-2xl">
                🌸
              </div>
              <div>
                <CardTitle className="text-xl">Bloom Admin</CardTitle>
                <p className="text-sm text-muted-foreground">Cinder Vault Enterprises LLC</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <Lock className="w-8 h-8 text-muted-foreground" />
              <p className="text-muted-foreground">
                Sign in with an authorized admin account to access this dashboard.
              </p>
              <Button onClick={() => router.push("/")} variant="outline">
                Go to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const planData = analytics ? [
    { name: 'Pro', value: analytics.overview.proUsers, color: COLORS.accent },
    { name: 'Free', value: analytics.overview.freeUsers, color: COLORS.primary },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-2xl">
                🌺
              </div>
              <div>
                <h1 className="text-2xl font-serif font-semibold text-foreground">Bloom Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, Admin. Here's how Bloom is growing 🌸</p>
              </div>
            </div>
            <Button variant="outline" onClick={loadAnalytics} disabled={isLoading}>
              <Activity className="w-4 h-4 mr-2" />
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-4xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="brokers">Brokers</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="exports">Exports</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-5 h-5" /> All Users ({userList.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-2 text-muted-foreground font-medium">Name</th>
                          <th className="text-left py-2 px-2 text-muted-foreground font-medium">Email</th>
                          <th className="text-left py-2 px-2 text-muted-foreground font-medium">Status</th>
                          <th className="text-left py-2 px-2 text-muted-foreground font-medium">Signed Up</th>
                          <th className="text-left py-2 px-2 text-muted-foreground font-medium">Last Sign In</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userList.map((u: any) => (
                          <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-2 px-2 text-foreground">{u.full_name || "—"}</td>
                            <td className="py-2 px-2 text-foreground">{u.email}</td>
                            <td className="py-2 px-2">
                              <Badge className={
                                u.pro_status === "subscribed" ? "bg-accent text-accent-foreground" :
                                u.pro_status?.startsWith("trial") ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                                u.pro_status === "manual pro" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" :
                                u.pro_status === "trial expired" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                                "bg-muted text-muted-foreground"
                              }>
                                {u.pro_status}
                              </Badge>
                            </td>
                            <td className="py-2 px-2 text-muted-foreground">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-2 text-muted-foreground">
                              {u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString() : "Never"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{analytics?.overview.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">All time registrations</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">New Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" style={{ color: COLORS.primary }}>{analytics?.overview.signupsToday || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Week: {analytics?.overview.signupsWeek || 0} | Month: {analytics?.overview.signupsMonth || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pro Subscribers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" style={{ color: COLORS.accent }}>{analytics?.overview.proUsers || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Free: {analytics?.overview.freeUsers || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">MRR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" style={{ color: COLORS.accent }}>${analytics?.overview.mrr || '0.00'}</div>
                  <p className="text-xs text-muted-foreground mt-1">Monthly recurring revenue</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={planData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {planData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Most Watched Stocks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics?.stocks.slice(0, 8).map(([ticker, count], index) => (
                      <div key={ticker} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 text-center">{index + 1}</Badge>
                          <span className="font-semibold text-foreground">{ticker}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{count} views</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Brokers Tab */}
          <TabsContent value="brokers" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-semibold">Broker Performance Dashboard</h2>
              <Button onClick={() => handleExport('brokers')} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {brokerData.map((broker, index) => {
                const trend = broker.thisWeek > broker.thisMonth / 4 ? 'up' : 'down';
                return (
                  <Card key={broker.name}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <Badge variant="outline" className="w-8 text-center">{index + 1}</Badge>
                            <h3 className="text-lg font-semibold text-foreground">{broker.name}</h3>
                            {trend === 'up' ? (
                              <ArrowUp className="w-5 h-5" style={{ color: COLORS.primary }} />
                            ) : (
                              <ArrowDown className="w-5 h-5" style={{ color: COLORS.rose }} />
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Total Clicks</p>
                              <p className="text-2xl font-bold text-foreground">{broker.totalClicks}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">This Week</p>
                              <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>{broker.thisWeek}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">This Month</p>
                              <p className="text-2xl font-bold" style={{ color: COLORS.accent }}>{broker.thisMonth}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <h2 className="text-2xl font-serif font-semibold">User Engagement Analytics</h2>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Most Viewed Stocks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.stocks.slice(0, 10).map(([ticker, count]) => ({ ticker, views: count }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="ticker" stroke="#ffffff40" />
                    <YAxis stroke="#ffffff40" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1f', border: '1px solid #ffffff20' }}
                      labelStyle={{ color: '#ffffff' }}
                    />
                    <Bar dataKey="views" fill={COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <h2 className="text-2xl font-serif font-semibold">Revenue Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" style={{ color: COLORS.accent }}>{analytics?.overview.proUsers || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Paying customers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" style={{ color: COLORS.accent }}>${analytics?.overview.mrr || '0.00'}</div>
                  <p className="text-xs text-muted-foreground mt-1">MRR estimate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Annual Run Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" style={{ color: COLORS.accent }}>
                    ${((parseFloat(analytics?.overview.mrr || '0') * 12).toFixed(2))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">ARR projection</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Exports Tab */}
          <TabsContent value="exports" className="space-y-6">
            <h2 className="text-2xl font-serif font-semibold">Data Exports & Reports</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Broker Clicks Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export all broker click data with timestamps for pitch decks and partnership reports.
                  </p>
                  <Button onClick={() => handleExport('brokers')} className="w-full bg-primary hover:bg-primary/90">
                    <Download className="w-4 h-4 mr-2" />
                    Export Broker Clicks
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">User List</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete user database export with email, plan type, and signup dates.
                  </p>
                  <Button onClick={() => handleExport('users')} className="w-full bg-primary hover:bg-primary/90">
                    <Download className="w-4 h-4 mr-2" />
                    Export Users
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Subscription Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    All subscription records with plan details and payment processor info.
                  </p>
                  <Button onClick={() => handleExport('subscriptions')} className="w-full bg-primary hover:bg-primary/90">
                    <Download className="w-4 h-4 mr-2" />
                    Export Subscriptions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
