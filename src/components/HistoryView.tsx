/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Filter,
  Download,
  Printer,
  ChevronDown,
  Trash2,
  FileSpreadsheet,
  X,
  CreditCard,
  IndianRupee,
  Clock,
} from 'lucide-react';
import { Order, PaymentMethod } from '../types';

interface HistoryViewProps {
  orders: Order[];
  hotelInfo: any;
  onCancelOrder: (id: string) => void;
  onDeleteOrderPermanently: (id: string) => void;
  activeSessionUser: string;
}

export default function HistoryView({
  orders,
  hotelInfo,
  onCancelOrder,
  onDeleteOrderPermanently,
  activeSessionUser,
}: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('All');
  const [selectedStaff, setSelectedStaff] = useState<string>('All');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

  // View item details in a dedicated billing receipt modal
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Get list of unique cashiers for filter option dropdown
  const uniqueCashiers = useMemo(() => {
    const list = new Set<string>();
    orders.forEach(o => {
      if (o.staffMember) list.add(o.staffMember);
    });
    return Array.from(list);
  }, [orders]);

  // Filter history logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search Box (ID, Cashier, Customer)
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.staffMember.toLowerCase().includes(searchTerm.toLowerCase());

      // Date Filter
      const matchesDate = !selectedDate || order.date === selectedDate;

      // Payment Filter
      const matchesPayment =
        selectedPaymentMethod === 'All' || order.paymentMethod === selectedPaymentMethod;

      // Staff Filter
      const matchesStaff = selectedStaff === 'All' || order.staffMember === selectedStaff;

      // Price Threshold Filters
      const matchesMinPrice = minPrice === '' || order.grandTotal >= Number(minPrice);
      const matchesMaxPrice = maxPrice === '' || order.grandTotal <= Number(maxPrice);

      return matchesSearch && matchesDate && matchesPayment && matchesStaff && matchesMinPrice && matchesMaxPrice;
    });
  }, [orders, searchTerm, selectedDate, selectedPaymentMethod, selectedStaff, minPrice, maxPrice]);

  // Calculations for summarized metrics in history list
  const totalsSummary = useMemo(() => {
    const list = filteredOrders.filter(o => o.status === 'Completed');
    const gross = list.reduce((sum, o) => sum + o.grandTotal, 0);
    const sub = list.reduce((sum, o) => sum + o.subtotal, 0);
    const tax = list.reduce((sum, o) => sum + o.cgst + o.sgst, 0);
    return { gross, sub, tax, count: list.length, cancelledCount: filteredOrders.filter(o => o.status === 'Cancelled').length };
  }, [filteredOrders]);

  // Export to Excel / CSV format (Fully compatible with Google Sheets & Excel)
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert('No record to export!');
      return;
    }

    const headers = [
      'Order ID',
      'Date',
      'Time',
      'Customer',
      'Total Items Count',
      'Subtotal (INR)',
      'CGST (INR)',
      'SGST (INR)',
      'Discount (INR)',
      'Grand Total (INR)',
      'Payment Method',
      'Cashier Staff',
      'Bill Status',
    ];

    const rows = filteredOrders.map(o => [
      o.id,
      o.date,
      o.time,
      o.customerName || 'N/A',
      o.items.reduce((sum, item) => sum + item.quantity, 0),
      o.subtotal,
      o.cgst,
      o.sgst,
      o.discount,
      o.grandTotal,
      o.paymentMethod,
      o.staffMember,
      o.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sri_Anand_Murgan_Bills_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAdminDelete = (id: string) => {
    if (window.confirm('CRITICAL WARN: Are you sure you want to permanently purge this order bill from the database? This is irreversible and changes historical audits.')) {
      onDeleteOrderPermanently(id);
      setSelectedOrderDetails(null);
    }
  };

  return (
    <div className="space-y-6" id="history-module">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-xl p-4 border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-dark-teal font-display">Permanent Order Audit Registry</h2>
          <p className="text-xs text-slate-gray">Audit and view complete financial transaction accounts, payment methods, and invoices.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md shadow-emerald-700/10 cursor-pointer self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export Audit to Excel
        </button>
      </div>

      {/* Advanced Filters Block */}
      <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Registry Filter Panel
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Text Search */}
          <div>
            <label className="block text-[10px] font-bold text-slate-gray uppercase">Search</label>
            <div className="relative mt-1">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="ID, Cashier, Table..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-2 py-1.5 w-full text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white text-slate-800 font-semibold"
              />
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-[10px] font-bold text-slate-gray uppercase">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="mt-1 w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white text-slate-800 font-mono font-semibold"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[10px] font-bold text-slate-gray uppercase">Payment Method</label>
            <select
              value={selectedPaymentMethod}
              onChange={e => setSelectedPaymentMethod(e.target.value)}
              className="mt-1 w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white text-slate-800 font-semibold"
            >
              <option value="All">All Methods</option>
              <option value="Cash">Cash Only</option>
              <option value="UPI">UPI Digital</option>
              <option value="Card">POS Cards</option>
            </select>
          </div>

          {/* Cashier Staff */}
          <div>
            <label className="block text-[10px] font-bold text-slate-gray uppercase">Cashier</label>
            <select
              value={selectedStaff}
              onChange={e => setSelectedStaff(e.target.value)}
              className="mt-1 w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white text-slate-800 font-semibold"
            >
              <option value="All">All Operators</option>
              {uniqueCashiers.map(cashier => (
                <option key={cashier} value={cashier}>
                  {cashier}
                </option>
              ))}
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-[10px] font-bold text-slate-gray uppercase">Min Price (₹)</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
              className="mt-1 w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white text-slate-800 font-mono font-bold"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-[10px] font-bold text-slate-gray uppercase">Max Price (₹)</label>
            <input
              type="number"
              placeholder="1000+"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
              className="mt-1 w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white text-slate-800 font-mono font-bold"
            />
          </div>
        </div>

        {/* Clear Filter Shortcut */}
        {(searchTerm || selectedDate || selectedPaymentMethod !== 'All' || selectedStaff !== 'All' || minPrice !== '' || maxPrice !== '') && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDate('');
                setSelectedPaymentMethod('All');
                setSelectedStaff('All');
                setMinPrice('');
                setMaxPrice('');
              }}
              className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Audit Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-teal-50/40 p-4 border border-teal-100 rounded-xl">
        <div className="text-center sm:text-left">
          <p className="text-[10px] text-slate-500 font-semibold uppercase">Aggregated Subtotal</p>
          <p className="text-base font-bold font-mono text-dark-teal mt-0.5">₹{totalsSummary.sub.toLocaleString('en-IN')}</p>
        </div>
        <div className="text-center border-y sm:border-y-0 sm:border-x border-teal-100 py-2 sm:py-0 px-4">
          <p className="text-[10px] text-slate-500 font-semibold uppercase">Gross Revenue (Tax Incl.)</p>
          <p className="text-base font-bold font-mono text-emerald-700 mt-0.5">₹{totalsSummary.gross.toLocaleString('en-IN')}</p>
        </div>
        <div className="text-center sm:text-right">
          <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Completed Audits</p>
          <p className="text-base font-bold font-mono text-dark-teal mt-0.5">
            {totalsSummary.count} <span className="text-[10px] font-sans text-slate-400">({totalsSummary.cancelledCount} Cancelled)</span>
          </p>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-gray border-b border-slate-100 uppercase text-[10px] font-mono">
                <th className="py-3 px-4">Bill ID</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Purchased Items</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4 text-right">Invoice Amount</th>
                <th className="py-3 px-4 text-center">Audit Status</th>
                <th className="py-3 px-4 text-right">Receipt Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <Calendar className="w-12 h-12 mx-auto text-slate-200 mb-2" />
                    <p className="font-semibold text-slate-500">No matching orders found.</p>
                    <p className="text-xs text-slate-400 mt-1">Try relaxing your search terms or filter constraints.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr
                    key={order.id}
                    className={`hover:bg-slate-50/50 transition-colors ${
                      order.status === 'Cancelled' ? 'bg-rose-50/20 text-slate-400' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-dark-teal">
                      {order.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold font-mono text-slate-700">{order.date}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">{order.time}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">
                        {order.customerName || <em className="text-slate-300 font-normal">Counter Takeaway</em>}
                      </span>
                      <div className="text-[9px] text-slate-400 mt-0.5">Staff: {order.staffMember}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate font-medium text-slate-600">
                      {order.items.map(i => `${i.foodItem.name} x${i.quantity}`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.paymentMethod === 'Cash'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : order.paymentMethod === 'UPI'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black font-mono text-sm text-slate-900">
                      ₹{order.grandTotal}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        order.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrderDetails(order)}
                        className="px-2.5 py-1.5 bg-slate-100 text-dark-teal font-semibold rounded-lg hover:bg-dark-teal hover:text-white transition-all text-[10px]"
                      >
                        Inspect Bill
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Inspector / Receipt Modal dialogue */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 relative animate-scale-up my-8">
            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="absolute right-3 top-3 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 print:hidden"
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
                  <span>BILL ID: <strong className="text-slate-900">{selectedOrderDetails.id}</strong></span>
                  <span>DATE: {selectedOrderDetails.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>CASHIER: {selectedOrderDetails.staffMember}</span>
                  <span>TIME: {selectedOrderDetails.time}</span>
                </div>
                {selectedOrderDetails.customerName && (
                  <div>
                    <span>CUSTOMER: {selectedOrderDetails.customerName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>PAY METHOD: {selectedOrderDetails.paymentMethod}</span>
                  <span>STATUS: <strong className={selectedOrderDetails.status === 'Completed' ? 'text-emerald-700' : 'text-rose-600'}>{selectedOrderDetails.status}</strong></span>
                </div>
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

                {selectedOrderDetails.items.map((item, i) => (
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
                  <span className="font-bold">₹{selectedOrderDetails.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>CGST ({hotelInfo.cgstRate}%):</span>
                  <span>₹{selectedOrderDetails.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>SGST ({hotelInfo.sgstRate}%):</span>
                  <span>₹{selectedOrderDetails.sgst.toFixed(2)}</span>
                </div>
                {selectedOrderDetails.discount > 0 && (
                  <div className="flex justify-between text-[11px] text-rose-600 font-medium">
                    <span>Discounts Applied:</span>
                    <span>-₹{selectedOrderDetails.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-100">
                  <span>NET PAYABLE:</span>
                  <span className="text-dark-teal">₹{selectedOrderDetails.grandTotal}</span>
                </div>
              </div>

              {/* Thank you note */}
              <div className="text-center pt-2 space-y-1">
                <p className="text-[10px] font-bold text-slate-700 uppercase">*** THANK YOU &amp; VISIT AGAIN ***</p>
                <p className="text-[8px] text-slate-400">Printed via Thermal Billing Engine 1.0.0</p>
              </div>
            </div>

            {/* Print Dialogue trigger buttons & admin cancellations */}
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 print:hidden">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => window.print()}
                  className="py-2 bg-dark-teal text-white rounded-lg text-xs font-semibold hover:bg-dark-teal-hover transition-all flex items-center justify-center gap-1 shadow-md shadow-dark-teal/10 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Bill
                </button>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Close Bill
                </button>
              </div>

              {selectedOrderDetails.status === 'Completed' && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to void and cancel this billing order? This returns stock metrics and changes revenue stats.')) {
                      onCancelOrder(selectedOrderDetails.id);
                      setSelectedOrderDetails(null);
                    }
                  }}
                  className="py-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors font-bold mt-1"
                >
                  Void/Cancel Order Bill
                </button>
              )}

              <button
                onClick={() => handleAdminDelete(selectedOrderDetails.id)}
                className="text-[10px] text-slate-400 hover:text-rose-600 py-1 transition-colors hover:underline text-center font-semibold mt-2"
              >
                Permanently Delete Record (Admin Mode Only)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
