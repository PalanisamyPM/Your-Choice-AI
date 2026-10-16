import React, { useState } from 'react';
import {
  Settings,
  User,
  Zap,
  RotateCcw,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Database,
  Terminal,
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  user: UserProfile | null;
  isGeminiConfigured: boolean;
  onRefreshUser: () => void;
  onResetDemoData: () => Promise<void>;
  onOpenCreditsModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  isGeminiConfigured,
  onRefreshUser,
  onResetDemoData,
  onOpenCreditsModal,
}) => {
  const [fullName, setFullName] = useState(user?.full_name || 'Palanisamy');
  const [role, setRole] = useState(user?.role || 'Lead Architect / Developer');
  const [email, setEmail] = useState(user?.email || 'ppalanisamy17022@gmail.com');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, role, email }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        onRefreshUser();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset demo data? All projects, tasks, and credit logs will be restored to default state.')) {
      setResetting(true);
      try {
        await onResetDemoData();
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-5 border border-white/[0.08]">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>System & Account Configuration</span>
        </h2>
        <p className="text-xs text-slate-400">
          Manage your developer profile, AI quota rules, and system engine settings
        </p>
      </div>

      {/* Profile Form */}
      <div className="glass-panel rounded-3xl p-6 border border-white/[0.08] space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" />
          <span>Developer Profile</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Engineering Role / Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Contact / Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Profile updated successfully!</span>
              </span>
            ) : (
              <div />
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* AI Quota Policy Card */}
      <div className="glass-panel rounded-3xl p-6 border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Daily AI Credits Economy Rules</span>
          </h3>
          <button
            onClick={onOpenCreditsModal}
            className="text-xs text-cyan-400 hover:underline font-semibold"
          >
            Open Audit Ledger →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
            <span className="text-[10px] text-slate-400">Daily Allocation</span>
            <p className="text-base font-bold text-amber-400 mt-0.5">20 Free Credits</p>
            <p className="text-[10px] text-slate-400 mt-1">Refreshed automatically every 24h</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
            <span className="text-[10px] text-slate-400">Reset Trigger</span>
            <p className="text-base font-bold text-cyan-300 mt-0.5">00:00 UTC Daily</p>
            <p className="text-[10px] text-slate-400 mt-1">Checked on API requests</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
            <span className="text-[10px] text-slate-400">Rate Limiter Status</span>
            <p className="text-base font-bold text-emerald-400 mt-0.5">Active & Monitored</p>
            <p className="text-[10px] text-slate-400 mt-1">Smooth simulated fallback fallback</p>
          </div>
        </div>
      </div>

      {/* AI Engine & Database Architecture */}
      <div className="glass-panel rounded-3xl p-6 border border-white/[0.08] space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>System Engine Status</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${
                isGeminiConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`} />
              <div>
                <p className="font-semibold text-white">Google Gemini 3.8 Flash SDK Integration</p>
                <p className="text-[11px] text-slate-400">
                  {isGeminiConfigured
                    ? 'Connected with valid GEMINI_API_KEY. Real LLM inference active.'
                    : 'Simulation Mode Active: API key not set or in demo mode. All features produce realistic sample output without crashing.'}
                </p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
              isGeminiConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {isGeminiConfigured ? 'Live LLM' : 'Simulation'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-blue-400" />
              <div>
                <p className="font-semibold text-white">Relational Database Engine</p>
                <p className="text-[11px] text-slate-400">
                  SQLite + SQLAlchemy relational models with foreign keys & cascading deletions.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-cyan-300">
              Operational
            </span>
          </div>
        </div>
      </div>

      {/* Reset Demo Data */}
      <div className="glass-panel rounded-3xl p-6 border border-red-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-red-400" />
              <span>Reset Demo State</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Restore default starter projects, tasks, and 15/20 credits balance.
            </p>
          </div>

          <button
            onClick={handleReset}
            disabled={resetting}
            className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold transition-all disabled:opacity-50"
          >
            {resetting ? 'Resetting...' : 'Reset Demo Data'}
          </button>
        </div>
      </div>
    </div>
  );
};
