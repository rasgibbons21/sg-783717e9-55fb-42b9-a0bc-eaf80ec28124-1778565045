import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/userService";
import { paypalService } from "@/services/paypalService";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Calendar, CreditCard, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/integrations/supabase/types";

type User = Database["public"]["Tables"]["users"]["Row"];
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    const userData = await userService.getCurrentUser();
    setUser(userData);

    if (userData) {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userData.id)
        .eq("status", "active")
        .single();

      if (data) setSubscription(data);
    }

    setIsLoading(false);
  };

  const handleCancelSubscription = async () => {
    if (!user || !subscription) return;

    const confirmed = confirm(
      "Are you sure you want to cancel your Pro subscription? You'll still have access until the end of your billing period."
    );

    if (!confirmed) return;

    setIsCancelling(true);
    try {
      await paypalService.cancelUserSubscription(user.id);
      alert("Subscription cancelled successfully. You'll have access until the end of your billing period.");
      await loadUserData();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      alert("Failed to cancel subscription. Please try again or contact support.");
    }
    setIsCancelling(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/onboarding");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Please sign in to view your profile</p>
            <Button onClick={() => router.push("/onboarding")}>Sign In</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const isPro = user.plan_type === "pro";

  return (
    <Layout>
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Profile
          </h1>
          <p className="text-muted-foreground">Manage your account and subscription</p>
        </div>

        {/* Subscription Status Banner */}
        {isPro && subscription ? (
          <Card className="p-5 bg-gradient-to-br from-accent/10 to-accent/5 border-accent">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-accent-foreground" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-serif text-xl font-bold text-foreground">
                        Bloom Pro
                      </h2>
                      <Badge className="bg-accent text-accent-foreground">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enjoying unlimited access to Dahlia's analysis
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-medium">Started</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {formatDate(subscription.start_date)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-xs font-medium">Plan</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground capitalize">
                      {subscription.plan}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href="/subscription" className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Manage Plan
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelSubscription}
                    disabled={isCancelling}
                    className="flex-1"
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Subscription"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-5 bg-muted/50 border-dashed">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-foreground mb-1">
                  You're on the Free Plan
                </h2>
                <p className="text-sm text-muted-foreground">
                  Upgrade to Pro for unlimited access to Dahlia's analysis
                </p>
              </div>
              <Link href="/subscription">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* User Info Card */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{user.full_name || "Bloom User"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Member since</span>
              <span className="text-sm font-semibold text-foreground">
                {formatDate(user.join_date)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Investment experience</span>
              <Badge variant="outline" className="capitalize">
                {user.experience_level || "Not set"}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Risk tolerance</span>
              <Badge variant="outline" className="capitalize">
                {user.risk_tolerance || "Not set"}
              </Badge>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full justify-center gap-2"
              onClick={() => router.push("/onboarding")}
            >
              <UserIcon className="w-4 h-4" />
              Update Preferences
            </Button>
          </div>
        </Card>

        {/* Account Actions */}
        <Card className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </Card>

        {/* Disclaimer */}
        <Card className="p-3 bg-muted border-muted-foreground/20">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            Questions about your subscription? Contact us at support@bloom.app
          </p>
        </Card>
      </div>
    </Layout>
  );
}