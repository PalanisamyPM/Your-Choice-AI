import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Zap,
  Activity,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { ProjectItem, TaskItem, AICreditLogItem, UserProfile } from '../types';

interface ReportsViewProps {
  projects: ProjectItem[];
  tasks: TaskItem[];
  user: UserProfile | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  projects,
  tasks,
  user,
}) => {
  const [logs, setLogs] = useState<AICreditLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logFilter, setLogFilter] = useState<'ALL' | 'PLAN_GEN' | 'CHAT' | 'REPORT'>('ALL');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoadingLogs(true);
      try {
        const res = await fetch('/api/credits/logs');
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchLogs();
  }, []);

  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const todoCount = tasks.filter((t) => t.status === 'To Do').length;

  const totalHoursEstimated = tasks.reduce((acc, t) => acc + (t.estimated_hours || 0), 0);
  const completedHours = tasks
    .filter((t) => t.status === 'Completed')
    .reduce((acc, t) => acc + (t.estimated_hours || 0), 0);

  // Velocity Weekly Data
  const weeklyVelocityData = [
    { day: 'Mon', completed: 3, planned: 4 },
    { day: 'Tue', completed: 5, planned: 5 },
    { day: 'Wed', completed: 4, planned: 6 },
    { day: 'Thu', completed: 7, planned: 6 },
    { day: 'Fri', completed: 6, planned: 8 },
    { day: 'Sat', completed: 2, planned: 2 },
    { day: 'Sun', completed: 4, planned: 3 },
  ];

  // Project progress breakdown for bar chart
  const projectComparisonData = projects.map((p) => ({
    name: p.title.slice(0, 16) + '...',
    progress: p.progressPercent || 0,
    tasks: p.totalTasks || 0,
  }));

  const filteredLogs = logs.filter((l) => {
    if (logFilter === 'ALL') return true;
    return l.action_type === logFilter;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-5 border border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span>Sprint Telemetry & Engineering Velocity</span>
            </h2>
            <p className="text-xs text-slate-400">
              Aggregated burndown velocity, sprint milestones, and credit audit ledger
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Healthy Velocity
            </span>
          </div>
        </div>
      </div>

      {/* Metric High-Level Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-white/[0.08]">
          <span className="text-[11px] text-slate-400">Overall Completion Rate</span>
          <p className="text-2xl font-extrabold text-white mt-1">
            {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
            ↑ 12% faster than last sprint
          </span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/[0.08]">
          <span className="text-[11px] text-slate-400">Engineering Hours Shipped</span>
          <p className="text-2xl font-extrabold text-cyan-400 mt-1">
            {completedHours}h <span className="text-xs text-slate-500 font-normal">/ {totalHoursEstimated}h</span>
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Across all repositories</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/[0.08]">
          <span className="text-[11px] text-slate-400">Active Work-in-Progress</span>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">{inProgressCount} Tasks</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Optimal concurrent limit</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/[0.08]">
          <span className="text-[11px] text-slate-400">Daily AI Credits Balance</span>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">
            {user?.daily_credits ?? 20} <span className="text-xs text-slate-500 font-normal">/ 20</span>
          </p>
          <span className="text-[10px] text-cyan-400 mt-1 block">Resets 00:00 UTC</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Velocity Line Chart */}
        <div className="glass-panel rounded-3xl p-5 border border-white/[0.08]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Weekly Task Completion Velocity
              </h3>
              <p className="text-[11px] text-slate-400">Daily completed vs target hours</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Shipped</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Target</span>
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyVelocityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#00D2FF"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#00D2FF' }}
                />
                <Line
                  type="monotone"
                  dataKey="planned"
                  stroke="#6366F1"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Comparison Bar Chart */}
        <div className="glass-panel rounded-3xl p-5 border border-white/[0.08]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Project Delivery Progress (%)
              </h3>
              <p className="text-[11px] text-slate-400">Milestone readiness per repository</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Live DB Metrics</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="progress" fill="#0066FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Credit Consumption Audit Trail Table */}
      <div className="glass-panel rounded-3xl p-5 border border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>AI Credit Consumption Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-400">
              Complete transaction log of every plan generation, health check, and chatbot query
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-white/5">
            {(['ALL', 'PLAN_GEN', 'CHAT', 'REPORT'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setLogFilter(filter)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                  logFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-slate-950/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 text-[10px] uppercase border-b border-white/5">
              <tr>
                <th className="py-2.5 px-4">Log ID</th>
                <th className="py-2.5 px-4">Date & Time</th>
                <th className="py-2.5 px-4">Action Type</th>
                <th className="py-2.5 px-4">Cost</th>
                <th className="py-2.5 px-4">Audit Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] text-slate-300">
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                    #CR-{String(log.id).padStart(4, '0')}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-cyan-300">
                      {log.action_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-amber-400 font-mono">
                    -{log.credits_spent} CR
                  </td>
                  <td className="py-2.5 px-4 text-xs text-slate-300">
                    {log.details || 'Automatic credit transaction'}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-500">
                    No credit audit transactions match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
