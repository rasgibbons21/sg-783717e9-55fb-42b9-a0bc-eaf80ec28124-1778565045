import { useState } from "react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: "view_limit" | "after_analysis" | "discover" | "portfolio" | "goals";
}

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  void onClose;
  return null;
}

export function UpgradeBanner({ message: _message, className: _className = "" }: { message: string; className?: string }) {
  return null;
}

export function useViewTracker() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  return {
    viewCount: 0,
    trackView: () => {},
    showUpgradeModal,
    setShowUpgradeModal,
  };
}
