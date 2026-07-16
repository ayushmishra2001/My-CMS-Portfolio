"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface NavProps {
  name: string;
  sections: { type: string; label: string }[];
}

export function PortfolioNav({ name, sections }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

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
    <div className="flex justify-center w-full relative z-50">
      <header
        className={cn(
          "fixed top-4 w-[98%] max-w-[1300px] z-50 transition-transform duration-300 bg-background/80 backdrop-blur-md border border-border/50 rounded-pill shadow-sm",
          hidden ? "-translate-y-[150%]" : "translate-y-0"
        )}
      >
        <div className="px-6 h-[60px] flex items-center justify-between gap-4">
        <Link href="/" className="font-mono text-[11px] md:text-[12px] uppercase tracking-mono-wide font-bold text-foreground hover:text-verge-link transition-colors shrink-0 truncate max-w-[120px] md:max-w-none">
          {name}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden xl:flex items-center gap-3 2xl:gap-5 h-full flex-1 justify-center overflow-hidden px-2">
          {visibleSections.map((s) => (
            isHome ? (
              <button
                key={s.type}
                onClick={() => scrollTo(s.type)}
                className="font-mono text-[9px] xl:text-[10px] uppercase tracking-mono-wide text-foreground hover:text-verge-link transition-colors h-full flex items-center px-1 shrink-0 whitespace-nowrap"
              >
                {s.label}
              </button>
            ) : (
              <Link
                key={s.type}
                href={`/#${s.type}`}
                className="font-mono text-[9px] xl:text-[10px] uppercase tracking-mono-wide text-foreground hover:text-verge-link transition-colors h-full flex items-center px-1 shrink-0 whitespace-nowrap"
              >
                {s.label}
              </Link>
            )
          ))}
          {hasBlog && (
              <Link
              href="/blog"
              className={cn(
                "font-mono text-[9px] xl:text-[10px] uppercase tracking-mono-wide transition-colors h-full flex items-center px-1 shrink-0 whitespace-nowrap",
                pathname.startsWith("/blog") 
                  ? "text-foreground shadow-[0px_-2px_0px_0px_inset_var(--verge-mint)]" 
                  : "text-foreground hover:text-verge-link"
              )}
            >
              Blog
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-accent/10 transition-colors text-foreground"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
            ) : (
              <div className="h-4 w-4" />
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            className="xl:hidden p-2 text-foreground hover:text-verge-link transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col px-6 py-6 gap-5">
            {visibleSections.map((s) => (
              isHome ? (
                <button
                  key={s.type}
                  onClick={() => scrollTo(s.type)}
                  className="font-mono text-sm uppercase tracking-mono-wide text-left text-foreground hover:text-verge-link transition-colors"
                >
                  {s.label}
                </button>
              ) : (
                <Link
                  key={s.type}
                  href={`/#${s.type}`}
                  onClick={() => setMenuOpen(false)}
                  className="font-mono text-sm uppercase tracking-mono-wide text-left text-foreground hover:text-verge-link transition-colors"
                >
                  {s.label}
                </Link>
              )
            ))}
            {hasBlog && (
              <Link
                href="/blog"
                onClick={() => setMenuOpen(false)}
                className="font-mono text-sm uppercase tracking-mono-wide text-foreground hover:text-verge-link transition-colors"
              >
                Blog
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
    </div>
  );
}
