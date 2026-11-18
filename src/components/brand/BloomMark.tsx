import { useId } from "react";

const OUTER = "M0 -214 C 34 -214 66 -176 62 -128 C 58 -90 28 -58 0 -40 C -28 -58 -58 -90 -62 -128 C -66 -176 -34 -214 0 -214 Z";
const INNER = "M0 -140 C 24 -140 46 -114 44 -84 C 42 -58 22 -38 0 -26 C -22 -38 -42 -58 -44 -84 C -46 -114 -24 -140 0 -140 Z";
const TURNS = [0, 45, 90, 135, 180, 225, 270, 315];

/** The She Blooms Wealth blossom: blush petals around a gold heart. Used wherever the Bloom name appears. */
export function BloomMark({ size = 32 }: { size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" role="img" aria-label="Bloom">
      <defs>
        <linearGradient id={`${id}o`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F1D6CD" />
          <stop offset="1" stopColor="#D9A99C" />
        </linearGradient>
        <linearGradient id={`${id}i`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D79A8B" />
          <stop offset="1" stopColor="#B96F60" />
        </linearGradient>
        <radialGradient id={`${id}h`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#ECD7A6" />
          <stop offset="1" stopColor="#C4A574" />
        </radialGradient>
      </defs>
      <g transform="translate(256 256)">
        <g fill={`url(#${id}o)`} stroke="#FBF8F2" strokeWidth={size < 24 ? 0 : 6} strokeLinejoin="round">
          {TURNS.map((turn) => (
            <path key={turn} d={OUTER} transform={`rotate(${turn})`} />
          ))}
        </g>
        <g fill={`url(#${id}i)`} stroke="#FBF8F2" strokeWidth={size < 24 ? 0 : 5} strokeLinejoin="round">
          {TURNS.map((turn) => (
            <path key={turn} d={INNER} transform={`rotate(${turn + 22.5})`} />
          ))}
        </g>
        <circle r="40" fill={`url(#${id}h)`} />
      </g>
    </svg>
  );
}
