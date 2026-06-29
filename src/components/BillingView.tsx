/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Edit2,
  Printer,
  FileText,
  Check,
  X,
  PlusCircle,
  AlertCircle,
  Utensils,
  Coffee,
  IceCream,
  Pizza,
  Moon,
  Sun,
  Flame,
  Award,
  ShoppingBag,
} from 'lucide-react';
import { FoodItem, FoodCategory, OrderItem, PaymentMethod, Order } from '../types';

interface BillingViewProps {
  foodItems: FoodItem[];
  employees: any[];
  hotelInfo: any;
  onCompleteOrder: (order: Omit<Order, 'id' | 'date' | 'time'>) => void;
  activeSessionUser: string;
}

export default function BillingView({
  foodItems,
  employees,
  hotelInfo,
  onCompleteOrder,
  activeSessionUser,
}: BillingViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [cashierName, setCashierName] = useState(activeSessionUser || 'Ramesh Sundaram');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Modal / Selector state for adding item
  const [selectedItemToAdd, setSelectedItemToAdd] = useState<FoodItem | null>(null);
  const [addQuantity, setAddQuantity] = useState<number>(1);
  const [addNotes, setAddNotes] = useState<string>('');

  // Receipt visual print popup state
  const [printedBill, setPrintedBill] = useState<Order | null>(null);

  // Category Icons helper
  const getCategoryIcon = (category: FoodCategory) => {
    switch (category) {
      case FoodCategory.Tiffens:
        return <Flame className="w-4 h-4 text-amber-500" />;
      case FoodCategory.LunchItems:
        return <Utensils className="w-4 h-4 text-emerald-600" />;
      case FoodCategory.FriedRice:
        return <Pizza className="w-4 h-4 text-orange-500" />;
      default:
        return <Utensils className="w-4 h-4 text-slate-500" />;
    }
  };

  // Filter items
  const filteredFoodItems = useMemo(() => {
    return foodItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [foodItems, searchTerm, selectedCategory]);

  // Handle Cart updates
  const handleOpenAddModal = (item: FoodItem) => {
    if (!item.isAvailable) return;
    setSelectedItemToAdd(item);
    setAddQuantity(1);
    setAddNotes('');
  };

  const handleConfirmAddToCart = () => {
    if (!selectedItemToAdd) return;

    // Check if item is already in cart
    const existingIndex = cart.findIndex(i => i.foodItem.id === selectedItemToAdd.id);
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      const currentQty = updatedCart[existingIndex].quantity;
      const newQty = Math.min(20, currentQty + addQuantity);
      updatedCart[existingIndex].quantity = newQty;
      if (addNotes) {
        updatedCart[existingIndex].notes = updatedCart[existingIndex].notes
          ? `${updatedCart[existingIndex].notes}, ${addNotes}`
          : addNotes;
      }
      setCart(updatedCart);
    } else {
      setCart([...cart, { foodItem: selectedItemToAdd, quantity: addQuantity, notes: addNotes || undefined }]);
    }

    setSelectedItemToAdd(null);
  };

  const handleRemoveFromCart = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  const handleQuantityChange = (index: number, change: number) => {
    const updatedCart = [...cart];
    const newQty = updatedCart[index].quantity + change;
    if (newQty >= 1 && newQty <= 20) {
      updatedCart[index].quantity = newQty;
      setCart(updatedCart);
    }
  };

  // Math totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0);
  }, [cart]);

  const cgst = useMemo(() => {
    return parseFloat((subtotal * (hotelInfo.cgstRate / 100)).toFixed(2));
  }, [subtotal, hotelInfo.cgstRate]);

  const sgst = useMemo(() => {
    return parseFloat((subtotal * (hotelInfo.sgstRate / 100)).toFixed(2));
  }, [subtotal, hotelInfo.sgstRate]);

  const grandTotal = useMemo(() => {
    return Math.max(0, Math.round(subtotal + cgst + sgst - discountAmount));
  }, [subtotal, cgst, sgst, discountAmount]);

  const handleClearCart = () => {
    if (window.confirm('Clear current live order cart?')) {
      setCart([]);
      setCustomerName('');
      setDiscountAmount(0);
    }
  };

  const handleCompleteAndCheckout = (simulatePrint: boolean = false) => {
    if (cart.length === 0) {
      alert('Order cart is empty! Add food items to complete transaction.');
      return;
    }

    const completedOrder: Omit<Order, 'id' | 'date' | 'time'> = {
      customerName: customerName.trim() || undefined,
      items: [...cart],
      subtotal,
      cgst,
      sgst,
      discount: discountAmount,
      grandTotal,
      paymentMethod,
      staffMember: cashierName,
      status: 'Completed',
    };

    onCompleteOrder(completedOrder);

    // If printing was selected, trigger print invoice layout before cleaning
    if (simulatePrint) {
      // Create order object to populate the printed bill modal
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const timeStr = today.toTimeString().split(' ')[0];
      setPrintedBill({
        id: `ORD-${dateStr.replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        date: dateStr,
        time: timeStr,
        ...completedOrder,
      });
    } else {
      alert(`Order completed successfully! Token ID registered.`);
    }

    // Reset Form
    setCart([]);
    setCustomerName('');
    setDiscountAmount(0);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="billing-module">
      {/* Left 2 Columns: Category Filters & Food Item Grid */}
      <div className="xl:col-span-2 space-y-4">
        {/* Search & Header */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search dishes (e.g. Dosa, Idly, Coffee)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white transition-all"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={cashierName}
              onChange={e => setCashierName(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-700 font-medium w-full"
            >
              <option disabled>Select Operator Cashier</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.name}>
                  {emp.name} ({emp.position})
                </option>
              ))}
              <option value="Admin">Administrator Manager</option>
            </select>
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {['All', ...Object.values(FoodCategory)].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-dark-teal text-white shadow-md shadow-dark-teal/15 scale-[1.02]'
                  : 'bg-white text-slate-700 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              {cat !== 'All' && getCategoryIcon(cat as FoodCategory)}
              {cat}
            </button>
          ))}
        </div>

        {/* Food Menu Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredFoodItems.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl py-12 text-center text-slate-400 border border-slate-100">
              <Utensils className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">No dishes found in this category.</p>
              <p className="text-xs text-slate-400 mt-1">Try modifying your search or select another category tab.</p>
            </div>
          ) : (
            filteredFoodItems.map(item => (
              <div
                key={item.id}
                onClick={() => handleOpenAddModal(item)}
                className={`bg-white rounded-xl border p-3 flex flex-col justify-between transition-all cursor-pointer select-none group relative ${
                  item.isAvailable
                    ? 'border-slate-100 hover:shadow-lg hover:border-dark-teal/30 hover:-translate-y-0.5'
                    : 'opacity-60 border-slate-100 bg-slate-50/50 cursor-not-allowed'
                }`}
              >
                {!item.isAvailable && (
                  <div className="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                    Sold Out
                  </div>
                )}
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-xs font-mono font-medium text-slate-400">
                      {item.id}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm mt-1.5 group-hover:text-dark-teal transition-colors">
                    {item.name}
                  </h4>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-50">
                  <span className="text-base font-bold font-mono text-dark-teal">
                    ₹{item.price}
                  </span>
                  {item.isAvailable && (
                    <button
                      type="button"
                      className="p-1 bg-teal-50 rounded-lg text-dark-teal hover:bg-dark-teal hover:text-white transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Live Bill Cart & Totals Section */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-md flex flex-col h-[calc(100vh-260px)] min-h-[500px]">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-dark-teal text-white rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-dark-teal text-sm font-display">Live Order Cart</h3>
              <p className="text-[10px] text-slate-400">Queue item details</p>
            </div>
          </div>
          {cart.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-[10px] font-semibold text-rose-500 hover:underline flex items-center gap-0.5"
            >
              <Trash2 className="w-3 h-3" /> Clear Cart
            </button>
          )}
        </div>

        {/* Customer Input Section */}
        <div className="p-3 border-b border-slate-50 grid grid-cols-2 gap-2 bg-slate-50/20">
          <div>
            <label className="block text-[10px] font-semibold text-slate-gray uppercase">Customer Name</label>
            <input
              type="text"
              placeholder="Table No / Customer Name"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full mt-1 px-2.5 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-dark-teal"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-gray uppercase">Discount (₹)</label>
            <input
              type="number"
              placeholder="0.00"
              value={discountAmount || ''}
              onChange={e => setDiscountAmount(Math.max(0, Number(e.target.value)))}
              className="w-full mt-1 px-2.5 py-1 text-xs border border-slate-200 rounded font-mono focus:outline-none focus:border-dark-teal"
            />
          </div>
        </div>

        {/* Cart Items List Scroll Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
              <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
              <p className="text-xs font-semibold mt-2">Active Order Cart is Empty</p>
              <p className="text-[10px] text-slate-400 text-center px-6 mt-1">
                Select dish cards on the left panel to begin compiling bill tokens.
              </p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={index}
                className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 flex flex-col justify-between gap-1.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-semibold text-xs text-slate-800">{item.foodItem.name}</h5>
                    {item.notes && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                        Note: {item.notes}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold font-mono text-dark-teal">
                    ₹{item.foodItem.price * item.quantity}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center bg-white border border-slate-200 rounded-md">
                    <button
                      onClick={() => handleQuantityChange(index, -1)}
                      className="p-1 hover:bg-slate-100 text-slate-500 rounded-l-md transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2.5 py-0.5 text-xs font-bold font-mono text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(index, 1)}
                      className="p-1 hover:bg-slate-100 text-slate-500 rounded-r-md transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveFromCart(index)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Remove Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Calculations Block */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Subtotal</span>
            <span className="font-mono">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>CGST ({hotelInfo.cgstRate}%)</span>
            <span className="font-mono">₹{cgst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>SGST ({hotelInfo.sgstRate}%)</span>
            <span className="font-mono">₹{sgst.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-xs text-rose-600 font-medium">
              <span>Discounts Applied</span>
              <span className="font-mono">- ₹{discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
            <span className="font-bold text-slate-800 uppercase text-xs">Grand Total</span>
            <span className="font-bold font-mono text-base text-dark-teal">
              ₹{grandTotal}
            </span>
          </div>

          {/* Payment selector */}
          <div className="pt-2">
            <label className="block text-[9px] font-bold text-slate-gray uppercase">Payment Method</label>
            <div className="grid grid-cols-3 gap-1 mt-1">
              {(['Cash', 'UPI', 'Card'] as PaymentMethod[]).map(method => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-1 rounded text-[10px] font-bold transition-all border ${
                    paymentMethod === method
                      ? 'bg-dark-teal text-white border-dark-teal'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Primary Checkout Actions */}
        <div className="p-3 border-t border-slate-100 grid grid-cols-2 gap-2 bg-white rounded-b-xl">
          <button
            onClick={() => handleCompleteAndCheckout(true)}
            disabled={cart.length === 0}
            className="flex items-center justify-center gap-1 bg-amber-600 text-white py-2 rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-3.5 h-3.5" /> Print &amp; Save
          </button>
          <button
            onClick={() => handleCompleteAndCheckout(false)}
            disabled={cart.length === 0}
            className="flex items-center justify-center gap-1 bg-dark-teal text-white py-2 rounded-lg text-xs font-semibold hover:bg-dark-teal-hover transition-colors shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-3.5 h-3.5" /> Save Only
          </button>
        </div>
      </div>

      {/* Add Notes & Custom Quantity Modal Dialog */}
      {selectedItemToAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Add Item Option</span>
                <h3 className="font-bold text-dark-teal text-base font-display">{selectedItemToAdd.name}</h3>
              </div>
              <button
                onClick={() => setSelectedItemToAdd(null)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Quantity Slider/Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Set Quantity (Limit 1 to 20):</label>
                <div className="flex items-center justify-center gap-4 bg-slate-50 py-2.5 rounded-lg border border-slate-100">
                  <button
                    onClick={() => setAddQuantity(Math.max(1, addQuantity - 1))}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-all shadow-xs"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-bold font-mono text-slate-800 w-12 text-center">
                    {addQuantity}
                  </span>
                  <button
                    onClick={() => setAddQuantity(Math.min(20, addQuantity + 1))}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-all shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cooking Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Kitchen Request / Chef Notes:</label>
                <input
                  type="text"
                  placeholder="e.g. Extra Ghee, Less Spicy, Pack Sambar separately"
                  value={addNotes}
                  onChange={e => setAddNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white transition-all text-slate-800"
                />
                <div className="flex gap-1.5 flex-wrap pt-1.5">
                  {['Extra Ghee', 'Less Spice', 'No Onion', 'Hot Sambar'].map(noteOpt => (
                    <button
                      key={noteOpt}
                      type="button"
                      onClick={() => setAddNotes(prev => prev ? `${prev}, ${noteOpt}` : noteOpt)}
                      className="px-2 py-0.5 text-[9px] font-medium bg-slate-100 text-slate-600 border border-slate-200 rounded-full hover:bg-slate-200"
                    >
                      +{noteOpt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Indicator */}
            <div className="bg-teal-50/50 p-2.5 rounded-lg border border-teal-100 flex justify-between text-xs font-semibold text-dark-teal">
              <span>Item Subtotal Amount:</span>
              <span className="font-bold font-mono text-sm">₹{selectedItemToAdd.price * addQuantity}</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedItemToAdd(null)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddToCart}
                className="flex-1 py-2 rounded-lg bg-dark-teal text-white text-xs font-semibold hover:bg-dark-teal-hover transition-all shadow-xs"
              >
                Add To Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Print Invoice Modal Popup */}
      {printedBill && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 relative animate-fade-in my-8">
            <button
              onClick={() => setPrintedBill(null)}
              className="absolute right-3 top-3 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Print Area Selector */}
            <div id="print-receipt-area" className="p-2 space-y-4 text-slate-900 font-mono text-xs">
              {/* Header */}
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
                <h4 className="text-sm font-black tracking-tight">{hotelInfo.name}</h4>
                <p className="text-[10px] text-slate-500">{hotelInfo.address}</p>
                <p className="text-[10px] text-slate-500">Phone: {hotelInfo.phone}</p>
                <p className="text-[10px] text-slate-500">GSTIN: {hotelInfo.gstin}</p>
              </div>

              {/* Meta information */}
              <div className="space-y-1 text-[10px] text-slate-600 border-b border-slate-100 pb-2">
                <div className="flex justify-between">
                  <span>BILL ID: <strong className="text-slate-900">{printedBill.id}</strong></span>
                  <span>DATE: {printedBill.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>CASHIER: {printedBill.staffMember}</span>
                  <span>TIME: {printedBill.time}</span>
                </div>
                {printedBill.customerName && (
                  <div>
                    <span>CUSTOMER: {printedBill.customerName}</span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 border-b border-slate-100 pb-1 uppercase">
                  <span>Dish Description</span>
                  <div className="flex gap-4">
                    <span>Qty</span>
                    <span>Rate</span>
                    <span>Total</span>
                  </div>
                </div>

                {printedBill.items.map((item, i) => (
                  <div key={i} className="text-[11px] space-y-0.5">
                    <div className="flex justify-between font-medium">
                      <span>{item.foodItem.name}</span>
                      <div className="flex gap-4">
                        <span className="w-6 text-center">{item.quantity}</span>
                        <span className="w-8 text-right">₹{item.foodItem.price}</span>
                        <span className="w-10 text-right font-bold">₹{item.foodItem.price * item.quantity}</span>
                      </div>
                    </div>
                    {item.notes && (
                      <span className="text-[9px] text-slate-500 italic block pl-1">
                        * Note: {item.notes}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Totals Block */}
              <div className="space-y-1 text-xs border-b border-dashed border-slate-300 pb-3">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span className="font-bold">₹{printedBill.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>CGST ({hotelInfo.cgstRate}%):</span>
                  <span>₹{printedBill.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>SGST ({hotelInfo.sgstRate}%):</span>
                  <span>₹{printedBill.sgst.toFixed(2)}</span>
                </div>
                {printedBill.discount > 0 && (
                  <div className="flex justify-between text-[11px] text-rose-600 font-medium">
                    <span>Discounts Applied:</span>
                    <span>-₹{printedBill.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-100">
                  <span>NET PAYABLE:</span>
                  <span className="text-dark-teal">₹{printedBill.grandTotal}</span>
                </div>
              </div>

              {/* Thank you note */}
              <div className="text-center pt-2 space-y-1">
                <p className="text-[10px] font-bold text-slate-700 uppercase">*** THANK YOU &amp; VISIT AGAIN ***</p>
                <p className="text-[8px] text-slate-400">Printed via Thermal Billing Engine 1.0.0</p>
              </div>
            </div>

            {/* Print Dialogue trigger buttons */}
            <div className="flex gap-3 pt-3 border-t border-slate-100 print:hidden">
              <button
                onClick={() => setPrintedBill(null)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Close Window
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-lg bg-dark-teal text-white text-xs font-semibold hover:bg-dark-teal-hover transition-all flex items-center justify-center gap-1 shadow-md shadow-dark-teal/10"
              >
                <Printer className="w-4 h-4" /> Trigger Native Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
