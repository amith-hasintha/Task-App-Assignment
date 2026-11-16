"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiStatusIndicator } from "@/components/shared/api-status-indicator";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "All Tasks", icon: CheckSquare },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-sidebar-border select-none">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-sidebar-foreground tracking-tight">TaskFlow</span>
            <span className="text-[10px] text-sidebar-foreground/60 tracking-wider uppercase font-semibold">Workspace</span>
          </div>
        </Link>
      </div>

      <div className="px-3 py-4">
        <p className="px-3 text-[11px] font-semibold tracking-wider uppercase text-sidebar-foreground/50 mb-2">
          Navigation
        </p>
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/60")} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-sidebar-border p-4">
        <ApiStatusIndicator />
      </div>
    </aside>
  );
}
