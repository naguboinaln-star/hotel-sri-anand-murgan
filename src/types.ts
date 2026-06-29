/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum FoodCategory {
  Tiffens = 'Tiffens',
  LunchItems = 'Lunch Items',
  FriedRice = 'Fried Rice',
}

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  category: FoodCategory;
  isAvailable: boolean;
  image?: string;
}

export interface OrderItem {
  foodItem: FoodItem;
  quantity: number;
  notes?: string;
}

export type PaymentMethod = 'Cash' | 'Card' | 'UPI' | 'Split';

export interface Order {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  customerName?: string;
  items: OrderItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  discount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  staffMember: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
}

export type ExpenseType =
  | 'Vegetables'
  | 'Cooking Items'
  | 'Rice'
  | 'Oil'
  | 'Gas Cylinder'
  | 'Electricity'
  | 'Water'
  | 'Cleaning'
  | 'Miscellaneous';

export interface Expense {
  id: string;
  date: string;
  type: ExpenseType;
  vendorName: string;
  amount: number;
  description: string;
  receiptUrl?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
}

export interface StockTransaction {
  id: string;
  inventoryItemId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  notes: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  shift: string;
  attendance: { [date: string]: 'Present' | 'Absent' | 'Half-Day' };
  notes?: string;
}

export interface HotelInfo {
  name: string;
  address: string;
  phone: string;
  gstin: string;
  cgstRate: number; // e.g. 2.5 for 2.5%
  sgstRate: number; // e.g. 2.5 for 2.5%
}

export interface AppNotification {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
}

export type UserRole = 'Admin' | 'Cashier' | 'Manager';

export interface UserSession {
  role: UserRole;
  username: string;
}
