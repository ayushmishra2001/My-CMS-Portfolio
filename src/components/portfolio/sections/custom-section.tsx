import { Section } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";

interface Props { section: Section; settings: Record<string, unknown>; }

export function CustomSection({ section, settings: _ }: Props) {
  const content = section.content as Record<string, unknown>;
  const cols = (content.columns as number) || 1;

  return (
    <SectionWrapper section={section}>
      <SectionHeading title={section.label} subtitle={section.subtitle} />
      <div className={cols === 2 ? "grid md:grid-cols-2 gap-8" : ""}>
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
          {content.body_markdown as string}
        </div>
      </div>
    </SectionWrapper>
  );
}
