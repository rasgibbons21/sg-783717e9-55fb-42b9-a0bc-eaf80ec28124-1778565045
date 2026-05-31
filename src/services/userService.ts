import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type User = Database["public"]["Tables"]["profiles"]["Row"];
type UserInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type UserUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export const userService = {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    // If no profile row exists, create one
    if (!data) {
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating profile:", insertError);
        return null;
      }

      return newProfile;
    }

    return data;
  },

  async updateUser(userId: string, updates: UserUpdate): Promise<User | null> {
    const { data, error } = await supabase
      .from("profiles")
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

  async createUserProfile(profile: UserInsert): Promise<User | null> {
    const { data, error } = await supabase
      .from("profiles")
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
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all users:", error);
      return [];
    }

    return data || [];
  },
};