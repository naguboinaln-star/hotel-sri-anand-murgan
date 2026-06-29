/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Calendar,
  Filter,
  CreditCard,
  IndianRupee,
  Search,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { Expense, ExpenseType } from '../types';

interface ExpenseViewProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

export const EXPENSE_TYPES: ExpenseType[] = [
  'Vegetables',
  'Cooking Items',
  'Rice',
  'Oil',
  'Gas Cylinder',
  'Electricity',
  'Water',
  'Cleaning',
  'Miscellaneous',
];

export default function ExpenseView({ expenses, onAddExpense, onDeleteExpense }: ExpenseViewProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Form Field State
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formType, setFormType] = useState<ExpenseType>('Vegetables');
  const [formVendor, setFormVendor] = useState('');
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formDescription, setFormDescription] = useState('');

  // Filter & Search
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesSearch =
        exp.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedTypeFilter === 'All' || exp.type === selectedTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [expenses, searchTerm, selectedTypeFilter]);

  // Total sums of active listed expenses
  const aggregatedTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  // Sums grouped by type for a dashboard panel
  const totalsByType = useMemo(() => {
    const summary: { [key: string]: number } = {};
    expenses.forEach(e => {
      summary[e.type] = (summary[e.type] || 0) + e.amount;
    });
    return summary;
  }, [expenses]);

  const handleOpenAdd = () => {
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormType('Vegetables');
    setFormVendor('');
    setFormAmount(0);
    setFormDescription('');
    setIsAddOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVendor.trim()) {
      alert('Vendor Name is required.');
      return;
    }
    if (formAmount <= 0) {
      alert('Please input a valid positive amount.');
      return;
    }

    onAddExpense({
      date: formDate,
      type: formType,
      vendorName: formVendor.trim(),
      amount: formAmount,
      description: formDescription.trim(),
    });

    setIsAddOpen(false);
  };

  const handleDeleteExpense = (id: string, vendor: string) => {
    if (window.confirm(`Are you sure you want to delete the expense of ₹${formAmount} paid to "${vendor}"?`)) {
      onDeleteExpense(id);
    }
  };

  return (
    <div className="space-y-6" id="expenses-module">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-xl p-4 border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-dark-teal font-display">Daily Cost &amp; Expense Tracker</h2>
          <p className="text-xs text-slate-gray">Record kitchen supplies, gas cylinders, power charges, and vegetable procurements.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 bg-dark-teal text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-dark-teal-hover transition-all shadow-md shadow-dark-teal/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Log New Expense
        </button>
      </div>

      {/* Stats Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Cost Column */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-gray font-bold uppercase tracking-wide">Total Logged Expense</p>
            <p className="text-2xl font-black font-mono text-dark-teal mt-1 flex items-center">
              <IndianRupee className="w-5 h-5 stroke-[2.5]" />
              {aggregatedTotal.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">For currently filtered list</p>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Categories summaries panel */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs md:col-span-2 overflow-x-auto">
          <p className="text-[10px] text-slate-gray font-bold uppercase tracking-wide mb-3">Cost Breakdown by Category</p>
          <div className="flex gap-4 pb-1">
            {EXPENSE_TYPES.slice(0, 5).map(type => (
              <div key={type} className="flex-1 min-w-[100px] border-r border-slate-100 last:border-0 pr-4">
                <span className="text-[10px] font-semibold text-slate-400 block truncate">{type}</span>
                <span className="text-xs font-bold font-mono text-slate-800 block mt-1">
                  ₹{(totalsByType[type] || 0).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and search grids */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by vendor name or description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white transition-all text-slate-800"
          />
        </div>

        {/* Expense Filters */}
        <div className="flex items-center gap-2 md:col-span-2">
          <span className="text-xs font-semibold text-slate-gray flex items-center gap-1 whitespace-nowrap">
            <Filter className="w-3.5 h-3.5" /> Filter Type:
          </span>
          <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-thin max-w-full">
            {['All', ...EXPENSE_TYPES].map(type => (
              <button
                key={type}
                onClick={() => setSelectedTypeFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedTypeFilter === type
                    ? 'bg-dark-teal text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expense ledger entries table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-gray border-b border-slate-100 uppercase text-[10px] font-mono">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Expense Type</th>
                <th className="py-3 px-4">Vendor Name</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <FileText className="w-12 h-12 mx-auto text-slate-200 mb-2" />
                    <p className="font-semibold text-slate-500">No expense records found.</p>
                    <p className="text-xs text-slate-400 mt-1">Add raw items, cylinder bookings, or electricity logs to compile reports.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                      {exp.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100 font-semibold text-[10px]">
                        {exp.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {exp.vendorName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {exp.description}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black font-mono text-slate-900 text-sm">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp.id, exp.vendorName)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded transition-colors inline-block cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add expense modal dialog */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveAdd}
            className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-md w-full p-6 space-y-4 animate-scale-up"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-dark-teal text-base font-display">Log Daily Hotel Expense</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Payment Date:</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white transition-all text-slate-800 font-mono font-semibold"
                    required
                  />
                </div>

                {/* Expense Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Expense Type:</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as ExpenseType)}
                    className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white transition-all text-slate-800 font-semibold"
                  >
                    {EXPENSE_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vendor Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Paid To / Vendor Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Murugan Rice Mill, Local Vegetable Market, Gas Supplier"
                  value={formVendor}
                  onChange={e => setFormVendor(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white transition-all text-slate-800 font-semibold"
                  required
                />
              </div>

              {/* Amount paid */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Amount Paid (₹):</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formAmount || ''}
                  onChange={e => setFormAmount(Math.max(0, Number(e.target.value)))}
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white transition-all text-slate-800 font-mono font-bold"
                  required
                />
              </div>

              {/* Expense description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Brief Description / Comments:</label>
                <textarea
                  rows={2}
                  placeholder="Describe purchased raw materials, weight, quantity or bills details"
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-dark-teal text-white text-xs font-semibold hover:bg-dark-teal-hover transition-all shadow-md shadow-dark-teal/10"
              >
                Confirm Payment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
