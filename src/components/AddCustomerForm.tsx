"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

export default function AddCustomerForm() {
  const [form, setForm] = useState({ name: '', itemPurchased: '', quantity: '', totalSpent: '', lastPurchase: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await fetch('/api/customers/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess('Customer added successfully!');
        setForm({ name: '', itemPurchased: '', quantity: '', totalSpent: '', lastPurchase: '' });
        queryClient.invalidateQueries({ queryKey: ['top-customers'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
        setTimeout(() => router.push('/'), 1200);
      } else {
        const data = await res.json();
        setError(data.message || 'Error adding customer');
      }
    } catch (err) {
      setError('Error adding customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100 mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-2 text-blue-700 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm0 0c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3zm0 0v2m0 4h.01" /></svg>
        Add New Customer
      </h2>
      <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Fill out the form below to add a new customer to your CRM database.</p>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div>
          <label className="block text-sm sm:text-base text-gray-700 font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            placeholder="Customer Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-sm sm:text-base"
          />
        </div>
        <div>
          <label className="block text-sm sm:text-base text-gray-700 font-medium mb-1">Item Purchased</label>
          <input
            type="text"
            name="itemPurchased"
            placeholder="Item Purchased"
            value={form.itemPurchased}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-sm sm:text-base"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm sm:text-base text-gray-700 font-medium mb-1">Quantity</label>
            <input
              type="number"
              name="quantity"
              placeholder="Qty"
              value={form.quantity}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base text-gray-700 font-medium mb-1">Total Spent</label>
            <input
              type="number"
              name="totalSpent"
              placeholder="Amount"
              value={form.totalSpent}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base text-gray-700 font-medium mb-1">Last Purchase</label>
            <input
              type="date"
              name="lastPurchase"
              placeholder="Date"
              value={form.lastPurchase}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-sm sm:text-base"
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full py-2.5 sm:py-3 font-semibold text-sm sm:text-base"
          variant="default"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Customer'}
        </Button>
        {success && <div className="text-green-600 text-center font-medium mt-2 text-sm sm:text-base">{success}</div>}
        {error && <div className="text-red-600 text-center font-medium mt-2 text-sm sm:text-base">{error}</div>}
      </form>
    </div>
  );
} 