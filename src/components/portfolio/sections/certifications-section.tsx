"use client";
import { useEffect, useState } from "react";
import { Section, Certification } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { ExternalLink, Award } from "lucide-react";
import Image from "next/image";

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
      <div className="border-t border-l border-border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 bg-background transition-colors duration-300">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="border-b border-r border-border bg-card/20 hover:bg-accent/5 transition-colors duration-300 p-5 flex flex-col justify-between min-h-[240px] relative overflow-hidden font-mono group"
          >
            <div>
              {/* Header: Image + Title Compartment */}
              <div className="flex gap-4 items-start pb-4 border-b border-border/40 mb-4">
                {item.image_url ? (
                  <div className="relative w-12 h-12 shrink-0 border border-border p-1 bg-background overflow-hidden group-hover:border-primary/40 transition-colors duration-300">
                    <Image 
                      src={item.image_url} 
                      alt={item.title} 
                      fill 
                      className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300 scale-100 group-hover:scale-105" 
                      sizes="48px"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 shrink-0 border border-border bg-accent/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-foreground/70" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] text-muted-foreground uppercase tracking-widest block mb-0.5">
                    [ CERTIFICATE_REF ]
                  </span>
                  <h3 className="font-bold text-xs sm:text-sm uppercase tracking-tight text-foreground leading-tight line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1.5 font-semibold">
                    ISSUER // {item.issuer}
                  </p>
                </div>
              </div>

              {/* Body: Issue/Expiry dates comparison block */}
              <div className="space-y-1 text-[10px] text-muted-foreground pb-4 border-b border-border/20 mb-4">
                <div className="flex justify-between">
                  <span>ISSUED:</span>
                  <span className="text-foreground font-semibold">{formatDate(item.issue_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>EXPIRY:</span>
                  {item.expiry_date ? (
                    <span className="text-foreground font-semibold">{formatDate(item.expiry_date)}</span>
                  ) : (
                    <span className="text-emerald-500 font-bold tracking-wider">[ NO_EXPIRY ]</span>
                  )}
                </div>
              </div>

              {/* Skills as raw monospaced string */}
              {item.skills && item.skills.length > 0 && (
                <div className="pb-4">
                  <span className="text-[8px] text-muted-foreground uppercase tracking-widest block mb-1">
                    [ SKILLS_ACQUIRED ]
                  </span>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {item.skills.join(" // ")}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom action Verify Button */}
            {item.credential_url && (
              <a 
                href={item.credential_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-auto flex items-center justify-between p-3 border border-border text-[9px] font-mono uppercase bg-background hover:bg-accent text-foreground transition-all duration-200 group/link"
              >
                <span>VERIFY_CREDENTIAL</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground group-hover/link:text-foreground transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </a>
            )}
          </div>
        ))}
        {/* Dynamic fillers for grid alignment */}
        {items.length % 3 !== 0 && (
          Array.from({ length: 3 - (items.length % 3) }).map((_, i) => (
            <div key={`fill-cert-${i}`} className="bg-card/5 border-b border-r border-border hidden lg:block" />
          ))
        )}
        {items.length % 2 !== 0 && (
          Array.from({ length: 2 - (items.length % 2) }).map((_, i) => (
            <div key={`fill-cert-sm-${i}`} className="bg-card/5 border-b border-r border-border hidden sm:block lg:hidden" />
          ))
        )}
      </div>
    </SectionWrapper>
  );
}
