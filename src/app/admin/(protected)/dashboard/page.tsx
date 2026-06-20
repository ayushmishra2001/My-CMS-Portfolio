import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/form-elements";
import { FolderOpen, Zap, Briefcase, Eye, MessageSquare, TrendingUp, Compass } from "lucide-react";
import Link from "next/link";

interface Stats {
  projects: number;
  skills: number;
  experience: number;
  unreadMessages: number;
  visibleSections: number;
  totalSections: number;
}

interface DailyView {
  label: string;
  count: number;
}

interface TopPage {
  path: string;
  count: number;
}

async function getStats(supabase: Awaited<ReturnType<typeof createClient>>): Promise<Stats> {
  const [projects, skills, experience, messages, sections] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact" }),
    supabase.from("skills").select("id", { count: "exact" }),
    supabase.from("experience").select("id", { count: "exact" }),
    supabase.from("contact_messages").select("id", { count: "exact" }).eq("is_read", false),
    supabase.from("sections").select("id, is_visible", { count: "exact" }),
  ]);
  return {
    projects: projects.count ?? 0,
    skills: skills.count ?? 0,
    experience: experience.count ?? 0,
    unreadMessages: messages.count ?? 0,
    visibleSections: sections.data?.filter((s) => s.is_visible).length ?? 0,
    totalSections: sections.count ?? 0,
  };
}

async function getAnalytics(supabase: Awaited<ReturnType<typeof createClient>>) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: events } = await supabase
    .from("analytics_events")
    .select("created_at, path")
    .gte("created_at", sevenDaysAgo.toISOString());

  const data = events ?? [];

  // 1. Group daily views
  const dailyMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    dailyMap.set(label, 0);
  }

  // 2. Aggregate counts
  data.forEach((evt) => {
    const dateStr = new Date(evt.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (dailyMap.has(dateStr)) {
      dailyMap.set(dateStr, (dailyMap.get(dateStr) ?? 0) + 1);
    }
  });

  const dailyViews: DailyView[] = Array.from(dailyMap.entries()).map(([label, count]) => ({
    label,
    count,
  }));

  // 3. Top pages
  const pageMap = new Map<string, number>();
  data.forEach((evt) => {
    pageMap.set(evt.path, (pageMap.get(evt.path) ?? 0) + 1);
  });

  const topPages: TopPage[] = Array.from(pageMap.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const totalPageViews = data.length;

  return { dailyViews, topPages, totalPageViews };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const stats = await getStats(supabase);
  const analytics = await getAnalytics(supabase);

  const STAT_CARDS = [
    { label: "Projects",          value: stats.projects,        icon: FolderOpen, href: "/admin/projects",  color: "text-blue-500" },
    { label: "Skills",            value: stats.skills,          icon: Zap,        href: "/admin/skills",    color: "text-amber-500" },
    { label: "Experience",        value: stats.experience,      icon: Briefcase,  href: "/admin/experience",color: "text-green-500" },
    { label: "Visible Sections",  value: `${stats.visibleSections}/${stats.totalSections}`, icon: Eye, href: "/admin/sections", color: "text-purple-500" },
    { label: "Unread Messages",   value: stats.unreadMessages,  icon: MessageSquare, href: "/admin/contact-settings", color: "text-rose-500" },
  ];

  const QUICK_LINKS = [
    { label: "Add Project",       href: "/admin/projects/new" },
    { label: "Add Skill",         href: "/admin/skills" },
    { label: "Add Experience",    href: "/admin/experience" },
    { label: "Manage Sections",   href: "/admin/sections" },
    { label: "Site Settings",     href: "/admin/settings/general" },
    { label: "View Portfolio",    href: "/", target: "_blank" },
  ];

  const maxDailyCount = Math.max(...analytics.dailyViews.map((d) => d.count), 1);

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <AdminHeader
        title="Dashboard"
        description={`Welcome back, ${user?.email?.split("@")[0] ?? "admin"}`}
      />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {STAT_CARDS.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Analytics Charts */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Daily Views Bar Chart */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Traffic (Last 7 Days)
              </CardTitle>
              <span className="text-xs text-muted-foreground font-medium">
                {analytics.totalPageViews} total views
              </span>
            </CardHeader>
            <CardContent>
              <div className="flex h-44 items-end gap-3 pt-6 px-2">
                {analytics.dailyViews.map((day) => {
                  const heightPct = (day.count / maxDailyCount) * 80; // Scale to 80% max height
                  return (
                    <div key={day.label} className="flex-1 flex flex-col items-center gap-1.5 group">
                      {/* Tooltip popup */}
                      <span className="text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground px-1.5 py-0.5 rounded border border-border shadow-sm">
                        {day.count}
                      </span>
                      {/* Interactive Bar */}
                      <div
                        className="w-full bg-primary/20 hover:bg-primary rounded-t transition-all duration-300 min-h-[4px]"
                        style={{ height: `${Math.max(heightPct, 4)}px` }}
                      />
                      {/* Label */}
                      <span className="text-[10px] text-muted-foreground mt-1 text-center truncate w-full">
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Pages Leaderboard */}
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" />
                Top Pages
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-4">
                {analytics.topPages.map((page, idx) => (
                  <div key={page.path} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-semibold text-muted-foreground w-4 text-center">{idx + 1}</span>
                      <span className="font-mono truncate bg-muted/40 px-1.5 py-0.5 rounded">{page.path}</span>
                    </div>
                    <span className="font-medium text-muted-foreground shrink-0">{page.count} views</span>
                  </div>
                ))}
                {analytics.topPages.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">No visits recorded yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick links */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  target={(link as { target?: string }).target}
                  className="flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm hover:bg-accent hover:border-primary/50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
