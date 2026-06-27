"use client";
import { useEffect, useState } from "react";
import { Section, Experience } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import { createClient } from "@/lib/supabase/client";
import { formatDateRange } from "@/lib/utils";
import { MapPin, ExternalLink } from "lucide-react";

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

  return (
    <SectionWrapper section={section}>
      <SectionHeading title={section.label} subtitle={section.subtitle} />
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-0 top-2 bottom-2 w-px bg-border ml-1.5 hidden md:block" />

        <div className="space-y-10">
          {items.map((item) => (
            <div key={item.id} className="md:pl-10 relative">
              {/* Timeline dot */}
              <div className="hidden md:block absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-primary bg-background" />

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-semibold text-base">{item.role}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.company_url ? (
                      <a href={item.company_url} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                        {item.company} <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">{item.company}</span>
                    )}
                    {item.location && (
                      <>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{item.location}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-muted-foreground">
                    {formatDateRange(item.start_date, item.end_date, item.is_current)}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">{item.employment_type}</p>
                </div>
              </div>

              {item.description && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.description}</p>
              )}

              {item.achievements && item.achievements.length > 0 && (
                <ul className="space-y-1 mb-3">
                  {item.achievements.map((a, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary shrink-0 mt-0.5">▸</span>
                      {a}
                    </li>
                  ))}
                </ul>
              )}

              {item.tech_used.length > 0 && (
                <p className="text-xs text-muted-foreground/60 font-mono">
                  {item.tech_used.join(" · ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
