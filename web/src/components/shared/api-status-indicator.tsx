"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ApiStatusIndicator() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");
  const [dbStatus, setDbStatus] = useState<string>("unknown");

  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        const res = await api.getHealth();
        if (isMounted) {
          setStatus(res.status === "ok" ? "online" : "offline");
          setDbStatus(res.database || "connected");
        }
      } catch {
        if (isMounted) {
          setStatus("offline");
          setDbStatus("disconnected");
        }
      }
    };

    checkHealth();
    // Check every 30 seconds to prevent unnecessary frequent health requests
    const interval = setInterval(checkHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs text-sidebar-foreground/75">
      <div
        className={cn("h-2 w-2 rounded-full", {
          "bg-yellow-400 animate-pulse": status === "checking",
          "bg-emerald-400": status === "online",
          "bg-rose-400": status === "offline",
        })}
      />
      <span>
        {status === "checking"
          ? "Connecting..."
          : status === "online"
          ? `API Online (${dbStatus})`
          : "API Offline"}
      </span>
    </div>
  );
}
