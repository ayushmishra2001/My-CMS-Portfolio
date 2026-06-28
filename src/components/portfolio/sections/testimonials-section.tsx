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
      <div className="border-t border-border bg-background transition-colors duration-300 w-full flex flex-col">
        {items.map((item, index) => (
          <blockquote 
            key={item.id} 
            className="border-b border-border py-10 md:py-14 px-4 md:px-8 relative overflow-hidden group hover:bg-accent/5 transition-colors duration-300 last:border-b-0"
          >
            {/* Massive Typographic Background Quote Mark */}
            <div className="absolute right-6 -top-12 md:-top-20 font-serif text-[18rem] md:text-[28rem] font-bold text-foreground/[0.03] select-none pointer-events-none leading-none select-none">
              ”
            </div>

            {/* Testimonial Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
              {/* Review & Rating Column */}
              <div className="col-span-1 lg:col-span-8 flex flex-col justify-between space-y-4">
                {/* Rating specifications */}
                <div className="flex items-center gap-2 font-mono text-[9px] text-muted-foreground uppercase">
                  <span>[ RATING_INDEX ]</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3.5 w-3.5 ${
                          i < item.rating 
                            ? "text-primary fill-primary" 
                            : "text-muted-foreground/20 fill-transparent"
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                {/* Main Quote Content */}
                <p className="text-base sm:text-lg md:text-xl font-light text-foreground tracking-tight leading-relaxed italic pr-4">
                  &ldquo;{item.content}&rdquo;
                </p>
              </div>

              {/* Author Column */}
              <div className="col-span-1 lg:col-span-4 flex items-center lg:justify-end gap-4">
                {/* Sharp square avatar box */}
                {item.author_avatar_url ? (
                  <div className="relative w-12 h-12 shrink-0 border border-border p-1 bg-background overflow-hidden group-hover:border-primary/45 transition-colors duration-300">
                    <Image 
                      src={item.author_avatar_url} 
                      alt={item.author_name} 
                      fill 
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105" 
                      sizes="48px"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 shrink-0 border border-border bg-accent/10 flex items-center justify-center font-mono font-bold text-xs uppercase text-primary">
                    {getInitials(item.author_name)}
                  </div>
                )}

                {/* Author Credentials */}
                <div className="font-mono text-left lg:text-right">
                  <span className="text-[8px] text-muted-foreground uppercase tracking-widest block">
                    [ RECORD_REF // {String(index + 1).padStart(2, "0")} ]
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm uppercase text-foreground mt-0.5 leading-tight">
                    {item.author_name}
                  </h4>
                  {(item.author_role || item.author_company) && (
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1 leading-normal">
                      {[item.author_role, item.author_company].filter(Boolean).join(" // ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </blockquote>
        ))}
      </div>
    </SectionWrapper>
  );
}
