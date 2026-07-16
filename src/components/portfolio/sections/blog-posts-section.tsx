"use client";
import { useEffect, useState } from "react";
import { Section, BlogPost } from "@/lib/types";
import { SectionWrapper, SectionHeading } from "../shared/section-wrapper";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div 
            key={post.id} 
            className="flex flex-col bg-background p-6 md:p-8 rounded-pill border border-border hover:border-verge-link transition-colors duration-300 group"
          >
            <div className="font-mono text-[11px] md:text-[12px] uppercase tracking-mono-wide text-verge-mint mb-2 flex justify-between">
              <span>ARTICLE</span>
              {showDate && post.published_at && (
                <span className="text-muted-foreground">
                  {new Date(post.published_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
            </div>

            <h3 className="font-sans text-[20px] md:text-[24px] font-bold leading-tight group-hover:text-verge-link transition-colors mt-2 mb-4">
              {post.title}
            </h3>

            {post.excerpt && (
              <p className="font-sans text-[13px] md:text-[16px] font-medium leading-relaxed text-foreground/80 mb-6 flex-grow">
                {post.excerpt}
              </p>
            )}

            <div className="mt-auto pt-4 border-t border-border/20">
              <Link
                href={`/blog/${post.slug}`}
                className="font-mono text-[12px] font-semibold uppercase tracking-mono-norm text-foreground hover:text-verge-link transition-colors flex items-center gap-1"
              >
                READ ARTICLE ↗
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/blog"
          className="bg-verge-slate text-[#e9e9e9] font-sans text-[16px] font-normal px-[24px] py-[10px] rounded-feature text-center transition-all hover:bg-white/20 hover:text-black hover:shadow-[0_0_0_1px_#c2c2c2] uppercase"
        >
          VIEW ALL ARTICLES
        </Link>
      </div>
    </SectionWrapper>
  );
}
