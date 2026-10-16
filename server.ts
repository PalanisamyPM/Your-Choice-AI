import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.ts';
import {
  generateProjectPlan,
  assessProjectHealth,
  askTaskForgeAI,
  isGeminiConfigured,
} from './server/ai.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Helper for credit consumption middleware / checks
function handleCreditCheck(
  req: Request,
  res: Response,
  cost: number,
  actionType: 'PLAN_GEN' | 'CHAT' | 'REPORT',
  details?: string
): boolean {
  const userId = 1; // Default user session
  const result = db.checkAndConsumeCredits(userId, cost, actionType, details);

  if (!result.success) {
    res.status(402).json({
      error: 'Insufficient Credits',
      message: result.message,
      remainingCredits: result.remainingCredits,
      requiredCredits: cost,
      nextResetUtc: result.nextResetUtc,
    });
    return false;
  }

  return true;
}

// ----------------- USER & CREDITS ENDPOINTS -----------------

app.get('/api/user/me', (req: Request, res: Response) => {
  const user = db.getUser(1);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Calculate midnight UTC countdown
  const now = new Date();
  const tomorrowUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  const msUntilReset = tomorrowUtc.getTime() - now.getTime();

  res.json({
    user,
    msUntilReset,
    nextResetUtc: tomorrowUtc.toISOString(),
    isGeminiConfigured: isGeminiConfigured(),
  });
});

app.post('/api/user/profile', (req: Request, res: Response) => {
  const { full_name, role, email } = req.body;
  try {
    const updated = db.updateUser(1, { full_name, role, email });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/user/credits/refill', (req: Request, res: Response) => {
  try {
    const user = db.refillCredits(1, 20);
    res.json({ message: 'Credits refilled successfully', daily_credits: user.daily_credits });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/reset-demo', (req: Request, res: Response) => {
  db.resetDemoData();
  res.json({ message: 'Demo data reset successfully' });
});

app.get('/api/credits/logs', (req: Request, res: Response) => {
  const logs = db.getCreditLogs(1);
  res.json(logs);
});

// ----------------- PROJECTS ENDPOINTS -----------------

app.get('/api/projects', (req: Request, res: Response) => {
  const projects = db.getProjects(1);
  const tasks = db.getTasks();
  const milestones = db.getMilestones();

  const enriched = projects.map((proj) => {
    const projTasks = tasks.filter((t) => t.project_id === proj.id);
    const completedTasks = projTasks.filter((t) => t.status === 'Completed').length;
    const inProgressTasks = projTasks.filter((t) => t.status === 'In Progress').length;
    const todoTasks = projTasks.filter((t) => t.status === 'To Do').length;
    const totalTasks = projTasks.length;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const projMilestones = milestones.filter((m) => m.project_id === proj.id);

    return {
      ...proj,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      progressPercent,
      milestonesCount: projMilestones.length,
    };
  });

  res.json(enriched);
});

app.get('/api/projects/:id', (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id, 10);
  const project = db.getProject(projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  const tasks = db.getTasks(projectId);
  const milestones = db.getMilestones(projectId);
  res.json({ project, tasks, milestones });
});

app.post('/api/projects', (req: Request, res: Response) => {
  const { title, description, tech_stack, team_size, status, health, start_date, deadline } = req.body;

  if (!title || !deadline) {
    return res.status(400).json({ error: 'Title and deadline are required' });
  }

  const newProj = db.createProject({
    user_id: 1,
    title,
    description: description || '',
    tech_stack: tech_stack || 'React, Node.js',
    team_size: team_size ? parseInt(team_size, 10) : 1,
    status: status || 'Planning',
    health: health || 'Good',
    start_date: start_date || new Date().toISOString().split('T')[0],
    deadline,
  });

  res.status(201).json(newProj);
});

app.put('/api/projects/:id', (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id, 10);
  try {
    const updated = db.updateProject(projectId, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id, 10);
  const deleted = db.deleteProject(projectId);
  if (deleted) {
    res.json({ success: true, message: 'Project and child items deleted' });
  } else {
    res.status(404).json({ error: 'Project not found' });
  }
});

// ----------------- TASKS ENDPOINTS -----------------

app.get('/api/tasks', (req: Request, res: Response) => {
  const projectId = req.query.projectId ? parseInt(req.query.projectId as string, 10) : undefined;
  const tasks = db.getTasks(projectId);
  const projects = db.getProjects(1);

  // Attach project info to task
  const enriched = tasks.map((t) => {
    const p = projects.find((proj) => proj.id === t.project_id);
    return {
      ...t,
      projectTitle: p ? p.title : 'Unknown Project',
    };
  });

  res.json(enriched);
});

app.post('/api/projects/:id/tasks', (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id, 10);
  const { title, description, phase_name, priority, status, estimated_hours, due_date, dependency_id } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const newTask = db.createTask({
    project_id: projectId,
    title,
    description: description || '',
    phase_name: phase_name || 'General',
    priority: priority || 'Medium',
    status: status || 'To Do',
    estimated_hours: estimated_hours ? parseFloat(estimated_hours) : 1,
    due_date: due_date || new Date().toISOString().split('T')[0],
    dependency_id: dependency_id ? parseInt(dependency_id, 10) : null,
  });

  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const taskId = parseInt(req.params.id, 10);
  try {
    const updated = db.updateTask(taskId, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const taskId = parseInt(req.params.id, 10);
  const deleted = db.deleteTask(taskId);
  if (deleted) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// ----------------- MILESTONES ENDPOINTS -----------------

app.post('/api/projects/:id/milestones', (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id, 10);
  const { title, target_date } = req.body;

  if (!title || !target_date) {
    return res.status(400).json({ error: 'Title and target_date are required' });
  }

  const m = db.createMilestone({
    project_id: projectId,
    title,
    target_date,
    is_completed: false,
  });

  res.status(201).json(m);
});

app.put('/api/milestones/:id', (req: Request, res: Response) => {
  const milestoneId = parseInt(req.params.id, 10);
  try {
    const updated = db.updateMilestone(milestoneId, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

app.delete('/api/milestones/:id', (req: Request, res: Response) => {
  const milestoneId = parseInt(req.params.id, 10);
  const deleted = db.deleteMilestone(milestoneId);
  if (deleted) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Milestone not found' });
  }
});

// ----------------- AI POWERED ENDPOINTS -----------------

// 1. Project Plan Generation (5 Credits)
app.post('/api/ai/plan-project', async (req: Request, res: Response) => {
  const { idea, techStack, teamSize, targetDays, autoImport } = req.body;

  if (!idea) {
    return res.status(400).json({ error: 'Project idea/description is required' });
  }

  // Cost: 5 Credits
  if (!handleCreditCheck(req, res, 5, 'PLAN_GEN', `Generated plan for: "${idea.slice(0, 40)}..."`)) {
    return;
  }

  try {
    const plan = await generateProjectPlan({
      idea,
      techStack,
      teamSize: teamSize ? parseInt(teamSize, 10) : 3,
      targetDays: targetDays ? parseInt(targetDays, 10) : 21,
    });

    let importedProject = null;

    if (autoImport) {
      // Create project automatically in database
      const today = new Date();
      const targetDeadline = new Date(today.getTime() + (plan.suggestedDurationDays || 21) * 86400000)
        .toISOString()
        .split('T')[0];

      importedProject = db.createProject({
        user_id: 1,
        title: plan.projectTitle,
        description: plan.projectDescription,
        tech_stack: plan.recommendedTechStack.join(', '),
        team_size: teamSize ? parseInt(teamSize, 10) : 3,
        status: 'Planning',
        health: plan.healthAssessment || 'Good',
        start_date: today.toISOString().split('T')[0],
        deadline: targetDeadline,
      });

      // Add milestones
      for (const m of plan.milestones) {
        const mDate = new Date(today.getTime() + m.targetDays * 86400000).toISOString().split('T')[0];
        db.createMilestone({
          project_id: importedProject.id,
          title: m.title,
          target_date: mDate,
          is_completed: false,
        });
      }

      // Add tasks across phases
      for (const phase of plan.phases) {
        for (const t of phase.tasks) {
          const tDate = new Date(today.getTime() + t.daysFromStart * 86400000).toISOString().split('T')[0];
          db.createTask({
            project_id: importedProject.id,
            title: t.title,
            description: t.description,
            phase_name: phase.phaseName,
            priority: t.priority,
            status: 'To Do',
            estimated_hours: t.estimatedHours,
            due_date: tDate,
            dependency_id: null,
          });
        }
      }
    }

    const updatedUser = db.getUser(1);
    res.json({
      plan,
      importedProject,
      remainingCredits: updatedUser?.daily_credits,
    });
  } catch (err: any) {
    console.error('Plan generation error:', err);
    res.status(500).json({ error: 'Failed to generate project plan', details: err.message });
  }
});

// 2. Health Assessment (2 Credits)
app.post('/api/ai/health-assessment', async (req: Request, res: Response) => {
  const { projectId } = req.body;
  if (!projectId) {
    return res.status(400).json({ error: 'projectId is required' });
  }

  const project = db.getProject(parseInt(projectId, 10));
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // Cost: 2 Credits
  if (!handleCreditCheck(req, res, 2, 'REPORT', `Health audit for "${project.title}"`)) {
    return;
  }

  try {
    const tasks = db.getTasks(project.id);
    const todayStr = new Date().toISOString().split('T')[0];
    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
    const pendingTasks = tasks.filter((t) => t.status !== 'Completed').length;
    const overdueTasks = tasks.filter((t) => t.status !== 'Completed' && t.due_date < todayStr).length;

    const result = await assessProjectHealth({
      title: project.title,
      totalTasks: tasks.length,
      completedTasks,
      pendingTasks,
      overdueTasks,
      deadline: project.deadline,
      techStack: project.tech_stack,
    });

    // Optionally update project health status in database
    db.updateProject(project.id, { health: result.health });

    const updatedUser = db.getUser(1);
    res.json({
      assessment: result,
      remainingCredits: updatedUser?.daily_credits,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to assess health', details: err.message });
  }
});

// 3. AI Assistant Chatbot (1 Credit)
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Cost: 1 Credit
  if (!handleCreditCheck(req, res, 1, 'CHAT', `Chat query: "${message.slice(0, 35)}..."`)) {
    return;
  }

  try {
    const user = db.getUser(1);
    const projects = db.getProjects(1);
    const tasks = db.getTasks();
    const todayStr = new Date().toISOString().split('T')[0];

    const completedCount = tasks.filter((t) => t.status === 'Completed').length;
    const pendingCount = tasks.filter((t) => t.status !== 'Completed').length;
    const overdueCount = tasks.filter((t) => t.status !== 'Completed' && t.due_date <= todayStr).length;

    const projectsSummary = projects
      .map((p) => `${p.title} (${p.status}, Health: ${p.health}, Due: ${p.deadline})`)
      .join('; ');

    const result = await askTaskForgeAI({
      userQuery: message,
      context: {
        userName: user?.full_name || 'Developer',
        totalProjects: projects.length,
        projectsSummary,
        overdueCount,
        pendingCount,
        completedCount,
      },
    });

    const updatedUser = db.getUser(1);
    res.json({
      ...result,
      remainingCredits: updatedUser?.daily_credits,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Chat failed', details: err.message });
  }
});

// ----------------- VITE MIDDLEWARE / STATIC FILES -----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`YC - TaskForge AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
