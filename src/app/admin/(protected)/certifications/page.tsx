"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/layout/header";
import { Button } from "@/components/shared/button";
import { Input, FormField, Card, CardContent, Badge } from "@/components/shared/form-elements";
import { DataTable, Column } from "@/components/admin/ui/data-table";
import { ConfirmDelete } from "@/components/admin/ui/confirm-delete";
import { TagInput } from "@/components/admin/ui/tag-input";
import * as Tabs from "@radix-ui/react-tabs";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Certification, CertificationFormData } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const defaultForm: CertificationFormData = {
  title: "", issuer: "", issue_date: null, expiry_date: null,
  credential_id: null, credential_url: null, image_url: null,
  skills: [], display_order: 0,
};

export default function CertificationsPage() {
  const [items, setItems] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
  const supabase = createClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CertificationFormData>({ defaultValues: defaultForm });
  const skills = watch("skills");

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("certifications").select("*").order("issue_date", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openEdit = (item: Certification) => {
    setEditingId(item.id);
    reset({ ...item });
    setActiveTab("add");
  };

  const onSubmit = async (data: CertificationFormData) => {
    setSaving(true);
    let error;
    if (editingId) {
      ({ error } = await supabase.from("certifications").update(data).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("certifications").insert(data));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "Certification updated" : "Certification added");
    setEditingId(null); reset(defaultForm); setActiveTab("view"); fetchItems();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("certifications").delete().eq("id", deleteId);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Certification deleted");
    setDeleteId(null); fetchItems();
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
      <AdminHeader title="Certifications" description="Manage your certifications and courses" actions={
        <Button size="sm" onClick={() => { setEditingId(null); reset(defaultForm); setActiveTab("add"); }}>
          <Plus className="h-4 w-4" />Add Certification
        </Button>
      } />
      <div className="p-6">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List className="flex border-b border-border mb-6">
            {["view", "add"].map((tab) => (
              <Tabs.Trigger key={tab} value={tab}
                className="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors data-[state=active]:border-primary data-[state=active]:text-primary border-transparent text-muted-foreground hover:text-foreground capitalize"
              >{tab === "add" ? (editingId ? "Edit Entry" : "Add Entry") : "All Certifications"}</Tabs.Trigger>
            ))}
          </Tabs.List>
          <Tabs.Content value="view">
            <DataTable data={items} columns={columns} searchKeys={["title", "issuer"]} loading={loading} emptyMessage="No certifications yet." />
          </Tabs.Content>
          <Tabs.Content value="add">
            <Card><CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Certification Title" required error={errors.title?.message} className="col-span-2">
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
                  <FormField label="Credential URL" className="col-span-2">
                    <Input {...register("credential_url")} type="url" placeholder="https://credly.com/badges/..." />
                  </FormField>
                  <FormField label="Badge Image URL" className="col-span-2">
                    <Input {...register("image_url")} type="url" placeholder="https://..." />
                  </FormField>
                </div>
                <FormField label="Related Skills">
                  <TagInput value={skills || []} onChange={(tags) => setValue("skills", tags)} placeholder="AWS, Cloud, DevOps..." />
                </FormField>
                <div className="flex gap-3">
                  <Button type="submit" loading={saving}>{editingId ? "Update" : "Add Certification"}</Button>
                  {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); reset(defaultForm); }}>Cancel</Button>}
                </div>
              </form>
            </CardContent></Card>
          </Tabs.Content>
        </Tabs.Root>
      </div>
      <ConfirmDelete open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
    </div>
  );
}
