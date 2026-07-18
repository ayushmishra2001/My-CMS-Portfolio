"use client";
import { useEffect, useState } from "react";
import { Section, Education } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import { createClient } from "@/lib/supabase/client";
import { GraduationCap } from "lucide-react";

interface Props { section: Section; settings: Record<string, unknown>; }

export function EducationSection({ section, settings: _ }: Props) {
  const [items, setItems] = useState<Education[]>([]);

  useEffect(() => {
    createClient()
      .from("education")
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
      
      <div className="relative w-full pl-6 md:pl-16">
        {/* The Vertical Rail */}
        <div className="absolute left-0 md:left-8 top-0 bottom-0 w-[1px] bg-border/40 dashed-rail" />

        <div className="flex flex-col gap-6">
          {items.map((item, index) => {
            const startYear = getYearString(item.start_date);
            const endYear = item.is_current ? "PRES" : getYearString(item.end_date);
            const yearRange = startYear === endYear ? startYear : `${startYear} // ${endYear}`;
            const isHighlight = index === 0;

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

                {/* Outer Card */}
                <div className={`
                  w-full rounded-2xl p-4 transition-all duration-200 flex flex-col lg:flex-row gap-4
                  ${isHighlight 
                    ? "bg-background/40 backdrop-blur-md border border-primary text-foreground shadow-[0_0_15px_rgba(230,25,25,0.15)]" 
                    : "bg-background border border-border hover:border-primary/50"}
                `}>
                  {/* Left Column (Degree Credential) */}
                  <div className="w-full lg:w-[60%] border border-border/30 bg-background/20 p-6 md:p-8 rounded-xl flex flex-col justify-between min-h-[280px]">
                    <div>
                      {/* Kicker */}
                      <div className="flex items-center gap-1.5 font-mono text-[10px] md:text-[11px] uppercase tracking-mono-wide text-verge-mint mb-6">
                        <GraduationCap className="h-4 w-4" strokeWidth={2} />
                        <span>EDUCATION CREDENTIAL</span>
                      </div>
                      
                      {/* Degree (Huge brutalist text) */}
                      <h3 className="font-manuka text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-[0.85] tracking-tight text-foreground group-hover:text-primary transition-colors mb-6 break-words">
                        {item.degree} {item.field && `IN ${item.field}`}
                      </h3>
                    </div>

                    {/* Tags at bottom */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-border/10">
                      {item.field && (
                        <span className="font-mono text-[10px] uppercase tracking-mono-wide border border-border/60 bg-accent/5 px-3 py-1 rounded-full text-muted-foreground">
                          {item.field}
                        </span>
                      )}
                      {item.location && (
                        <span className="font-mono text-[10px] uppercase tracking-mono-wide border border-border/60 bg-accent/5 px-3 py-1 rounded-full text-muted-foreground">
                          {item.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column (Institution and Metrics) */}
                  <div className="w-full lg:w-[40%] flex flex-col gap-4">
                    {/* Institution Box */}
                    <div className="border border-border/30 bg-background/20 p-6 rounded-xl flex-grow flex flex-col justify-center min-h-[160px]">
                      <div className="font-mono text-[9px] uppercase tracking-mono-wide text-muted-foreground/60 mb-2">
                        INSTITUTION
                      </div>
                      <h4 className="font-sans text-[16px] md:text-[18px] font-bold uppercase leading-tight text-foreground mb-2">
                        {item.institution}
                      </h4>
                      {item.description && (
                        <p className="font-sans text-[12px] leading-relaxed text-muted-foreground/80">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* GPA Box */}
                      <div className="border border-border/30 bg-background/20 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                        <div className="font-mono text-[9px] uppercase tracking-mono-wide text-muted-foreground/60 mb-2">
                          GPA / GRADE
                        </div>
                        <div className="font-manuka text-xl sm:text-2xl font-black uppercase text-verge-mint leading-none tracking-tight">
                          {item.grade || "N/A"}
                        </div>
                      </div>

                      {/* Conferred Box */}
                      <div className="border border-border/30 bg-background/20 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                        <div className="font-mono text-[9px] uppercase tracking-mono-wide text-muted-foreground/60 mb-2">
                          CONFERRED
                        </div>
                        <div className="font-manuka text-xl sm:text-2xl font-black uppercase text-foreground leading-none tracking-tight">
                          {startYear} - {endYear}
                        </div>
                      </div>
                    </div>
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
