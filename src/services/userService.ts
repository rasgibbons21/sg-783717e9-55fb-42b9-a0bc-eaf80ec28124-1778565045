import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type User = Database["public"]["Tables"]["users"]["Row"];
type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export const userService = {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    return data;
  },

  async updateUser(userId: string, updates: UserUpdate): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return null;
    }

    return data;
  },

  async updateLastActive(userId: string): Promise<void> {
    await supabase
      .from("users")
      .update({ last_active: new Date().toISOString() })
      .eq("id", userId);
  },

  async createUserProfile(profile: UserInsert): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .insert(profile)
      .select()
      .single();

    if (error) {
      console.error("Error creating user profile:", error);
      return null;
    }

    return data;
  },

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("join_date", { ascending: false });

    if (error) {
      console.error("Error fetching all users:", error);
      return [];
    }

    return data || [];
  },
};