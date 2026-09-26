import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useSubscription } from "@/contexts/SubscriptionContext";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageCircle, NotebookPen, GraduationCap, TrendingUp,
  Building2, User, FileText, ChevronRight, Activity,
} from "lucide-react";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

const LINKS = [
  { href: "/ask-pansy", icon: MessageCircle, label: "Pansy", desc: "AI trading analyst", color: "#A855F7" },
  { href: "/journal", icon: NotebookPen, label: "Journal", desc: "Trade journal & review", color: "#F59E0B" },
  { href: "/learn", icon: GraduationCap, label: "Academy", desc: "Lessons & strategy lab", color: "#27B7C8" },
  { href: "/backtest", icon: Activity, label: "Backtest", desc: "Strategy performance tracker", color: "#EC4899" },
  { href: "/paper-trader-v2", icon: TrendingUp, label: "Paper Trade", desc: "$10K virtual simulator", color: "#49B06E" },
  { href: "/brokers", icon: Building2, label: "Brokers", desc: "Brokerage comparison", color: "#06B6D4" },
  { href: "/profile", icon: User, label: "Settings", desc: "Account & preferences", color: "#F3EDE3" },
];

const LEGAL = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/delete-account", label: "Delete Account" },
  { href: "/contact", label: "Contact" },
];

export default function MorePage() {
  const { userName, isPaid } = useSubscription();

  return (
    <Layout>
      <SEO title="Radar | More" description="Pansy, Journal, Academy, Paper Trade, Brokers, Settings, and Legal." />
      <div className="max-w-lg mx-auto px-4 pt-4 pb-32">

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-[#F3EDE3]">More</h1>
          {userName && (
            <p className="text-xs text-[#F3EDE3]/40 mt-0.5">
              {userName}{isPaid ? " · Pro" : ""}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="space-y-1.5 mb-6">
          {LINKS.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => haptic()}
                  className="flex items-center gap-3 rounded-xl p-3.5 transition-all"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#F3EDE3]">{item.label}</p>
                    <p className="text-[10px] text-[#F3EDE3]/40">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#F3EDE3]/20 flex-shrink-0" />
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Legal */}
        <div>
          <h2 className="text-xs font-semibold text-[#F3EDE3]/30 uppercase tracking-wider mb-2 px-1">Legal</h2>
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            {LEGAL.map((item, i) => (
              <Link key={item.href} href={item.href}>
                <div
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/5"
                  style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                >
                  <span className="text-xs text-[#F3EDE3]/60">{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#F3EDE3]/15" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Brand */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-[#F3EDE3]/20">Radar</p>
          <p className="text-[9px] text-[#F3EDE3]/15 mt-1">© 2026 Cinder Vault Enterprises LLC</p>
        </div>
      </div>
    </Layout>
  );
}
