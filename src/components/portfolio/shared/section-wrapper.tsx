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

  const maxWidthClass = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    full: "max-w-full",
  }[config.max_width ?? "lg"] ?? "max-w-6xl";

  const paddingClass = {
    sm: "py-12",
    md: "py-20",
    lg: "py-28",
  }[config.padding ?? "md"] ?? "py-20";

  const fontClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }[config.font_size ?? "md"] ?? "text-base";

  const animationClass = {
    none: "",
    fade: visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
    slide: visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6",
    zoom: visible ? "opacity-100 scale-100" : "opacity-0 scale-95",
  }[config.animation ?? "fade"] ?? (visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6");

  const style: React.CSSProperties = {
    backgroundColor: config.background_color || undefined,
    color: config.text_color || undefined,
    "--accent": config.accent_color || undefined,
  } as React.CSSProperties;

  return (
    <section
      id={section.type}
      ref={ref}
      style={style}
      className={cn(paddingClass, fontClass, "transition-all duration-700", animationClass, className)}
    >
      <div className={cn("mx-auto px-6", maxWidthClass)}>
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string | null }) {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  );
}
