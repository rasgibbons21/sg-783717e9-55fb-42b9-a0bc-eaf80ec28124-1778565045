type Variant = "sprig" | "bloom" | "corner";

const LEAVES = [
  { x: 42, y: 92, rotate: -48 },
  { x: 62, y: 80, rotate: 42 },
  { x: 40, y: 66, rotate: -44 },
  { x: 60, y: 54, rotate: 40 },
  { x: 43, y: 40, rotate: -38 },
];

function Sprig() {
  return (
    <>
      <path d="M50 118 C48 92 54 62 50 22" fill="none" stroke="var(--bloom-sage)" strokeWidth="1.5" strokeLinecap="round" />
      {LEAVES.map((leaf) => (
        <ellipse
          key={`${leaf.x}-${leaf.y}`}
          cx={leaf.x}
          cy={leaf.y}
          rx="6"
          ry="13"
          fill="var(--bloom-sage)"
          fillOpacity="0.2"
          transform={`rotate(${leaf.rotate} ${leaf.x} ${leaf.y})`}
        />
      ))}
    </>
  );
}

function Bloom() {
  return (
    <>
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx="50"
          cy="34"
          rx="12"
          ry="20"
          fill="var(--bloom-blush)"
          fillOpacity="0.85"
          transform={`rotate(${angle} 50 54)`}
        />
      ))}
      <circle cx="50" cy="54" r="8" fill="var(--bloom-gold)" fillOpacity="0.9" />
    </>
  );
}

/** Decorative botanical art. Hidden from screen readers. */
export function Botanical({ variant = "sprig", className }: { variant?: Variant; className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={className} aria-hidden="true" focusable="false">
      {variant === "bloom" ? (
        <Bloom />
      ) : variant === "corner" ? (
        <g transform="rotate(32 50 60)">
          <Sprig />
        </g>
      ) : (
        <Sprig />
      )}
    </svg>
  );
}
