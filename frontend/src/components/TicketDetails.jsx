import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, MessageSquare, History, Check, AlertCircle, RefreshCw, FileText } from 'lucide-react';

export default function TicketDetails({ ticketId, onBack, onUpdateSuccess }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noteText, setNoteText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  // Fetch ticket details
  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/tickets/${ticketId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ticket details.');
      }
      const data = await response.json();
      setTicket(data);
      setSelectedStatus(data.status);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load ticket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails();
    }
  }, [ticketId]);

  // Format ISO timestamp
  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Handle status & note submit
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (updating) return;

    if (!noteText.trim() && selectedStatus === ticket.status) {
      setError('Please change the status or enter a note before saving.');
      return;
    }

    setUpdating(true);
    setError('');

    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          notes: noteText.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update ticket.');
      }

      setNoteText('');
      // Reload ticket info
      await fetchTicketDetails();
      // Notify parent app of change
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update ticket.');
    } finally {
      setUpdating(false);
    }
  };

  // Status Badge visual styles helper
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Open': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'In Progress': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Closed': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-150 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div class="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[400px] animate-fade-in shadow-sm">
        <RefreshCw size={36} class="text-blue-600 animate-spin" />
        <p class="text-slate-500 text-sm font-medium">Retrieving ticket {ticketId} details...</p>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div class="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[400px] animate-fade-in shadow-sm">
        <AlertCircle size={36} class="text-red-500" />
        <div>
          <h4 class="text-slate-800 font-bold text-lg">Error loading ticket</h4>
          <p class="text-slate-500 text-sm mt-1">{error}</p>
        </div>
        <button
          onClick={onBack}
          class="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-250 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div class="space-y-6 animate-fade-in">
      {/* Top action bar */}
      <div class="flex items-center justify-between">
        <button
          onClick={onBack}
          class="flex items-center gap-2 text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-350 px-4 py-2 rounded-xl transition text-sm font-semibold shadow-sm"
        >
          <ArrowLeft size={16} />
          Back to Tickets
        </button>
        <span class="text-xs text-slate-400 font-medium">
          Last updated: {formatDateTime(ticket.updated_at)}
        </span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main Ticket details (takes 2/3 space on large displays) */}
        <div class="lg:col-span-2 space-y-6">
          {/* Ticket Summary Card */}
          <div class="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-sm">
            {/* Title / Header */}
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-100 pb-5">
              <div class="space-y-1">
                <div class="flex items-center gap-3">
                  <span class="text-xs font-bold text-blue-600 uppercase tracking-widest">{ticket.ticket_id}</span>
                  <span class={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-md border ${getStatusStyles(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <h2 class="text-xl md:text-2xl font-bold text-slate-900 leading-tight mt-1">{ticket.subject}</h2>
              </div>
            </div>

            {/* Customer Details Row */}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              <div class="flex items-center gap-3 text-sm">
                <div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <User size={16} />
                </div>
                <div>
                  <p class="text-slate-400 text-xs uppercase font-bold tracking-wider">Customer Name</p>
                  <p class="text-slate-900 font-medium mt-0.5">{ticket.customer_name}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 text-sm">
                <div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Mail size={16} />
                </div>
                <div>
                  <p class="text-slate-400 text-xs uppercase font-bold tracking-wider">Customer Email</p>
                  <a href={`mailto:${ticket.customer_email}`} class="text-blue-600 hover:text-blue-700 font-medium mt-0.5 block hover:underline">
                    {ticket.customer_email}
                  </a>
                </div>
              </div>
            </div>

            {/* Ticket Description */}
            <div class="space-y-2">
              <h4 class="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <FileText size={14} /> Description
              </h4>
              <div class="bg-slate-50 p-5 rounded-xl border border-slate-200 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </div>
            </div>
            
            <div class="text-[11px] text-slate-400 flex justify-between pt-2 border-t border-slate-100">
              <span>Opened: {formatDateTime(ticket.created_at)}</span>
            </div>
          </div>

          {/* Activity / Notes Timeline */}
          <div class="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-sm">
            <h3 class="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <History size={18} class="text-blue-600" />
              Activity Timeline & Internal Notes
            </h3>

            <div class="space-y-4">
              {ticket.notes.length === 0 ? (
                <div class="text-center py-8 text-slate-450 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-sm flex flex-col items-center justify-center gap-2">
                  <MessageSquare size={24} />
                  <span>No internal notes recorded for this ticket yet.</span>
                </div>
              ) : (
                <div class="relative border-l border-slate-200 ml-3.5 pl-6 space-y-5">
                  {ticket.notes.map((note, index) => (
                    <div key={index} class="relative">
                      {/* Timeline dot */}
                      <span class="absolute -left-[31px] top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white border border-blue-500 text-blue-600 p-0.5">
                        <span class="h-2 w-2 rounded-full bg-blue-500"></span>
                      </span>

                      {/* Note card */}
                      <div class="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                        <div class="flex items-center justify-between gap-4">
                          <span class="text-xs font-bold text-blue-600">Staff Update</span>
                          <span class="text-[10px] text-slate-400">{formatDateTime(note.created_at)}</span>
                        </div>
                        <p class="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{note.note_text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Update & Management Actions */}
        <div class="space-y-6">
          <div class="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5 sticky top-22">
            <div>
              <h3 class="text-lg font-bold text-slate-900 tracking-tight">Manage Ticket</h3>
              <p class="text-xs text-slate-500 mt-1">Change ticket resolution progress and log updates.</p>
            </div>

            {error && (
              <div class="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex gap-2">
                <AlertCircle size={16} class="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} class="space-y-4">
              {/* Status Update Dropdown */}
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setError('');
                  }}
                  class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed / Resolved</option>
                </select>
              </div>

              {/* Add Note text field */}
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Add Internal Note</label>
                <textarea
                  value={noteText}
                  onChange={(e) => {
                    setNoteText(e.target.value);
                    setError('');
                  }}
                  placeholder="Record a status update, phone notes, or response details..."
                  rows={5}
                  class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm resize-none"
                ></textarea>
              </div>

              {/* Submit Update button */}
              <button
                type="submit"
                disabled={updating}
                class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition duration-150 shadow-sm"
              >
                {updating ? 'Updating...' : 'Save Updates'}
                {!updating && <Check size={16} />}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
