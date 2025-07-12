'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Check, X, Users } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type Customer = {
  _id: string;
  name: string;
  itemPurchased: string;
  totalSpent: number;
  isActive?: boolean;
};

const TopCustomers = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Customer>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const queryClient = useQueryClient();

  // Use a separate query for TopCustomers
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['top-customers'],
    queryFn: async () => {
      const response = await fetch('/api/customers/top');
      if (!response.ok) throw new Error('Failed to fetch customers data');
      const data = await response.json();
      return data.customers;
    },
    staleTime: 1000 * 60 * 1, // 1 minute (reduced for faster updates)
    refetchOnMount: false, // Don't refetch on mount if data exists
  });

  const customers: Customer[] = data || [];

  // Memoized action handlers
  const startEdit = useCallback((c: Customer) => {
    setEditingId(c._id);
    setEditData({ name: c.name, itemPurchased: c.itemPurchased, totalSpent: c.totalSpent });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditData({});
  }, []);

  const saveEdit = useCallback(async (id: string) => {
    try {
      await axios.put(`/api/customers/${id}`, editData);
      setToast({ type: 'success', message: 'Customer updated.' });
      setEditingId(null);
      setEditData({});
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['top-customers'] });
    } catch {
      setToast({ type: 'error', message: 'Failed to update customer.' });
    }
  }, [editData, queryClient]);

  const startDelete = useCallback((id: string) => setDeletingId(id), []);
  const cancelDelete = useCallback(() => setDeletingId(null), []);

  const confirmDelete = useCallback(async (id: string) => {
    try {
      await axios.delete(`/api/customers/${id}`);
      setToast({ type: 'success', message: 'Customer deleted.' });
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['top-customers'] });
    } catch {
      setToast({ type: 'error', message: 'Failed to delete customer.' });
    }
  }, [queryClient]);

  // Memoized loading and error states
  const loadingState = useMemo(() => (
    <div className="text-gray-400 text-base sm:text-lg">Loading...</div>
  ), []);

  const errorState = useMemo(() => (
    <div className="text-red-500 text-base sm:text-lg">{error instanceof Error ? error.message : 'Failed to load top customers.'}</div>
  ), [error]);

  const emptyState = useMemo(() => (
    <div className="text-gray-400 text-base sm:text-lg">No customers found.</div>
  ), []);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto min-h-[300px] sm:min-h-[350px]">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-extrabold flex items-center gap-2 sm:gap-3 text-blue-800">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-600" /> 
          <span className="hidden sm:inline">Top Customers</span>
          <span className="sm:hidden">Top Customers</span>
        </h3>
        <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 font-medium">
          <span className="hidden sm:inline">Revenue leaders</span>
          <span className="sm:hidden">Leaders</span>
        </span>
      </div>
      
      {isLoading && loadingState}
      {isError && errorState}
      
      {!isLoading && !isError && (
        <div className="space-y-3 sm:space-y-4">
          {customers.length === 0 && emptyState}
          {customers.map((c: Customer, i: number) => (
            <div
              key={c._id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 rounded-xl bg-gray-50 shadow-md transition-all duration-150 hover:shadow-lg group relative border-l-4 sm:border-l-8 ${i === 0 ? 'border-blue-500' : 'border-gray-200'}`}
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 mb-3 sm:mb-0">
                <span className={`font-bold text-base sm:text-lg ${i === 0 ? 'text-blue-700' : 'text-blue-500'}`}>#{i + 1}</span>
                <div className="min-w-0 flex-1">
                  {editingId === c._id ? (
                    <div className="space-y-2">
                      <input
                        className="font-semibold text-gray-900 bg-white border border-blue-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={editData.name || ''}
                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                      />
                      <input
                        className="text-sm text-gray-500 bg-white border border-blue-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                        value={editData.itemPurchased || ''}
                        onChange={e => setEditData({ ...editData, itemPurchased: e.target.value })}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="font-semibold text-gray-900 text-base sm:text-lg truncate">{c.name}</div>
                      <div className="text-xs sm:text-sm text-gray-500 truncate">{c.itemPurchased}</div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6">
                {editingId === c._id ? (
                  <>
                    <div className="text-right">
                      <input
                        className="font-bold text-green-700 bg-white border border-blue-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 w-20 sm:w-28 text-sm sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                        type="number"
                        value={editData.totalSpent || ''}
                        onChange={e => setEditData({ ...editData, totalSpent: Number(e.target.value) })}
                      />
                      <div className="text-xs text-gray-400">items</div>
                    </div>
                    <div className="flex gap-1 sm:gap-2">
                      <button className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold flex items-center gap-1 transition text-xs sm:text-sm" onClick={() => saveEdit(c._id)} title="Save">
                        <Check size={16} className="sm:w-4 sm:h-4" /> 
                        <span className="hidden sm:inline">Save</span>
                      </button>
                      <button className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold flex items-center gap-1 transition text-xs sm:text-sm" onClick={cancelEdit} title="Cancel">
                        <X size={16} className="sm:w-4 sm:h-4" /> 
                        <span className="hidden sm:inline">Cancel</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-right">
                      <div className="font-bold text-green-700 text-lg sm:text-xl">₹{c.totalSpent.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-gray-400">items</div>
                    </div>
                    {deletingId === c._id ? (
                      <div className="flex gap-1 sm:gap-2">
                        <button className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold flex items-center gap-1 transition text-xs sm:text-sm" onClick={() => confirmDelete(c._id)} title="Confirm Delete">
                          <Check size={16} className="sm:w-4 sm:h-4" /> 
                          <span className="hidden sm:inline">Confirm</span>
                        </button>
                        <button className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold flex items-center gap-1 transition text-xs sm:text-sm" onClick={cancelDelete} title="Cancel">
                          <X size={16} className="sm:w-4 sm:h-4" /> 
                          <span className="hidden sm:inline">Cancel</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1 sm:gap-2">
                        <button className="p-2 sm:p-3 rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition" onClick={() => startEdit(c)} title="Edit">
                          <Pencil size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <button className="p-2 sm:p-3 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 transition" onClick={() => startDelete(c._id)} title="Delete">
                          <Trash2 size={16} className="sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 px-3 sm:px-4 py-2 rounded shadow-lg z-50 flex items-center gap-2 text-white animate-slide-in text-sm sm:text-base ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <Check size={16} className="sm:w-4 sm:h-4" /> : <X size={16} className="sm:w-4 sm:h-4" />} {toast.message}
        </div>
      )}
    </div>
  );
};

export default TopCustomers;

// Animations (add to your global CSS or Tailwind config)
// .animate-fade-in { animation: fadeIn 0.2s; }
// .animate-pop-in { animation: popIn 0.2s; }
// .animate-slide-in { animation: slideIn 0.3s; }
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
// @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
// @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } 