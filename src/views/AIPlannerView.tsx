import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Calendar,
  Users,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  FolderPlus,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GeneratedPlan, UserProfile, ProjectItem } from '../types';

interface AIPlannerViewProps {
  user: UserProfile | null;
  onRefreshUser: () => void;
  onProjectImported: (project: ProjectItem) => void;
}

export const AIPlannerView: React.FC<AIPlannerViewProps> = ({
  user,
  onRefreshUser,
  onProjectImported,
}) => {
  const [idea, setIdea] = useState(
    'Build an autonomous multi-modal agent orchestrator with real-time SSE streaming, rate-limit fallback queues, and interactive canvas visualizer.'
  );
  const [techStack, setTechStack] = useState('Python, FastAPI, Redis, React, WebSockets, TailwindCSS');
  const [teamSize, setTeamSize] = useState('3');
  const [targetDays, setTargetDays] = useState('21');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const credits = user?.daily_credits ?? 20;

  const handleGenerate = async (autoImport = false) => {
    if (!idea.trim()) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ai/plan-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          techStack,
          teamSize: parseInt(teamSize, 10) || 3,
          targetDays: parseInt(targetDays, 10) || 21,
          autoImport,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || data.error || 'Failed to generate plan');
        return;
      }

      setPlan(data.plan);
      onRefreshUser();

      if (autoImport && data.importedProject) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
        onProjectImported(data.importedProject);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleImportExistingPlan = async () => {
    if (!plan) return;
    setImporting(true);

    try {
      // Create project directly
      const today = new Date();
      const targetDeadline = new Date(today.getTime() + (plan.suggestedDurationDays || 21) * 86400000)
        .toISOString()
        .split('T')[0];

      const projRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: plan.projectTitle,
          description: plan.projectDescription,
          tech_stack: plan.recommendedTechStack.join(', '),
          team_size: parseInt(teamSize, 10) || 3,
          status: 'Planning',
          health: plan.healthAssessment || 'Good',
          start_date: today.toISOString().split('T')[0],
          deadline: targetDeadline,
        }),
      });

      const newProj = await projRes.json();

      // Add milestones
      for (const m of plan.milestones) {
        const mDate = new Date(today.getTime() + m.targetDays * 86400000).toISOString().split('T')[0];
        await fetch(`/api/projects/${newProj.id}/milestones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: m.title, target_date: mDate }),
        });
      }

      // Add tasks across phases
      for (const phase of plan.phases) {
        for (const t of phase.tasks) {
          const tDate = new Date(today.getTime() + t.daysFromStart * 86400000).toISOString().split('T')[0];
          await fetch(`/api/projects/${newProj.id}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: t.title,
              description: t.description,
              phase_name: phase.phaseName,
              priority: t.priority,
              status: 'To Do',
              estimated_hours: t.estimatedHours,
              due_date: tDate,
            }),
          });
        }
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      onProjectImported(newProj);
    } catch (err: any) {
      alert(`Failed to import plan: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const sampleIdeas = [
    'Autonomous AI multi-agent coding co-pilot with AST refactoring tools',
    'Real-time collaborative canvas with CRDT synchronization & WebRTC',
    'High-frequency crypto trading arbitrage bot with sub-millisecond gRPC execution',
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border border-white/10 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autonomous Project Scoping Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              AI Project Planner & Roadmap Generator
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Transform high-level ideas into production-ready phases, tasks, milestones, and risk matrices.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Operation Cost</span>
              <span className="text-xs font-extrabold text-amber-300">5 AI Credits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Input Scoping Form */}
      <div className="glass-panel rounded-3xl p-6 border border-white/[0.08] space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>Project Specifications & Prompt</span>
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Project Concept / Requirements Brief *
          </label>
          <textarea
            rows={3}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe what you want to build, key architecture requirements, user roles, integrations..."
            className="w-full p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
          />

          {/* Quick Idea Templates */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-500">Quick prompts:</span>
            {sampleIdeas.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setIdea(s)}
                className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/80 hover:bg-blue-600/20 text-slate-400 hover:text-cyan-300 border border-white/5 transition-all text-left"
              >
                {s.slice(0, 32)}...
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Preferred Tech Stack
            </label>
            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="e.g. Python, FastAPI, React"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Team Size (Engineers)
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Sprint Duration (Days)
            </label>
            <input
              type="number"
              min="3"
              max="180"
              value={targetDays}
              onChange={(e) => setTargetDays(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Balance: <strong className="text-white">{credits} / 20 Credits</strong></span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => handleGenerate(false)}
              disabled={loading || !idea.trim()}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
              ) : (
                <Sparkles className="w-4 h-4 text-cyan-300" />
              )}
              <span>Generate Roadmap (5 CR)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated Plan Output */}
      {plan && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="glass-panel rounded-3xl p-6 border border-blue-500/30 shadow-2xl relative overflow-hidden">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                    Generated Architecture
                  </span>
                  {plan.simulated && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300">
                      Simulated Fallback Mode
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mt-1">{plan.projectTitle}</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">{plan.projectDescription}</p>
              </div>

              {/* 1-Click Import CTA */}
              <button
                onClick={handleImportExistingPlan}
                disabled={importing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all shrink-0 disabled:opacity-50"
              >
                {importing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <FolderPlus className="w-4 h-4 text-emerald-200" />
                )}
                <span>1-Click Import to Workspace</span>
              </button>
            </div>

            {/* Executive Summary */}
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
              <h4 className="text-xs font-bold text-cyan-300 mb-1">Executive Delivery Strategy</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{plan.executiveSummary}</p>
            </div>

            {/* Recommended Tech Stack & Timeline */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Recommended Tech Stack
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {plan.recommendedTechStack.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-950 border border-white/10 text-cyan-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Sprint Timeline & Milestones
                </span>
                <div className="mt-2 space-y-1.5">
                  {plan.milestones.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs text-slate-300 py-0.5"
                    >
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{m.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-amber-300">
                        Day {m.targetDays}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Phases with Tasks Breakdown */}
            <div className="mt-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Detailed Phased Implementation Breakdown ({plan.phases.length} Phases)
              </h4>

              <div className="space-y-3">
                {plan.phases.map((phase, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-white/[0.06] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-white">{phase.phaseName}</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">{phase.description}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        {phase.tasks.length} tasks
                      </span>
                    </div>

                    <div className="space-y-2">
                      {phase.tasks.map((task, tIdx) => (
                        <div
                          key={tIdx}
                          className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-200">{task.title}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                task.priority === 'High'
                                  ? 'bg-red-500/20 text-red-300'
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{task.description}</p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 text-[10px] font-mono text-slate-400">
                            <span>⏱️ {task.estimatedHours}h</span>
                            <span>Target: Day {task.daysFromStart}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk & Mitigation Matrix */}
            <div className="mt-5 p-4 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-2">
              <h4 className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Identified Engineering Risks & Mitigations</span>
              </h4>

              <div className="space-y-2">
                {plan.keyRisksAndMitigations.map((item, idx) => (
                  <div key={idx} className="text-xs">
                    <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <span className="text-red-400">⚠️ Risk:</span>
                      <span>{item.risk}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 pl-4 mt-0.5">
                      <span className="text-cyan-400 font-medium">Mitigation:</span> {item.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
