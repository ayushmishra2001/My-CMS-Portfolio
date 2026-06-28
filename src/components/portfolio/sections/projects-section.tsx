"use client";
import { useEffect, useState } from "react";
import { Section, Project } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { Github, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

interface Props { section: Section; settings: Record<string, unknown>; }

function ProjectCard({ project, index, layout }: { project: Project; index: number; layout: "grid" | "list" }) {
  // Combine primary image and additional gallery images
  const images = [
    project.image_url,
    ...(project.project_images?.map((pi) => pi.image_url) || []),
  ].filter(Boolean) as string[];

  const [activeIdx, setActiveIdx] = useState(0);

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (layout === "grid") {
    return (
      <article className="group border-b border-r border-border bg-card/20 hover:bg-accent/5 transition-colors duration-300 flex flex-col h-full relative overflow-hidden">
        {images.length > 0 && (
          <div className="relative aspect-[16/10] overflow-hidden bg-muted border-b border-border">
            <Image
              src={images[activeIdx]}
              alt={project.title}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
            {images.length > 1 && (
              <>
                {/* Raw Geometric Slider Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-0 bottom-0 bg-background text-foreground hover:bg-accent border border-border h-8 w-8 flex items-center justify-center z-10 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute left-8 bottom-0 bg-background text-foreground hover:bg-accent border-y border-r border-border h-8 w-8 flex items-center justify-center z-10 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                {/* Clickable Square Dot Indicators */}
                <div className="absolute top-0 right-0 bg-background/90 border-l border-b border-border flex items-center gap-1 p-1.5 z-10">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setActiveIdx(i);
                      }}
                      className={`w-3 h-3 border border-border transition-all ${
                        i === activeIdx ? "bg-foreground" : "bg-transparent hover:bg-foreground/20"
                      }`}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        <div className="p-5 flex flex-col flex-grow">
          {/* Header metadata row */}
          <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-4 font-mono text-[9px] text-muted-foreground uppercase bg-accent/5 -mx-5 px-5">
            <span>[ REF_NO // {String(index + 1).padStart(2, "0")} ]</span>
            <span>SPEC_ACTIVE</span>
          </div>

          <h3 className="font-bold text-lg uppercase tracking-tight text-foreground mb-2">{project.title}</h3>
          
          {project.description && (
            <p className="text-xs text-muted-foreground leading-relaxed font-light mb-6 line-clamp-3">
              {project.description}
            </p>
          )}
          
          {/* Tech Stack & Links */}
          <div className="mt-auto space-y-4">
            {project.tech_stack.length > 0 && (
              <div className="pt-2 border-t border-border/40">
                <span className="font-mono text-[8px] tracking-widest text-muted-foreground uppercase block mb-1.5">[ TECHNOLOGY ]</span>
                <div className="flex flex-wrap gap-1">
                  {project.tech_stack.map((tech) => (
                    <span key={tech} className="font-mono text-[9px] uppercase bg-accent text-foreground px-1.5 py-0.5 border border-border/40">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-border/30">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-mono uppercase bg-background hover:bg-accent text-foreground transition-all duration-200 flex-1"
                >
                  <Github className="h-3 w-3" />
                  <span>REPO ↗</span>
                </a>
              )}
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-mono uppercase bg-primary text-primary-foreground hover:bg-accent hover:text-foreground transition-all duration-200 flex-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>LIVE ↗</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  const isOdd = index % 2 !== 0;

  return (
    <article className="grid grid-cols-1 lg:grid-cols-12 border-b border-border last:border-b-0 hover:bg-accent/5 transition-colors duration-300">
      {/* Index Column */}
      <div className="order-1 col-span-1 lg:col-span-1 border-b lg:border-b-0 border-r-0 lg:border-r border-border p-6 flex lg:flex-col items-center justify-center bg-accent/5 font-mono text-3xl lg:text-5xl font-black text-muted-foreground/30">
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Image Column */}
      <div 
        className={`order-2 ${
          isOdd ? "lg:order-3" : "lg:order-2"
        } col-span-1 lg:col-span-5 p-6 bg-accent/5 flex items-center justify-center relative aspect-[16/10] lg:aspect-auto border-b lg:border-b-0 ${
          isOdd ? "" : "lg:border-r"
        } border-border`}
      >
        {images.length > 0 ? (
          <div className="relative w-full h-full min-h-[200px] border border-border bg-background p-2 group overflow-hidden">
            <Image
              src={images[activeIdx]}
              alt={project.title}
              fill
              className="object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out scale-100 group-hover:scale-[1.02]"
              sizes="(max-w-768px) 100vw, 33vw"
            />
            {images.length > 1 && (
              <>
                {/* Raw Geometric Slider Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-2 bottom-2 bg-background text-foreground hover:bg-accent border border-border h-8 w-8 flex items-center justify-center z-10 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute left-10 bottom-2 bg-background text-foreground hover:bg-accent border-y border-r border-border h-8 w-8 flex items-center justify-center z-10 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                {/* Clickable Square Dot Indicators */}
                <div className="absolute top-2 right-2 bg-background/90 border border-border flex items-center gap-1 p-1.5 z-10">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setActiveIdx(i);
                      }}
                      className={`w-3 h-3 border border-border transition-all ${
                        i === activeIdx ? "bg-foreground" : "bg-transparent hover:bg-foreground/20"
                      }`}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-full min-h-[200px] border border-border bg-background flex flex-col justify-between p-4 relative overflow-hidden">
            <span className="font-mono text-[9px] text-muted-foreground">[ SCHEMATIC ]</span>
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
              <div className="w-full h-full border border-foreground grid grid-cols-4 grid-rows-4">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="border-[0.5px] border-foreground" />
                ))}
              </div>
            </div>
            <div className="font-mono text-[9px] text-muted-foreground self-end">NO_PREVIEW</div>
          </div>
        )}
      </div>

      {/* Details Column */}
      <div 
        className={`order-3 ${
          isOdd ? "lg:order-2" : "lg:order-3"
        } col-span-1 lg:col-span-6 p-6 md:p-8 flex flex-col justify-between ${
          isOdd ? "lg:border-r" : ""
        } border-border`}
      >
        <div>
          <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mb-2 flex items-center justify-between border-b border-border/40 pb-2">
            <span>[ TECHNICAL_SPECS // MODEL_{String(index + 1).padStart(2, "0")} ]</span>
            <span>SYS_READY</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-foreground mt-2 mb-4">{project.title}</h3>
          {project.description && (
            <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-xl">
              {project.description}
            </p>
          )}
        </div>

        <div className="mt-8 space-y-4">
          {project.tech_stack.length > 0 && (
            <div className="pt-4 border-t border-border/40">
              <span className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase block mb-2">[ SYSTEM_TECHNOLOGY ]</span>
              <div className="flex flex-wrap gap-1.5">
                {project.tech_stack.map((tech) => (
                  <span key={tech} className="font-mono text-[10px] uppercase bg-accent text-foreground px-2 py-0.5 border border-border/40">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-border text-xs font-mono uppercase bg-background hover:bg-accent text-foreground transition-all duration-200"
              >
                <Github className="h-3.5 w-3.5" />
                <span>REPOSITORY ↗</span>
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-border text-xs font-mono uppercase bg-primary text-primary-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>DEPLOYMENT ↗</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProjectsSection({ section, settings: _ }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const content = section.content as Record<string, unknown>;
  const layout = (content.layout as string) || "grid";
  const maxItems = (content.max_items as number) || 6;
  const featuredOnly = content.show_featured_only as boolean;

  useEffect(() => {
    const supabase = createClient();
    let query = supabase.from("projects").select("*, project_images(*)").eq("is_visible", true).order("display_order").limit(maxItems);
    if (featuredOnly) query = query.eq("is_featured", true);
    query.then(({ data }) => setProjects(data ?? []));
  }, [maxItems, featuredOnly]);

  return (
    <SectionWrapper section={section}>
      <SectionHeading title={section.label} subtitle={section.subtitle} />
      <div className={layout === "grid"
        ? "border-t border-l border-border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 bg-background"
        : "border border-border bg-background flex flex-col"
      }>
        {projects.map((project, index) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            index={index}
            layout={layout === "grid" ? "grid" : "list"} 
          />
        ))}
      </div>
    </SectionWrapper>
  );
}
