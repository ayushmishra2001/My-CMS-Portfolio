"use client";
import { useEffect, useState } from "react";
import { Section, Experience } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import { createClient } from "@/lib/supabase/client";
import { formatDateRange } from "@/lib/utils";
import { Terminal, Code } from "lucide-react";

interface Props { section: Section; settings: Record<string, unknown>; }

export function ExperienceSection({ section, settings: _ }: Props) {
  const [items, setItems] = useState<Experience[]>([]);

  useEffect(() => {
    createClient()
      .from("experience")
      .select("*")
      .eq("is_visible", true)
      .order("display_order")
      .then(({ data }) => setItems(data ?? []));
  }, []);

  const getYearString = (dateStr: string | null | undefined) => {
    if (!dateStr) return "XXXX";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "XXXX" : date.getFullYear().toString();
  };

  const splitDescription = (desc: string | null) => {
    if (!desc) return { headline: "", paragraph: "" };
    const chars = [".", "!", "?"];
    let firstIndex = -1;
    for (const char of chars) {
      const idx = desc.indexOf(char);
      if (idx !== -1 && (firstIndex === -1 || idx < firstIndex)) {
        firstIndex = idx;
      }
    }
    if (firstIndex !== -1) {
      return {
        headline: desc.slice(0, firstIndex + 1).trim(),
        paragraph: desc.slice(firstIndex + 1).trim(),
      };
    }
    return { headline: desc, paragraph: "" };
  };

  return (
    <SectionWrapper section={section}>
      <SectionHeading title={section.label} subtitle={section.subtitle} />
      
      {/* StoryStream Container */}
      <div className="relative w-full pl-6 md:pl-16">
        {/* The Vertical Rail */}
        <div className="absolute left-0 md:left-8 top-0 bottom-0 w-[1px] bg-border/40 dashed-rail" />

        <div className="flex flex-col gap-6">
          {items.map((item, index) => {
            const startYear = getYearString(item.start_date);
            const endYear = item.is_current ? "PRES" : getYearString(item.end_date);
            const yearRange = startYear === endYear ? startYear : `${startYear} // ${endYear}`;
            const isHighlight = index === 0;
            const { headline, paragraph } = splitDescription(item.description);
            const durationStr = formatDateRange(item.start_date, item.end_date, item.is_current).toUpperCase();

            return (
              <div key={item.id} className="relative group">
                
                {/* Timeline Square Node */}
                <div className="absolute left-[-24px] md:left-[-32px] top-[32px] w-1.5 h-1.5 -translate-x-1/2 bg-primary z-10" />

                {/* Left Rail Year Range (Desktop) */}
                <div className="hidden md:block absolute left-[-32px] top-[28px] -translate-x-full pr-6 text-right select-none whitespace-nowrap">
                  <span className="font-mono text-[10px] tracking-mono-tight text-foreground/80">
                    {yearRange}
                  </span>
                </div>

                {/* Pill Card */}
                <div className={`
                  w-full rounded-2xl transition-all duration-200 flex flex-col lg:flex-row overflow-hidden
                  ${isHighlight 
                    ? "bg-background/40 backdrop-blur-md border border-primary text-foreground shadow-[0_0_15px_rgba(230,25,25,0.15)]" 
                    : "bg-background border border-border hover:border-primary/50"}
                `}>
                  {/* Left Column */}
                  <div className="w-full lg:w-[35%] flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border/30 p-6 md:p-8">
                    <div>
                      {/* Kicker */}
                      <div className="flex items-center gap-2 font-mono text-xs md:text-sm uppercase tracking-mono-wide text-verge-mint mb-4 font-bold flex-wrap">
                        <Terminal className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                        <span>
                          {item.company} {item.is_current && `// CURRENT`}
                          <span className="md:hidden text-foreground/50 ml-1.5 font-normal">// {yearRange}</span>
                        </span>
                      </div>
                      
                      {/* Role (Huge text, uppercase) */}
                      <h3 className="font-manuka text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-[0.85] tracking-tight text-foreground group-hover:text-primary transition-colors break-words">
                        {item.role}
                      </h3>
                    </div>
                    
                    {/* Divider and Metadata */}
                    <div className="pt-6 mt-6 border-t border-border/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="font-mono text-[9px] uppercase tracking-mono-wide text-muted-foreground/60 mb-1">
                          DURATION
                        </div>
                        <div className="font-mono text-[10px] md:text-[11px] font-bold uppercase tracking-mono-tight text-foreground whitespace-nowrap">
                          {durationStr}
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-[9px] uppercase tracking-mono-wide text-muted-foreground/60 mb-1">
                          LOCATION
                        </div>
                        <div className="font-mono text-[10px] md:text-[11px] font-bold uppercase tracking-mono-tight text-foreground">
                          {item.location || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="w-full lg:w-[65%] p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      {/* Top Horizontal Bar and Icon */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-1 bg-verge-mint mt-2" />
                        <div className="border border-border/40 p-1.5 text-muted-foreground/50 rounded-[4px] bg-background/20">
                          <Code className="h-4 w-4" />
                        </div>
                      </div>

                      {/* Headline / Description Kicker */}
                      {headline && (
                        <h4 className="font-sans text-[16px] md:text-[18px] font-bold leading-tight text-foreground mb-4">
                          {headline}
                        </h4>
                      )}

                      {/* Paragraph / Remaining Description */}
                      {paragraph && (
                        <p className="font-sans text-[13px] md:text-[14px] leading-relaxed text-foreground/80 mb-4">
                          {paragraph}
                        </p>
                      )}

                      {/* Achievements / Deliverables List */}
                      {item.achievements && item.achievements.length > 0 && (
                        <div className="mb-6">
                          <ul className="list-disc pl-5 space-y-2 text-foreground/80 font-sans text-[13px] md:text-[14px] leading-relaxed">
                            {item.achievements.map((achievement, idx) => (
                              <li key={idx} className="marker:text-verge-mint">
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Tech tags */}
                    {item.tech_used && item.tech_used.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border/10">
                        {item.tech_used.map(tech => (
                          <span key={tech} className="font-mono text-[10px] uppercase tracking-mono-wide border border-border/60 bg-accent/5 px-3 py-1 rounded-full text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
