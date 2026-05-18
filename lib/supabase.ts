import { createClient } from "@supabase/supabase-js";

// Use placeholder strings during Vercel build if env variables are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_key";

if (supabaseUrl === "https://placeholder.supabase.co") {
  console.warn("⚠️ Missing Supabase environment variables. Database features will fail until added to Vercel.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
