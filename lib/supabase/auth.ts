import type { Provider } from "@supabase/supabase-js";
import { getSupabaseClient } from "./client";

// Re-export the client for convenience
export const supabaseClient = getSupabaseClient();

export type AuthFormData = {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  userType?: string;
};

// Definição do tipo para inserção na tabela "users"
type UserInsert = {
  id: string;
  email: string;
  name: string;
  phone: string;
  user_type: string;
  created_at?: string;
};

export async function signUp(formData: AuthFormData) {
  console.log("[Auth] Attempting to sign up user", { email: formData.email });
  const { email, password, name, phone, userType } = formData;

  try {
    // 1️⃣ Cria o usuário na autenticação Supabase
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          user_type: userType,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("[Auth] Sign up error:", error);
      throw new Error(`Authentication error: ${error.message}`);
    }

    if (!data.user) {
      throw new Error("User creation failed - no user data returned");
    }

    console.log("[Auth] User signed up successfully", { userId: data.user.id });

    // 2️⃣ Verifica se a tabela "users" existe
    try {
      const { error: tableCheckError } = await supabaseClient
        .from("users")
        .select("id")
        .limit(1);

      if (tableCheckError && tableCheckError.code === "42P01") {
        console.log(
          "[Auth] Users table does not exist. User will be created by trigger when the table is created."
        );
        return data;
      }
    } catch (error) {
      console.error("[Auth] Error checking users table:", error);
    }

    // 3️⃣ Cria o perfil do usuário na tabela "users"
    try {
      console.log("[Auth] Creating user profile in users table");

      const newUser: UserInsert = {
        id: data.user.id,
        email,
        name: name || "",
        phone: phone || "",
        user_type: userType || "quality-user",
        created_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabaseClient
        .from("users")
        .insert(newUser as any);

      if (profileError) {
        if (profileError.code === "23505") {
          console.log("[Auth] User already exists in users table");
        } else {
          console.error("[Auth] Error creating user profile:", profileError);
        }
      } else {
        console.log("[Auth] User profile created successfully");
      }
    } catch (error) {
      console.error("[Auth] Error inserting into users table:", error);
    }

    return data;
  } catch (error) {
    console.error("[Auth] Unexpected error during sign up:", error);
    throw new Error(
      error instanceof Error
        ? `Database error saving new user: ${error.message}`
        : "Database error saving new user"
    );
  }
}

export async function signIn(formData: AuthFormData) {
  console.log("[Auth] Attempting to sign in user", { email: formData.email });
  const { email, password } = formData;

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[Auth] Sign in error:", error);
      throw new Error(error.message);
    }

    console.log("[Auth] User signed in successfully", {
      userId: data.user?.id,
    });

    // Verifica se a tabela "users" existe
    try {
      const { error: tableCheckError } = await supabaseClient
        .from("users")
        .select("id")
        .limit(1);

      if (tableCheckError) {
        console.error("[Auth] Table check error:", tableCheckError);
        if (tableCheckError.code === "42P01") {
          console.log(
            "[Auth] Users table does not exist. User will be created by trigger when the table is created."
          );
          return data;
        }
        throw tableCheckError;
      }

      // Verifica se o usuário já existe na tabela "users"
      if (data.user) {
        const { data: userExists, error: userCheckError } = await supabaseClient
          .from("users")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

        if (userCheckError) {
          console.error(
            "[Auth] Error checking if user exists:",
            userCheckError
          );
        }

        // Se não existir, cria o registro
        if (!userExists && !userCheckError) {
          console.log("[Auth] User not found in users table, creating profile");

          const newUser: UserInsert = {
            id: data.user.id,
            email: data.user.email || "",
            name:
              data.user.user_metadata.name ||
              data.user.email?.split("@")[0] ||
              "Usuário",
            phone: data.user.user_metadata.phone || "",
            user_type: data.user.user_metadata.user_type || "quality-user",
            created_at: new Date().toISOString(),
          };

          const { error: createError } = await supabaseClient
            .from("users")
            .insert(newUser as any);

          if (createError) {
            if (createError.code === "23505") {
              console.log("[Auth] User already exists in users table");
            } else {
              console.error("[Auth] Error creating user profile:", createError);
            }
          } else {
            console.log("[Auth] User profile created successfully");
          }
        } else {
          console.log("[Auth] User already exists in users table");
        }
      }
    } catch (err) {
      console.error("[Auth] Error checking or creating user:", err);
    }

    return data;
  } catch (error) {
    console.error("[Auth] Unexpected error during sign in:", error);
    throw error;
  }
}

export async function signInWithProvider(provider: Provider) {
  console.log("[Auth] Attempting to sign in with provider", { provider });

  try {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("[Auth] Provider sign in error:", error);
      throw new Error(error.message);
    }

    console.log("[Auth] Provider sign in initiated successfully");
    return data;
  } catch (error) {
    console.error("[Auth] Unexpected error during provider sign in:", error);
    throw error;
  }
}

export async function resetPassword(email: string) {
  console.log("[Auth] Attempting to reset password", { email });

  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    if (error) {
      console.error("[Auth] Password reset error:", error);
      throw new Error(error.message);
    }

    console.log("[Auth] Password reset email sent successfully");
    return true;
  } catch (error) {
    console.error("[Auth] Unexpected error during password reset:", error);
    throw error;
  }
}

export async function updatePassword(password: string) {
  console.log("[Auth] Attempting to update password");

  try {
    const { error } = await supabaseClient.auth.updateUser({
      password,
    });

    if (error) {
      console.error("[Auth] Password update error:", error);
      throw new Error(error.message);
    }

    console.log("[Auth] Password updated successfully");
    return true;
  } catch (error) {
    console.error("[Auth] Unexpected error during password update:", error);
    throw error;
  }
}

export async function signOut() {
  console.log("[Auth] Attempting to sign out user");

  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      console.error("[Auth] Sign out error:", error);
      throw new Error(error.message);
    }

    console.log("[Auth] User signed out successfully");

    try {
      localStorage.removeItem("supabase.auth.token");
    } catch (e) {
      console.log("[Auth] No localStorage available");
    }

    return true;
  } catch (error) {
    console.error("[Auth] Unexpected error during sign out:", error);
    throw error;
  }
}

export async function getCurrentUser() {
  console.log("[Auth] Attempting to get current user");

  try {
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();

    if (error) {
      console.error("[Auth] Get session error:", error);
      throw new Error(error.message);
    }

    console.log("[Auth] Session retrieved", {
      exists: !!session,
      userId: session?.user?.id,
    });
    return session?.user || null;
  } catch (error) {
    console.error("[Auth] Unexpected error getting current user:", error);
    throw error;
  }
}

export async function checkSession() {
  console.log("[Auth] Checking session validity");

  try {
    const { data: sessionData, error: sessionError } =
      await supabaseClient.auth.getSession();

    if (sessionError) {
      console.log(
        "[Auth] Session error (this is normal if user is not logged in):",
        sessionError.message
      );
      return false;
    }

    const session = sessionData?.session;

    if (!session) {
      console.log("[Auth] No session found (user is not logged in)");
      return false;
    }

    const { data: userData, error: userError } =
      await supabaseClient.auth.getUser();

    if (userError) {
      console.log("[Auth] User verification error:", userError.message);
      return false;
    }

    const user = userData?.user;
    const isValid = !!session && !!user;

    console.log("[Auth] Session check complete", {
      isValid,
      hasSession: !!session,
      hasUser: !!user,
      userId: user?.id,
      sessionExpiry: session?.expires_at
        ? new Date(session.expires_at * 1000).toISOString()
        : "unknown",
    });

    if (session && session.expires_at) {
      const expiresInSeconds =
        session.expires_at - Math.floor(Date.now() / 1000);
      if (expiresInSeconds < 300) {
        console.log("[Auth] Session expiring soon, refreshing");
        try {
          await supabaseClient.auth.refreshSession();
        } catch (refreshError) {
          console.log("[Auth] Session refresh failed:", refreshError);
        }
      }
    }

    return isValid;
  } catch (error) {
    console.log(
      "[Auth] Unexpected error checking session (this is normal if user is not logged in):",
      error
    );
    return false;
  }
}
