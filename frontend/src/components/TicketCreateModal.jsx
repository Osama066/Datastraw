import React, { useState } from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';

export default function TicketCreateModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear errors when typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { customer_name, customer_email, subject, description } = formData;

    // Frontend validation
    if (!customer_name.trim() || !customer_email.trim() || !subject.trim() || !description.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create ticket');
      }

      // Success
      onCreate(data.ticket_id);
      setFormData({ customer_name: '', customer_email: '', subject: '', description: '' });
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-end overflow-hidden animate-overlay">
      {/* Backdrop */}
      <div
        onClick={onClose}
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      ></div>

      {/* Drawer Panel */}
      <div class="relative w-full max-w-lg h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col z-10 animate-slide-in">
        
        {/* Header */}
        <div class="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-slate-900 tracking-tight">Create Support Ticket</h2>
            <p class="text-xs text-slate-500 mt-1">Open a new incident ticket on behalf of a customer.</p>
          </div>
          <button
            onClick={onClose}
            class="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition duration-150"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} class="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Error Banner */}
          {error && (
            <div class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 text-sm">
              <AlertTriangle size={18} class="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer Name */}
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer Name</label>
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 text-sm"
              required
            />
          </div>

          {/* Customer Email */}
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer Email</label>
            <input
              type="email"
              name="customer_email"
              value={formData.customer_email}
              onChange={handleChange}
              placeholder="e.g. john.doe@example.com"
              class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 text-sm"
              required
            />
          </div>

          {/* Issue Subject */}
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Issue Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. System dashboard crashing on login"
              class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 text-sm"
              required
            />
          </div>

          {/* Description */}
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a detailed breakdown of the issue or inquiry..."
              rows={6}
              class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 text-sm resize-none"
              required
            ></textarea>
          </div>
        </form>

        {/* Footer actions */}
        <div class="p-6 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            class="px-5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-sm font-semibold transition duration-150"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition duration-150 shadow-sm"
          >
            {isSubmitting ? 'Creating...' : 'Submit Ticket'}
            {!isSubmitting && <Send size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
