import React, { useState, useEffect } from 'react';
import { Search, Zap, User as UserIcon, Bell, Sparkles, ChevronDown, RefreshCw, KeyRound, CheckCircle2 } from 'lucide-react';
import { YCBrandLogo } from './YCBrandLogo';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  onOpenSearch: () => void;
  onOpenCreditsModal: () => void;
  onOpenPlanner: () => void;
  onOpenAiChat: () => void;
  isAiDrawerOpen: boolean;
  isGeminiConfigured: boolean;
  onNavigate: (view: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenSearch,
  onOpenCreditsModal,
  onOpenPlanner,
  onOpenAiChat,
  isAiDrawerOpen,
  isGeminiConfigured,
  onNavigate,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [timeToReset, setTimeToReset] = useState<string>('');

  // Calculate live countdown to midnight UTC
  useEffect(() => {
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
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const credits = user?.daily_credits ?? 20;
  const creditPercent = Math.min(100, (credits / 20) * 100);

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-white/[0.08] bg-[#0B0F19]/80 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Brand on small screens / title */}
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <YCBrandLogo size={32} />
        </div>
        <div className="hidden sm:flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-tight">YC Workspace</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[11px] font-medium text-slate-400">v2.4 Production</span>
          </div>
          <span className="text-[11px] text-slate-500">Fast Agile Execution</span>
        </div>
      </div>

      {/* Global Search Input with Ctrl + K Hotkey */}
      <div className="flex-1 max-w-md mx-2">
        <button
          onClick={onOpenSearch}
          className="w-full h-10 px-3.5 rounded-xl bg-slate-900/80 border border-white/[0.08] text-slate-400 flex items-center justify-between hover:border-blue-500/40 hover:bg-slate-900 transition-all text-xs group"
          title="Search projects, tasks, or trigger AI (Ctrl + K)"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
            <span className="text-slate-400 group-hover:text-slate-300">
              Search projects, tasks, sprints...
            </span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded border border-white/10 shadow-sm">
              ⌘
            </kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded border border-white/10 shadow-sm">
              K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right Controls: AI Credits Pill + Actions + Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Gemini Engine Status Pill */}
        <div
          className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            isGeminiConfigured
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          }`}
          title={
            isGeminiConfigured
              ? 'Live Google Gemini 3.8 Flash model active'
              : 'Simulation / Demo Mode active (Smooth fallback with zero disruptions)'
          }
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isGeminiConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span>{isGeminiConfigured ? 'Gemini 3.8 Live' : 'Simulated AI Mode'}</span>
        </div>

        {/* Daily AI Credits Badge */}
        <button
          onClick={onOpenCreditsModal}
          className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 hover:border-blue-400/60 transition-all group shadow-[0_0_15px_-3px_rgba(0,102,255,0.25)]"
          title={`Daily AI Credits: ${credits}/20 remaining. Resets in ${timeToReset} (Midnight UTC)`}
        >
          <div className="flex items-center gap-1 text-amber-400">
            <Zap className="w-3.5 h-3.5 fill-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white tracking-wide">
              {credits} <span className="text-slate-400 font-normal text-[11px]">/ 20</span>
            </span>
          </div>

          {/* Mini progress bar inside pill */}
          <div className="w-10 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
            <div
              className={`h-full transition-all duration-500 ${
                creditPercent > 50
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                  : creditPercent > 20
                  ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                  : 'bg-gradient-to-r from-red-500 to-rose-400'
              }`}
              style={{ width: `${creditPercent}%` }}
            />
          </div>

          <span className="text-[10px] text-cyan-400 font-semibold hidden md:inline">
            Credits
          </span>
        </button>

        {/* Quick Launch AI Assistant Drawer Toggle */}
        <button
          onClick={onOpenAiChat}
          className={`p-2 rounded-xl border transition-all relative ${
            isAiDrawerOpen
              ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(0,102,255,0.5)]'
              : 'bg-slate-900/80 text-slate-300 border-white/[0.08] hover:border-blue-500/40 hover:text-white'
          }`}
          title="Toggle Context-Aware AI Copilot"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900/80 border border-white/[0.08] hover:border-white/20 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-red-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'P'}
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-semibold text-white leading-tight">
                {user?.full_name || 'Palanisamy'}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">
                {user?.role || 'Developer'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel p-2 shadow-2xl border border-white/10 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                <p className="text-xs font-bold text-white">{user?.full_name || 'Palanisamy'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'ppalanisamy17022@gmail.com'}</p>
                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                  {user?.role || 'Lead Architect / Developer'}
                </div>
              </div>

              <div className="px-3 py-2 bg-slate-950/60 rounded-xl mb-1 text-[11px]">
                <div className="flex justify-between items-center text-slate-300 mb-1">
                  <span>Daily Credits:</span>
                  <span className="font-bold text-amber-400">{credits} / 20</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 text-[10px]">
                  <span>Resets in:</span>
                  <span className="font-mono text-cyan-400">{timeToReset}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onOpenCreditsModal();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white flex items-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Credit Usage & Logs</span>
              </button>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onNavigate('settings');
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white flex items-center gap-2"
              >
                <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>Account & Preferences</span>
              </button>

              <div className="my-1 border-t border-white/[0.06]"></div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onNavigate('dashboard');
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800/80 hover:text-red-400 flex items-center gap-2"
              >
                <span>Switch Role / Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
