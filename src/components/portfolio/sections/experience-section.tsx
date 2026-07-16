"use client";
import { useEffect, useState } from "react";
import { Section, Experience } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import { createClient } from "@/lib/supabase/client";
import { formatDateRange } from "@/lib/utils";

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
            const isHighlight = index === 0;

            return (
              <div key={item.id} className="relative group">
                
                {/* Left Rail Timestamp */}
                <div className="absolute -left-6 md:-left-16 top-[28px] w-6 md:w-16 pr-2 md:pr-4 text-right">
                  <span className="block font-mono text-[10px] md:text-[11px] font-medium uppercase tracking-mono-tight text-muted-foreground bg-background py-1">
                    {startYear}
                  </span>
                </div>

                {/* Pill Card */}
                <div className={`
                  w-full rounded-pill p-6 md:p-8 transition-colors duration-200
                  ${isHighlight 
                    ? "bg-verge-uv/20 border border-verge-uv/50 text-foreground" 
                    : "bg-background border border-border hover:border-verge-link"}
                `}>
                  {/* Kicker */}
                  <div className="font-mono text-[11px] md:text-[12px] uppercase tracking-mono-wide text-verge-mint mb-2">
                    {item.company}
                  </div>

                  {/* Headline */}
                  <h3 className="font-sans text-[20px] md:text-[24px] font-bold leading-tight group-hover:text-verge-link transition-colors">
                    {item.role}
                  </h3>

                  {/* Deck / Body */}
                  {item.description && (
                    <p className="font-sans text-[13px] md:text-[16px] font-medium leading-relaxed mt-4 text-foreground/80 max-w-3xl">
                      {item.description}
                    </p>
                  )}

                  {/* Micro Metadata */}
                  <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
                    <div className="font-mono text-[10px] md:text-[11px] uppercase tracking-mono-wide text-muted-foreground">
                      DURATION: {formatDateRange(item.start_date, item.end_date, item.is_current)}
                    </div>
                    {item.location && (
                      <div className="font-mono text-[10px] md:text-[11px] uppercase tracking-mono-wide text-muted-foreground">
                        LOC: {item.location}
                      </div>
                    )}
                  </div>
                  
                  {/* Tags */}
                  {item.tech_used && item.tech_used.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.tech_used.map(tech => (
                        <span key={tech} className="font-mono text-[11px] uppercase tracking-mono-wide bg-background border border-border/50 px-2 py-1 rounded-[2px] text-muted-foreground">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
