import React, { useState, useEffect } from 'react';
import { RefreshCw, Layout, Layers, ShieldCheck, Mail, ChevronRight, Check } from 'lucide-react';
import DashboardStats from './components/DashboardStats';
import TicketList from './components/TicketList';
import TicketCreateModal from './components/TicketCreateModal';
import TicketDetails from './components/TicketDetails';

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  
  // Toast notifications state
  const [toast, setToast] = useState(null);

  // Show toast utility
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch tickets with server-side filters
  const fetchTickets = async () => {
    try {
      let url = '/api/tickets';
      const params = [];
      if (statusFilter !== 'All') {
        params.push(`status=${statusFilter}`);
      }
      if (searchQuery.trim()) {
        params.push(`search=${encodeURIComponent(searchQuery.trim())}`);
      }
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to retrieve ticket list.');
      }
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the database API service.');
    } finally {
      setLoading(false);
    }
  };

  // Run fetch tickets on mount and whenever filters change
  useEffect(() => {
    fetchTickets();
  }, [statusFilter, searchQuery]);

  // Handle successful creation of a ticket
  const handleTicketCreated = (newId) => {
    showToast(`Ticket ${newId} created successfully!`);
    fetchTickets();
    setSelectedTicketId(newId); // Immediately navigate to details of new ticket
  };

  // Handle successful update of status/notes
  const handleTicketUpdated = () => {
    showToast('Ticket updated successfully!');
    fetchTickets();
  };

  return (
    <div class="flex-1 flex flex-col min-h-screen bg-slate-50">
      {/* Toast Alert */}
      {toast && (
        <div class="fixed top-5 right-5 z-[100] max-w-sm w-full bg-slate-900 text-white p-4 rounded-xl shadow-lg border border-slate-800 flex items-center gap-3 animate-fade-in">
          <div class="p-1 bg-blue-600 rounded-lg text-white">
            <Check size={18} />
          </div>
          <span class="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header class="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div class="flex items-center cursor-pointer" onClick={() => setSelectedTicketId(null)}>
            <span class="text-base font-bold text-slate-900">
              Datastraw Support Desk
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {error && (
          <div class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center justify-between text-sm animate-fade-in">
            <span>{error}</span>
            <button
              onClick={() => {
                setError('');
                fetchTickets();
              }}
              class="px-3 py-1 bg-red-100 rounded-lg hover:bg-red-200 font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {selectedTicketId ? (
          /* Detailed View Tab */
          <TicketDetails
            ticketId={selectedTicketId}
            onBack={() => setSelectedTicketId(null)}
            onUpdateSuccess={handleTicketUpdated}
          />
        ) : (
          /* Dashboard Main view */
          <>
            <DashboardStats
              tickets={tickets}
              onCreateClick={() => setIsCreateDrawerOpen(true)}
            />
            
            {loading && tickets.length === 0 ? (
              /* Loading Spinner */
              <div class="bg-white rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 border border-slate-200 shadow-sm min-h-[300px]">
                <RefreshCw size={32} class="text-blue-600 animate-spin" />
                <p class="text-slate-500 text-sm font-semibold">Refreshing database records...</p>
              </div>
            ) : (
              /* List Table View */
              <TicketList
                tickets={tickets}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onTicketClick={setSelectedTicketId}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer class="border-t border-slate-200 py-6 mt-12 bg-white text-center text-xs text-slate-500">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Datastraw Support Desk. All rights reserved.</p>
        </div>
      </footer>

      {/* Slide-over Ticket Creator Drawer */}
      <TicketCreateModal
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onCreate={handleTicketCreated}
      />
    </div>
  );
}
