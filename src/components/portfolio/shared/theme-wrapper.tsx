"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext<{
  theme: "light" | "dark";
  toggleTheme: () => void;
}>({ theme: "dark", toggleTheme: () => {} });

export function usePortfolioTheme() {
  return useContext(ThemeContext);
}

export function PortfolioThemeWrapper({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("portfolio-theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("portfolio-theme", next);
  };

  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: "dark", toggleTheme }}>
        <div className="min-h-screen text-foreground bg-background dark font-sans overflow-x-hidden relative">
          {children}
        </div>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`min-h-screen text-foreground bg-background ${theme} font-sans overflow-x-hidden relative`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
