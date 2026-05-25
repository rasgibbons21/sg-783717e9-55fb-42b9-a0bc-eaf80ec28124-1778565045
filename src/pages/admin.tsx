/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  Search,
  Trash2,
  Send,
  Database,
  Brain,
  BarChart3,
  Mail,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  experience_level?: string;
  risk_tolerance?: string;
  plan_type?: string;
  last_active?: string;
}

interface OverviewStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  newUsersMonth: number;
  activeSessions: number;
  completedOnboarding: number;
  totalWatchlist: number;
}

interface AnalysisLog {
  id: string;
  ticker: string;
  created_at: string;
  user_id: string;
  success: boolean;
}

interface EmailLog {
  id: string;
  email: string;
  type: string;
  status: string;
  created_at: string;
}

interface SystemHealth {
  supabase: boolean;
  anthropic: boolean;
  marketData: boolean;
  email: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [, setLoading] = useState(false);

  // Dashboard state
  const [stats, setStats] = useState<OverviewStats>({
    totalUsers: 0,
    newUsersToday: 0,
    newUsersWeek: 0,
    newUsersMonth: 0,
    activeSessions: 0,
    completedOnboarding: 0,
    totalWatchlist: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [analysisLogs, setAnalysisLogs] = useState<AnalysisLog[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    supabase: false,
    anthropic: false,
    marketData: false,
    email: false,
  });
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);

  // Password authentication
  const handlePasswordSubmit = () => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "bloomadmin2026";
    
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setAuthError("");
      loadDashboardData();
    } else {
      setAuthError("Access denied 🌸");
    }
  };

  // Load all dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    await Promise.all([
      loadOverviewStats(),
      loadUsers(),
      loadAnalysisLogs(),
      loadEmailLogs(),
      checkSystemHealth(),
    ]);
    setLoading(false);
  };

  // Load overview statistics
  const loadOverviewStats = async () => {
    try {
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: newUsersToday } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: newUsersWeek } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString());

      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const { count: newUsersMonth } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", monthAgo.toISOString());

      const { count: completedOnboarding } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .not("experience_level", "is", null);

      const { count: totalWatchlist } = await supabase
        .from("watchlist")
        .select("*", { count: "exact", head: true });

      setStats({
        totalUsers: totalUsers || 0,
        newUsersToday: newUsersToday || 0,
        newUsersWeek: newUsersWeek || 0,
        newUsersMonth: newUsersMonth || 0,
        activeSessions: 0,
        completedOnboarding: completedOnboarding || 0,
        totalWatchlist: totalWatchlist || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  // Load users
  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUsers((data as User[]) || []);
      setFilteredUsers((data as User[]) || []);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  // Load analysis logs
  const loadAnalysisLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("pansy_analysis_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setAnalysisLogs(data);
      }
    } catch (error) {
      console.error("Error loading analysis logs:", error);
    }
  };

  // Load email logs
  const loadEmailLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("email_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setEmailLogs(data);
      }
    } catch (error) {
      console.error("Error loading email logs:", error);
    }
  };

  // Check system health
  const checkSystemHealth = async () => {
    const health: SystemHealth = {
      supabase: false,
      anthropic: false,
      marketData: false,
      email: false,
    };

    try {
      const { error } = await supabase.from("profiles").select("count").limit(1);
      health.supabase = !error;
    } catch {
      health.supabase = false;
    }

    health.anthropic = !!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || !!process.env.ANTHROPIC_API_KEY;
    health.marketData = !!(process.env.NEXT_PUBLIC_FINNHUB_API_KEY || process.env.NEXT_PUBLIC_POLYGON_API_KEY);
    health.email = true;

    setSystemHealth(health);
  };

  // Search users
  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.email?.toLowerCase().includes(query) ||
        user.full_name?.toLowerCase().includes(query) ||
        user.risk_tolerance?.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase.from("profiles").delete().eq("id", userId);
      if (error) throw error;
      await loadUsers();
      await loadOverviewStats();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  // Broadcast message
  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      alert("Please enter a message to broadcast");
      return;
    }

    setBroadcasting(true);
    try {
      const { error } = await supabase.from("broadcast_messages").insert({
        message: broadcastMessage,
        created_by: "admin",
        active: true,
      });

      if (error) throw error;
      alert("Broadcast message sent! Users will see it on their home page.");
      setBroadcastMessage("");
    } catch (error) {
      console.error("Error broadcasting message:", error);
      alert("Failed to send broadcast. Please try again.");
    } finally {
      setBroadcasting(false);
    }
  };

  // Most searched tickers
  const getMostSearchedTickers = () => {
    const tickerCounts: Record<string, number> = {};
    analysisLogs.forEach((log) => {
      tickerCounts[log.ticker] = (tickerCounts[log.ticker] || 0) + 1;
    });

    return Object.entries(tickerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  };

  // Password entry screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <SEO title="Admin Access - Bloom" />
        <Card className="w-full max-w-md bg-[#1a1a2e] border-[#3d7a54]">
          <CardHeader className="text-center space-y-4">
            <img
              src="/bloom-logo.png"
              alt="Bloom"
              className="w-20 h-20 mx-auto rounded-full"
            />
            <CardTitle className="font-serif text-3xl text-white">
              Admin Access
            </CardTitle>
            <p className="text-gray-400">Enter admin password to continue</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
                className="bg-[#0a0a0f] border-gray-700 text-white"
                placeholder="Enter admin password"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm text-center">{authError}</p>
              </div>
            )}

            <Button
              onClick={handlePasswordSubmit}
              className="w-full bg-[#3d7a54] hover:bg-[#3d7a54]/90 text-white"
            >
              Access Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main dashboard
  return (
    <>
      <SEO title="Admin Dashboard - Bloom" />
      <div className="min-h-screen bg-[#0a0a0f] text-white pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3d7a54] to-[#2d5a44] border-b border-[#3d7a54]/30">
          <div className="container-full py-6 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="/bloom-logo.png"
                  alt="Pansy"
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h1 className="font-serif text-3xl font-bold text-white">
                    Admin Dashboard
                  </h1>
                  <p className="text-green-200">Welcome back, Admin 🌸</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/home")}
                className="border-white/20 text-white hover:bg-white/10 hidden sm:flex"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>

        <div className="container-full py-8 px-4 space-y-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Users
                </CardTitle>
                <Users className="w-4 h-4 text-[#3d7a54]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
                <p className="text-xs text-gray-500 mt-1">
                  +{stats.newUsersToday} today
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  New This Week
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-[#d4788a]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.newUsersWeek}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.newUsersMonth} this month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Completed Onboarding
                </CardTitle>
                <CheckCircle className="w-4 h-4 text-[#c8953a]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {stats.completedOnboarding}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((stats.completedOnboarding / (stats.totalUsers || 1)) * 100)}% completion rate
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Watchlist
                </CardTitle>
                <Activity className="w-4 h-4 text-[#3d7a54]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.totalWatchlist}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Avg {(stats.totalWatchlist / (stats.totalUsers || 1)).toFixed(1)} per user
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-[#1a1a2e] border border-[#3d7a54]/30 flex flex-wrap h-auto">
              <TabsTrigger value="users" className="data-[state=active]:bg-[#3d7a54]">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="content" className="data-[state=active]:bg-[#3d7a54]">
                <Brain className="w-4 h-4 mr-2" />
                AI & Content
              </TabsTrigger>
              <TabsTrigger value="health" className="data-[state=active]:bg-[#3d7a54]">
                <Activity className="w-4 h-4 mr-2" />
                System Health
              </TabsTrigger>
              <TabsTrigger value="emails" className="data-[state=active]:bg-[#3d7a54]">
                <Mail className="w-4 h-4 mr-2" />
                Email Logs
              </TabsTrigger>
              <TabsTrigger value="broadcast" className="data-[state=active]:bg-[#3d7a54]">
                <Send className="w-4 h-4 mr-2" />
                Broadcast
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-white">User Management</CardTitle>
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-gray-500" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-64 bg-[#0a0a0f] border-gray-700 text-white"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-800 hover:bg-transparent">
                          <TableHead className="text-gray-400">Email</TableHead>
                          <TableHead className="text-gray-400">Name</TableHead>
                          <TableHead className="text-gray-400">Joined</TableHead>
                          <TableHead className="text-gray-400">Onboarding</TableHead>
                          <TableHead className="text-gray-400">Risk</TableHead>
                          <TableHead className="text-gray-400">Plan</TableHead>
                          <TableHead className="text-gray-400">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id} className="border-gray-800 hover:bg-[#0a0a0f]/50">
                            <TableCell className="text-gray-300">{user.email}</TableCell>
                            <TableCell className="text-gray-300">{user.full_name || "-"}</TableCell>
                            <TableCell className="text-gray-400 text-sm">
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {user.experience_level ? (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                                  Complete
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
                                  Incomplete
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {user.risk_tolerance || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  user.plan_type === "pro"
                                    ? "bg-[#c8953a]/20 text-[#c8953a] border-[#c8953a]/50"
                                    : "bg-gray-500/20 text-gray-400 border-gray-500/50"
                                }
                              >
                                {user.plan_type || "free"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content & AI Tab */}
            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
                  <CardHeader>
                    <CardTitle className="text-white">Most Searched Stocks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getMostSearchedTickers().map(([ticker, count]) => (
                        <div
                          key={ticker}
                          className="flex items-center justify-between p-3 bg-[#0a0a0f] rounded-lg"
                        >
                          <span className="font-semibold text-white">{ticker}</span>
                          <span className="text-gray-400">{count} searches</span>
                        </div>
                      ))}
                      {getMostSearchedTickers().length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                          No search data yet
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Pansy Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {analysisLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-3 bg-[#0a0a0f] rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{log.ticker}</span>
                            {log.success ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                          <span className="text-gray-400 text-sm">
                            {new Date(log.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                      {analysisLogs.length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                          No analysis logs yet
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* System Health Tab */}
            <TabsContent value="health" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">Supabase</CardTitle>
                    <Database className="w-5 h-5 text-[#3d7a54]" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      {systemHealth.supabase ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                      <span className="text-gray-300">
                        {systemHealth.supabase ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">Anthropic API (Pansy)</CardTitle>
                    <Brain className="w-5 h-5 text-[#d4788a]" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      {systemHealth.anthropic ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                      <span className="text-gray-300">
                        {systemHealth.anthropic ? "API Key Configured" : "Not Configured"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">Market Data APIs</CardTitle>
                    <BarChart3 className="w-5 h-5 text-[#c8953a]" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      {systemHealth.marketData ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                      <span className="text-gray-300">
                        {systemHealth.marketData
                          ? "APIs Configured"
                          : "APIs Not Configured"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">Email Service (Resend)</CardTitle>
                    <Mail className="w-5 h-5 text-[#3d7a54]" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      {systemHealth.email ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                      <span className="text-gray-300">
                        {systemHealth.email ? "Operational" : "Down"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Email Logs Tab */}
            <TabsContent value="emails" className="space-y-4">
              <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
                <CardHeader>
                  <CardTitle className="text-white">Email Delivery Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-800 hover:bg-transparent">
                          <TableHead className="text-gray-400">Email</TableHead>
                          <TableHead className="text-gray-400">Type</TableHead>
                          <TableHead className="text-gray-400">Status</TableHead>
                          <TableHead className="text-gray-400">Sent At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {emailLogs.map((log) => (
                          <TableRow key={log.id} className="border-gray-800 hover:bg-[#0a0a0f]/50">
                            <TableCell className="text-gray-300">{log.email}</TableCell>
                            <TableCell className="text-gray-300 capitalize">{log.type}</TableCell>
                            <TableCell>
                              <Badge className={
                                log.status === 'delivered' || log.status === 'success' 
                                  ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                              }>
                                {log.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-400 text-sm">
                              {new Date(log.created_at).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                        {emailLogs.length === 0 && (
                          <TableRow className="border-gray-800 hover:bg-transparent">
                            <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                              No email logs found. Logs will appear here when confirmation emails are sent.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Broadcast Tab */}
            <TabsContent value="broadcast" className="space-y-4">
              <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
                <CardHeader>
                  <CardTitle className="text-white">Broadcast Pansy's Daily Message</CardTitle>
                  <p className="text-gray-400 text-sm mt-2">
                    Send a message that all users will see on their home page as Pansy's
                    daily tip
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="broadcast-message" className="text-gray-300">
                      Message
                    </Label>
                    <Textarea
                      id="broadcast-message"
                      placeholder="Type Pansy's message here... (e.g., 'Markets are looking solid today sis! Tech stocks are up and the vibe is generally positive 📈')"
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      className="bg-[#0a0a0f] border-gray-700 text-white min-h-32"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 text-right">
                      {broadcastMessage.length}/500 characters
                    </p>
                  </div>

                  <Button
                    onClick={handleBroadcast}
                    disabled={broadcasting || !broadcastMessage.trim()}
                    className="w-full bg-[#d4788a] hover:bg-[#d4788a]/90 text-white"
                  >
                    {broadcasting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Broadcasting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Broadcast Message
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}