import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PansyContextCardProps {
  message: string;
  tip?: string;
  action?: { label: string; href: string };
  variant?: "default" | "celebration" | "tip" | "coach";
  compact?: boolean;
}

const VARIANT_STYLES = {
  default: {
    border: "border-[#27B7C8]/15",
    bg: "bg-gradient-to-r from-[#27B7C8]/8 to-[#49B06E]/8",
    iconBg: "from-[#27B7C8] to-[#49B06E]",
  },
  celebration: {
    border: "border-[#F59E0B]/20",
    bg: "bg-gradient-to-r from-[#F59E0B]/8 to-[#49B06E]/8",
    iconBg: "from-[#F59E0B] to-[#49B06E]",
  },
  tip: {
    border: "border-[#8B5CF6]/15",
    bg: "bg-gradient-to-r from-[#8B5CF6]/8 to-[#27B7C8]/8",
    iconBg: "from-[#8B5CF6] to-[#27B7C8]",
  },
  coach: {
    border: "border-[#49B06E]/20",
    bg: "bg-gradient-to-r from-[#49B06E]/8 to-[#27B7C8]/5",
    iconBg: "from-[#49B06E] to-[#27B7C8]",
  },
};

export function PansyContextCard({
  message,
  tip,
  action,
  variant = "default",
  compact = false,
}: PansyContextCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`rounded-2xl border ${styles.border} ${styles.bg} ${compact ? "p-3" : "p-4"}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`${compact ? "w-8 h-8 text-sm" : "w-10 h-10 text-base"} rounded-full bg-gradient-to-br ${styles.iconBg} flex items-center justify-center shrink-0 shadow-sm`}
        >
          🌺
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className={`${compact ? "text-xs" : "text-sm"} text-foreground/90 leading-relaxed`}>
            {message}
          </p>
          {tip && (
            <p className={`${compact ? "text-[11px]" : "text-xs"} text-muted-foreground leading-relaxed`}>
              {tip}
            </p>
          )}
          {action && (
            <Link
              href={action.href}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#27B7C8] hover:text-[#27B7C8]/80 transition-colors mt-1"
            >
              {action.label}
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
          <p className={`${compact ? "text-[9px]" : "text-[10px]"} text-muted-foreground`}>
            — Pansy 🌺
          </p>
        </div>
      </div>
    </motion.div>
  );
}
