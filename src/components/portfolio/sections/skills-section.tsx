"use client";
import { useEffect, useState } from "react";
import { Section, Skill } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import { createClient } from "@/lib/supabase/client";

interface Props { section: Section; settings: Record<string, unknown>; }

export function SkillsSection({ section, settings: _ }: Props) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const content = section.content as Record<string, unknown>;
  const displayStyle = (content.display_style as string) || "tags";

  useEffect(() => {
    createClient().from("skills").select("*").order("category").order("display_order")
      .then(({ data }) => setSkills(data ?? []));
  }, []);

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category || "General";
    return { ...acc, [cat]: [...(acc[cat] ?? []), skill] };
  }, {});

  return (
    <SectionWrapper section={section}>
      <SectionHeading title={section.label} subtitle={section.subtitle} />
      <div className="space-y-10">
        {Object.entries(grouped).map(([category, catSkills]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">{category}</h3>
            {displayStyle === "tags" ? (
              <div className="flex flex-wrap gap-2">
                {catSkills.map((skill) => (
                  <span key={skill.id} className="inline-flex items-center px-3 py-1.5 rounded-lg border border-border bg-card text-sm font-medium hover:border-primary/50 transition-colors">
                    {skill.name}
                    {skill.years_experience && (
                      <span className="ml-1.5 text-xs text-muted-foreground">{skill.years_experience}y</span>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {catSkills.map((skill) => (
                  <div key={skill.id}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-xs text-muted-foreground">{["", "Beginner", "Elementary", "Intermediate", "Advanced", "Expert"][skill.proficiency]}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${(skill.proficiency / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
