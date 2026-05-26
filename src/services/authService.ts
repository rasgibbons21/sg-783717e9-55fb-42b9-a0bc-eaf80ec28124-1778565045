/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: any;
  created_at?: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

// Test Supabase connection before auth operations
async function testSupabaseConnection(): Promise<boolean> {
  try {
    console.log('Testing Supabase connection...');
    const { error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Connection test failed:', err);
    return false;
  }
}

// Timeout wrapper for auth operations
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    ),
  ]);
}

// Helper function to check if Supabase is properly configured
const checkSupabaseConnection = (): { isConnected: boolean; error?: string } => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      isConnected: false,
      error: "Connection error. Please try again shortly.",
    };
  }

  return { isConnected: true };
};

// Helper function to convert Supabase errors to user-friendly messages
const formatAuthError = (error: any): AuthError => {
  console.error("Auth error:", error);

  // Map common Supabase error messages to user-friendly ones
  const errorMessage = error?.message?.toLowerCase() || "";

  // Connection and timeout errors
  if (errorMessage.includes("timeout") || errorMessage.includes("request timeout")) {
    return {
      message: "This is taking longer than usual. Please try again 🌸",
      code: "TIMEOUT",
    };
  }

  if (errorMessage.includes("failed to fetch") || errorMessage.includes("network request failed")) {
    return {
      message: "We are having trouble connecting right now. Please check back in a moment 🌸",
      code: "CONNECTION_ERROR",
    };
  }

  if (errorMessage.includes("invalid login credentials")) {
    return {
      message: "Invalid email or password. Please check your credentials and try again.",
      code: error?.status?.toString(),
    };
  }

  if (errorMessage.includes("email not confirmed")) {
    return {
      message: "Please confirm your email address. Check your inbox for the confirmation link.",
      code: error?.status?.toString(),
    };
  }

  if (errorMessage.includes("user already registered")) {
    return {
      message: "An account with this email already exists. Try logging in instead.",
      code: error?.status?.toString(),
    };
  }

  if (errorMessage.includes("email rate limit exceeded")) {
    return {
      message: "Too many attempts. Please wait a few minutes and try again.",
      code: error?.status?.toString(),
    };
  }

  if (errorMessage.includes("invalid email")) {
    return {
      message: "Please enter a valid email address.",
      code: error?.status?.toString(),
    };
  }

  if (errorMessage.includes("password") && errorMessage.includes("short")) {
    return {
      message: "Password must be at least 6 characters long.",
      code: error?.status?.toString(),
    };
  }

  if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
    return {
      message: "Network error. Please check your internet connection and try again.",
      code: error?.status?.toString(),
    };
  }

  // Return original message if no match found
  return {
    message: error?.message || "An unexpected error occurred. Please try again.",
    code: error?.status?.toString(),
  };
};

// Dynamic URL Helper
const getURL = () => {
  let url = process?.env?.NEXT_PUBLIC_VERCEL_URL ?? 
           process?.env?.NEXT_PUBLIC_SITE_URL ?? 
           'http://localhost:3000'
  
  // Handle undefined or null url
  if (!url) {
    url = 'http://localhost:3000';
  }
  
  // Ensure url has protocol
  url = url.startsWith('http') ? url : `https://${url}`
  
  // Ensure url ends with slash
  url = url.endsWith('/') ? url : `${url}/`
  
  return url
}

export const authService = {
  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user ? {
      id: user.id,
      email: user.email || "",
      user_metadata: user.user_metadata,
      created_at: user.created_at
    } : null;
  },

  // Get current session
  async getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Sign up with email and password
  async signUp(email: string, password: string, fullName: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    // Check connection first
    const connectionCheck = checkSupabaseConnection();
    if (!connectionCheck.isConnected) {
      return {
        user: null,
        error: { message: connectionCheck.error || "Connection error" },
      };
    }

    // Test actual Supabase connection
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      return {
        user: null,
        error: { 
          message: "We are having trouble connecting right now. Please check back in a moment 🌸",
          code: "CONNECTION_ERROR"
        },
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://shebloomswealth.app/auth/confirm',
          data: { full_name: fullName }
        }
      });

      if (error) {
        return { user: null, error: formatAuthError(error) };
      }

      const authUser = data.user ? {
        id: data.user.id,
        email: data.user.email || "",
        user_metadata: data.user.user_metadata,
        created_at: data.user.created_at
      } : null;

      // Send custom Resend confirmation email
      if (data.user && !data.user.confirmed_at) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const confirmationUrl = `${getURL()}/auth/confirm?token=${data.user.email_confirmed_at}`;
          
          await fetch('/api/auth/send-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: data.user.email,
              confirmationUrl: confirmationUrl,
              name: fullName,
            }),
          });
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't block signup if email fails
        }
      }

      return { user: authUser, error: null };
    } catch (error: any) {
      return { 
        user: null, 
        error: formatAuthError(error)
      };
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    // Check connection first
    const connectionCheck = checkSupabaseConnection();
    if (!connectionCheck.isConnected) {
      return {
        user: null,
        error: { message: connectionCheck.error || "Connection error" },
      };
    }

    // Test actual Supabase connection
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      return {
        user: null,
        error: { 
          message: "We are having trouble connecting right now. Please check back in a moment 🌸",
          code: "CONNECTION_ERROR"
        },
      };
    }

    try {
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { data, error } = await withTimeout(signInPromise, 10000);

      if (error) {
        return { user: null, error: formatAuthError(error) };
      }

      const authUser = data.user ? {
        id: data.user.id,
        email: data.user.email || "",
        user_metadata: data.user.user_metadata,
        created_at: data.user.created_at
      } : null;

      return { user: authUser, error: null };
    } catch (error: any) {
      return { 
        user: null, 
        error: formatAuthError(error)
      };
    }
  },

  // Sign out
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (error) {
      return { 
        error: { message: "An unexpected error occurred during sign out" } 
      };
    }
  },

  // Reset password
  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    // Check connection first
    const connectionCheck = checkSupabaseConnection();
    if (!connectionCheck.isConnected) {
      return {
        error: { message: connectionCheck.error || "Connection error" },
      };
    }

    // Test actual Supabase connection
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      return {
        error: { 
          message: "We are having trouble connecting right now. Please check back in a moment 🌸",
          code: "CONNECTION_ERROR"
        },
      };
    }

    try {
      const resetPromise = supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://shebloomswealth.app/auth/callback?type=recovery",
      });

      const { error } = await withTimeout(resetPromise, 10000);

      if (error) {
        return { error: formatAuthError(error) };
      }

      return { error: null };
    } catch (error: any) {
      console.error("Password reset error:", error);
      return { error: formatAuthError(error) };
    }
  },

  // Confirm email (REQUIRED)
  async confirmEmail(token: string, type: 'signup' | 'recovery' | 'email_change' = 'signup'): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.status?.toString() } };
      }

      const authUser = data.user ? {
        id: data.user.id,
        email: data.user.email || "",
        user_metadata: data.user.user_metadata,
        created_at: data.user.created_at
      } : null;

      return { user: authUser, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: { message: "An unexpected error occurred during email confirmation" } 
      };
    }
  },

  /**
   * Sign in with OAuth provider (Google, etc.)
   */
  async signInWithOAuth(
    provider: "google" | "github" | "apple"
  ): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: "https://shebloomswealth.app/auth/callback",
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("OAuth sign in error:", error);
      return { error };
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async getUserByEmail(email: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) return null;
      return data;
    } catch {
      return null;
    }
  }
};
