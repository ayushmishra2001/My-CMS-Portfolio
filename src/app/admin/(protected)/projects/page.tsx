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
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Pencil, Trash2, ExternalLink, X, Github, Image as ImageIcon, Sparkles } from "lucide-react";
import { Project, ProjectFormData } from "@/lib/types";
import toast from "react-hot-toast";

interface ProjectFormInput extends Omit<ProjectFormData, "seo_meta"> {
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

const defaultForm: ProjectFormInput = {
  title: "", slug: null, description: null, long_description: null,
  tech_stack: [], live_url: null, github_url: null, image_url: null,
  status: "completed", is_featured: false, display_order: 0,
  start_date: null, end_date: null,
  seo_title: "", seo_description: "", seo_keywords: "",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("view");

  // GitHub Sync states
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [fetchingRepos, setFetchingRepos] = useState(false);

  // Project Gallery states
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const supabase = createClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProjectFormInput>({
    defaultValues: defaultForm,
  });

  const techStack = watch("tech_stack");
  const isFeatured = watch("is_featured");

  const fetchProjects = async () => {
    setLoading(true);
    // Fetch projects along with their multiple gallery images
    const { data } = await supabase.from("projects").select("*, project_images(*)").order("display_order");
    setProjects(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setAdditionalImages([]);
    reset(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingId(project.id);
    reset({
      ...project,
      seo_title: project.seo_meta?.title || "",
      seo_description: project.seo_meta?.description || "",
      seo_keywords: project.seo_meta?.keywords || "",
    });
    // Set gallery images
    const images = project.project_images?.map((pi) => pi.image_url) || [];
    setAdditionalImages(images);
    setDialogOpen(true);
  };

  const onSubmit = async (data: ProjectFormInput) => {
    setSaving(true);
    const payload = {
      title: data.title,
      slug: data.slug || data.title.toLowerCase().replace(/\s+/g, "-"),
      description: data.description,
      long_description: data.long_description,
      tech_stack: data.tech_stack,
      live_url: data.live_url,
      github_url: data.github_url,
      image_url: data.image_url,
      status: data.status,
      is_featured: data.is_featured,
      display_order: data.display_order,
      start_date: data.start_date,
      end_date: data.end_date,
      seo_meta: {
        title: data.seo_title || "",
        description: data.seo_description || "",
        keywords: data.seo_keywords || "",
      }
    };

    let error;
    let projectId = editingId;
    if (editingId) {
      ({ error } = await supabase.from("projects").update(payload).eq("id", editingId));
    } else {
      const { data: newProj, error: err } = await supabase.from("projects").insert(payload).select().single();
      error = err;
      if (newProj) projectId = newProj.id;
    }

    if (error) {
      setSaving(false);
      toast.error(error.message);
      return;
    }

    // Update gallery images in project_images table
    if (projectId) {
      await supabase.from("project_images").delete().eq("project_id", projectId);
      if (additionalImages.length > 0) {
        const imageInserts = additionalImages.map((url, idx) => ({
          project_id: projectId,
          image_url: url,
          display_order: idx,
        }));
        await supabase.from("project_images").insert(imageInserts);
      }
    }

    setSaving(false);
    toast.success(editingId ? "Project updated" : "Project created");
    setDialogOpen(false);
    fetchProjects();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("projects").delete().eq("id", deleteId);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Project deleted");
    setDeleteId(null);
    fetchProjects();
  };

  const toggleFeatured = async (project: Project) => {
    await supabase.from("projects").update({ is_featured: !project.is_featured }).eq("id", project.id);
    fetchProjects();
  };

  // GitHub Repositories Fetch
  const fetchGitHubRepos = async () => {
    if (!githubUsername) return;
    setFetchingRepos(true);
    try {
      const res = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=50`);
      if (!res.ok) throw new Error("User not found or API limit exceeded");
      const data = await res.json();
      setGithubRepos(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setFetchingRepos(false);
    }
  };

  // Pre-fill form from selected GitHub Repo
  const importRepo = (repo: any) => {
    reset({
      title: repo.name.replace(/[-_]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      slug: repo.name.toLowerCase(),
      description: repo.description || "",
      github_url: repo.html_url,
      live_url: repo.homepage || "",
      tech_stack: repo.language ? [repo.language] : [],
      status: "completed",
      is_featured: false,
      display_order: 0,
      seo_title: repo.name,
      seo_description: repo.description || "",
      seo_keywords: repo.language ? repo.language.toLowerCase() : "",
    });
    setAdditionalImages([]);
    setGithubDialogOpen(false);
    setDialogOpen(true);
    toast.success("Imported repository data! Review and save.");
  };

  // Gallery Helpers
  const addImage = () => {
    if (!newImageUrl) return;
    if (!newImageUrl.startsWith("http")) {
      toast.error("Please enter a valid URL");
      return;
    }
    setAdditionalImages([...additionalImages, newImageUrl]);
    setNewImageUrl("");
  };

  const removeImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, idx) => idx !== index));
  };

  const STATUS_COLORS = {
    completed: "success" as const,
    in_progress: "warning" as const,
    archived: "secondary" as const,
  };

  const columns: Column<Project>[] = [
    {
      key: "title", header: "Title", sortable: true,
      cell: (row) => (
        <div>
          <p className="font-medium">{row.title}</p>
          {row.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{row.description}</p>}
        </div>
      ),
    },
    {
      key: "tech_stack", header: "Stack",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.tech_stack.slice(0, 3).map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
          {row.tech_stack.length > 3 && <Badge variant="secondary" className="text-xs">+{row.tech_stack.length - 3}</Badge>}
        </div>
      ),
    },
    {
      key: "status", header: "Status", sortable: true,
      cell: (row) => <Badge variant={STATUS_COLORS[row.status]}>{row.status.replace("_", " ")}</Badge>,
    },
    {
      key: "is_featured", header: "Featured",
      cell: (row) => (
        <Switch checked={row.is_featured} onCheckedChange={() => toggleFeatured(row)} />
      ),
    },
    {
      key: "actions", header: "",
      cell: (row) => (
        <div className="flex items-center gap-1 justify-end">
          {row.live_url && <a href={row.live_url} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="h-3.5 w-3.5" /></Button></a>}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(row)}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(row.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <AdminHeader
        title="Projects"
        description="Manage your portfolio projects"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setGithubDialogOpen(true)}>
              <Github className="h-4 w-4" />Sync GitHub
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />Add Project
            </Button>
          </div>
        }
      />

      <div className="p-6">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List className="flex border-b border-border mb-6">
            {["view", "add"].map((tab) => (
              <Tabs.Trigger key={tab} value={tab}
                className="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors data-[state=active]:border-primary data-[state=active]:text-primary border-transparent text-muted-foreground hover:text-foreground capitalize"
              >{tab === "add" ? (editingId ? "Edit Project" : "Add Project") : "All Projects"}</Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="view">
            <DataTable data={projects} columns={columns} searchKeys={["title", "description"]} loading={loading} emptyMessage="No projects yet. Add your first project." />
          </Tabs.Content>

          <Tabs.Content value="add">
            <Card><CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Title" required error={errors.title?.message} className="col-span-2">
                    <Input {...register("title", { required: "Title is required" })} placeholder="My Awesome Project" />
                  </FormField>
                  <FormField label="Status">
                    <select {...register("status")} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="completed">Completed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="archived">Archived</option>
                    </select>
                  </FormField>
                  <FormField label="Display Order">
                    <Input type="number" {...register("display_order", { valueAsNumber: true })} />
                  </FormField>
                </div>
                <FormField label="Short Description">
                  <Textarea {...register("description")} placeholder="A brief one-line description" rows={2} />
                </FormField>
                <FormField label="Full Description">
                  <Textarea {...register("long_description")} placeholder="Detailed project description..." rows={4} />
                </FormField>
                <FormField label="Tech Stack" hint="Type and press Enter to add technologies">
                  <TagInput value={techStack || []} onChange={(tags) => setValue("tech_stack", tags)} placeholder="React, Node.js, PostgreSQL..." />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Live URL">
                    <Input {...register("live_url")} type="url" placeholder="https://myproject.com" />
                  </FormField>
                  <FormField label="GitHub URL">
                    <Input {...register("github_url")} type="url" placeholder="https://github.com/user/repo" />
                  </FormField>
                  <FormField label="Primary Image URL">
                    <Input {...register("image_url")} type="url" placeholder="https://..." />
                  </FormField>
                  <FormField label="Start Date">
                    <Input {...register("start_date")} type="date" />
                  </FormField>
                </div>

                {/* Project Gallery */}
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-1.5"><ImageIcon className="h-4 w-4" />Project Gallery (Additional screenshots)</p>
                  <div className="flex gap-2 mb-3">
                    <Input placeholder="Enter screenshot image URL..." value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} />
                    <Button type="button" variant="outline" size="sm" onClick={addImage}>Add Image</Button>
                  </div>
                  {additionalImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3 rounded-lg border">
                      {additionalImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-video rounded border overflow-hidden group">
                          <img src={img} alt={`Screenshot ${idx + 1}`} className="object-cover w-full h-full" />
                          <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-destructive/80 hover:bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Project SEO */}
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Sparkles className="h-4 w-4" />SEO Meta Settings</p>
                  <div className="space-y-3">
                    <FormField label="SEO Meta Title">
                      <Input {...register("seo_title")} placeholder="Targeted browser title..." />
                    </FormField>
                    <FormField label="SEO Meta Description">
                      <Textarea {...register("seo_description")} placeholder="Short description shown in search results..." rows={2} />
                    </FormField>
                    <FormField label="SEO Meta Keywords" hint="Separated by commas">
                      <Input {...register("seo_keywords")} placeholder="web dev, projects, app..." />
                    </FormField>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch checked={isFeatured} onCheckedChange={(val) => setValue("is_featured", val)} />
                  <span className="text-sm">Featured project</span>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" loading={saving}>
                    {editingId ? "Update Project" : "Create Project"}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={() => { setEditingId(null); reset(defaultForm); setAdditionalImages([]); }}>
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </form>
            </CardContent></Card>
          </Tabs.Content>
        </Tabs.Root>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-base font-semibold">{editingId ? "Edit Project" : "New Project"}</Dialog.Title>
              <Dialog.Close asChild><Button variant="ghost" size="icon" className="h-7 w-7"><X className="h-4 w-4" /></Button></Dialog.Close>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Title" required error={errors.title?.message} className="col-span-2">
                  <Input {...register("title", { required: "Title is required" })} placeholder="My Awesome Project" />
                </FormField>
                <FormField label="Status">
                  <select {...register("status")} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="archived">Archived</option>
                  </select>
                </FormField>
                <FormField label="Display Order">
                  <Input type="number" {...register("display_order", { valueAsNumber: true })} />
                </FormField>
              </div>
              <FormField label="Short Description">
                <Textarea {...register("description")} rows={2} />
              </FormField>
              <FormField label="Tech Stack">
                <TagInput value={techStack || []} onChange={(tags) => setValue("tech_stack", tags)} />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Live URL"><Input {...register("live_url")} type="url" /></FormField>
                <FormField label="GitHub URL"><Input {...register("github_url")} type="url" /></FormField>
                <FormField label="Primary Image URL"><Input {...register("image_url")} type="url" /></FormField>
              </div>

              {/* Gallery */}
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5" />Project Gallery ( screenshots )</p>
                <div className="flex gap-2 mb-2">
                  <Input placeholder="Screenshot URL..." value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} />
                  <Button type="button" variant="outline" size="sm" onClick={addImage}>Add</Button>
                </div>
                {additionalImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 bg-muted/20 p-2 rounded border max-h-40 overflow-y-auto">
                    {additionalImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-video rounded border overflow-hidden group">
                        <img src={img} alt="" className="object-cover w-full h-full" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-destructive/80 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SEO settings */}
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />SEO Metadata</p>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="SEO Title" className="col-span-2"><Input {...register("seo_title")} /></FormField>
                  <FormField label="SEO Keywords" className="col-span-2"><Input {...register("seo_keywords")} /></FormField>
                  <FormField label="SEO Description" className="col-span-2"><Textarea {...register("seo_description")} rows={2} /></FormField>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={isFeatured} onCheckedChange={(val) => setValue("is_featured", val)} />
                <span className="text-sm">Featured project</span>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={saving}>{editingId ? "Update" : "Create"}</Button>
                <Dialog.Close asChild><Button type="button" variant="outline">Cancel</Button></Dialog.Close>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* GitHub Sync Dialog */}
      <Dialog.Root open={githubDialogOpen} onOpenChange={setGithubDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <Dialog.Title className="text-base font-semibold flex items-center gap-2">
                <Github className="h-5 w-5" />Import from GitHub
              </Dialog.Title>
              <Dialog.Close asChild><Button variant="ghost" size="icon" className="h-7 w-7"><X className="h-4 w-4" /></Button></Dialog.Close>
            </div>
            
            <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
              <div className="flex gap-2 shrink-0">
                <Input
                  placeholder="Enter GitHub Username..."
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchGitHubRepos()}
                />
                <Button type="button" onClick={fetchGitHubRepos} loading={fetchingRepos}>Fetch Repos</Button>
              </div>

              <div className="flex-1 overflow-y-auto border rounded-md divide-y">
                {githubRepos.map((repo) => (
                  <div key={repo.id} className="p-3 flex items-center justify-between hover:bg-muted/40 transition-colors">
                    <div className="space-y-1 max-w-[70%]">
                      <p className="font-medium text-sm truncate">{repo.name}</p>
                      {repo.description && <p className="text-xs text-muted-foreground line-clamp-1">{repo.description}</p>}
                      {repo.language && <Badge variant="secondary" className="text-[10px]">{repo.language}</Badge>}
                    </div>
                    <Button size="sm" onClick={() => importRepo(repo)}>Import</Button>
                  </div>
                ))}
                {githubRepos.length === 0 && !fetchingRepos && (
                  <p className="text-xs text-muted-foreground text-center py-12">Enter username above to fetch repositories.</p>
                )}
                {fetchingRepos && (
                  <p className="text-xs text-muted-foreground text-center py-12">Fetching repositories...</p>
                )}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDelete open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleting} description="This will permanently delete the project." />
    </div>
  );
}
