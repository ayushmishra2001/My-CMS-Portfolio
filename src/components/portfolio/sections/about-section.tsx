"use client";
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
      
      <div className="flex flex-col lg:flex-row gap-6 md:gap-12 mt-8">
        
        {/* Photo Column */}
        {showPhoto && (
          <div className="w-full lg:w-[350px] shrink-0">
            <div className="relative w-full aspect-[5/6] rounded-pill overflow-hidden border border-border bg-muted group">
              <Image
                src={avatarUrl as string}
                alt="Profile Photo"
                fill
                className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                sizes="(max-w-768px) 100vw, 400px"
                priority
              />
            </div>
          </div>
        )}

        {/* Bio Column */}
        <div className="flex-1 flex flex-col">
          <div className="prose prose-invert max-w-none">
            {leadParagraph && (
              <p className="font-sans text-[22px] md:text-[28px] font-bold leading-snug text-foreground mb-8">
                {leadParagraph}
              </p>
            )}
            
            {otherParagraphs.length > 0 && (
              <div className="space-y-6 font-sans text-[16px] md:text-[18px] font-medium leading-relaxed text-foreground/80">
                {otherParagraphs.map((p, i) => (
                  <p key={i} className="whitespace-pre-line">{p}</p>
                ))}
              </div>
            )}
          </div>

          {showResume && (
            <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-border/20">
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-verge-mint text-black font-sans text-[16px] font-bold px-[24px] py-[10px] rounded-feature text-center transition-all hover:bg-white/20 hover:text-black hover:shadow-[0_0_0_1px_#c2c2c2] uppercase flex items-center gap-2"
                >
                  <FileDown className="h-5 w-5" />
                  ATS RESUME
                </a>
              )}
              <a
                href="/resume"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-verge-slate text-[#e9e9e9] font-sans text-[16px] font-normal px-[24px] py-[10px] rounded-feature text-center transition-all hover:bg-white/20 hover:text-black hover:shadow-[0_0_0_1px_#c2c2c2] uppercase flex items-center gap-2"
              >
                <FileText className="h-5 w-5" />
                DIGITAL RESUME
              </a>
            </div>
          )}
        </div>

      </div>
    </SectionWrapper>
  );
}
