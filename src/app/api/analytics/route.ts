import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { path, referrer } = body;
    const userAgent = request.headers.get("user-agent") || null;

    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("analytics_events").insert({
      path,
      referrer,
      user_agent: userAgent,
      event_type: "page_view",
    });

    if (error) {
      console.error("Failed to insert analytics event:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Analytics API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
