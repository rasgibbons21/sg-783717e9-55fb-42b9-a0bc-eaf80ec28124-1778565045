import { useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Loader2 } from "lucide-react";

export default function SubscriptionOffer() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/subscription");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEO title="Radar — Plans" description="View Radar subscription plans." />
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}
