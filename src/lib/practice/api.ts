import { supabase } from "@/integrations/supabase/client";

export interface PracticeAccount {
  id: string;
  cash_balance: number;
  initial_balance: number;
}

export interface PracticeTrade {
  id: string;
  ticker: string;
  direction: "long" | "short";
  shares: number;
  entry_price: number;
  exit_price: number | null;
  stop_price: number | null;
  target_price: number | null;
  pnl: number | null;
  exit_reason: string | null;
  status: "open" | "closed";
  entry_at: string;
  exit_at: string | null;
  thesis?: string | null;
  setup_type?: string | null;
  timeframe?: string | null;
  risk_pct?: number | null;
}

/** Calls a signed-in Bloom API, returning the parsed body and whether it succeeded. */
export async function practiceFetch<T = Record<string, unknown>>(
  path: string,
  options: RequestInit = {},
): Promise<{ ok: boolean; status: number; data: T & { error?: string } }> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const res = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        ...options.headers,
      },
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "We can't reach Bloom just now. Please check your connection and try again." } as T & { error?: string } };
  }
}

export const money = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
