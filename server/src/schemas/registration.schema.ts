import { z } from 'zod';

export interface TrackDetail {
  id: string;
  label: string;
  shortDesc: string;
  fullDesc: string;
  themes: string[];
  technologies: string[];
  evaluationFocus: string;
}

export const TRACK_OPTIONS: readonly TrackDetail[] = [
  {
    id: 'ai-saas',
    label: 'AI & GenAI / SaaS',
    shortDesc: 'LLMs, Intelligent Agents, Enterprise Automation & Developer Tools',
    fullDesc:
      'Focuses on software products leveraging machine learning, generative models, autonomous agents, and cloud SaaS to solve high-friction enterprise and workflow challenges.',
    themes: [
      'Multi-agent workflow orchestration & RPA',
      'Vertical AI for legal, finance, sales & HR',
      'Developer productivity tools & API infrastructure',
      'Real-time intelligence, edge AI & synthetic data',
    ],
    technologies: ['LLMs / Transformers', 'LangChain / LlamaIndex', 'Cloud Microservices', 'Vector DBs'],
    evaluationFocus: 'Data defensibility, model latency, workflow integration, and recurring revenue potential.',
  },
  {
    id: 'fintech-web3',
    label: 'FinTech & Web3',
    shortDesc: 'Payments, Decentralized Finance, InsurTech & SME Credit',
    fullDesc:
      'Disrupting the financial services ecosystem through frictionless digital transactions, alternative lending models, neo-banking, and transparent decentralized architectures.',
    themes: [
      'Next-gen UPI & cross-border remittance solutions',
      'Alternative credit scoring for unbanked SMEs',
      'Automated underwriting, InsurTech & micro-insurance',
      'Decentralized identity, smart contracts & asset tokenization',
    ],
    technologies: ['Payment Gateways / APIs', 'Account Aggregator framework', 'Smart Contracts', 'Zero-Knowledge Proofs'],
    evaluationFocus: 'Regulatory compliance posture, risk mitigation, transaction security, and unit economics.',
  },
  {
    id: 'cleantech',
    label: 'Climate & Sustainability',
    shortDesc: 'Clean Energy, EV Ecosystem, AgriTech & Waste-to-Value',
    fullDesc:
      'Engineering sustainable technologies that combat climate change, decarbonize supply chains, optimize agricultural yields, and establish circular waste management.',
    themes: [
      'Smart agricultural monitoring & precision farming',
      'EV battery management, swapping & charging grid software',
      'Industrial circular economy & upcycled biomaterials',
      'Carbon accounting, renewable microgrids & water treatment',
    ],
    technologies: ['IoT Sensor Telemetry', 'Battery Chemistry / BMS', 'Solar / Microgrid Hardware', 'GIS Mapping'],
    evaluationFocus: 'Measurable environmental impact, supply chain feasibility, and lifecycle cost parity.',
  },
  {
    id: 'healthtech',
    label: 'HealthTech & Bio',
    shortDesc: 'Digital Therapeutics, Medical Devices, Telehealth & Diagnostic AI',
    fullDesc:
      'Advancing preventative care, clinical workflow efficiency, diagnostic precision, and affordable biomedical hardware for widespread patient accessibility.',
    themes: [
      'Point-of-care rapid screening & diagnostic hardware',
      'AI radiology & clinical decision support systems',
      'Chronic care tracking & remote patient monitoring',
      'Affordable prosthetic, wearable & assistive robotics',
    ],
    technologies: ['Edge Biomedical DSP', 'Computer Vision / DICOM', 'BLE Medical Wearables', 'HIPAA/EHR APIs'],
    evaluationFocus: 'Clinical safety efficacy, regulatory path (CDSCO/FDA), IP defensibility, and unit scalability.',
  },
  {
    id: 'consumer-edtech',
    label: 'Consumer, EdTech & Commerce',
    shortDesc: 'Personalized Learning, D2C Innovation, Creator Tools & Hyperlocal',
    fullDesc:
      'Reinventing how people learn, consume, and connect through adaptive pedagogical platforms, next-gen commerce experiences, and creator monetization infrastructure.',
    themes: [
      'Gamified adaptive skill learning & vernacular tutoring',
      'Sustainable D2C consumer goods & supply chain transparency',
      'Creator economy tooling & social commerce hubs',
      'Hyperlocal commerce delivery & gig-economy optimization',
    ],
    technologies: ['Recommendation Engines', 'Mobile-First Frameworks', 'WebRTC Video Streaming', 'Headless Commerce'],
    evaluationFocus: 'User retention (LTV/CAC ratio), organic viral coefficients, and market monetization dynamics.',
  },
  {
    id: 'open-innovation',
    label: 'DeepTech & Open Innovation',
    shortDesc: 'SpaceTech, DefenceTech, Robotics, Quantum & Novel Hardware',
    fullDesc:
      'Dedicated to moonshot technologies, breakthrough physical sciences, aerospace innovations, autonomous robotics, and cross-disciplinary hard tech solutions.',
    themes: [
      'Autonomous robotics, UAVs & drone delivery systems',
      'SpaceTech, satellite subsystems & geospatial intelligence',
      'Advanced materials, semiconductors & nanotechnology',
      'Cybersecurity, cryptography & quantum information systems',
    ],
    technologies: ['ROS (Robot Operating System)', 'Embedded C/C++ & FPGA', 'Optics & Satellite Sensors', 'Quantum Simulators'],
    evaluationFocus: 'Technological moat, patentability, engineering rigor, and execution defensibility.',
  },
  {
    id: 'other',
    label: 'Other Innovative Ventures',
    shortDesc: 'Disruptive cross-disciplinary, niche, or unclassified startup concepts',
    fullDesc:
      'An open track for founders with innovative venture models that cross traditional boundaries or solve unique regional, operational, or industry challenges not covered above.',
    themes: [
      'Cross-disciplinary hybrid business models',
      'Regional & rural economic transformation',
      'Novel service marketplaces & workflow innovations',
      'Unconventional hardware or platform architectures',
    ],
    technologies: ['Varies by domain', 'Custom Tech Stack', 'Hybrid Approaches', 'Domain-Specific Tools'],
    evaluationFocus: 'Clarity of problem statement, innovation uniqueness, market viability, and team capability.',
  },
] as const;

export const TRACK_MAP: Readonly<Record<string, TrackDetail>> = Object.freeze(
  TRACK_OPTIONS.reduce((acc, track) => {
    acc[track.id] = track;
    return acc;
  }, {} as Record<string, TrackDetail>)
);

const memberSchema = z.object({
  name: z.string().optional().or(z.literal('')),
  email: z.string().email('Please enter a valid member email').optional().or(z.literal('')),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number').optional().or(z.literal('')),
});

export const registrationSchema = z.object({
  name: z
    .string()
    .min(2, 'Leader name must be at least 2 characters')
    .max(80, 'Leader name must be under 80 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),

  email: z
    .string()
    .email('Please enter a valid email address (e.g. founder@college.edu.in)')
    .max(254, 'Email address is too long'),

  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number (starts with 6-9)'),

  teamName: z
    .string()
    .min(2, 'Team name must be at least 2 characters')
    .max(60, 'Team name must be under 60 characters'),

  teamSize: z.enum(['1', '2', '3', '4']),

  members: z.array(memberSchema).optional().default([]),

  track: z
    .string()
    .min(1, 'Please select a startup track/domain'),

  idea: z
    .string()
    .min(20, 'Pitch is too short — please provide at least 20 characters describing the problem & solution')
    .max(500, 'Please keep your pitch summary under 500 characters'),

  pitchDeckUrl: z
    .string()
    .url('Please enter a valid URL (Google Drive / Canva / Notion link)')
    .optional()
    .or(z.literal('')),

  website: z.string().max(0, 'Bot detected').optional(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
