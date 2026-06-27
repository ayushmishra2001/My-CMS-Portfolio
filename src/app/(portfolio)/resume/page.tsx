import { createClient } from "@/lib/supabase/server";
import { ResumeTemplate } from "@/components/portfolio/shared/print-resume";
import { Metadata } from "next";

export const revalidate = 60; // Revalidate every 60 seconds

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("full_name, tagline")
    .single();

  return {
    title: settings ? `${settings.full_name} — Resume` : "Resume",
    description: settings ? `Resume of ${settings.full_name}, ${settings.tagline}` : "Professional Resume",
  };
}

export default async function ResumePage() {
  const supabase = await createClient();

  const [
    { data: settingsData },
    { data: experiencesData },
    { data: educationsData },
    { data: skillsData },
    { data: certificationsData },
    { data: projectsData },
  ] = await Promise.all([
    supabase.from("site_settings").select("*").single(),
    supabase.from("experience").select("*").eq("is_visible", true).order("display_order").order("start_date", { ascending: false }),
    supabase.from("education").select("*").eq("is_visible", true).order("display_order").order("start_date", { ascending: false }),
    supabase.from("skills").select("*").eq("is_visible", true).order("display_order"),
    supabase.from("certifications").select("*").eq("is_visible", true).order("display_order").order("issue_date", { ascending: false }),
    supabase.from("projects").select("*").eq("is_visible", true).order("display_order").order("created_at", { ascending: false }),
  ]);

  return (
    <ResumeTemplate
      settings={settingsData}
      experiences={experiencesData || []}
      educations={educationsData || []}
      skills={skillsData || []}
      certifications={certificationsData || []}
      projects={projectsData || []}
    />
  );
}
