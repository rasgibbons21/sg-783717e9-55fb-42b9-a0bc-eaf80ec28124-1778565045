import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Minus, X } from "lucide-react";
import { useRouter } from "next/router";
import { DESK_PLAN, PRO_PLAN, FEATURE_MATRIX } from "@/config/proPlan";
import { usePaymentProvider } from "@/lib/payments";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: string;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const router = useRouter();
  const { canShowExternalPayment, canShowInAppPayment } = usePaymentProvider();

  if (!canShowExternalPayment && !canShowInAppPayment) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-[#0C1016] border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#F3EDE3]">Upgrade</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
              <X className="w-4 h-4 text-[#F3EDE3]/50" />
            </button>
          </div>
          <p className="text-muted-foreground">Subscriptions are not available in this version.</p>
          <Button variant="outline" onClick={onClose} className="w-full mt-2">Got it</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-[#0C1016] border-[rgba(255,255,255,0.1)] p-0 overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#F3EDE3]">Upgrade your desk</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
            <X className="w-4 h-4 text-[#F3EDE3]/50" />
          </button>
        </div>

        {/* Compact feature matrix */}
        <div className="px-5 pb-3">
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="grid grid-cols-4 text-[10px] font-bold uppercase tracking-wider px-3 py-2" style={{ background: "rgba(255,255,255,0.04)" }}>
              <span className="text-muted-foreground">Feature</span>
              <span className="text-center text-muted-foreground">Free</span>
              <span className="text-center text-[#27B7C8]">Desk</span>
              <span className="text-center text-[#a855f7]">Pro</span>
            </div>
            {FEATURE_MATRIX.map((row, i) => (
              <div key={row.label} className="grid grid-cols-4 px-3 py-2 text-xs items-center"
                style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                <span className="text-[#F3EDE3] font-medium">{row.label}</span>
                <CellVal value={row.free} />
                <CellVal value={row.desk} accent />
                <CellVal value={row.pro} accent />
              </div>
            ))}
          </div>
        </div>

        {/* Plan CTAs */}
        <div className="px-5 pb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 text-center" style={{ background: "rgba(39,183,200,0.06)", border: "1px solid rgba(39,183,200,0.2)" }}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Desk</p>
            <p className="text-lg font-bold text-[#F3EDE3]">${DESK_PLAN.monthlyPrice}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
            <p className="text-[10px] text-muted-foreground mb-2">or ${DESK_PLAN.yearlyPrice}/yr</p>
            <Button
              size="sm"
              className="w-full text-[#07080C] font-bold text-xs"
              style={{ background: "linear-gradient(135deg, #27B7C8, #49B06E)" }}
              onClick={() => { onClose(); router.push("/subscription"); }}
            >
              Run the desk
            </Button>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)" }}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Pro</p>
            <p className="text-lg font-bold text-[#F3EDE3]">${PRO_PLAN.monthlyPrice}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
            <p className="text-[10px] text-muted-foreground mb-2">or ${PRO_PLAN.yearlyPrice}/yr</p>
            <Button
              size="sm"
              className="w-full font-bold text-white text-xs"
              style={{ background: "linear-gradient(135deg, #a855f7, #27B7C8)" }}
              onClick={() => { onClose(); router.push("/subscription"); }}
            >
              Go Pro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CellVal({ value, accent }: { value: string; accent?: boolean }) {
  if (value === "—") return <span className="text-center"><Minus className="w-3 h-3 text-muted-foreground/30 mx-auto" /></span>;
  if (value === "Open") return <span className="text-center"><Check className="w-3 h-3 text-[#49B06E] mx-auto" /></span>;
  return <span className={`text-center text-[10px] ${accent ? "text-[#F3EDE3]" : "text-muted-foreground"}`}>{value}</span>;
}

export function UpgradeBanner({ message, className = "" }: { message: string; className?: string }) {
  const router = useRouter();
  const { canShowExternalPayment, canShowInAppPayment } = usePaymentProvider();
  const [isVisible, setIsVisible] = useState(true);

  if ((!canShowExternalPayment && !canShowInAppPayment) || !isVisible) return null;

  return (
    <div className={`p-4 rounded-2xl flex items-center justify-between gap-4 ${className}`}
      style={{ background: "linear-gradient(135deg, rgba(39,183,200,0.08), rgba(168,85,247,0.08))", border: "1px solid rgba(39,183,200,0.2)" }}>
      <div className="flex items-center gap-3 flex-1">
        <p className="text-sm font-medium text-foreground">{message}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => setIsVisible(false)} className="h-8 px-2">
          <X className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          className="text-[#07080C] font-bold h-8 px-4"
          style={{ background: "linear-gradient(135deg, #27B7C8, #49B06E)" }}
          onClick={() => router.push("/subscription")}
        >
          Upgrade
        </Button>
      </div>
    </div>
  );
}

export function useViewTracker() {
  const [viewCount, setViewCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { canShowExternalPayment: canStripe, canShowInAppPayment: canGP } = usePaymentProvider();

  const trackView = () => {
    if (!canStripe && !canGP) return;
    const count = parseInt(localStorage.getItem("bloom-daily-views") || "0");
    const lastReset = localStorage.getItem("bloom-views-reset");
    const today = new Date().toDateString();

    let newCount: number;
    if (lastReset !== today) {
      localStorage.setItem("bloom-views-reset", today);
      localStorage.removeItem("bloom-upgrade-dismissed");
      newCount = 1;
    } else {
      newCount = count + 1;
    }
    setViewCount(newCount);
    localStorage.setItem("bloom-daily-views", newCount.toString());

    const dismissedToday = localStorage.getItem("bloom-upgrade-dismissed") === today;
    if (newCount >= 3 && !dismissedToday) setShowUpgradeModal(true);
  };

  return { viewCount, trackView, showUpgradeModal, setShowUpgradeModal };
}
