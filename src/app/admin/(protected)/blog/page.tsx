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
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Pencil, Trash2, X, FileText, Globe } from "lucide-react";
import { BlogPost, BlogPostFormData } from "@/lib/types";
import toast from "react-hot-toast";

const defaultForm: BlogPostFormData = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  cover_image: "",
  is_published: false,
  published_at: null,
};

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("view");

  const supabase = createClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<BlogPostFormData>({
    defaultValues: defaultForm,
  });

  const isPublished = watch("is_published");
  const postTitle = watch("title");

  // Auto-generate slug from title
  useEffect(() => {
    if (postTitle && !editingId) {
      const generatedSlug = postTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      setValue("slug", generatedSlug);
    }
  }, [postTitle, editingId, setValue]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    setPosts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const openCreate = () => {
    setEditingId(null);
    reset(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingId(post.id);
    reset({ ...post });
    setDialogOpen(true);
  };

  const onSubmit = async (data: BlogPostFormData) => {
    setSaving(true);
    const payload = {
      ...data,
      slug: data.slug || data.title.toLowerCase().replace(/\s+/g, "-"),
      published_at: data.is_published && !data.published_at ? new Date().toISOString() : data.published_at,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("posts").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("posts").insert(payload));
    }

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "Post updated" : "Post created");
    setDialogOpen(false);
    fetchPosts();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("posts").delete().eq("id", deleteId);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Post deleted");
    setDeleteId(null);
    fetchPosts();
  };

  const togglePublish = async (post: BlogPost) => {
    const nextPublished = !post.is_published;
    await supabase.from("posts").update({
      is_published: nextPublished,
      published_at: nextPublished ? new Date().toISOString() : null,
    }).eq("id", post.id);
    fetchPosts();
  };

  const columns: Column<BlogPost>[] = [
    {
      key: "title", header: "Title", sortable: true,
      cell: (row) => (
        <div>
          <p className="font-medium">{row.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{row.excerpt || "No summary provided."}</p>
        </div>
      ),
    },
    {
      key: "slug", header: "Slug",
      cell: (row) => <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{row.slug}</span>,
    },
    {
      key: "is_published", header: "Status", sortable: true,
      cell: (row) => (
        <Badge variant={row.is_published ? "success" : "secondary"}>
          {row.is_published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "published_at", header: "Published Date", sortable: true,
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.published_at
            ? new Date(row.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            : "—"}
        </span>
      ),
    },
    {
      key: "toggle", header: "Publish",
      cell: (row) => (
        <Switch checked={row.is_published} onCheckedChange={() => togglePublish(row)} />
      ),
    },
    {
      key: "actions", header: "",
      cell: (row) => (
        <div className="flex items-center gap-1 justify-end">
          {row.is_published && (
            <a href={`/blog/${row.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Globe className="h-3.5 w-3.5" />
              </Button>
            </a>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(row)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(row.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <AdminHeader
        title="Blog Posts"
        description="Write and publish articles on your portfolio website"
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />Write Post
          </Button>
        }
      />

      <div className="p-6">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List className="flex border-b border-border mb-6">
            {["view", "add"].map((tab) => (
              <Tabs.Trigger
                key={tab}
                value={tab}
                className="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors data-[state=active]:border-primary data-[state=active]:text-primary border-transparent text-muted-foreground hover:text-foreground capitalize"
              >
                {tab === "add" ? (editingId ? "Edit Post" : "Write Post") : "All Posts"}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="view">
            <DataTable
              data={posts}
              columns={columns}
              searchKeys={["title", "content", "excerpt"]}
              loading={loading}
              emptyMessage="No articles written yet. Write your first post!"
            />
          </Tabs.Content>

          <Tabs.Content value="add">
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-3xl">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Title" required error={errors.title?.message} className="col-span-2">
                      <Input {...register("title", { required: "Title is required" })} placeholder="My Technical Journey..." />
                    </FormField>
                    <FormField label="Slug" required error={errors.slug?.message}>
                      <Input {...register("slug", { required: "Slug is required" })} placeholder="my-technical-journey" />
                    </FormField>
                    <FormField label="Cover Image URL">
                      <Input {...register("cover_image")} type="url" placeholder="https://..." />
                    </FormField>
                  </div>

                  <FormField label="Short Summary/Excerpt">
                    <Textarea {...register("excerpt")} placeholder="A brief one-sentence summary for previews" rows={2} />
                  </FormField>

                  <FormField label="Content (Supports Markdown)" required error={errors.content?.message}>
                    <Textarea {...register("content", { required: "Content is required" })} placeholder="Write your post content here in Markdown format..." rows={12} className="font-mono text-sm" />
                  </FormField>

                  <div className="flex items-center gap-3">
                    <Switch checked={isPublished} onCheckedChange={(val) => setValue("is_published", val)} />
                    <span className="text-sm">Publish immediately (visible to public)</span>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" loading={saving}>
                      {editingId ? "Update Post" : "Create Post"}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="outline" onClick={() => { setEditingId(null); reset(defaultForm); }}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </Tabs.Content>
        </Tabs.Root>
      </div>

      {/* Quick Edit Dialog */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />{editingId ? "Edit Blog Post" : "Write Blog Post"}
              </Dialog.Title>
              <Dialog.Close asChild><Button variant="ghost" size="icon" className="h-7 w-7"><X className="h-4 w-4" /></Button></Dialog.Close>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField label="Title" required error={errors.title?.message}>
                <Input {...register("title", { required: "Title is required" })} />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Slug" required error={errors.slug?.message}>
                  <Input {...register("slug", { required: "Slug is required" })} />
                </FormField>
                <FormField label="Cover Image URL">
                  <Input {...register("cover_image")} type="url" />
                </FormField>
              </div>
              <FormField label="Excerpt">
                <Textarea {...register("excerpt")} rows={2} />
              </FormField>
              <FormField label="Content (Markdown)" required error={errors.content?.message}>
                <Textarea {...register("content", { required: "Content is required" })} rows={10} className="font-mono text-xs" />
              </FormField>
              <div className="flex items-center gap-3">
                <Switch checked={isPublished} onCheckedChange={(val) => setValue("is_published", val)} />
                <span className="text-sm">Published</span>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={saving}>{editingId ? "Update" : "Create"}</Button>
                <Dialog.Close asChild><Button type="button" variant="outline">Cancel</Button></Dialog.Close>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDelete open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleting} description="This will permanently delete the article." />
    </div>
  );
}
