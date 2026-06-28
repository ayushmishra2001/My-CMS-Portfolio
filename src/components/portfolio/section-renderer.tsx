import { Section } from "@/lib/types";
import { HeroSection } from "./sections/hero-section";
import { AboutSection } from "./sections/about-section";
import { ProjectsSection } from "./sections/projects-section";
import { SkillsSection } from "./sections/skills-section";
import { ExperienceSection } from "./sections/experience-section";
import { EducationSection } from "./sections/education-section";
import { CertificationsSection } from "./sections/certifications-section";
import { TestimonialsSection } from "./sections/testimonials-section";
import { ContactSection } from "./sections/contact-section";
import { CustomSection } from "./sections/custom-section";
import { BlogPostsSection } from "./sections/blog-posts-section";

interface SectionRendererProps {
  section: Section;
  settings: Record<string, unknown>;
}

export function SectionRenderer({ section, settings }: SectionRendererProps) {
  const props = { section, settings };

  switch (section.type) {
    case "hero":          return <HeroSection {...props} />;
    case "about":         return <AboutSection {...props} />;
    case "projects":      return <ProjectsSection {...props} />;
    case "skills":        return <SkillsSection {...props} />;
    case "experience":    return <ExperienceSection {...props} />;
    case "education":     return <EducationSection {...props} />;
    case "certifications":return <CertificationsSection {...props} />;
    case "testimonials":  return <TestimonialsSection {...props} />;
    case "contact":       return <ContactSection {...props} />;
    case "blog_posts":    return <BlogPostsSection {...props} />;
    case "custom":        return <CustomSection {...props} />;
    default:              return null;
  }
}
