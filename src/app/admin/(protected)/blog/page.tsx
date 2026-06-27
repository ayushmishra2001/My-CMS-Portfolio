"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/layout/header";
import { Button } from "@/components/shared/button";
import { Input, Textarea, FormField, Card, CardContent, CardHeader, CardTitle, Badge, Switch } from "@/components/shared/form-elements";
import { DataTable, Column } from "@/components/admin/ui/data-table";
import { ConfirmDelete } from "@/components/admin/ui/confirm-delete";
import { Pencil, Trash2, X, FileText, Globe } from "lucide-react";
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
  is_visible: true,
};

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const supabase = createClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<BlogPostFormData>({
    defaultValues: defaultForm,
  });

  const isPublished = watch("is_published");
  const isVisible = watch("is_visible");
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

  const openEdit = (post: BlogPost) => {
    setEditingId(post.id);
    reset({ ...post });
    
    // Scroll to top form
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    setEditingId(null);
    reset(defaultForm);
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

  const togglePublished = async (post: BlogPost) => {
    const isNewPublishedState = !post.is_published;
    const { error } = await supabase.from("posts").update({
      is_published: isNewPublishedState,
      published_at: isNewPublishedState ? new Date().toISOString() : post.published_at,
    }).eq("id", post.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(isNewPublishedState ? "Post published" : "Post set as draft");
      fetchPosts();
    }
  };

  const toggleVisible = async (post: BlogPost) => {
    const { error } = await supabase.from("posts").update({ is_visible: !post.is_visible }).eq("id", post.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Post visibility updated");
      fetchPosts();
    }
  };

  const columns: Column<BlogPost>[] = [
    {
      key: "title", header: "Post Details", sortable: true,
      cell: (row) => (
        <div>
          <p className="font-medium">{row.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{row.excerpt || "No excerpt provided"}</p>
        </div>
      ),
    },
    {
      key: "slug", header: "Slug & Cover",
      cell: (row) => (
        <div>
          <p className="text-xs font-mono">{row.slug}</p>
          {row.cover_image && <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-xs">Has Cover Image</p>}
        </div>
      ),
    },
    {
      key: "is_published", header: "Status", sortable: true,
      cell: (row) => row.is_published
        ? <Badge variant="success">Published</Badge>
        : <Badge variant="secondary">Draft</Badge>,
    },
    {
      key: "is_visible", header: "Visible",
      cell: (row) => (
        <Switch checked={row.is_visible} onCheckedChange={() => toggleVisible(row)} />
      ),
    },
    {
      key: "published_at", header: "Published Date",
      cell: (row) => row.published_at
        ? <span className="text-xs text-muted-foreground">{new Date(row.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
        : <span className="text-xs text-muted-foreground font-mono">—</span>,
    },
    {
      key: "actions", header: "",
      cell: (row) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => togglePublished(row)}>
            {row.is_published ? <FileText className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(row)}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(row.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <AdminHeader title="Blog Posts" description="Write and manage articles" />
      
      <div className="p-6 space-y-6">
        {/* Upper Half: Form Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">
              {editingId ? "Edit Blog Post" : "Add New Blog Post"}
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Title" required error={errors.title?.message}>
                  <Input {...register("title", { required: "Title is required" })} placeholder="My First Blog Post" />
                </FormField>
                <FormField label="Slug" required error={errors.slug?.message}>
                  <Input {...register("slug", { required: "Slug is required" })} placeholder="my-first-blog-post" />
                </FormField>
                <FormField label="Cover Image URL">
                  <Input {...register("cover_image")} type="url" placeholder="https://..." />
                </FormField>
                <div className="md:col-span-3">
                  <FormField label="Excerpt" hint="Short summary of the post">
                    <Textarea {...register("excerpt")} rows={2} placeholder="A short introduction..." />
                  </FormField>
                </div>
              </div>
              <FormField label="Content" required error={errors.content?.message} hint="Markdown is supported">
                <Textarea {...register("content", { required: "Content is required" })} rows={7} placeholder="Write your post here..." className="font-mono text-sm" />
              </FormField>
              
              <div className="flex items-center gap-6 py-1">
                <div className="flex items-center gap-3">
                  <Switch checked={isPublished} onCheckedChange={(val) => setValue("is_published", val)} />
                  <span className="text-sm">Published</span>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={isVisible ?? true} onCheckedChange={(val) => setValue("is_visible", val)} />
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
                  {editingId ? "Save Changes" : "Save Post"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Bottom Half: Table Card */}
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">All Blog Posts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable data={posts} columns={columns} searchKeys={["title", "excerpt"]} loading={loading} emptyMessage="No blog posts yet. Add your first post." />
          </CardContent>
        </Card>
      </div>

      <ConfirmDelete open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} loading={deleting} description="This will permanently delete the post." />
    </div>
  );
}
