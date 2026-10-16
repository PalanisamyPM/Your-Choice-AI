import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  Sparkles,
  KanbanSquare,
  BarChart3,
  Settings,
  Zap,
  ArrowUpRight,
  Bot,
} from 'lucide-react';
import { YCBrandLogo } from './YCBrandLogo';
import { ViewType, UserProfile } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  user: UserProfile | null;
  onOpenCreditsModal: () => void;
  onOpenAiChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenCreditsModal,
  onOpenAiChat,
}) => {
  const credits = user?.daily_credits ?? 20;
  const creditsPercent = Math.min(100, (credits / 20) * 100);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'My Projects', icon: FolderGit2, badge: '4' },
    { id: 'planner', label: 'AI Planner', icon: Sparkles, hot: true },
    { id: 'kanban', label: 'Tasks (Kanban)', icon: KanbanSquare },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 shrink-0 border-r border-white/[0.08] bg-[#0A0E17] flex flex-col justify-between p-4 z-30 select-none">
      {/* Top Branding */}
      <div>
        <div className="px-2 pt-1 pb-6 border-b border-white/[0.06]">
          <YCBrandLogo size={42} showText={true} />
        </div>

        {/* Navigation Items */}
        <nav className="mt-5 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Platform Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as ViewType)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/30 via-blue-600/15 to-transparent text-white border-l-2 border-blue-500 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-cyan-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.hot && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm">
                    5 CR
                  </span>
                )}
                {item.badge && !item.hot && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Cards */}
      <div className="space-y-3 pt-3 border-t border-white/[0.06]">
        {/* AI Assistant Quick Launch Banner */}
        <div
          onClick={onOpenAiChat}
          className="relative overflow-hidden rounded-2xl p-3 bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-blue-500/30 hover:border-blue-400/60 transition-all cursor-pointer group shadow-lg"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />

          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-cyan-300">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                AI Copilot
              </span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            Ask queries, spot blockers & prioritize tasks.
          </p>
          <div className="mt-2 text-[10px] font-semibold text-cyan-400 flex items-center gap-1">
            <span>Ask question</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400">1 Credit</span>
          </div>
        </div>

        {/* Daily AI Usage Progress Widget */}
        <div
          onClick={onOpenCreditsModal}
          className="rounded-2xl p-3 bg-slate-900/70 border border-white/[0.08] hover:border-amber-500/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Daily AI Credits</span>
            </div>
            <span className="font-bold text-amber-400 text-xs">
              {credits} <span className="text-slate-500 font-normal">/ 20</span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                creditsPercent > 50
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                  : creditsPercent > 20
                  ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                  : 'bg-gradient-to-r from-red-500 to-rose-400'
              }`}
              style={{ width: `${creditsPercent}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>Free Tier Plan</span>
            <span className="text-cyan-400 group-hover:underline">Resets 00:00 UTC</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
