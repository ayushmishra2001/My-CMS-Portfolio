import { createClient } from "@/lib/supabase/server";
import { SectionRenderer } from "@/components/portfolio/section-renderer";
import { Section, SiteSettings } from "@/lib/types";

export const revalidate = 60; // ISR: rebuild every 60 seconds

export default async function PortfolioPage() {
  const supabase = await createClient();

  const [{ data: sectionsData }, { data: settingsData }] = await Promise.all([
    supabase
      .from("sections")
      .select("*")
      .eq("is_visible", true)
      .order("display_order"),
    supabase
      .from("site_settings")
      .select("*")
      .single(),
  ]);

  const sections = (sectionsData ?? []) as Section[];
  const settings = (settingsData ?? {}) as unknown as Record<string, unknown>;

  if (sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold">Portfolio is being set up</p>
          <p className="text-muted-foreground">
            Sign in to the{" "}
            <a href="/admin/dashboard" className="text-primary underline">admin panel</a>{" "}
            to add content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} settings={settings} />
      ))}
    </>
  );
}
