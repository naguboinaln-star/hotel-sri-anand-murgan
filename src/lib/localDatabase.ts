/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FoodItem,
  FoodCategory,
  Order,
  Expense,
  InventoryItem,
  StockTransaction,
  Employee,
  HotelInfo,
  AppNotification,
} from '../types';

// Default Hotel Settings
export const DEFAULT_HOTEL_INFO: HotelInfo = {
  name: 'HOTEL SRI ANAND MURGAN',
  address: 'No. 24, Main Road, Palani, Tamil Nadu - 624601',
  phone: '+91 94432 12345',
  gstin: '33AAAAA1111A1Z1',
  cgstRate: 2.5, // 2.5%
  sgstRate: 2.5, // 2.5%
};

// Initial Menu Seeding
export const INITIAL_FOOD_ITEMS: FoodItem[] = [
  // TIFFENS
  { id: 'T1', name: 'Idli (ఇడ్లీ)', price: 7, category: FoodCategory.Tiffens, isAvailable: true },
  { id: 'T2', name: 'Vada (వడ)', price: 7, category: FoodCategory.Tiffens, isAvailable: true },
  { id: 'T3', name: 'Poori (పూరి)', price: 30, category: FoodCategory.Tiffens, isAvailable: true },
  { id: 'T4', name: 'Pongal (పొంగల్)', price: 40, category: FoodCategory.Tiffens, isAvailable: true },
  { id: 'T5', name: 'Plain Dosa (దోశ)', price: 30, category: FoodCategory.Tiffens, isAvailable: true },
  { id: 'T6', name: 'Egg Dosa (ఎగ్ దోశ)', price: 50, category: FoodCategory.Tiffens, isAvailable: true },
  { id: 'T7', name: 'Karam Dosa (కారం దోశ)', price: 50, category: FoodCategory.Tiffens, isAvailable: true },
  { id: 'T8', name: 'Onion Dosa (ఆనియన్ దోశ)', price: 50, category: FoodCategory.Tiffens, isAvailable: true },
  { id: 'T9', name: 'Double Egg Dosa (డబుల్ ఎగ్ దోశ)', price: 60, category: FoodCategory.Tiffens, isAvailable: true },
  { id: 'T10', name: 'Chapathi (చపాతి)', price: 20, category: FoodCategory.Tiffens, isAvailable: true },

  // LUNCH ITEMS
  { id: 'L1', name: 'Meals (మీల్స్)', price: 80, category: FoodCategory.LunchItems, isAvailable: true },
  { id: 'L2', name: 'Ragi Mudda (రాగి ముద్ద)', price: 20, category: FoodCategory.LunchItems, isAvailable: true },
  { id: 'L3', name: 'Parotta (పరోట)', price: 20, category: FoodCategory.LunchItems, isAvailable: true },
  { id: 'L4', name: 'Chicken Fry (చికెన్ ఫ్రై)', price: 70, category: FoodCategory.LunchItems, isAvailable: true },
  { id: 'L5', name: 'Boti Curry (బోటి కర్రీ)', price: 100, category: FoodCategory.LunchItems, isAvailable: true },
  { id: 'L6', name: 'Fish Curry (ఫిష్ కర్రీ)', price: 50, category: FoodCategory.LunchItems, isAvailable: true },
  { id: 'L7', name: 'Omelette (Single) (ఆమ్లెట్ సింగిల్)', price: 15, category: FoodCategory.LunchItems, isAvailable: true },
  { id: 'L8', name: 'Omelette (Double) (ఆమ్లెట్ డబుల్)', price: 30, category: FoodCategory.LunchItems, isAvailable: true },

  // FRIED RICE
  { id: 'R1', name: 'Gobi Fried Rice (గోబి ఫ్రైడ్ రైస్)', price: 70, category: FoodCategory.FriedRice, isAvailable: true },
  { id: 'R2', name: 'Veg Fried Rice (వెజ్ ఫ్రైడ్ రైస్)', price: 60, category: FoodCategory.FriedRice, isAvailable: true },
  { id: 'R3', name: 'Egg Fried Rice (ఎగ్ ఫ్రైడ్ రైస్)', price: 70, category: FoodCategory.FriedRice, isAvailable: true },
  { id: 'R4', name: 'Chicken Fried Rice (చికెన్ ఫ్రైడ్ రైస్)', price: 100, category: FoodCategory.FriedRice, isAvailable: true },
  { id: 'R5', name: 'Chilli Chicken (చిల్లీ చికెన్)', price: 120, category: FoodCategory.FriedRice, isAvailable: true },
  { id: 'R6', name: 'Gobi Manchurian (గోబి మంచూరియన్)', price: 70, category: FoodCategory.FriedRice, isAvailable: true },
];

// Initial Inventory Seeding
export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'I1', name: 'Rice', currentStock: 0, minStock: 50, unit: 'kg' },
  { id: 'I2', name: 'Dal (Toor)', currentStock: 0, minStock: 20, unit: 'kg' },
  { id: 'I3', name: 'Vegetables (Mixed)', currentStock: 0, minStock: 15, unit: 'kg' },
  { id: 'I4', name: 'Cooking Oil', currentStock: 0, minStock: 30, unit: 'L' },
  { id: 'I5', name: 'Gas Cylinders (Commercial)', currentStock: 0, minStock: 2, unit: 'Units' },
  { id: 'I9', name: 'Spices (Masala)', currentStock: 0, minStock: 5, unit: 'kg' },
];

// Initial Staff Seeding
export const INITIAL_EMPLOYEES: Employee[] = [];

// Helper to generate mock order history for analytics
export const generateMockOrders = (): Order[] => {
  const list: Order[] = [];
  const staff = ['Ramesh Sundaram', 'Admin', 'Manager Selvam'];
  const today = new Date();

  // Helper to construct a date relative to today
  const getRelativeDateString = (daysOffset: number): string => {
    const d = new Date();
    d.setDate(today.getDate() - daysOffset);
    return d.toISOString().split('T')[0];
  };

  // Pre-seed 7 days of historical orders
  for (let d = 0; d <= 7; d++) {
    const dateStr = getRelativeDateString(d);
    // Dynamic number of orders per day (12 to 22 orders)
    const ordersCount = 12 + Math.floor(Math.random() * 10);

    for (let o = 1; o <= ordersCount; o++) {
      const orderId = `ORD-${dateStr.replace(/-/g, '')}-${o.toString().padStart(3, '0')}`;
      const hour = 7 + Math.floor(Math.random() * 14); // 7 AM to 9 PM
      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;

      // Pick random food items
      const selectedItemsCount = 1 + Math.floor(Math.random() * 3);
      const items: any[] = [];
      let subtotal = 0;

      for (let i = 0; i < selectedItemsCount; i++) {
        const randomFood = INITIAL_FOOD_ITEMS[Math.floor(Math.random() * INITIAL_FOOD_ITEMS.length)];
        // Ensure item isn't already added to this order
        if (items.some(item => item.foodItem.id === randomFood.id)) continue;

        const quantity = 1 + Math.floor(Math.random() * 3);
        const sub = randomFood.price * quantity;
        subtotal += sub;

        items.push({
          foodItem: randomFood,
          quantity,
          notes: Math.random() > 0.7 ? 'Less Spice' : undefined,
        });
      }

      if (items.length === 0) continue;

      const cgst = parseFloat((subtotal * 0.025).toFixed(2));
      const sgst = parseFloat((subtotal * 0.025).toFixed(2));
      const discount = Math.random() > 0.8 ? (subtotal > 200 ? 20 : 10) : 0;
      const grandTotal = Math.round(subtotal + cgst + sgst - discount);

      const paymentMethods: Array<'Cash' | 'Card' | 'UPI'> = ['Cash', 'UPI', 'Card'];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      list.push({
        id: orderId,
        date: dateStr,
        time: timeStr,
        customerName: Math.random() > 0.5 ? `Customer ${Math.floor(Math.random() * 100)}` : '',
        items,
        subtotal,
        cgst,
        sgst,
        discount,
        grandTotal,
        paymentMethod,
        staffMember: staff[Math.floor(Math.random() * staff.length)],
        status: Math.random() > 0.95 ? 'Cancelled' : 'Completed',
      });
    }
  }

  // Sort descending by date and time
  return list.sort((a, b) => {
    const dateTimeA = `${a.date}T${a.time}`;
    const dateTimeB = `${b.date}T${b.time}`;
    return dateTimeB.localeCompare(dateTimeA);
  });
};

// Seeding standard historical expenses
export const INITIAL_EXPENSES: Expense[] = [
  { id: 'EXP-1', date: '2026-06-21', type: 'Vegetables', vendorName: 'Anand Vegetable Wholesalers', amount: 2850, description: 'Weekly stock of onions, tomatoes, and greens.' },
  { id: 'EXP-2', date: '2026-06-22', type: 'Rice', vendorName: 'Murugan Rice Mill', amount: 9600, description: '4 Bags of Premium Ponni Raw Rice (25kg each)' },
  { id: 'EXP-3', date: '2026-06-23', type: 'Gas Cylinder', vendorName: 'Indane Commercial Gas', amount: 3600, description: 'Refill of 2 commercial gas cylinders' },
  { id: 'EXP-4', date: '2026-06-24', type: 'Oil', vendorName: 'Saraswathi Store', amount: 5400, description: '3 tins of 15L Gold Winner Sunflower oil' },
  { id: 'EXP-5', date: '2026-06-25', type: 'Electricity', vendorName: 'TANGEDCO', amount: 6200, description: 'Monthly kitchen and dining power charges' },
  { id: 'EXP-6', date: '2026-06-26', type: 'Miscellaneous', vendorName: 'General Stores', amount: 1200, description: 'Banana leaves and clean trash bags.' },
  { id: 'EXP-7', date: '2026-06-27', type: 'Cleaning', vendorName: 'Senthil Sanitation', amount: 750, description: 'Floor disinfectant and dishwashing soaps.' },
];

// Load functions
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load storage key:', key, e);
  }
  return defaultValue;
};

// Save functions
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save storage key:', key, e);
  }
};

// Initialize the Database (Seeds if empty)
export const initLocalDatabase = () => {
  // One-time clear check to start completely fresh from scratch as requested by user
  if (!localStorage.getItem('db_cleared_from_scratch_v8')) {
    localStorage.removeItem('orders');
    localStorage.removeItem('expenses');
    localStorage.removeItem('notifications');
    localStorage.removeItem('food_items');
    localStorage.removeItem('inventory_items');
    localStorage.removeItem('employees');
    localStorage.setItem('db_cleared_from_scratch_v8', 'true');
  }

  if (!localStorage.getItem('hotel_info')) {
    saveToStorage('hotel_info', DEFAULT_HOTEL_INFO);
  }
  if (!localStorage.getItem('food_items')) {
    saveToStorage('food_items', INITIAL_FOOD_ITEMS);
  }
  if (!localStorage.getItem('inventory_items')) {
    saveToStorage('inventory_items', INITIAL_INVENTORY);
  }
  if (!localStorage.getItem('employees')) {
    saveToStorage('employees', INITIAL_EMPLOYEES);
  }
  if (!localStorage.getItem('orders')) {
    saveToStorage('orders', []);
  }
  if (!localStorage.getItem('expenses')) {
    saveToStorage('expenses', []);
  }
  if (!localStorage.getItem('notifications')) {
    saveToStorage('notifications', []);
  }
};
