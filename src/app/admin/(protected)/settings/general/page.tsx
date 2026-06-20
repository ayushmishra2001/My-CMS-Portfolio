"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/layout/header";
import { Button } from "@/components/shared/button";
import { Input, Textarea, FormField, Card, CardContent, CardHeader, CardTitle, Switch } from "@/components/shared/form-elements";
import { SiteSettings } from "@/lib/types";
import toast from "react-hot-toast";

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const supabase = createClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SiteSettings>();
  const availableForWork = watch("available_for_work");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("site_settings").select("*").single();
      if (data) {
        setSettingsId(data.id);
        reset(data);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const onSubmit = async (data: SiteSettings) => {
    if (!settingsId) return;
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({
        full_name: data.full_name,
        display_name: data.display_name,
        tagline: data.tagline,
        bio: data.bio,
        email: data.email,
        phone: data.phone,
        location: data.location,
        available_for_work: data.available_for_work,
        avatar_url: data.avatar_url,
        resume_url: data.resume_url,
        social_links: data.social_links,
        seo_meta: data.seo_meta,
      })
      .eq("id", settingsId);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Settings saved");
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 overflow-auto">
        <AdminHeader title="General Settings" />
        <div className="p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg border bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <AdminHeader
        title="General Settings"
        description="Site-wide settings for your portfolio"
        actions={<Button size="sm" loading={saving} onClick={handleSubmit(onSubmit)}>Save Changes</Button>}
      />
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">

          {/* Identity */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Identity</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Full Name" required error={errors.full_name?.message}>
                  <Input {...register("full_name", { required: "Required" })} placeholder="Ayush Kumar" />
                </FormField>
                <FormField label="Display Name" hint="Shown on portfolio, can be a nickname">
                  <Input {...register("display_name")} placeholder="Ayush" />
                </FormField>
              </div>
              <FormField label="Tagline" required hint="One-line description shown under your name">
                <Input {...register("tagline", { required: "Required" })} placeholder="Full-Stack Developer · Java · Spring Boot · Angular" />
              </FormField>
              <FormField label="Bio" hint="2–4 sentences about yourself">
                <Textarea {...register("bio")} rows={4} placeholder="I am a full-stack developer..." />
              </FormField>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Contact & Location</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Email">
                  <Input {...register("email")} type="email" placeholder="you@example.com" />
                </FormField>
                <FormField label="Phone">
                  <Input {...register("phone")} placeholder="+91 98765 43210" />
                </FormField>
                <FormField label="Location">
                  <Input {...register("location")} placeholder="Patna, Bihar, India" />
                </FormField>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={availableForWork ?? true}
                  onCheckedChange={(val) => setValue("available_for_work", val)}
                />
                <div>
                  <p className="text-sm font-medium">Available for work</p>
                  <p className="text-xs text-muted-foreground">Shows a green indicator on your portfolio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Files */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Files</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Avatar URL" hint="Upload to Supabase Storage and paste the public URL here">
                <Input {...register("avatar_url")} type="url" placeholder="https://your-project.supabase.co/storage/v1/object/public/portfolio-assets/avatar.jpg" />
              </FormField>
              <FormField label="Resume URL" hint="Upload your PDF resume and paste the public URL">
                <Input {...register("resume_url")} type="url" placeholder="https://your-project.supabase.co/storage/v1/object/public/portfolio-assets/resume.pdf" />
              </FormField>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Social Links</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "github", label: "GitHub", placeholder: "https://github.com/username" },
                  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
                  { key: "twitter", label: "Twitter / X", placeholder: "https://twitter.com/username" },
                  { key: "website", label: "Website", placeholder: "https://yourwebsite.com" },
                  { key: "devto", label: "Dev.to", placeholder: "https://dev.to/username" },
                  { key: "hashnode", label: "Hashnode", placeholder: "https://hashnode.com/@username" },
                ].map(({ key, label, placeholder }) => (
                  <FormField key={key} label={label}>
                    <Input
                      {...register(`social_links.${key}` as keyof SiteSettings)}
                      type="url"
                      placeholder={placeholder}
                    />
                  </FormField>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader><CardTitle className="text-sm">SEO</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Meta Title" hint="Shown in browser tab and search results">
                <Input {...register("seo_meta.title")} placeholder="Ayush Kumar — Full-Stack Developer" />
              </FormField>
              <FormField label="Meta Description" hint="150–160 characters for best SEO">
                <Textarea {...register("seo_meta.description")} rows={2} placeholder="Full-stack developer specializing in Java, Spring Boot and Angular..." />
              </FormField>
              <FormField label="Keywords" hint="Comma-separated keywords">
                <Input {...register("seo_meta.keywords")} placeholder="full-stack developer, java, spring boot, angular, portfolio" />
              </FormField>
              <FormField label="OG Image URL" hint="1200x630px image for social sharing previews">
                <Input {...register("seo_meta.og_image")} type="url" placeholder="https://..." />
              </FormField>
            </CardContent>
          </Card>

          <Button type="submit" loading={saving}>Save All Changes</Button>
        </form>
      </div>
    </div>
  );
}
