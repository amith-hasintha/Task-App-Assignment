"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { taskSchema, TaskFormValues } from "@/lib/validations/task";
import { api } from "@/lib/api";
import { Task, TaskStatus } from "@/types";
import { Loader2 } from "lucide-react";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSuccess: () => void;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  onSuccess,
}: TaskFormDialogProps) {
  const isEditing = Boolean(task);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      dueDate: null,
    },
  });

  useEffect(() => {
    if (open) {
      if (task) {
        reset({
          title: task.title,
          description: task.description || "",
          status: task.status,
          dueDate: task.dueDate ? task.dueDate.substring(0, 10) : null,
        });
      } else {
        reset({
          title: "",
          description: "",
          status: "TODO",
          dueDate: null,
        });
      }
    }
  }, [open, task, reset]);

  const onSubmit = async (data: TaskFormValues) => {
    try {
      const payload = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        status: data.status as TaskStatus,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      };

      if (isEditing && task) {
        await api.updateTask(task.id, {
          title: payload.title,
          description: payload.description,
          status: payload.status,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        });
        toast.success("Task updated successfully");
      } else {
        await api.createTask(payload);
        toast.success("Task created successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save task"
      );
    }
  };

  const statusValue = watch("status");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Make changes to your task details below."
              : "Add a new task to your workspace. Fill in the required details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Implement user authentication"
              {...register("title")}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-xs text-destructive font-medium">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-xs text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Add additional context, acceptance criteria, or notes..."
              rows={3}
              {...register("description")}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-xs text-destructive font-medium">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <Select
                value={statusValue}
                onValueChange={(val) =>
                  setValue("status", val as "TODO" | "IN_PROGRESS" | "DONE")
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label htmlFor="dueDate" className="text-sm font-medium">
                Due Date <span className="text-xs text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="dueDate"
                type="date"
                {...register("dueDate")}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
