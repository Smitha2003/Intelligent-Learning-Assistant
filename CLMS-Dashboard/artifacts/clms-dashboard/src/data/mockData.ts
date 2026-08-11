export type Domain =
  | "Computer Science"
  | "Mathematics"
  | "Biology"
  | "Neuroscience"
  | "Physics";

export type Confidence = "High" | "Medium" | "Low";

export interface Concept {
  id: string;
  name: string;
  domain: Domain;
  mastery: number; // 0..1
  confidence: Confidence;
  uncertainty: number; // 0..1
  lastAssessed: string; // ISO date
  prerequisites: string[]; // concept ids
  importance: number; // 0..1, drives node size
  history: number[]; // sparkline mastery over time
}

export const concepts: Concept[] = [
  {
    id: "binary_search",
    name: "Binary Search",
    domain: "Computer Science",
    mastery: 0.72,
    confidence: "High",
    uncertainty: 0.18,
    lastAssessed: "2026-04-18",
    prerequisites: ["sorted_arrays", "recursion"],
    importance: 0.78,
    history: [0.32, 0.41, 0.49, 0.55, 0.63, 0.68, 0.72],
  },
  {
    id: "sorted_arrays",
    name: "Sorted Arrays",
    domain: "Computer Science",
    mastery: 0.34,
    confidence: "Low",
    uncertainty: 0.46,
    lastAssessed: "2026-04-09",
    prerequisites: ["arrays"],
    importance: 0.62,
    history: [0.22, 0.24, 0.28, 0.3, 0.32, 0.33, 0.34],
  },
  {
    id: "arrays",
    name: "Arrays",
    domain: "Computer Science",
    mastery: 0.81,
    confidence: "High",
    uncertainty: 0.12,
    lastAssessed: "2026-04-15",
    prerequisites: [],
    importance: 0.7,
    history: [0.45, 0.55, 0.62, 0.68, 0.74, 0.78, 0.81],
  },
  {
    id: "recursion",
    name: "Recursion",
    domain: "Computer Science",
    mastery: 0.51,
    confidence: "Medium",
    uncertainty: 0.38,
    lastAssessed: "2026-04-11",
    prerequisites: ["functions"],
    importance: 0.74,
    history: [0.2, 0.28, 0.35, 0.4, 0.45, 0.48, 0.51],
  },
  {
    id: "functions",
    name: "Functions",
    domain: "Computer Science",
    mastery: 0.88,
    confidence: "High",
    uncertainty: 0.08,
    lastAssessed: "2026-04-12",
    prerequisites: [],
    importance: 0.66,
    history: [0.6, 0.68, 0.74, 0.79, 0.83, 0.86, 0.88],
  },
  {
    id: "sorting",
    name: "Sorting Algorithms",
    domain: "Computer Science",
    mastery: 0.41,
    confidence: "Medium",
    uncertainty: 0.42,
    lastAssessed: "2026-04-08",
    prerequisites: ["arrays", "recursion"],
    importance: 0.72,
    history: [0.18, 0.22, 0.27, 0.32, 0.36, 0.39, 0.41],
  },
  {
    id: "graph_theory",
    name: "Graph Theory",
    domain: "Mathematics",
    mastery: 0.57,
    confidence: "Medium",
    uncertainty: 0.31,
    lastAssessed: "2026-04-14",
    prerequisites: ["set_theory"],
    importance: 0.8,
    history: [0.25, 0.32, 0.38, 0.44, 0.49, 0.53, 0.57],
  },
  {
    id: "set_theory",
    name: "Set Theory",
    domain: "Mathematics",
    mastery: 0.69,
    confidence: "High",
    uncertainty: 0.2,
    lastAssessed: "2026-04-10",
    prerequisites: [],
    importance: 0.6,
    history: [0.4, 0.46, 0.52, 0.57, 0.62, 0.66, 0.69],
  },
  {
    id: "finite_state_machines",
    name: "Finite State Machines",
    domain: "Computer Science",
    mastery: 0.63,
    confidence: "Medium",
    uncertainty: 0.27,
    lastAssessed: "2026-04-13",
    prerequisites: ["set_theory"],
    importance: 0.68,
    history: [0.3, 0.36, 0.42, 0.48, 0.53, 0.58, 0.63],
  },
  {
    id: "neural_perception",
    name: "Neural Perception",
    domain: "Neuroscience",
    mastery: 0.46,
    confidence: "Low",
    uncertainty: 0.52,
    lastAssessed: "2026-04-05",
    prerequisites: ["neurons"],
    importance: 0.7,
    history: [0.18, 0.24, 0.3, 0.35, 0.39, 0.43, 0.46],
  },
  {
    id: "neurons",
    name: "Neurons & Synapses",
    domain: "Neuroscience",
    mastery: 0.74,
    confidence: "High",
    uncertainty: 0.16,
    lastAssessed: "2026-04-17",
    prerequisites: [],
    importance: 0.65,
    history: [0.45, 0.52, 0.58, 0.63, 0.68, 0.72, 0.74],
  },
  {
    id: "protein_networks",
    name: "Protein Networks",
    domain: "Biology",
    mastery: 0.38,
    confidence: "Low",
    uncertainty: 0.49,
    lastAssessed: "2026-04-06",
    prerequisites: ["proteins"],
    importance: 0.66,
    history: [0.15, 0.2, 0.25, 0.29, 0.33, 0.36, 0.38],
  },
  {
    id: "proteins",
    name: "Proteins",
    domain: "Biology",
    mastery: 0.66,
    confidence: "Medium",
    uncertainty: 0.24,
    lastAssessed: "2026-04-16",
    prerequisites: [],
    importance: 0.58,
    history: [0.38, 0.45, 0.51, 0.56, 0.6, 0.64, 0.66],
  },
  {
    id: "wave_mechanics",
    name: "Wave Mechanics",
    domain: "Physics",
    mastery: 0.29,
    confidence: "Low",
    uncertainty: 0.55,
    lastAssessed: "2026-04-03",
    prerequisites: ["calculus"],
    importance: 0.6,
    history: [0.12, 0.15, 0.18, 0.21, 0.24, 0.27, 0.29],
  },
  {
    id: "calculus",
    name: "Calculus",
    domain: "Mathematics",
    mastery: 0.55,
    confidence: "Medium",
    uncertainty: 0.34,
    lastAssessed: "2026-04-12",
    prerequisites: [],
    importance: 0.72,
    history: [0.28, 0.34, 0.4, 0.45, 0.49, 0.52, 0.55],
  },
];

export interface GapEntry {
  id: string;
  type: "low_mastery" | "prerequisite_violation" | "stale_evidence";
  title: string;
  detail: string;
  conceptIds: string[];
}

export const gaps: GapEntry[] = [
  {
    id: "g1",
    type: "prerequisite_violation",
    title: "Binary Search strong, Sorted Arrays weak",
    detail:
      "Binary Search mastery (72%) significantly exceeds its prerequisite Sorted Arrays (34%). Likely surface familiarity without underlying invariants.",
    conceptIds: ["binary_search", "sorted_arrays"],
  },
  {
    id: "g2",
    type: "prerequisite_violation",
    title: "Sorting strong relative to Recursion",
    detail:
      "Sorting (41%) and Recursion (51%) are tightly coupled, but recent evidence suggests recursion misconceptions are propagating into divide-and-conquer reasoning.",
    conceptIds: ["sorting", "recursion"],
  },
  {
    id: "g3",
    type: "low_mastery",
    title: "Wave Mechanics below threshold",
    detail:
      "Mastery 29% with high uncertainty (0.55). Calculus prerequisite is only mid-range (55%) — instability is structural, not just notational.",
    conceptIds: ["wave_mechanics", "calculus"],
  },
  {
    id: "g4",
    type: "low_mastery",
    title: "Protein Networks under-developed",
    detail:
      "Mastery 38% with low confidence. Despite solid grounding in Proteins (66%), graph-structured reasoning is the missing scaffold.",
    conceptIds: ["protein_networks", "proteins", "graph_theory"],
  },
  {
    id: "g5",
    type: "stale_evidence",
    title: "Neural Perception evidence aging",
    detail:
      "Last assessed 17 days ago. Posterior uncertainty has drifted to 0.52 — re-assessment recommended before decay assumptions dominate.",
    conceptIds: ["neural_perception"],
  },
];

export interface AssessmentRecommendation {
  priority: number;
  conceptId: string;
  conceptName: string;
  reason: string;
  estimatedMinutes: number;
  type: "diagnostic" | "spaced_review" | "prerequisite_probe";
}

export const recommendations: AssessmentRecommendation[] = [
  {
    priority: 1,
    conceptId: "sorted_arrays",
    conceptName: "Sorted Arrays",
    reason: "Prerequisite for Binary Search; current mastery 34% creates a downstream prerequisite violation.",
    estimatedMinutes: 8,
    type: "prerequisite_probe",
  },
  {
    priority: 2,
    conceptId: "recursion",
    conceptName: "Recursion",
    reason: "Uncertainty 0.38 with multiple downstream dependents (Sorting, Binary Search). High information gain expected.",
    estimatedMinutes: 12,
    type: "diagnostic",
  },
  {
    priority: 3,
    conceptId: "wave_mechanics",
    conceptName: "Wave Mechanics",
    reason: "Lowest mastery in Physics (29%) with structural prerequisite weakness in Calculus.",
    estimatedMinutes: 15,
    type: "diagnostic",
  },
  {
    priority: 4,
    conceptId: "neural_perception",
    conceptName: "Neural Perception",
    reason: "Stale evidence (17 days). Spaced review will sharpen the posterior before drift.",
    estimatedMinutes: 6,
    type: "spaced_review",
  },
  {
    priority: 5,
    conceptId: "protein_networks",
    conceptName: "Protein Networks",
    reason: "Cross-domain leverage — strengthening here unlocks Graph Theory transfer to Biology.",
    estimatedMinutes: 10,
    type: "diagnostic",
  },
  {
    priority: 6,
    conceptId: "graph_theory",
    conceptName: "Graph Theory",
    reason: "High centrality node — uncertainty reduction here propagates to 4 dependents.",
    estimatedMinutes: 10,
    type: "diagnostic",
  },
];

export interface AssessmentHistoryEntry {
  id: string;
  date: string;
  conceptName: string;
  score: number;
  delta: number;
  type: string;
}

export const assessmentHistory: AssessmentHistoryEntry[] = [
  { id: "h1", date: "2026-04-18", conceptName: "Binary Search", score: 0.78, delta: +0.06, type: "Diagnostic" },
  { id: "h2", date: "2026-04-17", conceptName: "Neurons & Synapses", score: 0.74, delta: +0.04, type: "Spaced Review" },
  { id: "h3", date: "2026-04-16", conceptName: "Proteins", score: 0.66, delta: +0.05, type: "Diagnostic" },
  { id: "h4", date: "2026-04-15", conceptName: "Arrays", score: 0.81, delta: +0.03, type: "Spaced Review" },
  { id: "h5", date: "2026-04-14", conceptName: "Graph Theory", score: 0.57, delta: +0.04, type: "Diagnostic" },
  { id: "h6", date: "2026-04-13", conceptName: "Finite State Machines", score: 0.63, delta: +0.05, type: "Diagnostic" },
  { id: "h7", date: "2026-04-12", conceptName: "Calculus", score: 0.55, delta: +0.03, type: "Diagnostic" },
];

export interface QuizQuestion {
  id: string;
  type: "mcq" | "short";
  prompt: string;
  options?: string[];
  answer?: number;
}

export const quizBank: Record<string, QuizQuestion[]> = {
  default: [
    {
      id: "q1",
      type: "mcq",
      prompt:
        "Which invariant must hold for binary search to terminate correctly on an array A?",
      options: [
        "A is non-empty",
        "A is sorted in non-decreasing order",
        "A has unique elements",
        "A has length that is a power of two",
      ],
      answer: 1,
    },
    {
      id: "q2",
      type: "mcq",
      prompt: "What is the worst-case time complexity of binary search?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answer: 1,
    },
    {
      id: "q3",
      type: "short",
      prompt:
        "Briefly describe what goes wrong if you run binary search on an unsorted array.",
    },
    {
      id: "q4",
      type: "mcq",
      prompt:
        "If the midpoint comparison shows target < A[mid], which half do you discard?",
      options: ["The lower half", "The upper half", "Neither", "Both"],
      answer: 1,
    },
  ],
};

export interface CrossDomainInsight {
  id: string;
  domainA: string;
  domainB: string;
  title: string;
  body: string;
  bridgeConcepts: string[];
}

export const crossDomainInsights: CrossDomainInsight[] = [
  {
    id: "i1",
    domainA: "Computational Theory",
    domainB: "Neuroscience",
    title: "State machines as perception models",
    body: "Finite state models are used in modeling neural perception systems — discrete attractor states map onto stable percepts, transitions onto bottom-up evidence accumulation.",
    bridgeConcepts: ["finite_state_machines", "neural_perception"],
  },
  {
    id: "i2",
    domainA: "Graph Theory",
    domainB: "Biology",
    title: "Graphs as protein interactomes",
    body: "Graph structures help model protein interaction networks. Centrality measures predict essential proteins; community detection reveals functional modules.",
    bridgeConcepts: ["graph_theory", "protein_networks"],
  },
  {
    id: "i3",
    domainA: "Recursion",
    domainB: "Wave Mechanics",
    title: "Self-similarity across scales",
    body: "Recursive decomposition mirrors the self-similar structure of standing waves on bounded domains — each subproblem is a smaller instance of the same boundary value problem.",
    bridgeConcepts: ["recursion", "wave_mechanics"],
  },
  {
    id: "i4",
    domainA: "Set Theory",
    domainB: "Neuroscience",
    title: "Receptive fields as set partitions",
    body: "Cortical receptive fields partition stimulus space the way equivalence classes partition a set — different neurons respond to different equivalence classes of input.",
    bridgeConcepts: ["set_theory", "neurons"],
  },
  {
    id: "i5",
    domainA: "Calculus",
    domainB: "Biology",
    title: "Differential equations as growth dynamics",
    body: "Continuous-time models of population growth, gene expression, and metabolic flux all reduce to ODE systems — calculus fluency directly unlocks quantitative biology.",
    bridgeConcepts: ["calculus", "proteins"],
  },
  {
    id: "i6",
    domainA: "Sorting",
    domainB: "Mathematics",
    title: "Comparison sorts and decision trees",
    body: "Lower bounds on comparison-based sorting come from information-theoretic arguments about decision tree depth — algorithmic intuition meets combinatorial proof.",
    bridgeConcepts: ["sorting", "set_theory"],
  },
  {
    id: "i7",
    domainA: "Neuroscience",
    domainB: "Computer Science",
    title: "Synaptic weights as parameter learning",
    body: "Hebbian plasticity at synapses anticipates the gradient-style updates of artificial neural networks — biological learning rules and ML optimizers are deeply related.",
    bridgeConcepts: ["neurons", "functions"],
  },
  {
    id: "i8",
    domainA: "Graph Theory",
    domainB: "Computer Science",
    title: "Algorithms on networks",
    body: "Shortest-path, flow, and matching algorithms transfer directly between social networks, routing protocols, and biological pathways — the substrate is just an edge list.",
    bridgeConcepts: ["graph_theory", "arrays"],
  },
];

export interface TrajectoryPoint {
  week: string;
  mastery: number;
}

export const trajectory: TrajectoryPoint[] = [
  { week: "W1", mastery: 0.32 },
  { week: "W2", mastery: 0.36 },
  { week: "W3", mastery: 0.41 },
  { week: "W4", mastery: 0.45 },
  { week: "W5", mastery: 0.49 },
  { week: "W6", mastery: 0.52 },
  { week: "W7", mastery: 0.55 },
  { week: "W8", mastery: 0.58 },
  { week: "W9", mastery: 0.6 },
];

export const learner = {
  name: "Smitha",
  cohort: "Adaptive Cohort 04",
  enrolledOn: "2026-01-12",
};
