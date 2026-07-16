import { createClient } from "@/lib/supabase/server";
import { PortfolioNav } from "@/components/portfolio/shared/nav";
import { PortfolioFooter } from "@/components/portfolio/shared/footer";
import { AnalyticsTracker } from "@/components/portfolio/shared/tracker";
import { BackToTopButton } from "@/components/portfolio/shared/back-to-top";
import { StickySocial } from "@/components/portfolio/shared/sticky-social";
import Warp from "@/components/ui/warp";
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

  const warpConfig = settings?.seo_meta?.warp_config || {
    colors: ["#0a0a0a", "#19ffa0", "#3d00ff", "#111111"],
    speed: 0.6,
    distortion: 0.8,
    swirl: 1,
    softness: 0.4,
    proportion: 0.6,
    layerOpacity: 0.7,
  };
  
  // Safe extraction to avoid passing layerOpacity down to Warp (which might complain about unknown props)
  const { layerOpacity, ...warpParams } = warpConfig;
  const opacityValue = layerOpacity !== undefined ? Number(layerOpacity) : 0.7;

  return (
    <div className={`min-h-screen text-foreground dark font-sans overflow-x-hidden relative`}>
      <div className="fixed top-0 left-0 w-[100vw] h-[100lvh] z-0 pointer-events-none transition-opacity duration-500" style={{ opacity: opacityValue }}>
        <Warp
          {...warpParams}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <AnalyticsTracker />
      <PortfolioNav
        name={settings?.display_name || settings?.full_name || "Portfolio"}
        sections={sections ?? []}
      />
      <main className="relative z-10 max-w-[1300px] mx-auto px-6 md:px-12 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {children}
      </main>
      <PortfolioFooter name={settings?.full_name || "Portfolio"} />
      <BackToTopButton />
      <StickySocial settings={settings ?? {}} />
    </div>
  );
}
