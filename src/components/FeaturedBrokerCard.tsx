import { useState, useEffect } from "react";
import { ExternalLink, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackBrokerClick } from "@/lib/analytics";
import { getFeaturedPromo, type BrokerPromo } from "@/config/brokerPromos";

const logoDevKey = process.env.NEXT_PUBLIC_LOGO_DEV_KEY?.trim();

export default function FeaturedBrokerCard({ context }: { context?: string }) {
  const [promo, setPromo] = useState<BrokerPromo | null>(null);

  useEffect(() => {
    setPromo(getFeaturedPromo());
  }, []);

  if (!promo) return null;

  const logoUrl = logoDevKey && promo.logoDomain
    ? `https://img.logo.dev/${promo.logoDomain}?token=${logoDevKey}&size=64&format=png`
    : `/logos/${promo.id}-logo.svg`;

  const handleClick = () => {
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
    <div className="mb-5 rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(39,183,200,0.12) 0%, rgba(73,176,110,0.08) 50%, rgba(39,183,200,0.06) 100%)", border: "1px solid rgba(39,183,200,0.2)" }}>
      <div className="px-4 pt-3 pb-1 flex items-center gap-1.5">
        <Star className="w-3 h-3 text-[#27B7C8]" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#27B7C8]/70">Featured Broker</span>
      </div>
      <div className="px-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={promo.name}
            className="h-11 w-11 rounded-xl object-contain"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#F3EDE3]">{promo.name}</p>
            <p className="text-xs text-[#F3EDE3]/50 leading-snug">{promo.tagline}</p>
          </div>
        </div>
        <a
          href={promo.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="w-full rounded-xl bg-[#27B7C8] hover:bg-[#27B7C8]/90 px-4 py-2.5 text-sm font-bold text-[#07080C] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          Open Free Account <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <div className="px-4 pb-2.5">
        <p className="text-[9px] text-[#F3EDE3]/20 leading-relaxed">
          Trading CFDs and forex carries a high risk of losing money. Not financial advice. We may earn a commission if you sign up.
        </p>
      </div>
    </div>
  );
}
