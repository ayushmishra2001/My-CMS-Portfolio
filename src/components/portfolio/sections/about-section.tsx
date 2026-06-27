// ─── About Section ───────────────────────────────────────────────
import { Section } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import Image from "next/image";
import { FileDown, FileText } from "lucide-react";

interface Props { section: Section; settings: Record<string, unknown>; }

export function AboutSection({ section, settings }: Props) {
  const content = section.content as Record<string, unknown>;
  const showPhoto = !!content.show_photo && !!settings.avatar_url && settings.is_avatar_visible !== false;
  const showResume = !!content.show_resume_button;
  const resumeUrl = settings.resume_url as string | null | undefined;

  return (
    <SectionWrapper section={section}>
      <SectionHeading title={section.label} subtitle={section.subtitle} />
      <div className="grid md:grid-cols-3 gap-12 items-start">
        {showPhoto && (
          <div className="md:col-span-1">
            <div className="relative aspect-square rounded-xl overflow-hidden border border-border">
              <Image src={settings.avatar_url as string} alt="Profile" fill className="object-cover" />
            </div>
          </div>
        )}
        <div className={showPhoto ? "md:col-span-2" : "md:col-span-3"}>
          <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-line">
            {settings.bio as string}
          </p>
          {showResume && (
            <div className="flex flex-wrap gap-4 mt-6">
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
                >
                  <FileDown className="h-4 w-4" />
                  Download ATS Resume
                </a>
              )}
              <a
                href="/resume"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
              >
                <FileText className="h-4 w-4" />
                Download Digital Resume
              </a>
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
