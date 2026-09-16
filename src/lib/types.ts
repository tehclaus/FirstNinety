export type Location = "Tbilisi" | "Berlin" | "Lisbon";
export type Dept = "Engineering" | "Sales" | "Design" | "People";
export type Flag = "on_track" | "watch" | "at_risk";
export type Owner = "IT" | "HR" | "Manager" | "Buddy" | "New hire";
export type Channel = "slack" | "calendar" | "gmail" | "notion";
export type Stage = "preboarding" | "week1" | "day30" | "day60" | "day90" | "completed";

export interface Task {
  id: string;
  title: string;
  owner: Owner;
  dueDay: number; // relative to start date (negative = before start)
  overdue?: boolean; // story override: past due and not done
}

export interface Meeting {
  title: string;
  with: string;
  day: number; // day of week 1 (1..5)
  time: string; // local time
  minutes: number;
}

export interface Goal {
  phase: 30 | 60 | 90;
  kind: "Learn" | "Contribute" | "Own";
  text: string;
  missed?: boolean;
}

export interface Checkpoint {
  day: 30 | 60 | 90;
  hire: { clarity: number; support: number; workload: number; enps: number; comment: string };
  manager: { goalProgress: number; ramp: number; comment: string } | null; // null = not submitted
  aiSummary: string;
  flag: Flag;
  recommendation?: string;
}

export interface RoleTemplate {
  key: string;
  role: string;
  dept: Dept;
  tasks: Task[];
  meetings: Meeting[];
  goals: Goal[];
}

export interface Hire {
  id: string;
  name: string;
  pronoun: "she" | "he";
  role: string;
  template: string;
  grade: string;
  location: Location;
  timezone: string;
  workMode: "Office" | "Hybrid" | "Remote";
  manager: string;
  buddy: string;
  startOffset: number; // days from today; negative = already started
  checkpoints: Checkpoint[];
  overdueTaskIds?: string[];
  missedGoals?: string[]; // goal texts keys "30-Contribute"
  firstContributionDay?: number;
  note?: string;
}

export interface Manager {
  name: string;
  title: string;
  dept: Dept;
  location: Location;
  directReports: number;
}
