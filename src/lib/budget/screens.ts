export type BudgetScreen = "loading" | "error" | "setup" | "plan";

/**
 * What a budget screen should show. A failed load is never mistaken for "no plan yet",
 * so a network blip can't send her to a blank setup that would overwrite her plan.
 */
export function budgetScreen(state: { loading: boolean; error: string | null; plan: unknown | null }): BudgetScreen {
  if (state.plan) return "plan";
  if (state.loading) return "loading";
  if (state.error) return "error";
  return "setup";
}
