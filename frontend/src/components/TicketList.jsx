import React from 'react';
import { Search, Inbox } from 'lucide-react';

export default function TicketList({
  tickets,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onTicketClick
}) {
  // Format ISO timestamps beautifully
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Helper for status badge styling
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Closed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Helper for status dot color
  const getStatusDotColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-amber-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Closed': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-fade-in">
      {/* List Header controls (Search & Filter) */}
      <div class="p-6 border-b border-slate-200 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        {/* Search Input */}
        <div class="relative flex-1 max-w-md">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across names, emails, IDs, issues..."
            class="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div class="flex p-1 bg-slate-100 border border-slate-200 rounded-xl max-w-xs md:max-w-none">
          {['All', 'Open', 'In Progress', 'Closed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              class={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div class="overflow-x-auto w-full">
        {tickets.length === 0 ? (
          /* Empty State */
          <div class="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400">
              <Inbox size={40} />
            </div>
            <div>
              <h4 class="text-slate-800 font-bold text-lg">No support tickets found</h4>
              <p class="text-slate-500 text-sm mt-1 max-w-sm">
                Try widening your search terms or changing your status filter settings.
              </p>
            </div>
          </div>
        ) : (
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <th class="py-4 px-6">Ticket ID</th>
                <th class="py-4 px-6">Customer</th>
                <th class="py-4 px-6">Subject / Issue</th>
                <th class="py-4 px-6">Status</th>
                <th class="py-4 px-6 text-right">Date Created</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <tr
                  key={ticket.ticket_id}
                  onClick={() => onTicketClick(ticket.ticket_id)}
                  class="hover:bg-slate-50/80 cursor-pointer transition duration-150 group"
                >
                  {/* Ticket ID */}
                  <td class="py-4 px-6 text-sm font-semibold text-blue-600 group-hover:text-blue-700 tracking-wider">
                    {ticket.ticket_id}
                  </td>
                  
                  {/* Customer Info */}
                  <td class="py-4 px-6">
                    <div class="flex flex-col">
                      <span class="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition duration-100">
                        {ticket.customer_name}
                      </span>
                      <span class="text-xs text-slate-500 mt-0.5">{ticket.customer_email}</span>
                    </div>
                  </td>
                  
                  {/* Subject */}
                  <td class="py-4 px-6 max-w-xs md:max-w-md">
                    <div class="flex flex-col">
                      <span class="text-sm font-medium text-slate-800 truncate">{ticket.subject}</span>
                    </div>
                  </td>
                  
                  {/* Status Badge */}
                  <td class="py-4 px-6">
                    <span class={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md border ${getStatusStyles(ticket.status)}`}>
                      <span class={`h-1.5 w-1.5 rounded-sm ${getStatusDotColor(ticket.status)}`}></span>
                      {ticket.status}
                    </span>
                  </td>
                  
                  {/* Date Created */}
                  <td class="py-4 px-6 text-right text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(ticket.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
