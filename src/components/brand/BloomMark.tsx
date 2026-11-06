const PETALS = [0, 72, 144, 216, 288];

/** A fine-line geometric bloom in gold, used wherever the Bloom name appears. */
export function BloomMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="Bloom">
      {PETALS.map((angle) => (
        <ellipse
          key={angle}
          cx="20"
          cy="11.5"
          rx="5.5"
          ry="9"
          fill="none"
          stroke="var(--bloom-gold)"
          strokeWidth="1.1"
          transform={`rotate(${angle} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="2.2" fill="var(--bloom-gold)" />
    </svg>
  );
}
