import { Card } from "@/components/ui/card";

export default function Offline() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
          <span className="text-4xl">🌺</span>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-2xl font-serif font-semibold text-foreground">
            You're offline right now
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            You're offline right now 🌺 but your saved picks are still here. Connect to get the latest from me.
          </p>
          <p className="text-sm text-muted-foreground italic">
            — Dahlia
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </Card>
    </div>
  );
}