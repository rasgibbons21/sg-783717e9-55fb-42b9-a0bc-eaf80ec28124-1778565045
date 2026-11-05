import { BloomMark } from "@/components/brand/BloomMark";

const GLASS =
  "bloom-rise rounded-3xl border border-white/70 bg-white/55 p-5 text-left shadow-[0_18px_40px_rgba(63,79,62,0.12)] backdrop-blur-md transition-colors duration-300 hover:bg-white/75";

const GARDEN_WEEK = [
  { day: "M", height: 40 },
  { day: "T", height: 62 },
  { day: "W", height: 50 },
  { day: "T", height: 78 },
  { day: "F", height: 66 },
  { day: "S", height: 88 },
  { day: "S", height: 100 },
];

const stagger = (index: number) => ({ animationDelay: `${750 + index * 120}ms` });

/** Frosted glass previews of what's inside Bloom. The values are examples, so they're hidden from screen readers. */
export function HeroCards() {
  return (
    <div className="relative mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3" aria-hidden="true">
      <div className={GLASS} style={stagger(0)}>
        <p className="font-serif text-lg font-semibold text-foreground">Your garden</p>
        <div className="mt-4 flex h-24 items-end justify-between gap-2">
          {GARDEN_WEEK.map(({ day, height }, index) => (
            <div key={`${day}-${index}`} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div className="flex w-full flex-1 items-end justify-center">
                <span
                  className="bloom-grow block w-2.5 rounded-t-full bg-[var(--bloom-gold)]"
                  style={{ height: `${height}%`, animationDelay: `${1000 + index * 50}ms` }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground">{day}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">A little learning, most days.</p>
      </div>

      <div className={GLASS} style={stagger(1)}>
        <p className="font-serif text-lg font-semibold text-foreground">In plain English</p>
        <div className="mt-4 rounded-2xl bg-white/70 p-4">
          <p className="font-serif text-3xl font-semibold text-primary">0.01 lot</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">One ounce of gold</p>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Every new word explained the moment it appears.</p>
      </div>

      <div className={GLASS} style={stagger(2)}>
        <p className="flex items-center gap-2 font-serif text-lg font-semibold text-foreground">
          <BloomMark size={28} /> Pansy
        </p>
        <p className="mt-4 rounded-2xl rounded-tl-sm bg-white/70 p-4 text-base leading-relaxed text-foreground">No question is too small. Shall we start with what gold trading actually is?</p>
        <p className="mt-3 text-sm text-muted-foreground">Your learning companion, any time.</p>
      </div>
    </div>
  );
}
