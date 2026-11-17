"use client";

import { useState } from "react";
import { Task, TaskStatus } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { TaskStatusBadge } from "./task-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pencil,
  Trash2,
  CheckSquare,
  AlertCircle,
  Calendar,
  Clock,
  Eye,
} from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaskTableProps {
  tasks: Task[];
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onView?: (task: Task) => void;
  onRefresh: () => void;
}

export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === "DONE") return false;
  try {
    return isPast(parseISO(task.dueDate));
  } catch {
    return false;
  }
}

export function TaskTable({
  tasks,
  loading,
  onEdit,
  onDelete,
  onView,
  onRefresh,
}: TaskTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleQuickStatusChange = async (task: Task, newStatus: TaskStatus) => {
    if (task.status === newStatus) return;
    setUpdatingId(task.id);
    try {
      await api.updateTask(task.id, { status: newStatus });
      toast.success(`Task moved to ${newStatus.replace("_", " ")}`);
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No tasks found"
        description="There are no tasks matching your current filters. Create a new task or adjust your search criteria."
      />
    );
  }

  return (
    <TooltipProvider>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[30%]">Task Title</TableHead>
              <TableHead className="w-[28%]">Description</TableHead>
              <TableHead className="w-[14%]">Status</TableHead>
              <TableHead className="w-[14%]">Due Date</TableHead>
              <TableHead className="w-[14%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const overdue = isTaskOverdue(task);
              const isUpdating = updatingId === task.id;

              return (
                <TableRow
                  key={task.id}
                  onClick={() => onView?.(task)}
                  className={cn(
                    "transition-colors group cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/30",
                    overdue && "bg-rose-50/40 dark:bg-rose-950/20"
                  )}
                  title="Click to view full details"
                >
                  {/* Title & Overdue Warning */}
                  <TableCell className="font-medium align-middle">
                    <div className="flex items-center gap-2">
                      {overdue && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center text-rose-500">
                              <AlertCircle className="h-4 w-4 shrink-0" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            Overdue task!
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <span className="truncate max-w-[280px] font-semibold text-foreground group-hover:text-primary transition-colors">
                        {task.title}
                      </span>
                    </div>
                  </TableCell>

                  {/* Description */}
                  <TableCell className="align-middle">
                    {task.description ? (
                      <span className="line-clamp-1 text-sm text-muted-foreground">
                        {task.description}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50 italic">
                        No description
                      </span>
                    )}
                  </TableCell>

                  {/* Quick Status Dropdown (stops propagation so row click isn't triggered) */}
                  <TableCell className="align-middle" onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={task.status}
                      onValueChange={(val) =>
                        handleQuickStatusChange(task, val as TaskStatus)
                      }
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-auto h-7 px-2 border-0 bg-transparent hover:bg-muted/80 shadow-none focus:ring-0 gap-1.5">
                        <TaskStatusBadge status={task.status} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Due Date */}
                  <TableCell className="align-middle">
                    {task.dueDate ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar className={cn("h-3.5 w-3.5", overdue ? "text-rose-500" : "text-muted-foreground")} />
                        <span
                          className={cn(
                            "text-xs font-medium",
                            overdue
                              ? "text-rose-600 dark:text-rose-400 font-semibold"
                              : "text-muted-foreground"
                          )}
                        >
                          {format(parseISO(task.dueDate), "MMM d, yyyy")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/50 italic">—</span>
                    )}
                  </TableCell>

                  {/* Actions (stops propagation so row click isn't triggered) */}
                  <TableCell className="text-right align-middle" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              onView?.(task);
                            }}
                            aria-label="View task details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View details</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(task);
                            }}
                            aria-label="Edit task"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit task</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(task);
                            }}
                            aria-label="Delete task"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete task</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3 p-3">
        {tasks.map((task) => {
          const overdue = isTaskOverdue(task);
          return (
            <div
              key={task.id}
              onClick={() => onView?.(task)}
              className={cn(
                "rounded-lg border bg-card p-4 space-y-3 shadow-xs cursor-pointer hover:border-primary/50 transition-colors group",
                overdue && "border-rose-300 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {overdue && (
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  )}
                  <h3 className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                    {task.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView?.(task);
                    }}
                    aria-label="View task details"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(task);
                    }}
                    aria-label="Edit task"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(task);
                    }}
                    aria-label="Delete task"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}

              <div
                className="flex items-center justify-between pt-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Select
                  value={task.status}
                  onValueChange={(val) =>
                    handleQuickStatusChange(task, val as TaskStatus)
                  }
                  disabled={updatingId === task.id}
                >
                  <SelectTrigger className="w-auto h-7 px-2 border-0 bg-transparent p-0">
                    <TaskStatusBadge status={task.status} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>

                {task.dueDate && (
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className={cn("h-3 w-3", overdue ? "text-rose-500" : "text-muted-foreground")} />
                    <span
                      className={cn(
                        overdue
                          ? "text-rose-600 dark:text-rose-400 font-semibold"
                          : "text-muted-foreground"
                      )}
                    >
                      {format(parseISO(task.dueDate), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
