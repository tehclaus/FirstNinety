import type { Hire, Manager } from "./types";

export const company = {
  name: "Brightfold",
  tagline: "Fictional B2B SaaS scale-up · ~300 people · offices in Tbilisi, Berlin and Lisbon",
};

export const managers: Manager[] = [
  { name: "Daniel Kraus", title: "Engineering Manager, Platform", dept: "Engineering", location: "Berlin", directReports: 14 },
  { name: "Levan Chkheidze", title: "Engineering Manager, Payments", dept: "Engineering", location: "Tbilisi", directReports: 7 },
  { name: "Marta Oliveira", title: "Head of Sales, South & East", dept: "Sales", location: "Lisbon", directReports: 8 },
  { name: "Stefan Richter", title: "Sales Director, DACH", dept: "Sales", location: "Berlin", directReports: 6 },
  { name: "Sofia Mendes", title: "Design Lead", dept: "Design", location: "Lisbon", directReports: 6 },
  { name: "Keti Abashidze", title: "Head of People", dept: "People", location: "Tbilisi", directReports: 5 },
];

const tz = { Tbilisi: "Asia/Tbilisi", Berlin: "Europe/Berlin", Lisbon: "Europe/Lisbon" } as const;

export const hires: Hire[] = [
  // ——— Pre-boarding ———
  {
    id: "rui-almeida", name: "Rui Almeida", pronoun: "he", role: "Software Engineer", template: "engineer", grade: "Mid",
    location: "Lisbon", timezone: tz.Lisbon, workMode: "Hybrid", manager: "Daniel Kraus", buddy: "Hannah Vogel",
    startOffset: 3, checkpoints: [], overdueTaskIds: ["laptop"],
    note: "Laptop shipment is 2 days late — risk of a Day 1 without equipment.",
  },
  {
    id: "mariam-javakhishvili", name: "Mariam Javakhishvili", pronoun: "she", role: "Product Designer", template: "designer", grade: "Senior",
    location: "Tbilisi", timezone: tz.Tbilisi, workMode: "Office", manager: "Sofia Mendes", buddy: "Nino Gelashvili",
    startOffset: 7, checkpoints: [],
  },
  {
    id: "felix-neumann", name: "Felix Neumann", pronoun: "he", role: "Account Executive", template: "sales", grade: "Senior",
    location: "Berlin", timezone: tz.Berlin, workMode: "Hybrid", manager: "Stefan Richter", buddy: "Jonas Weber",
    startOffset: 12, checkpoints: [],
  },
  // ——— Week 1 ———
  {
    id: "giorgi-tsiklauri", name: "Giorgi Tsiklauri", pronoun: "he", role: "Account Executive", template: "sales", grade: "Mid",
    location: "Tbilisi", timezone: tz.Tbilisi, workMode: "Office", manager: "Marta Oliveira", buddy: "Miguel Santos",
    startOffset: -2, checkpoints: [],
  },
  {
    id: "clara-hoffmann", name: "Clara Hoffmann", pronoun: "she", role: "People Partner", template: "people", grade: "Senior",
    location: "Berlin", timezone: tz.Berlin, workMode: "Remote", manager: "Keti Abashidze", buddy: "Tamar Kapanadze",
    startOffset: -4, checkpoints: [],
  },
  // ——— Day 1–30 ———
  {
    id: "elif-yilmaz", name: "Elif Yılmaz", pronoun: "she", role: "Software Engineer", template: "engineer", grade: "Senior",
    location: "Berlin", timezone: tz.Berlin, workMode: "Hybrid", manager: "Daniel Kraus", buddy: "Hannah Vogel",
    startOffset: -20, checkpoints: [], overdueTaskIds: ["goals-agree", "repo-access"],
    note: "30/60/90 goals still not agreed on day 20 — same manager as Lukas Brandt.",
  },
  // ——— Day 31–60 ———
  {
    id: "jonas-weber", name: "Jonas Weber", pronoun: "he", role: "Account Executive", template: "sales", grade: "Mid",
    location: "Berlin", timezone: tz.Berlin, workMode: "Hybrid", manager: "Stefan Richter", buddy: "Anna Keller",
    startOffset: -33, overdueTaskIds: ["territory"],
    checkpoints: [
      {
        day: 30,
        hire: { clarity: 2, support: 4, workload: 4, enps: 6, comment: "Team is great, but I still don't have a territory, so I can't really start prospecting." },
        manager: { goalProgress: 4, ramp: 4, comment: "Jonas passed pitch certification early. Strong on calls." },
        aiSummary: "Enablement is on track (certification passed early), but role clarity is low: the territory assignment was due on day 7 and is still open on day 33. Manager rates ramp 4/5 while the hire's eNPS is 6 — the gap is about structure, not motivation.",
        flag: "watch",
        recommendation: "Ask Stefan to confirm the territory this week; re-check clarity in a 15-min pulse on day 40.",
      },
    ],
  },
  {
    id: "ana-beridze", name: "Ana Beridze", pronoun: "she", role: "Software Engineer", template: "engineer", grade: "Mid",
    location: "Tbilisi", timezone: tz.Tbilisi, workMode: "Office", manager: "Levan Chkheidze", buddy: "Dato Lomidze",
    startOffset: -45, firstContributionDay: 41,
    checkpoints: [
      {
        day: 30,
        hire: { clarity: 5, support: 5, workload: 4, enps: 9, comment: "Pairing sessions with Dato helped a lot. I shipped 4 PRs." },
        manager: { goalProgress: 5, ramp: 4, comment: "Ahead of plan, already picking up small payment bugs." },
        aiSummary: "Clear ramp: all 30-day goals met, 4 PRs shipped, and both hire and manager ratings align at the top of the scale. Buddy pairing is cited as the main accelerator.",
        flag: "on_track",
        recommendation: "Share the Levan × Dato buddy format as a practice for other engineering teams.",
      },
    ],
  },
  // ——— Day 61–90 ———
  {
    id: "lukas-brandt", name: "Lukas Brandt", pronoun: "he", role: "Software Engineer", template: "engineer", grade: "Mid",
    location: "Berlin", timezone: tz.Berlin, workMode: "Remote", manager: "Daniel Kraus", buddy: "Hannah Vogel",
    startOffset: -64, missedGoals: ["60-Contribute"], overdueTaskIds: ["oncall-shadow"],
    checkpoints: [
      {
        day: 30,
        hire: { clarity: 3, support: 2, workload: 3, enps: 6, comment: "Two of my 1:1s were cancelled. I mostly learn from Hannah." },
        manager: { goalProgress: 3, ramp: 3, comment: "Settling in. Busy quarter for the team." },
        aiSummary: "Learning goals are partially met. Manager support is rated 2/5 and two of four scheduled 1:1s were cancelled; the buddy is compensating. Remote setup increases the cost of missed touchpoints.",
        flag: "watch",
        recommendation: "Check Daniel's capacity: 14 direct reports and 2 new hires this quarter.",
      },
      {
        day: 60,
        hire: { clarity: 2, support: 2, workload: 2, enps: 3, comment: "I don't know what 'done' looks like for my feature. Feeling isolated working remotely." },
        manager: { goalProgress: 4, ramp: 4, comment: "Doing fine, feature is progressing." },
        aiSummary: "Largest perception gap in the cohort: the manager rates progress 4/5, the hire rates eNPS 3 and clarity 2/5. The 60-day 'Contribute' goal has no agreed scope and was not delivered. Pattern matches day 30 (low support, cancelled 1:1s) and is getting worse.",
        flag: "at_risk",
        recommendation: "HRBP conversation with Daniel this week: re-scope the feature with a clear definition of done, protect a weekly 1:1, and consider moving one direct report to reduce span of control.",
      },
    ],
  },
  {
    id: "ines-carvalho", name: "Inês Carvalho", pronoun: "she", role: "Product Designer", template: "designer", grade: "Mid",
    location: "Lisbon", timezone: tz.Lisbon, workMode: "Hybrid", manager: "Sofia Mendes", buddy: "Pedro Costa",
    startOffset: -71, firstContributionDay: 48,
    checkpoints: [
      {
        day: 30,
        hire: { clarity: 4, support: 5, workload: 4, enps: 8, comment: "Loved the critique culture. Journey audit done." },
        manager: { goalProgress: 4, ramp: 4, comment: "Great audit — found 3 quick wins." },
        aiSummary: "Journey audit delivered with 3 quick wins identified. Ratings aligned; strong psychological safety in design critique.",
        flag: "on_track",
      },
      {
        day: 60,
        hire: { clarity: 4, support: 5, workload: 3, enps: 8, comment: "Shipped the onboarding tooltip redesign. A bit stretched between two squads." },
        manager: { goalProgress: 5, ramp: 4, comment: "First improvement live on day 48." },
        aiSummary: "60-day goal met early (first shipped improvement on day 48). Workload dipped to 3/5 because Inês is split between two squads — manageable now, but worth watching before the 90-day ownership goal.",
        flag: "on_track",
        recommendation: "Confirm a single primary squad before day 90.",
      },
    ],
  },
  {
    id: "tamar-kapanadze", name: "Tamar Kapanadze", pronoun: "she", role: "People Partner", template: "people", grade: "Senior",
    location: "Tbilisi", timezone: tz.Tbilisi, workMode: "Hybrid", manager: "Keti Abashidze", buddy: "Eka Maisuradze",
    startOffset: -86, firstContributionDay: 35,
    checkpoints: [
      {
        day: 30,
        hire: { clarity: 5, support: 4, workload: 4, enps: 9, comment: "Listening tour done — 11 leaders." },
        manager: { goalProgress: 5, ramp: 5, comment: "Excellent synthesis of people risks." },
        aiSummary: "Listening tour completed with 11 leaders; top-3 people risks already shared with leadership. Fully aligned ratings.",
        flag: "on_track",
      },
      {
        day: 60,
        hire: { clarity: 5, support: 4, workload: 3, enps: 9, comment: "Ran a role-clarity workshop for the Payments team." },
        manager: { goalProgress: 5, ramp: 5, comment: "Leaders already ask for Tamar by name." },
        aiSummary: "Intervention delivered (role-clarity workshop). Workload trending up as demand grows — normal for a senior partner, no risk signal.",
        flag: "on_track",
      },
    ],
  },
  // ——— Completed ———
  {
    id: "nino-gelashvili", name: "Nino Gelashvili", pronoun: "she", role: "Product Designer", template: "designer", grade: "Senior",
    location: "Tbilisi", timezone: tz.Tbilisi, workMode: "Office", manager: "Sofia Mendes", buddy: "Pedro Costa",
    startOffset: -97, firstContributionDay: 57,
    checkpoints: [
      {
        day: 30,
        hire: { clarity: 2, support: 4, workload: 4, enps: 6, comment: "Not sure which squad I belong to. Two PMs give me different priorities." },
        manager: { goalProgress: 3, ramp: 3, comment: "Squad allocation got delayed by the reorg." },
        aiSummary: "Role clarity 2/5 caused by conflicting priorities from two PMs after the reorg. Support is good; the problem is structural.",
        flag: "watch",
        recommendation: "Agree one squad and one PM owner for Nino within a week.",
      },
      {
        day: 60,
        hire: { clarity: 4, support: 5, workload: 4, enps: 8, comment: "Since moving to Checkout squad, everything is clearer." },
        manager: { goalProgress: 4, ramp: 4, comment: "Back on track after squad decision." },
        aiSummary: "Intervention worked: after assignment to one squad, clarity rose from 2 to 4 and eNPS from 6 to 8. First improvement shipped on day 57.",
        flag: "on_track",
      },
      {
        day: 90,
        hire: { clarity: 5, support: 5, workload: 4, enps: 9, comment: "Ran my first usability test solo." },
        manager: { goalProgress: 5, ramp: 5, comment: "Fully owns Checkout design." },
        aiSummary: "Onboarding completed successfully. A good example of an early 'watch' flag resolved by one structural fix.",
        flag: "on_track",
      },
    ],
  },
  {
    id: "miguel-santos", name: "Miguel Santos", pronoun: "he", role: "Account Executive", template: "sales", grade: "Senior",
    location: "Lisbon", timezone: tz.Lisbon, workMode: "Hybrid", manager: "Marta Oliveira", buddy: "Carla Ribeiro",
    startOffset: -112, firstContributionDay: 38,
    checkpoints: [
      {
        day: 30,
        hire: { clarity: 5, support: 4, workload: 4, enps: 8, comment: "Certified on day 18." },
        manager: { goalProgress: 5, ramp: 4, comment: "Very quick on product." },
        aiSummary: "Certification on day 18, well ahead of plan. Ratings aligned.",
        flag: "on_track",
      },
      {
        day: 60,
        hire: { clarity: 5, support: 4, workload: 3, enps: 8, comment: "€190k pipeline built." },
        manager: { goalProgress: 5, ramp: 5, comment: "Beat pipeline target by 27%." },
        aiSummary: "Pipeline target exceeded (€190k vs €150k). Workload rising with deal volume, still healthy.",
        flag: "on_track",
      },
      {
        day: 90,
        hire: { clarity: 5, support: 5, workload: 4, enps: 9, comment: "First deal closed!" },
        manager: { goalProgress: 5, ramp: 5, comment: "First deal closed on day 81." },
        aiSummary: "Onboarding completed: first deal closed on day 81, forecast accuracy within 10%.",
        flag: "on_track",
      },
    ],
  },
  {
    id: "sophie-laurent", name: "Sophie Laurent", pronoun: "she", role: "Software Engineer", template: "engineer", grade: "Senior",
    location: "Berlin", timezone: tz.Berlin, workMode: "Hybrid", manager: "Levan Chkheidze", buddy: "Dato Lomidze",
    startOffset: -131, firstContributionDay: 33,
    checkpoints: [
      {
        day: 30,
        hire: { clarity: 4, support: 5, workload: 4, enps: 9, comment: "Cross-office pairing with Tbilisi works well." },
        manager: { goalProgress: 4, ramp: 4, comment: "Great fit for the Payments team." },
        aiSummary: "Strong start despite a cross-office setup (Berlin hire, Tbilisi manager). Buddy pairing bridges the distance.",
        flag: "on_track",
      },
      {
        day: 60,
        hire: { clarity: 5, support: 5, workload: 4, enps: 9, comment: "Refund flow feature shipped." },
        manager: { goalProgress: 5, ramp: 5, comment: "Delivered ahead of schedule." },
        aiSummary: "Feature delivered ahead of schedule; ratings fully aligned.",
        flag: "on_track",
      },
      {
        day: 90,
        hire: { clarity: 5, support: 5, workload: 4, enps: 10, comment: "Joined on-call, proposed a test-flake fix." },
        manager: { goalProgress: 5, ramp: 5, comment: "Owns refunds service." },
        aiSummary: "Onboarding completed; owns the refunds service and joined on-call on schedule.",
        flag: "on_track",
      },
    ],
  },
];

export const hireById = (id: string) => hires.find((h) => h.id === id);
