/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Unlock, Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface PasswordLockViewProps {
  correctPassword: string;
  onUnlockSuccess: () => void;
  tabName: string;
}

export default function PasswordLockView({
  correctPassword,
  onUnlockSuccess,
  tabName,
}: PasswordLockViewProps) {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === correctPassword) {
      setErrorMsg('');
      onUnlockSuccess();
    } else {
      setErrorMsg('Incorrect management password. Please try again.');
      setPasswordInput('');
    }
  };

  const handleKeypadPress = (num: string) => {
    setErrorMsg('');
    setPasswordInput(prev => prev + num);
  };

  const handleClear = () => {
    setPasswordInput('');
    setErrorMsg('');
  };

  const handleBackspace = () => {
    setPasswordInput(prev => prev.slice(0, -1));
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 min-h-[500px]" id="password-lock-screen">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full p-8 text-center space-y-6">
        {/* Shield and Lock Icon with subtle glow */}
        <div className="relative mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 border border-amber-100 shadow-md shadow-amber-500/5">
          <Lock className="w-7 h-7" />
          <div className="absolute inset-0 rounded-full bg-amber-400/10 animate-ping" style={{ animationDuration: '3s' }} />
        </div>

        {/* Text Headers */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-dark-teal font-display">Restricted Management View</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
            You are attempting to access the <span className="font-extrabold text-amber-600 uppercase tracking-wide font-mono">{tabName}</span> ledger. Please enter the management password.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleUnlockSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordInput}
              onChange={e => {
                setErrorMsg('');
                setPasswordInput(e.target.value);
              }}
              placeholder="Enter management password"
              className="w-full text-center tracking-widest text-slate-800 font-black text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark-teal focus:bg-white transition-all"
              required
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-lg">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick POS Touch Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num)}
                className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-bold font-mono transition-colors border border-slate-100 active:scale-95 cursor-pointer"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-rose-100 cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-bold font-mono transition-colors border border-slate-100 cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-colors border border-slate-100 cursor-pointer"
            >
              ⌫
            </button>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3 bg-dark-teal hover:bg-dark-teal-hover text-white rounded-xl text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-dark-teal/15 cursor-pointer"
          >
            <Unlock className="w-4 h-4" /> Unlock Module
          </button>
        </form>

        {/* Hint footer */}
        <p className="text-[10px] text-slate-400 font-medium">
          Default security code is <strong className="text-slate-500 font-mono font-bold">45718</strong>. Set a custom code in settings.
        </p>
      </div>
    </div>
  );
}
