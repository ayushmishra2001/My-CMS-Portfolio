"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavProps {
  name: string;
  sections: { type: string; label: string }[];
}

export function PortfolioNav({ name, sections }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setHidden(y > lastY && y > 80);
      setLastY(y);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [lastY]);

  const scrollTo = (type: string) => {
    document.getElementById(type)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const isHome = pathname === "/";
  const visibleSections = sections.filter((s) => s.type !== "blog_posts");
  const hasBlog = sections.some((s) => s.type === "blog_posts");

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/90 backdrop-blur-md border-b border-border shadow-sm" : "bg-transparent",
        hidden ? "-translate-y-full" : "translate-y-0"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-sm tracking-tight hover:text-primary transition-colors">
          {name}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {visibleSections.map((s) => (
            isHome ? (
              <button
                key={s.type}
                onClick={() => scrollTo(s.type)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {s.label}
              </button>
            ) : (
              <Link
                key={s.type}
                href={`/#${s.type}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {s.label}
              </Link>
            )
          ))}
          {hasBlog && (
            <Link
              href="/blog"
              className={cn(
                "text-sm font-semibold transition-colors",
                pathname.startsWith("/blog") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Blog
            </Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <nav className="flex flex-col px-6 py-4 gap-4">
            {visibleSections.map((s) => (
              isHome ? (
                <button
                  key={s.type}
                  onClick={() => scrollTo(s.type)}
                  className="text-sm text-left text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  {s.label}
                </button>
              ) : (
                <Link
                  key={s.type}
                  href={`/#${s.type}`}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-left text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  {s.label}
                </Link>
              )
            ))}
            {hasBlog && (
              <Link
                href="/blog"
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "text-sm font-semibold transition-colors",
                  pathname.startsWith("/blog") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Blog
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
