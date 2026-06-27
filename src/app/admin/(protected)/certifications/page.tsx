"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/layout/header";
import { Button } from "@/components/shared/button";
import { Input, FormField, Card, CardContent, CardHeader, CardTitle, Badge, Switch } from "@/components/shared/form-elements";
import { DataTable, Column } from "@/components/admin/ui/data-table";
import { ConfirmDelete } from "@/components/admin/ui/confirm-delete";
import { TagInput } from "@/components/admin/ui/tag-input";
import { Pencil, Trash2, ExternalLink, X } from "lucide-react";
import { Certification, CertificationFormData } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const defaultForm: CertificationFormData = {
  title: "", issuer: "", issue_date: null, expiry_date: null,
  credential_id: null, credential_url: null, image_url: null,
  skills: [], display_order: 0,
  is_visible: true,
};

export default function CertificationsPage() {
  const [items, setItems] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const supabase = createClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CertificationFormData>({ defaultValues: defaultForm });
  const skills = watch("skills");

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("certifications").select("*").order("display_order");
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openEdit = (item: Certification) => {
    setEditingId(item.id);
    reset({ ...item });
    
    // Scroll to top form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data: CertificationFormData) => {
    setSaving(true);
    let error;
    let payload = { ...data };
    if (editingId) {
      ({ error } = await supabase.from("certifications").update(payload).eq("id", editingId));
    } else {
      const nextOrder = items.reduce((max, x) => Math.max(max, x.display_order), -1) + 1;
      payload.display_order = nextOrder;
      ({ error } = await supabase.from("certifications").insert(payload));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "Certification updated" : "Certification added");
    setEditingId(null);
    reset(defaultForm);
    fetchItems();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("certifications").delete().eq("id", deleteId);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Certification deleted");
    setDeleteId(null);
    fetchItems();
  };

  const toggleVisible = async (item: Certification) => {
    await supabase.from("certifications").update({ is_visible: !item.is_visible }).eq("id", item.id);
    fetchItems();
  };

  const handleReorder = async (draggedId: string, targetId: string) => {
    const draggedIdx = items.findIndex((x) => x.id === draggedId);
    const targetIdx = items.findIndex((x) => x.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIdx, 1);
    newItems.splice(targetIdx, 0, draggedItem);

    setItems(newItems);

    const updates = newItems.map((item, idx) => ({
      ...item,
      display_order: idx,
    }));

    const { error } = await supabase.from("certifications").upsert(updates);
    if (error) {
      toast.error("Failed to update order: " + error.message);
      fetchItems();
    } else {
      toast.success("Order updated");
    }
  };

  const columns: Column<Certification>[] = [
    {
      key: "title", header: "Certification", sortable: true,
      cell: (row) => (
        <div>
          <p className="font-medium">{row.title}</p>
          <p className="text-xs text-muted-foreground">{row.issuer}</p>
        </div>
      ),
    },
    {
      key: "issue_date", header: "Issued",
      cell: (row) => <span className="text-sm text-muted-foreground">{formatDate(row.issue_date)}</span>,
    },
    {
      key: "expiry_date", header: "Expires",
      cell: (row) => row.expiry_date
        ? <span className="text-sm text-muted-foreground">{formatDate(row.expiry_date)}</span>
        : <Badge variant="success">No Expiry</Badge>,
    },
    {
      key: "skills", header: "Skills",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.skills.slice(0, 3).map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
          {row.skills.length > 3 && <Badge variant="secondary" className="text-xs">+{row.skills.length - 3}</Badge>}
        </div>
      ),
    },
    {
      key: "is_visible", header: "Visible",
      cell: (row) => (
        <Switch checked={row.is_visible} onCheckedChange={() => toggleVisible(row)} />
      ),
    },
    {
      key: "actions", header: "",
      cell: (row) => (
        <div className="flex items-center gap-1 justify-end">
          {row.credential_url && (
            <a href={row.credential_url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="h-3.5 w-3.5" /></Button>
            </a>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(row)}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(row.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <AdminHeader title="Certifications" description="Manage your certifications and courses" />
      
      <div className="p-6 space-y-6">
        {/* Upper Half: Form Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">
              {editingId ? "Edit Certification Entry" : "Add New Certification Entry"}
            </CardTitle>
            {editingId && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => { setEditingId(null); reset(defaultForm); }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-5xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Certification Title" required error={errors.title?.message}>
                  <Input {...register("title", { required: "Title is required" })} placeholder="AWS Solutions Architect" />
                </FormField>
                <FormField label="Issuing Organization" required error={errors.issuer?.message}>
                  <Input {...register("issuer", { required: "Issuer is required" })} placeholder="Amazon Web Services" />
                </FormField>
                <FormField label="Credential ID">
                  <Input {...register("credential_id")} placeholder="ABC-12345" />
                </FormField>
                <FormField label="Issue Date">
                  <Input {...register("issue_date")} type="date" />
                </FormField>
                <FormField label="Expiry Date" hint="Leave empty if it never expires">
                  <Input {...register("expiry_date")} type="date" />
                </FormField>
                <FormField label="Credential URL">
                  <Input {...register("credential_url")} type="url" placeholder="https://credly.com/badges/..." />
                </FormField>
                <FormField label="Badge Image URL">
                  <Input {...register("image_url")} type="url" placeholder="https://..." />
                </FormField>
                <div className="md:col-span-2">
                  <FormField label="Related Skills">
                    <TagInput value={skills || []} onChange={(tags) => setValue("skills", tags)} placeholder="AWS, Cloud, DevOps..." />
                  </FormField>
                </div>
              </div>
              <div className="flex items-center gap-6 py-1">
                <div className="flex items-center gap-3">
                  <Switch checked={watch("is_visible") ?? true} onCheckedChange={(val) => setValue("is_visible", val)} />
                  <span className="text-sm">Visible on portfolio</span>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                {editingId && (
                  <Button type="button" variant="outline" size="sm" onClick={() => { setEditingId(null); reset(defaultForm); }}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" size="sm" loading={saving}>
                  {editingId ? "Save Changes" : "Save Certification"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Bottom Half: Table Card */}
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">All Certifications</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable data={items} columns={columns} searchKeys={["title", "issuer"]} loading={loading} emptyMessage="No certifications yet." onReorder={handleReorder} />
          </CardContent>
        </Card>
      </div>
      <ConfirmDelete open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
    </div>
  );
}
