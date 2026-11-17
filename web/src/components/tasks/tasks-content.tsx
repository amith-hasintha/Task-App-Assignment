"use client";

import { useState, useEffect } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useDebounce } from "@/hooks/use-debounce";
import { TaskTable } from "./task-table";
import { TaskFormDialog } from "./task-form-dialog";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { TaskDetailDialog } from "./task-detail-dialog";
import { TaskFilters } from "./task-filters";
import { TaskSearch } from "./task-search";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { Task } from "@/types";

export function TasksContent() {
  const { tasks, loading, error, params, updateParams, setPage, refresh } =
    useTasks({ page: 1, limit: 10 });

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 350);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  // Sync debounced search with query params
  useEffect(() => {
    updateParams({ search: debouncedSearch.trim() || undefined });
  }, [debouncedSearch, updateParams]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage, organize, and track your daily tasks and deliverables. Click any row to view complete details.
          </p>
        </div>

        <Button
          onClick={() => setCreateOpen(true)}
          className="shadow-sm w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* API Error Alert */}
      {error && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="h-8 border-destructive/30 hover:bg-destructive/20 text-destructive"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <TaskFilters
          status={params.status}
          sortDueDate={params.sortDueDate}
          onStatusChange={(status) => updateParams({ status })}
          onSortChange={(sortDueDate) => updateParams({ sortDueDate })}
        />

        <TaskSearch value={searchInput} onChange={setSearchInput} />
      </div>

      {/* Task Table Container */}
      <div className="rounded-lg border bg-card shadow-xs overflow-hidden">
        <TaskTable
          tasks={tasks?.data ?? []}
          loading={loading}
          onView={(task) => setViewingTask(task)}
          onEdit={(task) => setEditingTask(task)}
          onDelete={(task) => setDeletingTask(task)}
          onRefresh={refresh}
        />

        {/* Server-Side Pagination */}
        {tasks && tasks.total > 0 && (
          <div className="border-t px-4 py-3 bg-card">
            <Pagination
              page={tasks.page}
              totalPages={tasks.totalPages}
              total={tasks.total}
              limit={tasks.limit}
              onPageChange={setPage}
              onLimitChange={(limit) => updateParams({ limit })}
            />
          </div>
        )}
      </div>

      {/* Task Detail Dialog (View Task Fully) */}
      <TaskDetailDialog
        task={viewingTask}
        open={Boolean(viewingTask)}
        onOpenChange={(open) => !open && setViewingTask(null)}
        onEdit={(task) => setEditingTask(task)}
        onDelete={(task) => setDeletingTask(task)}
        onRefresh={refresh}
      />

      {/* Create Dialog */}
      <TaskFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={refresh}
      />

      {/* Edit Dialog */}
      <TaskFormDialog
        open={Boolean(editingTask)}
        onOpenChange={(open) => !open && setEditingTask(null)}
        task={editingTask}
        onSuccess={refresh}
      />

      {/* Delete Confirmation AlertDialog */}
      <DeleteTaskDialog
        open={Boolean(deletingTask)}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        task={deletingTask}
        onSuccess={refresh}
      />
    </div>
  );
}
