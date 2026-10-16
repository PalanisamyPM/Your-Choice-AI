import React from 'react';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  KanbanSquare,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { ProjectItem, TaskItem, UserProfile } from '../types';

interface DashboardViewProps {
  user: UserProfile | null;
  projects: ProjectItem[];
  tasks: TaskItem[];
  onOpenNewProject: () => void;
  onOpenPlanner: () => void;
  onSelectProject: (project: ProjectItem) => void;
  onSelectTask: (task: TaskItem) => void;
  onUpdateTaskStatus: (taskId: number, status: 'To Do' | 'In Progress' | 'Completed') => void;
  onNavigateToKanban: () => void;
  onNavigateToProjects: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  projects,
  tasks,
  onOpenNewProject,
  onOpenPlanner,
  onSelectProject,
  onSelectTask,
  onUpdateTaskStatus,
  onNavigateToKanban,
  onNavigateToProjects,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const totalProjects = projects.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'Completed').length;
  const overdueTasks = tasks.filter((t) => t.status !== 'Completed' && t.due_date <= todayStr).length;

  // Chart data 1: Project status breakdown for Donut chart
  const completedProjectsCount = projects.filter((p) => p.status === 'Completed').length;
  const inProgressProjectsCount = projects.filter((p) => p.status === 'In Progress').length;
  const planningProjectsCount = projects.filter((p) => p.status === 'Planning').length;

  const projectStatusData = [
    { name: 'Completed', value: completedProjectsCount || 1, color: '#10B981' },
    { name: 'In Progress', value: inProgressProjectsCount || 2, color: '#0066FF' },
    { name: 'Planning', value: planningProjectsCount || 1, color: '#F59E0B' },
  ];

  // Chart data 2: Task Completion Trend (Mon–Sun)
  const trendData = [
    { day: 'Mon', completed: 2, target: 3 },
    { day: 'Tue', completed: 4, target: 4 },
    { day: 'Wed', completed: 3, target: 5 },
    { day: 'Thu', completed: 6, target: 5 },
    { day: 'Fri', completed: 5, target: 6 },
    { day: 'Sat', completed: 2, target: 2 },
    { day: 'Sun', completed: 3, target: 3 },
  ];

  // Health distribution
  const goodHealthCount = projects.filter((p) => p.health === 'Good').length;
  const atRiskCount = projects.filter((p) => p.health === 'At Risk').length;
  const delayedCount = projects.filter((p) => p.health === 'Delayed').length;

  // Kanban preview tasks grouped
  const todoTasks = tasks.filter((t) => t.status === 'To Do').slice(0, 3);
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').slice(0, 3);
  const doneTasks = tasks.filter((t) => t.status === 'Completed').slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950 via-slate-900 to-[#10172A] border border-white/10 shadow-2xl">
        {/* Visual accents inspired by YC liquid splash */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-600/20 via-red-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Sprint Velocity: 94.2% On Track</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Hi, {user?.full_name || 'Palanisamy'} 👋
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Welcome to <strong className="text-white">TaskForge AI</strong>. You have{' '}
              <span className="text-amber-400 font-bold">{pendingTasks} pending tasks</span> across{' '}
              <span className="text-cyan-400 font-bold">{totalProjects} active projects</span>.
              {overdueTasks > 0 && (
                <span className="ml-1 text-red-400 font-semibold">
                  ({overdueTasks} requiring immediate attention today)
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewProject}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>+ Create New Project</span>
            </button>

            <button
              onClick={onOpenPlanner}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-red-600 hover:from-blue-500 hover:to-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all group"
            >
              <Sparkles className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
              <span>✨ Open AI Planner (5 CR)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FOUR KEY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Projects */}
        <div className="p-4 rounded-2xl glass-panel border border-white/[0.08] hover:border-blue-500/30 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Projects</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-cyan-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{totalProjects}</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +1 this week
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">4 active engineering repos</p>
        </div>

        {/* Card 2: Completed Tasks */}
        <div className="p-4 rounded-2xl glass-panel border border-white/[0.08] hover:border-emerald-500/30 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Completed Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{completedTasks}</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +8 this week
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}% total shipped
          </p>
        </div>

        {/* Card 3: Pending Tasks */}
        <div className="p-4 rounded-2xl glass-panel border border-white/[0.08] hover:border-amber-500/30 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Pending Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{pendingTasks}</span>
            <span className="text-xs font-semibold text-slate-400">
              In active sprint
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across 3 sprint phases</p>
        </div>

        {/* Card 4: Overdue Tasks */}
        <div className="p-4 rounded-2xl glass-panel border border-white/[0.08] hover:border-red-500/30 transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Overdue Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-red-400">{overdueTasks}</span>
            <span className="text-xs font-semibold text-red-400">
              {overdueTasks > 0 ? 'High Risk' : 'None'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {overdueTasks > 0 ? 'Immediate action advised' : 'Clean sprint schedule'}
          </p>
        </div>
      </div>

      {/* 3. CONTENT GRID: MY PROJECTS WIDGET & ANALYTICS SUITE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Projects Widget */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-5 border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-cyan-400" />
                  <span>My Active Projects</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track delivery velocity, tech stack, and deadlines
                </p>
              </div>

              <button
                onClick={onNavigateToProjects}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Project List */}
            <div className="space-y-3">
              {projects.slice(0, 4).map((p) => {
                const progress = p.progressPercent ?? 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProject(p)}
                    className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/[0.06] hover:border-blue-500/40 hover:bg-slate-900/90 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          p.health === 'Good'
                            ? 'bg-emerald-400'
                            : p.health === 'At Risk'
                            ? 'bg-amber-400'
                            : 'bg-red-400'
                        }`} />
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {p.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                          {p.status}
                        </span>
                        <span className="text-[10px] text-amber-300 font-mono">
                          Due: {p.deadline}
                        </span>
                      </div>
                    </div>

                    {/* Tech Stack Pills */}
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {p.tech_stack.split(',').slice(0, 4).map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-slate-950/80 border border-white/5 text-slate-400"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-300 w-8 text-right font-mono">
                        {progress}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Analytics Suite (Donut + Health Gauge) */}
        <div className="glass-panel rounded-3xl p-5 border border-white/[0.08] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Analytics Suite</span>
              </h3>
              <span className="text-[10px] text-slate-500">Live Telemetry</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">Project Status & Health Distribution</p>

            {/* Donut Chart */}
            <div className="h-44 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center donut label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-white">{totalProjects}</span>
                <span className="text-[9px] text-slate-400">Projects</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-around text-[10px] text-slate-400 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Completed ({completedProjectsCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>In Progress ({inProgressProjectsCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Planning ({planningProjectsCount})</span>
              </div>
            </div>
          </div>

          {/* Radial Health Gauge */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-white">System Health Gauge</span>
              <span className="text-[10px] font-bold text-emerald-400">
                {goodHealthCount} Good • {atRiskCount} At Risk • {delayedCount} Delayed
              </span>
            </div>

            {/* Health Bar breakdown */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-white/5">
              <div
                style={{ width: `${(goodHealthCount / totalProjects) * 100}%` }}
                className="bg-emerald-500 h-full rounded-l-full"
                title={`${goodHealthCount} Good Health`}
              />
              <div
                style={{ width: `${(atRiskCount / totalProjects) * 100}%` }}
                className="bg-amber-500 h-full"
                title={`${atRiskCount} At Risk`}
              />
              <div
                style={{ width: `${(delayedCount / totalProjects) * 100}%` }}
                className="bg-red-500 h-full rounded-r-full"
                title={`${delayedCount} Delayed`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE KANBAN PREVIEW */}
      <div className="glass-panel rounded-3xl p-5 border border-white/[0.08]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <KanbanSquare className="w-4 h-4 text-cyan-400" />
              <span>Interactive Kanban Preview</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Quickly advance tasks or open full drag-and-drop workspace
            </p>
          </div>

          <button
            onClick={onNavigateToKanban}
            className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-cyan-300 hover:text-white border border-blue-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <span>Open Full Kanban Board</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Columns Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Col 1: To Do */}
          <div className="p-3 rounded-2xl bg-slate-950/40 border border-white/[0.06] space-y-2.5">
            <div className="flex items-center justify-between text-xs px-1 pb-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>To Do</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400 font-mono">
                {tasks.filter((t) => t.status === 'To Do').length}
              </span>
            </div>

            <div className="space-y-2">
              {todoTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-slate-900 border border-white/5 hover:border-blue-500/40 transition-all text-xs group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                      {t.projectTitle}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      t.priority === 'High' ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                  <p
                    onClick={() => onSelectTask(t)}
                    className="font-semibold text-slate-200 group-hover:text-cyan-300 cursor-pointer transition-colors"
                  >
                    {t.title}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>⏱️ {t.estimated_hours}h</span>
                    <button
                      onClick={() => onUpdateTaskStatus(t.id, 'In Progress')}
                      className="px-2 py-0.5 rounded bg-blue-600/20 hover:bg-blue-600 text-cyan-300 hover:text-white transition-colors"
                    >
                      Start →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Col 2: In Progress */}
          <div className="p-3 rounded-2xl bg-slate-950/40 border border-white/[0.06] space-y-2.5">
            <div className="flex items-center justify-between text-xs px-1 pb-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>In Progress</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                {tasks.filter((t) => t.status === 'In Progress').length}
              </span>
            </div>

            <div className="space-y-2">
              {inProgressTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-slate-900 border border-amber-500/20 hover:border-amber-400/50 transition-all text-xs group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                      {t.projectTitle}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                      Active
                    </span>
                  </div>
                  <p
                    onClick={() => onSelectTask(t)}
                    className="font-semibold text-slate-200 group-hover:text-amber-300 cursor-pointer transition-colors"
                  >
                    {t.title}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                    <button
                      onClick={() => onUpdateTaskStatus(t.id, 'To Do')}
                      className="hover:text-white"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => onUpdateTaskStatus(t.id, 'Completed')}
                      className="px-2 py-0.5 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-colors"
                    >
                      Complete ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: Completed */}
          <div className="p-3 rounded-2xl bg-slate-950/40 border border-white/[0.06] space-y-2.5">
            <div className="flex items-center justify-between text-xs px-1 pb-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Completed</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-mono">
                {tasks.filter((t) => t.status === 'Completed').length}
              </span>
            </div>

            <div className="space-y-2">
              {doneTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                      {t.projectTitle}
                    </span>
                    <span className="text-emerald-400 text-[10px] font-bold">Done</span>
                  </div>
                  <p
                    onClick={() => onSelectTask(t)}
                    className="font-semibold text-slate-400 line-through group-hover:text-slate-300 cursor-pointer transition-colors"
                  >
                    {t.title}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Shipped</span>
                    <button
                      onClick={() => onUpdateTaskStatus(t.id, 'In Progress')}
                      className="hover:text-amber-300"
                    >
                      Reopen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
