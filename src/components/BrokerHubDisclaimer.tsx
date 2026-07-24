import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function BrokerHubDisclaimer() {
  return (
    <Card className="rounded-2xl border-primary/20 bg-primary/5 p-5">
      <div className="flex gap-4">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground text-sm">Educational Platform</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Bloom is an educational platform. We are not a broker and do not provide
            investment or trading advice. The information on this page is for educational
            purposes only. Please compare broker features carefully before opening an account.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground/80">Affiliate Disclosure:</span> Some
            links on this page are affiliate links. Bloom may earn a commission if you open an
            account through one of our partners at no additional cost to you.
          </p>
        </div>
      </div>
    </Card>
  );
}
