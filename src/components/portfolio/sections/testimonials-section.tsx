"use client";
import { useEffect, useState } from "react";
import { Section, Testimonial } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import { createClient } from "@/lib/supabase/client";
import { Star } from "lucide-react";
import Image from "next/image";
import { getInitials } from "@/lib/utils";

interface Props { section: Section; settings: Record<string, unknown>; }

export function TestimonialsSection({ section, settings: _ }: Props) {
  const [items, setItems] = useState<Testimonial[]>([]);

  useEffect(() => {
    createClient()
      .from("testimonials")
      .select("*")
      .eq("is_visible", true)
      .order("display_order")
      .then(({ data }) => setItems(data ?? []));
  }, []);

  return (
    <SectionWrapper section={section}>
      <SectionHeading title={section.label} subtitle={section.subtitle} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, index) => (
          <blockquote 
            key={item.id} 
            className="flex flex-col justify-between rounded-pill p-6 md:p-8 bg-background border border-border hover:border-verge-link transition-colors duration-300 relative group overflow-hidden"
          >
            {/* Background Quote Mark */}
            <div className="absolute -right-4 -top-8 font-manuka text-[160px] font-black text-border/20 select-none pointer-events-none leading-none group-hover:text-verge-link/10 transition-colors">
              ”
            </div>

            {/* Quote Content */}
            <div className="relative z-10 mb-8">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${
                      i < item.rating 
                        ? "text-verge-mint fill-verge-mint" 
                        : "text-muted-foreground/30 fill-transparent"
                    }`} 
                  />
                ))}
              </div>
              <p className="font-sans text-[16px] md:text-[20px] font-medium text-foreground tracking-tight leading-relaxed">
                &ldquo;{item.content}&rdquo;
              </p>
            </div>

            {/* Author */}
            <div className="flex items-center gap-4 border-t border-border/40 pt-4 mt-auto">
              {item.author_avatar_url ? (
                <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden border border-border">
                  <Image 
                    src={item.author_avatar_url} 
                    alt={item.author_name} 
                    fill 
                    className="object-cover" 
                    sizes="48px"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 shrink-0 rounded-full border border-border bg-white/5 flex items-center justify-center font-mono font-bold text-xs uppercase text-verge-mint">
                  {getInitials(item.author_name)}
                </div>
              )}

              <div>
                <h4 className="font-sans text-[16px] font-bold uppercase text-foreground leading-tight">
                  {item.author_name}
                </h4>
                {(item.author_role || item.author_company) && (
                  <p className="font-mono text-[11px] uppercase tracking-mono-wide text-muted-foreground mt-1">
                    {[item.author_role, item.author_company].filter(Boolean).join(" // ")}
                  </p>
                )}
              </div>
            </div>
          </blockquote>
        ))}
      </div>
    </SectionWrapper>
  );
}
