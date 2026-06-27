import { createClient } from "@/lib/supabase/server";
import { BlogPost } from "@/lib/types";
import { notFound } from "next/navigation";
import { marked } from "marked";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("is_published", true)
    .eq("is_visible", true)
    .single();

  if (!post) return {};

  return {
    title: `${post.title} | DevFolio Blog`,
    description: post.excerpt || "",
  };
}

export default async function BlogPostDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .eq("is_visible", true)
    .single();

  const post = data as BlogPost | null;

  if (!post) {
    notFound();
  }

  // Parse markdown content to HTML
  const contentHtml = await marked.parse(post.content || "");

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 min-h-screen">
      {/* Back button */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to articles
      </Link>

      {/* Article Header */}
      <header className="space-y-6 mb-12">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Calendar className="h-4 w-4" />
          <span>
            {post.published_at
              ? new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
              : "Draft"}
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-lg text-muted-foreground font-light leading-relaxed">
            {post.excerpt}
          </p>
        )}
      </header>

      {/* Cover Image */}
      {post.cover_image && (
        <div className="relative aspect-[21/9] w-full rounded-2xl border overflow-hidden mb-12 bg-muted">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <article className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
        <div
          dangerouslySetInnerHTML={{ __html: contentHtml }}
          className="markdown-body space-y-4 text-foreground/90"
        />
      </article>
    </div>
  );
}
