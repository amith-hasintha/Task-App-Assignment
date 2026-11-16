"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskFiltersProps {
  status: string | undefined;
  sortDueDate: "asc" | "desc" | undefined;
  onStatusChange: (status: string | undefined) => void;
  onSortChange: (sort: "asc" | "desc" | undefined) => void;
}

const statusOptions = [
  { value: "ALL", label: "All Status" },
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

const sortOptions = [
  { value: "none", label: "Default Order (Newest)" },
  { value: "asc", label: "Due Date: Earliest first" },
  { value: "desc", label: "Due Date: Latest first" },
];

export function TaskFilters({
  status,
  sortDueDate,
  onStatusChange,
  onSortChange,
}: TaskFiltersProps) {
  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      {/* Status Filter (Bonus 1) */}
      <Select
        value={status ?? "ALL"}
        onValueChange={(val) => onStatusChange(val === "ALL" ? undefined : val)}
      >
        <SelectTrigger className="w-[145px] h-9 text-xs sm:text-sm font-medium">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Due Date Sort (Bonus 2) */}
      <Select
        value={sortDueDate ?? "none"}
        onValueChange={(val) =>
          onSortChange(val === "none" ? undefined : (val as "asc" | "desc"))
        }
      >
        <SelectTrigger className="w-[185px] h-9 text-xs sm:text-sm font-medium">
          <SelectValue placeholder="Sort by Due Date" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
