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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <div key={item.id} className="group rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-colors">
            <div className="flex items-start gap-4 mb-3">
              {item.image_url ? (
                <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-border">
                  <Image src={item.image_url} alt={item.title} fill className="object-contain p-1" />
                </div>
              ) : (
                <div className="w-12 h-12 shrink-0 rounded-lg border border-border bg-primary/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm leading-tight line-clamp-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{item.issuer}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Issued {formatDate(item.issue_date)}
                </p>
                {item.expiry_date ? (
                  <p className="text-xs text-muted-foreground">Expires {formatDate(item.expiry_date)}</p>
                ) : (
                  <p className="text-xs text-green-600">No Expiry</p>
                )}
              </div>
              {item.credential_url && (
                <a href={item.credential_url} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {item.skills.length > 0 && (
              <p className="text-xs text-muted-foreground/60 mt-3 font-mono">
                {item.skills.join(" · ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
