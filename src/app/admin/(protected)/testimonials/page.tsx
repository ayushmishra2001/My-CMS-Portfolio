"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/layout/header";
import { Button } from "@/components/shared/button";
import { Input, Textarea, FormField, Card, CardContent, CardHeader, CardTitle, Switch } from "@/components/shared/form-elements";
import { DataTable, Column } from "@/components/admin/ui/data-table";
import { ConfirmDelete } from "@/components/admin/ui/confirm-delete";
import { Pencil, Trash2, X, Star } from "lucide-react";
import { Testimonial, TestimonialFormData } from "@/lib/types";
import toast from "react-hot-toast";

const defaultForm: TestimonialFormData = {
  author_name: "", author_role: null, author_company: null, author_avatar_url: null,
  content: "", rating: 5, is_featured: false, display_order: 0,
  is_visible: true,
};

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const supabase = createClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TestimonialFormData>({ defaultValues: defaultForm });
  const isFeatured = watch("is_featured");
  const rating = watch("rating") || 5;

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
    
    // Scroll to top form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data: TestimonialFormData) => {
    setSaving(true);
    let error;
    let payload = { ...data };
    if (editingId) {
      ({ error } = await supabase.from("testimonials").update(payload).eq("id", editingId));
    } else {
      const nextOrder = items.reduce((max, x) => Math.max(max, x.display_order), -1) + 1;
      payload.display_order = nextOrder;
      ({ error } = await supabase.from("testimonials").insert(payload));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "Testimonial updated" : "Testimonial added");
    setEditingId(null);
    reset(defaultForm);
    fetchItems();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("testimonials").delete().eq("id", deleteId);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Testimonial deleted");
    setDeleteId(null);
    fetchItems();
  };

  const toggleFeatured = async (item: Testimonial) => {
    await supabase.from("testimonials").update({ is_featured: !item.is_featured }).eq("id", item.id);
    fetchItems();
  };

  const toggleVisible = async (item: Testimonial) => {
    await supabase.from("testimonials").update({ is_visible: !item.is_visible }).eq("id", item.id);
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

    const { error } = await supabase.from("testimonials").upsert(updates);
    if (error) {
      toast.error("Failed to update order: " + error.message);
      fetchItems();
    } else {
      toast.success("Order updated");
    }
  };

  const columns: Column<Testimonial>[] = [
    {
      key: "author_name", header: "Client / Colleague", sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.author_avatar_url && <img src={row.author_avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border" />}
          <div>
            <p className="font-medium text-sm">{row.author_name}</p>
            <p className="text-xs text-muted-foreground">{row.author_role} at {row.author_company}</p>
          </div>
        </div>
      ),
    },
    {
      key: "rating", header: "Rating",
      cell: (row) => (
        <div className="flex text-amber-500 gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < row.rating ? "fill-amber-500" : "text-muted"}`} />
          ))}
        </div>
      ),
    },
    {
      key: "is_featured", header: "Featured",
      cell: (row) => (
        <Switch checked={row.is_featured} onCheckedChange={() => toggleFeatured(row)} />
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
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(row)}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(row.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <AdminHeader title="Testimonials" description="Manage user reviews and recommendations" />
      
      <div className="p-6 space-y-6">
        {/* Upper Half: Form Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">
              {editingId ? "Edit Testimonial Entry" : "Add New Testimonial Entry"}
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
                <FormField label="Author Name" required error={errors.author_name?.message}>
                  <Input {...register("author_name", { required: "Name is required" })} placeholder="John Doe" />
                </FormField>
                <FormField label="Author Role / Designation">
                  <Input {...register("author_role")} placeholder="Product Manager" />
                </FormField>
                <FormField label="Company">
                  <Input {...register("author_company")} placeholder="Google" />
                </FormField>
                <FormField label="Avatar URL">
                  <Input {...register("author_avatar_url")} type="url" placeholder="https://..." />
                </FormField>
                <FormField label="Rating">
                  <div className="flex items-center gap-3 pt-2">
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
                <div className="md:col-span-3">
                  <FormField label="Testimonial Text" required error={errors.content?.message}>
                    <Textarea {...register("content", { required: "Testimonial content is required" })} rows={2} placeholder="Write their testimonial or recommendation here..." />
                  </FormField>
                </div>
              </div>
              <div className="flex items-center gap-6 py-1">
                <div className="flex items-center gap-3">
                  <Switch checked={isFeatured} onCheckedChange={(val) => setValue("is_featured", val)} />
                  <span className="text-sm">Feature on main page</span>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={watch("is_visible") ?? true} onCheckedChange={(val) => setValue("is_visible", val)} />
                  <span className="text-sm">Visible</span>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                {editingId && (
                  <Button type="button" variant="outline" size="sm" onClick={() => { setEditingId(null); reset(defaultForm); }}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" size="sm" loading={saving}>
                  {editingId ? "Save Changes" : "Save Testimonial"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Bottom Half: Table Card */}
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">All Testimonials</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable data={items} columns={columns} searchKeys={["author_name", "author_role", "author_company", "content"]} loading={loading} emptyMessage="No testimonials yet." onReorder={handleReorder} />
          </CardContent>
        </Card>
      </div>
      <ConfirmDelete open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
    </div>
  );
}
