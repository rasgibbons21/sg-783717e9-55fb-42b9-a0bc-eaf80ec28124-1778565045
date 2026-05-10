import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Users, CreditCard, MousePointerClick, TrendingUp, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type User = Database["public"]["Tables"]["users"]["Row"];

interface AdminStats {
  totalUsers: number;
  proSubscribers: number;
  monthlyRevenue: number;
  brokerClicks: number;
}

interface AdminData {
  stats: AdminStats;
  users: User[];
  brokerClicks: any[];
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, proSubscribers: 0, monthlyRevenue: 0, brokerClicks: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const authStatus = sessionStorage.getItem("bloom_admin_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      loadAdminData();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
        sessionStorage.setItem("bloom_admin_authenticated", "true");
        await loadAdminData();
      } else {
        setError("Incorrect password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    setDataLoading(true);
    try {
      const response = await fetch("/api/admin/stats");
      const data: AdminData = await response.json();

      if (response.ok) {
        setStats(data.stats);
        setUsers(data.users);
      } else {
        console.error("Failed to load admin data:", data);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setDataLoading(false);
    }
  };

  const toggleUserPlan = async (userId: string, currentPlan: string) => {
    const newPlan = currentPlan === "pro" ? "free" : "pro";
    
    try {
      const response = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, planType: newPlan }),
      });

      if (response.ok) {
        await loadAdminData();
      } else {
        console.error("Failed to update user plan");
      }
    } catch (err) {
      console.error("Error updating user plan:", err);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("bloom_admin_authenticated");
    setPassword("");
  };

  const filteredUsers = users.filter(user => 
    (user.full_name?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (user.email?.toLowerCase() || "").includes(search.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="dark min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-sm p-8 space-y-6 bg-card border-border">
          <div className="text-center space-y-2">
            <h1 className="font-serif text-3xl font-bold text-accent">Bloom Admin</h1>
            <p className="text-muted-foreground text-sm">Protected Area</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Password</label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="bg-muted border-border"
                disabled={loading}
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-accent">Bloom Dashboard</h1>
            <p className="text-muted-foreground">Admin overview and user management</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>

        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <Users className="w-4 h-4 text-accent" />
                </div>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </Card>
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-sm font-medium text-muted-foreground">Pro Subscribers</p>
                  <CreditCard className="w-4 h-4 text-accent" />
                </div>
                <p className="text-3xl font-bold">{stats.proSubscribers}</p>
              </Card>
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <TrendingUp className="w-4 h-4 text-accent" />
                </div>
                <p className="text-3xl font-bold">${stats.monthlyRevenue.toFixed(2)}</p>
              </Card>
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-sm font-medium text-muted-foreground">Broker Clicks</p>
                  <MousePointerClick className="w-4 h-4 text-accent" />
                </div>
                <p className="text-3xl font-bold">{stats.brokerClicks}</p>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Users</h2>
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input 
                    placeholder="Search users..." 
                    className="pl-9 bg-card border-border"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <Card className="border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3 font-medium">Name</th>
                        <th className="px-6 py-3 font-medium">Email</th>
                        <th className="px-6 py-3 font-medium">Plan</th>
                        <th className="px-6 py-3 font-medium">Joined</th>
                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 font-medium">{user.full_name || "Unknown"}</td>
                          <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={user.plan_type === "pro" ? "border-accent text-accent" : "border-muted-foreground text-muted-foreground"}>
                              {user.plan_type?.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {user.join_date ? new Date(user.join_date).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-border hover:bg-muted"
                              onClick={() => toggleUserPlan(user.id, user.plan_type || "free")}
                            >
                              Toggle Plan
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}