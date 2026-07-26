import { Card } from "@/components/ui/card";
import { BookOpen, TrendingUp, Shield, AlertTriangle } from "lucide-react";

const cards = [
  {
    icon: BookOpen,
    title: "What is a Broker?",
    body: "A broker is a company that lets you buy and sell investments like stocks, ETFs, forex, and more. They provide the platform and tools to execute your trades.",
  },
  {
    icon: TrendingUp,
    title: "Stocks vs. Forex vs. CFDs",
    body: "Stocks represent ownership in a company. Forex is trading currencies. CFDs let you speculate on price movements without owning the asset. Each has different risk levels.",
  },
  {
    icon: Shield,
    title: "Why Regulation Matters",
    body: "Regulated brokers must follow rules that protect your money. Always verify a broker is authorized by a financial regulator in your region before depositing funds.",
  },
  {
    icon: AlertTriangle,
    title: "Understanding Risk",
    body: "All trading involves risk. CFDs and leveraged products carry higher risk — most retail traders lose money on them. Never invest more than you can afford to lose.",
  },
];

export default function BrokerEducationCards() {
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-bold text-foreground">Learn Before You Trade</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Card key={card.title} className="p-5 bg-card/80 border-border/50 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-primary/10 shrink-0">
                <card.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-1">{card.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.body}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
