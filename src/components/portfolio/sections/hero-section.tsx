import { Section } from "@/lib/types";
import { SectionWrapper } from "../shared/section-wrapper";
import Image from "next/image";

interface Props { section: Section; settings: Record<string, unknown>; }

export function HeroSection({ section, settings }: Props) {
  const content = (section.content as Record<string, any>) ?? {};
  const available = settings.available_for_work as boolean;
  const resumeUrl = settings.resume_url as string | null | undefined;

  const hasPrimaryBtn = !!content.cta_primary_text;
  const hasSecondaryBtn = !!content.cta_secondary_text;
  const seoMeta = (settings.seo_meta as Record<string, string>) || {};
  const designation = seoMeta.designation;
  const tagline = settings.tagline as string;

  return (
    <SectionWrapper section={section} className="flex flex-col justify-center min-h-[calc(100vh-60px)] py-16 md:py-24 animate-fade-in relative col-span-1 lg:col-span-12">
      <div className="flex flex-col space-y-4 max-w-[1000px]">
        
        {/* Kicker (Whisper Eyebrow) */}
        {content.subheading && (
          <div className="font-sans font-light text-[19px] uppercase tracking-whisper text-foreground mb-4">
            {content.subheading as string}
          </div>
        )}

        {/* Hero Name (Massive Manuka) */}
        <h1 
          className="font-manuka font-black text-[13vw] sm:text-[90px] md:text-[107px] uppercase tracking-hero text-foreground leading-[0.8]"
        >
          {settings.display_name as string || settings.full_name as string || "Your Name"}
        </h1>

        {/* Tagline & Designation */}
        <div className="flex flex-col gap-1 md:gap-2 mt-4 md:mt-6">
          {designation && (
            <div className="font-sans font-bold text-[18px] md:text-[24px] text-verge-mint uppercase tracking-wider">
              {designation}
            </div>
          )}
          {tagline && (
            <div className="font-mono text-[14px] md:text-[16px] text-foreground/80 uppercase tracking-mono-wide">
              {tagline}
            </div>
          )}
        </div>

        {/* Headline */}
        {content.headline && (
          <p className="font-sans font-bold text-[24px] md:text-[34px] leading-[1.0] text-foreground mt-8 max-w-[800px]">
            {content.headline as string}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6">
          {hasPrimaryBtn && (
            <a
              href={content.cta_primary_url as string || "#projects"}
              className="bg-verge-mint text-black font-sans text-[16px] font-bold px-[24px] py-[10px] rounded-feature text-center transition-all hover:bg-white/20 hover:text-black hover:shadow-[0_0_0_1px_#c2c2c2] uppercase"
            >
              {content.cta_primary_text as string}
            </a>
          )}
          {hasSecondaryBtn && (
            <a
              href={resumeUrl || (content.cta_secondary_url as string) || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-verge-slate text-[#e9e9e9] font-sans text-[16px] font-normal px-[24px] py-[10px] rounded-feature text-center transition-all hover:bg-white/20 hover:text-black hover:shadow-[0_0_0_1px_#c2c2c2] uppercase"
            >
              {content.cta_secondary_text as string}
            </a>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
