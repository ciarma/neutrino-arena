import { supabase } from "@/integrations/supabase/client";

// Stable per-browser player id backed by the Supabase anonymous/auth session.
// This aligns with RLS policies that compare auth.uid() to the player columns.
export async function getOrCreatePlayerId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (data.session?.user?.id) return data.session.user.id;

  const { data: signInData, error } = await supabase.auth.signInAnonymously();
  if (error) {
    throw new Error(`Unable to get player id: ${error.message}`);
  }
  if (!signInData.user?.id) {
    throw new Error("Unable to get player id after anonymous sign-in");
  }
  return signInData.user.id;
}
