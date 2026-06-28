// ─── About Section ───────────────────────────────────────────────
import { Section } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import Image from "next/image";
import { FileDown, FileText } from "lucide-react";

interface Props { section: Section; settings: Record<string, unknown>; }

export function AboutSection({ section, settings }: Props) {
  const content = section.content as Record<string, unknown>;
  const avatarUrl = (settings.about_avatar_url as string | null) || (settings.avatar_url as string | null);
  const showPhoto = !!content.show_photo && !!avatarUrl && settings.is_about_avatar_visible !== false;
  const showResume = !!content.show_resume_button;
  const resumeUrl = settings.resume_url as string | null | undefined;

  const bioText = (settings.bio as string) || "";
  const paragraphs = bioText.split("\n").filter(Boolean);
  const leadParagraph = paragraphs[0] || "";
  const otherParagraphs = paragraphs.slice(1);

  return (
    <SectionWrapper section={section}>
      <SectionHeading title={section.label} subtitle={section.subtitle} />
      <div className="border border-border bg-background transition-colors duration-300 w-full flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Photo Cell */}
          {showPhoto && (
            <div className="col-span-12 lg:col-span-4 border-b lg:border-b-0 lg:border-r border-border p-6 md:p-8 bg-accent/5 flex flex-col justify-between min-h-[300px]">
              <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest block mb-4">[ IDENT_RECORD // PHOTO ]</span>
              <div className="relative w-full aspect-square border border-border bg-background p-2 group overflow-hidden">
                <Image
                  src={avatarUrl as string}
                  alt="Profile Photo"
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out scale-100 group-hover:scale-105"
                  sizes="(max-w-768px) 100vw, 33vw"
                  priority
                />
              </div>
              <div className="font-mono text-[9px] text-muted-foreground mt-4 self-end">SYS_AVATAR_LOADED</div>
            </div>
          )}

          {/* Bio Content Spread Cell */}
          <div className={showPhoto ? "col-span-12 lg:col-span-8 flex flex-col justify-between" : "col-span-12 flex flex-col justify-between"}>
            <div className="p-6 md:p-10 flex-grow">
              <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mb-4 flex items-center justify-between border-b border-border/40 pb-2">
                <span>[ DOSSIER // BIOGRAPHY_STATEMENT ]</span>
                <span>STATE_STABLE</span>
              </div>
              
              {leadParagraph && (
                <div className="text-xl md:text-2xl font-light text-foreground tracking-tight leading-relaxed mb-6 border-b border-border/30 pb-6">
                  {leadParagraph}
                </div>
              )}

              {otherParagraphs.length > 0 && (
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed font-light">
                  {otherParagraphs.map((p, i) => (
                    <p key={i} className="whitespace-pre-line">{p}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Flat interlocking Resume action cells */}
            {showResume && (
              <div className={`grid ${resumeUrl ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} border-t border-border bg-accent/5`}>
                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-6 text-xs font-mono uppercase text-foreground hover:bg-accent transition-all duration-300 group border-b sm:border-b-0 border-r border-border last:border-r-0 last:border-b-0 sm:last:border-r-0"
                  >
                    <span className="flex items-center gap-2">
                      <FileDown className="h-4 w-4 text-muted-foreground" />
                      ATS Resume Spec
                    </span>
                    <span className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200 text-base">↗</span>
                  </a>
                )}
                <a
                  href="/resume"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-6 text-xs font-mono uppercase text-foreground hover:bg-accent transition-all duration-300 group border-b last:border-b-0 sm:border-b-0"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Digital Resume Spec
                  </span>
                  <span className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200 text-base">↗</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
