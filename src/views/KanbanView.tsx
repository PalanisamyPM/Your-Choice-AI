import React, { useState } from 'react';
import {
  KanbanSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { TaskItem, ProjectItem } from '../types';

interface KanbanViewProps {
  tasks: TaskItem[];
  projects: ProjectItem[];
  onAddTask: (projectId?: number) => void;
  onEditTask: (task: TaskItem) => void;
  onUpdateStatus: (taskId: number, newStatus: 'To Do' | 'In Progress' | 'Completed') => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  projects,
  onAddTask,
  onEditTask,
  onUpdateStatus,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering
  const filteredTasks = tasks.filter((task) => {
    if (selectedProjectId !== 'all' && task.project_id !== parseInt(selectedProjectId, 10)) {
      return false;
    }
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.phase_name.toLowerCase().includes(q) ||
        (task.projectTitle && task.projectTitle.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'To Do');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'In Progress');
  const completedTasks = filteredTasks.filter((t) => t.status === 'Completed');

  // Drag and drop HTML5
  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('text/plain', String(taskId));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: 'To Do' | 'In Progress' | 'Completed') => {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData('text/plain');
    if (taskIdStr) {
      const taskId = parseInt(taskIdStr, 10);
      onUpdateStatus(taskId, targetStatus);
    }
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Top Controls Bar */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-white/[0.08] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <KanbanSquare className="w-5 h-5 text-cyan-400" />
            <span>Interactive Sprint Kanban Board</span>
          </h2>
          <p className="text-xs text-slate-400">
            Drag cards between swimlanes or use quick status advance controls
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks..."
              className="pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-36 sm:w-44"
            />
          </div>

          {/* Project Filter */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Add Task Button */}
          <button
            onClick={() => onAddTask(selectedProjectId !== 'all' ? parseInt(selectedProjectId, 10) : undefined)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* 3 Full Columns Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* COLUMN 1: TO DO */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'To Do')}
          className="rounded-3xl glass-panel p-4 border border-white/[0.08] flex flex-col justify-between min-h-[520px]"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">To Do</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
                {todoTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {todoTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/[0.06] hover:border-blue-500/40 hover:bg-slate-900 transition-all shadow-md group cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-cyan-400 font-semibold truncate max-w-[150px]">
                      {task.projectTitle}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      task.priority === 'High'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : task.priority === 'Medium'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {task.priority}
                    </span>
                  </div>

                  <h4
                    onClick={() => onEditTask(task)}
                    className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    {task.title}
                  </h4>

                  {task.description && (
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 font-medium">
                      {task.phase_name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span>⏱️ {task.estimated_hours}h</span>
                      <button
                        onClick={() => onUpdateStatus(task.id, 'In Progress')}
                        className="p-1 rounded-md bg-blue-600/30 hover:bg-blue-600 text-cyan-300 hover:text-white transition-colors"
                        title="Move to In Progress"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {todoTasks.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-white/10 rounded-2xl">
                  No tasks in backlog.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 2: IN PROGRESS */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'In Progress')}
          className="rounded-3xl glass-panel p-4 border border-amber-500/20 bg-amber-950/5 flex flex-col justify-between min-h-[520px]"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">In Progress</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 hover:bg-slate-900 transition-all shadow-md group cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-amber-400 font-semibold truncate max-w-[150px]">
                      {task.projectTitle}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                      Active
                    </span>
                  </div>

                  <h4
                    onClick={() => onEditTask(task)}
                    className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    {task.title}
                  </h4>

                  {task.description && (
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                    <button
                      onClick={() => onUpdateStatus(task.id, 'To Do')}
                      className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Move back to To Do"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span>⏱️ {task.estimated_hours}h</span>
                    <button
                      onClick={() => onUpdateStatus(task.id, 'Completed')}
                      className="px-2 py-1 rounded-md bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-colors font-semibold"
                      title="Mark as Completed"
                    >
                      Complete ✓
                    </button>
                  </div>
                </div>
              ))}

              {inProgressTasks.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-amber-500/20 rounded-2xl">
                  Drag tasks here to start sprint.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 3: COMPLETED */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'Completed')}
          className="rounded-3xl glass-panel p-4 border border-emerald-500/20 bg-emerald-950/5 flex flex-col justify-between min-h-[520px]"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Completed</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">
                {completedTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-emerald-500/40 transition-all text-xs group cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                      {task.projectTitle}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Shipped
                    </span>
                  </div>

                  <h4
                    onClick={() => onEditTask(task)}
                    className="text-xs font-semibold text-slate-400 line-through group-hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {task.title}
                  </h4>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                    <button
                      onClick={() => onUpdateStatus(task.id, 'In Progress')}
                      className="hover:text-amber-400 transition-colors"
                    >
                      ← Reopen
                    </button>
                    <span>Done</span>
                  </div>
                </div>
              ))}

              {completedTasks.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-emerald-500/20 rounded-2xl">
                  Completed tasks will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
