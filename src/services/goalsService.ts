import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SavingsGoal = Database["public"]["Tables"]["savings_goals"]["Row"];
type SavingsGoalInsert = Database["public"]["Tables"]["savings_goals"]["Insert"];
type SavingsGoalUpdate = Database["public"]["Tables"]["savings_goals"]["Update"];

export const goalsService = {
  async getGoals(): Promise<SavingsGoal[]> {
    const { data, error } = await supabase
      .from("savings_goals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching goals:", error);
      return [];
    }

    return data || [];
  },

  async createGoal(goal: SavingsGoalInsert): Promise<SavingsGoal | null> {
    const { data, error } = await supabase
      .from("savings_goals")
      .insert(goal)
      .select()
      .single();

    if (error) {
      console.error("Error creating goal:", error);
      return null;
    }

    return data;
  },

  async updateGoal(id: string, updates: SavingsGoalUpdate): Promise<SavingsGoal | null> {
    const { data, error } = await supabase
      .from("savings_goals")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating goal:", error);
      return null;
    }

    return data;
  },

  async deleteGoal(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("savings_goals")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting goal:", error);
      return false;
    }

    return true;
  },

  async addProgress(id: string, amount: number): Promise<SavingsGoal | null> {
    // First get current amount
    const { data: goal, error: fetchError } = await supabase
      .from("savings_goals")
      .select("current_amount, target_amount")
      .eq("id", id)
      .single();

    if (fetchError || !goal) {
      console.error("Error fetching goal:", fetchError);
      return null;
    }

    const newAmount = Number(goal.current_amount) + amount;
    const completed = newAmount >= Number(goal.target_amount);

    return this.updateGoal(id, {
      current_amount: newAmount,
      completed,
    });
  },
};