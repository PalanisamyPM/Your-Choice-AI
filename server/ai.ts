import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client, will use simulation mode:', err);
  }
}

export function isGeminiConfigured(): boolean {
  return !!aiClient && !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
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

export async function generateProjectPlan(params: {
  idea: string;
  techStack?: string;
  teamSize?: number;
  targetDays?: number;
}): Promise<GeneratedPlan> {
  const { idea, techStack = 'Modern Web / Cloud Stack', teamSize = 3, targetDays = 21 } = params;

  if (isGeminiConfigured() && aiClient) {
    try {
      const prompt = `You are YC - TaskForge AI, an elite technical project manager and startup CTO.
Generate a structured execution plan, technical breakdown, milestone roadmap, and task hierarchy for this project:

Project Idea / Brief: "${idea}"
Preferred Tech Stack: ${techStack}
Team Size: ${teamSize} developer(s)
Target Timeline: ${targetDays} days

Provide a realistic, professional engineering roadmap divided into coherent phases (e.g. Architecture, Core Implementation, Integration & Testing, Deployment & Polish).
Estimate realistic hours for each task. Assign priorities (Low, Medium, High).`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are TaskForge AI, a specialized technical architect. Always return clean, well-formed JSON conforming exactly to the requested schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              projectTitle: { type: Type.STRING },
              projectDescription: { type: Type.STRING },
              recommendedTechStack: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              suggestedDurationDays: { type: Type.INTEGER },
              healthAssessment: {
                type: Type.STRING,
                enum: ['Good', 'At Risk', 'Delayed'],
              },
              executiveSummary: { type: Type.STRING },
              milestones: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    targetDays: { type: Type.INTEGER },
                  },
                  required: ['title', 'targetDays'],
                },
              },
              phases: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phaseName: { type: Type.STRING },
                    description: { type: Type.STRING },
                    tasks: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                          priority: {
                            type: Type.STRING,
                            enum: ['Low', 'Medium', 'High'],
                          },
                          estimatedHours: { type: Type.NUMBER },
                          daysFromStart: { type: Type.INTEGER },
                        },
                        required: ['title', 'description', 'priority', 'estimatedHours', 'daysFromStart'],
                      },
                    },
                  },
                  required: ['phaseName', 'description', 'tasks'],
                },
              },
              keyRisksAndMitigations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    risk: { type: Type.STRING },
                    mitigation: { type: Type.STRING },
                    impactLevel: {
                      type: Type.STRING,
                      enum: ['High', 'Medium', 'Low'],
                    },
                  },
                  required: ['risk', 'mitigation', 'impactLevel'],
                },
              },
            },
            required: [
              'projectTitle',
              'projectDescription',
              'recommendedTechStack',
              'suggestedDurationDays',
              'healthAssessment',
              'executiveSummary',
              'milestones',
              'phases',
              'keyRisksAndMitigations',
            ],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text) as GeneratedPlan;
        parsed.simulated = false;
        return parsed;
      }
    } catch (err) {
      console.error('Gemini API call failed, falling back to realistic simulation mode:', err);
    }
  }

  // Realistic Simulation / Demo Fallback
  return simulatePlan(idea, techStack, teamSize, targetDays);
}

function simulatePlan(idea: string, techStack: string, teamSize: number, targetDays: number): GeneratedPlan {
  const stackItems = techStack.split(',').map((s) => s.trim()).filter(Boolean);
  if (stackItems.length === 0) {
    stackItems.push('TypeScript', 'React', 'Node.js', 'PostgreSQL', 'TailwindCSS');
  }

  const titleWords = idea.split(' ').slice(0, 5).join(' ');
  const projectTitle = titleWords.length > 3 ? `${titleWords.replace(/[^a-zA-Z0-9 ]/g, '')} System` : 'Autonomous Microservice Engine';

  return {
    projectTitle,
    projectDescription: `Production engineering initiative for: "${idea}". Tailored for ${teamSize} developer(s) across a ${targetDays}-day milestone sprint.`,
    recommendedTechStack: stackItems,
    suggestedDurationDays: targetDays,
    healthAssessment: 'Good',
    executiveSummary: `This project has been partitioned into 3 sequential delivery phases with explicit dependency trees, reducing merge collisions across ${teamSize} contributor(s). Key milestones are anchored at 30%, 65%, and 100% velocity marks.`,
    milestones: [
      {
        title: 'Architecture Blueprint & Core Schemas Signed Off',
        targetDays: Math.max(2, Math.floor(targetDays * 0.25)),
      },
      {
        title: 'MVP Endpoints & Functional Interactive UI Demo',
        targetDays: Math.floor(targetDays * 0.65),
      },
      {
        title: 'Production Hardening, E2E Testing & Launch',
        targetDays: targetDays,
      },
    ],
    phases: [
      {
        phaseName: 'Phase 1: Architecture & Data Foundations',
        description: 'Set up repository structure, database schemas, authentication middleware, and CI pipelines.',
        tasks: [
          {
            title: `Design Relational Schemas & Domain Entities for ${projectTitle}`,
            description: 'Define normalization tables, primary keys, and foreign relations with migration scripts.',
            priority: 'High',
            estimatedHours: 6,
            daysFromStart: 2,
          },
          {
            title: `Configure ${stackItems[0] || 'Core'} Service Boilerplate & Dev Container`,
            description: 'Set up ESLint, TypeScript compiler, environment loading, and pre-commit hooks.',
            priority: 'Medium',
            estimatedHours: 4,
            daysFromStart: 3,
          },
        ],
      },
      {
        phaseName: 'Phase 2: Core Business Logic & API Layer',
        description: 'Implement core domain services, business validation rules, and RESTful/GraphQL endpoints.',
        tasks: [
          {
            title: 'Implement Core CRUD Handlers with Idempotency Support',
            description: 'Build transactional endpoint routes with input validation schemas and error boundaries.',
            priority: 'High',
            estimatedHours: 8,
            daysFromStart: 7,
          },
          {
            title: 'Build Interactive Dashboard & Real-Time State Bindings',
            description: 'Implement component library, reactive stores, and optimistic UI updates.',
            priority: 'Medium',
            estimatedHours: 7.5,
            daysFromStart: 10,
          },
        ],
      },
      {
        phaseName: 'Phase 3: Hardening, Security & Launch',
        description: 'Security auditing, quota rate-limiting, comprehensive integration tests, and edge deployment.',
        tasks: [
          {
            title: 'Enforce Role-Based Access Control & Rate-Limiter Safeguards',
            description: 'Ensure token quota enforcement and protect high-frequency API routes.',
            priority: 'High',
            estimatedHours: 5,
            daysFromStart: Math.max(12, targetDays - 4),
          },
          {
            title: 'Run Automated E2E Regression Suite & Final Smoke Tests',
            description: 'Verify all critical user paths pass in CI staging environment prior to production cutover.',
            priority: 'Medium',
            estimatedHours: 4.5,
            daysFromStart: targetDays,
          },
        ],
      },
    ],
    keyRisksAndMitigations: [
      {
        risk: 'Scope creep during core API implementation phase',
        mitigation: 'Freeze non-essential features and prioritize P0 deliverables before accepting secondary requests.',
        impactLevel: 'High',
      },
      {
        risk: 'Third-party API rate limit bottlenecks or connection drops',
        mitigation: 'Implement exponential backoff retry queues and in-memory caching layers.',
        impactLevel: 'Medium',
      },
    ],
    simulated: true,
  };
}

export interface HealthAssessmentResult {
  health: 'Good' | 'At Risk' | 'Delayed';
  score: number; // 0 - 100
  criticalBottlenecks: string[];
  actionItems: string[];
  velocitySummary: string;
  simulated?: boolean;
}

export async function assessProjectHealth(projectData: {
  title: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  deadline: string;
  techStack: string;
}): Promise<HealthAssessmentResult> {
  const { title, totalTasks, completedTasks, pendingTasks, overdueTasks, deadline, techStack } = projectData;

  if (isGeminiConfigured() && aiClient) {
    try {
      const prompt = `You are TaskForge AI Project Health Engine.
Analyze this software project's delivery trajectory and assess its health:

Project: "${title}"
Tech Stack: ${techStack}
Target Deadline: ${deadline}
Total Tasks: ${totalTasks}
Completed: ${completedTasks}
Pending: ${pendingTasks}
Overdue: ${overdueTasks}

Return JSON evaluating:
- health: "Good", "At Risk", or "Delayed"
- score: integer from 0 to 100
- criticalBottlenecks: list of 2-3 specific risks/bottlenecks
- actionItems: list of 3 high-impact immediate recommendations
- velocitySummary: concise 1-2 sentence engineering verdict`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              health: { type: Type.STRING, enum: ['Good', 'At Risk', 'Delayed'] },
              score: { type: Type.INTEGER },
              criticalBottlenecks: { type: Type.ARRAY, items: { type: Type.STRING } },
              actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
              velocitySummary: { type: Type.STRING },
            },
            required: ['health', 'score', 'criticalBottlenecks', 'actionItems', 'velocitySummary'],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text) as HealthAssessmentResult;
        parsed.simulated = false;
        return parsed;
      }
    } catch (err) {
      console.error('Gemini health assessment failed, falling back:', err);
    }
  }

  // Heuristic assessment calculation
  let health: 'Good' | 'At Risk' | 'Delayed' = 'Good';
  let score = 88;

  if (overdueTasks > 1 || (pendingTasks > 4 && totalTasks > 0 && completedTasks / totalTasks < 0.3)) {
    health = 'At Risk';
    score = 64;
  }
  if (overdueTasks >= 3 || (new Date(deadline) < new Date() && pendingTasks > 0)) {
    health = 'Delayed';
    score = 42;
  }

  const criticalBottlenecks = [
    overdueTasks > 0
      ? `${overdueTasks} task(s) currently past due date require immediate triage or reslicing.`
      : 'Sprint velocity shows minor backlog accumulation in phase 2.',
    'Dependency chains on asynchronous service integration should be reviewed.',
  ];

  const actionItems = [
    'Re-assign high-priority blocking items to sprint pair-programming slots.',
    'Conduct a 15-minute standup to unblock tasks stuck in "In Progress".',
    'Review pending milestone deliverables against the upcoming deadline.',
  ];

  return {
    health,
    score,
    criticalBottlenecks,
    actionItems,
    velocitySummary: `Current completion rate is ${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%. Project is rated "${health}" based on active burn rate and scheduled milestones.`,
    simulated: true,
  };
}

export async function askTaskForgeAI(params: {
  userQuery: string;
  context: {
    userName: string;
    totalProjects: number;
    projectsSummary: string;
    overdueCount: number;
    pendingCount: number;
    completedCount: number;
  };
}): Promise<{ response: string; suggestions?: string[]; simulated?: boolean }> {
  const { userQuery, context } = params;

  if (isGeminiConfigured() && aiClient) {
    try {
      const prompt = `You are YC - TaskForge AI, an intelligent, decisive engineering co-pilot and agile coach.
The user is asking you for insights or recommendations.

Context:
User: ${context.userName}
Active Projects: ${context.totalProjects}
Projects Status: ${context.projectsSummary}
Pending Tasks: ${context.pendingCount}
Overdue Tasks: ${context.overdueCount}
Completed Tasks: ${context.completedCount}

User Query: "${userQuery}"

Provide a crisp, actionable, high-velocity answer.
Include 2-3 short follow-up suggestions/pills that the user can click next.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are TaskForge AI. Be direct, authoritative, structured, and helpful. Use markdown bullet points and bold highlights when appropriate.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              response: { type: Type.STRING },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['response', 'suggestions'],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return {
          response: parsed.response,
          suggestions: parsed.suggestions || [],
          simulated: false,
        };
      }
    } catch (err) {
      console.error('Gemini chat failed, falling back to simulated response:', err);
    }
  }

  // Simulated AI response
  const lower = userQuery.toLowerCase();
  let text = '';
  let suggestions = [
    'Which tasks are overdue?',
    'What should I do next?',
    'Summarize my project progress',
  ];

  if (lower.includes('overdue')) {
    if (context.overdueCount > 0) {
      text = `⚠️ **You have ${context.overdueCount} task(s) currently overdue or due today!**\n\n- **Fix Redis PubSub Channel Memory Leak** in *CloudEdge Realtime Sync Gateway* is due immediately.\n\n**Recommendation:** Prioritize this high-impact bug fix first before opening new feature branches today.`;
    } else {
      text = `🎉 **Great news!** You currently have **0 overdue tasks**. All active deliverables are tracking within their scheduled sprint windows.`;
    }
    suggestions = ['What should I do next?', 'Assess project health', 'Plan a new feature sprint'];
  } else if (lower.includes('next') || lower.includes('priority')) {
    text = `🎯 **Next Best Actions for Today:**\n\n1. **Unblock Phase 2**: Complete *Implement Prompt Routing & Token Optimization* in TaskForge Autonomous AI Engine (~6.5 hrs estimated).\n2. **Triage In-Progress Tasks**: You have 3 tasks currently in progress across your active workspaces.\n3. **Milestone Check**: *Alpha Core Agent Prototype* is due in 5 days.`;
    suggestions = ['Which tasks are overdue?', 'Summarize my project progress', 'Generate AI Project Plan'];
  } else if (lower.includes('summarize') || lower.includes('progress') || lower.includes('report')) {
    text = `📊 **Workspace Executive Summary:**\n\n- **Total Projects**: ${context.totalProjects} active projects\n- **Completed Tasks**: ${context.completedCount} tasks shipped\n- **Pending Backlog**: ${context.pendingCount} tasks remaining\n- **Health Status**: FinScale is completed (100%), TaskForge Engine is healthy (65%), CloudEdge is At Risk due to Redis cluster triage.\n\nYour overall sprint completion rate is sitting at **${Math.round((context.completedCount / Math.max(1, context.completedCount + context.pendingCount)) * 100)}%**.`;
    suggestions = ['How can I get CloudEdge back on track?', 'What should I do next?', 'Refill my AI Credits'];
  } else {
    text = `🤖 **TaskForge AI Analysis for ${context.userName}:**\n\nI have evaluated your workspace across ${context.totalProjects} projects and ${context.pendingCount + context.completedCount} tasks.\n\nEverything is indexed with real-time dependency checks. You can ask me to plan sprints, spot blockers, or generate comprehensive task breakdowns anytime!`;
  }

  return {
    response: text,
    suggestions,
    simulated: true,
  };
}
