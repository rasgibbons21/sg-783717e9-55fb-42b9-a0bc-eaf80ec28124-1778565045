import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { notificationService } from "@/services/notificationService";
import { User, Mail, Calendar, Crown, Settings, LogOut, Camera, Share, CreditCard, Bell, Shield, CheckCircle2, BellRing, BellOff, Target, TrendingUp, Clock, DollarSign, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RISK_TOLERANCE_OPTIONS = [
  { value: "Conservative", label: "Conservative", description: "Prioritize stability and capital preservation" },
  { value: "Moderate", label: "Moderate", description: "Balance between growth and stability" },
  { value: "Aggressive", label: "Aggressive", description: "Maximize growth potential, accept higher volatility" },
];

const INVESTMENT_GOALS = [
  "Grow My Wealth",
  "Save for Retirement",
  "Generate Passive Income",
  "Build an Emergency Fund",
  "Save for a Major Purchase",
  "Financial Independence",
];

const TIME_HORIZON_OPTIONS = [
  { value: "Short-term (0-3 years)", label: "Short-term", description: "0-3 years" },
  { value: "Medium-term (3-10 years)", label: "Medium-term", description: "3-10 years" },
  { value: "Long-term (10+ years)", label: "Long-term", description: "10+ years" },
];

export default function Profile() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  // Form state
  const [riskTolerance, setRiskTolerance] = useState<string>("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [timeHorizon, setTimeHorizon] = useState<string>("");
  const [monthlyContribution, setMonthlyContribution] = useState<string>("");
  const [currentAge, setCurrentAge] = useState<string>("");
  const [retirementAge, setRetirementAge] = useState<string>("");

  useEffect(() => {
    checkAuth();
    checkNotificationStatus();
  }, []);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/");
      return;
    }
    const profile = await userService.getCurrentUser();
    setUser(profile);
    
    // Populate form with existing data
    if (profile) {
      setRiskTolerance(profile.risk_tolerance || "");
      setSelectedGoals(profile.investment_goals || []);
      setTimeHorizon(profile.time_horizon || "");
      setMonthlyContribution(profile.monthly_contribution?.toString() || "");
      setCurrentAge(profile.current_age?.toString() || "");
      setRetirementAge(profile.retirement_age?.toString() || "");
    }
    
    setIsLoading(false);
  };

  const checkNotificationStatus = () => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
      setNotificationsEnabled(Notification.permission === "granted");
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (!user) return;

    if (enabled) {
      const success = await notificationService.subscribeToPush(user.id);
      if (success) {
        setNotificationsEnabled(true);
        setNotificationPermission("granted");
      }
    } else {
      const success = await notificationService.unsubscribeFromPush(user.id);
      if (success) {
        setNotificationsEnabled(false);
      }
    }
  };

  const handleTestNotification = async () => {
    const success = await notificationService.sendTestNotification();
    if (!success) {
      alert("Could not send test notification. Please enable notifications first.");
    }
  };

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((g) => g !== goal)
        : [...prev, goal]
    );
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const updates: any = {
        risk_tolerance: riskTolerance || null,
        investment_goals: selectedGoals.length > 0 ? selectedGoals : null,
        time_horizon: timeHorizon || null,
        monthly_contribution: monthlyContribution ? parseFloat(monthlyContribution) : null,
        current_age: currentAge ? parseInt(currentAge) : null,
        retirement_age: retirementAge ? parseInt(retirementAge) : null,
      };

      const updatedUser = await userService.updateUser(user.id, updates);

      if (updatedUser) {
        setUser(updatedUser);
        toast({
          title: "Preferences saved! 🌸",
          description: "Pansy will personalize your recommendations based on your profile.",
        });
      } else {
        throw new Error("Failed to save preferences");
      }
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error saving preferences",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container-full py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  const isPro = user?.plan_type === "pro";

  return (
    <Layout>
      <SEO title="Profile — Bloom" />
      <div className="container-full py-8 space-y-6 pb-24">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and investment preferences
          </p>
        </div>

        {/* User Info Card */}
        <Card className="p-6 bg-card border-border rounded-2xl space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">
                  {user?.full_name || "Welcome"}
                </h2>
                {isPro && (
                  <Badge className="bg-accent text-accent-foreground">
                    Pro
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground">
                Member since {new Date(user?.join_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Investment Preferences */}
        <Card className="p-6 bg-card border-border rounded-2xl space-y-6">
          <div className="flex items-start gap-4">
            <Target className="w-6 h-6 text-foreground mt-1" />
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-foreground text-lg mb-1">
                  Investment Preferences
                </h3>
                <p className="text-sm text-muted-foreground">
                  Help Pansy personalize your recommendations and analysis
                </p>
              </div>

              {/* Risk Tolerance */}
              <div className="space-y-3">
                <Label className="text-base text-foreground">Risk Tolerance</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {RISK_TOLERANCE_OPTIONS.map((option) => (
                    <Card
                      key={option.value}
                      className={`p-4 cursor-pointer transition-all ${
                        riskTolerance === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted/50"
                      }`}
                      onClick={() => setRiskTolerance(option.value)}
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Investment Goals */}
              <div className="space-y-3">
                <Label className="text-base text-foreground">Investment Goals</Label>
                <p className="text-sm text-muted-foreground">Select all that apply</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {INVESTMENT_GOALS.map((goal) => (
                    <div
                      key={goal}
                      className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleGoalToggle(goal)}
                    >
                      <Checkbox
                        id={goal}
                        checked={selectedGoals.includes(goal)}
                        onCheckedChange={() => handleGoalToggle(goal)}
                      />
                      <label
                        htmlFor={goal}
                        className="text-sm font-medium text-foreground cursor-pointer flex-1"
                      >
                        {goal}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Time Horizon */}
              <div className="space-y-3">
                <Label className="text-base text-foreground">Time Horizon</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {TIME_HORIZON_OPTIONS.map((option) => (
                    <Card
                      key={option.value}
                      className={`p-4 cursor-pointer transition-all ${
                        timeHorizon === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted/50"
                      }`}
                      onClick={() => setTimeHorizon(option.value)}
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Financial Details */}
              <div className="space-y-4">
                <Label className="text-base text-foreground">Financial Planning Details</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyContribution" className="text-sm text-foreground">
                      Monthly Contribution ($)
                    </Label>
                    <Input
                      id="monthlyContribution"
                      type="number"
                      placeholder="500"
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(e.target.value)}
                      className="bg-background border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                      How much you plan to invest monthly
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentAge" className="text-sm text-foreground">
                      Current Age
                    </Label>
                    <Input
                      id="currentAge"
                      type="number"
                      placeholder="28"
                      value={currentAge}
                      onChange={(e) => setCurrentAge(e.target.value)}
                      className="bg-background border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                      For retirement planning calculations
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retirementAge" className="text-sm text-foreground">
                      Target Retirement Age
                    </Label>
                    <Input
                      id="retirementAge"
                      type="number"
                      placeholder="65"
                      value={retirementAge}
                      onChange={(e) => setRetirementAge(e.target.value)}
                      className="bg-background border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                      When you plan to retire
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="w-full bg-primary hover:bg-primary/90 mt-4"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Pansy's Personalization Tip */}
        <Card className="p-6 bg-accent/5 border-accent/20 rounded-2xl">
          <div className="flex items-start gap-4">
            <img
              src="/bloom-logo.png"
              alt="Pansy"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">Pansy's Personalization Tip</p>
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                The more I know about your goals, the better I can help! Your risk tolerance, time horizon, and monthly contribution help me find investments that actually fit your life. No one-size-fits-all recommendations here 💛
              </p>
              <p className="text-sm font-medium text-accent">— Pansy 🌺</p>
            </div>
          </div>
        </Card>

        {/* Subscription Status */}
        <Card className="p-6 bg-card border-border rounded-2xl">
          <div className="flex items-start gap-4">
            <CreditCard className="w-6 h-6 text-foreground mt-1" />
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-foreground text-lg">
                Subscription
              </h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    isPro
                      ? "bg-accent/10 text-accent border-accent"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {isPro ? "Bloom Pro" : "Free Plan"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {isPro
                  ? "Unlimited daily picks, full analysis, and exclusive features"
                  : "3 picks per week, basic market summary"}
              </p>
              {!isPro && (
                <Button
                  onClick={() => router.push("/subscription")}
                  className="mt-4 bg-primary hover:bg-primary/90"
                >
                  Upgrade to Pro
                </Button>
              )}
              {isPro && (
                <Button
                  variant="outline"
                  onClick={() => router.push("/subscription")}
                  className="mt-4 border-border text-foreground"
                >
                  Manage Subscription
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Share Bloom */}
        <Card className="border-accent bg-gradient-to-br from-accent/10 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share className="h-5 w-5" />
              Share Bloom
            </CardTitle>
            <CardDescription>
              Know someone who'd love Bloom? Share it with them!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/share">
              <Button
                className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
              >
                View Share Page
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6 bg-card border-border rounded-2xl">
          <div className="flex items-start gap-4">
            <Bell className="w-6 h-6 text-foreground mt-1" />
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-foreground text-lg mb-1">
                  Push Notifications
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get alerts when your tracked stocks have significant price movements
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications" className="text-base text-foreground">
                    Enable Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {notificationPermission === "granted"
                      ? "Notifications are enabled"
                      : notificationPermission === "denied"
                      ? "Notifications are blocked. Enable in browser settings."
                      : "Allow notifications to get price alerts"}
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={handleNotificationToggle}
                  disabled={notificationPermission === "denied"}
                />
              </div>

              {notificationsEnabled && (
                <>
                  <Separator />
                  <Button
                    onClick={handleTestNotification}
                    variant="outline"
                    className="w-full border-border text-foreground"
                  >
                    <BellRing className="w-4 h-4 mr-2" />
                    Send Test Notification
                  </Button>
                </>
              )}

              {notificationPermission === "denied" && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <div className="flex gap-2">
                    <BellOff className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-destructive">
                        Notifications Blocked
                      </p>
                      <p className="text-xs text-destructive/80">
                        You've blocked notifications for this site. To enable them, click the lock icon in your browser's address bar and allow notifications.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Pansy's Privacy Tip */}
        <Card className="p-6 bg-accent/5 border-accent/20 rounded-2xl">
          <div className="flex items-start gap-4">
            <img
              src="/bloom-logo.png"
              alt="Pansy"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">Pansy's Privacy Tip</p>
                <Shield className="w-4 h-4 text-accent" />
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                Your data is always yours, babe. We never share your info with third parties, and you can delete your account anytime. Push notifications only go to your device — nobody else sees them 💛
              </p>
              <p className="text-sm font-medium text-accent">— Pansy 🌺</p>
            </div>
          </div>
        </Card>

        {/* Sign Out */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full border-destructive/20 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>

        {/* Disclaimer */}
        <Card className="p-4 bg-muted/50 border-muted-foreground/20 rounded-2xl">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            This is educational content only and does not constitute financial advice. Bloom is not liable for any investment decisions or losses.<br/>
            Contact us at support@bloom.app
          </p>
        </Card>
      </div>
    </Layout>
  );
}