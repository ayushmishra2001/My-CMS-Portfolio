"use client";
import { useEffect, useState } from "react";
import { Section, Certification } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { Award } from "lucide-react";

interface Props { section: Section; settings: Record<string, unknown>; }

export function CertificationsSection({ section, settings: _ }: Props) {
  const [items, setItems] = useState<Certification[]>([]);

  useEffect(() => {
    createClient()
      .from("certifications")
      .select("*")
      .eq("is_visible", true)
      .order("display_order")
      .then(({ data }) => setItems(data ?? []));
  }, []);

  return (
    <SectionWrapper section={section}>
      <SectionHeading title={section.label} subtitle={section.subtitle} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="flex flex-col rounded-pill p-6 md:p-8 bg-background border border-border hover:border-verge-link transition-colors duration-200 group"
          >
            {/* Header */}
            <div className="flex gap-4 items-start mb-6">
              {item.image_url ? (
                <div className="relative w-12 h-12 shrink-0 rounded-feature overflow-hidden bg-white/5 border border-border">
                  <Image 
                    src={item.image_url} 
                    alt={item.title} 
                    fill 
                    className="object-contain p-1" 
                    sizes="48px"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 shrink-0 rounded-feature bg-white/5 border border-border flex items-center justify-center">
                  <Award className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[11px] md:text-[12px] uppercase tracking-mono-wide text-verge-mint mb-1">
                  {item.issuer}
                </div>
                <h3 className="font-sans text-[18px] md:text-[20px] font-bold leading-tight group-hover:text-verge-link transition-colors">
                  {item.title}
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-2 font-mono text-[11px] uppercase tracking-mono-wide text-muted-foreground mb-6 flex-grow border-l-2 border-border/40 pl-4">
              <div>
                ISSUED: <span className="text-foreground">{formatDate(item.issue_date)}</span>
              </div>
              <div>
                EXPIRY: {item.expiry_date ? (
                  <span className="text-foreground">{formatDate(item.expiry_date)}</span>
                ) : (
                  <span className="text-verge-mint">NO EXPIRY</span>
                )}
              </div>
            </div>

            {/* Tags */}
            {item.skills && item.skills.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {item.skills.map((skill) => (
                  <span key={skill} className="font-mono text-[11px] uppercase tracking-mono-wide bg-background border border-border/50 px-2 py-1 rounded-[2px] text-muted-foreground">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Action */}
            {item.credential_url && (
              <a 
                href={item.credential_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-auto font-mono text-[12px] font-semibold uppercase tracking-mono-norm text-foreground hover:text-verge-link transition-colors pt-4 border-t border-border/20"
              >
                VERIFY CREDENTIAL ↗
              </a>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
