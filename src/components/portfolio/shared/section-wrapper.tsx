"use client";
import { useRef, useEffect, useState } from "react";
import { Section, SectionStyleConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  section: Section;
  children: React.ReactNode;
  className?: string;
}

export function SectionWrapper({ section, children, className }: SectionWrapperProps) {
  const config: SectionStyleConfig = (section.style_config as SectionStyleConfig) ?? {};
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (config.animation === "none") { setVisible(true); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [config.animation]);

  const animationClass = {
    none: "",
    fade: visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
    slide: visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6",
    zoom: visible ? "opacity-100 scale-100" : "opacity-0 scale-95",
  }[config.animation ?? "fade"] ?? (visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6");

  return (
    <section
      id={section.type}
      ref={ref}
      className={cn("w-full transition-all duration-700 col-span-1 lg:col-span-12 pt-8 pb-16 md:py-16", animationClass, className)}
    >
      <div className="w-full">
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string | null }) {
  return (
    <div className="mb-12 border-b border-border/20 pb-4">
      <h2 className="font-manuka text-6xl md:text-[90px] font-black uppercase tracking-hero text-foreground leading-[0.8]">{title}</h2>
      {subtitle && <p className="font-sans text-[19px] font-light uppercase tracking-whisper text-foreground mt-6">{subtitle}</p>}
    </div>
  );
}
