import { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';

interface ReviewPromptProps {
  onClose: () => void;
  trigger?: string;
}

const STORAGE_KEY = 'bloom-review-prompted';
const REVIEW_URL_IOS = 'https://apps.apple.com/app/id6742758994?action=write-review';
const REVIEW_URL_ANDROID = 'https://play.google.com/store/apps/details?id=app.shebloomswealth.mobile';
const REVIEW_URL_WEB = 'https://shebloomswealth.app';

function getReviewUrl() {
  if (typeof navigator === 'undefined') return REVIEW_URL_WEB;
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return REVIEW_URL_IOS;
  if (/android/.test(ua)) return REVIEW_URL_ANDROID;
  return REVIEW_URL_WEB;
}

export function ReviewPrompt({ onClose, trigger }: ReviewPromptProps) {
  const [rating, setRating] = useState(0);
  const [step, setStep] = useState<'rate' | 'thanks' | 'feedback'>('rate');

  const handleRate = (stars: number) => {
    setRating(stars);
    try { localStorage.setItem(STORAGE_KEY, Date.now().toString()); } catch {}
    if (stars >= 4) {
      setStep('thanks');
    } else {
      setStep('feedback');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div
        className="w-full max-w-sm rounded-2xl p-6 relative"
        style={{
          background: 'linear-gradient(145deg, #07080C, #121821)',
          border: '1px solid rgba(39,183,200,0.2)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <X className="w-4 h-4" style={{ color: 'rgba(244,247,250,0.4)' }} />
        </button>

        {step === 'rate' && (
          <div className="text-center">
            <div style={{ fontSize: 48 }} className="mb-3">&#127800;</div>
            <h3 className="text-lg font-bold text-[#F3EDE3] mb-1">
              Enjoying Radar?
            </h3>
            <p className="text-sm text-[#F3EDE3]/50 mb-5 leading-relaxed">
              {trigger
                ? `Nice work completing ${trigger}! How are you enjoying the app so far?`
                : 'Your feedback helps other traders find Radar. How would you rate us?'}
            </p>

            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => handleRate(s)}
                  className="transition-transform hover:scale-125 active:scale-90"
                >
                  <Star
                    className="w-10 h-10"
                    fill={s <= rating ? '#D4AF37' : 'none'}
                    stroke={s <= rating ? '#D4AF37' : 'rgba(244,247,250,0.2)'}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="text-xs text-[#F3EDE3]/30"
            >
              Not now
            </button>
          </div>
        )}

        {step === 'thanks' && (
          <div className="text-center">
            <div style={{ fontSize: 48 }} className="mb-3">&#128150;</div>
            <h3 className="text-lg font-bold text-[#F3EDE3] mb-1">
              Thank you!
            </h3>
            <p className="text-sm text-[#F3EDE3]/50 mb-5 leading-relaxed">
              Would you mind leaving a quick review? It helps so much — other traders find Radar because of reviews like yours.
            </p>
            <a
              href={getReviewUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="inline-block px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #D4AF37)', color: '#07080C' }}
            >
              Leave a Review
            </a>
            <button
              onClick={onClose}
              className="block mx-auto mt-3 text-xs text-[#F3EDE3]/30"
            >
              Maybe later
            </button>
          </div>
        )}

        {step === 'feedback' && (
          <div className="text-center">
            <div style={{ fontSize: 48 }} className="mb-3">&#128172;</div>
            <h3 className="text-lg font-bold text-[#F3EDE3] mb-1">
              We hear you
            </h3>
            <p className="text-sm text-[#F3EDE3]/50 mb-5 leading-relaxed">
              We&apos;re always improving Radar. Thanks for your honest feedback — it helps us build a better app for you.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
              style={{ background: 'rgba(39,183,200,0.15)', color: '#27B7C8', border: '1px solid rgba(39,183,200,0.3)' }}
            >
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function shouldShowReviewPrompt(completedCount: number): boolean {
  const milestones = [5, 10, 20];
  if (!milestones.includes(completedCount)) return false;
  try {
    const last = localStorage.getItem(STORAGE_KEY);
    if (last) {
      const daysSince = (Date.now() - Number(last)) / 86400000;
      if (daysSince < 30) return false;
    }
  } catch {}
  return true;
}

const VISIT_KEY = 'bloom_visit_count';
const VISIT_THRESHOLD = 15;

export function useAutoReviewPrompt(): { show: boolean; dismiss: () => void } {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const prompted = localStorage.getItem(STORAGE_KEY);
      if (prompted) {
        const daysSince = (Date.now() - Number(prompted)) / 86400000;
        if (daysSince < 90) return;
      }
      const visits = Number(localStorage.getItem(VISIT_KEY) || '0') + 1;
      localStorage.setItem(VISIT_KEY, String(visits));
      if (visits >= VISIT_THRESHOLD) {
        const timer = setTimeout(() => setShow(true), 4000);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const dismiss = () => {
    setShow(false);
    try { localStorage.setItem(STORAGE_KEY, Date.now().toString()); } catch {}
  };

  return { show, dismiss };
}
