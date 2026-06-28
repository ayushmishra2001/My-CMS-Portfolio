"use client";
import { useEffect, useState } from "react";
import { Section, Skill } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import { createClient } from "@/lib/supabase/client";
import * as LucideIcons from "lucide-react";

interface Props { section: Section; settings: Record<string, unknown>; }

function getLucideIcon(name: string | null | undefined) {
  if (!name) return null;
  // Convert kebab-case or snake_case to PascalCase (e.g. 'code-2' -> 'Code2')
  const pascalName = name
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  return (LucideIcons as any)[pascalName] || (LucideIcons as any)[name] || null;
}

const PROFICIENCY_LABELS = ["NONE", "BEGINNER", "ELEMENTARY", "INTERMEDIATE", "ADVANCED", "EXPERT"];

export function SkillsSection({ section, settings: _ }: Props) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const content = section.content as Record<string, unknown>;
  const displayStyle = (content.display_style as string) || "tags";

  useEffect(() => {
    createClient().from("skills").select("*").eq("is_visible", true).order("category").order("display_order")
      .then(({ data }) => setSkills(data ?? []));
  }, []);

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = (skill.category || "General").trim().toUpperCase();
    return { ...acc, [cat]: [...(acc[cat] ?? []), skill] };
  }, {});

  return (
    <SectionWrapper section={section}>
      <SectionHeading title={section.label} subtitle={section.subtitle} />
      <div className="border border-border bg-background transition-colors duration-300 w-full flex flex-col">
        {Object.entries(grouped).map(([category, catSkills]) => (
          <div 
            key={category} 
            className="border-b border-border last:border-b-0 grid grid-cols-1 lg:grid-cols-12"
          >
            {/* Category Label Cell */}
            <div className="col-span-12 lg:col-span-3 border-b lg:border-b-0 lg:border-r border-border p-6 bg-accent/5 flex lg:flex-col justify-between items-start">
              <div className="space-y-1">
                <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest block">
                  [ SKILL_CATEGORY ]
                </span>
                <h3 className="text-sm font-black uppercase text-foreground tracking-wider font-mono">
                  {category}
                </h3>
              </div>
              <span className="font-mono text-[8px] text-muted-foreground/60 uppercase tracking-widest hidden lg:inline mt-4">
                SYS_STATUS // STABLE
              </span>
            </div>

            {/* Skills Display Cell */}
            <div className="col-span-12 lg:col-span-9 bg-border/20">
              {displayStyle === "tags" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[1px] bg-border">
                  {catSkills.map((skill) => {
                    const Icon = getLucideIcon(skill.icon_name);
                    const profText = PROFICIENCY_LABELS[skill.proficiency] || "SKILL_SPEC";
                    
                    return (
                      <div 
                        key={skill.id} 
                        className="bg-background p-4 flex flex-col justify-between min-h-[96px] font-mono hover:bg-accent/5 transition-colors duration-300"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] text-muted-foreground uppercase tracking-widest block">
                            [ {profText} ]
                          </span>
                          
                          {/* Mini visual indicator scale */}
                          <div className="flex gap-0.5 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-2 h-1 border-[0.5px] ${
                                  i < skill.proficiency 
                                    ? "bg-primary/80 border-primary/80" 
                                    : "border-border bg-transparent"
                                }`} 
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-baseline justify-between mt-auto">
                          <span className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-tight flex items-center gap-1.5">
                            {Icon && <Icon className="h-3.5 w-3.5 text-primary shrink-0" />}
                            {skill.name}
                          </span>
                          {skill.years_experience && (
                            <span className="text-[9px] text-muted-foreground font-semibold shrink-0 ml-2">
                              {skill.years_experience}Y_EXP
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {/* Grid filler elements for styling continuity */}
                  {catSkills.length % 4 !== 0 && (
                    Array.from({ length: 4 - (catSkills.length % 4) }).map((_, i) => (
                      <div key={`fill-${i}`} className="bg-background hidden md:block" />
                    ))
                  )}
                  {catSkills.length % 3 !== 0 && (
                    Array.from({ length: 3 - (catSkills.length % 3) }).map((_, i) => (
                      <div key={`fill-sm-${i}`} className="bg-background hidden sm:block md:hidden" />
                    ))
                  )}
                  {catSkills.length % 2 !== 0 && (
                    Array.from({ length: 2 - (catSkills.length % 2) }).map((_, i) => (
                      <div key={`fill-xs-${i}`} className="bg-background block sm:hidden" />
                    ))
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border">
                  {catSkills.map((skill) => {
                    const Icon = getLucideIcon(skill.icon_name);
                    
                    return (
                      <div 
                        key={skill.id} 
                        className="bg-background p-5 flex flex-col justify-between min-h-[110px] font-mono hover:bg-accent/5 transition-colors duration-300"
                      >
                        <div>
                          <div className="flex justify-between items-start font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-2 pb-1.5 border-b border-border/30">
                            <span>[ PROFICIENCY ]</span>
                            <span className="font-bold text-foreground/80">
                              {PROFICIENCY_LABELS[skill.proficiency] || "N/A"}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-foreground uppercase tracking-tight flex items-center gap-2">
                            {Icon && <Icon className="h-4 w-4 text-primary shrink-0" />}
                            {skill.name}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-2 border-t border-border/20">
                          {/* Harsh geometric segmented proficiency indicators */}
                          <div className="flex gap-1.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-3.5 h-3.5 border ${
                                  i < skill.proficiency 
                                    ? "bg-primary border-primary" 
                                    : "border-border bg-transparent"
                                } transition-all duration-300`} 
                              />
                            ))}
                          </div>
                          {skill.years_experience && (
                            <span className="text-[9px] text-muted-foreground shrink-0 ml-2">
                              {skill.years_experience}Y_EXP
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {/* Grid filler elements for styling continuity */}
                  {catSkills.length % 3 !== 0 && (
                    Array.from({ length: 3 - (catSkills.length % 3) }).map((_, i) => (
                      <div key={`fill-prof-${i}`} className="bg-background hidden lg:block" />
                    ))
                  )}
                  {catSkills.length % 2 !== 0 && (
                    Array.from({ length: 2 - (catSkills.length % 2) }).map((_, i) => (
                      <div key={`fill-prof-sm-${i}`} className="bg-background hidden sm:block lg:hidden" />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
