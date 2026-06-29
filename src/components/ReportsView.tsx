/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  CreditCard,
  Percent,
  CheckCircle,
  Clock,
  Briefcase,
  Layers,
} from 'lucide-react';
import { Order, Expense, InventoryItem, Employee } from '../types';

interface ReportsViewProps {
  orders: Order[];
  expenses: Expense[];
  inventory: InventoryItem[];
  employees: Employee[];
}

export default function ReportsView({ orders, expenses, inventory, employees }: ReportsViewProps) {
  const [selectedReportMonth, setSelectedReportMonth] = useState('2026-06');

  // Compute profit and loss ledger
  const auditReport = useMemo(() => {
    // Filter by selected month string (YYYY-MM)
    const completedOrdersInMonth = orders.filter(
      o => o.date.startsWith(selectedReportMonth) && o.status === 'Completed'
    );
    const expensesInMonth = expenses.filter(e => e.date.startsWith(selectedReportMonth));

    // Financial aggregates
    const subtotalSales = completedOrdersInMonth.reduce((sum, o) => sum + o.subtotal, 0);
    const taxSales = completedOrdersInMonth.reduce((sum, o) => sum + o.cgst + o.sgst, 0);
    const discountsGiven = completedOrdersInMonth.reduce((sum, o) => sum + o.discount, 0);
    const grossSalesRevenue = completedOrdersInMonth.reduce((sum, o) => sum + o.grandTotal, 0);

    const totalOperationalExpenses = expensesInMonth.reduce((sum, e) => sum + e.amount, 0);

    // Staff Salaries disbursement projection
    const staffSalaryBill = 0;

    const totalExpenditures = totalOperationalExpenses + staffSalaryBill;
    const netProfitBalance = grossSalesRevenue - totalExpenditures;

    const profitMarginPercentage =
      grossSalesRevenue > 0 ? parseFloat(((netProfitBalance / grossSalesRevenue) * 100).toFixed(1)) : 0;

    return {
      subtotalSales,
      taxSales,
      discountsGiven,
      grossSalesRevenue,
      totalOperationalExpenses,
      staffSalaryBill,
      totalExpenditures,
      netProfitBalance,
      profitMarginPercentage,
      ordersCount: completedOrdersInMonth.length,
      expensesCount: expensesInMonth.length,
    };
  }, [orders, expenses, employees, selectedReportMonth]);

  // Export reports data to Microsoft Excel CSV format
  const handleExportCSV = () => {
    const headers = ['Financial Ledger Item', 'Volume / Details', 'Value (INR)'];
    const rows = [
      ['Gross Sales Revenue (Receipts)', `${auditReport.ordersCount} Completed Orders`, auditReport.grossSalesRevenue],
      ['Items Net Subtotal', 'Excluding taxes & discounts', auditReport.subtotalSales],
      ['Taxes Gathered (CGST+SGST)', 'Palani GST authorities', auditReport.taxSales],
      ['Discounts Given', 'Promotional receipts', auditReport.discountsGiven],
      ['Staff Monthly Wages Bill', `${employees.length} Registered Employees`, auditReport.staffSalaryBill],
      ['Operational Expenses', `${auditReport.expensesCount} logged vendor bills`, auditReport.totalOperationalExpenses],
      ['Gross Cumulative Expenditures', 'Salaries + procurements', auditReport.totalExpenditures],
      ['NET OPERATIONAL PROFIT', 'Revenue minus cost', auditReport.netProfitBalance],
      ['Wages Net profit margin', 'Margin percentage', `${auditReport.profitMarginPercentage}%`],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sri_Anand_Murgan_Finance_${selectedReportMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="reports-module">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-xl p-4 border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-dark-teal font-display">General Financial Reporting Dashboard</h2>
          <p className="text-xs text-slate-gray">Audit monthly financial ledgers, salary commitments, procurements, and profit margin balances.</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <input
            type="month"
            value={selectedReportMonth}
            onChange={e => setSelectedReportMonth(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-dark-teal text-slate-700 font-mono font-bold"
          />
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Grid of aggregated widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sales */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-gray font-bold uppercase tracking-wider block">Monthly Gross Revenue</span>
            <span className="text-2xl font-black font-mono text-emerald-700 block mt-1">₹{auditReport.grossSalesRevenue.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 mt-1 block font-semibold">{auditReport.ordersCount} sales transactions</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-gray font-bold uppercase tracking-wider block">Monthly Net Expenditures</span>
            <span className="text-2xl font-black font-mono text-rose-600 block mt-1">₹{auditReport.totalExpenditures.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 mt-1 block font-semibold">Salaries + Operational bills</span>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Net margins */}
        <div className={`bg-white rounded-xl p-5 border shadow-xs flex items-center justify-between ${auditReport.netProfitBalance >= 0 ? 'border-emerald-200 bg-emerald-50/10' : 'border-rose-200 bg-rose-50/10'}`}>
          <div>
            <span className="text-[10px] text-slate-gray font-bold uppercase tracking-wider block">Net Profit Margin ({auditReport.profitMarginPercentage}%)</span>
            <span className={`text-2xl font-black font-mono block mt-1 ${auditReport.netProfitBalance >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
              ₹{auditReport.netProfitBalance.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block font-semibold">Wages net operational surplus</span>
          </div>
          <div className={`p-3 rounded-xl ${auditReport.netProfitBalance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
            <Percent className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Ledger Sheet Printout */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6" id="print-receipt-area">
        {/* Printable title */}
        <div className="border-b border-slate-200 pb-4 text-center sm:text-left">
          <h3 className="font-bold text-dark-teal font-display text-base">MONTHLY PROFIT &amp; LOSS LEDGER STATEMENT</h3>
          <p className="text-xs font-mono text-slate-500 mt-1 uppercase">Accounting Period: {selectedReportMonth} | Audit Draft</p>
        </div>

        {/* Ledger Details */}
        <div className="space-y-4">
          <div className="border border-slate-100 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-gray border-b border-slate-100 uppercase text-[10px] font-mono">
                  <th className="py-2.5 px-4">Financial ledger column</th>
                  <th className="py-2.5 px-4">Audit Breakdown</th>
                  <th className="py-2.5 px-4 text-right">Value Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Revenue rows */}
                <tr className="hover:bg-slate-50/30">
                  <td className="py-3 px-4 font-bold text-slate-800">Gross Sales Revenue</td>
                  <td className="py-3 px-4 text-slate-500 font-medium">{auditReport.ordersCount} Completed counter tickets and takeaway bills</td>
                  <td className="py-3 px-4 text-right font-bold font-mono text-emerald-700">₹{auditReport.grossSalesRevenue.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="hover:bg-slate-50/30 text-[11px] text-slate-500">
                  <td className="py-2 px-4 pl-8">-- Menu Items Subtotal</td>
                  <td className="py-2 px-4 font-medium">Excluding taxes &amp; discount values</td>
                  <td className="py-2 px-4 text-right font-mono">₹{auditReport.subtotalSales.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="hover:bg-slate-50/30 text-[11px] text-slate-500">
                  <td className="py-2 px-4 pl-8">-- Taxes Collected (CGST+SGST)</td>
                  <td className="py-2 px-4 font-medium">Accumulated GST calculations</td>
                  <td className="py-2 px-4 text-right font-mono">₹{auditReport.taxSales.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="hover:bg-slate-50/30 text-[11px] text-rose-600 font-medium">
                  <td className="py-2 px-4 pl-8">-- Discounts Deducted</td>
                  <td className="py-2 px-4">Promotional counter adjustments</td>
                  <td className="py-2 px-4 text-right font-mono">- ₹{auditReport.discountsGiven.toLocaleString('en-IN')}</td>
                </tr>

                {/* Expenditure rows */}
                <tr className="hover:bg-slate-50/30">
                  <td className="py-3 px-4 font-bold text-slate-800">Operational Expenditures</td>
                  <td className="py-3 px-4 text-slate-500 font-medium">{auditReport.expensesCount} logged commercial invoices</td>
                  <td className="py-3 px-4 text-right font-bold font-mono text-rose-600">₹{auditReport.totalOperationalExpenses.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="hover:bg-slate-50/30">
                  <td className="py-3 px-4 font-bold text-slate-800">Staff Wages Commitments</td>
                  <td className="py-3 px-4 text-slate-500 font-medium">{employees.length} registered kitchen and counter staff</td>
                  <td className="py-3 px-4 text-right font-bold font-mono text-rose-600">₹{auditReport.staffSalaryBill.toLocaleString('en-IN')}</td>
                </tr>

                {/* Net Profit row */}
                <tr className="bg-slate-50 font-black">
                  <td className="py-3.5 px-4 text-dark-teal text-sm">NET OPERATIONAL PROFIT</td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">Revenue minus combined operational costs</td>
                  <td className={`py-3.5 px-4 text-right font-mono text-sm ${auditReport.netProfitBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    ₹{auditReport.netProfitBalance.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action triggers */}
        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-dark-teal text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-dark-teal-hover transition-all shadow-md shadow-dark-teal/10 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Trigger Report Print (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}
