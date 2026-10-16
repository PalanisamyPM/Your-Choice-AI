import React, { useState, useEffect } from 'react';
import { X, Zap, Clock, Sparkles, RefreshCw, AlertCircle, ShieldCheck, FileText } from 'lucide-react';
import { UserProfile, AICreditLogItem } from '../types';

interface CreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onRefresh: () => void;
}

export const CreditModal: React.FC<CreditModalProps> = ({
  isOpen,
  onClose,
  user,
  onRefresh,
}) => {
  const [logs, setLogs] = useState<AICreditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refilling, setRefilling] = useState(false);
  const [timeToReset, setTimeToReset] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/credits/logs');
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error('Failed to load credit logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    const updateCountdown = () => {
      const now = new Date();
      const tomorrowUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
      const diffMs = tomorrowUtc.getTime() - now.getTime();

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeToReset(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleRefillDemo = async () => {
    setRefilling(true);
    try {
      await fetch('/api/user/credits/refill', { method: 'POST' });
      onRefresh();
      // Reload logs
      const res = await fetch('/api/credits/logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error('Refill error:', err);
    } finally {
      setRefilling(false);
    }
  };

  if (!isOpen) return null;

  const credits = user?.daily_credits ?? 20;
  const creditsPercent = (credits / 20) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel border border-white/10 shadow-2xl p-6 overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Daily AI Credits Economy</h3>
              <p className="text-xs text-slate-400">
                Managed quota system resets automatically at midnight UTC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Card */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08]">
            <span className="text-[11px] font-medium text-slate-400">Available Balance</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-amber-400">{credits}</span>
              <span className="text-sm text-slate-500 font-medium">/ 20 Credits</span>
            </div>
            <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${creditsPercent}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08]">
            <span className="text-[11px] font-medium text-slate-400">Midnight UTC Reset</span>
            <div className="mt-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-base font-bold text-white font-mono">{timeToReset}</span>
            </div>
            <span className="mt-1 block text-[10px] text-slate-400">
              Auto refills 20 credits every 24h
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-400">Developer Demo</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Need more credits to test?</p>
            </div>
            <button
              onClick={handleRefillDemo}
              disabled={refilling}
              className="mt-2 w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              {refilling ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Refill Demo (+20)</span>
            </button>
          </div>
        </div>

        {/* Operation Tariffs */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-950/60 border border-white/[0.06]">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            AI Operations Menu & Tariffs
          </span>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Project Planner</p>
                <p className="text-[10px] text-slate-400">Full roadmap & tasks</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-rose-300 border border-red-500/30">
                5 CR
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Health Audit</p>
                <p className="text-[10px] text-slate-400">Velocity & risk report</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                2 CR
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Copilot Chat</p>
                <p className="text-[10px] text-slate-400">Contextual Q&A</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                1 CR
              </span>
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Credit Consumption Audit Trail</span>
            </h4>
            <span className="text-[10px] text-slate-500">Immutable Ledger</span>
          </div>

          <div className="max-h-44 overflow-y-auto rounded-xl border border-white/[0.08] bg-slate-950/40">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Loading audit history...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No credit expenditures recorded yet today.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 text-[10px] uppercase border-b border-white/5 sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3">Operation</th>
                    <th className="py-2 px-3">Credits</th>
                    <th className="py-2 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] text-slate-300">
                      <td className="py-2 px-3 font-mono text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-cyan-300">
                          {log.action_type}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-bold text-amber-400">
                        -{log.credits_spent}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-400 truncate max-w-xs">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Guaranteed Quota Enforcement</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
