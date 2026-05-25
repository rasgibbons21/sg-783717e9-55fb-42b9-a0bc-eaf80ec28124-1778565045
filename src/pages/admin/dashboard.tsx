import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, Activity, Mail, Database, Brain, Search, LogOut, CheckCircle, XCircle } from "lucide-react";

interface AdminData {
  users: Array<{
    id: string;
    email: string;
    full_name: string;
    risk_tolerance: string;
    onboarding_complete: boolean;
    created_at: string;
    last_sign_in: string | null;
    email_confirmed: boolean;
  }>;
  onboarding: {
    totalSignups: number;
    completedOnboarding: number;
    stuckOnOnboarding: number;
    stuckUsers: Array<{
      id: string;
      email: string;
      created_at: string;
      last_sign_in: string | null;
    }>;
  };
  health: {
    anthropic: boolean;
    finnhub: boolean;
    fmp: boolean;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [testingPansy, setTestingPansy] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("adminAuthenticated") !== "true") {
      router.push("/admin");
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/dashboard-data");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated");
    router.push("/admin");
  };

  const testPansy = async () => {
    setTestingPansy(true);
    try {
      const res = await fetch("/api/pansy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Hello", ticker: "SPY" })
      });
      if (res.ok) {
        alert("Pansy API is working perfectly! 🌸");
      } else {
        alert("Pansy API returned an error. Check logs.");
      }
    } catch (e) {
      alert("Failed to connect to Pansy API.");
    } finally {
      setTestingPansy(false);
    }
  };

  if (loading || !data) {
    return <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">Loading Admin Data...</div>;
  }

  const filteredUsers = data.users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pb-20">
      <SEO title="Dashboard - Bloom Admin" />
      <div className="bg-[#1a1a2e] border-b border-[#3d7a54]/30 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-serif text-white">Bloom Admin</h1>
        <Button variant="ghost" onClick={handleLogout} className="text-gray-400 hover:text-white">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Tabs defaultValue="users">
          <TabsList className="bg-[#1a1a2e] border border-[#3d7a54]/30 flex-wrap h-auto">
            <TabsTrigger value="users" className="data-[state=active]:bg-[#3d7a54]"><Users className="w-4 h-4 mr-2"/> Users Directory</TabsTrigger>
            <TabsTrigger value="onboarding" className="data-[state=active]:bg-[#3d7a54]"><Activity className="w-4 h-4 mr-2"/> Onboarding Monitor</TabsTrigger>
            <TabsTrigger value="emails" className="data-[state=active]:bg-[#3d7a54]"><Mail className="w-4 h-4 mr-2"/> Email Log</TabsTrigger>
            <TabsTrigger value="health" className="data-[state=active]:bg-[#3d7a54]"><Database className="w-4 h-4 mr-2"/> App Health</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6 space-y-4">
            <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle>All Users</CardTitle>
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Search email or name..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-[#0a0a0f] border-gray-700 w-full sm:w-64"
                  />
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Sign In</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(u => (
                      <TableRow key={u.id} className="border-gray-800">
                        <TableCell className="font-medium">{u.email}</TableCell>
                        <TableCell>{u.full_name || "-"}</TableCell>
                        <TableCell>{u.risk_tolerance || "-"}</TableCell>
                        <TableCell>
                          {u.onboarding_complete ? 
                            <Badge className="bg-green-500/20 text-green-400 border-none">Complete</Badge> : 
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-none">Pending</Badge>
                          }
                        </TableCell>
                        <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString() : "Never"}</TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow className="border-gray-800">
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">No users found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="onboarding" className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <h3 className="text-gray-400 text-sm">Total Signups</h3>
                  <p className="text-4xl font-bold mt-2 text-white">{data.onboarding.totalSignups}</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <h3 className="text-gray-400 text-sm">Completed Onboarding</h3>
                  <p className="text-4xl font-bold mt-2 text-green-400">{data.onboarding.completedOnboarding}</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <h3 className="text-gray-400 text-sm">Stuck on Onboarding</h3>
                  <p className="text-4xl font-bold mt-2 text-yellow-400">{data.onboarding.stuckOnOnboarding}</p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
              <CardHeader><CardTitle>Users Stuck on Onboarding</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Sign In</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.onboarding.stuckUsers.map(u => (
                      <TableRow key={u.id} className="border-gray-800">
                        <TableCell className="font-medium text-yellow-100">{u.email}</TableCell>
                        <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString() : "-"}</TableCell>
                      </TableRow>
                    ))}
                    {data.onboarding.stuckUsers.length === 0 && (
                      <TableRow className="border-gray-800">
                        <TableCell colSpan={3} className="text-center text-gray-500 py-8">Everyone has completed onboarding! 🎉</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emails" className="mt-6">
            <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
              <CardHeader>
                <CardTitle>Supabase Email Confirmation Log</CardTitle>
                <p className="text-sm text-gray-400">Directly fetched from Supabase Auth service</p>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Email Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.users.map(u => (
                      <TableRow key={u.id} className="border-gray-800">
                        <TableCell className="font-medium">{u.email}</TableCell>
                        <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {u.email_confirmed ? 
                            <Badge className="bg-green-500/20 text-green-400 border-none flex w-fit items-center"><CheckCircle className="w-3 h-3 mr-1"/> Confirmed</Badge> : 
                            <Badge className="bg-red-500/20 text-red-400 border-none flex w-fit items-center"><XCircle className="w-3 h-3 mr-1"/> Unconfirmed</Badge>
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
                <CardHeader><CardTitle className="flex items-center"><Brain className="w-5 h-5 mr-2 text-[#d4788a]"/> API Keys Status</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-[#0a0a0f] rounded-lg">
                    <span className="font-medium text-gray-300">Anthropic (Pansy AI)</span>
                    {data.health.anthropic ? <Badge className="bg-green-500/20 text-green-400 border-none">Loaded</Badge> : <Badge className="bg-red-500/20 text-red-400 border-none">Missing</Badge>}
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#0a0a0f] rounded-lg">
                    <span className="font-medium text-gray-300">Finnhub (Market Data)</span>
                    {data.health.finnhub ? <Badge className="bg-green-500/20 text-green-400 border-none">Loaded</Badge> : <Badge className="bg-red-500/20 text-red-400 border-none">Missing</Badge>}
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#0a0a0f] rounded-lg">
                    <span className="font-medium text-gray-300">FMP (Fundamentals)</span>
                    {data.health.fmp ? <Badge className="bg-green-500/20 text-green-400 border-none">Loaded</Badge> : <Badge className="bg-red-500/20 text-red-400 border-none">Missing</Badge>}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#3d7a54]/30">
                <CardHeader><CardTitle>Test Connections</CardTitle></CardHeader>
                <CardContent>
                  <Button 
                    onClick={testPansy} 
                    disabled={testingPansy} 
                    className="w-full bg-[#d4788a] hover:bg-[#d4788a]/90 text-white font-medium py-6"
                  >
                    {testingPansy ? "Testing AI Connection..." : "Test Pansy API Connection"}
                  </Button>
                  <p className="text-sm text-gray-400 mt-4 text-center">
                    Sends a ping to the <code>/api/pansy</code> route to verify the Anthropic model connects successfully.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}