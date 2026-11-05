const PETALS = [0, 72, 144, 216, 288];

/** Five soft petals around a gold centre, used wherever the Bloom name appears. */
export function BloomMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="Bloom">
      {PETALS.map((angle) => (
        <ellipse
          key={angle}
          cx="20"
          cy="10.5"
          rx="6.5"
          ry="9.5"
          fill="var(--bloom-blush)"
          stroke="var(--bloom-clay)"
          strokeWidth="0.75"
          transform={`rotate(${angle} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="4.5" fill="var(--bloom-gold)" />
    </svg>
  );
}
