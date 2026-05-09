import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users, CreditCard, MousePointerClick, TrendingUp } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  proSubscribers: number;
  monthlyRevenue: number;
  brokerClicks: number;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, proSubscribers: 0, monthlyRevenue: 0, brokerClicks: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "bloomadmin2026") {
      setIsAuthenticated(true);
      loadAdminData();
    } else {
      alert("Incorrect password");
    }
  };

  const loadAdminData = async () => {
    // In a real app this would use a secure admin API route
    // Here we query Supabase directly for demonstration
    const { data: usersData } = await supabase.from("users").select("*");
    const { data: clicksData } = await supabase.from("broker_clicks").select("*");
    const { data: subsData } = await supabase.from("subscriptions").select("*").eq("status", "active");

    if (usersData) {
      setUsers(usersData);
      const proCount = usersData.filter(u => u.plan_type === "pro").length;
      
      setStats({
        totalUsers: usersData.length,
        proSubscribers: proCount,
        monthlyRevenue: proCount * 7.99,
        brokerClicks: clicksData ? clicksData.length : 0,
      });
    }
  };

  const toggleUserPlan = async (userId: string, currentPlan: string) => {
    const newPlan = currentPlan === "pro" ? "free" : "pro";
    await supabase.from("users").update({ plan_type: newPlan }).eq("id", userId);
    loadAdminData();
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
              />
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              Login
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
          <Button variant="outline" onClick={() => setIsAuthenticated(false)}>Logout</Button>
        </div>

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
                        {new Date(user.join_date || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-border hover:bg-muted"
                          onClick={() => toggleUserPlan(user.id, user.plan_type)}
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
      </div>
    </div>
  );
}