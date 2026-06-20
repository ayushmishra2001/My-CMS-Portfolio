"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/layout/header";
import { Button } from "@/components/shared/button";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/shared/form-elements";
import { Section, SectionStyleConfig } from "@/lib/types";
import toast from "react-hot-toast";

const FONT_SIZE_OPTIONS = ["sm", "md", "lg"] as const;
const PADDING_OPTIONS = ["sm", "md", "lg"] as const;
const MAX_WIDTH_OPTIONS = ["sm", "md", "lg", "full"] as const;
const ANIMATION_OPTIONS = ["none", "fade", "slide", "zoom"] as const;

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-12 rounded border border-input cursor-pointer bg-transparent p-0.5"
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#ffffff"
          className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
        />
      </div>
    </div>
  );
}

function OptionPicker<T extends string>({
  label, options, value, onChange,
}: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-1 rounded-md text-xs border transition-colors ${
              value === opt
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CustomizerPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Section | "global" | null>("global");
  const [config, setConfig] = useState<SectionStyleConfig>({});
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  // Global theme settings states
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [theme, setTheme] = useState("classic");
  const [savingTheme, setSavingTheme] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const [{ data: sectionsData }, { data: settingsData }] = await Promise.all([
        supabase.from("sections").select("*").order("display_order"),
        supabase.from("site_settings").select("id, theme").single(),
      ]);
      setSections(sectionsData ?? []);
      if (settingsData) {
        setSettingsId(settingsData.id);
        setTheme(settingsData.theme || "classic");
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const selectSection = (section: Section | "global") => {
    setSelected(section);
    if (section !== "global") {
      setConfig(section.style_config ?? {});
    }
  };

  const updateConfig = (key: keyof SectionStyleConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const saveConfig = async () => {
    if (!selected || selected === "global") return;
    setSaving(true);
    const { error } = await supabase
      .from("sections")
      .update({ style_config: config })
      .eq("id", selected.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setSections((prev) =>
      prev.map((s) => s.id === (selected as Section).id ? { ...s, style_config: config } : s)
    );
    setSelected((prev) => prev && prev !== "global" ? { ...prev, style_config: config } : null);
    toast.success("Style saved");
  };

  const saveTheme = async () => {
    if (!settingsId) return;
    setSavingTheme(true);
    const { error } = await supabase
      .from("site_settings")
      .update({ theme })
      .eq("id", settingsId);
    setSavingTheme(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Global theme updated");
  };

  const resetConfig = () => {
    setConfig({});
    toast("Style reset to defaults", { icon: "↺" });
  };

  // Live preview style object
  const previewStyle: React.CSSProperties = {
    backgroundColor: config.background_color || undefined,
    color: config.text_color || undefined,
  };

  const paddingClass = { sm: "p-4", md: "p-8", lg: "p-16" }[config.padding ?? "md"] ?? "p-8";
  const fontClass = { sm: "text-sm", md: "text-base", lg: "text-lg" }[config.font_size ?? "md"] ?? "text-base";

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <AdminHeader
        title="Style Customizer"
        description="Customize the appearance of each portfolio section or choose a global theme preset"
      />
      <div className="flex flex-1 overflow-hidden">

        {/* Section list */}
        <div className="w-56 border-r border-border overflow-y-auto shrink-0">
          <div className="p-3 space-y-1">
            <button
              onClick={() => selectSection("global")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors mb-2 flex items-center gap-1.5 ${
                selected === "global"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "hover:bg-accent text-foreground font-medium"
              }`}
            >
              <span>🎨</span> Global Theme
            </button>
            <div className="h-px bg-border my-2" />
            <p className="text-xs font-medium text-muted-foreground px-2 py-1 uppercase tracking-wider">Sections</p>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-9 rounded-md bg-muted animate-pulse" />
                ))
              : sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => selectSection(section)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selected !== "global" && selected?.id === section.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent text-foreground"
                    }`}
                  >
                    <span className="font-medium">{section.label}</span>
                    <span className={`text-xs ml-1.5 opacity-60`}>{section.type}</span>
                  </button>
                ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selected ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
              Select a section from the left to customize it
            </div>
          ) : selected === "global" ? (
            <div className="max-w-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">Global Theme Preset</h2>
                  <p className="text-xs text-muted-foreground mt-1">Select a site-wide style preset for your portfolio</p>
                </div>
                <Button size="sm" loading={savingTheme} onClick={saveTheme}>Save Theme</Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Theme Selector</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        id: "classic",
                        name: "Classic Mode",
                        desc: "Clean, professional light/dark layout with indigo primary elements.",
                        preview: "bg-background text-foreground border-border",
                      },
                      {
                        id: "cyberpunk",
                        name: "Cyberpunk Neon",
                        desc: "Dark mode with high-contrast electric pink text, cyan details and cyber-grid lines.",
                        preview: "bg-slate-950 text-cyan-400 border-pink-500",
                      },
                      {
                        id: "paper",
                        name: "Minimalist Paper",
                        desc: "Retro typewriter styling on cream book paper background with sharp square edges.",
                        preview: "bg-orange-50 text-neutral-900 border-neutral-400",
                      },
                      {
                        id: "glassmorphism",
                        name: "Glassmorphism",
                        desc: "Ultramodern look with dark translucent frost cards and cyan accents on gradient backdrops.",
                        preview: "bg-cyan-950/20 text-slate-100 border-white/20 backdrop-blur",
                      },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTheme(t.id)}
                        className={`flex flex-col text-left p-4 rounded-lg border-2 transition-all ${
                          theme === t.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="font-semibold text-sm">{t.name}</span>
                        <span className="text-[11px] text-muted-foreground mt-1 leading-normal flex-grow">{t.desc}</span>
                        <div className={`mt-3 h-8 w-full rounded border flex items-center justify-center text-[10px] font-mono ${t.preview}`}>
                          Aa
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Theme Live Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Theme Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`p-6 rounded-lg border text-sm transition-all ${
                    theme === "cyberpunk"
                      ? "bg-slate-950 text-cyan-400 border-pink-500 font-mono"
                      : theme === "paper"
                      ? "bg-orange-50 text-neutral-900 border-neutral-400 rounded-none border-2"
                      : theme === "glassmorphism"
                      ? "bg-cyan-950/20 text-slate-100 border-white/20 backdrop-blur"
                      : "bg-background text-foreground border-border"
                  }`}>
                    <h3 className={`text-lg font-bold mb-2 ${theme === "cyberpunk" ? "text-pink-500" : ""}`}>
                      Portfolio Header
                    </h3>
                    <p className="opacity-85 leading-relaxed text-xs">
                      This is a live representation of how text, cards, and elements look under the current theme selection.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <span className={`px-2 py-1 text-[10px] rounded font-semibold ${
                        theme === "cyberpunk"
                          ? "bg-pink-500/10 text-pink-500 border border-pink-500/30"
                          : theme === "paper"
                          ? "bg-neutral-900 text-white rounded-none"
                          : theme === "glassmorphism"
                          ? "bg-white/10 text-cyan-400 border border-white/10"
                          : "bg-primary/10 text-primary"
                      }`}>
                        Active Preset
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="max-w-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{(selected as Section).label}</h2>
                  <Badge variant="secondary" className="mt-1">{(selected as Section).type}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={resetConfig}>Reset</Button>
                  <Button size="sm" loading={saving} onClick={saveConfig}>Save Style</Button>
                </div>
              </div>

              {/* Colors */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Colors</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <ColorInput
                    label="Background Color"
                    value={config.background_color ?? ""}
                    onChange={(v) => updateConfig("background_color", v)}
                  />
                  <ColorInput
                    label="Text Color"
                    value={config.text_color ?? ""}
                    onChange={(v) => updateConfig("text_color", v)}
                  />
                  <ColorInput
                    label="Accent Color"
                    value={config.accent_color ?? ""}
                    onChange={(v) => updateConfig("accent_color", v)}
                  />
                </CardContent>
              </Card>

              {/* Layout */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Layout</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <OptionPicker
                    label="Font Size"
                    options={FONT_SIZE_OPTIONS}
                    value={(config.font_size ?? "md") as typeof FONT_SIZE_OPTIONS[number]}
                    onChange={(v) => updateConfig("font_size", v)}
                  />
                  <OptionPicker
                    label="Padding"
                    options={PADDING_OPTIONS}
                    value={(config.padding ?? "md") as typeof PADDING_OPTIONS[number]}
                    onChange={(v) => updateConfig("padding", v)}
                  />
                  <OptionPicker
                    label="Max Width"
                    options={MAX_WIDTH_OPTIONS}
                    value={(config.max_width ?? "lg") as typeof MAX_WIDTH_OPTIONS[number]}
                    onChange={(v) => updateConfig("max_width", v)}
                  />
                </CardContent>
              </Card>

              {/* Animation */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Animation</CardTitle></CardHeader>
                <CardContent>
                  <OptionPicker
                    label="Entrance Animation"
                    options={ANIMATION_OPTIONS}
                    value={(config.animation ?? "fade") as typeof ANIMATION_OPTIONS[number]}
                    onChange={(v) => updateConfig("animation", v)}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Animation plays when the section scrolls into view on the public portfolio.
                  </p>
                </CardContent>
              </Card>

              {/* Live Preview */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Preview</CardTitle></CardHeader>
                <CardContent>
                  <div
                    style={previewStyle}
                    className={`rounded-md border border-dashed ${paddingClass} ${fontClass} transition-all`}
                  >
                    <p className="font-bold text-lg mb-1" style={{ color: config.accent_color || "hsl(var(--primary))" }}>
                      {(selected as Section).label}
                    </p>
                    <p className="opacity-80">This is how your section content will appear with these style settings applied.</p>
                    <p className="text-sm opacity-60 mt-2">Accent color, padding, font size and animation are all reflected here.</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: This is a representative preview. The actual section will use your portfolio design components.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
