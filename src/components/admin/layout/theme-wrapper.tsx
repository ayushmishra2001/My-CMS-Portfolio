"use client";
import { createContext, useContext, useEffect, useState } from "react";

const AdminThemeContext = createContext<{
  theme: "light" | "dark";
  toggleTheme: () => void;
}>({ theme: "dark", toggleTheme: () => {} });

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}

export function AdminThemeWrapper({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("admin-theme", next);
  };

  if (!mounted) {
    return (
      <AdminThemeContext.Provider value={{ theme: "dark", toggleTheme }}>
        <div className="flex h-screen overflow-hidden bg-background dark text-foreground">
          {children}
        </div>
      </AdminThemeContext.Provider>
    );
  }

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`flex h-screen overflow-hidden bg-background ${theme} text-foreground`}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}
