"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/layout/header";
import { Button } from "@/components/shared/button";
import { Input, FormField, Card, CardContent, CardHeader, CardTitle, Badge, Switch } from "@/components/shared/form-elements";
import { DataTable, Column } from "@/components/admin/ui/data-table";
import { ConfirmDelete } from "@/components/admin/ui/confirm-delete";
import { Pencil, Trash2, X } from "lucide-react";
import { Skill, SkillFormData } from "@/lib/types";
import toast from "react-hot-toast";

const defaultForm: SkillFormData = {
  name: "", category: "General", proficiency: 3,
  icon_name: null, years_experience: null, display_order: 0,
  is_visible: true,
};

const PROFICIENCY_LABELS = ["", "Beginner", "Elementary", "Intermediate", "Advanced", "Expert"];

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const supabase = createClient();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<SkillFormData>({ defaultValues: defaultForm });
  const proficiency = watch("proficiency");

  const fetchSkills = async () => {
    setLoading(true);
    const { data } = await supabase.from("skills").select("*").order("display_order");
    setSkills(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchSkills(); }, []);

  const openEdit = (skill: Skill) => {
    setEditingId(skill.id);
    reset({ ...skill });
  };

  const onSubmit = async (data: SkillFormData) => {
    setSaving(true);
    let error;
    let payload = { ...data };
    if (editingId) {
      ({ error } = await supabase.from("skills").update(payload).eq("id", editingId));
    } else {
      const nextOrder = skills.reduce((max, s) => Math.max(max, s.display_order), -1) + 1;
      payload.display_order = nextOrder;
      ({ error } = await supabase.from("skills").insert(payload));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "Skill updated" : "Skill added");
    setEditingId(null);
    reset(defaultForm);
    fetchSkills();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("skills").delete().eq("id", deleteId);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Skill deleted");
    setDeleteId(null);
    fetchSkills();
  };

  const handleReorder = async (draggedId: string, targetId: string) => {
    const draggedIdx = skills.findIndex((s) => s.id === draggedId);
    const targetIdx = skills.findIndex((s) => s.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;

    const newItems = [...skills];
    const [draggedItem] = newItems.splice(draggedIdx, 1);
    newItems.splice(targetIdx, 0, draggedItem);

    setSkills(newItems);

    const updates = newItems.map((item, idx) => ({
      ...item,
      display_order: idx,
    }));

    const { error } = await supabase.from("skills").upsert(updates);
    if (error) {
      toast.error("Failed to update order: " + error.message);
      fetchSkills();
    } else {
      toast.success("Order updated");
    }
  };

  const columns: Column<Skill>[] = [
    { key: "name", header: "Skill", sortable: true, cell: (row) => <span className="font-medium">{row.name}</span> },
    { key: "category", header: "Category", sortable: true, cell: (row) => <Badge variant="secondary">{row.category}</Badge> },
    {
      key: "proficiency", header: "Proficiency",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i < row.proficiency ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{PROFICIENCY_LABELS[row.proficiency]}</span>
        </div>
      ),
    },
    {
      key: "years_experience", header: "Years",
      cell: (row) => row.years_experience ? <span className="text-sm">{row.years_experience}y</span> : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      key: "is_visible", header: "Visible",
      cell: (row) => (
        <Switch
          checked={row.is_visible}
          onCheckedChange={async (checked) => {
            const { error } = await supabase.from("skills").update({ is_visible: checked }).eq("id", row.id);
            if (error) {
              toast.error(error.message);
            } else {
              toast.success("Skill visibility updated");
              fetchSkills();
            }
          }}
        />
      ),
    },
    {
      key: "actions", header: "",
      cell: (row) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(row)}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(row.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ];

  const uniqueCategories = Array.from(
    new Set(
      skills
        .map((s) => s.category)
        .filter((cat): cat is string => typeof cat === "string" && cat.trim().length > 0)
        .map((cat) => cat.trim())
    )
  ).sort();

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <AdminHeader title="Skills" description="Manage your technical skills" />
      <div className="p-6 space-y-6">
        {/* Upper Half: Form Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">
              {editingId ? "Edit Skill" : "Add New Skill"}
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
                <FormField label="Skill Name" required error={errors.name?.message}>
                  <Input {...register("name", { required: "Name is required" })} placeholder="React" />
                </FormField>
                <FormField label="Category" required error={errors.category?.message}>
                  <Input 
                    list="skills-categories" 
                    {...register("category", { required: "Category is required" })} 
                    placeholder="Frontend" 
                  />
                  <datalist id="skills-categories">
                    {uniqueCategories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </FormField>
                <FormField label="Proficiency (1–5)">
                  <div className="space-y-1 pt-1.5">
                    <input type="range" min={1} max={5} step={1} {...register("proficiency", { valueAsNumber: true })} className="w-full accent-primary" />
                    <p className="text-xs text-muted-foreground">{PROFICIENCY_LABELS[proficiency ?? 3]}</p>
                  </div>
                </FormField>
                <FormField label="Years Experience">
                  <Input type="number" step="0.5" {...register("years_experience", { valueAsNumber: true })} placeholder="2.5" />
                </FormField>
                <FormField label="Icon Name" hint="Lucide icon name e.g. 'code-2'">
                  <Input {...register("icon_name")} placeholder="code-2" />
                </FormField>
                <div className="flex items-center gap-3 md:col-span-3 py-1">
                  <Switch
                    checked={watch("is_visible") ?? true}
                    onCheckedChange={(val) => setValue("is_visible", val)}
                  />
                  <div>
                    <p className="text-sm font-medium">Visible</p>
                    <p className="text-xs text-muted-foreground">Show this skill on the portfolio</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                {editingId && (
                  <Button type="button" variant="outline" size="sm" onClick={() => { setEditingId(null); reset(defaultForm); }}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" size="sm" loading={saving}>
                  {editingId ? "Save Changes" : "Save Skill"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Bottom Half: Table Card */}
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">All Skills</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable data={skills} columns={columns} searchKeys={["name", "category"]} loading={loading} emptyMessage="No skills yet." onReorder={handleReorder} />
          </CardContent>
        </Card>
      </div>
      <ConfirmDelete open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
    </div>
  );
}
