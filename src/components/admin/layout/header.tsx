"use client";
import { Bell } from "lucide-react";
import { Button } from "@/components/shared/button";

interface AdminHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, description, actions }: AdminHeaderProps) {
  return (
    <div className="flex items-center justify-between h-16 px-6 border-b border-border bg-background shrink-0">
      <div>
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
