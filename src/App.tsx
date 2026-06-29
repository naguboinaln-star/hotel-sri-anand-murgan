/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  MenuSquare,
  History as HistoryIcon,
  LineChart,
  Wallet,
  Boxes,
  Users,
  FileBarChart,
  Settings as SettingsIcon,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle,
  HelpCircle,
  X,
  Lock,
  Unlock,
} from 'lucide-react';

// Domain Types
import {
  FoodItem,
  Order,
  Expense,
  InventoryItem,
  Employee,
  HotelInfo,
  AppNotification,
  UserRole,
} from './types';

// Storage Engine
import {
  initLocalDatabase,
  loadFromStorage,
  saveToStorage,
  DEFAULT_HOTEL_INFO,
} from './lib/localDatabase';

// Sub Views
import DashboardView from './components/DashboardView';
import BillingView from './components/BillingView';
import MenuView from './components/MenuView';
import HistoryView from './components/HistoryView';
import SalesView from './components/SalesView';
import ExpenseView from './components/ExpenseView';
import InventoryView from './components/InventoryView';
import SalaryView from './components/SalaryView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import PasswordLockView from './components/PasswordLockView';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeRole, setActiveRole] = useState<UserRole>('Admin');

  // Security lock for specific tabs
  const [appPassword, setAppPassword] = useState<string>(() => localStorage.getItem('app_security_password') || '45718');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  // Core Data States
  const [hotelInfo, setHotelInfo] = useState<HotelInfo>(DEFAULT_HOTEL_INFO);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Search everywhere input
  const [globalSearch, setGlobalSearch] = useState('');
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  // Keyboard shortcut assistant
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);

  // Initialize DB on Startup
  useEffect(() => {
    initLocalDatabase();
    setHotelInfo(loadFromStorage<HotelInfo>('hotel_info', DEFAULT_HOTEL_INFO));
    setFoodItems(loadFromStorage<FoodItem[]>('food_items', []));
    setOrders(loadFromStorage<Order[]>('orders', []));
    setExpenses(loadFromStorage<Expense[]>('expenses', []));
    setInventory(loadFromStorage<InventoryItem[]>('inventory_items', []));
    setEmployees(loadFromStorage<Employee[]>('employees', []));
    setNotifications(loadFromStorage<AppNotification[]>('notifications', []));
  }, []);

  // Keyboard Shortcuts (F2: Billing, F4: History, F8: Sales, Esc: close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('billing');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('history');
      } else if (e.key === 'F8') {
        e.preventDefault();
        setActiveTab('sales');
      } else if (e.key === 'Escape') {
        setShowNotificationPanel(false);
        setShowShortcutHelp(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync state changes back to localStorage automatically
  const updateStateAndStorage = <T,>(key: string, data: T, setter: React.Dispatch<React.SetStateAction<T>>) => {
    setter(data);
    saveToStorage(key, data);
  };

  // Helper to append a system notification
  const addSystemNotification = (text: string, type: 'info' | 'warning' | 'success' | 'error') => {
    const newNoti: AppNotification = {
      id: `NOTI-${Date.now()}`,
      text,
      type,
      timestamp: new Date().toISOString(),
      read: false,
    };
    const updated = [newNoti, ...notifications];
    updateStateAndStorage('notifications', updated, setNotifications);
  };

  // --- MENU MANAGEMENT ---
  const handleAddFoodItem = (newItemData: Omit<FoodItem, 'id'>) => {
    const nextId = `F${foodItems.length + 1}`;
    const newItem: FoodItem = { id: nextId, ...newItemData };
    const updated = [...foodItems, newItem];
    updateStateAndStorage('food_items', updated, setFoodItems);
    addSystemNotification(`New dish "${newItem.name}" added to menu catalog.`, 'success');
  };

  const handleEditFoodItem = (id: string, updatedFields: Partial<FoodItem>) => {
    const updated = foodItems.map(item => {
      if (item.id === id) {
        return { ...item, ...updatedFields };
      }
      return item;
    });
    updateStateAndStorage('food_items', updated, setFoodItems);
  };

  const handleDeleteFoodItem = (id: string) => {
    const updated = foodItems.filter(item => item.id !== id);
    updateStateAndStorage('food_items', updated, setFoodItems);
    addSystemNotification(`Menu code ${id} removed permanently.`, 'info');
  };

  // --- AUTOMATIC STOCK REDUCTION FORMULA ---
  // Calculates and reduces raw stock based on recipe metrics
  const reduceStockForOrder = (orderItems: any[], currentStockList: InventoryItem[]) => {
    const updatedStock = [...currentStockList];

    orderItems.forEach(cartItem => {
      const name = cartItem.foodItem.name.toLowerCase();
      const qty = cartItem.quantity;

      // Ingredient Recipe maps
      let recipe: { [itemName: string]: number } = {};

      if (name.includes('idly')) {
        recipe['Rice'] = 0.05 * qty; // 50g per idly
        recipe['Dal (Toor)'] = 0.015 * qty; // 15g
      } else if (name.includes('dosa')) {
        recipe['Rice'] = 0.08 * qty; // 80g
        recipe['Dal (Toor)'] = 0.02 * qty; // 20g
        if (name.includes('ghee') || name.includes('roast')) {
          recipe['Cooking Oil'] = 0.02 * qty; // 20ml
        }
      } else if (name.includes('vada')) {
        recipe['Dal (Toor)'] = 0.05 * qty; // 50g
        recipe['Cooking Oil'] = 0.03 * qty; // 30ml
      } else if (name.includes('meals') || name.includes('rice')) {
        recipe['Rice'] = 0.2 * qty; // 200g
        recipe['Vegetables (Mixed)'] = 0.1 * qty; // 100g
        recipe['Spices (Masala)'] = 0.01 * qty; // 10g
      } else if (name.includes('coffee') || name.includes('tea')) {
        recipe['Milk'] = 0.1 * qty; // 100ml
        recipe['Sugar'] = 0.015 * qty; // 15g
        if (name.includes('coffee')) recipe['Coffee Powder'] = 0.008 * qty;
      }

      // Apply deductions to stock list
      Object.entries(recipe).forEach(([ingredientName, amountNeeded]) => {
        const idx = updatedStock.findIndex(item => item.name === ingredientName);
        if (idx > -1) {
          updatedStock[idx].currentStock = parseFloat(
            Math.max(0, updatedStock[idx].currentStock - amountNeeded).toFixed(2)
          );

          // Raise dashboard alert if drops below minStock
          if (updatedStock[idx].currentStock <= updatedStock[idx].minStock) {
            addSystemNotification(
              `Critical warning: Ingredient "${ingredientName}" stock has dropped to ${updatedStock[idx].currentStock} ${updatedStock[idx].unit}. Reorder soon.`,
              'warning'
            );
          }
        }
      });
    });

    return updatedStock;
  };

  // --- BILLING / ORDER COMPLETION ---
  const handleCompleteOrder = (orderData: Omit<Order, 'id' | 'date' | 'time'>) => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = today.toTimeString().split(' ')[0];

    // Generate consecutive Order ID for the current date
    const datePart = dateStr.replace(/-/g, '');
    const todaysOrdersCount = orders.filter(o => o.date === dateStr).length + 1;
    const orderId = `ORD-${datePart}-${todaysOrdersCount.toString().padStart(3, '0')}`;

    const newOrder: Order = {
      id: orderId,
      date: dateStr,
      time: timeStr,
      ...orderData,
    };

    // Prepend new order
    const updatedOrders = [newOrder, ...orders];
    updateStateAndStorage('orders', updatedOrders, setOrders);

    // Apply recipe reductions
    const updatedInventory = reduceStockForOrder(orderData.items, inventory);
    updateStateAndStorage('inventory_items', updatedInventory, setInventory);

    addSystemNotification(`Token ID ${orderId} compiled successfully. Revenue ₹${newOrder.grandTotal} registered.`, 'success');
  };

  const handleCancelOrder = (id: string) => {
    // Void order and restore ingredients back to stock
    const updated = orders.map(o => {
      if (o.id === id) {
        return { ...o, status: 'Cancelled' as const };
      }
      return o;
    });
    updateStateAndStorage('orders', updated, setOrders);

    // Restore stock logic
    const canceledOrder = orders.find(o => o.id === id);
    if (canceledOrder) {
      const restoredInventory = [...inventory];
      canceledOrder.items.forEach(cartItem => {
        const name = cartItem.foodItem.name.toLowerCase();
        const qty = cartItem.quantity;
        let recipe: { [itemName: string]: number } = {};

        if (name.includes('idly')) {
          recipe['Rice'] = 0.05 * qty;
          recipe['Dal (Toor)'] = 0.015 * qty;
        } else if (name.includes('dosa')) {
          recipe['Rice'] = 0.08 * qty;
          recipe['Dal (Toor)'] = 0.02 * qty;
        }

        Object.entries(recipe).forEach(([ingName, amt]) => {
          const idx = restoredInventory.findIndex(item => item.name === ingName);
          if (idx > -1) {
            restoredInventory[idx].currentStock = parseFloat(
              (restoredInventory[idx].currentStock + amt).toFixed(2)
            );
          }
        });
      });
      updateStateAndStorage('inventory_items', restoredInventory, setInventory);
    }

    addSystemNotification(`Invoice token ${id} cancelled and voided. Stock returned.`, 'info');
  };

  const handleDeleteOrderPermanently = (id: string) => {
    const updated = orders.filter(o => o.id !== id);
    updateStateAndStorage('orders', updated, setOrders);
    addSystemNotification(`Invoice record ${id} was permanently purged from database audits.`, 'error');
  };

  // --- EXPENSE MANAGEMENT ---
  const handleAddExpense = (newExpenseData: Omit<Expense, 'id'>) => {
    const nextId = `EXP-${expenses.length + 1}`;
    const newExpense: Expense = { id: nextId, ...newExpenseData };
    const updated = [newExpense, ...expenses];
    updateStateAndStorage('expenses', updated, setExpenses);
    addSystemNotification(`Expense payment of ₹${newExpense.amount} paid to "${newExpense.vendorName}" recorded.`, 'success');
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    updateStateAndStorage('expenses', updated, setExpenses);
    addSystemNotification(`Expense log ${id} deleted from books.`, 'info');
  };

  // --- INVENTORY MANAGEMENT ---
  const handleUpdateStock = (id: string, qty: number, type: 'IN' | 'OUT', notes: string) => {
    const updated = inventory.map(item => {
      if (item.id === id) {
        const newStock = type === 'IN' ? item.currentStock + qty : Math.max(0, item.currentStock - qty);
        return { ...item, currentStock: parseFloat(newStock.toFixed(2)) };
      }
      return item;
    });
    updateStateAndStorage('inventory_items', updated, setInventory);
    addSystemNotification(`Stock adjustment of ${qty} for item ID ${id} completed.`, 'success');
  };

  // --- STAFF SALARY payroll ---
  const handleAddEmployee = (newEmpData: Omit<Employee, 'id' | 'attendance'>) => {
    const nextId = `E${employees.length + 1}`;
    const newEmp: Employee = {
      id: nextId,
      attendance: {},
      ...newEmpData,
    };
    const updated = [...employees, newEmp];
    updateStateAndStorage('employees', updated, setEmployees);
    addSystemNotification(`Staff profile registered for "${newEmp.name}".`, 'success');
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    const updated = employees.map(emp => emp.id === updatedEmp.id ? updatedEmp : emp);
    updateStateAndStorage('employees', updated, setEmployees);
    addSystemNotification(`Staff profile updated for "${updatedEmp.name}".`, 'success');
  };

  const handleToggleAttendance = (id: string, date: string, status: 'Present' | 'Absent' | 'Half-Day') => {
    const updated = employees.map(emp => {
      if (emp.id === id) {
        const nextAtt = { ...emp.attendance, [date]: status };
        return { ...emp, attendance: nextAtt };
      }
      return emp;
    });
    updateStateAndStorage('employees', updated, setEmployees);
  };

  // --- HOTEL CONFIG & BRANDING ---
  const handleUpdateHotelInfo = (info: HotelInfo) => {
    updateStateAndStorage('hotel_info', info, setHotelInfo);
  };

  // --- BACKUP & RESTORE SYSTEMS ---
  const handleBackupData = () => {
    const backupObj = {
      hotel_info: hotelInfo,
      food_items: foodItems,
      orders: orders,
      expenses: expenses,
      inventory_items: inventory,
      employees: employees,
      notifications: notifications,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Sri_Anand_Murgan_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addSystemNotification('Entire system database successfully exported to a local JSON backup file.', 'success');
  };

  const handleRestoreData = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.hotel_info && parsed.food_items && parsed.orders) {
        updateStateAndStorage('hotel_info', parsed.hotel_info, setHotelInfo);
        updateStateAndStorage('food_items', parsed.food_items, setFoodItems);
        updateStateAndStorage('orders', parsed.orders, setOrders);
        if (parsed.expenses) updateStateAndStorage('expenses', parsed.expenses, setExpenses);
        if (parsed.inventory_items) updateStateAndStorage('inventory_items', parsed.inventory_items, setInventory);
        if (parsed.employees) updateStateAndStorage('employees', parsed.employees, setEmployees);
        if (parsed.notifications) updateStateAndStorage('notifications', parsed.notifications, setNotifications);
        addSystemNotification('Full system audit files successfully restored from manual backup file.', 'success');
        return true;
      }
    } catch (e) {
      console.error('Restore failed:', e);
    }
    return false;
  };

  const handleResetOrdersOnly = () => {
    updateStateAndStorage('orders', [], setOrders);
    addSystemNotification('Order history and operational metrics successfully reset.', 'info');
  };

  const handleResetAllData = () => {
    localStorage.clear();
    initLocalDatabase();
  };

  const handleMarkNotificationRead = (id: string) => {
    const updated = notifications.map(n => (n.id === id ? { ...n, read: true } : n));
    updateStateAndStorage('notifications', updated, setNotifications);
  };

  // Toggle theme
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  // Render View Routing function
  const renderViewContent = () => {
    if (['dashboard', 'sales', 'expenses', 'settings'].includes(activeTab) && !isUnlocked) {
      return (
        <PasswordLockView
          correctPassword={appPassword}
          onUnlockSuccess={() => {
            setIsUnlocked(true);
            addSystemNotification('Management view unlocked successfully.', 'success');
          }}
          tabName={
            activeTab === 'dashboard'
              ? 'Operational Dashboard'
              : activeTab === 'sales'
                ? 'Daily Sales'
                : activeTab === 'expenses'
                  ? 'Expense Tracker'
                  : 'Management Settings'
          }
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            orders={orders}
            expenses={expenses}
            inventory={inventory}
            employees={employees}
            notifications={notifications}
            onMarkNotificationRead={handleMarkNotificationRead}
            onNavigate={setActiveTab}
          />
        );
      case 'billing':
        return (
          <BillingView
            foodItems={foodItems}
            employees={employees}
            hotelInfo={hotelInfo}
            onCompleteOrder={handleCompleteOrder}
            activeSessionUser={activeRole === 'Admin' ? 'N Lakshmi Narayana' : activeRole === 'Cashier' ? 'Ramesh Sundaram' : 'M. Rajesh'}
          />
        );
      case 'menu':
        return (
          <MenuView
            foodItems={foodItems}
            onAddFoodItem={handleAddFoodItem}
            onEditFoodItem={handleEditFoodItem}
            onDeleteFoodItem={handleDeleteFoodItem}
          />
        );
      case 'history':
        return (
          <HistoryView
            orders={orders}
            hotelInfo={hotelInfo}
            onCancelOrder={handleCancelOrder}
            onDeleteOrderPermanently={handleDeleteOrderPermanently}
            activeSessionUser={activeRole}
          />
        );
      case 'sales':
        return <SalesView orders={orders} />;
      case 'expenses':
        return (
          <ExpenseView
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        );
      case 'inventory':
        return <InventoryView inventory={inventory} onUpdateStock={handleUpdateStock} />;
      case 'salary':
        return (
          <SalaryView
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onToggleAttendance={handleToggleAttendance}
          />
        );
      case 'reports':
        return (
          <ReportsView
            orders={orders}
            expenses={expenses}
            inventory={inventory}
            employees={employees}
          />
        );
      case 'settings':
        return (
          <SettingsView
            hotelInfo={hotelInfo}
            onUpdateHotelInfo={handleUpdateHotelInfo}
            onBackupData={handleBackupData}
            onRestoreData={handleRestoreData}
            onResetAllData={handleResetAllData}
            onResetOrdersOnly={handleResetOrdersOnly}
            currentTheme={theme}
            onToggleTheme={handleToggleTheme}
            activeRole={activeRole}
            onChangeRole={setActiveRole}
            appPassword={appPassword}
            onUpdatePassword={(newPass: string) => {
              setAppPassword(newPass);
              localStorage.setItem('app_security_password', newPass);
            }}
          />
        );
      default:
        return <div className="p-8 text-center text-slate-500">View not compiled.</div>;
    }
  };

  // Sidebar link details mapping
  const sidebarLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing / Live Order', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'menu', label: 'Food Menu', icon: <MenuSquare className="w-4 h-4" /> },
    { id: 'history', label: 'Order History', icon: <HistoryIcon className="w-4 h-4" /> },
    { id: 'sales', label: 'Daily Sales', icon: <LineChart className="w-4 h-4" /> },
    { id: 'expenses', label: 'Expense Tracker', icon: <Wallet className="w-4 h-4" /> },
    { id: 'inventory', label: 'Inventory / Stock', icon: <Boxes className="w-4 h-4" /> },
    { id: 'salary', label: 'Staff Salaries', icon: <Users className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports &amp; Profit', icon: <FileBarChart className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 text-slate-100 dark' : 'bg-[#f4f7f6] text-slate-800'}`}>
      {/* 1. FIXED TOP BRANDING BANNER (Required exactly as image_0.png with Geometric Balance updates) */}
      <header className="relative w-full h-32 md:h-36 overflow-hidden shadow-md flex flex-col items-center justify-center print:hidden border-b-4 border-accent-gold">
        {/* Background Overlay image_0.png */}
        <img
          src="/image_0.png"
          alt="Hotel Sri Anand Murgan banner background"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover select-none"
        />
        {/* Dark Teal / Brass overlay filter */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#004d40]/85 via-[#00695c]/85 to-[#004d40]/95 backdrop-blur-xs" />

        {/* Branding Telugu typography overlaid precisely */}
        <div className="relative text-center space-y-1 md:space-y-1.5 z-10 px-4">
          <p className="text-[10px] md:text-xs font-display tracking-widest text-accent-gold uppercase font-bold animate-pulse">
            శ్రీ తరణి యల్లమ్మ ఆశీస్సులతో
          </p>
          <div className="flex items-center justify-center gap-1.5 md:gap-3">
            <span className="text-xs md:text-sm font-semibold bg-white/10 text-warm-gold-light border border-white/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
              hotel
            </span>
            <h1 className="text-xl md:text-3xl font-extrabold text-white tracking-wide drop-shadow-lg font-display">
              శ్రీ ఆనంద్ మురగన్
            </h1>
          </div>
          <p className="text-[8px] md:text-[10px] font-mono text-slate-300 font-semibold tracking-wider">
            PREMIUM HOTEL OPERATIONS &amp; BILLING TERMINAL ERP
          </p>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION FRAME */}
        <aside
          className={`bg-[#2d3748] border-r border-slate-700 text-slate-300 flex flex-col justify-between transition-all duration-300 print:hidden ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Main Navigation Links */}
          <div className="flex-1 py-4 overflow-y-auto space-y-1.5 scrollbar-none px-2">
            {sidebarLinks.map(link => (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`w-full py-2.5 px-3 flex items-center gap-3.5 transition-all text-xs font-bold cursor-pointer rounded-lg relative ${
                  activeTab === link.id
                    ? 'bg-[#004d40] text-white shadow-md border-l-4 border-accent-gold'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={sidebarCollapsed ? link.label : ''}
              >
                <span className={activeTab === link.id ? 'text-accent-gold scale-110' : 'text-slate-400'}>
                  {link.icon}
                </span>
                {!sidebarCollapsed && (
                  <span className="tracking-wide" dangerouslySetInnerHTML={{ __html: link.label }} />
                )}
              </button>
            ))}
          </div>

          {/* Sidebar profile footer matching Geometric Balance */}
          <div className="p-3 border-t border-slate-700 space-y-3">
            <div className="flex items-center px-2 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
              <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center text-[#004d40] font-bold text-xs shrink-0">
                {activeRole === 'Admin' ? 'LN' : activeRole === 'Manager' ? 'MR' : 'RS'}
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col overflow-hidden ml-2">
                   <span className="text-xs font-bold text-white truncate">
                    {activeRole === 'Admin' ? 'N Lakshmi Narayana' : activeRole === 'Manager' ? 'M. Rajesh' : 'Ramesh S.'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold truncate">{activeRole} Operator</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 text-slate-400 text-xs font-mono px-1">
              {!sidebarCollapsed && (
                <span className="text-[9px] font-bold text-accent-gold uppercase tracking-wider">SYSTEM SECURE</span>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 hover:bg-white/10 hover:text-white rounded-lg transition-colors cursor-pointer ml-auto"
                title={sidebarCollapsed ? 'Expand Panel' : 'Collapse Panel'}
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </aside>

        {/* PRIMARY ERP VIEW WORKSPACE */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Main Top workspace utilities rail */}
          <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4 print:hidden shadow-xs">
            {/* Left section: breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 font-mono">
              <span className="hover:text-dark-teal cursor-pointer">ERP HOME</span>
              <span>/</span>
              <span className="text-dark-teal uppercase tracking-wider font-bold">
                {activeTab} VIEW
              </span>
            </div>

            {/* Right utilities shortcuts */}
            <div className="flex items-center gap-3">
              {/* Keyboard Shortcuts Helper */}
              <button
                onClick={() => setShowShortcutHelp(true)}
                className="p-1.5 text-slate-400 hover:text-dark-teal hover:bg-slate-100 rounded-lg transition-all"
                title="Keyboard Shortcuts Guide"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Notification bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotificationPanel(!showNotificationPanel);
                    setShowShortcutHelp(false);
                  }}
                  className="p-1.5 text-slate-400 hover:text-dark-teal hover:bg-slate-100 rounded-lg transition-all relative"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                  )}
                </button>

                {/* Notifications overlay panel dropdown */}
                {showNotificationPanel && (
                  <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 w-80 p-4 z-40 space-y-3 animate-fade-in text-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-dark-teal font-display">System Logs &amp; Warnings</h4>
                      <button
                        onClick={() => setShowNotificationPanel(false)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                      >
                        Dismiss
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-center py-4 text-slate-400">No warnings logged.</p>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded border ${
                              n.read
                                ? 'bg-slate-50 border-slate-100 text-slate-400'
                                : n.type === 'warning'
                                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            }`}
                          >
                            <p className="font-semibold leading-normal">{n.text}</p>
                            {!n.read && (
                              <button
                                onClick={() => handleMarkNotificationRead(n.id)}
                                className="text-[9px] font-bold text-dark-teal hover:underline mt-1.5 block"
                              >
                                Mark as Read
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Lock Session button */}
              {isUnlocked && (
                <button
                  onClick={() => {
                    setIsUnlocked(false);
                    addSystemNotification('Management views locked successfully.', 'info');
                    if (['dashboard', 'sales', 'expenses', 'settings'].includes(activeTab)) {
                      setActiveTab('billing'); // Redirect to billing tab
                    }
                  }}
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
                  title="Lock management session"
                >
                  <Lock className="w-3.5 h-3.5" /> Lock Session
                </button>
              )}

              {/* Status and Log out indicator */}
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <span className={`w-2.5 h-2.5 rounded-full ${isUnlocked ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {isUnlocked ? 'SECURE UNLOCKED' : 'SECURE LOCKED'}
                </span>
              </div>
            </div>
          </div>

          {/* Active compiled view canvas stage */}
          <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
            {renderViewContent()}
          </div>
        </main>
      </div>

      {/* Keyboard shortcuts popup help */}
      {showShortcutHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-dark-teal text-sm font-display">System Hotkeys Guide</h3>
              <button
                onClick={() => setShowShortcutHelp(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                <span className="font-semibold text-slate-700">Billing Counter View:</span>
                <kbd className="bg-white px-2 py-0.5 rounded border border-slate-300 shadow-xs text-[10px] font-bold font-mono">F2</kbd>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                <span className="font-semibold text-slate-700">Order Audit History:</span>
                <kbd className="bg-white px-2 py-0.5 rounded border border-slate-300 shadow-xs text-[10px] font-bold font-mono">F4</kbd>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                <span className="font-semibold text-slate-700">Daily Sales Charts:</span>
                <kbd className="bg-white px-2 py-0.5 rounded border border-slate-300 shadow-xs text-[10px] font-bold font-mono">F8</kbd>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                <span className="font-semibold text-slate-700">Dismiss Overlay dialogs:</span>
                <kbd className="bg-white px-2 py-0.5 rounded border border-slate-300 shadow-xs text-[10px] font-bold font-mono">Esc</kbd>
              </div>
            </div>

            <button
              onClick={() => setShowShortcutHelp(false)}
              className="w-full py-2 bg-dark-teal hover:bg-dark-teal-hover text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Understand Shortcuts
            </button>
          </div>
        </div>
      )}
      {/* 4. FOOTER STATUS BAR */}
      <footer className="h-8 bg-slate-100 border-t border-slate-200 px-4 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0 print:hidden">
        <div className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
          System Online: Sri Anand Murgan Main Node
        </div>
        <div className="flex space-x-6">
          <span>Version 4.2.1-Enterprise</span>
          <span>Thermal Printer: <span className="text-emerald-600">Ready</span></span>
          <span>Cloud Sync: Active</span>
        </div>
      </footer>
    </div>
  );
}
