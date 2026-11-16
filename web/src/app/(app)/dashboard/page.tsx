import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — TaskFlow",
  description: "Productivity dashboard and task analytics.",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
