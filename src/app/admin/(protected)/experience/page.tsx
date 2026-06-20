"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/layout/header";
import { Button } from "@/components/shared/button";
import { Input, Textarea, FormField, Card, CardContent, Badge, Switch } from "@/components/shared/form-elements";
import { DataTable, Column } from "@/components/admin/ui/data-table";
import { ConfirmDelete } from "@/components/admin/ui/confirm-delete";
import { TagInput } from "@/components/admin/ui/tag-input";
import * as Tabs from "@radix-ui/react-tabs";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Experience, ExperienceFormData } from "@/lib/types";
import { formatDateRange } from "@/lib/utils";
import toast from "react-hot-toast";

const defaultForm: ExperienceFormData = {
  role: "", company: "", company_url: null, location: null,
  employment_type: "Full-time", start_date: "", end_date: null,
  is_current: false, description: null, achievements: null,
  tech_used: [], display_order: 0,
};

export default function ExperiencePage() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
  const supabase = createClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ExperienceFormData>({ defaultValues: defaultForm });
  const isCurrent = watch("is_current");
  const techUsed = watch("tech_used");

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("experience").select("*").order("start_date", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openEdit = (item: Experience) => {
    setEditingId(item.id);
    reset({ ...item });
    setActiveTab("add");
  };

  const onSubmit = async (data: ExperienceFormData) => {
    setSaving(true);
    const payload = { ...data, end_date: data.is_current ? null : data.end_date };
    let error;
    if (editingId) {
      ({ error } = await supabase.from("experience").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("experience").insert(payload));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "Experience updated" : "Experience added");
    setEditingId(null); reset(defaultForm); setActiveTab("view"); fetchItems();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("experience").delete().eq("id", deleteId);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Experience deleted");
    setDeleteId(null); fetchItems();
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
      <AdminHeader title="Experience" description="Manage your work history" actions={
        <Button size="sm" onClick={() => { setEditingId(null); reset(defaultForm); setActiveTab("add"); }}>
          <Plus className="h-4 w-4" />Add Experience
        </Button>
      } />
      <div className="p-6">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List className="flex border-b border-border mb-6">
            {["view", "add"].map((tab) => (
              <Tabs.Trigger key={tab} value={tab}
                className="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors data-[state=active]:border-primary data-[state=active]:text-primary border-transparent text-muted-foreground hover:text-foreground capitalize"
              >{tab === "add" ? (editingId ? "Edit Entry" : "Add Entry") : "All Experience"}</Tabs.Trigger>
            ))}
          </Tabs.List>
          <Tabs.Content value="view">
            <DataTable data={items} columns={columns} searchKeys={["role", "company"]} loading={loading} emptyMessage="No experience entries yet." />
          </Tabs.Content>
          <Tabs.Content value="add">
            <Card><CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
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
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={isCurrent} onCheckedChange={(val) => setValue("is_current", val)} />
                  <span className="text-sm">Currently working here</span>
                </div>
                <FormField label="Description">
                  <Textarea {...register("description")} rows={3} placeholder="Describe your responsibilities and impact..." />
                </FormField>
                <FormField label="Technologies Used">
                  <TagInput value={techUsed || []} onChange={(tags) => setValue("tech_used", tags)} placeholder="Java, Spring Boot..." />
                </FormField>
                <div className="flex gap-3">
                  <Button type="submit" loading={saving}>{editingId ? "Update" : "Add Experience"}</Button>
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
