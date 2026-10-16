/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RightDrawer } from './components/RightDrawer';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { CreditModal } from './components/CreditModal';
import { NewProjectModal } from './components/NewProjectModal';
import { TaskModal } from './components/TaskModal';
import { ProjectDetailModal } from './components/ProjectDetailModal';

import { DashboardView } from './views/DashboardView';
import { ProjectsView } from './views/ProjectsView';
import { AIPlannerView } from './views/AIPlannerView';
import { KanbanView } from './views/KanbanView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

import {
  UserProfile,
  ProjectItem,
  TaskItem,
  MilestoneItem,
  ViewType,
} from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [isGeminiConfigured, setIsGeminiConfigured] = useState<boolean>(false);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [defaultTaskProjectId, setDefaultTaskProjectId] = useState<number | undefined>(undefined);

  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Right drawer toggle
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(true);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch user profile and credits
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsGeminiConfigured(data.isGeminiConfigured);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  }, []);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  }, []);

  // Fetch all milestones from projects
  const fetchAllMilestones = useCallback(async () => {
    try {
      const projRes = await fetch('/api/projects');
      if (!projRes.ok) return;
      const projData: ProjectItem[] = await projRes.json();

      let allM: MilestoneItem[] = [];
      for (const p of projData) {
        const detailRes = await fetch(`/api/projects/${p.id}`);
        if (detailRes.ok) {
          const detail = await detailRes.json();
          if (detail.milestones) {
            allM = allM.concat(detail.milestones);
          }
        }
      }
      setMilestones(allM);
    } catch (err) {
      console.error('Failed to fetch milestones:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchUser();
    fetchProjects();
    fetchTasks();
    fetchAllMilestones();
  }, [fetchUser, fetchProjects, fetchTasks, fetchAllMilestones]);

  // Global Ctrl + K Hotkey listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Task Actions
  const handleSaveTask = async (taskData: any) => {
    if (taskData.id) {
      // Update
      const res = await fetch(`/api/tasks/${taskData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (res.ok) {
        showToast('Task updated successfully');
      }
    } else {
      // Create
      const res = await fetch(`/api/projects/${taskData.project_id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (res.ok) {
        showToast('Task created successfully');
      }
    }
    fetchTasks();
    fetchProjects();
  };

  const handleDeleteTask = async (taskId: number) => {
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Task deleted');
      fetchTasks();
      fetchProjects();
    }
  };

  const handleUpdateTaskStatus = async (
    taskId: number,
    newStatus: 'To Do' | 'In Progress' | 'Completed'
  ) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTasks();
      fetchProjects();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  // Milestone Actions
  const handleToggleMilestone = async (milestoneId: number, currentCompleted: boolean) => {
    try {
      await fetch(`/api/milestones/${milestoneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: !currentCompleted }),
      });
      fetchAllMilestones();
      showToast(!currentCompleted ? 'Milestone achieved!' : 'Milestone reopened');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMilestone = async (projectId: number, title: string, targetDate: string) => {
    try {
      await fetch(`/api/projects/${projectId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, target_date: targetDate }),
      });
      fetchAllMilestones();
      showToast('New milestone added');
    } catch (err) {
      console.error(err);
    }
  };

  // Project Actions
  const handleDeleteProject = async (projectId: number) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Project deleted');
        fetchProjects();
        fetchTasks();
        fetchAllMilestones();
        if (selectedProject?.id === projectId) {
          setIsProjectDetailOpen(false);
          setSelectedProject(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDemoData = async () => {
    try {
      const res = await fetch('/api/user/reset-demo', { method: 'POST' });
      if (res.ok) {
        showToast('Workspace reset to default demo dataset');
        fetchUser();
        fetchProjects();
        fetchTasks();
        fetchAllMilestones();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 border border-blue-500/40 text-xs font-semibold text-white shadow-2xl animate-in slide-in-from-bottom duration-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        user={user}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCreditsModal={() => setIsCreditModalOpen(true)}
        onOpenPlanner={() => setCurrentView('planner')}
        onOpenAiChat={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
        isAiDrawerOpen={isAiDrawerOpen}
        isGeminiConfigured={isGeminiConfigured}
        onNavigate={(view) => setCurrentView(view)}
      />

      {/* Main Layout: Left Sidebar + Center Workspace View + Right Utility Drawer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            currentView={currentView}
            onNavigate={(view) => setCurrentView(view)}
            user={user}
            onOpenCreditsModal={() => setIsCreditModalOpen(true)}
            onOpenAiChat={() => setIsAiDrawerOpen(true)}
          />
        </div>

        {/* Central Dynamic View Container */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          {currentView === 'dashboard' && (
            <DashboardView
              user={user}
              projects={projects}
              tasks={tasks}
              onOpenNewProject={() => setIsNewProjectOpen(true)}
              onOpenPlanner={() => setCurrentView('planner')}
              onSelectProject={(p) => {
                setSelectedProject(p);
                setIsProjectDetailOpen(true);
              }}
              onSelectTask={(t) => {
                setEditingTask(t);
                setIsTaskModalOpen(true);
              }}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onNavigateToKanban={() => setCurrentView('kanban')}
              onNavigateToProjects={() => setCurrentView('projects')}
            />
          )}

          {currentView === 'projects' && (
            <ProjectsView
              projects={projects}
              onOpenNewProject={() => setIsNewProjectOpen(true)}
              onOpenPlanner={() => setCurrentView('planner')}
              onSelectProject={(p) => {
                setSelectedProject(p);
                setIsProjectDetailOpen(true);
              }}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {currentView === 'planner' && (
            <AIPlannerView
              user={user}
              onRefreshUser={fetchUser}
              onProjectImported={(p) => {
                fetchProjects();
                fetchTasks();
                fetchAllMilestones();
                setSelectedProject(p);
                setIsProjectDetailOpen(true);
              }}
            />
          )}

          {currentView === 'kanban' && (
            <KanbanView
              tasks={tasks}
              projects={projects}
              onAddTask={(projId) => {
                setEditingTask(null);
                setDefaultTaskProjectId(projId);
                setIsTaskModalOpen(true);
              }}
              onEditTask={(t) => {
                setEditingTask(t);
                setIsTaskModalOpen(true);
              }}
              onUpdateStatus={handleUpdateTaskStatus}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              projects={projects}
              tasks={tasks}
              user={user}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              user={user}
              isGeminiConfigured={isGeminiConfigured}
              onRefreshUser={fetchUser}
              onResetDemoData={handleResetDemoData}
              onOpenCreditsModal={() => setIsCreditModalOpen(true)}
            />
          )}
        </main>

        {/* Right Utility Drawer (Calendar, Deadlines & AI Copilot Chatbot) */}
        <div className="hidden lg:block">
          <RightDrawer
            isOpen={isAiDrawerOpen}
            onClose={() => setIsAiDrawerOpen(false)}
            tasks={tasks}
            milestones={milestones}
            projects={projects}
            user={user}
            onRefreshUser={fetchUser}
            onTaskClick={(t) => {
              setEditingTask(t);
              setIsTaskModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Global Search Command Palette (Ctrl + K) */}
      <CommandPaletteModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        projects={projects}
        tasks={tasks}
        onNavigate={(view) => setCurrentView(view)}
        onSelectProject={(p) => {
          setSelectedProject(p);
          setIsProjectDetailOpen(true);
        }}
        onSelectTask={(t) => {
          setEditingTask(t);
          setIsTaskModalOpen(true);
        }}
        onOpenPlanner={() => setCurrentView('planner')}
        onOpenCreditsModal={() => setIsCreditModalOpen(true)}
      />

      {/* 2. Daily AI Credits Modal */}
      <CreditModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        user={user}
        onRefresh={fetchUser}
      />

      {/* 3. New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreated={(p) => {
          fetchProjects();
          setSelectedProject(p);
          setIsProjectDetailOpen(true);
          showToast(`Project "${p.title}" created`);
        }}
        onOpenPlanner={() => setCurrentView('planner')}
      />

      {/* 4. Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        projects={projects}
        defaultProjectId={defaultTaskProjectId}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      {/* 5. Project Detail Workspace Modal */}
      <ProjectDetailModal
        isOpen={isProjectDetailOpen}
        onClose={() => {
          setIsProjectDetailOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        tasks={tasks}
        milestones={milestones}
        onAddTask={(pId) => {
          setEditingTask(null);
          setDefaultTaskProjectId(pId);
          setIsTaskModalOpen(true);
        }}
        onEditTask={(t) => {
          setEditingTask(t);
          setIsTaskModalOpen(true);
        }}
        onToggleMilestone={handleToggleMilestone}
        onAddMilestone={handleAddMilestone}
        onRefresh={() => {
          fetchProjects();
          fetchTasks();
          fetchAllMilestones();
        }}
        onRefreshUser={fetchUser}
      />
    </div>
  );
}
