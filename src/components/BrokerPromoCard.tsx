import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackBrokerClick } from "@/lib/analytics";
import { getNextPromo, type BrokerPromo } from "@/config/brokerPromos";

const logoDevKey = process.env.NEXT_PUBLIC_LOGO_DEV_KEY?.trim();

export default function BrokerPromoCard({ onContinue }: { onContinue?: () => void }) {
  const [promo, setPromo] = useState<BrokerPromo | null>(null);

  useEffect(() => {
    setPromo(getNextPromo());
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
    <div className="mt-8 rounded-2xl border border-white/10 bg-[#121821] overflow-hidden">
      <div className="px-5 pt-4 pb-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#F3EDE3]/30">
          Sponsored
        </span>
      </div>

      <div className="px-5 pb-4">
        <div className="flex items-center gap-3 mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={promo.name}
            className="h-10 w-10 rounded-lg object-contain"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#F3EDE3]">{promo.name}</p>
            <p className="text-xs text-[#F3EDE3]/60 leading-relaxed">{promo.tagline}</p>
          </div>
        </div>

        <a
          href={promo.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="w-full rounded-xl bg-[#27B7C8] hover:bg-[#27B7C8]/90 px-4 py-2.5 text-sm font-semibold text-[#07080C] transition-all flex items-center justify-center gap-2"
        >
          Sign up
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="px-5 pb-3">
        <p className="text-[10px] text-[#F3EDE3]/25 leading-relaxed">
          We may earn a commission if you sign up. This is not financial advice. Trading involves risk.
        </p>
      </div>

      {onContinue && (
        <button
          onClick={onContinue}
          className="w-full border-t border-white/10 py-3 text-sm text-[#F3EDE3]/50 hover:text-[#27B7C8] hover:bg-white/5 transition-colors"
        >
          Continue to next lesson →
        </button>
      )}
    </div>
  );
}
