import dynamic from "next/dynamic";
import type { OHLCBar } from "./CandlestickChart";

// Re-export type so callers can import from here
export type { OHLCBar };

interface Props {
  data: OHLCBar[];
  priceLines?: { entry?: number; stop?: number; target?: number };
  height?: number;
}

// Never SSR — lightweight-charts touches DOM at module evaluation time
const Chart = dynamic<Props>(
  () => import("./CandlestickChart").then(m => m.CandlestickChart),
  { ssr: false, loading: () => <div className="h-[280px] bg-[#0E1B30] rounded-lg animate-pulse" /> }
);

export default Chart;
