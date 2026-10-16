export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  daily_credits: number;
  last_credit_reset: string;
  created_at: string;
}

export interface ProjectItem {
  id: number;
  user_id: number;
  title: string;
  description: string;
  tech_stack: string;
  team_size: number;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
  health: 'Good' | 'At Risk' | 'Delayed';
  start_date: string;
  deadline: string;
  created_at: string;
  totalTasks?: number;
  completedTasks?: number;
  inProgressTasks?: number;
  todoTasks?: number;
  progressPercent?: number;
  milestonesCount?: number;
}

export interface TaskItem {
  id: number;
  project_id: number;
  title: string;
  description: string;
  phase_name: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Completed';
  estimated_hours: number;
  due_date: string;
  dependency_id: number | null;
  projectTitle?: string;
}

export interface MilestoneItem {
  id: number;
  project_id: number;
  title: string;
  target_date: string;
  is_completed: boolean;
}

export interface AICreditLogItem {
  id: number;
  user_id: number;
  action_type: 'PLAN_GEN' | 'CHAT' | 'REPORT';
  credits_spent: number;
  timestamp: string;
  details?: string;
}

export interface GeneratedPlanPhase {
  phaseName: string;
  description: string;
  tasks: {
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High';
    estimatedHours: number;
    daysFromStart: number;
  }[];
}

export interface GeneratedPlan {
  projectTitle: string;
  projectDescription: string;
  recommendedTechStack: string[];
  suggestedDurationDays: number;
  healthAssessment: 'Good' | 'At Risk' | 'Delayed';
  milestones: {
    title: string;
    targetDays: number;
  }[];
  phases: GeneratedPlanPhase[];
  keyRisksAndMitigations: {
    risk: string;
    mitigation: string;
    impactLevel: 'High' | 'Medium' | 'Low';
  }[];
  executiveSummary: string;
  simulated?: boolean;
}

export interface HealthAssessmentResult {
  health: 'Good' | 'At Risk' | 'Delayed';
  score: number;
  criticalBottlenecks: string[];
  actionItems: string[];
  velocitySummary: string;
  simulated?: boolean;
}

export type ViewType = 'dashboard' | 'projects' | 'planner' | 'kanban' | 'reports' | 'settings';
