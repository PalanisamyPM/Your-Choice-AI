import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Search,
  Calendar,
  Users,
  Sparkles,
  ArrowRight,
  Trash2,
  Activity,
  Layers,
} from 'lucide-react';
import { ProjectItem } from '../types';

interface ProjectsViewProps {
  projects: ProjectItem[];
  onOpenNewProject: () => void;
  onOpenPlanner: () => void;
  onSelectProject: (project: ProjectItem) => void;
  onDeleteProject: (projectId: number) => Promise<void>;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onOpenNewProject,
  onOpenPlanner,
  onSelectProject,
  onDeleteProject,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((p) => {
    if (filterStatus !== 'All' && p.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tech_stack.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statuses = ['All', 'In Progress', 'Planning', 'Completed', 'On Hold'];

  const handleDelete = async (e: React.MouseEvent, id: number, title: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${title}"? This will also remove its tasks and milestones.`)) {
      await onDeleteProject(id);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="glass-panel rounded-3xl p-5 border border-white/[0.08] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-cyan-400" />
            <span>Workspace Projects ({projects.length})</span>
          </h2>
          <p className="text-xs text-slate-400">
            Microservices, autonomous agents, and production delivery repositories
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search repositories..."
              className="pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-44"
            />
          </div>

          <button
            onClick={onOpenPlanner}
            className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Planner</span>
          </button>

          <button
            onClick={onOpenNewProject}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === st
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProjects.map((p) => {
          const progress = p.progressPercent ?? 0;

          return (
            <div
              key={p.id}
              onClick={() => onSelectProject(p)}
              className="p-5 rounded-3xl glass-panel border border-white/[0.08] hover:border-blue-500/40 hover:bg-slate-900/90 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${
                      p.health === 'Good'
                        ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        : p.health === 'At Risk'
                        ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                        : 'bg-red-400 shadow-[0_0_8px_rgba(255,42,77,0.5)]'
                    }`} />
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {p.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.health === 'Good'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : p.health === 'At Risk'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {p.health}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, p.id, p.title)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {p.description || 'No project description.'}
                </p>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.tech_stack.split(',').map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-950 border border-white/5 text-slate-300"
                    >
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress and Metadata */}
              <div className="pt-3 border-t border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-500" />
                      {p.team_size} Devs
                    </span>
                    <span className="flex items-center gap-1 text-amber-300 font-mono">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      Due {p.deadline}
                    </span>
                  </div>

                  <span className="font-bold text-white font-mono text-xs">
                    {progress}% Complete
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span>{p.completedTasks ?? 0} done / {p.totalTasks ?? 0} tasks</span>
                  <span className="text-cyan-400 font-semibold group-hover:underline flex items-center gap-1">
                    <span>Inspect Workspace</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="col-span-2 py-16 text-center text-xs text-slate-400 glass-panel rounded-3xl border border-dashed border-white/10">
            No projects found matching the current filters.
          </div>
        )}
      </div>
    </div>
  );
};
