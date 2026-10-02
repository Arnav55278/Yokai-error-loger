import { SubjectType, ErrorType, QuestionSource, ExamLevel } from "../types/vault";

export interface SyllabusSubject {
  subject: SubjectType;
  units: {
    name: string;
    chapters: {
      name: string;
      subtopics: string[];
    }[];
  }[];
}

export const JEE_SYLLABUS: SyllabusSubject[] = [
  {
    subject: "Physics",
    units: [
      {
        name: "General & Mechanics",
        chapters: [
          {
            name: "Units, Dimensions & Errors",
            subtopics: [
              "Vernier Callipers & Screw Gauge",
              "Dimensional Analysis & Limitations",
              "Propagation of Errors in Measurements",
            ],
          },
          {
            name: "Mathematical Tools & Vectors",
            subtopics: [
              "Calculus in Kinematics (dx/dt, dv/dt)",
              "Dot and Cross Product in 3D",
              "Resolution & Relative Velocity in 2D",
            ],
          },
          {
            name: "Kinematics (1D & 2D)",
            subtopics: [
              "Relative Motion / Rain-Man / River-Swimmer",
              "Projectile Motion on Inclined Plane",
              "Constraint Equations & Movable Pulleys",
              "Non-Uniform Acceleration Integrals",
            ],
          },
          {
            name: "Newton's Laws of Motion & Friction",
            subtopics: [
              "Block on Block Two-Tier Friction",
              "Banking of Roads & Conical Pendulum",
              "Pseudo Forces in Accelerated Frames",
              "Variable Mass Rocket & Moving Chains",
            ],
          },
          {
            name: "Work, Power & Energy",
            subtopics: [
              "Conservative Fields & Potential Curves U(x)",
              "Vertical Circular Motion Limits",
              "Spring Mass Variable Force Work Done",
              "Power Delivered to Accelerating Bodies",
            ],
          },
          {
            name: "Circular Motion",
            subtopics: [
              "Radial & Tangential Acceleration",
              "Centrifugal Force & Inertial Traps",
              "Kinematics of Circular Motion",
            ],
          },
          {
            name: "Centre of Mass & Collisions",
            subtopics: [
              "Variable Mass Moment of Inertia",
              "Oblique 2D Elastic & Inelastic Collisions",
              "Impulse-Momentum in Coupled Systems",
              "Trajectory of COM during Internal Explosions",
            ],
          },
          {
            name: "Rotational Dynamics",
            subtopics: [
              "Instantaneous Axis of Rotation (IAOR)",
              "Pure Rolling with Slipping & Torque",
              "Angular Momentum Conservation about Moving Point",
              "Toppling vs Slipping on Incline",
              "Gyroscopic Precession & Angular Impulse",
            ],
          },
          {
            name: "Gravitation",
            subtopics: [
              "Gravitational Field & Potential of Spheres/Rings",
              "Kepler's Elliptical Orbits & Aerial Velocity",
              "Satellite Binding Energy & Orbital Transfer",
            ],
          },
          {
            name: "Fluid Mechanics & Hydrostatics",
            subtopics: [
              "Accelerated Fluid Vessels & Pressure Gradients",
              "Torricelli's Law & Variable Area Outflow",
              "Archimedes Principle in Multi-Liquid Systems",
            ],
          },
          {
            name: "Surface Tension, Viscosity & Elasticity",
            subtopics: [
              "Young's Modulus & Stress-Strain Curves",
              "Excess Pressure inside Bubbles & Droplets",
              "Capillary Ascent & Angle of Contact",
              "Stokes' Law & Terminal Velocity in Viscous Fluid",
            ],
          },
        ],
      },
      {
        name: "Thermal Physics",
        chapters: [
          {
            name: "Thermal Expansion & Calorimetry",
            subtopics: [
              "Anomalous Expansion & Bimetallic Strips",
              "Latent Heat & Phase Change Equilibrium",
              "Water Equivalent of Calorimeter",
            ],
          },
          {
            name: "Kinetic Theory of Gases (KTG)",
            subtopics: [
              "Degrees of Freedom & Equipartition of Energy",
              "RMS, Mean & Most Probable Speeds",
              "Mean Free Path & Pressure Derivation",
            ],
          },
          {
            name: "Thermodynamics",
            subtopics: [
              "First Law on P-V, T-S & P-T Cycles",
              "Adiabatic Processes with Variable Gamma",
              "Carnot Engine Reversibility & Efficiency",
              "Polytropic Processes Work Done & Molar Heat Capacity",
            ],
          },
          {
            name: "Heat Transfer (Conduction, Convection & Radiation)",
            subtopics: [
              "Fourier Law of Conduction in Series/Parallel Rods",
              "Stefan-Boltzmann Law & Wien's Displacement Law",
              "Newton's Law of Cooling Approximations",
            ],
          },
        ],
      },
      {
        name: "Oscillations & Waves",
        chapters: [
          {
            name: "Simple Harmonic Motion (SHM)",
            subtopics: [
              "Superposition of Orthogonal SHMs (Lissajous)",
              "Compound Pendulum & Torsional Oscillator",
              "Damped & Forced Oscillations Resonance",
              "Spring Combinations & Cut Springs",
            ],
          },
          {
            name: "Waves on a String",
            subtopics: [
              "Transverse Wave Velocity & Power Transmitted",
              "Standing Waves in Fixed and Free Strings",
              "Reflection & Transmission at String Boundaries",
            ],
          },
          {
            name: "Sound Waves & Doppler Effect",
            subtopics: [
              "Speed of Sound (Laplace Correction)",
              "Organ Pipes, End Corrections & Resonance Tube",
              "Beats & Frequency Interference",
              "Doppler Effect with Moving Wind & Reflected Waves",
            ],
          },
        ],
      },
      {
        name: "Electrodynamics",
        chapters: [
          {
            name: "Electrostatics & Coulomb's Law",
            subtopics: [
              "Continuous Charge Distributions (Rings, Discs, Sheets)",
              "Dipole in Non-Uniform Electric Field",
              "Electrostatic Self-Energy of Spheres",
            ],
          },
          {
            name: "Gauss's Law & Electric Potential",
            subtopics: [
              "Gauss Law for Cylinders, Planes & Spheres",
              "Conductors with Cavities & Induced Charges",
              "Earthing of Conductors & Equipotential Surfaces",
            ],
          },
          {
            name: "Capacitance & Dielectrics",
            subtopics: [
              "Dielectric Insertion with Force & Work Done",
              "Infinite Ladder & Symmetric Bridge Capacitors",
              "RC Circuit Transients & Time Constants",
              "Energy Dissipation across Switches",
            ],
          },
          {
            name: "Current Electricity & Circuits",
            subtopics: [
              "Star-Delta & Symmetry Circuit Reduction",
              "Potentiometer & Meter Bridge Sensitivity",
              "Temperature Dependence of Resistance",
              "Non-Ohmic Conduction & Drift Velocity",
            ],
          },
          {
            name: "Magnetic Effects of Current",
            subtopics: [
              "Biot-Savart Law for Complex Wire Geometries",
              "Ampere's Circuital Law & Toroids",
              "Helical Motion in Combined E & B Fields",
              "Magnetic Moment & Force between Current Circuits",
            ],
          },
          {
            name: "Magnetism and Matter",
            subtopics: [
              "Diamagnetism, Paramagnetism & Ferromagnetism",
              "Earth's Magnetic Field & Dip Circle",
              "Hysteresis Loop & Curie Temperature",
            ],
          },
          {
            name: "Electromagnetic Induction (EMI)",
            subtopics: [
              "Motional EMF with Rotating & Translating Conductors",
              "Induced Electric Fields (Non-Conservative E)",
              "Self & Mutual Inductance (Coupled Coils)",
              "LR Circuit Transients & Energy Storage",
            ],
          },
          {
            name: "Alternating Current (AC)",
            subtopics: [
              "LCR Resonance, Quality Factor & Phasors",
              "Power Factor & Choke Coil",
              "LC Oscillations with Damping",
              "Transformers & AC Generator",
            ],
          },
          {
            name: "Electromagnetic Waves (EM Waves)",
            subtopics: [
              "Displacement Current & Maxwell's Equations",
              "Energy Density & Poynting Vector",
              "Radiation Pressure on Absorbing/Reflecting Surfaces",
            ],
          },
        ],
      },
      {
        name: "Optics",
        chapters: [
          {
            name: "Geometrical Optics & Refraction",
            subtopics: [
              "Curved Surface Refraction & Lens Maker's Formula",
              "Silvered Lens & Mirror Combinations",
              "Prism Dispersion without Deviation",
              "Apparent Depth with Immiscible Liquids",
            ],
          },
          {
            name: "Optical Instruments & Dispersion",
            subtopics: [
              "Astronomical Telescope & Compound Microscope",
              "Magnifying Power & Resolving Power",
              "Chromatic & Spherical Aberration",
            ],
          },
          {
            name: "Wave Optics (Interference & Diffraction)",
            subtopics: [
              "Young's Double Slit with Glass Slab Phase Shift",
              "Fresnel Biprism & Lloyd's Mirror Interference",
              "Single Slit Fraunhofer Diffraction Minima",
              "Polarization & Brewster's Law (Malus Law)",
            ],
          },
        ],
      },
      {
        name: "Modern Physics & Electronics",
        chapters: [
          {
            name: "Dual Nature of Radiation & Matter",
            subtopics: [
              "Stopping Potential vs Frequency Slope",
              "Photoelectric Work Function vs Threshold",
              "de Broglie Wavelength of Relativistic Particles",
            ],
          },
          {
            name: "Atomic Physics & Bohr Model",
            subtopics: [
              "Bohr Model with Reduced Mass of Nucleus",
              "Moseley's Law & Characteristic X-Rays",
              "Excitation & De-excitation Spectral Series",
            ],
          },
          {
            name: "Nuclear Physics & Radioactivity",
            subtopics: [
              "Radioactive Decay Chains & Secular Equilibrium",
              "Q-Value of Nuclear Fission & Alpha Decay",
              "Binding Energy per Nucleon & Mass Defect",
            ],
          },
          {
            name: "Semiconductor Electronics & Logic Gates",
            subtopics: [
              "p-n Junction Diode as Rectifier & Zener Regulator",
              "Bipolar Junction Transistor (CE Characteristics)",
              "Logic Gates Combinations & Boolean Algebra",
            ],
          },
          {
            name: "Experimental Physics & Measurement",
            subtopics: [
              "Speed of Sound using Resonance Column",
              "Resistance using Post Office Box & Meter Bridge",
              "Focal Length using Optical Bench",
            ],
          },
        ],
      },
    ],
  },
  {
    subject: "Chemistry",
    units: [
      {
        name: "Physical Chemistry",
        chapters: [
          {
            name: "Mole Concept & Stoichiometry",
            subtopics: [
              "Equivalent Weight in Redox Titrations",
              "Iodometry & Permanganometry",
              "Limiting Reagent in Gas Phase Reactions",
            ],
          },
          {
            name: "Redox Reactions",
            subtopics: [
              "Oxidation Number Determination Traps",
              "Balancing by Ion-Electron Method",
              "Disproportionation & Comproportionation",
            ],
          },
          {
            name: "Atomic Structure & Quantum Mechanics",
            subtopics: [
              "Radial & Angular Probability Density Nodes",
              "Heisenberg Uncertainty & Quantum Numbers",
              "Photoelectric Work Function vs Ionization",
            ],
          },
          {
            name: "Gaseous State & Real Gases",
            subtopics: [
              "van der Waals Constants 'a' and 'b' Significance",
              "Compressibility Factor Z Curves",
              "Critical Constants & Inversion Temperature",
            ],
          },
          {
            name: "Chemical Thermodynamics & Thermochemistry",
            subtopics: [
              "Entropy Change in Reversible & Irreversible Processes",
              "Gibbs Free Energy & Spontaneity Criterion",
              "Kirchhoff's Equation & Hess's Law of Constant Summation",
              "Bond Enthalpies & Resonance Energy Calculation",
            ],
          },
          {
            name: "Chemical Equilibrium",
            subtopics: [
              "Kp, Kc & Kx Relationships with Pressure",
              "Le Chatelier Shift under Inert Gas Injection",
              "Degree of Dissociation & Vapor Density",
            ],
          },
          {
            name: "Ionic Equilibrium",
            subtopics: [
              "Buffer Capacity & Henderson-Hasselbalch Equation",
              "Hydrolysis of Polyprotic Salts",
              "Solubility Product in Common Ion & Complex Formation",
              "Acid-Base Indicators & pH Curves",
            ],
          },
          {
            name: "Solid State & Crystallography",
            subtopics: [
              "Bragg's Diffraction & Miller Indices",
              "Defects: Frenkel, Schottky & Metal Excess",
              "Packing Efficiency in FCC, BCC & HCP",
              "Radius Ratio Rules & Coordination Numbers",
            ],
          },
          {
            name: "Solutions & Colligative Properties",
            subtopics: [
              "van 't Hoff Factor in Association/Dissociation",
              "Raoult's Law Deviations & Azeotropes",
              "Osmotic Pressure & Henry's Law Gas Solubility",
              "Depression in Freezing Point & Elevation in Boiling Point",
            ],
          },
          {
            name: "Electrochemistry",
            subtopics: [
              "Nernst Equation with Concentration Cells",
              "Kohlrausch Law & Molar Conductance at Infinite Dilution",
              "Corrosion, Lead Storage & Fuel Cells",
              "Faraday's Electrolysis with Overpotential",
            ],
          },
          {
            name: "Chemical Kinetics",
            subtopics: [
              "Arrhenius Activation Energy with Catalyst Traps",
              "Parallel, Consecutive & Opposing Reactions",
              "Pseudo First-Order Rate Laws & Half-Life Equations",
              "Collision Theory & Mechanism Determination",
            ],
          },
          {
            name: "Surface Chemistry & Colloids",
            subtopics: [
              "Freundlich & Langmuir Adsorption Isotherms",
              "Hardy-Schulze Rule & Coagulation Value",
              "Micelles & Critical Micelle Concentration (CMC)",
            ],
          },
        ],
      },
      {
        name: "Inorganic Chemistry",
        chapters: [
          {
            name: "Periodic Table & Periodic Properties",
            subtopics: [
              "Lanthanoid Contraction & Radii Anomalies",
              "Electron Affinity & Ionization Energy Exceptions",
              "Electronegativity Scales & Diagonal Relationships",
            ],
          },
          {
            name: "Chemical Bonding & Molecular Structure",
            subtopics: [
              "Molecular Orbital Theory (MOT) Paramagnetism",
              "VSEPR Geometry with Lone Pair Distortions",
              "Back Bonding & Banana / 3c-2e Bonds",
              "Hydrogen Bonding & Fajan's Polarization Rules",
            ],
          },
          {
            name: "Hydrogen & s-Block Elements",
            subtopics: [
              "Hydrogen Peroxide (H2O2) Volume Strength & Structure",
              "Hydrides (Ionic, Covalent, Interstitial)",
              "Flame Test, Carbonates & Nitrates Thermal Stability",
              "Crown Ethers & Complexation of Alkali Metals",
            ],
          },
          {
            name: "p-Block Elements: Group 13 & 14",
            subtopics: [
              "Inert Pair Effect in Group 13/14",
              "Diborane Structure & Boron Halides Lewis Acidity",
              "Silicates, Silicones & Zeolites",
              "Carbon Allotropes (Fullerenes, Graphene)",
            ],
          },
          {
            name: "p-Block Elements: Group 15, 16, 17 & 18",
            subtopics: [
              "Oxoacids of Phosphorus, Sulphur & Halogens",
              "Interhalogen Compounds & Pseudo Halogens",
              "Noble Gas Fluorides & Oxides (XeF2, XeF4, XeF6)",
              "Phosphorus & Sulphur Allotropes",
            ],
          },
          {
            name: "d & f-Block Elements",
            subtopics: [
              "Chromate-Dichromate & Permanganate Redox Titrations",
              "Magnetic Moments (Spin-Only Formula)",
              "Lanthanide & Actinide Oxidation States & Radii",
            ],
          },
          {
            name: "Coordination Compounds",
            subtopics: [
              "Crystal Field Splitting (t2g / eg) & CFSE",
              "Geometrical & Optical Isomerism in Octahedral Complexes",
              "Jahn-Teller Distortion & Spectrochemical Series",
              "Synergic Bonding in Metal Carbonyls",
            ],
          },
          {
            name: "Metallurgy & Principles of Extraction",
            subtopics: [
              "Ellingham Diagram Free Energy Analysis",
              "Froth Flotation & Leaching Processes",
              "Bessemerization, Cupellation & Zone Refining",
            ],
          },
          {
            name: "Qualitative Inorganic Salt Analysis",
            subtopics: [
              "Cation Group Reagents & Precipitate Solubilities",
              "Borax Bead & Flame Test Identification",
              "Anion Tests (Nitrate Brown Ring, Chromyl Chloride)",
            ],
          },
          {
            name: "Environmental Chemistry",
            subtopics: [
              "Tropospheric Pollution & Smog (Photochemical vs Classical)",
              "Stratospheric Ozone Depletion",
              "BOD, COD & Water Quality Standards",
            ],
          },
        ],
      },
      {
        name: "Organic Chemistry",
        chapters: [
          {
            name: "IUPAC Nomenclature",
            subtopics: [
              "Principal Functional Group Priority Order",
              "Bicyclic & Spiro Compounds",
              "IUPAC for Polyfunctional Polyenes",
            ],
          },
          {
            name: "General Organic Chemistry (GOC)",
            subtopics: [
              "Aromaticity (Huckel 4n+2 & Antiaromaticity)",
              "Carbocation & Carbanion Stability Transpositions",
              "Acid-Base Strength (Ortho Effect, SIR & SIP)",
              "Hyperconjugation vs Inductive Effect Tradeoffs",
            ],
          },
          {
            name: "Isomerism & Stereochemistry",
            subtopics: [
              "R/S & E/Z Nomenclature with CIP Rules",
              "Enantiomers, Diastereomers & Meso Compounds",
              "Conformational Analysis of Cyclohexane & Butane",
              "Specific Rotation & Optical Activity Equations",
            ],
          },
          {
            name: "Hydrocarbons (Alkanes, Alkenes & Alkynes)",
            subtopics: [
              "Electrophilic Addition to Dienes (1,2 vs 1,4 Kinetic/Thermodynamic)",
              "Ozonolysis of Alkynes & Cyclic Alkenes",
              "Free Radical Substitution & Birch Reduction",
              "Hydration of Alkynes (Kucherov Reaction)",
            ],
          },
          {
            name: "Aromatic Hydrocarbons (Benzene & Arenes)",
            subtopics: [
              "Electrophilic Aromatic Substitution (SEAr Mechanisms)",
              "Activating vs Deactivating Directing Groups",
              "Friedel-Crafts Alkylation & Acylation Rearrangements",
            ],
          },
          {
            name: "Haloalkanes & Haloarenes",
            subtopics: [
              "SN1, SN2, E1, E2 Regiochemistry & Stereospecificity",
              "Neighbouring Group Participation (NGP)",
              "Nucleophilic Aromatic Substitution (SNAr & Benzyne)",
              "Grignard Reagents Preparation & Reactions",
            ],
          },
          {
            name: "Alcohols, Phenols & Ethers",
            subtopics: [
              "Pinacol-Pinacolone Rearrangement",
              "Reimer-Tiemann & Kolbe-Schmitt Reactions",
              "Cleavage of Asymmetric Ethers with HI",
              "Hydroboration-Oxidation vs Oxymercuration-Demercuration",
            ],
          },
          {
            name: "Aldehydes & Ketones",
            subtopics: [
              "Aldol Stereochemistry & Retro-Aldol",
              "Cannizzaro & Cross-Cannizzaro Mechanism",
              "Wittig & Baeyer-Villiger Oxidation",
              "Beckmann Rearrangement & Haloform Test",
            ],
          },
          {
            name: "Carboxylic Acids & Derivatives",
            subtopics: [
              "Hell-Volhard-Zelinsky (HVZ) Halogenation",
              "Esterification & Saponification Mechanisms",
              "Hoffmann Bromamide & Curtius Degradation",
              "Acid Chloride, Anhydride & Amide Nucleophilic Substitution",
            ],
          },
          {
            name: "Amines & Diazonium Salts",
            subtopics: [
              "Diazotization & Sandmeyer / Gattermann Traps",
              "Carbylamine & Hinsberg Test Separations",
              "Basicity Trends in Aqueous vs Gas Phase",
            ],
          },
          {
            name: "Biomolecules & Polymers",
            subtopics: [
              "Carbohydrate Mutarotation, Haworth Projections & Reducing Sugars",
              "Peptide Linkages, Isoelectric Point (pI) of Amino Acids",
              "Addition vs Condensation Polymers (Nylon, Bakelite, Teflon)",
            ],
          },
          {
            name: "Chemistry in Everyday Life & Practical Organic",
            subtopics: [
              "Antibiotics, Antiseptics & Tranquilizers",
              "Lassaigne's Test for N, S, Halogens",
              "Chromatography (TLC & Column)",
            ],
          },
        ],
      },
    ],
  },
  {
    subject: "Mathematics",
    units: [
      {
        name: "Algebra",
        chapters: [
          {
            name: "Sets, Relations & Functions",
            subtopics: [
              "Functional Equations with Involution",
              "Domain/Range of Floor, Fractional & Signum",
              "Equivalence Relations & Partition of Sets",
              "Composite Functions & Injectivity/Surjectivity",
            ],
          },
          {
            name: "Quadratic Equations & Inequalities",
            subtopics: [
              "Location of Roots with Parameter Inequalities",
              "Common Roots of Polynomials",
              "Transformation of Roots & Descartes' Rule",
              "Wavy Curve Method & Modulus Inequalities",
            ],
          },
          {
            name: "Complex Numbers & Euler Form",
            subtopics: [
              "Euler Form & De Moivre's Theorem",
              "Geometry of Complex Numbers (Circles, Apollonius)",
              "n-th Roots of Unity & Trigonometric Sums",
              "Rotation of Complex Numbers in Argand Plane",
            ],
          },
          {
            name: "Sequences, Progressions & Series",
            subtopics: [
              "Arithmetico-Geometric Progression (AGP)",
              "Telescoping Sums using Partial Fractions",
              "AM-GM-HM & Cauchy-Schwarz Inequality Bounds",
              "Special Series & Method of Differences",
            ],
          },
          {
            name: "Binomial Theorem",
            subtopics: [
              "Calculus & Integration Methods for Binomial Sums",
              "Double Summation & Multinomial Expansions",
              "Greatest Term in Binomial Expansion",
              "Binomial Theorem for Negative/Fractional Indices",
            ],
          },
          {
            name: "Permutations & Combinations (P&C)",
            subtopics: [
              "Derangements & Principle of Inclusion-Exclusion",
              "Multinomial Theorem & Beggar's Method",
              "Circular Permutations with Flips",
              "Grid Paths & Distribution of Objects",
            ],
          },
          {
            name: "Mathematical Induction & Reasoning",
            subtopics: [
              "Tautology & Contradiction Truth Tables",
              "Contrapositive & Converse of Statements",
              "Algebra of Propositions",
            ],
          },
          {
            name: "Matrices & Determinants",
            subtopics: [
              "System of Linear Equations (Cramer's Rule & Rank)",
              "Cayley-Hamilton Theorem & Matrix Powers",
              "Adjoint & Inverse Properties with Determinants",
              "Orthogonal, Involutory & Nilpotent Matrices",
            ],
          },
          {
            name: "Probability & Bayes' Theorem",
            subtopics: [
              "Bayes' Theorem & Total Probability Law",
              "Binomial Distribution with Variance Bounds",
              "Geometric Probability & Dice Problems",
              "Independent vs Mutually Exclusive Events",
            ],
          },
          {
            name: "Statistics",
            subtopics: [
              "Mean, Median & Mode of Grouped Data",
              "Variance & Standard Deviation Properties",
              "Effect of Change of Origin & Scale on Dispersion",
            ],
          },
        ],
      },
      {
        name: "Trigonometry",
        chapters: [
          {
            name: "Trigonometric Ratios & Identities",
            subtopics: [
              "Multiple Angle Expansions & Conditional Identities",
              "Trigonometric Series Summation (Telescoping)",
              "Maximum & Minimum Values of a sin x + b cos x",
            ],
          },
          {
            name: "Trigonometric Equations",
            subtopics: [
              "General Solution of Trigonometric Equations",
              "Simultaneous Trigonometric Equations",
              "Inequalities involving Trigonometric Functions",
            ],
          },
          {
            name: "Inverse Trigonometric Functions (ITF)",
            subtopics: [
              "Domain/Range Restrictions & Principal Branches",
              "Telescoping Series with arctan",
              "Addition / Subtraction Identities with Conditions",
            ],
          },
          {
            name: "Properties & Solutions of Triangles (SOT)",
            subtopics: [
              "Sine, Cosine & Tangent Projection Rules",
              "Incircle, Excircle Radii & Pedal Triangle",
              "Centroid, Orthocentre & Circumcentre Distances",
            ],
          },
        ],
      },
      {
        name: "Coordinate Geometry",
        chapters: [
          {
            name: "Straight Lines & Pair of Lines",
            subtopics: [
              "Family of Lines & Angle Bisectors",
              "Homogenization of Second Degree Curves",
              "Distance between Parallel & Perpendicular Lines",
              "Centroid, Incentre & Orthocentre Coordinates",
            ],
          },
          {
            name: "Circles & System of Circles",
            subtopics: [
              "Common Tangents (Direct & Transverse)",
              "Radical Axis & Orthogonal Circles",
              "Chord of Contact & Director Circle",
              "Family of Circles through Intersections",
            ],
          },
          {
            name: "Parabola",
            subtopics: [
              "Focal Chords & Parametric Equations of Tangents",
              "Normals to Parabola & Three Connormal Points",
              "Reflection Property of Parabola",
            ],
          },
          {
            name: "Ellipse",
            subtopics: [
              "Eccentric Angle & Auxiliary Circle",
              "Director Circle of Ellipse",
              "Equation of Tangents, Normals & Chords",
              "Focal Radii Sum Properties",
            ],
          },
          {
            name: "Hyperbola & Asymptotes",
            subtopics: [
              "Rectangular Hyperbola (xy = c^2)",
              "Asymptotes & Conjugate Hyperbola Properties",
              "Director Circle of Hyperbola",
            ],
          },
        ],
      },
      {
        name: "Differential Calculus",
        chapters: [
          {
            name: "Limits, Continuity & Differentiability",
            subtopics: [
              "L'Hopital Indeterminate Forms & Series Expansion",
              "Differentiability of Piecewise Modulus Functions",
              "Squeeze / Sandwich Theorem with Integrals",
            ],
          },
          {
            name: "Differentiation",
            subtopics: [
              "Derivative of Inverse Functions & Implicit Differentiation",
              "Logarithmic Differentiation & Parametric Derivatives",
              "Higher Order Derivatives & Leibnitz Theorem",
            ],
          },
          {
            name: "Application of Derivatives (AOD)",
            subtopics: [
              "Rolle's & Lagrange's Mean Value Theorem (LMVT)",
              "Monotonicity & Global Extremum Traps",
              "Concavity, Inflection Points & Curvature",
              "Tangent / Normal to Parametric Curves & Rate Measure",
            ],
          },
        ],
      },
      {
        name: "Integral Calculus",
        chapters: [
          {
            name: "Indefinite Integration",
            subtopics: [
              "Integration by Parts & ILATE Rule",
              "Partial Fractions Decomposition",
              "Special Euler Substitutions & Algebraic Integrals",
            ],
          },
          {
            name: "Definite Integration",
            subtopics: [
              "Leibnitz Rule of Differentiation under Integral",
              "King's Property & Periodic Integral Symmetry",
              "Reduction Formulas & Walli's Integration",
              "Limit of a Riemann Sum Transformation",
            ],
          },
          {
            name: "Area Under Curves",
            subtopics: [
              "Enclosed Area between Inverse Functions",
              "Area between Parametric Curves & Modulus Bounds",
              "Symmetry in Enclosed Region Integration",
            ],
          },
          {
            name: "Differential Equations",
            subtopics: [
              "Linear Differential Equations (Integrating Factor IF)",
              "Exact Differential Forms & Homogeneous Substitution",
              "Orthogonal Trajectories & Physical Applications",
            ],
          },
        ],
      },
      {
        name: "Vectors & 3D Geometry",
        chapters: [
          {
            name: "Vector Algebra",
            subtopics: [
              "Scalar & Vector Triple Product (STP / VTP)",
              "Lagrange's Identity & Reciprocal System of Vectors",
              "Coplanarity, Linear Independence & Vector Equations",
            ],
          },
          {
            name: "Three-Dimensional (3D) Geometry",
            subtopics: [
              "Shortest Distance between Skew Lines",
              "Intersection of Line and Plane",
              "Image of Point / Line in a Plane",
              "Family of Planes & Angle between Planes",
            ],
          },
        ],
      },
      {
        name: "Linear Programming",
        chapters: [
          {
            name: "Linear Programming Problems",
            subtopics: [
              "Feasible Region & Corner Point Method",
              "Bounded vs Unbounded Feasible Regions",
              "Optimization of Objective Function",
            ],
          },
        ],
      },
    ],
  },
];

// Flat list of all canonical chapters for rapid autocomplete/search
export const ALL_JEE_CHAPTERS = JEE_SYLLABUS.flatMap((s) =>
  s.units.flatMap((u) =>
    u.chapters.map((c) => ({
      subject: s.subject,
      unit: u.name,
      chapter: c.name,
      subtopics: c.subtopics,
    }))
  )
);

export const ERROR_TYPES: ErrorType[] = [
  "Conceptual Gap",
  "Silly / Calculation",
  "Formula Forgotten",
  "Question Misread",
  "Lengthy / Approach Issue",
  "Unattempted / Tough",
];

export const ERROR_TYPE_COLORS: Record<ErrorType, { text: string; bg: string; border: string }> = {
  "Conceptual Gap": { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/25" },
  "Silly / Calculation": { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25" },
  "Formula Forgotten": { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/25" },
  "Question Misread": { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/25" },
  "Lengthy / Approach Issue": { text: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/25" },
  "Unattempted / Tough": { text: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/25" },
};

export const QUESTION_SOURCES: QuestionSource[] = [
  "Coaching Test",
  "JEE Adv PYQ",
  "JEE Main PYQ",
  "Irodov / SBT / Pathfinder",
  "Cengage / PG",
  "Vikas Gupta / N. Avasthi / Neeraj Kumar",
  "Class Notes",
];

export const EXAM_LEVELS: ExamLevel[] = ["JEE Main", "JEE Advanced", "Olympiad"];

export const SRS_CONFIG = {
  1: {
    name: "Stage 1: Critical",
    days: 3,
    badgeColor: "text-rose-400",
    description: "Review in 3 days",
  },
  2: {
    name: "Stage 2: Learning",
    days: 7,
    badgeColor: "text-amber-400",
    description: "Review in 7 days",
  },
  3: {
    name: "Stage 3: Familiar",
    days: 21,
    badgeColor: "text-sky-400",
    description: "Review in 21 days",
  },
  4: {
    name: "Stage 4: Mastered",
    days: 60,
    badgeColor: "text-emerald-400",
    description: "Review in 60 days",
  },
} as const;

export const POPULAR_TAGS = [
  "#Rotation+Electrostatics",
  "#GraphTrap",
  "#LimitingCase",
  "#NegativeSignTrap",
  "#BoundaryCondition",
  "#ApproximationTrap",
  "#MultiOptionTrap",
  "#ShortCutTrick",
  "#CalculusMethod",
  "#SymmetryMethod",
  "#TimeSink",
  "#MustReviseBeforeExam",
  "#CalculusIntegration",
  "#StereoTrap",
  "#SecondLawTrap",
];
