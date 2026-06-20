"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Layers, FolderOpen, Zap, Briefcase,
  GraduationCap, Award, MessageSquare, Mail, Settings,
  LogOut, User, ChevronRight, PanelLeftClose, PanelLeft,
  FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { label: "Dashboard",      href: "/admin/dashboard",       icon: LayoutDashboard },
  { label: "Sections",       href: "/admin/sections",        icon: Layers },
  { label: "Projects",       href: "/admin/projects",        icon: FolderOpen },
  { label: "Skills",         href: "/admin/skills",          icon: Zap },
  { label: "Experience",     href: "/admin/experience",      icon: Briefcase },
  { label: "Education",      href: "/admin/education",       icon: GraduationCap },
  { label: "Certifications", href: "/admin/certifications",  icon: Award },
  { label: "Testimonials",   href: "/admin/testimonials",    icon: MessageSquare },
  { label: "Blog",           href: "/admin/blog",            icon: FileText },
  { label: "Messages",       href: "/admin/contact-settings",icon: Mail },
];

const SETTINGS_ITEMS = [
  { label: "General",     href: "/admin/settings/general",     icon: Settings },
  { label: "Customizer",  href: "/admin/settings/customizer",  icon: User },
];

interface SidebarProps {
  userEmail?: string;
}

export function AdminSidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Lock scroll on html and body
    const html = document.documentElement;
    const body = document.body;
    
    const originalHtmlOverflow = html.style.overflow;
    const originalHtmlHeight = html.style.height;
    const originalBodyOverflow = body.style.overflow;
    const originalBodyHeight = body.style.height;

    html.style.overflow = "hidden";
    html.style.height = "100%";
    body.style.overflow = "hidden";
    body.style.height = "100%";

    return () => {
      // Restore scroll
      html.style.overflow = originalHtmlOverflow;
      html.style.height = originalHtmlHeight;
      body.style.overflow = originalBodyOverflow;
      body.style.height = originalBodyHeight;
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center h-16 px-4 border-b border-sidebar-border", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">D</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">DevFolio</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">D</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn("p-1 rounded hover:bg-sidebar-accent transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground", collapsed && "hidden")}
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center justify-center h-8 hover:bg-sidebar-accent transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {!collapsed && <p className="text-xs font-medium text-sidebar-foreground/40 px-2 mb-2 uppercase tracking-wider">Content</p>}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                collapsed && "justify-center"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && active && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
            </Link>
          );
        })}

        {!collapsed && <p className="text-xs font-medium text-sidebar-foreground/40 px-2 mt-4 mb-2 uppercase tracking-wider">Settings</p>}
        {collapsed && <div className="h-px bg-sidebar-border my-2" />}
        {SETTINGS_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                collapsed && "justify-center"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2 space-y-0.5">
        <Link
          href="/"
          target="_blank"
          title={collapsed ? "View Portfolio" : undefined}
          className={cn(
            "flex items-center gap-3 px-2 py-2 rounded-md text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors",
            collapsed && "justify-center"
          )}
        >
          <User className="h-4 w-4 shrink-0" />
          {!collapsed && <span>View Portfolio</span>}
        </Link>
        <button
          onClick={handleLogout}
          title={collapsed ? "Sign Out" : undefined}
          className={cn(
            "flex w-full items-center gap-3 px-2 py-2 rounded-md text-sm text-sidebar-foreground/60 hover:bg-destructive/20 hover:text-destructive transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        {!collapsed && userEmail && (
          <p className="text-xs text-sidebar-foreground/30 px-2 py-1 truncate">{userEmail}</p>
        )}
      </div>
    </aside>
  );
}
