import React from 'react';
import { Ticket, Activity, AlertCircle, CheckCircle2, Plus } from 'lucide-react';

export default function DashboardStats({ tickets, onCreateClick }) {
  // Compute counts
  const total = tickets.length;
  const openCount = tickets.filter(t => t.status === 'Open').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const closedCount = tickets.filter(t => t.status === 'Closed').length;

  // Compute resolution rate
  const resolutionRate = total > 0 ? Math.round((closedCount / total) * 100) : 0;

  // Get dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div class="space-y-6 animate-fade-in">
      {/* Welcome Banner - Clean light blue brand box */}
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-blue-50 border border-blue-100 p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div>
          <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}!
          </h1>
          <p class="text-slate-600 text-sm mt-1">
            Here's the current overview of your support ticket workspace. You have {openCount} open items requiring attention.
          </p>
        </div>

        <button
          onClick={onCreateClick}
          class="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition duration-150 shadow-sm hover:scale-[1.01] active:scale-[0.99]"
        >
          <Plus size={18} />
          Create New Ticket
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <div class="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm relative overflow-hidden">
          <div class="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <Ticket size={24} />
          </div>
          <div>
            <p class="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Tickets</p>
            <h3 class="text-2xl font-bold text-slate-900 mt-1">{total}</h3>
          </div>
        </div>

        {/* Open Tickets */}
        <div class="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm relative overflow-hidden">
          <div class="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p class="text-slate-500 text-xs font-semibold uppercase tracking-wider">Open</p>
            <h3 class="text-2xl font-bold text-amber-600 mt-1">{openCount}</h3>
          </div>

        </div>

        {/* In Progress */}
        <div class="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm relative overflow-hidden">
          <div class="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <p class="text-slate-500 text-xs font-semibold uppercase tracking-wider">In Progress</p>
            <h3 class="text-2xl font-bold text-blue-600 mt-1">{inProgressCount}</h3>
          </div>
        </div>

        {/* Closed / Resolved */}
        <div class="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm relative overflow-hidden">
          <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p class="text-slate-500 text-xs font-semibold uppercase tracking-wider">Resolved</p>
            <h3 class="text-2xl font-bold text-emerald-600 mt-1">{closedCount}</h3>
          </div>
        </div>
      </div>

      {/* Resolution Rates Progress Card */}
      <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-slate-700">Ticket Resolution Progress</span>
          <span class="text-sm font-bold text-emerald-600">{resolutionRate}% Resolved</span>
        </div>
        <div class="w-full bg-slate-100 h-2.5 rounded-md overflow-hidden border border-slate-200">
          <div
            class="bg-blue-600 h-full rounded-md transition-all duration-500 ease-out"
            style={{ width: `${resolutionRate}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
