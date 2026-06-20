import { createClient } from "@/lib/supabase/server";
import { PortfolioNav } from "@/components/portfolio/shared/nav";
import { PortfolioFooter } from "@/components/portfolio/shared/footer";
import { AnalyticsTracker } from "@/components/portfolio/shared/tracker";
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

  const theme = settings?.theme || "classic";
  const themeStyles = getThemeStyles(theme);

  return (
    <div className={`min-h-screen bg-background theme-${theme}`}>
      {themeStyles && <style dangerouslySetInnerHTML={{ __html: themeStyles }} />}
      <AnalyticsTracker />
      <PortfolioNav
        name={settings?.display_name || settings?.full_name || "Portfolio"}
        sections={sections ?? []}
      />
      <main>{children}</main>
      <PortfolioFooter name={settings?.full_name || "Portfolio"} />
    </div>
  );
}

function getThemeStyles(theme: string) {
  switch (theme) {
    case "cyberpunk":
      return `
        :root, .dark {
          --background: 260 50% 3%;
          --foreground: 180 100% 90%;
          --card: 262 80% 5%;
          --card-foreground: 180 100% 90%;
          --popover: 262 80% 5%;
          --popover-foreground: 180 100% 90%;
          --primary: 320 100% 55%;
          --primary-foreground: 0 0% 100%;
          --secondary: 262 80% 8%;
          --secondary-foreground: 180 100% 90%;
          --muted: 262 30% 15%;
          --muted-foreground: 262 10% 60%;
          --accent: 180 100% 50%;
          --accent-foreground: 260 50% 3%;
          --border: 262 50% 18%;
          --input: 262 50% 18%;
          --ring: 320 100% 55%;
        }
        html, body {
          background-image: linear-gradient(rgba(180, 255, 255, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(180, 255, 255, 0.015) 1px, transparent 1px) !important;
          background-size: 40px 40px !important;
          background-color: hsl(260 50% 3%) !important;
        }
        .border, .rounded-xl, .rounded-lg {
          box-shadow: 0 0 10px rgba(255, 0, 128, 0.04);
        }
      `;
    case "paper":
      return `
        :root, .dark {
          --background: 36 33% 97%;
          --foreground: 0 0% 12%;
          --card: 36 40% 99%;
          --card-foreground: 0 0% 12%;
          --popover: 36 40% 99%;
          --popover-foreground: 0 0% 12%;
          --primary: 0 0% 10%;
          --primary-foreground: 36 33% 97%;
          --secondary: 0 0% 90%;
          --secondary-foreground: 0 0% 10%;
          --muted: 0 0% 92%;
          --muted-foreground: 30 5% 45%;
          --accent: 0 0% 20%;
          --accent-foreground: 36 33% 97%;
          --border: 0 0% 75%;
          --input: 0 0% 75%;
          --ring: 0 0% 10%;
        }
        * {
          border-radius: 0px !important;
        }
        html, body {
          background-image: radial-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 0) !important;
          background-size: 24px 24px !important;
          background-color: hsl(36 33% 97%) !important;
        }
      `;
    case "glassmorphism":
      return `
        :root, .dark {
          --background: 222 47% 6%;
          --foreground: 210 40% 98%;
          --card: 222 47% 10%;
          --card-foreground: 210 40% 98%;
          --popover: 222 47% 10%;
          --popover-foreground: 210 40% 98%;
          --primary: 185 90% 55%;
          --primary-foreground: 222 47% 6%;
          --secondary: 222 47% 12%;
          --secondary-foreground: 210 40% 98%;
          --muted: 222 30% 15%;
          --muted-foreground: 215 20% 65%;
          --accent: 185 90% 55%;
          --accent-foreground: 210 40% 98%;
          --border: 222 30% 18%;
          --input: 222 30% 18%;
          --ring: 185 90% 55%;
        }
        html, body {
          background-image: 
            radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 55%), 
            radial-gradient(at 50% 0%, hsla(225,39%,30%,0.25) 0, transparent 55%), 
            radial-gradient(at 100% 0%, hsla(185,90%55%,0.08) 0, transparent 55%) !important;
          background-attachment: fixed !important;
          background-color: hsl(222 47% 6%) !important;
        }
        .rounded-xl, .rounded-lg, .border {
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          background-color: rgba(255, 255, 255, 0.015) !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
        }
      `;
    default:
      return "";
  }
}
