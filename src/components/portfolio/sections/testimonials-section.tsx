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
      <div className="grid md:grid-cols-2 gap-6">
        {items.map((item) => (
          <blockquote key={item.id} className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
            {/* Stars */}
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < item.rating ? "text-amber-400 fill-amber-400" : "text-muted"}`} />
              ))}
            </div>

            {/* Content */}
            <p className="text-muted-foreground text-sm leading-relaxed flex-1">
              &ldquo;{item.content}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              {item.author_avatar_url ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                  <Image src={item.author_avatar_url} alt={item.author_name} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-primary">{getInitials(item.author_name)}</span>
                </div>
              )}
              <div>
                <p className="font-medium text-sm">{item.author_name}</p>
                {(item.author_role || item.author_company) && (
                  <p className="text-xs text-muted-foreground">
                    {[item.author_role, item.author_company].filter(Boolean).join(" · ")}
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
