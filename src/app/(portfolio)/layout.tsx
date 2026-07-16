import { createClient } from "@/lib/supabase/server";
import { PortfolioNav } from "@/components/portfolio/shared/nav";
import { PortfolioFooter } from "@/components/portfolio/shared/footer";
import { AnalyticsTracker } from "@/components/portfolio/shared/tracker";
import { BackToTopButton } from "@/components/portfolio/shared/back-to-top";
import { StickySocial } from "@/components/portfolio/shared/sticky-social";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("seo_meta, full_name").single();
  const seo = data?.seo_meta as Record<string, string> | null;
  return {
    title: seo?.title || data?.full_name || "Portfolio",
    description: seo?.description || "",
    keywords: seo?.keywords || "",
    openGraph: {
      images: seo?.og_image ? [seo.og_image] : [],
    },
  };
}

export default async function PortfolioLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("*").single();
  const { data: sections } = await supabase
    .from("sections")
    .select("type, label")
    .eq("is_visible", true)
    .order("display_order");

  return (
    <div className={`min-h-screen bg-background text-foreground dark font-sans overflow-x-hidden relative`}>
      <AnalyticsTracker />
      <PortfolioNav
        name={settings?.display_name || settings?.full_name || "Portfolio"}
        sections={sections ?? []}
      />
      <main className="max-w-[1300px] mx-auto px-6 md:px-12 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {children}
      </main>
      <PortfolioFooter name={settings?.full_name || "Portfolio"} />
      <BackToTopButton />
      <StickySocial settings={settings ?? {}} />
    </div>
  );
}
