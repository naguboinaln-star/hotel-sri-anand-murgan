/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Minus,
  RefreshCw,
  AlertTriangle,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Check,
  X,
} from 'lucide-react';
import { InventoryItem, StockTransaction } from '../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onUpdateStock: (id: string, changeAmount: number, type: 'IN' | 'OUT', notes: string) => void;
}

export default function InventoryView({ inventory, onUpdateStock }: InventoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStockStatus, setSelectedStockStatus] = useState<'All' | 'Low' | 'Normal'>('All');

  // Stock Adjustment State
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustNotes, setAdjustNotes] = useState('');

  // Filter items
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());

      const isLow = item.currentStock <= item.minStock;
      const matchesStatus =
        selectedStockStatus === 'All' ||
        (selectedStockStatus === 'Low' && isLow) ||
        (selectedStockStatus === 'Normal' && !isLow);

      return matchesSearch && matchesStatus;
    });
  }, [inventory, searchTerm, selectedStockStatus]);

  // Aggregate stats
  const totalGrainsVolume = useMemo(() => {
    return inventory
      .filter(item => item.unit === 'kg')
      .reduce((sum, item) => sum + item.currentStock, 0);
  }, [inventory]);

  const lowStockCount = useMemo(() => {
    return inventory.filter(item => item.currentStock <= item.minStock).length;
  }, [inventory]);

  const handleOpenAdjustment = (item: InventoryItem, type: 'IN' | 'OUT') => {
    setAdjustingItem(item);
    setAdjustType(type);
    setAdjustQty(0);
    setAdjustNotes('');
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;
    if (adjustQty <= 0) {
      alert('Adjustment volume quantity must be greater than zero.');
      return;
    }
    if (adjustType === 'OUT' && adjustQty > adjustingItem.currentStock) {
      alert(`Insufficient stock! Cannot deduct ${adjustQty} ${adjustingItem.unit} from current ${adjustingItem.currentStock} ${adjustingItem.unit}.`);
      return;
    }

    onUpdateStock(
      adjustingItem.id,
      adjustQty,
      adjustType,
      adjustNotes.trim() || `${adjustType === 'IN' ? 'Fresh Refill' : 'Manual Deduction'}`
    );

    setAdjustingItem(null);
  };

  return (
    <div className="space-y-6" id="inventory-module">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-xl p-4 border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-dark-teal font-display">Ingredients &amp; Inventory Silo</h2>
          <p className="text-xs text-slate-gray">Audit running dry grains, spices, milk cartons, and commercial burner gas cylinders.</p>
        </div>
        <div className="flex items-center gap-2">
          {lowStockCount > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" /> {lowStockCount} Items Low Stock
            </span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Low warning */}
        <div className={`bg-white rounded-xl p-5 border shadow-xs flex items-center justify-between ${lowStockCount > 0 ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100'}`}>
          <div>
            <p className="text-[10px] text-slate-gray font-bold uppercase tracking-wide">Critical Restocks</p>
            <p className={`text-2xl font-black font-mono mt-1 ${lowStockCount > 0 ? 'text-amber-700' : 'text-slate-700'}`}>{lowStockCount}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Below specified safety thresholds</p>
          </div>
          <div className={`p-3 rounded-xl ${lowStockCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Dry grains aggregate */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-gray font-bold uppercase tracking-wide">Aggregate Grain Stocks</p>
            <p className="text-2xl font-black font-mono text-dark-teal mt-1">{totalGrainsVolume} kg</p>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Rice, Dals, and Spices on-site</p>
          </div>
          <div className="p-3 bg-teal-50 rounded-xl text-dark-teal">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Info panel */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs text-xs text-slate-gray leading-relaxed flex flex-col justify-center">
          <strong className="text-dark-teal mb-1 font-display">Auto-Reduction after Billing:</strong>
          Our intelligent POS system automatically reduces raw metrics (Rice, Dal, Coffee, Sugar, Milk) in real-time as sales tokens are booked at the counter checkout terminal.
        </div>
      </div>

      {/* Filters and search grids */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search raw item name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white text-slate-800"
          />
        </div>

        {/* Status selection filter buttons */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600 w-full sm:w-auto">
          <button
            onClick={() => setSelectedStockStatus('All')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md transition-colors ${selectedStockStatus === 'All' ? 'bg-white text-dark-teal shadow-xs font-semibold' : 'hover:text-dark-teal'}`}
          >
            All Items
          </button>
          <button
            onClick={() => setSelectedStockStatus('Low')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md transition-colors ${selectedStockStatus === 'Low' ? 'bg-white text-dark-teal shadow-xs font-semibold' : 'hover:text-dark-teal'}`}
          >
            Below Safety Limit
          </button>
          <button
            onClick={() => setSelectedStockStatus('Normal')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md transition-colors ${selectedStockStatus === 'Normal' ? 'bg-white text-dark-teal shadow-xs font-semibold' : 'hover:text-dark-teal'}`}
          >
            Stock OK
          </button>
        </div>
      </div>

      {/* Main ledger grid */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-gray border-b border-slate-100 uppercase text-[10px] font-mono">
                <th className="py-3 px-4">Item Code</th>
                <th className="py-3 px-4">Ingredient Name</th>
                <th className="py-3 px-4 text-right">Current Available Stock</th>
                <th className="py-3 px-4 text-right">Minimum Safety Alert limit</th>
                <th className="py-3 px-4 text-center">Status Flag</th>
                <th className="py-3 px-4 text-right">Trigger Adjustments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Layers className="w-12 h-12 mx-auto text-slate-200 mb-2" />
                    <p className="font-semibold text-slate-500">No stock records found.</p>
                  </td>
                </tr>
              ) : (
                filteredInventory.map(item => {
                  const isLow = item.currentStock <= item.minStock;
                  return (
                    <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors ${isLow ? 'bg-amber-50/10' : ''}`}>
                      <td className="py-3.5 px-4 font-mono font-bold text-dark-teal">
                        {item.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 text-sm">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black font-mono text-slate-900 text-sm">
                        {item.currentStock} <span className="text-[10px] text-slate-400 font-sans font-semibold">{item.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-500">
                        {item.minStock} <span className="text-[10px] font-sans text-slate-400 font-semibold">{item.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          isLow
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {isLow ? 'LOW' : 'OK'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenAdjustment(item, 'IN')}
                          className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-700 hover:text-white font-bold rounded-lg transition-all text-[10px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowUpRight className="w-3 h-3" /> Stock In
                        </button>
                        <button
                          onClick={() => handleOpenAdjustment(item, 'OUT')}
                          className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-700 hover:text-white font-bold rounded-lg transition-all text-[10px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowDownLeft className="w-3 h-3" /> Stock Out
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Stock Adjustment Dialog Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveAdjustment}
            className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-sm w-full p-6 space-y-4 animate-scale-up"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-dark-teal text-base font-display">
                Manual Stock {adjustType === 'IN' ? 'Entry' : 'Deduction'}
              </h3>
              <button
                type="button"
                onClick={() => setAdjustingItem(null)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-gray">
                Modifying running silo storage level for:{' '}
                <strong className="text-slate-800">{adjustingItem.name}</strong> ({adjustingItem.currentStock}{' '}
                {adjustingItem.unit} remaining).
              </p>

              {/* Adjustment volume */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Adjustment Volume Quantity ({adjustingItem.unit}):
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={adjustQty || ''}
                  onChange={e => setAdjustQty(Math.max(0, Number(e.target.value)))}
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white transition-all text-slate-800 font-mono font-bold"
                  required
                />
              </div>

              {/* Adjustment Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Audit Reference Notes / Reason:</label>
                <input
                  type="text"
                  placeholder="e.g. Fresh shipment, Kitchen spill waste, Audit fix"
                  value={adjustNotes}
                  onChange={e => setAdjustNotes(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdjustingItem(null)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 py-2 rounded-lg text-white text-xs font-semibold transition-all shadow-md ${
                  adjustType === 'IN'
                    ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/10'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/10'
                }`}
              >
                Apply Stock {adjustType}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
