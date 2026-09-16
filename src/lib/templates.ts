import type { RoleTemplate, Task, Meeting } from "./types";

const commonTasks: Task[] = [
  { id: "contract", title: "Signed contract & personal data form collected", owner: "HR", dueDay: -10 },
  { id: "laptop", title: "Laptop ordered and shipped / ready at desk", owner: "IT", dueDay: -5 },
  { id: "accounts", title: "Google Workspace, Slack & SSO accounts created", owner: "IT", dueDay: -3 },
  { id: "welcome-email", title: "Welcome email with Day 1 logistics sent", owner: "HR", dueDay: -3 },
  { id: "buddy-intro", title: "Buddy briefed and intro message sent", owner: "Buddy", dueDay: -2 },
  { id: "day1-agenda", title: "Manager shares Day 1 agenda and first-week priorities", owner: "Manager", dueDay: -1 },
  { id: "handbook", title: "Read People Handbook & security policy", owner: "New hire", dueDay: 3 },
  { id: "goals-agree", title: "30/60/90 goals agreed in first 1:1", owner: "Manager", dueDay: 5 },
  { id: "benefits", title: "Benefits & payroll enrollment completed", owner: "HR", dueDay: 10 },
];

const commonMeetings: Meeting[] = [
  { title: "Welcome & Day 1 setup", with: "People team", day: 1, time: "09:30", minutes: 45 },
  { title: "First 1:1 — expectations & 30/60/90", with: "Manager", day: 1, time: "11:00", minutes: 60 },
  { title: "Coffee with your buddy", with: "Buddy", day: 1, time: "14:00", minutes: 30 },
  { title: "Company & culture intro", with: "Head of People", day: 2, time: "10:00", minutes: 45 },
  { title: "Week 1 check-in", with: "Manager", day: 5, time: "16:00", minutes: 30 },
];

export const templates: RoleTemplate[] = [
  {
    key: "engineer",
    role: "Software Engineer",
    dept: "Engineering",
    tasks: [
      ...commonTasks,
      { id: "repo-access", title: "GitHub, CI and staging access granted", owner: "IT", dueDay: -1 },
      { id: "dev-env", title: "Local dev environment running, first PR merged (docs/typo)", owner: "New hire", dueDay: 4 },
      { id: "oncall-shadow", title: "Shadow on-call rotation for one week", owner: "Manager", dueDay: 21 },
    ],
    meetings: [
      ...commonMeetings,
      { title: "Architecture walkthrough", with: "Tech Lead", day: 2, time: "14:00", minutes: 60 },
      { title: "Product roadmap intro", with: "Product Manager", day: 3, time: "11:00", minutes: 45 },
      { title: "Pairing session", with: "Buddy", day: 4, time: "10:00", minutes: 90 },
    ],
    goals: [
      { phase: 30, kind: "Learn", text: "Understand core services, deploy pipeline and team rituals; ship 3 small PRs" },
      { phase: 60, kind: "Contribute", text: "Deliver one scoped feature end-to-end with code review from the team" },
      { phase: 90, kind: "Own", text: "Own a service area, join on-call rotation, propose one tech-debt improvement" },
    ],
  },
  {
    key: "sales",
    role: "Account Executive",
    dept: "Sales",
    tasks: [
      ...commonTasks,
      { id: "crm", title: "CRM seat, sales deck library & call recorder access", owner: "IT", dueDay: -1 },
      { id: "territory", title: "Territory and starter account list assigned", owner: "Manager", dueDay: 7 },
      { id: "pitch-cert", title: "Pitch certification with Sales Enablement", owner: "New hire", dueDay: 20 },
    ],
    meetings: [
      ...commonMeetings,
      { title: "ICP & value proposition", with: "Sales Enablement", day: 2, time: "14:00", minutes: 60 },
      { title: "Shadow discovery calls", with: "Senior AE", day: 3, time: "13:00", minutes: 120 },
      { title: "Marketing & pipeline sync", with: "Demand Gen", day: 4, time: "11:00", minutes: 30 },
    ],
    goals: [
      { phase: 30, kind: "Learn", text: "Pass pitch certification; shadow 10 calls; know ICP and pricing" },
      { phase: 60, kind: "Contribute", text: "Run own discovery calls; build €150k qualified pipeline" },
      { phase: 90, kind: "Own", text: "Close first deal; forecast own territory accurately" },
    ],
  },
  {
    key: "designer",
    role: "Product Designer",
    dept: "Design",
    tasks: [
      ...commonTasks,
      { id: "figma", title: "Figma seat, design system library and research repo access", owner: "IT", dueDay: -1 },
      { id: "user-calls", title: "Join 3 customer research calls", owner: "New hire", dueDay: 14 },
      { id: "critique", title: "Present first work at design critique", owner: "Manager", dueDay: 25 },
    ],
    meetings: [
      ...commonMeetings,
      { title: "Design system tour", with: "Design Lead", day: 2, time: "14:00", minutes: 60 },
      { title: "Squad intro: PM + Tech Lead", with: "Product squad", day: 3, time: "11:00", minutes: 45 },
      { title: "Research repository walkthrough", with: "UX Researcher", day: 4, time: "15:00", minutes: 45 },
    ],
    goals: [
      { phase: 30, kind: "Learn", text: "Audit the core user journey; understand design system and squad goals" },
      { phase: 60, kind: "Contribute", text: "Ship one improvement from research to production" },
      { phase: 90, kind: "Own", text: "Own design for a squad area; run a usability test independently" },
    ],
  },
  {
    key: "people",
    role: "People Partner",
    dept: "People",
    tasks: [
      ...commonTasks,
      { id: "hris", title: "HRIS admin, ATS and survey tool access", owner: "IT", dueDay: -1 },
      { id: "stakeholders", title: "Stakeholder map of client group leaders shared", owner: "Manager", dueDay: 5 },
      { id: "listening", title: "Listening tour: 1:1s with every leader in client group", owner: "New hire", dueDay: 21 },
    ],
    meetings: [
      ...commonMeetings,
      { title: "People analytics & engagement data", with: "People Ops", day: 2, time: "14:00", minutes: 60 },
      { title: "Meet client group leadership", with: "VP of client group", day: 3, time: "11:00", minutes: 45 },
      { title: "Policy & employment law by country", with: "Legal", day: 4, time: "15:00", minutes: 60 },
    ],
    goals: [
      { phase: 30, kind: "Learn", text: "Complete listening tour; summarise top 3 people risks in client group" },
      { phase: 60, kind: "Contribute", text: "Run one team health intervention with a leader (e.g. retro, role clarity)" },
      { phase: 90, kind: "Own", text: "Own talent review prep and a quarterly people plan for the client group" },
    ],
  },
];

export const templateByKey = (key: string) => {
  const t = templates.find((t) => t.key === key);
  if (!t) throw new Error(`Unknown template ${key}`);
  return t;
};
