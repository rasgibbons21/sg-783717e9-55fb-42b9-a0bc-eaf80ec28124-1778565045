import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * All-or-nothing changes to a simulated balance, done inside the database so two
 * devices can't overwrite each other. Returns false if the balance can't cover it.
 */
export async function reserveCash(client: SupabaseClient, accountId: string, amount: number): Promise<boolean> {
  const { data, error } = await client.rpc("practice_reserve_cash", { p_account_id: accountId, p_amount: amount });
  if (error) throw new Error(error.message);
  return data !== null;
}

/** Returns simulated money plus a trade's result. The balance never falls below zero. */
export async function releaseCash(client: SupabaseClient, accountId: string, delta: number): Promise<void> {
  const { error } = await client.rpc("practice_release_cash", { p_account_id: accountId, p_delta: delta });
  if (error) throw new Error(error.message);
}
