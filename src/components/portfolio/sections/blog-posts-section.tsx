"use client";
import { useEffect, useState } from "react";
import { Section, BlogPost } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";

interface Props { section: Section; settings: Record<string, unknown>; }

export function BlogPostsSection({ section, settings: _ }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const content = section.content as Record<string, unknown>;
  const maxItems = Number(content.max_items) || 3;
  const showDate = content.show_date !== false;

  useEffect(() => {
    createClient()
      .from("posts")
      .select("*")
      .eq("is_published", true)
      .eq("is_visible", true)
      .order("published_at", { ascending: false })
      .limit(maxItems)
      .then(({ data }) => setPosts((data as BlogPost[]) ?? []));
  }, [maxItems]);

  if (posts.length === 0) return null;

  return (
    <SectionWrapper section={section}>
      <SectionHeading title={section.label} subtitle={section.subtitle} />
      <div className="border border-border bg-background transition-colors duration-300 w-full flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="bg-background p-6 flex flex-col justify-between min-h-[220px] font-mono hover:bg-accent/5 transition-colors duration-300"
            >
              <div>
                <div className="flex justify-between items-start text-[9px] text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border/30">
                  <span>[ ARTICLE ]</span>
                  {showDate && post.published_at && (
                    <span>
                      {new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-foreground uppercase tracking-tight line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed font-light font-sans">
                    {post.excerpt}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-border/20 flex justify-end">
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 uppercase tracking-widest"
                >
                  Read Article <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button Cell */}
        <div className="border-t border-border bg-accent/5 p-6 flex justify-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 p-3 px-6 border border-border bg-background text-xs font-mono uppercase text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <BookOpen className="h-3.5 w-3.5" />
            View All Articles
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}
