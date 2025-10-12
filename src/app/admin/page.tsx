"use client";

import TasksDashboardWidget from "./components/TasksDashboardWidget";
import AdminHeader from "./components/AdminHeader";
import AdminNavGrid from "./components/AdminNavGrid";
import ErrorReportsSection from "./components/ErrorReportsSection";
import SystemStatusCard from "./components/SystemStatusCard";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Hlavička */}
      <AdminHeader />

      {/* Hlavné sekcie */}
      <AdminNavGrid />

      {/* Tasks Dashboard - Moje úlohy a upozornenia */}
      <TasksDashboardWidget />

      {/* Error Reports - Samostatná sekcia s upozornením */}
      <ErrorReportsSection />

      {/* Systémové info - jednoduché */}
      <SystemStatusCard />
    </div>
  );
}