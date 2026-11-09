import { LISTED_INSTRUMENTS } from "@/config/instruments";
import { SETUP_TYPES, TIMEFRAMES, type SetupType, type Timeframe } from "@/config/setups";

type Query = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** What a lesson or an idea asked Practice to open with. Anything unknown is ignored. */
export function parsePreselect(query: Query): { setup?: SetupType; timeframe?: Timeframe; symbol?: string } {
  const result: { setup?: SetupType; timeframe?: Timeframe; symbol?: string } = {};
  const setup = first(query.setup);
  const timeframe = first(query.tf);
  const symbol = first(query.symbol);
  if (setup && (SETUP_TYPES as readonly string[]).includes(setup)) result.setup = setup as SetupType;
  if (timeframe && (TIMEFRAMES as readonly string[]).includes(timeframe)) result.timeframe = timeframe as Timeframe;
  if (symbol && LISTED_INSTRUMENTS.some((instrument) => instrument.symbol === symbol)) result.symbol = symbol;
  return result;
}
