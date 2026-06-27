"use client";
import { useEffect, useState } from "react";
import { Section, Project } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { Github, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

interface Props { section: Section; settings: Record<string, unknown>; }

function ProjectCard({ project }: { project: Project }) {
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

  return (
    <article className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all duration-300 flex flex-col h-full">
      {images.length > 0 && (
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={images[activeIdx]}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-102 transition-transform duration-500"
          />
          {images.length > 1 && (
            <>
              {/* Slider Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              {/* Dots Indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === activeIdx ? "bg-white scale-125" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-base">{project.title}</h3>
          <div className="flex gap-1 shrink-0">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
        {project.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
        )}
        <div className="mt-auto pt-2">
          {project.tech_stack.length > 0 && (
            <p className="text-xs text-muted-foreground/70">
              {project.tech_stack.join(" · ")}
            </p>
          )}
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
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        : "space-y-6"
      }>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </SectionWrapper>
  );
}
