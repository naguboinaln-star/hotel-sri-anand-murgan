/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Percent,
  AlertTriangle,
  Users,
  PlusCircle,
  History,
  FileText,
  Settings as SettingsIcon,
  Bell,
  CheckCircle,
  IndianRupee,
} from 'lucide-react';
import { Order, Expense, InventoryItem, Employee, AppNotification } from '../types';

interface DashboardProps {
  orders: Order[];
  expenses: Expense[];
  inventory: InventoryItem[];
  employees: Employee[];
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onNavigate: (tabId: string) => void;
}

export default function DashboardView({
  orders,
  expenses,
  inventory,
  employees,
  notifications,
  onMarkNotificationRead,
  onNavigate,
}: DashboardProps) {
  const [activeChart, setActiveChart] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Calculate stats
  const todayStr = new Date().toISOString().split('T')[0];

  const todayOrders = orders.filter(o => o.date === todayStr && o.status !== 'Cancelled');
  const todaySales = todayOrders.reduce((sum, o) => sum + o.grandTotal, 0);

  const totalOrdersCount = todayOrders.length;

  const todayExpensesSum = expenses
    .filter(e => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  const netProfit = todaySales - todayExpensesSum;

  const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock);
  const pendingStockAlertsCount = lowStockItems.length;

  const activeEmployeesCount = employees.length;

  // Recent 5 completed orders
  const recentOrders = orders.filter(o => o.status === 'Completed').slice(0, 5);

  // Generate Chart Data dynamically based on the passed arrays
  const getDailyChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayOrders = orders.filter(o => o.date === date && o.status === 'Completed');
      const sales = dayOrders.reduce((sum, o) => sum + o.grandTotal, 0);
      const label = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
      return { label, sales, count: dayOrders.length };
    });
  };

  const getWeeklyChartData = () => {
    // Group into last 4 weeks
    const data = [
      { label: 'Week 1', sales: 0, count: 0 },
      { label: 'Week 2', sales: 0, count: 0 },
      { label: 'Week 3', sales: 0, count: 0 },
      { label: 'Week 4', sales: 0, count: 0 },
    ];

    const today = new Date();
    orders.forEach(o => {
      if (o.status !== 'Completed') return;
      const orderDate = new Date(o.date);
      const diffTime = Math.abs(today.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) {
        data[3].sales += o.grandTotal;
        data[3].count++;
      } else if (diffDays <= 14) {
        data[2].sales += o.grandTotal;
        data[2].count++;
      } else if (diffDays <= 21) {
        data[1].sales += o.grandTotal;
        data[1].count++;
      } else if (diffDays <= 28) {
        data[0].sales += o.grandTotal;
        data[0].count++;
      }
    });

    return data;
  };

  const getMonthlyChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    const last6MonthsIndices = Array.from({ length: 6 }, (_, i) => {
      return (currentMonthIdx - 5 + i + 12) % 12;
    });

    return last6MonthsIndices.map(mIdx => {
      const year = new Date().getFullYear() - (mIdx > currentMonthIdx ? 1 : 0);
      const monthPrefix = `${year}-${(mIdx + 1).toString().padStart(2, '0')}`;
      const monthOrders = orders.filter(
        o => o.date.startsWith(monthPrefix) && o.status === 'Completed'
      );
      const sales = monthOrders.reduce((sum, o) => sum + o.grandTotal, 0);
      return {
        label: months[mIdx],
        sales,
        count: monthOrders.length,
      };
    });
  };

  const getExpenseBreakdownData = () => {
    const breakdown: { [key: string]: number } = {};
    expenses.forEach(e => {
      breakdown[e.type] = (breakdown[e.type] || 0) + e.amount;
    });
    return Object.entries(breakdown).map(([type, amount]) => ({
      type,
      amount,
    }));
  };

  const chartData =
    activeChart === 'daily'
      ? getDailyChartData()
      : activeChart === 'weekly'
        ? getWeeklyChartData()
        : getMonthlyChartData();

  const expenseBreakdown = getExpenseBreakdownData();
  const maxSale = Math.max(...chartData.map(d => d.sales), 100);
  const maxExpense = Math.max(...expenseBreakdown.map(d => d.amount), 100);

  return (
    <div className="space-y-6" id="dashboard-module">
      {/* Notifications and Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-dark-teal tracking-tight font-display">
            Operational Dashboard
          </h2>
          <p className="text-slate-gray text-sm">
            Live overview of Hotel Sri Anand Murgan operations and sales metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-slate-100 text-slate-gray px-3 py-1 rounded-full border border-slate-200">
            Current Date: {todayStr}
          </span>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Sales */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100 border-l-4 border-[#004d40] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-gray uppercase tracking-wider">Today's Sales</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-[#004d40]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold font-mono text-dark-teal flex items-center">
              <IndianRupee className="w-5 h-5 stroke-[2.5]" />
              {todaySales.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">Live update</p>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100 border-l-4 border-[#d4af37] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-gray uppercase tracking-wider">Today's Orders</span>
            <div className="p-2 bg-amber-50 rounded-lg text-[#d4af37]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold font-mono text-dark-teal">
              {totalOrdersCount}
            </div>
            <p className="text-xs text-amber-600 mt-1">Total billing tokens</p>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100 border-l-4 border-[#ff7f50] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-gray uppercase tracking-wider">Today's Expenses</span>
            <div className="p-2 bg-coral/10 rounded-lg text-coral">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold font-mono text-dark-teal flex items-center">
              <IndianRupee className="w-5 h-5 stroke-[2.5]" />
              {todayExpensesSum.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-coral mt-1">Logged today</p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100 border-l-4 border-[#10b981] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-gray uppercase tracking-wider">Today's Net Profit</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-green">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className={`text-2xl font-bold font-mono flex items-center ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              <IndianRupee className="w-5 h-5 stroke-[2.5]" />
              {netProfit.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-1">Sales minus Expenses</p>
          </div>
        </div>

        {/* Pending Stock */}
        <div className={`bg-white rounded-xl p-4 shadow-xs border border-l-4 border-amber-500 flex flex-col justify-between hover:shadow-md transition-shadow ${pendingStockAlertsCount > 0 ? 'border-amber-200 bg-amber-50/20' : 'border-slate-100'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-gray uppercase tracking-wider">Stock Warnings</span>
            <div className={`p-2 rounded-lg ${pendingStockAlertsCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-amber-50 text-amber-600'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className={`text-2xl font-bold font-mono ${pendingStockAlertsCount > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
              {pendingStockAlertsCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">Items below min stock</p>
          </div>
        </div>

        {/* Staff Members */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100 border-l-4 border-blue-500 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-gray uppercase tracking-wider">Staff Count</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold font-mono text-dark-teal">
              {activeEmployeesCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">Registered staff</p>
          </div>
        </div>
      </div>

      {/* Central Content: Charts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Column */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="font-semibold text-dark-teal font-display">Revenue Analytics</h3>
              <p className="text-xs text-slate-gray">Monitor billing income and performance trends.</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
              <button
                onClick={() => setActiveChart('daily')}
                className={`px-3 py-1 rounded-md transition-colors ${activeChart === 'daily' ? 'bg-white text-dark-teal shadow-xs' : 'hover:text-dark-teal'}`}
              >
                7 Days
              </button>
              <button
                onClick={() => setActiveChart('weekly')}
                className={`px-3 py-1 rounded-md transition-colors ${activeChart === 'weekly' ? 'bg-white text-dark-teal shadow-xs' : 'hover:text-dark-teal'}`}
              >
                4 Weeks
              </button>
              <button
                onClick={() => setActiveChart('monthly')}
                className={`px-3 py-1 rounded-md transition-colors ${activeChart === 'monthly' ? 'bg-white text-dark-teal shadow-xs' : 'hover:text-dark-teal'}`}
              >
                6 Months
              </button>
            </div>
          </div>

          {/* SVG Custom Revenue Chart */}
          <div className="h-64 flex flex-col justify-between mt-6">
            <div className="flex h-48 items-end gap-3 sm:gap-6 border-b border-slate-200 pb-2">
              {chartData.map((d, index) => {
                const heightPercentage = Math.max((d.sales / maxSale) * 100, 5); // Minimum height to show bar
                return (
                  <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-dark-teal text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg font-mono whitespace-nowrap">
                      ₹{d.sales} ({d.count} orders)
                    </div>

                    {/* Bar graphic */}
                    <div
                      style={{ height: `${heightPercentage}%` }}
                      className="w-full bg-gradient-to-t from-dark-teal to-dark-teal-light rounded-t-md transition-all duration-500 hover:from-warm-gold hover:to-warm-gold hover:shadow-md cursor-pointer"
                    />

                    {/* Label */}
                    <span className="text-[10px] font-medium text-slate-500 mt-2 rotate-12 sm:rotate-0">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-xs text-slate-gray pt-2 px-2">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-dark-teal rounded-full" />
                <span>Gross Income (₹)</span>
              </div>
              <span className="text-[10px] font-mono">Max: ₹{maxSale.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions and Alerts Panel */}
        <div className="space-y-6">
          {/* Quick Actions Grid */}
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs">
            <h3 className="font-semibold text-dark-teal font-display border-b border-slate-100 pb-3 mb-4">
              Quick Counter Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate('billing')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 bg-teal-50/30 hover:bg-teal-50 text-dark-teal transition-all group text-center"
              >
                <PlusCircle className="w-6 h-6 text-dark-teal group-hover:scale-110 transition-transform mb-2" />
                <span className="text-xs font-semibold">New Order</span>
              </button>
              <button
                onClick={() => onNavigate('history')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 bg-amber-50/30 hover:bg-amber-50 text-warm-gold transition-all group text-center"
              >
                <History className="w-6 h-6 text-warm-gold group-hover:scale-110 transition-transform mb-2" />
                <span className="text-xs font-semibold">Order History</span>
              </button>
              <button
                onClick={() => onNavigate('expenses')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 bg-coral/5 hover:bg-coral/10 text-coral transition-all group text-center"
              >
                <CreditCard className="w-6 h-6 text-coral group-hover:scale-110 transition-transform mb-2" />
                <span className="text-xs font-semibold">Add Expense</span>
              </button>
              <button
                onClick={() => onNavigate('reports')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 bg-emerald-50/30 hover:bg-emerald-50 text-emerald-green transition-all group text-center"
              >
                <FileText className="w-6 h-6 text-emerald-green group-hover:scale-110 transition-transform mb-2" />
                <span className="text-xs font-semibold">View Reports</span>
              </button>
            </div>
          </div>

          {/* Active Notifications / Alerts */}
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-warm-gold" />
                <h3 className="font-semibold text-dark-teal font-display">System Notifications</h3>
              </div>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {notifications.filter(n => !n.read).length} New
                </span>
              )}
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-xs">
                  No notifications recorded.
                </div>
              ) : (
                notifications.map(noti => (
                  <div
                    key={noti.id}
                    className={`p-3 rounded-lg border text-xs relative group transition-colors ${
                      noti.read
                        ? 'bg-slate-50 border-slate-100 text-slate-500'
                        : noti.type === 'warning'
                          ? 'bg-amber-50/50 border-amber-200 text-amber-900'
                          : noti.type === 'success'
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                            : 'bg-teal-50/50 border-teal-200 text-teal-900'
                    }`}
                  >
                    <div className="pr-6">
                      <p className="font-medium">{noti.text}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(noti.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {!noti.read && (
                      <button
                        onClick={() => onMarkNotificationRead(noti.id)}
                        className="absolute right-2 top-2 p-1 text-slate-400 hover:text-dark-teal transition-colors"
                        title="Mark as Read"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Invoices and Expense breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices List */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-semibold text-dark-teal font-display">Recent Counter Bills</h3>
              <p className="text-xs text-slate-gray">Last completed table and takeaway receipts.</p>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-dark-teal font-medium hover:underline"
            >
              View All History
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-gray border-b border-slate-100 uppercase text-[10px] font-mono">
                  <th className="py-2.5 px-3">Bill ID</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Cashier</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400">
                      No invoices recorded today yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order, i) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-dark-teal">{order.id}</td>
                      <td className="py-3 px-3 text-slate-500 font-mono">{order.time}</td>
                      <td className="py-3 px-3 text-slate-600">{order.staffMember}</td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                        {order.items.map(item => `${item.foodItem.name} x ${item.quantity}`).join(', ')}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          order.paymentMethod === 'Cash'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : order.paymentMethod === 'UPI'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold font-mono text-slate-900">
                        ₹{order.grandTotal}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Distribution gauge */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-dark-teal font-display border-b border-slate-100 pb-3 mb-4">
              Expense Distribution
            </h3>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {expenseBreakdown.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No expenses logged this month.
                </div>
              ) : (
                expenseBreakdown
                  .sort((a, b) => b.amount - a.amount)
                  .map((item, index) => {
                    const pct = Math.max((item.amount / maxExpense) * 100, 4);
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-700">{item.type}</span>
                          <span className="font-mono text-slate-500 font-semibold">₹{item.amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className={`h-full rounded-full ${
                              index === 0
                                ? 'bg-coral'
                                : index === 1
                                  ? 'bg-amber-600'
                                  : index === 2
                                    ? 'bg-dark-teal-light'
                                    : 'bg-slate-gray'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Total Logged Volume:</span>
            <span className="font-bold font-mono text-dark-teal">
              ₹{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
