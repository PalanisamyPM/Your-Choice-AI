import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Send,
  Bot,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { TaskItem, MilestoneItem, ProjectItem, UserProfile } from '../types';

interface RightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskItem[];
  milestones: MilestoneItem[];
  projects: ProjectItem[];
  user: UserProfile | null;
  onRefreshUser: () => void;
  onTaskClick: (task: TaskItem) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestions?: string[];
  simulated?: boolean;
}

export const RightDrawer: React.FC<RightDrawerProps> = ({
  isOpen,
  onClose,
  tasks,
  milestones,
  projects,
  user,
  onRefreshUser,
  onTaskClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${user?.full_name || 'Palanisamy'}! I am your **YC - TaskForge AI Co-pilot**.\n\nI have full visibility into your **${projects.length} active projects** and pending sprint tasks. How can I help you accelerate delivery today?`,
      timestamp: 'Just now',
      suggestions: [
        'Which tasks are overdue?',
        'What should I do next?',
        'Summarize my project progress',
      ],
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'copilot' | 'calendar' | 'deadlines'>('copilot');

  // Mini Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Check if a calendar day has milestones or task deadlines
  const getDayEvents = (day: number) => {
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayMilestones = milestones.filter((m) => m.target_date === formatted);
    const dayTasks = tasks.filter((t) => t.due_date === formatted);
    return { milestones: dayMilestones, tasks: dayTasks, total: dayMilestones.length + dayTasks.length };
  };

  // Upcoming deadlines sorted
  const sortedUpcoming = [...tasks]
    .filter((t) => t.status !== 'Completed')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isSending) return;

    const userMsgId = 'msg-' + Date.now();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newUserMsg]);
    setInputQuery('');
    setIsSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await res.json();

      if (!res.ok) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: 'err-' + Date.now(),
            sender: 'ai',
            text: `⚠️ **Credit limit reached**: ${data.message || 'You have exhausted your daily 20 AI credits. Limit resets at midnight UTC.'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        return;
      }

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: data.suggestions,
        simulated: data.simulated,
      };

      setChatMessages((prev) => [...prev, aiMsg]);
      onRefreshUser(); // Refresh credits in header
    } catch (e: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'ai',
          text: `Error connecting to TaskForge AI: ${e.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="w-80 md:w-96 h-screen sticky top-0 shrink-0 border-l border-white/[0.08] bg-[#0A0E17] flex flex-col justify-between z-30 select-none">
      {/* Top Header with Tab Switcher */}
      <div className="p-3 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/[0.06]">
          <button
            onClick={() => setActiveTab('copilot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'copilot'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Copilot</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'calendar'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab('deadlines')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'deadlines'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Deadlines</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: CONTEXT-AWARE AI CHATBOT */}
        {activeTab === 'copilot' && (
          <div className="flex flex-col h-full justify-between">
            {/* Messages Scroll Area */}
            <div className="space-y-3.5 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                    {msg.sender === 'ai' ? (
                      <>
                        <Bot className="w-3 h-3 text-cyan-400" />
                        <span className="font-semibold text-cyan-400">TaskForge AI</span>
                        {msg.simulated && (
                          <span className="px-1 rounded bg-amber-500/20 text-amber-300 text-[9px]">
                            Simulated
                          </span>
                        )}
                      </>
                    ) : (
                      <span>You</span>
                    )}
                    <span>• {msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[90%] ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md'
                        : 'glass-panel text-slate-200 rounded-tl-none border border-white/[0.08]'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                  </div>

                  {/* Suggestion Pills */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.suggestions.map((pill, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(pill)}
                          disabled={isSending}
                          className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-900 border border-blue-500/30 text-cyan-300 hover:bg-blue-600/20 hover:border-blue-400 transition-all text-left"
                        >
                          {pill}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isSending && (
                <div className="flex items-center gap-2 text-xs text-slate-400 p-3 glass-panel rounded-2xl w-fit">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>TaskForge AI analyzing workspace...</span>
                </div>
              )}
            </div>

            {/* Input Box */}
            <div className="mt-3 pt-2 border-t border-white/[0.08]">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 px-1">
                <span>Context: {projects.length} Projects, {tasks.length} Tasks</span>
                <span className="text-amber-400 font-medium">⚡ 1 Credit per query</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask TaskForge AI anything..."
                  disabled={isSending}
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputQuery.trim() || isSending}
                  className="absolute right-2 top-2 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-2xl">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-white tracking-wide">
                  {monthNames[month]} {year}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-500 mb-2">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isCurrentDay =
                    day === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear();

                  const { milestones: dayM, tasks: dayT, total } = getDayEvents(day);

                  return (
                    <div
                      key={`day-${day}`}
                      className={`h-8 rounded-lg flex flex-col items-center justify-center text-xs relative transition-all cursor-pointer ${
                        isCurrentDay
                          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                          : total > 0
                          ? 'bg-slate-800/80 text-white hover:bg-slate-700'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                      }`}
                      title={
                        total > 0
                          ? `${total} deliverable(s): ${dayM.map((m) => m.title).concat(dayT.map((t) => t.title)).join(', ')}`
                          : undefined
                      }
                    >
                      <span>{day}</span>
                      {total > 0 && !isCurrentDay && (
                        <div className="flex gap-0.5 mt-0.5">
                          {dayM.length > 0 && (
                            <span className="w-1 h-1 rounded-full bg-red-400" />
                          )}
                          {dayT.length > 0 && (
                            <span className="w-1 h-1 rounded-full bg-cyan-400" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span>Milestone</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Task Due</span>
                </div>
              </div>
            </div>

            {/* Upcoming Milestones */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Project Milestones</span>
              </h4>
              <div className="space-y-2">
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-white/[0.06] flex items-start justify-between gap-2 text-xs"
                  >
                    <div>
                      <p className={`font-medium ${m.is_completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {m.title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Target: {m.target_date}
                      </p>
                    </div>
                    {m.is_completed ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Achieved
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                        Active
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: UPCOMING DEADLINES */}
        {activeTab === 'deadlines' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Upcoming Task Deadlines</span>
              </h4>
              <span className="text-[10px] text-slate-500">Sorted by Urgency</span>
            </div>

            <div className="space-y-2.5">
              {sortedUpcoming.map((task) => {
                const todayStr = new Date().toISOString().split('T')[0];
                const isOverdue = task.due_date < todayStr;
                const isDueToday = task.due_date === todayStr;

                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="p-3 rounded-xl bg-slate-900/90 border border-white/[0.08] hover:border-blue-500/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {task.projectTitle || 'Project Deliverable'}
                      </span>
                      {isOverdue ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Overdue
                        </span>
                      ) : isDueToday ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Due Today
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-500/20 text-cyan-300">
                          {task.due_date}
                        </span>
                      )}
                    </div>

                    <h5 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {task.title}
                    </h5>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {task.phase_name}
                      </span>
                      <span className="font-mono text-slate-400">
                        ⏱️ {task.estimated_hours}h
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
