import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin/dashboard";
  
  // Security: Prevent Open Redirect vulnerabilities by validating that redirect path
  // is relative (starts with a single '/') and is not protocol-relative (starts with '//').
  let safeNext = "/admin/dashboard";
  if (next.startsWith("/") && !next.startsWith("//")) {
    safeNext = next;
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${safeNext}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${safeNext}`);
      } else {
        return NextResponse.redirect(`${origin}${safeNext}`);
      }
    }
  }

  // Return the user to the login page with an error query param if auth fails
  return NextResponse.redirect(`${origin}/admin/login?error=Could not authenticate user`);
}
