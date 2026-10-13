import { AlertCircle, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function BrokerHubDisclaimer() {
  return (
    <div className="space-y-3">
      <Card className="rounded-2xl border-primary/20 bg-primary/5 p-5">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Bloom is an educational platform and is not a broker. Some links are affiliate or referral links. Bloom may receive compensation if you open an account or purchase a service through one of these links, at no additional cost to you.
          </p>
        </div>
      </Card>

      <Card className="rounded-2xl border-destructive/20 bg-destructive/5 p-5">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-destructive mt-0.5" />
          <p className="text-xs text-destructive/80 leading-relaxed">
            Trading and investing involve risk. CFDs, leveraged products, options, forex, and futures can result in substantial losses and may not be suitable for everyone. Review each provider&apos;s terms, fees, regulation, and regional availability before opening an account.
          </p>
        </div>
      </Card>
    </div>
  );
}
