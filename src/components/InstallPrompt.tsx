import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Share2, Plus, Check } from "lucide-react";

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    console.log("InstallPrompt: Component mounted");

    // Device and browser detection
    const userAgent = navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(userAgent);
    const android = /android/.test(userAgent);
    const standalone = window.matchMedia('(display-mode: standalone)').matches;

    console.log("InstallPrompt: Device detection", { iOS, android, standalone });

    setIsIOS(iOS);
    setIsAndroid(android);
    setIsStandalone(standalone);

    // If already installed as PWA, don't show anything
    if (standalone) {
      console.log("InstallPrompt: App is in standalone mode, not showing prompt");
      return;
    }

    // Check if dismissed recently
    const dismissedStr = localStorage.getItem('bloom_install_dismissed');
    if (dismissedStr) {
      const dismissedTime = parseInt(dismissedStr);
      const fourteenDays = 14 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < fourteenDays) {
        console.log("InstallPrompt: Recently dismissed, not showing prompt");
        return;
      }
    }

    // For Android/Chrome/Edge - capture the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      console.log("InstallPrompt: beforeinstallprompt event captured");
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show prompt after 10 seconds
    const timer = setTimeout(() => {
      console.log("InstallPrompt: 10 seconds elapsed, showing prompt");
      setShowPrompt(true);
    }, 10000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log("InstallPrompt: Install button clicked", { isIOS, deferredPrompt });

    // For iOS Safari - show custom instructions modal
    if (isIOS) {
      console.log("InstallPrompt: Showing iOS modal");
      setShowIOSModal(true);
      return;
    }

    // For Android/Chrome/Edge - use native prompt
    if (deferredPrompt) {
      console.log("InstallPrompt: Triggering deferred prompt");
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`InstallPrompt: User response: ${outcome}`);
        
        setDeferredPrompt(null);
        setShowPrompt(false);
        localStorage.setItem('bloom_install_dismissed', Date.now().toString());
      } catch (error) {
        console.error("InstallPrompt: Error showing prompt:", error);
      }
    } else {
      console.log("InstallPrompt: No deferred prompt available");
    }
  };

  const handleDismiss = () => {
    console.log("InstallPrompt: Prompt dismissed");
    setShowPrompt(false);
    localStorage.setItem('bloom_install_dismissed', Date.now().toString());
  };

  const handleIOSModalClose = () => {
    console.log("InstallPrompt: iOS modal closed");
    setShowIOSModal(false);
    setShowPrompt(false);
    localStorage.setItem('bloom_install_dismissed', Date.now().toString());
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <>
      {/* Install Prompt Banner */}
      <div className="fixed bottom-20 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5">
        <Card className="relative bg-card border-accent/30 shadow-2xl rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-50"></div>
          <div className="relative p-5">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 pr-8">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
                  <img
                    src="/bloom-logo.png"
                    alt="Bloom"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-lg mb-1">
                  Add Bloom to your home screen
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Quick access to your investments 🌸
                </p>

                <div className="flex gap-2">
                  <Button
                    onClick={handleInstallClick}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold h-12 rounded-xl cursor-pointer transition-all hover:scale-105 active:scale-95"
                    style={{ minHeight: '48px' }}
                  >
                    Add to Home Screen
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground h-12 rounded-xl"
                  >
                    Not now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* iOS Install Instructions Modal */}
      <Dialog open={showIOSModal} onOpenChange={setShowIOSModal}>
        <DialogContent className="bg-card border-border max-w-md p-0 gap-0 rounded-3xl overflow-hidden">
          {/* Handle bar */}
          <div className="flex justify-center py-3 bg-muted/30">
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full"></div>
          </div>

          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <img
                    src="/bloom-logo.png"
                    alt="Bloom"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Add Bloom to Your Home Screen
                </h2>
                <p className="text-sm text-muted-foreground">
                  Follow these 3 quick steps in Safari
                </p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 pt-1">
                  <div className="text-xs font-semibold text-accent mb-1">STEP 1</div>
                  <p className="text-sm text-foreground leading-relaxed">
                    Tap the <span className="font-semibold">Share button</span> at the bottom of your screen
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 pt-1">
                  <div className="text-xs font-semibold text-accent mb-1">STEP 2</div>
                  <p className="text-sm text-foreground leading-relaxed">
                    Scroll down and tap <span className="font-semibold">Add to Home Screen</span>
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 pt-1">
                  <div className="text-xs font-semibold text-accent mb-1">STEP 3</div>
                  <p className="text-sm text-foreground leading-relaxed">
                    Tap <span className="font-semibold">Add</span> in the top right corner
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom button */}
            <Button
              onClick={handleIOSModalClose}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-12 rounded-xl"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
}