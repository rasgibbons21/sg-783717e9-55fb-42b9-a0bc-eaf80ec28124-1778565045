import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Download, Share } from "lucide-react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if prompt was dismissed recently
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < sevenDays) {
        return; // Don't show if dismissed within last 7 days
      }
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      console.log('beforeinstallprompt event fired');
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show prompt after 30 seconds if not iOS and not already installed
    const timer = setTimeout(() => {
      if (!standalone) {
        setShowPrompt(true);
      }
    }, 30000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('No deferred prompt available');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User response to the install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.setItem('installPromptDismissed', Date.now().toString());
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('installPromptDismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <Card className="pointer-events-auto bg-card border-accent shadow-2xl rounded-2xl overflow-hidden max-w-md mx-auto animate-in slide-in-from-bottom-5">
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <img
              src="/bloom-logo.png"
              alt="Bloom"
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-foreground">
                Install Bloom
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Add Bloom to your home screen for quick access to your investments 🌸
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isIOS ? (
            <Card className="p-3 bg-primary/5 border-primary/20 rounded-xl">
              <div className="flex items-start gap-2">
                <Share className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-foreground leading-relaxed">
                  Tap the <span className="font-semibold">Share</span> button below, 
                  then tap <span className="font-semibold">"Add to Home Screen"</span> to 
                  install Bloom 🌸
                </p>
              </div>
            </Card>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={!deferredPrompt}
              >
                <Download className="w-4 h-4 mr-2" />
                Add to Home Screen
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                Not now
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}