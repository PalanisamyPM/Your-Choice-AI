import React, { useState, useEffect } from 'react';
import {
  X,
  FolderGit2,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { ProjectItem, TaskItem, MilestoneItem } from '../types';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectItem | null;
  tasks: TaskItem[];
  milestones: MilestoneItem[];
  onAddTask: (projectId: number) => void;
  onEditTask: (task: TaskItem) => void;
  onToggleMilestone: (milestoneId: number, currentCompleted: boolean) => Promise<void>;
  onAddMilestone: (projectId: number, title: string, targetDate: string) => Promise<void>;
  onRefresh: () => void;
  onRefreshUser: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  isOpen,
  onClose,
  project,
  tasks,
  milestones,
  onAddTask,
  onEditTask,
  onToggleMilestone,
  onAddMilestone,
  onRefresh,
  onRefreshUser,
}) => {
  const [assessment, setAssessment] = useState<any>(null);
  const [assessing, setAssessing] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [mTitle, setMTitle] = useState('');
  const [mDate, setMDate] = useState('');

  useEffect(() => {
    setAssessment(null);
  }, [project?.id]);

  if (!isOpen || !project) return null;

  const projectTasks = tasks.filter((t) => t.project_id === project.id);
  const projectMilestones = milestones.filter((m) => m.project_id === project.id);

  const completedTasks = projectTasks.filter((t) => t.status === 'Completed').length;
  const progressPercent = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

  const handleRunHealthAssessment = async () => {
    setAssessing(true);
    try {
      const res = await fetch('/api/ai/health-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || data.error || 'Failed to run health check');
        return;
      }
      setAssessment(data.assessment);
      onRefresh();
      onRefreshUser();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAssessing(false);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle || !mDate) return;
    await onAddMilestone(project.id, mTitle, mDate);
    setMTitle('');
    setMDate('');
    setShowAddMilestone(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl rounded-3xl glass-panel border border-white/10 shadow-2xl p-6 max-h-[90vh] flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="pb-4 border-b border-white/[0.08] flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{project.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  project.health === 'Good'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : project.health === 'At Risk'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {project.health} Health
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300">
                  {project.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {project.description || 'No project description provided.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-[10px] text-slate-400">Completion</span>
              <p className="text-base font-bold text-white mt-0.5">{progressPercent}%</p>
              <div className="mt-1.5 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-[10px] text-slate-400">Tasks Breakdown</span>
              <p className="text-xs font-semibold text-white mt-1">
                <span className="text-emerald-400">{completedTasks}</span> done / {projectTasks.length} total
              </p>
              <span className="text-[10px] text-slate-500">
                {projectTasks.filter((t) => t.status === 'In Progress').length} in progress
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-[10px] text-slate-400">Target Deadline</span>
              <p className="text-xs font-semibold text-amber-300 mt-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{project.deadline}</span>
              </p>
              <span className="text-[10px] text-slate-500">Team: {project.team_size} Eng</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400">AI Health Engine</span>
                <span className="block text-[10px] text-cyan-400 font-semibold">2 Credits</span>
              </div>
              <button
                onClick={handleRunHealthAssessment}
                disabled={assessing}
                className="mt-1 w-full py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-cyan-300 hover:text-white border border-blue-500/40 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
              >
                {assessing ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                )}
                <span>Audit Velocity</span>
              </button>
            </div>
          </div>

          {/* AI Assessment Report Box if generated */}
          {assessment && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-blue-500/30 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">AI Health Assessment Report</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    Health Score: {assessment.score}/100
                  </span>
                  {assessment.simulated && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      Simulated
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-300 mb-2">{assessment.velocitySummary}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-3 pt-2 border-t border-white/10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                    Critical Bottlenecks
                  </span>
                  <ul className="mt-1 space-y-1 text-slate-300 text-[11px]">
                    {assessment.criticalBottlenecks?.map((b: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-red-400">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    Recommended Next Actions
                  </span>
                  <ul className="mt-1 space-y-1 text-slate-300 text-[11px]">
                    {assessment.actionItems?.map((a: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-400">✓</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tech Stack Pills */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tech Stack Architecture
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {project.tech_stack.split(',').map((stack, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-900 border border-white/10 text-cyan-300"
                >
                  {stack.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Milestones Roadmap Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sprint Milestones ({projectMilestones.length})</span>
              </span>
              <button
                onClick={() => setShowAddMilestone(!showAddMilestone)}
                className="text-xs text-blue-400 hover:text-cyan-300 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>

            {showAddMilestone && (
              <form
                onSubmit={handleCreateMilestone}
                className="p-3 mb-3 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-2"
              >
                <input
                  type="text"
                  required
                  placeholder="Milestone title..."
                  value={mTitle}
                  onChange={(e) => setMTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-white"
                />
                <input
                  type="date"
                  required
                  value={mDate}
                  onChange={(e) => setMDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Save
                </button>
              </form>
            )}

            <div className="space-y-2">
              {projectMilestones.length === 0 ? (
                <p className="text-xs text-slate-500">No milestones yet for this project.</p>
              ) : (
                projectMilestones.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onToggleMilestone(m.id, m.is_completed)}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.06] hover:border-white/15 transition-all flex items-center justify-between text-xs cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                        m.is_completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-500 group-hover:border-cyan-400'
                      }`}>
                        {m.is_completed && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <span className={m.is_completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                        {m.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Target: {m.target_date}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Project Tasks List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">
                Project Deliverables & Tasks ({projectTasks.length})
              </span>
              <button
                onClick={() => onAddTask(project.id)}
                className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-cyan-300 hover:text-white border border-blue-500/40 text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>New Task</span>
              </button>
            </div>

            <div className="space-y-2">
              {projectTasks.length === 0 ? (
                <p className="text-xs text-slate-500">No tasks created yet.</p>
              ) : (
                projectTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onEditTask(t)}
                    className="p-3 rounded-xl bg-slate-900/90 border border-white/[0.06] hover:border-blue-500/40 transition-all flex items-center justify-between text-xs cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${
                        t.status === 'Completed'
                          ? 'bg-emerald-400'
                          : t.status === 'In Progress'
                          ? 'bg-amber-400'
                          : 'bg-cyan-400'
                      }`} />
                      <div>
                        <p className={`font-semibold ${t.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-200 group-hover:text-cyan-300'}`}>
                          {t.title}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {t.phase_name} • Est: {t.estimated_hours}h • Due: {t.due_date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.priority === 'High' ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {t.priority}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
