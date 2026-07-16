"use client";
import { Github, Linkedin, Mail, FileText, Twitter, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  settings: Record<string, unknown>;
}

export function StickySocial({ settings }: Props) {
  const social = (settings?.social_links as Record<string, string>) || {};
  
  const links = [
    { key: "resume", icon: FileText, label: "Resume", href: "/resume" },
    { key: "github", icon: Github, label: "GitHub", href: social.github },
    { key: "linkedin", icon: Linkedin, label: "LinkedIn", href: social.linkedin },
    { key: "twitter", icon: Twitter, label: "Twitter", href: social.twitter },
    { key: "website", icon: Globe, label: "Website", href: social.website },
    { key: "email", icon: Mail, label: "Email", href: settings?.email ? `mailto:${settings.email}` : undefined }
  ].filter(l => l.href);

  if (links.length === 0 || social.show_sticky_bar === false) return null;

  return (
    <div className="fixed left-2 xl:left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-40 hidden sm:flex">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.key}
            href={link.href}
            target={link.key !== "email" && link.key !== "resume" ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="group relative flex items-center h-10 w-10 hover:w-auto bg-background border border-border rounded-pill shadow-sm transition-all duration-300 overflow-hidden hover:pr-4 hover:bg-verge-mint hover:border-verge-mint"
          >
            <div className="absolute left-0 flex items-center justify-center h-10 w-10 text-foreground group-hover:text-black transition-colors z-10">
              <Icon className="h-4 w-4" />
            </div>
            {/* 
              To achieve the sliding text reveal without breaking the layout, 
              we use max-width and opacity transitions.
            */}
            <div className="flex items-center h-full pl-10 pr-0 opacity-0 max-w-0 group-hover:max-w-[150px] group-hover:opacity-100 transition-all duration-300 overflow-hidden">
              <span className="font-sans text-[12px] font-bold text-black whitespace-nowrap">
                {link.label}
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
