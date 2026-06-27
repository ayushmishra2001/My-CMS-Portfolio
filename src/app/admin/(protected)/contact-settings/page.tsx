"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/layout/header";
import { Button } from "@/components/shared/button";
import { Badge, Card, CardContent, CardHeader, CardTitle, FormField, Input } from "@/components/shared/form-elements";
import { DataTable, Column } from "@/components/admin/ui/data-table";
import { ConfirmDelete } from "@/components/admin/ui/confirm-delete";
import * as Dialog from "@radix-ui/react-dialog";
import { Trash2, Eye, X, Mail } from "lucide-react";
import { ContactMessage } from "@/lib/types";
import toast from "react-hot-toast";

export default function ContactSettingsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<ContactMessage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const supabase = createClient();

  // Webhook states
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [webhookUrls, setWebhookUrls] = useState({
    discord: "",
    slack: "",
    telegram_token: "",
    telegram_chat_id: "",
  });
  const [savingWebhooks, setSavingWebhooks] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setMessages(data ?? []);
    setLoading(false);
  };

  const fetchWebhooks = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("id, webhook_urls")
      .single();
    if (data) {
      setSettingsId(data.id);
      setWebhookUrls(
        data.webhook_urls || {
          discord: "",
          slack: "",
          telegram_token: "",
          telegram_chat_id: "",
        }
      );
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchWebhooks();
  }, []);

  const handleSaveWebhooks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsId) return;
    setSavingWebhooks(true);
    const { error } = await supabase
      .from("site_settings")
      .update({ webhook_urls: webhookUrls })
      .eq("id", settingsId);
    setSavingWebhooks(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Webhook settings saved");
  };

  const markRead = async (id: string) => {
    await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, is_read: true } : m));
  };

  const openMessage = (msg: ContactMessage) => {
    setViewing(msg);
    if (!msg.is_read) markRead(msg.id);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("contact_messages").delete().eq("id", deleteId);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Message deleted");
    setDeleteId(null);
    fetchMessages();
  };

  const columns: Column<ContactMessage>[] = [
    {
      key: "unread_dot", header: "",
      className: "w-8",
      cell: (row) => !row.is_read
        ? <div className="w-2 h-2 rounded-full bg-primary mt-0.5" />
        : null,
    },
    {
      key: "name", header: "From", sortable: true,
      cell: (row) => (
        <div>
          <p className={`font-medium ${!row.is_read ? "text-foreground" : "text-muted-foreground"}`}>{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      key: "subject", header: "Subject",
      cell: (row) => (
        <p className={`text-sm ${!row.is_read ? "font-medium" : "text-muted-foreground"}`}>
          {row.subject ?? "(no subject)"}
        </p>
      ),
    },
    {
      key: "message", header: "Preview",
      cell: (row) => (
        <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{row.message}</p>
      ),
    },
    {
      key: "created_at", header: "Received", sortable: true,
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "is_read", header: "Status",
      cell: (row) => row.is_read
        ? <Badge variant="secondary">Read</Badge>
        : <Badge variant="default">New</Badge>,
    },
    {
      key: "actions", header: "",
      cell: (row) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openMessage(row)}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <a href={`mailto:${row.email}?subject=Re: ${row.subject ?? ""}`}>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Mail className="h-3.5 w-3.5" />
            </Button>
          </a>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(row.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <AdminHeader
        title="Messages"
        description={unread > 0 ? `${unread} unread message${unread > 1 ? "s" : ""}` : "All messages read"}
      />
      <div className="p-6 space-y-6">
        {/* Webhooks configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Webhook Notifications</CardTitle>
            <p className="text-xs text-muted-foreground">
              Receive real-time notifications on Discord, Slack, or Telegram when a new contact message is submitted.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveWebhooks} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Discord Webhook URL"
                  hint="Incoming Webhook URL from Discord channel integrations"
                >
                  <Input
                    value={webhookUrls.discord || ""}
                    onChange={(e) =>
                      setWebhookUrls((prev) => ({ ...prev, discord: e.target.value }))
                    }
                    placeholder="https://discord.com/api/webhooks/..."
                  />
                </FormField>
                <FormField
                  label="Slack Webhook URL"
                  hint="Incoming Webhook URL from Slack app integrations"
                >
                  <Input
                    value={webhookUrls.slack || ""}
                    onChange={(e) =>
                      setWebhookUrls((prev) => ({ ...prev, slack: e.target.value }))
                    }
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </FormField>
                <FormField
                  label="Telegram Bot Token"
                  hint="Token from BotFather (e.g., 123456:ABC-DEF...)"
                >
                  <Input
                    value={webhookUrls.telegram_token || ""}
                    onChange={(e) =>
                      setWebhookUrls((prev) => ({ ...prev, telegram_token: e.target.value }))
                    }
                    placeholder="123456789:AA..."
                  />
                </FormField>
                <FormField
                  label="Telegram Chat ID"
                  hint="Your numeric chat ID or channel/group ID (e.g., -100...)"
                >
                  <Input
                    value={webhookUrls.telegram_chat_id || ""}
                    onChange={(e) =>
                      setWebhookUrls((prev) => ({ ...prev, telegram_chat_id: e.target.value }))
                    }
                    placeholder="987654321"
                  />
                </FormField>
              </div>
              <div className="flex justify-end mt-2">
                <Button type="submit" size="sm" loading={savingWebhooks}>
                  Save Webhooks
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Message list */}
        <Card>
          <CardContent className="p-0">
            <DataTable
              data={messages}
              columns={columns}
              searchKeys={["name", "email", "subject", "message"]}
              loading={loading}
              emptyMessage="No messages received yet. Contact form submissions will appear here."
            />
          </CardContent>
        </Card>
      </div>

      {/* Message viewer dialog */}
      <Dialog.Root open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg rounded-lg border bg-card p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Dialog.Title className="text-base font-semibold">{viewing?.subject ?? "(no subject)"}</Dialog.Title>
                <p className="text-sm text-muted-foreground mt-0.5">
                  From <span className="font-medium text-foreground">{viewing?.name}</span>{" "}
                  &lt;{viewing?.email}&gt;
                </p>
              </div>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"><X className="h-4 w-4" /></Button>
              </Dialog.Close>
            </div>
            <div className="rounded-md border bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
              {viewing?.message}
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">
                {viewing && new Date(viewing.created_at).toLocaleString("en-IN")}
              </p>
              <a href={`mailto:${viewing?.email}?subject=Re: ${viewing?.subject ?? ""}`}>
                <Button size="sm"><Mail className="h-4 w-4" />Reply via Email</Button>
              </a>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDelete
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        description="This will permanently delete the message."
      />
    </div>
  );
}
