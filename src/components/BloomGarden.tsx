import { Flower2 } from "lucide-react";

interface BloomGardenProps {
  completedLessons: string[];
  totalLessons: number;
  onLessonClick?: (lessonId: string) => void;
  lessonNames?: { id: string; title: string; category: string }[];
}

const CATEGORY_FLOWERS: Record<string, { emoji: string; color: string }> = {
  Stocks: { emoji: "🌸", color: "#EC4899" },
  ETFs: { emoji: "🌺", color: "#F59E0B" },
  "Mutual Funds": { emoji: "🌻", color: "#EAB308" },
  Dividends: { emoji: "🌷", color: "#EF4444" },
  Bonds: { emoji: "🌼", color: "#06B6D4" },
  Retirement: { emoji: "🪻", color: "#8B5CF6" },
  "Trading Psychology": { emoji: "🌹", color: "#E11D48" },
  "Income Streams": { emoji: "💐", color: "#49B06E" },
};

const DEFAULT_FLOWER = { emoji: "🌱", color: "#49B06E" };

export function BloomGarden({ completedLessons, totalLessons, lessonNames }: BloomGardenProps) {
  const flowerCount = completedLessons.length;
  const emptySlots = Math.max(totalLessons - flowerCount, 0);

  const completedWithInfo = lessonNames
    ? lessonNames.filter(l => completedLessons.includes(l.id))
    : completedLessons.map(id => ({ id, title: id, category: "Stocks" }));

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flower2 className="w-5 h-5 text-[#EC4899]" />
          <h3 className="font-serif text-lg font-bold text-foreground">Your Bloom Garden</h3>
        </div>
        <span className="text-sm text-muted-foreground font-medium">{flowerCount}/{totalLessons} flowers</span>
      </div>

      {flowerCount === 0 ? (
        <div className="text-center py-6 space-y-2">
          <p className="text-3xl">🌱</p>
          <p className="text-sm text-muted-foreground">Complete your first lesson to plant a flower!</p>
          <p className="text-xs text-muted-foreground/60">Each lesson grows a unique bloom in your garden.</p>
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-2">
          {completedWithInfo.map((lesson, i) => {
            const flower = CATEGORY_FLOWERS[lesson.category] || DEFAULT_FLOWER;
            return (
              <div
                key={lesson.id}
                className="aspect-square rounded-xl flex items-center justify-center text-xl transition-transform hover:scale-110 cursor-default"
                style={{
                  background: `${flower.color}12`,
                  border: `1px solid ${flower.color}25`,
                  animation: `gardenBloom 0.5s ease-out ${i * 0.05}s both`,
                }}
                title={lesson.title}
              >
                {flower.emoji}
              </div>
            );
          })}
          {Array.from({ length: Math.min(emptySlots, 12) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-square rounded-xl flex items-center justify-center text-base opacity-20"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
            >
              🌱
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-2 rounded-full overflow-hidden bg-muted/30">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.max((flowerCount / totalLessons) * 100, 2)}%`,
              background: "linear-gradient(90deg, #EC4899, #F59E0B, #49B06E)",
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {flowerCount === 0
            ? "Your garden awaits its first bloom"
            : flowerCount < totalLessons / 3
            ? "Your garden is starting to bloom!"
            : flowerCount < (totalLessons * 2) / 3
            ? "Beautiful progress — keep growing!"
            : flowerCount < totalLessons
            ? "Your garden is almost in full bloom!"
            : "Full bloom! Your garden is complete 🌸"}
        </p>
      </div>

      <style jsx global>{`
        @keyframes gardenBloom {
          from { opacity: 0; transform: scale(0.5) rotate(-15deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
