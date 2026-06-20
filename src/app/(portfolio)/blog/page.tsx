import { createClient } from "@/lib/supabase/server";
import { BlogPost } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 60; // ISR

export default async function BlogFeedPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  const blogPosts = (posts ?? []) as BlogPost[];

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 min-h-screen">
      <div className="space-y-4 mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Articles & Insights</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto font-light">
          Thoughts, tutorials, and deep-dives on development, design, and technology.
        </p>
      </div>

      {blogPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {blogPosts.map((post) => (
            <article key={post.id} className="group flex flex-col bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 h-full">
              {post.cover_image && (
                <Link href={`/blog/${post.slug}`} className="relative aspect-[16/9] w-full block overflow-hidden bg-muted border-b">
                  <Image
                    src={post.cover_image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                </Link>
              )}
              <div className="p-6 flex flex-col flex-1">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-2 block">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                    : "Draft"}
                </span>
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-xl font-bold hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h2>
                </Link>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-3 leading-relaxed flex-1">
                    {post.excerpt}
                  </p>
                )}
                <div className="pt-6 mt-auto">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
                  >
                    Read article →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed rounded-2xl space-y-3 bg-muted/10">
          <p className="text-lg font-semibold text-muted-foreground">No articles published yet</p>
          <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">
            Check back later or check out the portfolio sections above!
          </p>
        </div>
      )}
    </div>
  );
}
