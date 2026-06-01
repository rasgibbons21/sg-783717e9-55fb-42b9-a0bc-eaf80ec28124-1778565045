import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface LockedFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  featureDescription?: string;
}

export function LockedFeatureModal({
  isOpen,
  onClose,
  featureName,
  featureDescription
}: LockedFeatureModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-3xl mx-auto mb-4">
            🌺
          </div>
          <DialogTitle className="font-serif text-2xl text-center">
            Sign up free to unlock {featureName}
          </DialogTitle>
          {featureDescription && (
            <DialogDescription className="text-center text-base mt-2">
              {featureDescription}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <Link href="/" className="block">
            <Button 
              className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-6 text-base"
              onClick={onClose}
            >
              Sign up free
            </Button>
          </Link>

          <div className="text-center">
            <Link 
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground underline"
              onClick={onClose}
            >
              Already have an account? Log in
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">✓</span>
              <span>Pansy's full analysis on unlimited stocks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">✓</span>
              <span>Save your watchlist and track your goals</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">✓</span>
              <span>Real-time market data and news</span>
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}