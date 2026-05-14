import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { WifiOff } from "lucide-react";

export default function Offline() {
  return (
    <Layout>
      <div className="container-full py-12 flex items-center justify-center min-h-[70vh]">
        <Card className="p-8 bg-card border-border rounded-2xl text-center max-w-md space-y-4">
          <div className="flex justify-center">
            <WifiOff className="w-16 h-16 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            You're Offline
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Looks like you lost your internet connection girl. Don't worry, 
            your saved data is still here. Just reconnect and you'll be 
            back to building wealth in no time 💛
          </p>
          <p className="text-sm text-muted-foreground">
            — Dahlia 🌺
          </p>
        </Card>
      </div>
    </Layout>
  );
}