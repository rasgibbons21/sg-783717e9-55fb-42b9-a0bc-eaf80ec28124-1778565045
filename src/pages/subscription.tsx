import { useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Subscription() {
  const [isYearly, setIsYearly] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in", description: "You must be signed in to upgrade.", variant: "destructive" });
        setIsProcessing(false);
        return;
      }
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await supabase.from("users").update({ plan_type: "pro" }).eq("id", user.id);
      
      await supabase.from("subscriptions").insert({
        user_id: user.id,
        plan: "pro",
        status: "active",
        start_date: new Date().toISOString(),
        payment_method: "paypal",
        paypal_subscription_id: `sub_${Math.random().toString(36).substr(2, 9)}`
      });

      toast({ 
        title: "Welcome to Bloom Pro! 🌸", 
        description: "Your subscription has been activated." 
      });
      router.push("/home");
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <div className="text-center space-y-2 mt-4">
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Invest in Yourself
          </h1>
          <p className="text-muted-foreground">
            Unlock everything Bloom has to offer
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm ${!isYearly ? "font-bold text-foreground" : "text-muted-foreground"}`}>Monthly</span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isYearly ? "font-bold text-foreground" : "text-muted-foreground"}`}>Yearly</span>
            <Badge className="bg-accent/20 text-accent-foreground border-accent text-xs">
              Save 40%
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-6 space-y-4 border-border relative overflow-hidden">
            <div>
              <h3 className="font-serif text-2xl font-bold text-foreground">Free</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-border">
              {[
                "3 Dahlia's Picks per week",
                "Basic market summary",
                "Broker directory access",
                "Standard portfolio tracking"
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full text-primary border-primary mt-4" disabled>
              Current Plan
            </Button>
          </Card>

          <Card className="p-6 space-y-4 border-accent relative overflow-hidden bg-accent/5">
            <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">
              MOST POPULAR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-2xl font-bold text-foreground">Bloom Pro</h3>
                <span className="text-2xl">🌺</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">
                  ${isYearly ? "4.79" : "7.99"}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
              {isYearly && <p className="text-sm text-accent font-semibold mt-1">Billed $57.48 yearly</p>}
            </div>
            
            <div className="space-y-3 pt-4 border-t border-accent/20">
              {[
                "Unlimited daily Dahlia's Picks",
                "Dahlia's full analysis on every pick",
                "Stocks, ETFs, and Mutual Funds",
                "Real-time news and advanced charts",
                "Exclusive broker deals"
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-4 space-y-3">
              <Button 
                onClick={handleSubscribe} 
                disabled={isProcessing}
                className="w-full bg-[#FFC439] hover:bg-[#FFC439]/90 text-black font-semibold h-12"
              >
                {isProcessing ? "Processing..." : "Pay with PayPal"}
              </Button>
              <Button 
                onClick={handleSubscribe} 
                disabled={isProcessing}
                variant="outline" 
                className="w-full bg-white text-foreground border-border h-12"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay with Card
              </Button>
            </div>
          </Card>
        </div>
        
        <p className="text-xs text-center text-muted-foreground pt-4 pb-8">
          You can cancel your subscription at any time. By subscribing, you agree to our Terms of Service.
        </p>
      </div>
    </Layout>
  );
}