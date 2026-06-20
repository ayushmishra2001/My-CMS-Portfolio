"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/layout/header";
import { Button } from "@/components/shared/button";
import { Input, FormField, Card, CardContent, Badge } from "@/components/shared/form-elements";
import { DataTable, Column } from "@/components/admin/ui/data-table";
import { ConfirmDelete } from "@/components/admin/ui/confirm-delete";
import * as Tabs from "@radix-ui/react-tabs";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Skill, SkillFormData } from "@/lib/types";
import toast from "react-hot-toast";

const defaultForm: SkillFormData = {
  name: "", category: "General", proficiency: 3,
  icon_name: null, years_experience: null, display_order: 0,
};

const PROFICIENCY_LABELS = ["", "Beginner", "Elementary", "Intermediate", "Advanced", "Expert"];

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
  const supabase = createClient();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<SkillFormData>({ defaultValues: defaultForm });
  const proficiency = watch("proficiency");

  const fetchSkills = async () => {
    setLoading(true);
    const { data } = await supabase.from("skills").select("*").order("category").order("display_order");
    setSkills(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchSkills(); }, []);

  const openEdit = (skill: Skill) => {
    setEditingId(skill.id);
    reset({ ...skill });
    setActiveTab("add");
  };

  const onSubmit = async (data: SkillFormData) => {
    setSaving(true);
    let error;
    if (editingId) {
      ({ error } = await supabase.from("skills").update(data).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("skills").insert(data));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "Skill updated" : "Skill added");
    setEditingId(null);
    reset(defaultForm);
    setActiveTab("view");
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
      key: "actions", header: "",
      cell: (row) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(row)}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(row.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <AdminHeader title="Skills" description="Manage your technical skills" actions={
        <Button size="sm" onClick={() => { setEditingId(null); reset(defaultForm); setActiveTab("add"); }}>
          <Plus className="h-4 w-4" />Add Skill
        </Button>
      } />
      <div className="p-6">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List className="flex border-b border-border mb-6">
            {["view", "add"].map((tab) => (
              <Tabs.Trigger key={tab} value={tab}
                className="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors data-[state=active]:border-primary data-[state=active]:text-primary border-transparent text-muted-foreground hover:text-foreground capitalize"
              >{tab === "add" ? (editingId ? "Edit Skill" : "Add Skill") : "All Skills"}</Tabs.Trigger>
            ))}
          </Tabs.List>
          <Tabs.Content value="view">
            <DataTable data={skills} columns={columns} searchKeys={["name", "category"]} loading={loading} emptyMessage="No skills yet." />
          </Tabs.Content>
          <Tabs.Content value="add">
            <Card><CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Skill Name" required error={errors.name?.message}>
                    <Input {...register("name", { required: "Name is required" })} placeholder="React" />
                  </FormField>
                  <FormField label="Category" required>
                    <Input {...register("category", { required: true })} placeholder="Frontend" />
                  </FormField>
                  <FormField label="Proficiency (1–5)">
                    <div className="space-y-1">
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
                  <FormField label="Display Order">
                    <Input type="number" {...register("display_order", { valueAsNumber: true })} />
                  </FormField>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" loading={saving}>{editingId ? "Update Skill" : "Add Skill"}</Button>
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
