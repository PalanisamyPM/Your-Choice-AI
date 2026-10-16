import React, { useState, useEffect } from 'react';
import { Search, FolderGit2, CheckSquare, Sparkles, X, ArrowRight, Zap, BarChart3, Settings } from 'lucide-react';
import { ProjectItem, TaskItem, ViewType } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectItem[];
  tasks: TaskItem[];
  onNavigate: (view: ViewType) => void;
  onSelectProject: (project: ProjectItem) => void;
  onSelectTask: (task: TaskItem) => void;
  onOpenPlanner: () => void;
  onOpenCreditsModal: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  projects,
  tasks,
  onNavigate,
  onSelectProject,
  onSelectTask,
  onOpenPlanner,
  onOpenCreditsModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open handled in parent, but this handles inside modal escape
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const query = searchTerm.toLowerCase();

  const filteredProjects = projects.filter(
    (p) => p.title.toLowerCase().includes(query) || p.tech_stack.toLowerCase().includes(query)
  );

  const filteredTasks = tasks.filter(
    (t) => t.title.toLowerCase().includes(query) || t.phase_name.toLowerCase().includes(query)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl glass-panel border border-white/10 shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/[0.08] flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type a command or search projects & tasks..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          {!query && (
            <div>
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Quick Actions
              </span>
              <div className="mt-1 space-y-1">
                <button
                  onClick={() => {
                    onClose();
                    onOpenPlanner();
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between text-slate-300 hover:bg-slate-800/80 hover:text-white group"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Generate AI Project Plan (5 Credits)</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onNavigate('kanban');
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between text-slate-300 hover:bg-slate-800/80 hover:text-white group"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    <span>Open Interactive Kanban Board</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenCreditsModal();
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between text-slate-300 hover:bg-slate-800/80 hover:text-white group"
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>View Daily AI Credits Audit Ledger</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
          )}

          {/* Projects Results */}
          {filteredProjects.length > 0 && (
            <div>
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Projects ({filteredProjects.length})
              </span>
              <div className="mt-1 space-y-1">
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onClose();
                      onSelectProject(p);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between text-slate-300 hover:bg-slate-800/80 hover:text-white group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FolderGit2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <div className="text-left truncate">
                        <p className="font-semibold text-white group-hover:text-cyan-300">{p.title}</p>
                        <p className="text-[10px] text-slate-400">{p.tech_stack}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 shrink-0">
                      {p.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Results */}
          {filteredTasks.length > 0 && (
            <div>
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Tasks ({filteredTasks.length})
              </span>
              <div className="mt-1 space-y-1">
                {filteredTasks.slice(0, 6).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onClose();
                      onSelectTask(t);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between text-slate-300 hover:bg-slate-800/80 hover:text-white group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="text-left truncate">
                        <p className="font-medium text-slate-200 group-hover:text-white truncate">{t.title}</p>
                        <p className="text-[10px] text-slate-400">{t.phase_name} • {t.estimated_hours}h</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                      t.priority === 'High' ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {t.priority}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && filteredProjects.length === 0 && filteredTasks.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching projects or tasks found for &ldquo;{searchTerm}&rdquo;
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950/60 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-500">
          <span>Navigate with arrows, Enter to select</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
