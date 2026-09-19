import type { StatItem, WhyDarexItem, ProcessStep } from '../types';

export const COMPANY_INFO = {
  name: 'Darex',
  tagline: 'Building Digital Solutions That Move Businesses Forward.',
  subheadline:
    'Darex delivers enterprise-grade digital solutions designed to help businesses grow, establish commanding online presence, and operate with maximum efficiency.',
  email: 'fatiufaruk7@gmail.com',
  phone: '08137941486',
  phoneFormatted: '+234 813 794 1486',
  location: 'Lagos, Nigeria & Remote Worldwide',
  socialLinks: {
    github: 'https://github.com/darex',
    linkedin: 'https://linkedin.com/company/darex',
    twitter: 'https://twitter.com/darexhq',
    dribbble: 'https://dribbble.com/darex',
  },
};

export const COMPANY_STATS: StatItem[] = [
  {
    value: '120+',
    label: 'Projects Completed',
    sublabel: 'Delivered on time across diverse global industries',
  },
  {
    value: '85+',
    label: 'Happy Clients',
    sublabel: 'High retention and sustained business partnerships',
  },
  {
    value: '7+',
    label: 'Years Experience',
    sublabel: 'Battle-tested software design and engineering',
  },
  {
    value: '12+',
    label: 'Services Offered',
    sublabel: 'Comprehensive end-to-end digital capabilities',
  },
];

export const WHY_CHOOSE_DAREX: WhyDarexItem[] = [
  {
    title: 'Modern Technology',
    description:
      'We leverage cutting-edge frameworks, serverless infrastructure, and modern toolchains to guarantee optimal speed and security.',
    iconName: 'Cpu',
  },
  {
    title: 'Professional Design',
    description:
      'Clean, purposeful typography, balanced visual hierarchy, and deliberate branding make your business stand out from competitors.',
    iconName: 'Palette',
  },
  {
    title: 'Responsive Websites',
    description:
      'Pixel-perfect responsiveness engineered fluidly across mobile phones, tablets, ultra-wide desktops, and high-density screens.',
    iconName: 'Smartphone',
  },
  {
    title: 'Reliable Solutions',
    description:
      'Robust architectures with high uptime, clean type safety, and defensive programming built to handle heavy commercial traffic.',
    iconName: 'ShieldCheck',
  },
  {
    title: 'Fast Communication',
    description:
      'Direct, proactive project updates, transparent roadmaps, and rapid turnaround on every client inquiry and sprint milestone.',
    iconName: 'MessageSquare',
  },
  {
    title: 'Customer-Focused Development',
    description:
      'We prioritize your specific commercial goals and user needs rather than forcing generic cookie-cutter templates.',
    iconName: 'Users',
  },
  {
    title: 'Scalable Solutions',
    description:
      'Systems architected to scale smoothly as your transaction volume, catalog size, and user base expand over time.',
    iconName: 'TrendingUp',
  },
];

export const WORK_PROCESS_STEPS: ProcessStep[] = [
  {
    stepNumber: '01',
    title: 'Discover',
    subtitle: 'Understanding Your Vision',
    description:
      'We dive deep into your commercial objectives, target audience demographics, competitive landscape, and technical requirements to define a razor-sharp project scope.',
    deliverables: ['Stakeholder alignment', 'Technical feasibility study', 'Project scope documentation'],
  },
  {
    stepNumber: '02',
    title: 'Plan',
    subtitle: 'Strategic Architecture',
    description:
      'We chart detailed user journeys, information architectures, system specifications, and clear sprint timelines with transparent milestones.',
    deliverables: ['Wireframes & user flows', 'Tech stack selection', 'Milestone roadmap'],
  },
  {
    stepNumber: '03',
    title: 'Design & Develop',
    subtitle: 'Crafting & Engineering',
    description:
      'Our team crafts bespoke, high-fidelity UI designs and writes modular, production-ready code with responsive layouts, accessible controls, and thorough testing.',
    deliverables: ['Interactive prototypes', 'Clean codebase execution', 'Cross-browser QA testing'],
  },
  {
    stepNumber: '04',
    title: 'Launch & Support',
    subtitle: 'Deployment & Continuity',
    description:
      'We orchestrate zero-downtime production deployment, configure analytics and search engine optimization, and provide ongoing maintenance support.',
    deliverables: ['Production deployment', 'SEO & performance audit', 'Ongoing support & maintenance'],
  },
];
