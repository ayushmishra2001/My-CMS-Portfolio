import { Section } from "@/lib/types";
import { SectionWrapper } from "../shared/section-wrapper";
import Link from "next/link";
import Image from "next/image";
import { Github, Linkedin, Twitter, Globe, ArrowDown, FileDown, FileText } from "lucide-react";

interface Props { section: Section; settings: Record<string, unknown>; }

export function HeroSection({ section, settings }: Props) {
  const content = section.content as Record<string, unknown>;
  const social = (settings.social_links as Record<string, string>) ?? {};
  const available = settings.available_for_work as boolean;

  const SOCIAL_ICONS = [
    { key: "github", icon: Github, label: "GitHub" },
    { key: "linkedin", icon: Linkedin, label: "LinkedIn" },
    { key: "twitter", icon: Twitter, label: "Twitter" },
    { key: "website", icon: Globe, label: "Website" },
  ];

  const hasHeadline = !!content.headline;
  const hasSubheading = !!content.subheading;
  const hasCtaPrimary = !!content.cta_primary_text;
  const showSocialLinks = !!content.show_social_links;
  const showAvatar = !!content.show_avatar && !!settings.avatar_url;
  const resumeUrl = settings.resume_url as string | null | undefined;

  return (
    <SectionWrapper section={section} className="min-h-screen flex items-center">
      <div className="flex flex-col md:flex-row items-center gap-12 w-full">
        <div className="flex-1 space-y-6">
          {/* Availability badge */}
          {available && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-600 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Available for work
            </div>
          )}

          {/* Name */}
          <div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none">
              {settings.display_name as string || settings.full_name as string || "Your Name"}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mt-3 font-light">
              {settings.tagline as string}
            </p>
          </div>

          {/* Headline from CMS */}
          {hasHeadline && (
            <p className="text-lg text-foreground/80 max-w-xl">
              {content.headline as string}
            </p>
          )}

          {/* Subheading */}
          {hasSubheading && (
            <p className="text-base text-muted-foreground max-w-xl">
              {content.subheading as string}
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 pt-2">
            {hasCtaPrimary && (
              <a
                href={content.cta_primary_url as string || "#projects"}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {content.cta_primary_text as string}
              </a>
            )}
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
              >
                <FileDown className="h-4 w-4" />
                Download ATS Resume
              </a>
            )}
            <a
              href="/resume"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              <FileText className="h-4 w-4" />
              Download Digital Resume
            </a>
          </div>

          {/* Social links */}
          {showSocialLinks && (
            <div className="flex items-center gap-3 pt-2">
              {SOCIAL_ICONS.filter(({ key }) => social[key]).map(({ key, icon: Icon, label }) => (
                <a
                  key={key}
                  href={social[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        {showAvatar && (
          <div className="shrink-0">
            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden border-2 border-border">
              <Image
                src={settings.avatar_url as string}
                alt={settings.full_name as string || "Avatar"}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground">
        <ArrowDown className="h-5 w-5" />
      </div>
    </SectionWrapper>
  );
}
