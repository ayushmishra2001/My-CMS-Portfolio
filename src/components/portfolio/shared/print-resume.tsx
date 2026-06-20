"use client";
import React from "react";
import { Button } from "@/components/shared/button";
import { Printer, ArrowLeft, Mail, Phone, MapPin, Github, Linkedin, Globe } from "lucide-react";
import Link from "next/link";
import { SiteSettings, Experience, Education, Skill, Certification, Project } from "@/lib/types";

interface ResumeTemplateProps {
  settings: SiteSettings | null;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
}

export function ResumeTemplate({
  settings,
  experiences,
  educations,
  skills,
  certifications,
  projects,
}: ResumeTemplateProps) {
  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">No resume data found.</p>
          <Link href="/">
            <Button className="mt-4" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  // Group skills by category
  const skillsByCategory: Record<string, Skill[]> = {};
  skills.forEach((skill) => {
    const cat = skill.category || "General";
    if (!skillsByCategory[cat]) {
      skillsByCategory[cat] = [];
    }
    skillsByCategory[cat].push(skill);
  });

  return (
    <div className="min-h-screen bg-muted/40 print:bg-white print:min-h-0 py-8 px-4 print:py-0 print:px-0">
      {/* Print Specific CSS Rules */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hide portfolio nav and footer on resume page */
        header.fixed, footer {
          display: none !important;
        }
        
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          @page {
            size: portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
          .no-print {
            display: none !important;
          }
          .print-break-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      ` }} />

      {/* Control bar / Navigation */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center no-print">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Portfolio
        </Link>
        <Button onClick={handlePrint} size="sm" className="gap-2">
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </Button>
      </div>

      {/* Resume Container */}
      <article className="max-w-4xl mx-auto bg-card border print:border-0 shadow-sm print:shadow-none p-8 md:p-12 print:p-0 rounded-xl print:rounded-none">
        
        {/* Header Section */}
        <header className="border-b border-border pb-6 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground print:text-black">
                {settings.full_name}
              </h1>
              <p className="text-lg font-medium text-primary print:text-neutral-800 mt-1">
                {settings.tagline}
              </p>
            </div>
            
            {/* Contact Details */}
            <div className="flex flex-col gap-1.5 text-sm text-muted-foreground print:text-neutral-700">
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-foreground print:hover:text-neutral-700">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground/80 print:text-neutral-700" />
                  {settings.email}
                </a>
              )}
              {settings.phone && (
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground/80 print:text-neutral-700" />
                  {settings.phone}
                </span>
              )}
              {settings.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/80 print:text-neutral-700" />
                  {settings.location}
                </span>
              )}
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                {settings.social_links?.github && (
                  <a href={settings.social_links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground print:hover:text-neutral-700">
                    <Github className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs">GitHub</span>
                  </a>
                )}
                {settings.social_links?.linkedin && (
                  <a href={settings.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground print:hover:text-neutral-700">
                    <Linkedin className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs">LinkedIn</span>
                  </a>
                )}
                {settings.social_links?.website && (
                  <a href={settings.social_links.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground print:hover:text-neutral-700">
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs">Portfolio</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Profile / Summary */}
        {settings.bio && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wider text-foreground print:text-black mb-3 border-l-4 border-primary print:border-neutral-800 pl-3">
              Professional Summary
            </h2>
            <p className="text-muted-foreground print:text-neutral-850 text-sm leading-relaxed whitespace-pre-line">
              {settings.bio}
            </p>
          </section>
        )}

        {/* Experience Section */}
        {experiences.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wider text-foreground print:text-black mb-4 border-l-4 border-primary print:border-neutral-800 pl-3">
              Work Experience
            </h2>
            <div className="space-y-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="print-break-avoid">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                    <div>
                      <h3 className="font-semibold text-base text-foreground print:text-black">
                        {exp.role}
                      </h3>
                      <p className="text-sm text-primary print:text-neutral-800 font-medium">
                        {exp.company}
                        {exp.location && <span className="text-muted-foreground font-normal"> — {exp.location}</span>}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground print:text-neutral-700 bg-muted print:bg-none px-2 py-1 print:px-0 print:py-0 rounded">
                      {new Date(exp.start_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })} -{" "}
                      {exp.is_current
                        ? "Present"
                        : exp.end_date
                        ? new Date(exp.end_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                        : ""}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-muted-foreground print:text-neutral-800 text-xs mt-2 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="list-disc list-inside text-muted-foreground print:text-neutral-800 text-xs mt-2 space-y-1 pl-1">
                      {exp.achievements.map((ach, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {ach}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects Section */}
        {projects.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wider text-foreground print:text-black mb-4 border-l-4 border-primary print:border-neutral-800 pl-3">
              Projects
            </h2>
            <div className="space-y-4">
              {projects.map((proj) => (
                <div key={proj.id} className="print-break-avoid">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                    <div>
                      <h3 className="font-semibold text-base text-foreground print:text-black flex items-center gap-2">
                        {proj.title}
                        <span className="flex gap-2 no-print">
                          {proj.github_url && (
                            <a href={proj.github_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                              <Github className="h-3.5 w-3.5" />
                            </a>
                          )}
                          {proj.live_url && (
                            <a href={proj.live_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                              <Globe className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </span>
                      </h3>
                      {proj.tech_stack && proj.tech_stack.length > 0 && (
                        <p className="text-xs text-primary print:text-neutral-850 font-medium mt-0.5">
                          {proj.tech_stack.join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                  {proj.description && (
                    <p className="text-muted-foreground print:text-neutral-800 text-xs mt-1.5 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education Section */}
        {educations.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold uppercase tracking-wider text-foreground print:text-black mb-4 border-l-4 border-primary print:border-neutral-800 pl-3">
              Education
            </h2>
            <div className="space-y-4">
              {educations.map((edu) => (
                <div key={edu.id} className="print-break-avoid">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                    <div>
                      <h3 className="font-semibold text-base text-foreground print:text-black">
                        {edu.degree} in {edu.field}
                      </h3>
                      <p className="text-sm text-primary print:text-neutral-800 font-medium">
                        {edu.institution}
                        {edu.location && <span className="text-muted-foreground font-normal"> — {edu.location}</span>}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground print:text-neutral-700 bg-muted print:bg-none px-2 py-1 print:px-0 print:py-0 rounded">
                      {edu.start_date && new Date(edu.start_date).getFullYear()} -{" "}
                      {edu.is_current
                        ? "Present"
                        : edu.end_date
                        ? new Date(edu.end_date).getFullYear()
                        : ""}
                    </span>
                  </div>
                  {edu.grade && (
                    <p className="text-xs text-muted-foreground print:text-neutral-800 mt-1">
                      Grade: <span className="font-medium">{edu.grade}</span>
                    </p>
                  )}
                  {edu.description && (
                    <p className="text-muted-foreground print:text-neutral-800 text-xs mt-1.5 leading-relaxed">
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {skills.length > 0 && (
          <section className="mb-8 print-break-avoid">
            <h2 className="text-lg font-bold uppercase tracking-wider text-foreground print:text-black mb-4 border-l-4 border-primary print:border-neutral-800 pl-3">
              Skills
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                <div key={category} className="border border-border/60 print:border-none p-3 print:p-0 rounded-lg">
                  <h3 className="text-sm font-semibold text-foreground print:text-black mb-2">{category}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {catSkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="text-[11px] font-medium text-muted-foreground print:text-neutral-900 border border-border print:border-neutral-300 px-2 py-0.5 rounded"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications Section */}
        {certifications.length > 0 && (
          <section className="print-break-avoid">
            <h2 className="text-lg font-bold uppercase tracking-wider text-foreground print:text-black mb-4 border-l-4 border-primary print:border-neutral-800 pl-3">
              Certifications & Awards
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none">
              {certifications.map((cert) => (
                <li key={cert.id} className="text-xs flex flex-col justify-center border border-border/60 print:border-none p-3 print:p-0 rounded-lg">
                  <h3 className="font-semibold text-foreground print:text-black">{cert.title}</h3>
                  <div className="flex justify-between items-center mt-1 text-[11px] text-muted-foreground print:text-neutral-700">
                    <span>{cert.issuer}</span>
                    {cert.issue_date && (
                      <span>
                        {new Date(cert.issue_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

      </article>
    </div>
  );
}
