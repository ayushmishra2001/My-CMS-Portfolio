"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/layout/header";
import { Button } from "@/components/shared/button";
import { Input, Textarea, FormField, Card, CardContent, Badge, Switch } from "@/components/shared/form-elements";
import { DataTable, Column } from "@/components/admin/ui/data-table";
import { ConfirmDelete } from "@/components/admin/ui/confirm-delete";
import * as Tabs from "@radix-ui/react-tabs";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { Testimonial, TestimonialFormData } from "@/lib/types";
import toast from "react-hot-toast";

const defaultForm: TestimonialFormData = {
  author_name: "", author_role: null, author_company: null,
  author_avatar_url: null, content: "", rating: 5, is_featured: false, display_order: 0,
};

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
  const supabase = createClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TestimonialFormData>({ defaultValues: defaultForm });
  const isFeatured = watch("is_featured");
  const rating = watch("rating");

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("testimonials").select("*").order("display_order");
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openEdit = (item: Testimonial) => {
    setEditingId(item.id);
    reset({ ...item });
    setActiveTab("add");
  };

  const onSubmit = async (data: TestimonialFormData) => {
    setSaving(true);
    let error;
    if (editingId) {
      ({ error } = await supabase.from("testimonials").update(data).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("testimonials").insert(data));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "Testimonial updated" : "Testimonial added");
    setEditingId(null); reset(defaultForm); setActiveTab("view"); fetchItems();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("testimonials").delete().eq("id", deleteId);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Testimonial deleted");
    setDeleteId(null); fetchItems();
  };

  const columns: Column<Testimonial>[] = [
    {
      key: "author_name", header: "Author", sortable: true,
      cell: (row) => (
        <div>
          <p className="font-medium">{row.author_name}</p>
          {row.author_role && <p className="text-xs text-muted-foreground">{row.author_role}{row.author_company ? ` · ${row.author_company}` : ""}</p>}
        </div>
      ),
    },
    {
      key: "content", header: "Testimonial",
      cell: (row) => <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">{row.content}</p>,
    },
    {
      key: "rating", header: "Rating",
      cell: (row) => (
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3.5 w-3.5 ${i < row.rating ? "text-amber-400 fill-amber-400" : "text-muted"}`} />
          ))}
        </div>
      ),
    },
    {
      key: "is_featured", header: "Featured",
      cell: (row) => row.is_featured ? <Badge variant="success">Featured</Badge> : null,
    },
    {
      key: "actions", header: "",
      cell: (row) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(row)}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(row.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <AdminHeader title="Testimonials" description="Manage testimonials from colleagues and clients" actions={
        <Button size="sm" onClick={() => { setEditingId(null); reset(defaultForm); setActiveTab("add"); }}>
          <Plus className="h-4 w-4" />Add Testimonial
        </Button>
      } />
      <div className="p-6">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List className="flex border-b border-border mb-6">
            {["view", "add"].map((tab) => (
              <Tabs.Trigger key={tab} value={tab}
                className="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors data-[state=active]:border-primary data-[state=active]:text-primary border-transparent text-muted-foreground hover:text-foreground capitalize"
              >{tab === "add" ? (editingId ? "Edit Entry" : "Add Entry") : "All Testimonials"}</Tabs.Trigger>
            ))}
          </Tabs.List>
          <Tabs.Content value="view">
            <DataTable data={items} columns={columns} searchKeys={["author_name", "author_company", "content"]} loading={loading} emptyMessage="No testimonials yet." />
          </Tabs.Content>
          <Tabs.Content value="add">
            <Card><CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Author Name" required error={errors.author_name?.message}>
                    <Input {...register("author_name", { required: "Name is required" })} placeholder="John Smith" />
                  </FormField>
                  <FormField label="Author Role">
                    <Input {...register("author_role")} placeholder="Senior Engineer" />
                  </FormField>
                  <FormField label="Company">
                    <Input {...register("author_company")} placeholder="Google" />
                  </FormField>
                  <FormField label="Avatar URL">
                    <Input {...register("author_avatar_url")} type="url" placeholder="https://..." />
                  </FormField>
                </div>
                <FormField label="Testimonial Content" required error={errors.content?.message}>
                  <Textarea {...register("content", { required: "Content is required" })} rows={4} placeholder="What they said about working with you..." />
                </FormField>
                <FormField label="Rating">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button key={i} type="button" onClick={() => setValue("rating", i + 1)}>
                          <Star className={`h-5 w-5 transition-colors ${i < (rating ?? 5) ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`} />
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">{rating}/5</span>
                  </div>
                </FormField>
                <div className="flex items-center gap-3">
                  <Switch checked={isFeatured} onCheckedChange={(val) => setValue("is_featured", val)} />
                  <span className="text-sm">Feature this testimonial</span>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" loading={saving}>{editingId ? "Update" : "Add Testimonial"}</Button>
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
