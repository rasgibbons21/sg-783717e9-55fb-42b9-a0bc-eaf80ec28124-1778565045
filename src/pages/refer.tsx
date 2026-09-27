import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Share2, Copy, Check, Gift, Users, ArrowRight } from "lucide-react";

const C = {
  teal: "#27B7C8",
  green: "#49B06E",
  ivory: "#F3EDE3",
  deep: "#07080C",
};

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

export default function ReferPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [stats, setStats] = useState<{ totalReferrals: number; rewardDays: number }>({ totalReferrals: 0, rewardDays: 0 });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (!s) {
        router.push("/onboarding");
        return;
      }
      setSession(s);

      try {
        const res = await fetch("/api/referral/stats", { headers: { Authorization: `Bearer ${s.access_token}` } });
        if (res.ok) {
          const data = await res.json();
          setCode(data.code || null);
          setStats({ totalReferrals: data.totalReferrals || 0, rewardDays: data.rewardDays || 0 });
        }
      } catch {}
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateCode = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch("/api/referral/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCode(data.code);
      }
    } catch {} finally { setLoading(false); }
  };

  const link = code ? `https://shebloomswealth.app/onboarding?ref=${code}` : "";

  const copyLink = async () => {
    if (!link) return;
    haptic();
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (!link) return;
    haptic(12);
    try {
      await navigator.share({
        title: "Join Radar — Free Stock Screener",
        text: "I use Radar for stock screening and alerts. Try it free:",
        url: link,
      });
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    } catch {}
  };

  return (
    <Layout>
      <SEO
        title="Radar | Invite Friends & Earn Rewards"
        description="Share Radar with friends. When they sign up, you both get rewarded with extra days of access."
      />
      <div className="max-w-lg mx-auto px-4 pt-6 pb-32">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: `${C.teal}15`, border: `1px solid ${C.teal}30` }}
          >
            <Gift className="w-7 h-7" style={{ color: C.teal }} />
          </motion.div>
          <h1 className="text-2xl font-bold text-[#F3EDE3] mb-2">Invite Friends</h1>
          <p className="text-sm text-[#F3EDE3]/45 max-w-xs mx-auto">
            Share your referral link. When a friend signs up, you both earn +7 days of access.
          </p>
        </div>

        {/* Stats */}
        {code && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Users className="w-5 h-5 mx-auto mb-2" style={{ color: C.teal }} />
              <p className="text-2xl font-bold font-mono text-[#F3EDE3]">{stats.totalReferrals}</p>
              <p className="text-[10px] text-[#F3EDE3]/40 mt-0.5">Friends Joined</p>
            </div>
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Gift className="w-5 h-5 mx-auto mb-2" style={{ color: C.green }} />
              <p className="text-2xl font-bold font-mono text-[#F3EDE3]">+{stats.rewardDays}d</p>
              <p className="text-[10px] text-[#F3EDE3]/40 mt-0.5">Days Earned</p>
            </div>
          </motion.div>
        )}

        {/* Code + Actions */}
        {code ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            {/* Link display */}
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-sm font-mono text-[#F3EDE3]/70 flex-1 truncate">{link}</p>
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95"
                style={{ background: copied ? `${C.green}20` : `${C.teal}15`, color: copied ? C.green : C.teal, border: `1px solid ${copied ? C.green : C.teal}30` }}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {/* Share button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={shareLink}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all"
              style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.green})`, color: C.deep }}
            >
              <Share2 className="w-4 h-4" />
              {shared ? "Shared!" : "Share with Friends"}
            </motion.button>
          </motion.div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={generateCode}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.green})`, color: C.deep }}
          >
            {loading ? "Generating..." : "Get Your Referral Link"}
          </motion.button>
        )}

        {/* How it works */}
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-[#F3EDE3]/50 mb-4">How it works</h2>
          <div className="space-y-3">
            {[
              { num: "1", text: "Share your unique referral link with a friend" },
              { num: "2", text: "They sign up for Radar using your link" },
              { num: "3", text: "You both get +7 days of access added to your accounts" },
            ].map(({ num, text }) => (
              <div
                key={num}
                className="flex items-center gap-3 rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: `${C.teal}15`, color: C.teal }}
                >
                  {num}
                </div>
                <span className="text-sm text-[#F3EDE3]/60">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
