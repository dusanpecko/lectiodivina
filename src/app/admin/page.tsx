"use client";

import packageJson from "../../../package.json";
import AdminHeader from "./components/AdminHeader";
import AdminNavGrid from "./components/AdminNavGrid";
import ErrorReportsSection from "./components/ErrorReportsSection";
import SystemStatusCard from "./components/SystemStatusCard";
import TasksDashboardWidget from "./components/TasksDashboardWidget";

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

      {/* Verzia aplikácie */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-xl">🚀</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-600">Verzia aplikácie</h3>
                <p className="text-2xl font-bold text-slate-800">{packageJson.version}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium">Lectio Divina</p>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}