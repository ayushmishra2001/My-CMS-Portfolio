"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/layout/header";
import { Button } from "@/components/shared/button";
import { Badge, Switch, Card, CardContent, Input, Textarea, FormField } from "@/components/shared/form-elements";
import { ConfirmDelete } from "@/components/admin/ui/confirm-delete";
import { GripVertical, ChevronUp, ChevronDown, Eye, EyeOff, History, Pencil } from "lucide-react";
import { Section, SectionType } from "@/lib/types";
import toast from "react-hot-toast";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

const SECTION_TYPE_COLORS: Record<SectionType, string> = {
  hero: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  about: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  projects: "bg-green-500/10 text-green-600 border-green-500/20",
  skills: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  experience: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  education: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  certifications: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  testimonials: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  contact: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  github_stats: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  blog_posts: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  open_source: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  achievements: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  custom: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [historySection, setHistorySection] = useState<Section | null>(null);
  const [history, setHistory] = useState<{ id: string; saved_at: string; content: Record<string, unknown> }[]>([]);
  
  // Section content editor states
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingContent, setEditingContent] = useState<Record<string, any>>({});
  const [savingContent, setSavingContent] = useState(false);
  const [rawJsonText, setRawJsonText] = useState("");

  const supabase = createClient();

  const fetchSections = async () => {
    setLoading(true);
    const { data } = await supabase.from("sections").select("*").order("display_order");
    
    // Auto-seed blog_posts row if it is missing from database
    if (data && !data.some((s) => s.type === "blog_posts")) {
      const nextOrder = data.reduce((max, s) => Math.max(max, s.display_order), -1) + 1;
      const { error } = await supabase.from("sections").insert({
        type: "blog_posts",
        label: "Blog",
        subtitle: "Articles & Insights",
        display_order: nextOrder,
        is_visible: false,
        content: { max_items: 3, show_date: true }
      });
      if (!error) {
        const { data: updatedData } = await supabase.from("sections").select("*").order("display_order");
        setSections(updatedData ?? []);
        setLoading(false);
        return;
      }
    }

    setSections(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchSections(); }, []);

  const toggleVisibility = async (section: Section) => {
    const { error } = await supabase
      .from("sections")
      .update({ is_visible: !section.is_visible })
      .eq("id", section.id);
    if (error) { toast.error(error.message); return; }
    setSections((prev) =>
      prev.map((s) => s.id === section.id ? { ...s, is_visible: !s.is_visible } : s)
    );
  };

  const moveSection = async (index: number, direction: "up" | "down") => {
    const newSections = [...sections];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newSections.length) return;

    [newSections[index], newSections[swapIndex]] = [newSections[swapIndex], newSections[index]];

    // Update display_order for both
    const updates = newSections.map((s, i) => ({ id: s.id, display_order: i + 1 }));
    setSections(newSections.map((s, i) => ({ ...s, display_order: i + 1 })));

    for (const u of updates) {
      await supabase.from("sections").update({ display_order: u.display_order }).eq("id", u.id);
    }
    toast.success("Order updated");
  };

  const openHistory = async (section: Section) => {
    setHistorySection(section);
    const { data } = await supabase
      .from("section_history")
      .select("id, saved_at, content")
      .eq("section_id", section.id)
      .order("saved_at", { ascending: false });
    setHistory(data ?? []);
  };

  const restoreVersion = async (content: Record<string, unknown>) => {
    if (!historySection) return;
    const { error } = await supabase
      .from("sections")
      .update({ content })
      .eq("id", historySection.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Version restored");
    setHistorySection(null);
    fetchSections();
  };

  const openEditContent = (section: Section) => {
    setEditingSection(section);
    setEditingContent(section.content || {});
    setRawJsonText(JSON.stringify(section.content || {}, null, 2));
  };

  const updateField = (key: string, value: any) => {
    setEditingContent((prev) => ({ ...prev, [key]: value }));
  };

  const saveSectionContent = async () => {
    if (!editingSection) return;
    
    let finalContent = editingContent;
    const standardTypes = ["hero", "about", "projects", "skills", "experience", "education", "certifications", "testimonials", "contact", "blog_posts"];
    if (editingSection.type === "custom" || !standardTypes.includes(editingSection.type)) {
      try {
        finalContent = JSON.parse(rawJsonText);
      } catch (err) {
        toast.error("Invalid JSON configuration. Please check your syntax.");
        return;
      }
    }

    setSavingContent(true);
    const { error } = await supabase
      .from("sections")
      .update({ content: finalContent })
      .eq("id", editingSection.id);
    setSavingContent(false);
    
    if (error) { toast.error(error.message); return; }
    toast.success("Section content saved");
    setEditingSection(null);
    fetchSections();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("sections").delete().eq("id", deleteId);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Section deleted");
    setDeleteId(null);
    fetchSections();
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 overflow-auto">
        <AdminHeader title="Sections" description="Manage portfolio sections" />
        <div className="p-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg border bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <AdminHeader
        title="Sections"
        description="Drag to reorder · Toggle visibility · Edit section content"
      />
      <div className="p-6 space-y-2">
        <p className="text-xs text-muted-foreground mb-4">
          Use the arrows to reorder sections as they appear on your portfolio. Toggle the switch to show/hide sections.
        </p>

        {sections.map((section, index) => (
          <Card key={section.id} className={`transition-opacity ${!section.is_visible ? "opacity-50" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Drag handle (visual) */}
                <GripVertical className="h-5 w-5 text-muted-foreground/40 shrink-0 hidden sm:block" />

                {/* Order arrows */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => moveSection(index, "up")}
                    disabled={index === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => moveSection(index, "down")}
                    disabled={index === sections.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Type badge */}
                <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] sm:text-xs font-medium shrink-0 ${SECTION_TYPE_COLORS[section.type]}`}>
                  {section.type}
                </span>

                {/* Label & subtitle */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">{section.label}</p>
                  {section.subtitle && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{section.subtitle}</p>
                  )}
                </div>

                {/* Order number */}
                <span className="text-xs text-muted-foreground font-mono shrink-0 hidden sm:inline">#{section.display_order}</span>

                {/* Visibility toggle */}
                <div className="flex items-center gap-2 shrink-0">
                  {section.is_visible
                    ? <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                  }
                  <Switch
                    checked={section.is_visible}
                    onCheckedChange={() => toggleVisibility(section)}
                  />
                </div>

                 {/* Edit Content */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-primary hover:text-primary/80"
                  title="Edit content"
                  onClick={() => openEditContent(section)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>

                {/* History */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  title="Version history"
                  onClick={() => openHistory(section)}
                >
                  <History className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No sections found. Run the database migration to create default sections.
          </div>
        )}
      </div>

      {/* Version History Dialog */}
      <Dialog.Root open={!!historySection} onOpenChange={(o) => !o && setHistorySection(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg rounded-lg border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Dialog.Title className="text-base font-semibold">Version History</Dialog.Title>
                <p className="text-xs text-muted-foreground">{historySection?.label}</p>
              </div>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7"><X className="h-4 w-4" /></Button>
              </Dialog.Close>
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No version history yet. History is saved when you edit content.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {history.map((h, i) => (
                  <div key={h.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">Version {history.length - i}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(h.saved_at).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => restoreVersion(h.content)}>
                      Restore
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Section Content Edit Dialog */}
      <Dialog.Root open={!!editingSection} onOpenChange={(o) => !o && setEditingSection(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-2xl rounded-lg border bg-card p-6 shadow-lg overflow-y-auto max-h-[85vh]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <div>
                <Dialog.Title className="text-base font-semibold">Edit Section Content</Dialog.Title>
                <p className="text-xs text-muted-foreground">{editingSection?.label} ({editingSection?.type})</p>
              </div>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7"><X className="h-4 w-4" /></Button>
              </Dialog.Close>
            </div>

            <div className="space-y-4 py-2">
              {editingSection?.type === "hero" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Headline">
                      <Input 
                        value={editingContent.headline || ""} 
                        onChange={(e) => updateField("headline", e.target.value)} 
                        placeholder="I build high-performance backend systems" 
                      />
                    </FormField>
                    <FormField label="Subheading">
                      <Input 
                        value={editingContent.subheading || ""} 
                        onChange={(e) => updateField("subheading", e.target.value)} 
                        placeholder="Specializing in Java & Spring Boot" 
                      />
                    </FormField>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="CTA Primary Text">
                      <Input 
                        value={editingContent.cta_primary_text || ""} 
                        onChange={(e) => updateField("cta_primary_text", e.target.value)} 
                        placeholder="View Projects" 
                      />
                    </FormField>
                    <FormField label="CTA Primary URL">
                      <Input 
                        value={editingContent.cta_primary_url || ""} 
                        onChange={(e) => updateField("cta_primary_url", e.target.value)} 
                        placeholder="#projects" 
                      />
                    </FormField>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="CTA Secondary Text">
                      <Input 
                        value={editingContent.cta_secondary_text || ""} 
                        onChange={(e) => updateField("cta_secondary_text", e.target.value)} 
                        placeholder="Download Resume" 
                      />
                    </FormField>
                    <FormField label="CTA Secondary URL">
                      <Input 
                        value={editingContent.cta_secondary_url || ""} 
                        onChange={(e) => updateField("cta_secondary_url", e.target.value)} 
                        placeholder="#contact" 
                      />
                    </FormField>
                  </div>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={editingContent.show_avatar !== false} 
                        onCheckedChange={(val) => updateField("show_avatar", val)} 
                      />
                      <span className="text-xs font-medium">Show Avatar</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={editingContent.show_social_links !== false} 
                        onCheckedChange={(val) => updateField("show_social_links", val)} 
                      />
                      <span className="text-xs font-medium">Show Social Links</span>
                    </div>
                  </div>
                </div>
              )}

              {editingSection?.type === "about" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={editingContent.show_photo !== false} 
                        onCheckedChange={(val) => updateField("show_photo", val)} 
                      />
                      <span className="text-xs font-medium">Show Biography Photo</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={editingContent.show_resume_button !== false} 
                        onCheckedChange={(val) => updateField("show_resume_button", val)} 
                      />
                      <span className="text-xs font-medium">Show Resume Button</span>
                    </div>
                  </div>
                </div>
              )}

              {editingSection?.type === "projects" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Layout Mode">
                      <select 
                        value={editingContent.layout || "grid"} 
                        onChange={(e) => updateField("layout", e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="grid">Grid / Table Mode</option>
                        <option value="list">List / Row Mode</option>
                      </select>
                    </FormField>
                    <FormField label="Maximum Items to Display">
                      <Input 
                        type="number" 
                        value={editingContent.max_items || 6} 
                        onChange={(e) => updateField("max_items", parseInt(e.target.value) || 6)} 
                        placeholder="6" 
                      />
                    </FormField>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Switch 
                      checked={editingContent.show_featured_only === true} 
                      onCheckedChange={(val) => updateField("show_featured_only", val)} 
                    />
                    <span className="text-xs font-medium">Show Featured Projects Only</span>
                  </div>
                </div>
              )}

              {editingSection?.type === "skills" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Display Style">
                      <select 
                        value={editingContent.display_style || "tags"} 
                        onChange={(e) => updateField("display_style", e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="tags">Tags (Periodic Matrix)</option>
                        <option value="progress">Proficiency (LED Indicators)</option>
                      </select>
                    </FormField>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Switch 
                      checked={editingContent.group_by_category !== false} 
                      onCheckedChange={(val) => updateField("group_by_category", val)} 
                    />
                    <span className="text-xs font-medium">Group Skills by Category Ledger</span>
                  </div>
                </div>
              )}

              {["experience", "education", "certifications", "testimonials"].includes(editingSection?.type || "") && (
                <div className="space-y-4">
                  <FormField label="Layout Mode">
                    <select 
                      value={editingContent.layout || "grid"} 
                      onChange={(e) => updateField("layout", e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {editingSection?.type === "experience" && <option value="timeline">Stark Typographic timeline</option>}
                      {editingSection?.type === "education" && <option value="cards">Academic Ledger</option>}
                      {editingSection?.type === "certifications" && <option value="grid">Credential Matrix</option>}
                      {editingSection?.type === "testimonials" && <option value="carousel">Typographic Pull-Quote Ledger</option>}
                    </select>
                  </FormField>
                </div>
              )}

              {editingSection?.type === "contact" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={editingContent.show_form !== false} 
                        onCheckedChange={(val) => updateField("show_form", val)} 
                      />
                      <span className="text-xs font-medium">Show Contact Message Form</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={editingContent.show_email !== false} 
                        onCheckedChange={(val) => updateField("show_email", val)} 
                      />
                      <span className="text-xs font-medium">Show Email Envelope Card</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={editingContent.show_social !== false} 
                        onCheckedChange={(val) => updateField("show_social", val)} 
                      />
                      <span className="text-xs font-medium">Show Social Signals Matrix Grid</span>
                    </div>
                  </div>
                </div>
              )}
              {editingSection?.type === "blog_posts" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Maximum Items to Display">
                      <Input 
                        type="number" 
                        value={editingContent.max_items || 3} 
                        onChange={(e) => updateField("max_items", parseInt(e.target.value) || 3)} 
                        placeholder="3" 
                      />
                    </FormField>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Switch 
                      checked={editingContent.show_date !== false} 
                      onCheckedChange={(val) => updateField("show_date", val)} 
                    />
                    <span className="text-xs font-medium">Show Publication Dates</span>
                  </div>
                </div>
              )}

              {editingSection && (editingSection.type === "custom" || !["hero", "about", "projects", "skills", "experience", "education", "certifications", "testimonials", "contact", "blog_posts"].includes(editingSection.type)) && (
                <div className="space-y-4">
                  <FormField label="Raw JSON Configuration" hint="Valid JSON representing custom settings for this section">
                    <Textarea 
                      rows={8}
                      value={rawJsonText} 
                      onChange={(e) => setRawJsonText(e.target.value)} 
                      className="font-mono text-xs" 
                    />
                  </FormField>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <Dialog.Close asChild>
                <Button variant="outline" size="sm">Cancel</Button>
              </Dialog.Close>
              <Button size="sm" loading={savingContent} onClick={saveSectionContent}>
                Save Changes
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDelete
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        description="This will permanently delete the section and all its history."
      />
    </div>
  );
}
