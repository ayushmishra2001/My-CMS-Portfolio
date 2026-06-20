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
      .order("start_date", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, []);

  return (
    <SectionWrapper section={section}>
      <SectionHeading title={section.label} subtitle={section.subtitle} />
      <div className="grid md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-semibold">{item.degree} in {item.field}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  {item.institution_url ? (
                    <a href={item.institution_url} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1">
                      {item.institution} <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">{item.institution}</span>
                  )}
                </div>
                {item.location && (
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{item.location}
                  </p>
                )}
              </div>
              {item.grade && (
                <span className="text-xs font-medium px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 shrink-0">
                  {item.grade}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDateRange(item.start_date, item.end_date, item.is_current)}
            </p>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
