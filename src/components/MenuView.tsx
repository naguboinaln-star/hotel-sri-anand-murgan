/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Check,
  X,
  AlertTriangle,
  Flame,
  Utensils,
  Moon,
  Coffee,
  Pizza,
  Award,
  ChevronDown,
} from 'lucide-react';
import { FoodItem, FoodCategory } from '../types';

interface MenuViewProps {
  foodItems: FoodItem[];
  onAddFoodItem: (item: Omit<FoodItem, 'id'>) => void;
  onEditFoodItem: (id: string, updatedFields: Partial<FoodItem>) => void;
  onDeleteFoodItem: (id: string) => void;
}

export default function MenuView({
  foodItems,
  onAddFoodItem,
  onEditFoodItem,
  onDeleteFoodItem,
}: MenuViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formCategory, setFormCategory] = useState<FoodCategory>(FoodCategory.Tiffens);
  const [formAvailable, setFormAvailable] = useState(true);

  // Filter & Search
  const filteredItems = useMemo(() => {
    return foodItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [foodItems, searchTerm, selectedCategory]);

  const handleOpenAdd = () => {
    setFormName('');
    setFormPrice(0);
    setFormCategory(FoodCategory.Tiffens);
    setFormAvailable(true);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: FoodItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormPrice(item.price);
    setFormCategory(item.category);
    setFormAvailable(item.isAvailable);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Food item name is required.');
      return;
    }
    if (formPrice <= 0) {
      alert('Price must be greater than zero.');
      return;
    }

    onAddFoodItem({
      name: formName.trim(),
      price: formPrice,
      category: formCategory,
      isAvailable: formAvailable,
    });

    setIsAddOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!formName.trim()) {
      alert('Food item name is required.');
      return;
    }
    if (formPrice <= 0) {
      alert('Price must be greater than zero.');
      return;
    }

    onEditFoodItem(editingItem.id, {
      name: formName.trim(),
      price: formPrice,
      category: formCategory,
      isAvailable: formAvailable,
    });

    setEditingItem(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the active food menu?`)) {
      onDeleteFoodItem(id);
    }
  };

  // Icon selector helpers
  const getCategoryColor = (category: FoodCategory) => {
    switch (category) {
      case FoodCategory.Tiffens:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case FoodCategory.LunchItems:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case FoodCategory.FriedRice:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6" id="menu-management-module">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-xl p-4 border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-dark-teal font-display">Food Menu Management</h2>
          <p className="text-xs text-slate-gray">Create, edit, delete, and manage availability of menu dishes.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 bg-dark-teal text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-dark-teal-hover transition-all shadow-md shadow-dark-teal/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Food Item
        </button>
      </div>

      {/* Filters & Search Grid */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or code (e.g., F1, Plain Dosa)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white transition-all text-slate-800"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 md:col-span-2">
          <span className="text-xs font-semibold text-slate-gray flex items-center gap-1 whitespace-nowrap">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-thin max-w-full">
            {['All', ...Object.values(FoodCategory)].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-dark-teal text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Food Items Table Sheet */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-gray border-b border-slate-100 uppercase text-[10px] font-mono">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Dish Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-center">Kitchen Availability</th>
                <th className="py-3 px-4 text-right">Edit Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Utensils className="w-12 h-12 mx-auto text-slate-200 mb-2" />
                    <p className="font-semibold text-slate-500">No dishes matched search</p>
                    <p className="text-xs text-slate-400 mt-1">Try creating new menu entries to populate this module.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-dark-teal">
                      {item.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 text-sm">
                        {item.name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-900 text-sm">
                      ₹{item.price}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onEditFoodItem(item.id, { isAvailable: !item.isAvailable })}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          item.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {item.isAvailable ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Sold Out
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-dark-teal hover:bg-slate-100 rounded-lg transition-colors inline-block"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors inline-block"
                        title="Delete Item"
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

      {/* Add & Edit Modal Dialogs (Unified Form modal) */}
      {(isAddOpen || editingItem) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={isAddOpen ? handleSaveAdd : handleSaveEdit}
            className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-md w-full p-6 space-y-4 animate-scale-up"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-dark-teal text-base font-display">
                {isAddOpen ? 'Add New Food Item' : `Edit Menu Item (${editingItem?.id})`}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingItem(null);
                }}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Dish Title Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Masala Dosa, Ghee Roast, Filter Coffee"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white transition-all text-slate-800 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Rate Price (₹):</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={formPrice || ''}
                    onChange={e => setFormPrice(Math.max(0, Number(e.target.value)))}
                    className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white transition-all text-slate-800 font-mono font-bold"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Category Section:</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as FoodCategory)}
                    className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white transition-all text-slate-800 font-semibold"
                  >
                    {Object.values(FoodCategory).map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Availability */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <input
                  type="checkbox"
                  id="formAvailableCheckbox"
                  checked={formAvailable}
                  onChange={e => setFormAvailable(e.target.checked)}
                  className="w-4 h-4 text-dark-teal border-slate-300 rounded focus:ring-dark-teal accent-dark-teal"
                />
                <label htmlFor="formAvailableCheckbox" className="text-xs text-slate-700 font-semibold cursor-pointer select-none">
                  Mark available in live billing dashboard immediately
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingItem(null);
                }}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-dark-teal text-white text-xs font-semibold hover:bg-dark-teal-hover transition-all shadow-md shadow-dark-teal/10"
              >
                {isAddOpen ? 'Add Dish Code' : 'Save Adjustments'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
