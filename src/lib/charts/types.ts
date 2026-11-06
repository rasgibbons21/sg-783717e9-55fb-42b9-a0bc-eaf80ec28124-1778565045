export interface Candle {
  /** Seconds since 1970, UTC. */
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Zone {
  top: number;
  bottom: number;
}

export type Direction = "bullish" | "bearish";

export interface FVG {
  indexes: [number, number, number];
  direction: Direction;
  zone: Zone;
}

export interface Swing {
  index: number;
  type: "high" | "low";
  price: number;
}

export interface StructureBreak {
  index: number;
  kind: "BOS" | "CHoCH";
  direction: Direction;
  level: number;
}
