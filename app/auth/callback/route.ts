import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Create or update user profile
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || "",
          avatar_url: data.user.user_metadata?.avatar_url || "",
        });

      // Create user stats entry
      const { error: statsError } = await supabase
        .from("user_stats")
        .upsert({
          user_id: data.user.id,
          total_points: 0,
          total_simulados_completed: 0,
          total_challenges_completed: 0,
          study_streak: 0,
        });

      if (!profileError && !statsError) {
        const redirectUrl = request.headers.get("origin") + next;
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return NextResponse.redirect(
    request.headers.get("origin") + "/auth/auth-code-error"
  );
}
