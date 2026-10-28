import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackBrokerClick } from "@/lib/analytics";
import { getFeaturedPromo, type BrokerPromo } from "@/config/brokerPromos";

const logoDevKey = process.env.NEXT_PUBLIC_LOGO_DEV_KEY?.trim();

export default function BrokerStrip({ context }: { context?: string }) {
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
    <div className="my-5 rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(39,183,200,0.08), rgba(73,176,110,0.06))", border: "1px solid rgba(39,183,200,0.15)" }}>
      <div className="px-4 py-3 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={promo.name}
          className="h-8 w-8 rounded-lg object-contain flex-shrink-0"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#F3EDE3]">
            Ready to trade? Try {promo.name}
          </p>
          <p className="text-[10px] text-[#F3EDE3]/50 leading-snug">{promo.tagline}</p>
        </div>
        <a
          href={promo.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="flex-shrink-0 flex items-center gap-1.5 rounded-xl bg-[#27B7C8] hover:bg-[#27B7C8]/90 px-4 py-2 text-xs font-bold text-[#07080C] transition-all active:scale-95"
        >
          Sign up <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="px-4 pb-2">
        <p className="text-[9px] text-[#F3EDE3]/20 leading-relaxed">
          Trading CFDs and forex carries a high risk of losing money. Not financial advice. We may earn a commission if you sign up.
        </p>
      </div>
    </div>
  );
}
