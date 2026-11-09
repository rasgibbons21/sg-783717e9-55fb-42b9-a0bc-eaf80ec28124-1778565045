import * as api from "./api";
import type { BudgetStore } from "./devStore";

/** The real budget store, backed by Supabase. */
export const supabaseStore: BudgetStore = api;
