import { Section } from "@/lib/types";
import { SectionWrapper } from "../shared/section-wrapper";
import Image from "next/image";
import { Github, Linkedin, Twitter, Globe, FileDown, FileText, ArrowUpRight } from "lucide-react";

interface Props { section: Section; settings: Record<string, unknown>; }

export function HeroSection({ section, settings }: Props) {
  const content = (section.content as Record<string, any>) ?? {};
  const social = (settings.social_links as Record<string, string>) ?? {};
  const available = settings.available_for_work as boolean;

  const avatarUrl = (settings.hero_avatar_url as string | null) || (settings.avatar_url as string | null);
  const showAvatar = !!content.show_avatar && !!avatarUrl && settings.is_hero_avatar_visible !== false;
  const resumeUrl = settings.resume_url as string | null | undefined;

  // Dynamic layout check for actions
  const hasPrimaryBtn = !!content.cta_primary_text;
  const hasSecondaryBtn = !!content.cta_secondary_text;
  const btnCount = (hasPrimaryBtn ? 1 : 0) + (hasSecondaryBtn ? 1 : 0);
  const actionGridClass = btnCount === 2 ? "grid-cols-2" : "grid-cols-1";

  // Dynamic layout check for socials
  const showLinkedin = !!social.linkedin && content.show_social_links !== false;
  const showGithub = !!social.github && content.show_social_links !== false;
  const socialCount = (showLinkedin ? 1 : 0) + (showGithub ? 1 : 0);
  const socialGridClass = socialCount === 2 ? "grid-cols-2" : "grid-cols-1";

  return (
    <SectionWrapper section={section} className="min-h-screen flex items-center py-12 md:py-20 animate-fade-in">
      <div className="border border-border bg-background w-full flex flex-col transition-colors duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_18.5%]">
          
          {/* Left Column (Identity, Details & Primary Actions) */}
          <div className="flex flex-col justify-between lg:border-r border-border border-b lg:border-b-0">
            
            {/* Compartment A: Identity Header */}
            <div className="flex flex-col justify-center flex-grow min-h-[350px] relative overflow-hidden">
              {/* Cyber Blueprint Grid Background */}
              <div 
                className="absolute inset-0 opacity-[0.035] pointer-events-none" 
                style={{
                  backgroundImage: `
                    linear-gradient(to right, currentColor 1px, transparent 1px),
                    linear-gradient(to bottom, currentColor 1px, transparent 1px)
                  `,
                  backgroundSize: '36px 36px'
                }}
              />
              {/* Text Container */}
              <div className="p-6 md:p-10 space-y-4 relative z-10 pr-[44%] sm:pr-[40%] lg:pr-0 flex-grow flex flex-col justify-center">
                <span className="font-mono text-[9px] tracking-widest text-primary uppercase block">
                  [ 01_PRINCIPAL_IDENTITY ]
                </span>
                <h1 
                  style={{ fontFamily: '"Victory Striker Sans Demo", "Victory Striker", sans-serif' }}
                  className="text-[10vw] sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] text-foreground select-none"
                >
                  {settings.display_name as string || settings.full_name as string || "Your Name"}
                </h1>
                
                {/* Core Statement (Headline) */}
                {content.headline && (
                  <p className="text-sm md:text-base font-light tracking-tight text-foreground/95 leading-relaxed max-w-2xl pt-2">
                    {content.headline as string}
                  </p>
                )}

                {/* Detailed Summary (Subheading) */}
                {content.subheading && (
                  <p className="text-xs sm:text-sm font-light text-muted-foreground/80 leading-relaxed max-w-xl">
                    {content.subheading as string}
                  </p>
                )}
              </div>

              {/* Mobile Avatar (Visible only on mobile/tablet, hidden on lg desktop screens) */}
              {showAvatar && (
                <div className="lg:hidden absolute inset-y-0 right-0 w-[42%] sm:w-[37%] border-l border-border bg-accent/5 overflow-hidden">
                  <Image
                    src={avatarUrl as string}
                    alt={settings.display_name as string || "Avatar"}
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                    sizes="(max-w-1024px) 42vw, 18.5vw"
                    priority
                  />
                  
                  {/* Legibility Gradient */}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                  
                  {/* Specs Overlays on Image (Mobile specific) */}
                  <div className="absolute bottom-6 left-3 z-10 font-mono text-white text-[7.5px] space-y-1 select-none leading-normal">
                    <div>
                      <span className="text-white/60">LOC:</span> {settings.location as string || "GLOBAL"}
                    </div>
                    <div>
                      <span className="text-white/60">COOR:</span> 28.61° N
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Compartment B: Metadata Split Block */}
            <div className="grid grid-cols-2 border-t border-border p-6 md:p-8 gap-6 bg-accent/5">
              <div className="space-y-1.5">
                <span className="font-mono text-[8px] tracking-[0.2em] text-muted-foreground uppercase block">
                  [ CORE COMPETENCY ]
                </span>
                <span className="text-xs uppercase font-bold tracking-tight text-foreground font-mono block">
                  {settings.tagline as string || "DATA ENGINEERING / ARCHITECTURE"}
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="font-mono text-[8px] tracking-[0.2em] text-muted-foreground uppercase block">
                  [ CURRENT FOCUS ]
                </span>
                <span className="text-xs uppercase font-bold tracking-tight text-foreground font-mono block">
                  {available ? "ACTIVE // GLOBAL_DEPLOYMENT" : "SYSTEM // ARCHIVED_STANDBY"}
                </span>
              </div>
            </div>

            {/* Compartment C: Action Grid */}
            {btnCount > 0 && (
              <div className={`grid ${actionGridClass} border-t border-border`}>
                {hasPrimaryBtn && (
                  <a
                    href={content.cta_primary_url as string || "#projects"}
                    className={`flex flex-col justify-between p-6 min-h-[110px] text-left ${hasSecondaryBtn ? "border-r border-border" : ""} bg-primary text-primary-foreground hover:opacity-95 transition-all duration-300 group`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="font-mono text-[8px] tracking-wider text-primary-foreground/75 uppercase">
                        [ VIEW_PORTFOLIO ]
                      </span>
                      <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                    </div>
                    <span className="text-lg md:text-xl font-bold uppercase tracking-tight">
                      {content.cta_primary_text as string}
                    </span>
                  </a>
                )}

                {hasSecondaryBtn && (
                  <a
                    href={resumeUrl || (content.cta_secondary_url as string) || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col justify-between p-6 min-h-[110px] text-left hover:bg-accent transition-all duration-300 group"
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="font-mono text-[8px] tracking-wider text-muted-foreground group-hover:text-foreground/70 uppercase">
                        [ DOWNLOAD_CV ]
                      </span>
                      <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                    </div>
                    <span className="text-lg md:text-xl font-bold uppercase tracking-tight">
                      {content.cta_secondary_text as string}
                    </span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right Column (Avatar & Socials Matrix) */}
          <div className="flex flex-col justify-between">
            {/* Compartment A: Tall Aspect Ratio Avatar Container */}
            {showAvatar ? (
              <div className="hidden lg:block relative w-full overflow-hidden border-b border-border bg-accent/5" style={{ aspectRatio: '8/20' }}>
                <Image
                  src={avatarUrl as string}
                  alt={settings.display_name as string || "Avatar"}
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out scale-100 hover:scale-102"
                  sizes="(max-w-1024px) 35vw, 18.5vw"
                  priority
                />
                
                {/* Legibility Gradient */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                
                {/* Specs Overlays on Image */}
                <div className="absolute bottom-6 left-6 z-10 font-mono text-white text-[10px] space-y-1.5 select-none leading-relaxed">
                  <div>
                    <span className="text-white/60">LOCATION:</span> {settings.location as string || "REMOTE / GLOBAL"}
                  </div>
                  <div>
                    <span className="text-white/60">COORDINATES:</span> 28.6139° N, 77.2090° E
                  </div>
                  <div>
                    <span className="text-white/60">TIMESTAMP:</span> 2026.Q2
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex flex-grow flex-col justify-between p-6 min-h-[350px] border-b border-border bg-accent/5 relative overflow-hidden">
                <span className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">[ SCHEMATIC_GRID ]</span>
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                  <div className="w-full h-full border border-foreground grid grid-cols-6 grid-rows-6">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className="border-[0.5px] border-foreground" />
                    ))}
                  </div>
                </div>
                <div className="font-mono text-[9px] text-muted-foreground mt-8">
                  <div>SYS.CONFIG // STABLE</div>
                  <div>NO_IMAGE_LOADED</div>
                </div>
              </div>
            )}

            {/* Compartment B: Social Channels Row */}
            {socialCount > 0 && (
              <div className={`grid ${socialGridClass} border-b border-border bg-background`}>
                {showLinkedin && (
                  <a
                    href={social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-5 border-r border-border text-[11px] font-mono uppercase text-muted-foreground hover:text-foreground hover:bg-accent/5 transition-all duration-300"
                  >
                    <span>Linkedin</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                  </a>
                )}
                {showGithub && (
                  <a
                    href={social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-5 text-[11px] font-mono uppercase text-muted-foreground hover:text-foreground hover:bg-accent/5 transition-all duration-300"
                  >
                    <span>Github</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                  </a>
                )}
              </div>
            )}

            {/* Compartment C: Status Footer */}
            <div className="p-5 flex items-center justify-between font-mono text-[9px] text-muted-foreground bg-accent/5">
              <span>CONNECTION: ENCRYPTED</span>
              <span>PAGE: 01 // HERO_SPLIT</span>
            </div>
          </div>

        </div>
      </div>
    </SectionWrapper>
  );
}
