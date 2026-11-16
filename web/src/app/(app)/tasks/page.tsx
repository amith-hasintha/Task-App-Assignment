import { TasksContent } from "@/components/tasks/tasks-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks — TaskFlow",
  description: "View and manage all your tasks.",
};

export default function TasksPage() {
  return <TasksContent />;
}
