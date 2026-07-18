"use client";
import { useEffect, useState, useRef } from "react";
import { Section, Project } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";

interface Props { section: Section; settings: Record<string, unknown>; }

function ProjectCard({ project, index, layout }: { project: Project; index: number; layout: "carousel" | "list" }) {
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

  const isCarousel = layout === "carousel";

  return (
    <div className={`relative group ${isCarousel ? "w-full md:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] shrink-0 snap-start" : ""}`}>
      {/* List Layout: Left Rail Timestamp */}
      {!isCarousel && (
        <div className="absolute -left-6 md:-left-16 top-[28px] w-6 md:w-16 pr-2 md:pr-4 text-right">
          <span className="block font-mono text-[10px] md:text-[11px] font-medium uppercase tracking-mono-tight text-muted-foreground bg-background py-1">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      )}

      {/* Pill Card */}
      <article className={`
        flex flex-col h-full rounded-pill transition-colors duration-200 overflow-hidden bg-background
        ${isCarousel 
          ? "border border-border hover:border-verge-link" 
          : "border border-border hover:border-verge-link p-6 md:p-8"
        }
      `}>
        {images.length > 0 && (
          <div className={`relative w-full bg-muted border-b border-border/20 ${isCarousel ? "aspect-[16/10]" : "aspect-[16/9] md:aspect-[21/9] rounded-feature mb-6 overflow-hidden"}`}>
            <Image
               src={images[activeIdx]}
               alt={project.title}
               fill
               className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-2 bottom-2 bg-background/80 backdrop-blur-sm hover:bg-verge-mint text-foreground hover:text-black border border-border h-8 w-8 flex items-center justify-center rounded-full transition-colors z-10">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={nextImage} className="absolute left-12 bottom-2 bg-background/80 backdrop-blur-sm hover:bg-verge-mint text-foreground hover:text-black border border-border h-8 w-8 flex items-center justify-center rounded-full transition-colors z-10">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        )}

        <div className={`flex flex-col flex-grow ${isCarousel ? "p-6" : ""}`}>
          <div className="font-mono text-[11px] md:text-[12px] uppercase tracking-mono-wide text-verge-mint mb-2">
            PROJECT // {String(index + 1).padStart(2, "0")}
          </div>

          <h3 className="font-sans text-[20px] md:text-[24px] font-bold leading-tight group-hover:text-verge-link transition-colors">
            {project.title}
          </h3>

          {project.description && (
            <p className="font-sans text-[13px] md:text-[15px] font-medium leading-relaxed mt-4 text-foreground/80 line-clamp-3">
              {project.description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-2 mt-auto pt-6">
            {project.tech_stack.map(tech => (
              <span key={tech} className="font-mono text-[10px] md:text-[11px] uppercase tracking-mono-wide bg-background border border-border/50 px-2 py-1 rounded-[2px] text-muted-foreground">
                {tech}
              </span>
            ))}
          </div>

          <div className="flex gap-4 mt-6 pt-4 border-t border-border/20">
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="font-mono text-[12px] font-semibold uppercase tracking-mono-norm text-foreground hover:text-verge-link transition-colors">
                GITHUB ↗
              </a>
            )}
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="font-mono text-[12px] font-semibold uppercase tracking-mono-norm text-foreground hover:text-verge-link transition-colors">
                LIVE DEMO ↗
              </a>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

export function ProjectsSection({ section, settings: _ }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const content = section.content as Record<string, unknown>;
  const layout = (content.layout as string) || "grid";
  const maxItems = (content.max_items as number) || 6;
  const featuredOnly = content.show_featured_only as boolean;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let query = supabase.from("projects").select("*, project_images(*)").eq("is_visible", true).order("display_order").limit(maxItems);
    if (featuredOnly) query = query.eq("is_featured", true);
    query.then(({ data }) => setProjects(data ?? []));
  }, [maxItems, featuredOnly]);

  const isCarousel = layout === "grid"; // we mapped 'grid' to carousel mode 

  useEffect(() => {
    if (!isCarousel || projects.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // If we hit the end, smoothly scroll back to the start
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          // Scroll by one full page + gap
          scrollRef.current.scrollBy({ left: clientWidth + 24, behavior: "smooth" });
        }
      }
    }, 3500); // Delayed auto-scroll every 3.5 seconds
    
    return () => clearInterval(interval);
  }, [isCarousel, projects.length, isHovered]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -(scrollRef.current.clientWidth + 24), behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth + 24, behavior: "smooth" });
    }
  };

  return (
    <SectionWrapper section={section} className="relative">
      <SectionHeading title={section.label} subtitle={section.subtitle} />
      
      {isCarousel ? (
        <div 
          className="relative group/carousel"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Extreme Left Arrow */}
          {projects.length > 0 && (
            <button 
              onClick={scrollLeft}
              className="absolute -left-2 md:-left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-20 bg-background/90 backdrop-blur-md border border-border h-14 w-14 flex items-center justify-center rounded-full hover:bg-verge-mint hover:text-black transition-colors opacity-0 group-hover/carousel:opacity-100 shadow-xl"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          )}

          {/* Extreme Right Arrow */}
          {projects.length > 0 && (
            <button 
              onClick={scrollRight}
              className="absolute -right-2 md:-right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-20 bg-background/90 backdrop-blur-md border border-border h-14 w-14 flex items-center justify-center rounded-full hover:bg-verge-mint hover:text-black transition-colors opacity-0 group-hover/carousel:opacity-100 shadow-xl"
            >
              <ArrowRight className="h-6 w-6" />
            </button>
          )}

          {/* Carousel Scroll Container */}
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide py-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} layout="carousel" />
            ))}
          </div>
        </div>
      ) : (
        <div className="relative w-full pl-6 md:pl-16 mt-8">
          <div className="absolute left-0 md:left-8 top-0 bottom-0 w-[1px] bg-border/40 dashed-rail" />
          <div className="flex flex-col gap-6">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} layout="list" />
            ))}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
