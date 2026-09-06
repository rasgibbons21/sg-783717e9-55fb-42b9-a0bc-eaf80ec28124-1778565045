import { useState, useRef } from 'react';
import { Share2, Download, X } from 'lucide-react';

interface ShareAchievementProps {
  type: 'achievement' | 'leaderboard' | 'certificate' | 'streak' | 'trade';
  title: string;
  subtitle?: string;
  emoji?: string;
  stats?: { label: string; value: string }[];
  accentColor?: string;
  onClose?: () => void;
}

const C = {
  bg: '#0E1B30',
  card: '#162540',
  accent: '#27B7C8',
  gold: '#D4AF37',
  green: '#49B06E',
  text: '#F4F7FA',
  textDim: 'rgba(244,247,250,0.6)',
};

export function ShareAchievement({
  type,
  title,
  subtitle,
  emoji,
  stats,
  accentColor,
  onClose,
}: ShareAchievementProps) {
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const accent = accentColor || (type === 'leaderboard' ? C.gold : type === 'trade' ? C.green : C.accent);

  const tagline: Record<string, string> = {
    achievement: 'Achievement Unlocked',
    leaderboard: 'Leaderboard Rank',
    certificate: 'Course Completed',
    streak: 'Streak Milestone',
    trade: 'Trading Win',
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/png'));
      if (!blob) return;

      if (navigator.share) {
        const file = new File([blob], 'bloom-achievement.png', { type: 'image/png' });
        await navigator.share({
          title: `${title} - Bloom`,
          text: `${subtitle || title} on Bloom - She Blooms Wealth! Download: shebloomswealth.app`,
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        window.open(url);
      }
    } catch { /* user cancelled */ } finally {
      setSharing(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `bloom-${type}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('Download failed — try taking a screenshot instead.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-sm animate-in fade-in zoom-in">
        {/* Close */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <X className="w-4 h-4" style={{ color: C.textDim }} />
          </button>
        )}

        {/* Share Card */}
        <div
          ref={cardRef}
          className="rounded-2xl overflow-hidden"
          style={{
            background: `linear-gradient(145deg, ${C.bg}, ${C.card})`,
            border: `1px solid ${accent}33`,
            boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${accent}22`,
          }}
        >
          {/* Top accent bar */}
          <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />

          <div className="p-6 text-center">
            {/* Badge */}
            <div className="mb-3">
              <span style={{ fontSize: 56 }}>{emoji || '🌸'}</span>
            </div>

            {/* Tag */}
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-2"
              style={{ color: accent }}
            >
              {tagline[type]}
            </p>

            {/* Title */}
            <h2
              className="text-xl font-bold mb-1"
              style={{ color: C.text, fontFamily: 'Georgia, serif' }}
            >
              {title}
            </h2>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-sm mb-4" style={{ color: C.textDim }}>
                {subtitle}
              </p>
            )}

            {/* Stats */}
            {stats && stats.length > 0 && (
              <div
                className="grid gap-3 mb-4 p-3 rounded-xl"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(stats.length, 3)}, 1fr)`,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                {stats.map((s, i) => (
                  <div key={i}>
                    <p className="text-lg font-bold" style={{ color: accent }}>{s.value}</p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: C.textDim }}>{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Branding */}
            <div className="flex items-center justify-center gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 16 }}>&#127800;</span>
              <span className="text-xs font-semibold" style={{ color: C.textDim }}>
                She Blooms Wealth
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: accent, color: C.bg }}
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={handleDownload}
            disabled={sharing}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 disabled:opacity-50"
            style={{ border: `1px solid ${accent}44`, color: accent }}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full mt-3 py-2 text-sm"
            style={{ color: C.textDim }}
          >
            Maybe later
          </button>
        )}
      </div>
    </div>
  );
}

export function useShareAchievement() {
  const [shareData, setShareData] = useState<ShareAchievementProps | null>(null);

  const share = (data: Omit<ShareAchievementProps, 'onClose'>) => {
    setShareData({ ...data, onClose: () => setShareData(null) });
  };

  const ShareModal = shareData ? (
    <ShareAchievement {...shareData} />
  ) : null;

  return { share, ShareModal };
}
