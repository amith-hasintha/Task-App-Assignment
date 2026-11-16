import { Badge } from "@/components/ui/badge";
import { TaskStatus } from "@/types";
import { cn } from "@/lib/utils";

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const statusConfig: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  TODO: {
    label: "To Do",
    className:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-medium",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 font-medium",
  },
  DONE: {
    label: "Done",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-medium",
  },
};

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.TODO;
  return (
    <Badge variant="outline" className={cn(config.className, "text-xs px-2.5 py-0.5", className)}>
      {config.label}
    </Badge>
  );
}
