/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Calendar,
  UserCheck,
  CheckCircle,
  X,
  Printer,
  FileText,
  Clock,
  Edit2,
} from 'lucide-react';
import { Employee } from '../types';

interface SalaryViewProps {
  employees: Employee[];
  onAddEmployee: (employee: Omit<Employee, 'id' | 'attendance'>) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onToggleAttendance: (id: string, date: string, status: 'Present' | 'Absent' | 'Half-Day') => void;
}

export default function SalaryView({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onToggleAttendance,
}: SalaryViewProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmpForCard, setSelectedEmpForCard] = useState<Employee | null>(null);

  // Form State: Add/Edit Employee
  const [formName, setFormName] = useState('');
  const [formPosition, setFormPosition] = useState('Assistant Chef');
  const [formShift, setFormShift] = useState('Morning Shift');
  const [formNotes, setFormNotes] = useState('');

  // Calendar Attendance Date Selector
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  const handleOpenAdd = () => {
    setFormName('');
    setFormPosition('Assistant Chef');
    setFormShift('Morning Shift');
    setFormNotes('');
    setIsAddOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Employee name is required.');
      return;
    }

    onAddEmployee({
      name: formName.trim(),
      position: formPosition,
      shift: formShift,
      notes: formNotes.trim() || undefined,
    });

    setIsAddOpen(false);
  };

  const handleOpenEdit = (emp: Employee) => {
    setFormName(emp.name);
    setFormPosition(emp.position);
    setFormShift(emp.shift);
    setFormNotes(emp.notes || '');
    setEditingEmployee(emp);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    if (!formName.trim()) {
      alert('Employee name is required.');
      return;
    }

    onUpdateEmployee({
      ...editingEmployee,
      name: formName.trim(),
      position: formPosition,
      shift: formShift,
      notes: formNotes.trim() || undefined,
    });

    setEditingEmployee(null);
  };

  // Shift color badges helper
  const getShiftColor = (shift: string) => {
    if (shift.includes('Morning')) {
      return 'bg-sky-50 text-sky-700 border-sky-200';
    } else if (shift.includes('Evening')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (shift.includes('Night')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    } else {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6" id="salary-module">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-xl p-4 border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-dark-teal font-display">Staff Directory &amp; Roster Management</h2>
          <p className="text-xs text-slate-gray font-medium">Maintain employee profiles, active work shifts, and daily attendance logs.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 bg-dark-teal text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-dark-teal-hover transition-all shadow-md shadow-dark-teal/10 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Register Staff
        </button>
      </div>

      {/* Aggregate row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Registered */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-gray font-bold uppercase tracking-wider">Total Registered Staff</p>
            <p className="text-xl font-black font-mono text-dark-teal mt-1">{employees.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Active profiles on registry</p>
          </div>
          <div className="p-2.5 bg-teal-50 rounded-xl text-dark-teal">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-gray font-bold uppercase tracking-wider">Present Today</p>
            <p className="text-xl font-black font-mono text-emerald-700 mt-1">
              {employees.filter(emp => emp.attendance[attendanceDate] === 'Present').length}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Marked present for {attendanceDate}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Active Shifts */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-gray font-bold uppercase tracking-wider">Active Shifts</p>
            <p className="text-xl font-black font-mono text-sky-700 mt-1">
              {new Set(employees.map(emp => emp.shift)).size || 0} Distinct
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Scheduled daily schedules</p>
          </div>
          <div className="p-2.5 bg-sky-50 rounded-xl text-sky-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Attendance board and Staff Directory split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff Directory Table (Takes 2 Columns) */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden lg:col-span-2">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-dark-teal font-display text-sm">Staff Directory</h3>
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{employees.length} employees registered</span>
          </div>

          <div className="overflow-x-auto">
            {employees.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-medium text-xs">
                No staff profiles registered yet. Click "Register Staff" to begin.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-gray border-b border-slate-100 uppercase text-[10px] font-mono">
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Position</th>
                    <th className="py-2.5 px-3">Work Shift</th>
                    <th className="py-2.5 px-3">Responsibility / Notes</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800 text-sm">{emp.name}</div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">ID: {emp.id}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-dark-teal border border-teal-100 font-bold text-[10px]">
                          {emp.position}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded border font-bold text-[10px] ${getShiftColor(emp.shift)}`}>
                          {emp.shift}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-medium max-w-[180px] truncate">
                        {emp.notes || <span className="text-slate-300 italic">No notes</span>}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-dark-teal rounded text-[9px] font-bold cursor-pointer transition-colors inline-flex items-center gap-0.5"
                        >
                          <Edit2 className="w-2.5 h-2.5" /> Edit
                        </button>
                        <button
                          onClick={() => setSelectedEmpForCard(emp)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[9px] font-bold cursor-pointer transition-colors"
                        >
                          Shift Card
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Attendance Board Column */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-dark-teal">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold font-display text-sm">Attendance Logs</h3>
            </div>
            <input
              type="date"
              value={attendanceDate}
              onChange={e => setAttendanceDate(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-dark-teal"
            />
          </div>

          <div className="p-4 space-y-4 flex-1">
            <p className="text-[10px] text-slate-gray leading-relaxed font-semibold">
              Select working status indicators for registered staff for the selected calendar date below:
            </p>

            <div className="space-y-3">
              {employees.length === 0 ? (
                <div className="text-center py-6 text-slate-300 text-[11px] font-medium">
                  Register employees to view attendance options.
                </div>
              ) : (
                employees.map(emp => {
                  const currentStatus = emp.attendance[attendanceDate] || 'Present';
                  return (
                    <div key={emp.id} className="flex items-center justify-between border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                      <div>
                        <h4 className="font-semibold text-xs text-slate-800">{emp.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{emp.position}</p>
                      </div>

                      <div className="flex bg-slate-100 p-0.5 rounded-md text-[9px] font-bold text-slate-600 shrink-0 ml-2">
                        {(['Present', 'Absent', 'Half-Day'] as const).map(status => (
                          <button
                            key={status}
                            onClick={() => onToggleAttendance(emp.id, attendanceDate, status)}
                            className={`px-1.5 py-1 rounded transition-colors ${
                              currentStatus === status
                                ? status === 'Present'
                                  ? 'bg-emerald-600 text-white'
                                  : status === 'Absent'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-amber-500 text-white'
                                : 'hover:text-dark-teal'
                            }`}
                          >
                            {status.split('-')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Register Staff Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveAdd}
            className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-sm w-full p-6 space-y-4 animate-scale-up"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-dark-teal text-base font-display">Register Staff Profile</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Full Name:</label>
                <input
                  type="text"
                  placeholder="e.g. N Lakshmi Narayana"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white text-slate-800 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Position / Designation:</label>
                <select
                  value={formPosition}
                  onChange={e => setFormPosition(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white text-slate-800 font-semibold"
                >
                  <option value="Head Cook">Head Cook (ప్రధాన వంటమనిషి)</option>
                  <option value="Assistant Chef">Assistant Chef (సహాయ వంటమనిషి)</option>
                  <option value="Billing Operator">Billing Operator (బిల్లింగ్ ఆపరేటర్)</option>
                  <option value="Waiter">Waiter (సర్వర్)</option>
                  <option value="Kitchen Helper">Kitchen Helper (వంటగది సహాయకుడు)</option>
                  <option value="Cleaner">Cleaner (క్లీనర్)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Work Shift:</label>
                <select
                  value={formShift}
                  onChange={e => setFormShift(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white text-slate-800 font-semibold"
                >
                  <option value="Morning Shift">Morning Shift (6:00 AM - 2:00 PM)</option>
                  <option value="Evening Shift">Evening Shift (2:00 PM - 10:00 PM)</option>
                  <option value="Night Shift">Night Shift (10:00 PM - 6:00 AM)</option>
                  <option value="Full Day Shift">Full Day Shift (6:00 AM - 10:00 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Additional Notes (Optional):</label>
                <textarea
                  placeholder="e.g. Day shift only, key holder..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white text-slate-800 resize-none h-16"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-dark-teal hover:bg-dark-teal-hover text-white text-xs font-semibold transition-all shadow-md shadow-dark-teal/10"
              >
                Register Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-sm w-full p-6 space-y-4 animate-scale-up"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-dark-teal text-base font-display">Edit Staff Profile</h3>
              <button
                type="button"
                onClick={() => setEditingEmployee(null)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Full Name:</label>
                <input
                  type="text"
                  placeholder="e.g. N Lakshmi Narayana"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white text-slate-800 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Position / Designation:</label>
                <select
                  value={formPosition}
                  onChange={e => setFormPosition(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white text-slate-800 font-semibold"
                >
                  <option value="Head Cook">Head Cook (ప్రధాన వంటమనిషి)</option>
                  <option value="Assistant Chef">Assistant Chef (సహాయ వంటమనిషి)</option>
                  <option value="Billing Operator">Billing Operator (బిల్లింగ్ ఆపరేటర్)</option>
                  <option value="Waiter">Waiter (సర్వర్)</option>
                  <option value="Kitchen Helper">Kitchen Helper (వంటగది సహాయకుడు)</option>
                  <option value="Cleaner">Cleaner (క్లీనర్)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Work Shift:</label>
                <select
                  value={formShift}
                  onChange={e => setFormShift(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white text-slate-800 font-semibold"
                >
                  <option value="Morning Shift">Morning Shift (6:00 AM - 2:00 PM)</option>
                  <option value="Evening Shift">Evening Shift (2:00 PM - 10:00 PM)</option>
                  <option value="Night Shift">Night Shift (10:00 PM - 6:00 AM)</option>
                  <option value="Full Day Shift">Full Day Shift (6:00 AM - 10:00 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Additional Notes (Optional):</label>
                <textarea
                  placeholder="e.g. Day shift only, key holder..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white text-slate-800 resize-none h-16"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingEmployee(null)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-dark-teal hover:bg-dark-teal-hover text-white text-xs font-semibold transition-all shadow-md shadow-dark-teal/10"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shift Schedule Card Modal */}
      {selectedEmpForCard && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 relative animate-scale-up my-8">
            <button
              onClick={() => setSelectedEmpForCard(null)}
              className="absolute right-3 top-3 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Print Selection Slip */}
            <div id="print-receipt-area" className="p-3 border border-slate-300 rounded-lg space-y-4 text-slate-900 font-mono text-xs">
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
                <h4 className="text-sm font-black tracking-tight">STAFF ROSTER &amp; SHIFT CARD</h4>
                <h5 className="text-xs font-bold text-dark-teal">HOTEL SRI ANAND MURGAN</h5>
                <p className="text-[8px] text-slate-400">Official Roster Schedule</p>
              </div>

              {/* Details table */}
              <div className="space-y-3 text-[10px] pb-3 border-b border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">STAFF ID:</span>
                  <strong className="text-slate-800">{selectedEmpForCard.id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">STAFF NAME:</span>
                  <strong className="text-slate-800">{selectedEmpForCard.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ROLE / POSITION:</span>
                  <strong className="text-slate-800">{selectedEmpForCard.position}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ASSIGNED SHIFT:</span>
                  <strong className="text-teal-700 uppercase font-black">{selectedEmpForCard.shift}</strong>
                </div>
                {selectedEmpForCard.notes && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 block text-[9px]">SPECIAL INSTRUCTIONS:</span>
                    <span className="text-slate-700 italic block mt-0.5">{selectedEmpForCard.notes}</span>
                  </div>
                )}
              </div>

              {/* Policy */}
              <div className="text-[8px] text-slate-400 leading-normal text-center bg-slate-50 p-2 rounded border">
                Please arrive 10 minutes before shift timings. All attendance logs are synchronized with central records.
              </div>

              {/* Signatures */}
              <div className="pt-4 flex justify-between text-[9px] text-slate-400">
                <div className="text-center w-24 border-t border-slate-300 pt-1">
                  Staff Signature
                </div>
                <div className="text-center w-24 border-t border-slate-300 pt-1">
                  Manager Seal
                </div>
              </div>
            </div>

            {/* Print trigger */}
            <div className="flex gap-3 pt-3 border-t border-slate-100 print:hidden">
              <button
                onClick={() => setSelectedEmpForCard(null)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-lg bg-dark-teal text-white text-xs font-semibold hover:bg-dark-teal-hover transition-all flex items-center justify-center gap-1 shadow-md"
              >
                <Printer className="w-4 h-4" /> Print Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
