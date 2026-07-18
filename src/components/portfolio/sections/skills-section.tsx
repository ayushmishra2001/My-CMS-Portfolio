"use client";
import { useEffect, useState } from "react";
import { Section, Skill } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import { createClient } from "@/lib/supabase/client";
import * as LucideIcons from "lucide-react";

interface Props { section: Section; settings: Record<string, unknown>; }

function getLucideIcon(name: string | null | undefined) {
  if (!name) return null;
  const pascalName = name
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  return (LucideIcons as any)[pascalName] || (LucideIcons as any)[name] || null;
}

export function SkillsSection({ section, settings: _ }: Props) {
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    createClient().from("skills").select("*").eq("is_visible", true).order("category").order("display_order")
      .then(({ data }) => setSkills(data ?? []));
  }, []);

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = (skill.category || "General").trim().toUpperCase();
    return { ...acc, [cat]: [...(acc[cat] ?? []), skill] };
  }, {});

  // Duplicate the skills array 3 times per half to ensure the marquee is wider than any screen
  const getTickerItems = (catSkills: Skill[]) => {
    return [...catSkills, ...catSkills, ...catSkills];
  };

  const sortedCategories = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);
  const N = sortedCategories.length;

  // Calculate dynamic column spans to make the grid perfectly even
  const getColSpans = () => {
    if (N === 0) return [];
    
    // Desktop spans (lg: 3 cols)
    const lgSpans = [2, ...Array(N - 1).fill(1)];
    const sumBeforeLastLg = lgSpans.slice(0, N - 1).reduce((a, b) => a + b, 0);
    const colIndexLg = sumBeforeLastLg % 3;
    lgSpans[N - 1] = 3 - colIndexLg;

    // Tablet spans (md: 2 cols)
    const mdSpans = [2, ...Array(N - 1).fill(1)];
    const sumBeforeLastMd = mdSpans.slice(0, N - 1).reduce((a, b) => a + b, 0);
    const colIndexMd = sumBeforeLastMd % 2;
    mdSpans[N - 1] = 2 - colIndexMd;

    return sortedCategories.map((_, i) => ({
      lg: lgSpans[i],
      md: mdSpans[i],
    }));
  };

  const colSpans = getColSpans();

  return (
    <SectionWrapper section={section} className="overflow-hidden">
      <SectionHeading title={section.label} subtitle={section.subtitle} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {sortedCategories.map(([category, catSkills], index) => {
          // Borrow the icon from the first skill that has one, fallback to 'Code'
          const firstSkillWithIcon = catSkills.find(s => !!s.icon_name);
          const CategoryIcon = getLucideIcon(firstSkillWithIcon?.icon_name || "Code");
          const spans = colSpans[index];

          // Map spans to Tailwind classes
          const lgClass = spans?.lg === 3 ? "lg:col-span-3" : spans?.lg === 2 ? "lg:col-span-2" : "lg:col-span-1";
          const mdClass = spans?.md === 2 ? "md:col-span-2" : "md:col-span-1";

          return (
            <div 
              key={category} 
              className={`flex flex-col bg-background border border-border rounded-2xl p-8 hover:border-verge-mint/30 transition-all duration-500 group relative overflow-hidden shadow-sm h-full col-span-1 ${mdClass} ${lgClass}`}
            >
              {/* Subtle top highlight bar that reveals on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-verge-mint transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
              
              {/* Category Icon */}
              <div className="mb-6 flex items-center justify-start">
                {CategoryIcon && <CategoryIcon className="h-10 w-10 text-verge-mint drop-shadow-[0_0_15px_rgba(25,255,160,0.3)]" strokeWidth={1.5} />}
              </div>

              {/* Category Title */}
              <h3 className="font-sans text-[22px] font-bold text-foreground mb-8 leading-tight">
                {category}
              </h3>

              {/* Skills Pills */}
              <div className="flex flex-wrap gap-3">
                {catSkills.map(skill => (
                  <div 
                    key={skill.id}
                    className="flex items-center gap-2 border border-border/60 bg-accent/5 text-foreground/80 px-5 py-2.5 rounded-full font-mono text-[14px] md:text-[15px] tracking-tight transition-colors duration-300 hover:text-verge-mint hover:border-verge-mint hover:bg-verge-mint/5 cursor-default shadow-sm"
                  >
                    {skill.name}
                  </div>
                ))}
              </div>
              
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
