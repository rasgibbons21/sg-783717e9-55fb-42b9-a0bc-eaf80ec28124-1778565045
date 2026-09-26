/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
/* eslint-disable @next/next/no-img-element */
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
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { supabase } from "@/integrations/supabase/client";
import { User, LogOut, Share, CreditCard, Bell, Shield, BellOff, Save, Trash2, Gift, Copy, Users, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { canShowExternalPayment } from "@/lib/payments";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };
const stagger = (i: number) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08, type: "spring" as const, stiffness: 400, damping: 30 } });


export default function Profile() {
  const router = useRouter();
  const { toast } = useToast();
  const { isPaid, tier, isLoading: subscriptionLoading } = useSubscription();
  const [user, setUser] = useState<any>(null);
  const [authCreatedAt, setAuthCreatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  // Gems (derived) + leaderboard name
  const [gems, setGems] = useState<number | null>(null);
  const [challengeName, setChallengeName] = useState<string>("");
  const [savedChallengeName, setSavedChallengeName] = useState<string>("");
  const [isSavingName, setIsSavingName] = useState(false);

  // Referral state
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState<{ totalReferrals: number; rewardDays: number }>({ totalReferrals: 0, rewardDays: 0 });
  const [referralLoading, setReferralLoading] = useState(false);

  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const loadProfile = async () => {
      // Fetch auth user to get true sign-up date
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setAuthCreatedAt(authUser.created_at);
      }

      const user = await userService.getCurrentUser();
      if (user) {
        setFullName(user.full_name || "");
        setEmail(user.email || "");
        setUser(user);
        const existingName = (user as any).challenge_name || "";
        setChallengeName(existingName);
        setSavedChallengeName(existingName);

        // Derived gem total (single source: /api/gems)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          fetch("/api/gems", { headers: { Authorization: `Bearer ${session.access_token}` } })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => { if (d) setGems(d.gems); })
            .catch(() => {});
        }
        // Load referral stats
        if (session) {
          fetch("/api/referral/stats", { headers: { Authorization: `Bearer ${session.access_token}` } })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
              if (d) {
                setReferralCode(d.code);
                setReferralStats({ totalReferrals: d.totalReferrals, rewardDays: d.rewardDays });
              }
            })
            .catch(() => {});
        }
      }
      setIsLoading(false);
    };
    loadProfile();
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from("profiles")
        .select("notifications_enabled")
        .eq("id", session.user.id)
        .single();
      setNotificationsEnabled(data?.notifications_enabled ?? false);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (!user) return;

    if (enabled) {
      if (!("Notification" in window)) {
        toast({ title: "Not Supported", description: "Push notifications aren't supported in this browser.", variant: "destructive" });
        return;
      }
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission !== "granted") {
        toast({ title: "Permission Denied", description: "Enable notifications in your browser settings to receive alerts.", variant: "destructive" });
        return;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ notifications_enabled: enabled })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Error", description: "Could not save notification preference.", variant: "destructive" });
      return;
    }

    setNotificationsEnabled(enabled);
  };

  // Isolated save for the leaderboard name — writes ONLY challenge_name (a real
  // column), not the preferences fields that have no columns yet.
  const sanitizeChallengeName = (raw: string) =>
    // strip control chars, collapse whitespace, trim, cap at 20
    raw.replace(/[\u0000-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim().slice(0, 20);

  const handleSaveChallengeName = async () => {
    if (!user) return;
    const clean = sanitizeChallengeName(challengeName);
    if (clean.length < 3) {
      toast({
        title: "Name too short",
        description: "Your leaderboard name needs at least 3 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingName(true);
    try {
      const updated = await userService.updateUser(user.id, { challenge_name: clean } as any);
      if (!updated) throw new Error("Failed to save");
      setChallengeName(clean);
      setSavedChallengeName(clean);
      setUser(updated);
      toast({ title: "Leaderboard name saved 🌸", description: `You'll show up as "${clean}".` });
    } catch (error: any) {
      toast({
        title: "Couldn't save your name",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    router.push("/");
  };

  const generateReferralCode = async () => {
    setReferralLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/referral/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setReferralCode(d.code);
      }
    } catch {}
    finally { setReferralLoading(false); }
  };

  const copyReferralLink = async () => {
    const link = `https://shebloomswealth.app/onboarding?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: "Referral link copied!", description: "Share it with friends to earn rewards." });
    } catch {
      toast({ title: "Could not copy", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    const shareUrl = referralCode
      ? `https://shebloomswealth.app/onboarding?ref=${referralCode}`
      : "https://shebloomswealth.app";
    const shareText = referralCode
      ? "Join me on Radar! Stock screener & alerts made simple."
      : "Check out Radar — stock screener & alerts.";

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Radar",
          text: shareText,
          url: shareUrl,
        });
      } catch (error: any) {
        console.log("Share cancelled or failed:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied! 🌸",
          description: "Share link has been copied to your clipboard.",
        });
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        toast({
          title: "Could not copy link",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    }
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

  return (
    <Layout>
      <SEO title="Profile — Radar" />
      <div className="container-full py-8 space-y-6 pb-24">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account and subscription
          </p>
        </div>

        {/* User Info Card */}
        <motion.div {...stagger(0)}>
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
                {isPaid && (
                  <Badge className="bg-accent text-accent-foreground">
                    {tier === "pro" ? "Pro" : "Desk"}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{user?.email}</p>
              {authCreatedAt && (
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(authCreatedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              )}
              {gems !== null && (
                <div className="inline-flex items-center gap-1.5 mt-2 rounded-full bg-primary/10 px-3 py-1">
                  <span className="text-base leading-none">💎</span>
                  <span className="text-sm font-semibold text-foreground">{gems.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">gems</span>
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard name */}
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="challenge-name" className="text-sm font-medium text-foreground">
              Your leaderboard name
            </Label>
            <p className="text-xs text-muted-foreground">
              This is how you&apos;ll show up on the gems leaderboard — pick any name you like. Others never see your real name or email.
            </p>
            <div className="flex gap-2">
              <Input
                id="challenge-name"
                value={challengeName}
                onChange={(e) => setChallengeName(e.target.value)}
                placeholder="e.g. WealthBoss"
                maxLength={20}
                className="flex-1"
              />
              <Button
                onClick={handleSaveChallengeName}
                disabled={isSavingName || challengeName.trim() === savedChallengeName.trim()}
              >
                <Save className="w-4 h-4 mr-1.5" />
                {isSavingName ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </Card>
        </motion.div>

        {/* Subscription Section */}
        <motion.div {...stagger(1)}>
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptionLoading ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ) : isPaid ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                    <span className="text-2xl">✨</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg">{tier === "pro" ? "Radar Pro" : "Radar Desk"}</p>
                    <p className="text-sm text-muted-foreground">{tier === "pro" ? "Full access to all features" : "Core tools & daily analyses"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg border border-accent/20">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Daily Analyses</p>
                    <p className="text-sm font-semibold text-foreground">Unlimited</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Full Analysis</p>
                    <p className="text-sm font-semibold text-foreground">✓ Included</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">ETF Analyses</p>
                    <p className="text-sm font-semibold text-foreground">✓ Included</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">News & Charts</p>
                    <p className="text-sm font-semibold text-foreground">Real-time</p>
                  </div>
                </div>
                {canShowExternalPayment && (
                  <Button
                    variant="outline"
                    className="w-full border-accent text-accent hover:bg-accent/10"
                    onClick={() => router.push("/subscription")}
                  >
                    Manage Subscription
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-2xl">🌸</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg">Free Plan</p>
                    <p className="text-sm text-muted-foreground">3 analyses per week, basic features</p>
                  </div>
                </div>
                {canShowExternalPayment && (
                  <Link href="/subscription">
                    <Button className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90">
                      Upgrade to Pro
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        </motion.div>

        {/* Referral & Share */}
        <motion.div {...stagger(2)} whileTap={{ scale: 0.99 }}>
        <Card className="border-accent bg-gradient-to-br from-accent/10 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Refer Friends, Earn Rewards
            </CardTitle>
            <CardDescription>
              Share your referral link and earn rewards!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {referralCode ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-background/60 border border-border rounded-lg px-4 py-3 font-mono text-sm text-foreground tracking-wider text-center">
                    {referralCode}
                  </div>
                  <Button variant="outline" size="icon" onClick={copyReferralLink} title="Copy referral link">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                {referralStats.totalReferrals > 0 && (
                  <div className="flex items-center gap-4 p-3 bg-background/40 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent" />
                      <span className="text-sm text-foreground font-semibold">{referralStats.totalReferrals}</span>
                      <span className="text-xs text-muted-foreground">referred</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-accent" />
                      <span className="text-sm text-foreground font-semibold">+{referralStats.rewardDays}d</span>
                      <span className="text-xs text-muted-foreground">earned</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Button
                onClick={generateReferralCode}
                disabled={referralLoading}
                variant="outline"
                className="w-full border-accent text-accent hover:bg-accent/10"
              >
                {referralLoading ? "Generating..." : "Get Your Referral Code"}
              </Button>
            )}
            <Button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </CardContent>
        </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div {...stagger(3)}>
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
                  disabled={notificationPermission === "denied" || (typeof window !== "undefined" && !("Notification" in window))}
                />
              </div>

              {typeof window !== "undefined" && !("Notification" in window) && (
                <div className="p-4 bg-muted/50 border border-muted-foreground/20 rounded-xl">
                  <p className="text-sm text-muted-foreground">
                    Push notifications are not supported in this browser.
                  </p>
                </div>
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
        </motion.div>

        {/* Sign Out */}
        <motion.div whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
          <Button
            onClick={() => { haptic(15); handleSignOut(); }}
            variant="outline"
            className="w-full border-destructive/20 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>

        {/* Delete Account */}
        <Link href="/delete-account" className="block">
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </Link>

        {/* Disclaimer */}
        <Card className="p-4 bg-muted/50 border-muted-foreground/20 rounded-2xl">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            This is educational content only and does not constitute financial advice. Radar is not liable for any investment decisions or losses.<br/>
            Contact us at cindervaultenterprisesllc@gmail.com
          </p>
        </Card>
      </div>
    </Layout>
  );
}