import type { ServiceItem } from '../types';

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'web-dev',
    title: 'Website Development',
    description:
      'High-performance custom websites built with modern frameworks, clean modular architectures, and blazing-fast loading speeds.',
    iconName: 'Code2',
    tag: 'Core Engineering',
    features: [
      'Modern TypeScript & React',
      'Lightning-fast Page Speeds',
      'SEO & Accessibility Optimized',
      'Clean Modular Architecture',
    ],
  },
  {
    id: 'web-design',
    title: 'Web Design',
    description:
      'Distinctive visual identities and art directions that communicate brand credibility, elevate brand perception, and captivate modern users.',
    iconName: 'Palette',
    tag: 'Visual Identity',
    features: [
      'Tailored Visual Systems',
      'High-contrast Modern Layouts',
      'Brand Style Guides',
      'Micro-interactions & Animation',
    ],
  },
  {
    id: 'ui-ux',
    title: 'UI/UX Design',
    description:
      'User-centric interface wireframing, rapid interactive prototyping, and seamless interaction design that maximize user conversion and task completion.',
    iconName: 'Layout',
    tag: 'Experience Design',
    features: [
      'User Journey Mapping',
      'High-fidelity Interactive Prototyping',
      'Design System Components',
      'Usability & Heuristic Audits',
    ],
  },
  {
    id: 'business-solutions',
    title: 'Business Website Solutions',
    description:
      'Enterprise-grade web presences tailored for corporate firms, consultancies, and institutions demanding authoritative credibility.',
    iconName: 'Briefcase',
    tag: 'Corporate Solutions',
    features: [
      'Multi-page Corporate Portals',
      'Lead Generation Pipelines',
      'Content Management Integrations',
      'Compliance & Security Standards',
    ],
  },
  {
    id: 'ecommerce',
    title: 'E-commerce Development',
    description:
      'Secure, high-converting digital storefronts with seamless checkout flows, real-time inventory management, and trusted payment integrations.',
    iconName: 'ShoppingBag',
    tag: 'Online Commerce',
    features: [
      'Custom Product Catalogs',
      'Frictionless Checkout Flows',
      'Payment Gateway Integrations',
      'Order & Inventory Workflows',
    ],
  },
  {
    id: 'maintenance',
    title: 'Website Maintenance',
    description:
      'Proactive monitoring, uptime verification, security patching, library updates, and on-demand feature enhancements to keep your platform resilient.',
    iconName: 'Wrench',
    tag: 'Care & Continuity',
    features: [
      'Continuous Uptime Monitoring',
      'Security Patching & Updates',
      'Performance Optimization Audits',
      'Priority Technical Support',
    ],
  },
  {
    id: 'digital-solutions',
    title: 'Digital Solutions',
    description:
      'Custom internal web applications, client dashboards, API integrations, and workflow automation tools that optimize daily operations.',
    iconName: 'Layers',
    tag: 'Custom Platforms',
    features: [
      'Custom Web Portals & Dashboards',
      'REST & GraphQL API Integrations',
      'Cloud Serverless Deployments',
      'Automated Workflow Systems',
    ],
  },
];
