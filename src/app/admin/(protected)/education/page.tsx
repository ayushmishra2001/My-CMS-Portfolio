"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/layout/header";
import { Button } from "@/components/shared/button";
import { Input, Textarea, FormField, Card, CardContent, CardHeader, CardTitle, Badge, Switch } from "@/components/shared/form-elements";
import { DataTable, Column } from "@/components/admin/ui/data-table";
import { ConfirmDelete } from "@/components/admin/ui/confirm-delete";
import { Pencil, Trash2, X } from "lucide-react";
import { Education, EducationFormData } from "@/lib/types";
import { formatDateRange } from "@/lib/utils";
import toast from "react-hot-toast";

const defaultForm: EducationFormData = {
  degree: "", field: "", institution: "", institution_url: null,
  location: null, start_date: null, end_date: null,
  is_current: false, grade: null, description: null, display_order: 0,
  is_visible: true,
};

export default function EducationPage() {
  const [items, setItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const supabase = createClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EducationFormData>({ defaultValues: defaultForm });
  const isCurrent = watch("is_current");

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("education").select("*").order("display_order");
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openEdit = (item: Education) => {
    setEditingId(item.id);
    reset({ ...item });
    
    // Scroll to top form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data: EducationFormData) => {
    setSaving(true);
    const payload = { ...data, end_date: data.is_current ? null : data.end_date };
    let error;
    if (editingId) {
      ({ error } = await supabase.from("education").update(payload).eq("id", editingId));
    } else {
      const nextOrder = items.reduce((max, x) => Math.max(max, x.display_order), -1) + 1;
      payload.display_order = nextOrder;
      ({ error } = await supabase.from("education").insert(payload));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "Education updated" : "Education added");
    setEditingId(null);
    reset(defaultForm);
    fetchItems();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("education").delete().eq("id", deleteId);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Education deleted");
    setDeleteId(null);
    fetchItems();
  };

  const toggleVisible = async (item: Education) => {
    await supabase.from("education").update({ is_visible: !item.is_visible }).eq("id", item.id);
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

    const { error } = await supabase.from("education").upsert(updates);
    if (error) {
      toast.error("Failed to update order: " + error.message);
      fetchItems();
    } else {
      toast.success("Order updated");
    }
  };

  const columns: Column<Education>[] = [
    {
      key: "degree", header: "Degree / Field", sortable: true,
      cell: (row) => (
        <div>
          <p className="font-medium">{row.degree} in {row.field}</p>
          <p className="text-xs text-muted-foreground">{row.institution}</p>
        </div>
      ),
    },
    {
      key: "start_date", header: "Duration",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatDateRange(row.start_date, row.end_date, row.is_current)}
        </span>
      ),
    },
    {
      key: "grade", header: "Grade",
      cell: (row) => row.grade
        ? <Badge variant="secondary">{row.grade}</Badge>
        : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      key: "is_current", header: "Status",
      cell: (row) => row.is_current ? <Badge variant="success">Ongoing</Badge> : <Badge variant="secondary">Completed</Badge>,
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
      <AdminHeader title="Education" description="Manage your academic background" />
      
      <div className="p-6 space-y-6">
        {/* Upper Half: Form Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">
              {editingId ? "Edit Education Entry" : "Add New Education Entry"}
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
                <FormField label="Degree" required error={errors.degree?.message}>
                  <Input {...register("degree", { required: "Degree is required" })} placeholder="B.Tech / B.Sc / MBA" />
                </FormField>
                <FormField label="Field of Study" required error={errors.field?.message}>
                  <Input {...register("field", { required: "Field is required" })} placeholder="Computer Science" />
                </FormField>
                <FormField label="Institution" required error={errors.institution?.message}>
                  <Input {...register("institution", { required: "Institution is required" })} placeholder="IIT Patna" />
                </FormField>
                <FormField label="Institution URL">
                  <Input {...register("institution_url")} type="url" placeholder="https://iitp.ac.in" />
                </FormField>
                <FormField label="Location">
                  <Input {...register("location")} placeholder="Patna, Bihar" />
                </FormField>
                <FormField label="Start Date">
                  <Input {...register("start_date")} type="date" />
                </FormField>
                {!isCurrent && (
                  <FormField label="End Date">
                    <Input {...register("end_date")} type="date" />
                  </FormField>
                )}
                <FormField label="Grade / CGPA">
                  <Input {...register("grade")} placeholder="8.5 / 10 or First Class" />
                </FormField>
                <div className="md:col-span-3">
                  <FormField label="Description">
                    <Textarea {...register("description")} rows={2} placeholder="Notable achievements, coursework, etc..." />
                  </FormField>
                </div>
              </div>
              <div className="flex items-center gap-6 py-1">
                <div className="flex items-center gap-3">
                  <Switch checked={isCurrent} onCheckedChange={(val) => setValue("is_current", val)} />
                  <span className="text-sm">Currently studying here</span>
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
                  {editingId ? "Save Changes" : "Save Education"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Bottom Half: Table Card */}
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">All Education</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable data={items} columns={columns} searchKeys={["degree", "field", "institution"]} loading={loading} emptyMessage="No education entries yet." onReorder={handleReorder} />
          </CardContent>
        </Card>
      </div>
      <ConfirmDelete open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
    </div>
  );
}
