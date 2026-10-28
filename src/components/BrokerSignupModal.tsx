import { useState, useEffect } from "react";
import { ExternalLink, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { trackBrokerClick } from "@/lib/analytics";
import { getFeaturedPromo, getNextPromo, type BrokerPromo } from "@/config/brokerPromos";

const logoDevKey = process.env.NEXT_PUBLIC_LOGO_DEV_KEY?.trim();

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function BrokerSignupModal({ open, onClose }: Props) {
  const [featured, setFeatured] = useState<BrokerPromo | null>(null);
  const [secondary, setSecondary] = useState<BrokerPromo | null>(null);

  useEffect(() => {
    if (open) {
      setFeatured(getFeaturedPromo());
      const alt = getNextPromo();
      setSecondary(alt.id === "xm" ? getNextPromo() : alt);
    }
  }, [open]);

  const logoUrl = (p: BrokerPromo) =>
    logoDevKey && p.logoDomain
      ? `https://img.logo.dev/${p.logoDomain}?token=${logoDevKey}&size=64&format=png`
      : `/logos/${p.id}-logo.svg`;

  const handleClick = (promo: BrokerPromo) => {
    trackBrokerClick(promo.name);
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        supabase.from("broker_clicks").insert({
          broker_name: promo.name,
          user_id: session?.user?.id ?? null,
        });
      });
    } catch {}
  };

  return (
    <AnimatePresence>
      {open && featured && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-sm rounded-2xl overflow-hidden relative"
            style={{ background: "#0E1B30", border: "1px solid rgba(39,183,200,0.2)" }}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 transition-colors z-10"
            >
              <X className="w-4 h-4 text-[#F3EDE3]/40" />
            </button>

            <div className="px-5 pt-6 pb-4 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3" style={{ background: "rgba(39,183,200,0.1)", border: "1px solid rgba(39,183,200,0.2)" }}>
                <Sparkles className="w-3.5 h-3.5 text-[#27B7C8]" />
                <span className="text-xs font-semibold text-[#27B7C8]">Lesson Complete</span>
              </div>
              <h3 className="text-lg font-bold text-[#F3EDE3] mb-1">Ready to start trading?</h3>
              <p className="text-xs text-[#F3EDE3]/50">Put your knowledge into practice with a trusted broker</p>
            </div>

            <div className="px-5 pb-3">
              <div className="rounded-xl p-3 mb-2" style={{ background: "linear-gradient(135deg, rgba(39,183,200,0.1), rgba(73,176,110,0.06))", border: "1px solid rgba(39,183,200,0.15)" }}>
                <div className="flex items-center gap-3 mb-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl(featured)} alt={featured.name} className="h-10 w-10 rounded-lg object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-[#F3EDE3]">{featured.name}</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#27B7C8]/15 text-[#27B7C8]">FEATURED</span>
                    </div>
                    <p className="text-[11px] text-[#F3EDE3]/50 leading-snug">{featured.tagline}</p>
                  </div>
                </div>
                <a
                  href={featured.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={() => handleClick(featured)}
                  className="w-full rounded-xl bg-[#27B7C8] hover:bg-[#27B7C8]/90 px-4 py-2.5 text-sm font-bold text-[#07080C] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Open Free Account <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              {secondary && secondary.id !== featured.id && (
                <a
                  href={secondary.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={() => handleClick(secondary)}
                  className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/5 transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl(secondary)} alt={secondary.name} className="h-8 w-8 rounded-lg object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#F3EDE3]">{secondary.name}</p>
                    <p className="text-[10px] text-[#F3EDE3]/40">{secondary.tagline}</p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-[#F3EDE3]/30 flex-shrink-0" />
                </a>
              )}
            </div>

            <div className="px-5 pb-3">
              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs font-medium text-[#F3EDE3]/40 hover:text-[#F3EDE3]/60 transition-colors"
              >
                Maybe later
              </button>
            </div>

            <div className="px-5 pb-4">
              <p className="text-[9px] text-[#F3EDE3]/20 leading-relaxed text-center">
                Trading CFDs and forex carries a high risk of losing money. Not financial advice. We may earn a commission if you sign up.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
