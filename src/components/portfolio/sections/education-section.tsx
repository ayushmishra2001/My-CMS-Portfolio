"use client";
import { useEffect, useState } from "react";
import { Section, Education } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import { createClient } from "@/lib/supabase/client";
import { formatDateRange } from "@/lib/utils";
import { ExternalLink, MapPin } from "lucide-react";

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
      <div className="border-t border-border bg-background transition-colors duration-300 w-full flex flex-col">
        {items.map((item) => {
          const startYear = getYearString(item.start_date);
          const endYear = item.is_current ? "PRES" : getYearString(item.end_date);

          return (
            <div 
              key={item.id} 
              className="border-b border-border py-8 md:py-12 px-4 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 hover:bg-accent/5 transition-colors duration-300"
            >
              {/* Year/Date Structural Anchor Column */}
              <div className="col-span-1 md:col-span-4 flex flex-col justify-start space-y-2">
                <div className="font-mono text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tighter leading-none uppercase select-none">
                  {startYear} <span className="text-muted-foreground/30">//</span> {endYear}
                </div>
                <div className="space-y-1 font-mono">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    {formatDateRange(item.start_date, item.end_date, item.is_current)}
                  </div>
                  {item.grade && (
                    <div className="text-[9px] text-primary uppercase font-bold tracking-widest">
                      [ GRADE // {item.grade} ]
                    </div>
                  )}
                  <div className="text-[9px] text-muted-foreground/60 uppercase tracking-widest">
                    [ RECORD // EDUCATION ]
                  </div>
                </div>
              </div>

              {/* Degree, Institution & Description Column */}
              <div className="col-span-1 md:col-span-8 flex flex-col justify-between">
                <div>
                  {/* Imposing Degree Title */}
                  <div>
                    <h3 className="text-lg md:text-2xl font-black uppercase tracking-tight text-foreground leading-tight">
                      {item.degree} <span className="text-muted-foreground/40 font-light">IN</span> {item.field}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-2 font-mono text-[11px] uppercase text-muted-foreground">
                      {item.institution_url ? (
                        <a 
                          href={item.institution_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          {item.institution} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="font-semibold text-foreground/80">{item.institution}</span>
                      )}
                      {item.location && (
                        <>
                          <span className="text-muted-foreground/30">•</span>
                          <span className="flex items-center gap-1 text-xs">
                            <MapPin className="h-3 w-3 text-muted-foreground/60" />
                            {item.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-sm text-foreground/80 leading-relaxed font-light mt-4 max-w-2xl">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
