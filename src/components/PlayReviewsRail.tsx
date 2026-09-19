import { Star } from "lucide-react";
import { APPLICATION_ID } from "@/config/proPlan";

const PLAY_URL = `https://play.google.com/store/apps/details?id=${APPLICATION_ID}`;
const RATE_URL = `market://details?id=${APPLICATION_ID}`;

interface PlayReview {
  name: string;
  rating: number;
  date: string;
  text: string;
}

const reviews: PlayReview[] = [];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className="w-3 h-3"
          fill={s <= count ? "#D4AF37" : "none"}
          stroke={s <= count ? "#D4AF37" : "rgba(244,247,250,0.15)"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export function PlayReviewsRail() {
  const isAndroid = typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);

  if (reviews.length < 5) {
    return (
      <div
        className="rounded-2xl p-4 mb-6"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">⭐</span>
          <h3 className="text-sm font-bold text-[#F3EDE3]">Reviews</h3>
        </div>
        <p className="text-xs text-[#F3EDE3]/40 mb-3">
          Be the first to review Radar on Play.
        </p>
        {isAndroid && (
          <a
            href={RATE_URL}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: "rgba(39,183,200,0.1)", color: "#27B7C8", border: "1px solid rgba(39,183,200,0.2)" }}
          >
            Rate Radar on Play
          </a>
        )}
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-4 mb-6"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">⭐</span>
          <h3 className="text-sm font-bold text-[#F3EDE3]">Popular on Play</h3>
        </div>
        <span className="text-[10px] text-[#F3EDE3]/30">{reviews.length} reviews</span>
      </div>

      <div className="space-y-3 mb-3">
        {reviews.slice(0, 5).map((review, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F3EDE3]/70">{review.name}</span>
              <span className="text-[10px] text-[#F3EDE3]/25">{review.date}</span>
            </div>
            <Stars count={review.rating} />
            <p className="text-xs text-[#F3EDE3]/50 line-clamp-2 leading-relaxed">{review.text}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={`${PLAY_URL}&showAllReviews=true`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-semibold transition-colors hover:text-[#27B7C8]"
          style={{ color: "rgba(39,183,200,0.7)" }}
        >
          Read all on Google Play →
        </a>
        {isAndroid && (
          <a
            href={RATE_URL}
            className="text-[11px] font-semibold transition-colors hover:text-[#49B06E]"
            style={{ color: "rgba(73,176,110,0.7)" }}
          >
            Rate Radar on Play
          </a>
        )}
      </div>
    </div>
  );
}
