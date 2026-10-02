import { QuestionMistake } from "../types/vault";

// Generate sharp, lightweight SVG diagram DataURLs for sample questions
function createSvgDataUrl(title: string, subtitle: string, formula: string, accentColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <rect width="100%" height="100%" fill="#0a0d14"/>
    <defs>
      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      </pattern>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#0a0d14" stop-opacity="0.8"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
    <rect x="24" y="24" width="752" height="402" rx="8" fill="url(#grad)" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
    
    <!-- Header Badge -->
    <rect x="50" y="50" width="160" height="28" rx="4" fill="${accentColor}" fill-opacity="0.2"/>
    <text x="62" y="69" fill="${accentColor}" font-family="JetBrains Mono, monospace" font-size="12" font-weight="600" letter-spacing="1">JEE ADVANCED EXAM</text>
    
    <!-- Question Title -->
    <text x="50" y="115" fill="#f8fafc" font-family="Inter, sans-serif" font-size="20" font-weight="600">${title}</text>
    
    <!-- Subtitle / Problem Statement -->
    <text x="50" y="150" fill="#94a3b8" font-family="Inter, sans-serif" font-size="14">${subtitle}</text>
    
    <!-- Graphic Illustration Box -->
    <rect x="50" y="180" width="700" height="150" rx="6" fill="#040609" stroke="rgba(255,255,255,0.06)"/>
    
    <!-- Schematic Diagram Elements -->
    <line x1="80" y1="280" x2="380" y2="280" stroke="#475569" stroke-width="2"/>
    <circle cx="230" cy="230" r="45" fill="none" stroke="${accentColor}" stroke-width="3" stroke-dasharray="4 2"/>
    <circle cx="230" cy="230" r="4" fill="${accentColor}"/>
    <line x1="230" y1="230" x2="275" y2="230" stroke="#f43f5e" stroke-width="2.5"/>
    <text x="285" y="235" fill="#f43f5e" font-family="JetBrains Mono, monospace" font-size="12 font-weight="bold">R</text>
    <path d="M 230 185 A 45 45 0 0 1 275 230" fill="none" stroke="#38bdf8" stroke-width="2"/>
    <polygon points="275,230 270,220 280,224" fill="#38bdf8"/>
    <text x="250" y="205" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="11">ω, α</text>
    
    <!-- Formula / Key math -->
    <text x="420" y="220" fill="#e2e8f0" font-family="JetBrains Mono, monospace" font-size="14" font-weight="bold">${formula}</text>
    <text x="420" y="250" fill="#64748b" font-family="Inter, sans-serif" font-size="12">Find angular acceleration &amp; normal force at point P</text>
    <text x="420" y="280" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="12">[Single / Multi-Correct Type]</text>
    
    <!-- Footer Note -->
    <text x="50" y="380" fill="#475569" font-family="Inter, sans-serif" font-size="11">ApexVault CBT Question Ingestion • High-Res Vectorized Record</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createSolutionSvgDataUrl(notes: string, keyResult: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <rect width="100%" height="100%" fill="#070a0e"/>
    <defs>
      <pattern id="solgrid" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.05)"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#solgrid)" />
    <rect x="24" y="24" width="752" height="402" rx="8" fill="#0c1119" stroke="rgba(56,189,248,0.2)" stroke-width="1.5"/>
    
    <rect x="50" y="50" width="180" height="28" rx="4" fill="#38bdf8" fill-opacity="0.15"/>
    <text x="62" y="69" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="12" font-weight="600">SOLUTION / WHITEBOARD</text>
    
    <text x="50" y="115" fill="#f8fafc" font-family="Inter, sans-serif" font-size="18" font-weight="600">Canonical Step-by-Step Derivation</text>
    
    <!-- Derivation steps box -->
    <rect x="50" y="140" width="700" height="200" rx="6" fill="#05080c" stroke="rgba(255,255,255,0.06)"/>
    <text x="70" y="175" fill="#94a3b8" font-family="JetBrains Mono, monospace" font-size="13">Step 1: Choose Instantaneous Point of Contact as reference frame.</text>
    <text x="70" y="205" fill="#94a3b8" font-family="JetBrains Mono, monospace" font-size="13">Step 2: τ_ICOR = I_ICOR · α  where  I_ICOR = I_cm + M·R² (Parallel Axis Thm)</text>
    <text x="70" y="235" fill="#f43f5e" font-family="JetBrains Mono, monospace" font-size="13">PAST TRAP: Do NOT take torque about COM while forgetting pseudo-force!</text>
    <text x="70" y="265" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-size="13">Step 3: Integrate F_net = M · a_cm and enforce pure rolling constraint a_cm = α·R</text>
    <text x="70" y="300" fill="#10b981" font-family="JetBrains Mono, monospace" font-size="14" font-weight="bold">KEY RESULT: ${keyResult}</text>
    
    <text x="50" y="380" fill="#64748b" font-family="Inter, sans-serif" font-size="12">${notes}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_QUESTIONS: QuestionMistake[] = [
  {
    id: "VAULT-2026-0001",
    createdAt: "2026-09-12T14:32:00.000Z",
    updatedAt: "2026-09-28T10:15:00.000Z",
    subject: "Physics",
    unit: "Mechanics",
    chapter: "Rotational Dynamics",
    subtopic: "Instantaneous Axis of Rotation (IAOR)",
    level: "JEE Advanced",
    errorType: "Conceptual Gap",
    source: "JEE Adv PYQ",
    tags: ["#Rotation+Electrostatics", "#GraphTrap", "#BoundaryCondition"],
    ocrText: "A uniform solid cylinder of mass M and radius R is placed on a rough horizontal plank of mass m. A horizontal force F is applied to the plank. If the cylinder rolls without slipping on the plank, find the friction force acting between the cylinder and the plank, and determine the maximum value of F for pure rolling.",
    keyConcept: "$$I_{\\text{ICOR}} = I_{\\text{cm}} + MR^2 = \\frac{3}{2}MR^2 \\implies a_{\\text{cm}} = \\frac{2}{3} a_{\\text{plank}}$$",
    studentNote: "Forgot to account for the plank's acceleration in the non-inertial reference frame of the contact point. Evaluated torque about COM without including the pseudo-force torque!",
    correctAnswer: "Option B: f = (1/3) M a_plank",
    questionImage: createSvgDataUrl(
      "Solid Cylinder on Accelerated Plank",
      "Pure rolling on moving surface with non-inertial frame constraints",
      "τ_ICOR = I_ICOR · α  |  f_max ≤ μ N",
      "#38bdf8"
    ),
    solutionImage: createSolutionSvgDataUrl(
      "Always write torque equation about Instantaneous Center of Zero Acceleration to kill fictitious forces.",
      "f = (M · F) / (3m + M)"
    ),
    status: 1,
    attemptCount: 3,
    lastReviewedAt: "2026-09-28T10:15:00.000Z",
    nextReviewDate: "2026-10-01", // Due today!
    bestSolveTimeSeconds: 280,
    lastSolveTimeSeconds: 340,
    starred: true,
  },
  {
    id: "VAULT-2026-0002",
    createdAt: "2026-09-18T09:10:00.000Z",
    updatedAt: "2026-09-29T16:40:00.000Z",
    subject: "Mathematics",
    unit: "Calculus",
    chapter: "Indefinite & Definite Integrals",
    subtopic: "Leibnitz Rule of Differentiation under Integral",
    level: "JEE Advanced",
    errorType: "Silly / Calculation",
    source: "Coaching Test",
    tags: ["#CalculusMethod", "#BoundaryCondition", "#TimeSink"],
    ocrText: "Let f(x) = ∫[x^2 to x^3] (1 / ln(t)) dt for x > 1. Compute lim_{x -> 1+} f'(x) and determine the equation of the tangent at x = e.",
    keyConcept: "$$\\frac{d}{dx}\\int_{u(x)}^{v(x)} f(t,x)dt = f(v(x),x)v'(x) - f(u(x),x)u'(x) + \\int_{u(x)}^{v(x)} \\frac{\\partial f}{\\partial x}dt$$",
    studentNote: "Applied Leibnitz rule but forgot to multiply by the derivative of the lower limit 2x! Ended up with (3x^2 / ln(x^3)) - (1 / ln(x^2)) instead of 2x / ln(x^2). Silly algebraic omission cost -2 marks.",
    correctAnswer: "f'(x) = (x^2 - x) / ln(x); Limit as x->1+ is 1",
    questionImage: createSvgDataUrl(
      "Leibnitz Rule with Variable Limits",
      "f(x) = ∫[x² to x³] (1 / ln t) dt — Limit and Tangent",
      "lim_{x→1+} \\frac{3x^2/ln(x^3) - 2x/ln(x^2)}{1}",
      "#a855f7"
    ),
    solutionImage: createSolutionSvgDataUrl(
      "Differentiate limits explicitly: v'(x)=3x² and u'(x)=2x. Notice 1/ln(x³) = 1/(3 ln x).",
      "f'(x) = \\frac{x^2 - x}{\\ln x}"
    ),
    status: 2,
    attemptCount: 2,
    lastReviewedAt: "2026-09-29T16:40:00.000Z",
    nextReviewDate: "2026-10-06",
    bestSolveTimeSeconds: 195,
    lastSolveTimeSeconds: 210,
  },
  {
    id: "VAULT-2026-0003",
    createdAt: "2026-09-20T11:05:00.000Z",
    updatedAt: "2026-09-27T08:20:00.000Z",
    subject: "Chemistry",
    unit: "Organic Chemistry",
    chapter: "Aldehydes & Ketones",
    subtopic: "Aldol Stereochemistry & Retro-Aldol",
    level: "JEE Advanced",
    errorType: "Question Misread",
    source: "Vikas Gupta / N. Avasthi / Neeraj Kumar",
    tags: ["#MultiOptionTrap", "#MustReviseBeforeExam"],
    ocrText: "An optically active aldehyde (A) of formula C5H10O undergoes crossed-aldol condensation with benzaldehyde in dilute NaOH to form (B) as the major product. (B) upon catalytic hydrogenation absorbs 2 moles of H2. Identify total stereoisomers of (B).",
    keyConcept: "$$\\text{E/Z Geometrical Isomerism at double bond} + 2^n \\text{ chiral centers} \\implies \\text{Total Isomers} = 2 \\times 2 = 4$$",
    studentNote: "Misread the question prompt: It asked for TOTAL stereoisomers of (B), but I only counted the diastereomers and missed the (E/Z) alkene geometric isomers.",
    correctAnswer: "4 stereoisomers (2 pairs of enantiomers)",
    questionImage: createSvgDataUrl(
      "Crossed Aldol with Chiral Aldehyde",
      "Optically active C5H10O + Benzaldehyde → (B)",
      "Ph-CH=C(CH3)-CH(CH3)2 + Stereocenters",
      "#f59e0b"
    ),
    solutionImage: createSolutionSvgDataUrl(
      "Notice C=C has E/Z isomers, plus the original chiral carbon is retained intact without racemization.",
      "Total = (E,R) + (E,S) + (Z,R) + (Z,S) = 4"
    ),
    status: 1,
    attemptCount: 2,
    lastReviewedAt: "2026-09-27T08:20:00.000Z",
    nextReviewDate: "2026-09-30", // Due for review!
    bestSolveTimeSeconds: 240,
    lastSolveTimeSeconds: 310,
    starred: true,
  },
  {
    id: "VAULT-2026-0004",
    createdAt: "2026-09-22T15:50:00.000Z",
    updatedAt: "2026-09-25T14:10:00.000Z",
    subject: "Physics",
    unit: "Electrodynamics",
    chapter: "Electromagnetic Induction & AC",
    subtopic: "LR / LC Circuit Oscillations with Damping",
    level: "JEE Advanced",
    errorType: "Formula Forgotten",
    source: "Irodov / SBT / Pathfinder",
    tags: ["#Rotation+Electrostatics", "#TimeSink", "#ApproximationTrap"],
    ocrText: "A circuit contains an inductor L, capacitor C and a variable resistor R in series with an AC source V = V0 cos(ωt). At resonance frequency ω0 = 1/√(LC), what is the quality factor Q and the energy stored per cycle in terms of the band-width Δω?",
    keyConcept: "$$Q = \\frac{\\omega_0 L}{R} = \\frac{1}{R}\\sqrt{\\frac{L}{C}} = \\frac{\\omega_0}{\\Delta \\omega}$$",
    studentNote: "Mixed up the quality factor formula: wrote R/ωL instead of ωL/R. For high Q, resistance should be MINIMAL to reduce damping!",
    correctAnswer: "Q = (1/R)√(L/C), Δω = R/L",
    questionImage: createSvgDataUrl(
      "Resonant LCR Circuit & Quality Factor",
      "Damped AC oscillations, Half-power bandwidth Δω",
      "Q = \\frac{\\omega_0}{\\Delta \\omega} = \\frac{1}{R}\\sqrt{\\frac{L}{C}}",
      "#10b981"
    ),
    solutionImage: createSolutionSvgDataUrl(
      "Remember: Q-factor is ratio of resonant frequency to full width at half maximum power.",
      "Q = \\frac{\\omega_0 L}{R}"
    ),
    status: 3,
    attemptCount: 3,
    lastReviewedAt: "2026-09-25T14:10:00.000Z",
    nextReviewDate: "2026-10-16",
    bestSolveTimeSeconds: 150,
    lastSolveTimeSeconds: 140,
  },
  {
    id: "VAULT-2026-0005",
    createdAt: "2026-09-24T18:00:00.000Z",
    updatedAt: "2026-09-28T19:20:00.000Z",
    subject: "Mathematics",
    unit: "Algebra",
    chapter: "Matrices & Determinants",
    subtopic: "Cayley-Hamilton Theorem & Matrix Powers",
    level: "JEE Advanced",
    errorType: "Lengthy / Approach Issue",
    source: "JEE Adv PYQ",
    tags: ["#ShortCutTrick", "#TimeSink"],
    ocrText: "Let A = [[1, 2], [3, 4]]. Find A^5 - 5A^4 - 2A^3 + A^2 - 4A - 2I without calculating direct matrix products.",
    keyConcept: "$$\\text{Characteristic equation: } |A - \\lambda I| = 0 \\implies \\lambda^2 - 5\\lambda - 2 = 0 \\implies A^2 - 5A - 2I = 0$$",
    studentNote: "Wasted 9 minutes multiplying 2x2 matrices manually in the exam! Characteristic polynomial factorizes the whole expression in 10 seconds: A^3(A^2 - 5A - 2I) = 0.",
    correctAnswer: "A = [[1, 2], [3, 4]]",
    questionImage: createSvgDataUrl(
      "Cayley-Hamilton Matrix Annihilation",
      "Evaluate large polynomial in matrix A: A⁵ - 5A⁴ - 2A³ + A² - 4A - 2I",
      "A^2 - \\text{tr}(A)A + \\det(A)I = 0",
      "#38bdf8"
    ),
    solutionImage: createSolutionSvgDataUrl(
      "tr(A) = 5, det(A) = 4 - 6 = -2. So A² - 5A - 2I = 0. Divide polynomial by (λ² - 5λ - 2) to get remainder λ.",
      "Result = A"
    ),
    status: 4,
    attemptCount: 4,
    lastReviewedAt: "2026-09-28T19:20:00.000Z",
    nextReviewDate: "2026-11-27",
    bestSolveTimeSeconds: 45,
    lastSolveTimeSeconds: 40,
  },
];
