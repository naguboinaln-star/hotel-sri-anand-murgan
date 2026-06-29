/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Clock,
  Award,
  ChevronDown,
  Calendar,
  ShoppingBag,
  ArrowUpRight,
  Calculator,
  Flame,
} from 'lucide-react';
import { Order } from '../types';

interface SalesViewProps {
  orders: Order[];
}

export default function SalesView({ orders }: SalesViewProps) {
  const [selectedRange, setSelectedRange] = useState<'today' | 'yesterday' | 'week' | 'month'>('today');

  // Compute standard intervals
  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Helpers
    const getCompletedOrders = (list: Order[]) => list.filter(o => o.status === 'Completed');

    // Filtered lists
    const todayList = getCompletedOrders(orders.filter(o => o.date === todayStr));
    const yesterdayList = getCompletedOrders(orders.filter(o => o.date === yesterdayStr));

    // Weekly List (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const weeklyList = getCompletedOrders(
      orders.filter(o => {
        const oDate = new Date(o.date);
        return oDate >= sevenDaysAgo && oDate <= today;
      })
    );

    // Monthly List (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const monthlyList = getCompletedOrders(
      orders.filter(o => {
        const oDate = new Date(o.date);
        return oDate >= thirtyDaysAgo && oDate <= today;
      })
    );

    // Totals Sum
    const getSum = (list: Order[]) => list.reduce((sum, o) => sum + o.grandTotal, 0);

    return {
      todaySum: getSum(todayList),
      todayCount: todayList.length,
      yesterdaySum: getSum(yesterdayList),
      yesterdayCount: yesterdayList.length,
      weeklySum: getSum(weeklyList),
      weeklyCount: weeklyList.length,
      monthlySum: getSum(monthlyList),
      monthlyCount: monthlyList.length,
    };
  }, [orders]);

  // Selected Active List based on dropdown/toggle
  const activeOrders = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const getCompleted = (list: Order[]) => list.filter(o => o.status === 'Completed');

    if (selectedRange === 'today') {
      return getCompleted(orders.filter(o => o.date === todayStr));
    } else if (selectedRange === 'yesterday') {
      const yes = new Date();
      yes.setDate(today.getDate() - 1);
      const yesStr = yes.toISOString().split('T')[0];
      return getCompleted(orders.filter(o => o.date === yesStr));
    } else if (selectedRange === 'week') {
      const wk = new Date();
      wk.setDate(today.getDate() - 7);
      return getCompleted(orders.filter(o => new Date(o.date) >= wk));
    } else {
      const mn = new Date();
      mn.setDate(today.getDate() - 30);
      return getCompleted(orders.filter(o => new Date(o.date) >= mn));
    }
  }, [orders, selectedRange]);

  // Aggregate Metrics over active list
  const activeMetrics = useMemo(() => {
    if (activeOrders.length === 0) {
      return {
        highestDish: 'N/A',
        highestDishQty: 0,
        avgOrder: 0,
        peakHour: 'N/A',
        peakHourOrders: 0,
        salesTimeline: [] as any[],
      };
    }

    // 1. Highest Selling Dish
    const dishSales: { [name: string]: number } = {};
    activeOrders.forEach(order => {
      order.items.forEach(item => {
        dishSales[item.foodItem.name] = (dishSales[item.foodItem.name] || 0) + item.quantity;
      });
    });

    let highestDish = 'N/A';
    let highestDishQty = 0;
    Object.entries(dishSales).forEach(([name, qty]) => {
      if (qty > highestDishQty) {
        highestDish = name;
        highestDishQty = qty;
      }
    });

    // 2. Average Order Value
    const totalRevenue = activeOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    const avgOrder = parseFloat((totalRevenue / activeOrders.length).toFixed(1));

    // 3. Peak Business Hour
    const hourHistogram: { [hour: number]: number } = {};
    activeOrders.forEach(order => {
      const hour = parseInt(order.time.split(':')[0], 10);
      if (!isNaN(hour)) {
        hourHistogram[hour] = (hourHistogram[hour] || 0) + 1;
      }
    });

    let peakHourStr = 'N/A';
    let peakHourOrders = 0;
    Object.entries(hourHistogram).forEach(([hour, count]) => {
      if (count > peakHourOrders) {
        const hNum = parseInt(hour, 10);
        const ampm = hNum >= 12 ? 'PM' : 'AM';
        const displayHour = hNum % 12 || 12;
        peakHourStr = `${displayHour} ${ampm} - ${(displayHour + 1) % 12 || 12} ${ampm}`;
        peakHourOrders = count;
      }
    });

    // 4. Sales timeline by hour for active list (e.g., Breakfast 7-11 AM, Lunch 12-3 PM, Dinner 6-9 PM)
    const segments = [
      { label: 'Breakfast (7-11 AM)', sales: 0 },
      { label: 'Lunch (11 AM - 3 PM)', sales: 0 },
      { label: 'Tea & Snacks (3-6 PM)', sales: 0 },
      { label: 'Dinner (6-10 PM)', sales: 0 },
    ];

    activeOrders.forEach(order => {
      const h = parseInt(order.time.split(':')[0], 10);
      if (h >= 7 && h < 11) segments[0].sales += order.grandTotal;
      else if (h >= 11 && h < 15) segments[1].sales += order.grandTotal;
      else if (h >= 15 && h < 18) segments[2].sales += order.grandTotal;
      else if (h >= 18 && h <= 22) segments[3].sales += order.grandTotal;
    });

    return {
      highestDish,
      highestDishQty,
      avgOrder,
      peakHour: peakHourStr,
      peakHourOrders,
      salesTimeline: segments,
    };
  }, [activeOrders]);

  // Max segment height helper
  const maxSegmentVal = Math.max(...activeMetrics.salesTimeline.map(s => s.sales), 100);

  return (
    <div className="space-y-6" id="daily-sales-module">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-xl p-4 border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-dark-teal font-display">Sales Analytics &amp; Demographics</h2>
          <p className="text-xs text-slate-gray">Monitor billing ranges, highest selling food recipes, and peak business timings.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600">
          {(['today', 'yesterday', 'week', 'month'] as const).map(range => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1.5 rounded-md transition-colors capitalize ${
                selectedRange === range ? 'bg-white text-dark-teal shadow-xs' : 'hover:text-dark-teal'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Interval metrics overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100">
          <p className="text-[10px] font-bold text-slate-gray uppercase">Today's Sales</p>
          <p className="text-xl font-black font-mono text-emerald-700 mt-1">₹{stats.todaySum.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">{stats.todayCount} completed tokens</p>
        </div>

        {/* Yesterday */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100">
          <p className="text-[10px] font-bold text-slate-gray uppercase">Yesterday's Sales</p>
          <p className="text-xl font-bold font-mono text-dark-teal mt-1">₹{stats.yesterdaySum.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400 mt-1">{stats.yesterdayCount} completed tokens</p>
        </div>

        {/* Weekly */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100">
          <p className="text-[10px] font-bold text-slate-gray uppercase">Weekly Volume (7 Days)</p>
          <p className="text-xl font-bold font-mono text-dark-teal mt-1">₹{stats.weeklySum.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400 mt-1">{stats.weeklyCount} completed tokens</p>
        </div>

        {/* Monthly */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100">
          <p className="text-[10px] font-bold text-slate-gray uppercase">Monthly Volume (30 Days)</p>
          <p className="text-xl font-bold font-mono text-dark-teal mt-1">₹{stats.monthlySum.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400 mt-1">{stats.monthlyCount} completed tokens</p>
        </div>
      </div>

      {/* Detailed analytical cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Segment 1: Busiest Timings chart */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs md:col-span-2">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-dark-teal font-display text-sm">Revenue Peak TIMELINE ({selectedRange})</h3>
              <p className="text-[10px] text-slate-gray">Hourly segments corresponding to breakfast, lunch, tea, and dinner.</p>
            </div>
            <Clock className="w-4 h-4 text-slate-gray" />
          </div>

          <div className="h-56 flex flex-col justify-between mt-4">
            <div className="flex h-44 items-end gap-6 border-b border-slate-200 pb-2">
              {activeMetrics.salesTimeline.map((seg, i) => {
                const heightPct = Math.max((seg.sales / maxSegmentVal) * 100, 4);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 bg-dark-teal text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all z-10 font-mono">
                      ₹{seg.sales.toLocaleString('en-IN')}
                    </div>

                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-gradient-to-t from-dark-teal to-dark-teal-light rounded-t-lg group-hover:from-warm-gold group-hover:to-warm-gold hover:shadow-lg transition-all"
                    />

                    <span className="text-[10px] font-bold text-slate-gray mt-2 text-center truncate w-full max-w-full">
                      {seg.label.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 font-mono">
              <span>Operational: 7:00 AM - 10:00 PM</span>
              <span>Max segment: ₹{maxSegmentVal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Segment 2: Side panels of indicators */}
        <div className="space-y-6">
          {/* Top Indicators */}
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-bold text-dark-teal font-display text-sm border-b border-slate-100 pb-3">
              Performance Insights
            </h3>

            {/* Highest Dish */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-700">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-gray uppercase font-semibold">Highest Selling Recipe</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{activeMetrics.highestDish}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{activeMetrics.highestDishQty} plate/unit portion sales</p>
              </div>
            </div>

            {/* Peak Hours */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-700">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-gray uppercase font-semibold">Peak Timings Hour</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{activeMetrics.peakHour}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Audited {activeMetrics.peakHourOrders} receipts booked</p>
              </div>
            </div>

            {/* Average Order Value */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-gray uppercase font-semibold">Average Ticket Value</p>
                <p className="font-bold font-mono text-slate-800 text-base mt-0.5">₹{activeMetrics.avgOrder}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Net average per customer transaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
