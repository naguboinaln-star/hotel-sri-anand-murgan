/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Printer,
  Shield,
  RotateCcw,
  Sun,
  Moon,
  Info,
  CheckCircle,
  Database,
  Lock,
} from 'lucide-react';
import { HotelInfo, UserRole } from '../types';

interface SettingsViewProps {
  hotelInfo: HotelInfo;
  onUpdateHotelInfo: (info: HotelInfo) => void;
  onBackupData: () => void;
  onRestoreData: (jsonString: string) => boolean;
  onResetAllData: () => void;
  onResetOrdersOnly: () => void;
  currentTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  appPassword?: string;
  onUpdatePassword?: (newPass: string) => void;
}

export default function SettingsView({
  hotelInfo,
  onUpdateHotelInfo,
  onBackupData,
  onRestoreData,
  onResetAllData,
  onResetOrdersOnly,
  currentTheme,
  onToggleTheme,
  activeRole,
  onChangeRole,
  appPassword = '45718',
  onUpdatePassword,
}: SettingsViewProps) {
  // Form States
  const [formName, setFormName] = useState(hotelInfo.name);
  const [formAddress, setFormAddress] = useState(hotelInfo.address);
  const [formPhone, setFormPhone] = useState(hotelInfo.phone);
  const [formGstin, setFormGstin] = useState(hotelInfo.gstin);
  const [formCgst, setFormCgst] = useState(hotelInfo.cgstRate);
  const [formSgst, setFormSgst] = useState(hotelInfo.sgstRate);

  // Restore file input state
  const [restoreJson, setRestoreJson] = useState('');

  // Password reset states
  const [newPassword, setNewPassword] = useState('');

  const handleUpdateBranding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Hotel name is required.');
      return;
    }

    onUpdateHotelInfo({
      name: formName.trim(),
      address: formAddress.trim(),
      phone: formPhone.trim(),
      gstin: formGstin.trim(),
      cgstRate: Number(formCgst),
      sgstRate: Number(formSgst),
    });

    alert('Branding and GST policies updated successfully!');
  };

  const handleRestoreImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreJson.trim()) {
      alert('Please paste a valid backup JSON string.');
      return;
    }

    const success = onRestoreData(restoreJson.trim());
    if (success) {
      alert('Backup restored successfully! Applet reloading states.');
      setRestoreJson('');
    } else {
      alert('Failed to restore! Invalid data schema or corrupted JSON.');
    }
  };

  const handleReset = () => {
    if (window.confirm('CRITICAL: Are you sure you want to factory-reset the entire hotel system database? All historical orders, logged expenses, employee payrolls, and stock details will be permanently wiped out.')) {
      onResetAllData();
      alert('System database reset to factory defaults.');
      window.location.reload();
    }
  };

  const handleResetOrdersOnly = () => {
    if (window.confirm('Are you sure you want to delete order history and sales data? This will clear the daily sales statistics and operational dashboard metrics while keeping your menu items and employee profiles intact.')) {
      if (window.confirm('Are you sure? This action cannot be undone.')) {
        onResetOrdersOnly();
        alert('Order history, operational dashboard, and daily sales metrics have been successfully reset.');
      }
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      alert('Please enter a valid password.');
      return;
    }
    if (onUpdatePassword) {
      onUpdatePassword(newPassword.trim());
      alert('Security credentials updated successfully! New management password has been set.');
      setNewPassword('');
    }
  };

  return (
    <div className="space-y-6" id="settings-module">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branding & GST Configuration */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-5 lg:col-span-2 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2 text-dark-teal">
            <Info className="w-5 h-5" />
            <h3 className="font-bold font-display text-sm">Hotel Profile &amp; GST configuration</h3>
          </div>

          <form onSubmit={handleUpdateBranding} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">Hotel Name:</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white transition-all text-slate-800 font-bold"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">Business Address (Printout Header):</label>
              <input
                type="text"
                value={formAddress}
                onChange={e => setFormAddress(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white transition-all text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Contact Number:</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              {/* GSTIN */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">GSTIN Registration Code:</label>
                <input
                  type="text"
                  value={formGstin}
                  onChange={e => setFormGstin(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              {/* CGST */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">CGST Rate (%):</label>
                <input
                  type="number"
                  step="0.01"
                  value={formCgst}
                  onChange={e => setFormCgst(Number(e.target.value))}
                  className="mt-1 w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none font-mono font-bold"
                />
              </div>

              {/* SGST */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">SGST Rate (%):</label>
                <input
                  type="number"
                  step="0.01"
                  value={formSgst}
                  onChange={e => setFormSgst(Number(e.target.value))}
                  className="mt-1 w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-dark-teal text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-dark-teal-hover transition-colors shadow-xs cursor-pointer"
              >
                Save Profile Branding &amp; Rates
              </button>
            </div>
          </form>
        </div>

        {/* System Settings & Credentials */}
        <div className="space-y-6">
          {/* Active User Account role selector */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2 text-dark-teal">
              <Shield className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold font-display text-sm">Security &amp; Operator Roles</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-gray font-semibold block">Select Active Operator Mode:</span>
                <p className="text-[10px] text-slate-400 mt-0.5 mb-2 leading-relaxed">
                  Toggle permissions level. Cashiers are restricted from deleting bills.
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Admin', 'Cashier', 'Manager'] as UserRole[]).map(role => (
                    <button
                      key={role}
                      onClick={() => {
                        onChangeRole(role);
                        alert(`Session switched to role: ${role}`);
                      }}
                      className={`py-2 rounded-lg text-[10px] font-bold transition-all border ${
                        activeRole === role
                          ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Management Password Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2 text-dark-teal">
              <Lock className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold font-display text-sm">Management Password</h3>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
              <div>
                <span className="text-slate-gray font-semibold block">Protected Views:</span>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                  Dashboard, Daily Sales, Expense Tracker, and Settings require this security code to view.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Current Code:</label>
                <input
                  type="text"
                  disabled
                  value={appPassword}
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">New Password Code:</label>
                <input
                  type="text"
                  maxLength={12}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value.replace(/\s+/g, ''))}
                  placeholder="Enter new code (e.g. 1234)"
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white text-slate-800 font-bold font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-dark-teal hover:bg-dark-teal-hover text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Update Access Password
              </button>
            </form>
          </div>

          {/* Theme Settings selector */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2 text-dark-teal">
              {currentTheme === 'light' ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-500" />
              )}
              <h3 className="font-bold font-display text-sm">Appearance</h3>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">System Color Palette:</span>
              <button
                onClick={onToggleTheme}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-dark-teal font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                {currentTheme === 'light' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-500" /> Light Classic
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-500" /> Dark Cozy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backup and restore panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2 text-dark-teal">
            <Database className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold font-display text-sm">JSON Data Backup</h3>
          </div>

          <p className="text-xs text-slate-gray leading-relaxed">
            Generate and copy a secure system backup of all transactions, inventory stock logs, logged expenses, and active menu configurations.
          </p>

          <div className="pt-2 flex gap-3">
            <button
              onClick={onBackupData}
              className="flex-1 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <Database className="w-4 h-4" /> Export Backup File
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition-colors"
            >
              Factory Data Reset
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2 text-dark-teal">
            <RotateCcw className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold font-display text-sm">JSON Data Restore</h3>
          </div>

          <form onSubmit={handleRestoreImport} className="space-y-3">
            <p className="text-xs text-slate-gray">
              Paste the exported backup text content into the textbox below to restore previous ledger states:
            </p>
            <textarea
              rows={2}
              placeholder="Paste backup JSON string here..."
              value={restoreJson}
              onChange={e => setRestoreJson(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal text-[10px] font-mono text-slate-800"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-dark-teal text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-dark-teal-hover transition-colors shadow-xs"
              >
                Trigger JSON Restore
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Database Operations section */}
      <div className="bg-white rounded-xl border border-rose-100 shadow-xs p-5 space-y-4">
        <div className="border-b border-rose-100 pb-3 flex items-center gap-2 text-rose-600">
          <Database className="w-5 h-5" />
          <h3 className="font-bold font-display text-sm">Database Operations</h3>
        </div>

        <p className="text-xs text-slate-gray leading-relaxed">
          Wipe transactional order databases to reset live operational counters, active analytics, and historical daily sales reports. All other records (such as food menus, employee records, and hotel profile configs) are safely preserved.
        </p>

        <div className="flex justify-start">
          <button
            onClick={handleResetOrdersOnly}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-rose-600/15 cursor-pointer flex items-center gap-1.5"
          >
            Perform Hard Database Factory Reset
          </button>
        </div>
      </div>
    </div>
  );
}
