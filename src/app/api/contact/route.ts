import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Insert message into the database
    const { data: insertedMsg, error: insertError } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        subject: subject || null,
        message,
        is_read: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error for contact message:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 2. Fetch webhook settings
    const { data: settings, error: settingsError } = await supabase
      .from("site_settings")
      .select("webhook_urls")
      .single();

    if (settingsError) {
      console.error("Failed to fetch site settings webhooks:", settingsError);
      // Return success anyway since the message was successfully stored
      return NextResponse.json({ success: true, message: "Stored successfully, webhook failed" });
    }

    const webhookUrls = settings?.webhook_urls || {};

    // 3. Dispatch webhooks (Discord, Slack, Telegram) in a resilient manner
    const notificationPromises = [];

    // Discord
    if (webhookUrls.discord) {
      notificationPromises.push(
        fetch(webhookUrls.discord, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [
              {
                title: "📩 New Contact Message Received",
                color: 3881430, // Beautiful green-ish / primary color
                fields: [
                  { name: "Name", value: name, inline: true },
                  { name: "Email", value: email, inline: true },
                  { name: "Subject", value: subject || "(No Subject)", inline: false },
                  { name: "Message", value: message, inline: false },
                ],
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        }).catch((err) => console.error("Discord Notification Failed:", err))
      );
    }

    // Slack
    if (webhookUrls.slack) {
      notificationPromises.push(
        fetch(webhookUrls.slack, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `*📩 New Contact Message Received*\n*Name:* ${name}\n*Email:* ${email}\n*Subject:* ${subject || "(No Subject)"}\n*Message:* ${message}`,
          }),
        }).catch((err) => console.error("Slack Notification Failed:", err))
      );
    }

    // Telegram
    if (webhookUrls.telegram_token && webhookUrls.telegram_chat_id) {
      const tgText = `📩 *New Contact Message Received*\n\n*Name:* ${name}\n*Email:* ${email}\n*Subject:* ${subject || "(No Subject)"}\n\n*Message:*\n${message}`;
      const tgUrl = `https://api.telegram.org/bot${webhookUrls.telegram_token}/sendMessage`;
      notificationPromises.push(
        fetch(tgUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: webhookUrls.telegram_chat_id,
            text: tgText,
            parse_mode: "Markdown",
          }),
        }).catch((err) => console.error("Telegram Notification Failed:", err))
      );
    }

    if (notificationPromises.length > 0) {
      // Execute all notifications in parallel without blocking the client response too much
      await Promise.all(notificationPromises);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Contact API general error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
