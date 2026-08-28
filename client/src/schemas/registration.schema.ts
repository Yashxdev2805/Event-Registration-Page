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
    shortDesc: 'AI Diagnostics, Telemedicine, Affordable MedTech & Wellness',
    fullDesc:
      'Modernizing patient care, diagnostic precision, mental wellness accessibility, and medical devices for clinical and remote healthcare environments.',
    themes: [
      'Affordable point-of-care screening & IoT diagnostic devices',
      'Clinical workflow automation & AI radiology/pathology aid',
      'Mental healthcare therapy & evidence-based wellness apps',
      'Prescription management & localized telemedicine networks',
    ],
    technologies: ['Biomedical Sensors', 'Computer Vision Imaging', 'FHIR / Health Records API', 'Edge Diagnostic Hardware'],
    evaluationFocus: 'Clinical validity, patient privacy (HIPAA/DISHA), hardware reliability, and affordability.',
  },
  {
    id: 'consumer-edtech',
    label: 'Consumer & EdTech',
    shortDesc: 'Skill Development, Creator Economy, D2C & Hyperlocal Commerce',
    fullDesc:
      'Transforming consumer behaviors through engaging digital experiences, personalized skill learning, experiential commerce, and social empowerment platforms.',
    themes: [
      'Adaptive AI tutors & vernacular skill-building platforms',
      'Monetization tools for micro-creators & educators',
      'Sustainable D2C consumer goods & intelligent supply chains',
      'Hyperlocal discovery & peer-to-peer sharing economies',
    ],
    technologies: ['Interactive Web/Mobile Apps', 'Gamification Engines', 'Commerce Stacks', 'Recommendation Algorithms'],
    evaluationFocus: 'User retention dynamics, CAC/LTV ratio, community engagement, and brand differentiation.',
  },
  {
    id: 'open-innovation',
    label: 'Open Innovation',
    shortDesc: 'DeepTech, Robotics, Aerospace & Moonshot Technologies',
    fullDesc:
      'For multidisciplinary and high-frontier startup concepts that defy conventional tracks — including advanced robotics, space tech, quantum applications, and logistics.',
    themes: [
      'Autonomous robotics, drones & warehouse automation',
      'Applied hardware, embedded electronics & smart mobility',
      'Disruptive business models addressing systemic societal gaps',
      'Frontier technologies spanning multiple engineering domains',
    ],
    technologies: ['Embedded Linux / ROS', 'Drone Telemetry', 'Custom PCB / Firmware', 'Hybrid Software-Hardware'],
    evaluationFocus: 'Technical feasibility, patentability/IP moat, market size, and execution speed.',
  },
  {
    id: 'other',
    label: 'Other',
    shortDesc: 'Ideas that don\'t fit neatly into the listed tracks',
    fullDesc:
      'For startup ideas that span unconventional domains or don\'t align with any of the specific verticals above. Describe your unique sector and value proposition clearly in the pitch concept.',
    themes: [
      'Cross-domain or interdisciplinary innovation',
      'Novel business models in emerging markets',
      'Social impact ventures & non-profit tech',
      'Any other creative startup concept',
    ],
    technologies: ['Varies by domain', 'Custom Tech Stack', 'Hybrid Approaches', 'Domain-Specific Tools'],
    evaluationFocus: 'Clarity of problem statement, innovation uniqueness, market viability, and team capability.',
  },
] as const;

// Schema for Team Member
const memberSchema = z.object({
  name: z.string().optional().or(z.literal('')),
  email: z.string().email('Please enter a valid member email').optional().or(z.literal('')),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number').optional().or(z.literal('')),
});

export const registrationSchema = z.object({
  // Team Leader
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

  // Additional Team Members (validated conditionally based on team size)
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

  // Honeypot for spam bots
  website: z.string().max(0, 'Bot detected').optional(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
