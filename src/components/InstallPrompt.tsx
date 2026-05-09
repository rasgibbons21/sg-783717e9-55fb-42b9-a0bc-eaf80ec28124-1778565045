import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const visitCount = parseInt(localStorage.getItem("bloom_visit_count") || "0");
    const promptDismissed = localStorage.getItem("bloom_install_dismissed") === "true";
    
    localStorage.setItem("bloom_visit_count", String(visitCount + 1));

    if (visitCount >= 1 && !promptDismissed && !window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    } else {
      alert('To add Bloom to your home screen:\n\niOS: Tap Share → Add to Home Screen\n\nAndroid: Tap Menu (⋮) → Add to Home Screen');
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("bloom_install_dismissed", "true");
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-top duration-300">
      <Card className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg">
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🌸</span>
            </div>
            <p className="text-sm font-medium">
              Add Bloom to your home screen for quick access 🌸
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleInstall}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            >
              Add
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}