"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Task, DashboardStats, TaskStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog";
import { DeleteTaskDialog } from "@/components/tasks/delete-task-dialog";
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

function computeStats(tasks: Task[]): DashboardStats {
  return {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "TODO").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    done: tasks.filter((t) => t.status === "DONE").length,
    overdue: tasks.filter((t) => {
      if (!t.dueDate || t.status === "DONE") return false;
      try {
        return isPast(parseISO(t.dueDate));
      } catch {
        return false;
      }
    }).length,
  };
}

export function DashboardContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch recent dataset for real statistics
      const res = await api.getTasks({ limit: 100 });
      setTasks(res.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data. Ensure the API is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const stats = computeStats(tasks);
  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const statCards = [
    {
      title: "Total Tasks",
      value: stats.total,
      description: "Across all statuses",
      icon: TrendingUp,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      title: "To Do",
      value: stats.todo,
      description: "Pending commencement",
      icon: Clock,
      color: "text-slate-600 dark:text-slate-400",
      bgColor: "bg-slate-100 dark:bg-slate-800",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      description: "Currently active",
      icon: TrendingUp,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
    },
    {
      title: "Completed",
      value: stats.done,
      description: "Successfully resolved",
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      title: "Overdue",
      value: stats.overdue,
      description: "Requires attention",
      icon: AlertCircle,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-950/40",
    },
  ];

  const distribution = [
    {
      label: "To Do",
      count: stats.todo,
      percentage: stats.total > 0 ? Math.round((stats.todo / stats.total) * 100) : 0,
      barClass: "bg-slate-500",
    },
    {
      label: "In Progress",
      count: stats.inProgress,
      percentage:
        stats.total > 0
          ? Math.round((stats.inProgress / stats.total) * 100)
          : 0,
      barClass: "bg-blue-600",
    },
    {
      label: "Completed",
      count: stats.done,
      percentage: stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0,
      barClass: "bg-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time activity and productivity metrics for your projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTasks}
            disabled={loading}
            className="h-9"
          >
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="h-9">
            <Plus className="mr-1.5 h-4 w-4" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTasks}
            className="h-8 border-destructive/30 hover:bg-destructive/20 text-destructive"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="shadow-xs hover:border-sidebar-ring/40 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {card.title}
                </CardTitle>
                <div className={cn("p-1.5 rounded-md", card.bgColor)}>
                  <Icon className={cn("h-4 w-4", card.color)} />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">
                    {card.value}
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks List */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between p-5 pb-3">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Tasks
              </CardTitle>
              <CardDescription className="text-xs">
                Click any task to view full details
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="h-8 text-xs gap-1 text-primary">
              <Link href="/tasks">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : recentTasks.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">No tasks yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create your first task to get started!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentTasks.map((task) => {
                  const overdue =
                    task.dueDate &&
                    task.status !== "DONE" &&
                    isPast(parseISO(task.dueDate));

                  return (
                    <div
                      key={task.id}
                      onClick={() => setViewingTask(task)}
                      className={cn(
                        "flex items-center justify-between py-3 gap-3 first:pt-0 last:pb-0 cursor-pointer rounded-md px-2 -mx-2 hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors group",
                        overdue && "bg-rose-50/30 dark:bg-rose-950/10"
                      )}
                      title="Click to view full details"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {overdue && (
                            <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                          )}
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {task.title}
                          </p>
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                            <Calendar className="h-3 w-3" />
                            <span className={cn(overdue && "text-rose-600 dark:text-rose-400 font-semibold")}>
                              Due {format(parseISO(task.dueDate), "MMM d, yyyy")}
                            </span>
                          </div>
                        )}
                      </div>
                      <TaskStatusBadge
                        status={task.status as TaskStatus}
                        className="shrink-0"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution Progress */}
        <Card className="shadow-xs">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base font-semibold">
              Status Distribution
            </CardTitle>
            <CardDescription className="text-xs">
              Breakdown across your workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : stats.total === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                Add tasks to see status analytics.
              </p>
            ) : (
              <div className="space-y-4 pt-1">
                {distribution.map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{item.label}</span>
                      <span className="text-muted-foreground">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn("h-full transition-all duration-500", item.barClass)}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}

                {/* Overdue highlight card */}
                {stats.overdue > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-center gap-2.5">
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <p className="text-xs text-rose-700 dark:text-rose-300">
                      <strong>{stats.overdue}</strong> task
                      {stats.overdue > 1 ? "s are" : " is"} currently overdue.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Task Detail Dialog (View Task Fully) */}
      <TaskDetailDialog
        task={viewingTask}
        open={Boolean(viewingTask)}
        onOpenChange={(open) => !open && setViewingTask(null)}
        onEdit={(task) => setEditingTask(task)}
        onDelete={(task) => setDeletingTask(task)}
        onRefresh={fetchTasks}
      />

      {/* Reusable Create Task Dialog */}
      <TaskFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchTasks}
      />

      {/* Edit Dialog */}
      <TaskFormDialog
        open={Boolean(editingTask)}
        onOpenChange={(open) => !open && setEditingTask(null)}
        task={editingTask}
        onSuccess={fetchTasks}
      />

      {/* Delete Confirmation AlertDialog */}
      <DeleteTaskDialog
        open={Boolean(deletingTask)}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        task={deletingTask}
        onSuccess={fetchTasks}
      />
    </div>
  );
}
