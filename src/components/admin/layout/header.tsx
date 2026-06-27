"use client";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/shared/button";
import { useMobileSidebar } from "@/hooks/use-mobile-sidebar";

interface AdminHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, description, actions }: AdminHeaderProps) {
  const toggle = useMobileSidebar((state) => state.toggle);

  return (
    <div className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-border bg-background shrink-0">
      <div className="flex items-center min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mr-2 md:hidden text-muted-foreground hover:text-foreground shrink-0"
          onClick={toggle}
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="truncate">
          <h1 className="text-sm md:text-base font-semibold text-foreground truncate">{title}</h1>
          {description && <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 truncate">{description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {actions}
        <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
