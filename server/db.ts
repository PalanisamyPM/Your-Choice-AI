import fs from 'fs';
import path from 'path';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
  daily_credits: number;
  last_credit_reset: string; // ISO string
  created_at: string;
}

export interface Project {
  id: number;
  user_id: number;
  title: string;
  description: string;
  tech_stack: string; // Comma-separated tags
  team_size: number;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
  health: 'Good' | 'At Risk' | 'Delayed';
  start_date: string; // YYYY-MM-DD
  deadline: string;   // YYYY-MM-DD
  created_at: string;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string;
  phase_name: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Completed';
  estimated_hours: number;
  due_date: string; // YYYY-MM-DD
  dependency_id: number | null;
}

export interface Milestone {
  id: number;
  project_id: number;
  title: string;
  target_date: string; // YYYY-MM-DD
  is_completed: boolean;
}

export interface AICreditLog {
  id: number;
  user_id: number;
  action_type: 'PLAN_GEN' | 'CHAT' | 'REPORT';
  credits_spent: number;
  timestamp: string;
  details?: string;
}

interface DatabaseSchema {
  users: User[];
  projects: Project[];
  tasks: Task[];
  milestones: Milestone[];
  credit_logs: AICreditLog[];
  nextIds: {
    user: number;
    project: number;
    task: number;
    milestone: number;
    credit_log: number;
  };
}

const DB_FILE = path.join(process.cwd(), 'taskforge_db.json');

function getInitialData(): DatabaseSchema {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const initialUsers: User[] = [
    {
      id: 1,
      email: 'ppalanisamy17022@gmail.com',
      password_hash: 'argon2_mock_hash_developer',
      full_name: 'Palanisamy',
      role: 'Lead Architect / Developer',
      daily_credits: 15,
      last_credit_reset: now.toISOString(),
      created_at: new Date(now.getTime() - 14 * 86400000).toISOString(),
    },
  ];

  const initialProjects: Project[] = [
    {
      id: 1,
      user_id: 1,
      title: 'TaskForge Autonomous AI Engine',
      description: 'Distributed AI agent framework with autonomous planning, multi-agent task dispatching, and automated code review.',
      tech_stack: 'Python, FastAPI, PyTorch, React, Redis',
      team_size: 4,
      status: 'In Progress',
      health: 'Good',
      start_date: new Date(now.getTime() - 10 * 86400000).toISOString().split('T')[0],
      deadline: new Date(now.getTime() + 18 * 86400000).toISOString().split('T')[0],
      created_at: new Date(now.getTime() - 10 * 86400000).toISOString(),
    },
    {
      id: 2,
      user_id: 1,
      title: 'CloudEdge Realtime Sync Gateway',
      description: 'Ultra low-latency WebSocket & gRPC edge proxy for multi-tenant collaborative canvases and live operational transform sync.',
      tech_stack: 'Go, WebSockets, gRPC, Redis, Docker',
      team_size: 3,
      status: 'In Progress',
      health: 'At Risk',
      start_date: new Date(now.getTime() - 8 * 86400000).toISOString().split('T')[0],
      deadline: new Date(now.getTime() + 4 * 86400000).toISOString().split('T')[0],
      created_at: new Date(now.getTime() - 8 * 86400000).toISOString(),
    },
    {
      id: 3,
      user_id: 1,
      title: 'FinScale Distributed Microservices',
      description: 'Event-driven high-throughput financial transaction processing engine with idempotency keys and audit logging.',
      tech_stack: 'Node.js, TypeScript, PostgreSQL, Kafka, Vite',
      team_size: 5,
      status: 'Completed',
      health: 'Good',
      start_date: new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0],
      deadline: new Date(now.getTime() - 2 * 86400000).toISOString().split('T')[0],
      created_at: new Date(now.getTime() - 30 * 86400000).toISOString(),
    },
    {
      id: 4,
      user_id: 1,
      title: 'SmartPulse Wearable Telemetry',
      description: 'On-device health sensor ingestion pipeline with biometric anomaly detection using quantization-aware neural nets.',
      tech_stack: 'Flutter, Flask, SQLite, TensorFlow Lite',
      team_size: 2,
      status: 'Planning',
      health: 'Delayed',
      start_date: new Date(now.getTime() - 2 * 86400000).toISOString().split('T')[0],
      deadline: new Date(now.getTime() + 25 * 86400000).toISOString().split('T')[0],
      created_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
    },
  ];

  const initialTasks: Task[] = [
    // Project 1: TaskForge Autonomous AI Engine
    {
      id: 1,
      project_id: 1,
      title: 'Design Agent Reasoning Graph & State Machine',
      description: 'Formalize LangGraph style state transitions and rollback mechanisms for multi-turn task synthesis.',
      phase_name: 'Phase 1: Architecture',
      priority: 'High',
      status: 'Completed',
      estimated_hours: 8,
      due_date: new Date(now.getTime() - 4 * 86400000).toISOString().split('T')[0],
      dependency_id: null,
    },
    {
      id: 2,
      project_id: 1,
      title: 'Implement Prompt Routing & Token Optimization',
      description: 'Build dynamic caching layer and few-shot exemplar selector to trim context length by 40%.',
      phase_name: 'Phase 2: Core Engine',
      priority: 'High',
      status: 'In Progress',
      estimated_hours: 6.5,
      due_date: new Date(now.getTime() + 2 * 86400000).toISOString().split('T')[0],
      dependency_id: 1,
    },
    {
      id: 3,
      project_id: 1,
      title: 'Build Streaming Telemetry & Audit Logs UI',
      description: 'Create real-time SSE stream listener displaying token consumption and execution latencies.',
      phase_name: 'Phase 3: Frontend',
      priority: 'Medium',
      status: 'To Do',
      estimated_hours: 5,
      due_date: new Date(now.getTime() + 6 * 86400000).toISOString().split('T')[0],
      dependency_id: 2,
    },
    {
      id: 4,
      project_id: 1,
      title: 'End-to-End Stress Testing under Concurrent Quotas',
      description: 'Simulate 500 concurrent synthetic users testing credit exhaustion and rate limiter resilience.',
      phase_name: 'Phase 4: QA & Launch',
      priority: 'Low',
      status: 'To Do',
      estimated_hours: 10,
      due_date: new Date(now.getTime() + 14 * 86400000).toISOString().split('T')[0],
      dependency_id: 3,
    },

    // Project 2: CloudEdge Realtime Sync Gateway
    {
      id: 5,
      project_id: 2,
      title: 'Fix Redis PubSub Channel Multiplexing Memory Leak',
      description: 'Investigate unbounded subscriber buffer during connection dropouts in high volume clusters.',
      phase_name: 'Phase 2: Stability',
      priority: 'High',
      status: 'In Progress',
      estimated_hours: 4.5,
      due_date: todayStr, // Due today!
      dependency_id: null,
    },
    {
      id: 6,
      project_id: 2,
      title: 'Migrate Ephemeral Session State to Redis Cluster',
      description: 'Configure distributed locks with Redlock algorithm to avoid split-brain state conflicts.',
      phase_name: 'Phase 2: Stability',
      priority: 'High',
      status: 'To Do',
      estimated_hours: 7,
      due_date: new Date(now.getTime() + 1 * 86400000).toISOString().split('T')[0],
      dependency_id: 5,
    },
    {
      id: 7,
      project_id: 2,
      title: 'Implement TLS Handshake Termination on Envoy Proxy',
      description: 'Set up automated Let\'s Encrypt certificate renewal and HTTP/2 protocol negotiation.',
      phase_name: 'Phase 1: Networking',
      priority: 'Medium',
      status: 'Completed',
      estimated_hours: 6,
      due_date: new Date(now.getTime() - 5 * 86400000).toISOString().split('T')[0],
      dependency_id: null,
    },

    // Project 3: FinScale Distributed Microservices
    {
      id: 8,
      project_id: 3,
      title: 'Deploy Zero-Downtime Database Migration on Cloud SQL',
      description: 'Execute blue-green partition migration for ledger_entries table with dual-write phase.',
      phase_name: 'Phase 3: Production Release',
      priority: 'High',
      status: 'Completed',
      estimated_hours: 12,
      due_date: new Date(now.getTime() - 3 * 86400000).toISOString().split('T')[0],
      dependency_id: null,
    },
    {
      id: 9,
      project_id: 3,
      title: 'Finalize SOC-2 Audit Logging Trail Export',
      description: 'Export structured immutable JSON logs to cold storage bucket with cryptographic signatures.',
      phase_name: 'Phase 3: Production Release',
      priority: 'Medium',
      status: 'Completed',
      estimated_hours: 5,
      due_date: new Date(now.getTime() - 2 * 86400000).toISOString().split('T')[0],
      dependency_id: 8,
    },

    // Project 4: SmartPulse Wearable Telemetry
    {
      id: 10,
      project_id: 4,
      title: 'Calibrate PPG Optical Sensor Noise Filtering',
      description: 'Apply Kalman filtering and bandpass filters to suppress motion artifacts during movement.',
      phase_name: 'Phase 1: Data Acquisition',
      priority: 'High',
      status: 'To Do',
      estimated_hours: 8,
      due_date: new Date(now.getTime() + 5 * 86400000).toISOString().split('T')[0],
      dependency_id: null,
    },
    {
      id: 11,
      project_id: 4,
      title: 'Quantize Heart Rate Variability TFLite Model to INT8',
      description: 'Shrink model size below 4MB to fit embedded microcontroller RAM limitations.',
      phase_name: 'Phase 1: Data Acquisition',
      priority: 'Medium',
      status: 'In Progress',
      estimated_hours: 9,
      due_date: new Date(now.getTime() + 9 * 86400000).toISOString().split('T')[0],
      dependency_id: 10,
    },
  ];

  const initialMilestones: Milestone[] = [
    {
      id: 1,
      project_id: 1,
      title: 'Alpha Core Agent Dispatching Prototype',
      target_date: new Date(now.getTime() + 5 * 86400000).toISOString().split('T')[0],
      is_completed: false,
    },
    {
      id: 2,
      project_id: 1,
      title: 'Public Beta & Performance Benchmark Release',
      target_date: new Date(now.getTime() + 18 * 86400000).toISOString().split('T')[0],
      is_completed: false,
    },
    {
      id: 3,
      project_id: 2,
      title: 'Zero Memory Leak Edge Gateway Release',
      target_date: new Date(now.getTime() + 4 * 86400000).toISOString().split('T')[0],
      is_completed: false,
    },
    {
      id: 4,
      project_id: 3,
      title: 'Full SOC-2 Certified Production Cutover',
      target_date: new Date(now.getTime() - 2 * 86400000).toISOString().split('T')[0],
      is_completed: true,
    },
    {
      id: 5,
      project_id: 4,
      title: 'Embedded Firmware Ingestion Proof of Concept',
      target_date: new Date(now.getTime() + 15 * 86400000).toISOString().split('T')[0],
      is_completed: false,
    },
  ];

  const initialCreditLogs: AICreditLog[] = [
    {
      id: 1,
      user_id: 1,
      action_type: 'PLAN_GEN',
      credits_spent: 5,
      timestamp: new Date(now.getTime() - 3600000 * 5).toISOString(),
      details: 'Generated full project roadmap for "TaskForge Autonomous AI Engine"',
    },
  ];

  return {
    users: initialUsers,
    projects: initialProjects,
    tasks: initialTasks,
    milestones: initialMilestones,
    credit_logs: initialCreditLogs,
    nextIds: {
      user: 2,
      project: 5,
      task: 12,
      milestone: 6,
      credit_log: 2,
    },
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read existing taskforge_db.json, re-initializing.', e);
    }
    const initial = getInitialData();
    this.save(initial);
    return initial;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing to taskforge_db.json:', e);
    }
  }

  // Auto reset credits if midnight UTC has passed
  public ensureDailyCreditsReset(userId: number): User {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const now = new Date();
    const lastReset = new Date(user.last_credit_reset || 0);

    // Compare UTC dates
    const isNewUtcDay =
      now.getUTCFullYear() !== lastReset.getUTCFullYear() ||
      now.getUTCMonth() !== lastReset.getUTCMonth() ||
      now.getUTCDate() !== lastReset.getUTCDate();

    if (isNewUtcDay) {
      user.daily_credits = 20;
      user.last_credit_reset = now.toISOString();
      this.save();
    }

    return user;
  }

  public checkAndConsumeCredits(
    userId: number,
    cost: number,
    actionType: 'PLAN_GEN' | 'CHAT' | 'REPORT',
    details?: string
  ): { success: boolean; remainingCredits: number; message?: string; nextResetUtc?: string } {
    const user = this.ensureDailyCreditsReset(userId);

    // Calculate next midnight UTC
    const now = new Date();
    const tomorrowUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
    const nextResetUtc = tomorrowUtc.toISOString();

    if (user.daily_credits < cost) {
      return {
        success: false,
        remainingCredits: user.daily_credits,
        message: `Insufficient AI credits. This operation requires ${cost} credit(s), but you only have ${user.daily_credits} remaining today. Limit resets at midnight UTC.`,
        nextResetUtc,
      };
    }

    user.daily_credits -= cost;

    // Log credit usage
    const logId = this.data.nextIds.credit_log++;
    this.data.credit_logs.unshift({
      id: logId,
      user_id: userId,
      action_type: actionType,
      credits_spent: cost,
      timestamp: new Date().toISOString(),
      details: details || `Consumed ${cost} credits for ${actionType}`,
    });

    this.save();
    return { success: true, remainingCredits: user.daily_credits, nextResetUtc };
  }

  // Refill/Reset credits for test purposes
  public refillCredits(userId: number, amount: number = 20): User {
    const user = this.getUser(userId);
    if (user) {
      user.daily_credits = Math.min(20, user.daily_credits + amount);
      user.last_credit_reset = new Date().toISOString();
      this.save();
      return user;
    }
    throw new Error('User not found');
  }

  public resetDemoData(): void {
    this.data = getInitialData();
    this.save();
  }

  public getUser(userId: number = 1): User | undefined {
    return this.ensureDailyCreditsReset(userId);
  }

  public updateUser(userId: number, updates: Partial<User>): User {
    const user = this.getUser(userId);
    if (!user) throw new Error('User not found');
    Object.assign(user, updates);
    this.save();
    return user;
  }

  public getProjects(userId: number = 1): Project[] {
    return this.data.projects.filter((p) => p.user_id === userId);
  }

  public getProject(projectId: number): Project | undefined {
    return this.data.projects.find((p) => p.id === projectId);
  }

  public createProject(projectData: Omit<Project, 'id' | 'created_at'>): Project {
    const id = this.data.nextIds.project++;
    const newProject: Project = {
      ...projectData,
      id,
      created_at: new Date().toISOString(),
    };
    this.data.projects.unshift(newProject);
    this.save();
    return newProject;
  }

  public updateProject(projectId: number, updates: Partial<Project>): Project {
    const proj = this.getProject(projectId);
    if (!proj) throw new Error('Project not found');
    Object.assign(proj, updates);
    this.save();
    return proj;
  }

  public deleteProject(projectId: number): boolean {
    const initialLen = this.data.projects.length;
    this.data.projects = this.data.projects.filter((p) => p.id !== projectId);
    // Cascade delete tasks and milestones
    this.data.tasks = this.data.tasks.filter((t) => t.project_id !== projectId);
    this.data.milestones = this.data.milestones.filter((m) => m.project_id !== projectId);
    this.save();
    return this.data.projects.length < initialLen;
  }

  public getTasks(projectId?: number): Task[] {
    if (projectId) {
      return this.data.tasks.filter((t) => t.project_id === projectId);
    }
    return this.data.tasks;
  }

  public getTask(taskId: number): Task | undefined {
    return this.data.tasks.find((t) => t.id === taskId);
  }

  public createTask(taskData: Omit<Task, 'id'>): Task {
    const id = this.data.nextIds.task++;
    const newTask: Task = {
      ...taskData,
      id,
    };
    this.data.tasks.push(newTask);
    this.save();
    return newTask;
  }

  public updateTask(taskId: number, updates: Partial<Task>): Task {
    const task = this.getTask(taskId);
    if (!task) throw new Error('Task not found');
    Object.assign(task, updates);
    this.save();
    return task;
  }

  public deleteTask(taskId: number): boolean {
    const initialLen = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter((t) => t.id !== taskId);
    this.save();
    return this.data.tasks.length < initialLen;
  }

  public getMilestones(projectId?: number): Milestone[] {
    if (projectId) {
      return this.data.milestones.filter((m) => m.project_id === projectId);
    }
    return this.data.milestones;
  }

  public createMilestone(milestoneData: Omit<Milestone, 'id'>): Milestone {
    const id = this.data.nextIds.milestone++;
    const newMilestone: Milestone = {
      ...milestoneData,
      id,
    };
    this.data.milestones.push(newMilestone);
    this.save();
    return newMilestone;
  }

  public updateMilestone(milestoneId: number, updates: Partial<Milestone>): Milestone {
    const m = this.data.milestones.find((item) => item.id === milestoneId);
    if (!m) throw new Error('Milestone not found');
    Object.assign(m, updates);
    this.save();
    return m;
  }

  public deleteMilestone(milestoneId: number): boolean {
    const initialLen = this.data.milestones.length;
    this.data.milestones = this.data.milestones.filter((m) => m.id !== milestoneId);
    this.save();
    return this.data.milestones.length < initialLen;
  }

  public getCreditLogs(userId: number = 1): AICreditLog[] {
    return this.data.credit_logs.filter((l) => l.user_id === userId);
  }
}

export const db = new Database();
