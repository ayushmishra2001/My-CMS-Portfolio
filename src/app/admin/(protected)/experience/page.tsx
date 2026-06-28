"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/layout/header";
import { Button } from "@/components/shared/button";
import { Input, Textarea, FormField, Card, CardContent, CardHeader, CardTitle, Badge, Switch } from "@/components/shared/form-elements";
import { DataTable, Column } from "@/components/admin/ui/data-table";
import { ConfirmDelete } from "@/components/admin/ui/confirm-delete";
import { TagInput } from "@/components/admin/ui/tag-input";
import { Pencil, Trash2, X } from "lucide-react";
import { Experience, ExperienceFormData } from "@/lib/types";
import { formatDateRange } from "@/lib/utils";
import toast from "react-hot-toast";

interface ExperienceFormInput extends Omit<ExperienceFormData, "achievements"> {
  achievementsText?: string;
}

const defaultForm: ExperienceFormInput = {
  role: "", company: "", company_url: null, location: null,
  employment_type: "Full-time", start_date: "", end_date: null,
  is_current: false, description: null, achievementsText: "",
  tech_used: [], display_order: 0,
  is_visible: true,
};

export default function ExperiencePage() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const supabase = createClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ExperienceFormInput>({ defaultValues: defaultForm });
  const isCurrent = watch("is_current");
  const techUsed = watch("tech_used");

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("experience").select("*").order("display_order");
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openEdit = (item: Experience) => {
    setEditingId(item.id);
    reset({ 
      ...item,
      achievementsText: item.achievements ? item.achievements.join("\n") : ""
    });
    
    // Scroll to top form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data: ExperienceFormInput) => {
    setSaving(true);
    const achievementsList = data.achievementsText
      ? data.achievementsText.split("\n").map(l => l.trim()).filter(Boolean)
      : [];
    const payload = {
      role: data.role,
      company: data.company,
      company_url: data.company_url,
      location: data.location,
      employment_type: data.employment_type,
      start_date: data.start_date,
      end_date: data.is_current ? null : data.end_date,
      is_current: data.is_current,
      description: data.description,
      achievements: achievementsList.length > 0 ? achievementsList : null,
      tech_used: data.tech_used,
      display_order: data.display_order,
      is_visible: data.is_visible,
    };
    let error;
    if (editingId) {
      ({ error } = await supabase.from("experience").update(payload).eq("id", editingId));
    } else {
      const nextOrder = items.reduce((max, x) => Math.max(max, x.display_order), -1) + 1;
      payload.display_order = nextOrder;
      ({ error } = await supabase.from("experience").insert(payload));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "Experience updated" : "Experience added");
    setEditingId(null);
    reset(defaultForm);
    fetchItems();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("experience").delete().eq("id", deleteId);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Experience deleted");
    setDeleteId(null);
    fetchItems();
  };

  const toggleVisible = async (item: Experience) => {
    await supabase.from("experience").update({ is_visible: !item.is_visible }).eq("id", item.id);
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

    const { error } = await supabase.from("experience").upsert(updates);
    if (error) {
      toast.error("Failed to update order: " + error.message);
      fetchItems();
    } else {
      toast.success("Order updated");
    }
  };

  const columns: Column<Experience>[] = [
    {
      key: "role", header: "Role / Company", sortable: true,
      cell: (row) => (
        <div>
          <p className="font-medium">{row.role}</p>
          <p className="text-xs text-muted-foreground">{row.company}</p>
        </div>
      ),
    },
    { key: "employment_type", header: "Type", cell: (row) => <Badge variant="secondary">{row.employment_type}</Badge> },
    {
      key: "start_date", header: "Duration",
      cell: (row) => <span className="text-sm text-muted-foreground">{formatDateRange(row.start_date, row.end_date, row.is_current)}</span>,
    },
    {
      key: "is_current", header: "Current",
      cell: (row) => row.is_current ? <Badge variant="success">Current</Badge> : null,
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
      <AdminHeader title="Experience" description="Manage your work history" />
      
      <div className="p-6 space-y-6">
        {/* Upper Half: Form Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">
              {editingId ? "Edit Experience Entry" : "Add New Experience Entry"}
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
                <FormField label="Job Title" required error={errors.role?.message}>
                  <Input {...register("role", { required: "Role is required" })} placeholder="Senior Developer" />
                </FormField>
                <FormField label="Company" required error={errors.company?.message}>
                  <Input {...register("company", { required: "Company is required" })} placeholder="Acme Corp" />
                </FormField>
                <FormField label="Company URL">
                  <Input {...register("company_url")} type="url" placeholder="https://company.com" />
                </FormField>
                <FormField label="Location">
                  <Input {...register("location")} placeholder="Kolkata, IN / Remote" />
                </FormField>
                <FormField label="Employment Type">
                  <select {...register("employment_type")} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    {["Full-time", "Part-time", "Contract", "Freelance", "Internship"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </FormField>
                <FormField label="Start Date" required>
                  <Input {...register("start_date", { required: true })} type="date" />
                </FormField>
                {!isCurrent && (
                  <FormField label="End Date">
                    <Input {...register("end_date")} type="date" />
                  </FormField>
                )}
                <div className={`md:col-span-${isCurrent ? 2 : 1}`}>
                  <FormField label="Technologies Used">
                    <TagInput value={techUsed || []} onChange={(tags) => setValue("tech_used", tags)} placeholder="Java, Spring Boot..." />
                  </FormField>
                </div>
                <div className="md:col-span-3">
                  <FormField label="Description">
                    <Textarea {...register("description")} rows={2} placeholder="Describe your responsibilities and impact..." />
                  </FormField>
                </div>
                <div className="md:col-span-3">
                  <FormField label="Achievements / Deliverables" hint="Enter one achievement per line. These will be formatted as a numbered list.">
                    <Textarea {...register("achievementsText")} rows={4} placeholder="Reduced API latency by 40% using Redis caching&#10;Led a team of 4 engineers to rebuild the analytics dashboard" />
                  </FormField>
                </div>
              </div>
              <div className="flex items-center gap-6 py-1">
                <div className="flex items-center gap-3">
                  <Switch checked={isCurrent} onCheckedChange={(val) => setValue("is_current", val)} />
                  <span className="text-sm">Currently working here</span>
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
                  {editingId ? "Save Changes" : "Save Experience"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Bottom Half: Table Card */}
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">All Experience</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable data={items} columns={columns} searchKeys={["role", "company"]} loading={loading} emptyMessage="No experience entries yet." onReorder={handleReorder} />
          </CardContent>
        </Card>
      </div>
      <ConfirmDelete open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
    </div>
  );
}
