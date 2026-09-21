import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useSubscription } from "@/contexts/SubscriptionContext";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageCircle, NotebookPen, GraduationCap, TrendingUp,
  Building2, User, ChevronRight, Layers, Crown, Sparkles,
  ArrowRight,
} from "lucide-react";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

const TOOLS = [
  { href: "/ask-pansy", icon: MessageCircle, label: "Pansy", desc: "AI trading analyst", color: "#A855F7" },
  { href: "/journal", icon: NotebookPen, label: "Journal", desc: "Trade journal & review", color: "#F59E0B" },
  { href: "/paper-trader-v2", icon: TrendingUp, label: "Paper Trade", desc: "$10K virtual simulator", color: "#49B06E" },
  { href: "/brokers", icon: Building2, label: "Brokers", desc: "Brokerage comparison", color: "#06B6D4" },
];

const LEARNING = [
  { href: "/learn", icon: GraduationCap, label: "Academy", desc: "Lessons & strategy guides", color: "#27B7C8" },
  { href: "/academy/patterns", icon: Layers, label: "Pattern Library", desc: "24 chart & momentum patterns", color: "#8B5CF6" },
];

const LEGAL = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/delete-account", label: "Delete Account" },
  { href: "/contact", label: "Contact" },
];

function LinkItem({ item, i }: { item: typeof TOOLS[number]; i: number }) {
  const Icon = item.icon;
  return (
    <Link href={item.href}>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => haptic()}
        className="flex items-center gap-3 rounded-xl p-3.5 transition-all group"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${item.color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color: item.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#F3EDE3] group-hover:text-white transition-colors">{item.label}</p>
          <p className="text-[10px] text-[#F3EDE3]/40">{item.desc}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-[#F3EDE3]/15 group-hover:text-[#F3EDE3]/30 transition-colors flex-shrink-0" />
      </motion.div>
    </Link>
  );
}

function SubscriptionCard({ isPro }: { isPro: boolean }) {
  if (isPro) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(39,183,200,0.12), rgba(168,85,247,0.08))",
          border: "1px solid rgba(39,183,200,0.2)",
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #27B7C8, transparent)", transform: "translate(30%, -30%)" }} />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(39,183,200,0.2)" }}>
            <Crown className="w-5 h-5 text-[#27B7C8]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#F3EDE3]">Radar Core</p>
            <p className="text-[10px] text-[#27B7C8]">Active subscription</p>
          </div>
          <Link href="/profile">
            <motion.div whileTap={{ scale: 0.95 }} className="text-[10px] font-semibold text-[#F3EDE3]/40 px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              Manage
            </motion.div>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <Link href="/onboarding">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => haptic()}
        className="rounded-2xl p-4 relative overflow-hidden cursor-pointer group"
        style={{
          background: "linear-gradient(135deg, rgba(39,183,200,0.1), rgba(168,85,247,0.06))",
          border: "1px solid rgba(39,183,200,0.2)",
        }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, #27B7C8, transparent)", transform: "translate(30%, -40%)" }} />

        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#27B7C8]" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#27B7C8]">Founders pricing</span>
        </div>

        <h3 className="text-base font-bold text-[#F3EDE3] mb-1">Unlock Radar Core</h3>
        <p className="text-[11px] text-[#F3EDE3]/40 mb-3 leading-relaxed">
          AI scanner, strategy signals, pattern library &amp; more.
        </p>

        <div className="flex items-center gap-4 mb-3">
          <div>
            <span className="text-lg font-bold text-[#F3EDE3]">$4.99</span>
            <span className="text-[10px] text-[#F3EDE3]/40">/mo</span>
          </div>
          <div className="w-px h-6" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div>
            <span className="text-lg font-bold text-[#F3EDE3]">$29.99</span>
            <span className="text-[10px] text-[#F3EDE3]/40">/yr</span>
          </div>
          <div className="w-px h-6" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div>
            <span className="text-lg font-bold text-[#F3EDE3]">$69.99</span>
            <span className="text-[10px] text-[#F3EDE3]/30 ml-0.5">lifetime</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#27B7C8] group-hover:gap-2.5 transition-all">
          Start 7-day free trial <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </motion.div>
    </Link>
  );
}

export default function MorePage() {
  const { userName, isPro } = useSubscription();

  return (
    <Layout>
      <SEO title="Bloom Radar | More" description="Pansy, Journal, Academy, Pattern Library, Paper Trade, Brokers, Settings, and Legal." />
      <div className="max-w-lg mx-auto px-4 pt-4 pb-32">

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-[#F3EDE3]">More</h1>
          {userName && (
            <p className="text-xs text-[#F3EDE3]/40 mt-0.5">
              {userName}{isPro ? " · Pro" : ""}
            </p>
          )}
        </div>

        {/* Subscription Card */}
        <div className="mb-5">
          <SubscriptionCard isPro={isPro} />
        </div>

        {/* Tools */}
        <div className="mb-5">
          <h2 className="text-[10px] font-bold text-[#F3EDE3]/25 uppercase tracking-wider mb-2 px-1">Tools</h2>
          <div className="space-y-1.5">
            {TOOLS.map((item, i) => (
              <LinkItem key={item.href} item={item} i={i} />
            ))}
          </div>
        </div>

        {/* Learning */}
        <div className="mb-5">
          <h2 className="text-[10px] font-bold text-[#F3EDE3]/25 uppercase tracking-wider mb-2 px-1">Learning</h2>
          <div className="space-y-1.5">
            {LEARNING.map((item, i) => (
              <LinkItem key={item.href} item={item} i={i} />
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="mb-6">
          <h2 className="text-[10px] font-bold text-[#F3EDE3]/25 uppercase tracking-wider mb-2 px-1">Account</h2>
          <Link href="/profile">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => haptic()}
              className="flex items-center gap-3 rounded-xl p-3.5 transition-all group"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(243,237,227,0.06)" }}>
                <User className="w-5 h-5 text-[#F3EDE3]/60" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#F3EDE3]">Settings</p>
                <p className="text-[10px] text-[#F3EDE3]/40">Account &amp; preferences</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#F3EDE3]/15 flex-shrink-0" />
            </motion.div>
          </Link>
        </div>

        {/* Legal */}
        <div>
          <h2 className="text-[10px] font-bold text-[#F3EDE3]/25 uppercase tracking-wider mb-2 px-1">Legal</h2>
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
                  <span className="text-xs text-[#F3EDE3]/50">{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#F3EDE3]/15" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Brand */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-[#F3EDE3]/20">Bloom Radar · She Blooms Wealth</p>
          <p className="text-[9px] text-[#F3EDE3]/15 mt-1">&copy; 2026 Cinder Vault Enterprises LLC</p>
        </div>
      </div>
    </Layout>
  );
}
