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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Education, EducationFormData } from "@/lib/types";
import { formatDateRange } from "@/lib/utils";
import toast from "react-hot-toast";

const defaultForm: EducationFormData = {
  degree: "", field: "", institution: "", institution_url: null,
  location: null, start_date: null, end_date: null,
  is_current: false, grade: null, description: null, display_order: 0,
};

export default function EducationPage() {
  const [items, setItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
  const supabase = createClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EducationFormData>({ defaultValues: defaultForm });
  const isCurrent = watch("is_current");

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("education").select("*").order("start_date", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openEdit = (item: Education) => {
    setEditingId(item.id);
    reset({ ...item });
    setActiveTab("add");
  };

  const onSubmit = async (data: EducationFormData) => {
    setSaving(true);
    const payload = { ...data, end_date: data.is_current ? null : data.end_date };
    let error;
    if (editingId) {
      ({ error } = await supabase.from("education").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("education").insert(payload));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "Education updated" : "Education added");
    setEditingId(null); reset(defaultForm); setActiveTab("view"); fetchItems();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("education").delete().eq("id", deleteId);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Education deleted");
    setDeleteId(null); fetchItems();
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
      <AdminHeader title="Education" description="Manage your academic background" actions={
        <Button size="sm" onClick={() => { setEditingId(null); reset(defaultForm); setActiveTab("add"); }}>
          <Plus className="h-4 w-4" />Add Education
        </Button>
      } />
      <div className="p-6">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List className="flex border-b border-border mb-6">
            {["view", "add"].map((tab) => (
              <Tabs.Trigger key={tab} value={tab}
                className="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors data-[state=active]:border-primary data-[state=active]:text-primary border-transparent text-muted-foreground hover:text-foreground capitalize"
              >{tab === "add" ? (editingId ? "Edit Entry" : "Add Entry") : "All Education"}</Tabs.Trigger>
            ))}
          </Tabs.List>
          <Tabs.Content value="view">
            <DataTable data={items} columns={columns} searchKeys={["degree", "field", "institution"]} loading={loading} emptyMessage="No education entries yet." />
          </Tabs.Content>
          <Tabs.Content value="add">
            <Card><CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Degree" required error={errors.degree?.message}>
                    <Input {...register("degree", { required: "Degree is required" })} placeholder="B.Tech / B.Sc / MBA" />
                  </FormField>
                  <FormField label="Field of Study" required error={errors.field?.message}>
                    <Input {...register("field", { required: "Field is required" })} placeholder="Computer Science" />
                  </FormField>
                  <FormField label="Institution" required error={errors.institution?.message} className="col-span-2">
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
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={isCurrent} onCheckedChange={(val) => setValue("is_current", val)} />
                  <span className="text-sm">Currently studying here</span>
                </div>
                <FormField label="Description">
                  <Textarea {...register("description")} rows={3} placeholder="Notable achievements, activities, coursework..." />
                </FormField>
                <div className="flex gap-3">
                  <Button type="submit" loading={saving}>{editingId ? "Update" : "Add Education"}</Button>
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
