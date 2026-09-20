import type { ProjectItem } from '../types';

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 'apex-logistics',
    title: 'Apex Global Freight & Tracking Architecture',
    category: 'Corporate',
    shortDescription:
      'A commanding corporate website concept and shipment tracking interface engineered for freight and supply chain businesses.',
    fullDescription:
      'Engineered as an enterprise corporate demonstration showcasing interactive freight quotation calculators, shipment status tracking interfaces, multi-location facility directories, and instant lead routing with sub-second page performance.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Cloud Functions'],
    client: 'Design & Solution Prototype',
    year: '2025',
    liveUrl: 'https://apex-logistics-preview.darex.internal',
    results: [
      'Engineered for sub-0.9s First Contentful Paint with zero layout shift',
      'Interactive shipment cost estimator and instant inquiry routing',
      'Fluid responsiveness tested across mobile phones, tablets, and desktops',
    ],
  },
  {
    id: 'savoria-bistro',
    title: 'Savoria Culinary & Table Reservation System',
    category: 'Web Apps',
    shortDescription:
      'An immersive dining website concept featuring interactive menus, dietary filters, and online reservation workflows.',
    fullDescription:
      'Built to demonstrate high-end hospitality web design. Features interactive seasonal menu previews with allergen filtering, an intuitive multi-step table reservation workflow, and atmospheric visual typography.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    technologies: ['React', 'Motion', 'Tailwind CSS', 'Reservation UI', 'PWA'],
    client: 'Design & Solution Prototype',
    year: '2025',
    liveUrl: 'https://savoria-bistro-preview.darex.internal',
    results: [
      'Interactive real-time party size and time slot reservation selector',
      'Smooth micro-animations and optimized high-resolution food galleries',
      'Instant mobile booking UX with zero friction',
    ],
  },
  {
    id: 'luxeaura-store',
    title: 'LuxeAura Modern E-commerce Storefront',
    category: 'E-commerce',
    shortDescription:
      'A high-performance headless e-commerce store with instant product search, filtered collections, and streamlined checkout.',
    fullDescription:
      'A modern apparel and lifestyle digital store prototype demonstrating instant client-side product filtering, interactive color/size selectors, sliding bag drawers, and multi-step checkout architecture.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Checkout UI', 'REST APIs'],
    client: 'Design & Solution Prototype',
    year: '2024',
    liveUrl: 'https://luxeaura-store-preview.darex.internal',
    results: [
      'Instant client-side catalog filtering with zero perceptible lag',
      'Streamlined multi-step checkout workflow with payment gateway readiness',
      'Optimized image loading with responsive progressive web standards',
    ],
  },
  {
    id: 'kaelen-vance',
    title: 'Kaelen Vance Architectural Monograph',
    category: 'Portfolio',
    shortDescription:
      'A minimalist, editorial architectural portfolio highlighting spatial projects and structural photography.',
    fullDescription:
      'An editorial digital monograph showcasing architectural works. Engineered with full-bleed photographic grids, refined typographic scale, fluid project transitions, and responsive floorplan galleries.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    technologies: ['React', 'Tailwind CSS', 'Vite', 'Full-bleed Grids', 'SVG Overlays'],
    client: 'Design & Solution Prototype',
    year: '2024',
    liveUrl: 'https://kaelen-vance-preview.darex.internal',
    results: [
      'High-contrast typography pairing with generous negative space',
      'Progressive lazy loading for high-resolution project photography',
      'Strict accessibility compliance and clean semantic HTML markup',
    ],
  },
  {
    id: 'horizon-academy',
    title: 'Horizon Academy Educational Portal System',
    category: 'Portals',
    shortDescription:
      'A unified academic portal layout for admissions management, course schedules, and departmental resource directories.',
    fullDescription:
      'Demonstrates a clean, accessible educational portal interface designed for students, faculty, and applicants. Features structured course catalogues, event schedules, admissions inquiry forms, and campus announcements.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Role-based Views', 'State Management'],
    client: 'Design & Solution Prototype',
    year: '2024',
    liveUrl: 'https://horizon-academy-preview.darex.internal',
    results: [
      'Intuitive department navigation and searchable academic directory',
      'Streamlined online inquiry forms with client-side field validation',
      'Accessible WCAG AA contrast standards throughout all interactive elements',
    ],
  },
];
