"use client";

import { useState } from "react";
import { Task, TaskStatus } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TaskStatusBadge } from "./task-status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Pencil,
  Trash2,
  AlertCircle,
  Copy,
  Check,
  FileText,
  Hash,
} from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { isTaskOverdue } from "./task-table";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onRefresh?: () => void;
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onRefresh,
}: TaskDetailDialogProps) {
  const [copied, setCopied] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!task) return null;

  const overdue = isTaskOverdue(task);

  const handleCopyId = () => {
    navigator.clipboard.writeText(task.id);
    setCopied(true);
    toast.success("Task ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (task.status === newStatus) return;
    setUpdatingStatus(true);
    try {
      await api.updateTask(task.id, { status: newStatus });
      toast.success(`Status changed to ${newStatus.replace("_", " ")}`);
      task.status = newStatus;
      onRefresh?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center justify-between gap-3 pr-6">
            <Select
              value={task.status}
              onValueChange={(val) => handleStatusChange(val as TaskStatus)}
              disabled={updatingStatus}
            >
              <SelectTrigger className="w-auto h-7 px-2.5 border bg-background shadow-xs gap-1.5 rounded-full">
                <TaskStatusBadge status={task.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>

            {overdue && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Overdue
              </span>
            )}
          </div>

          <DialogTitle className="text-xl font-bold tracking-tight text-foreground break-words pt-1">
            {task.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed information for task {task.title}
          </DialogDescription>
        </DialogHeader>

        {/* Overdue Alert Banner if applicable */}
        {overdue && task.dueDate && (
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>
              This task was due on{" "}
              <strong>
                {format(parseISO(task.dueDate), "MMMM d, yyyy")}
              </strong>{" "}
              ({formatDistanceToNow(parseISO(task.dueDate), { addSuffix: true })}).
            </span>
          </div>
        )}

        {/* Task Description */}
        <div className="space-y-2 py-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5" />
            Description
          </div>
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words min-h-[90px]">
            {task.description ? (
              task.description
            ) : (
              <span className="italic text-muted-foreground/60 text-xs">
                No description provided for this task.
              </span>
            )}
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 py-2 text-xs">
          {/* Due Date */}
          <div className="rounded-md border p-3 bg-card space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5" /> Due Date
            </span>
            <p
              className={cn(
                "font-semibold text-sm pt-0.5",
                overdue
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-foreground"
              )}
            >
              {task.dueDate ? (
                format(parseISO(task.dueDate), "MMM d, yyyy")
              ) : (
                <span className="text-muted-foreground font-normal">None</span>
              )}
            </p>
          </div>

          {/* Created At */}
          <div className="rounded-md border p-3 bg-card space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5" /> Created On
            </span>
            <p className="font-semibold text-sm pt-0.5 text-foreground">
              {format(new Date(task.createdAt), "MMM d, yyyy · p")}
            </p>
          </div>

          {/* Updated At */}
          <div className="rounded-md border p-3 bg-card space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5" /> Last Updated
            </span>
            <p className="font-semibold text-sm pt-0.5 text-foreground">
              {format(new Date(task.updatedAt), "MMM d, yyyy · p")}
            </p>
          </div>

          {/* Task ID with Copy */}
          <div className="rounded-md border p-3 bg-card space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Hash className="h-3.5 w-3.5" /> Task ID
            </span>
            <div className="flex items-center justify-between pt-0.5">
              <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[170px]">
                {task.id}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0 ml-1"
                onClick={handleCopyId}
                title="Copy Task ID"
                aria-label="Copy Task ID"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="pt-3 border-t flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onDelete(task);
            }}
            className="w-full sm:w-auto"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete Task
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit(task);
              }}
              className="w-full sm:w-auto"
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit Task
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
