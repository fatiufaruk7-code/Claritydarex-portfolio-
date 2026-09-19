import type { ProjectItem } from '../types';

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 'apex-logistics',
    title: 'Apex Global Logistics Platform',
    category: 'Corporate',
    shortDescription:
      'A commanding corporate website and shipment tracking interface for an international freight and supply chain enterprise.',
    fullDescription:
      'Apex Logistics required a complete digital transformation to modernize their global brand, streamline freight quote inquiries, and present international compliance certifications. Darex designed and engineered an ultra-fast web application featuring interactive shipment calculators, multi-location office directories, and automated lead routing.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Cloud Functions'],
    client: 'Apex Global Freight Inc.',
    year: '2025',
    liveUrl: 'https://apex-logistics-preview.darex.internal',
    results: [
      '68% increase in inbound freight quote inquiries within 90 days',
      'Under 0.9s First Contentful Paint globally',
      'Seamless multi-regional localization for US, Europe, and West Africa',
    ],
  },
  {
    id: 'savoria-bistro',
    title: 'Savoria Bistro & Culinary Experience',
    category: 'Web Apps',
    shortDescription:
      'An immersive culinary destination website with interactive menu previews, table reservations, and private event booking.',
    fullDescription:
      'Savoria Bistro needed a digital presence matching the ambiance of their Michelin-recommended dining rooms. Darex built an atmospheric, visually rich web experience featuring interactive seasonal menus, dynamic dietary filtering, real-time table booking integration, and private chef event inquiries.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    technologies: ['React', 'Motion', 'Tailwind CSS', 'Reservation API', 'PWA'],
    client: 'Savoria Hospitality Group',
    year: '2025',
    liveUrl: 'https://savoria-bistro-preview.darex.internal',
    results: [
      '140% boost in online direct table reservations',
      'Zero booking friction across mobile smartphones',
      'Featured on Best Restaurant Web Designs 2025',
    ],
  },
  {
    id: 'luxeaura-store',
    title: 'LuxeAura Modern Lifestyle & Retail',
    category: 'E-commerce',
    shortDescription:
      'A high-conversion headless e-commerce store with instant product search, curated lookbooks, and 1-click checkout.',
    fullDescription:
      'LuxeAura is a contemporary lifestyle and apparel brand seeking to elevate consumer conversion rates. Darex developed a high-performance storefront featuring instant filterable collections, micro-interaction hover galleries, size guides, real-time stock status, and frictionless multi-currency payment checkout.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Stripe Integration', 'REST APIs'],
    client: 'LuxeAura Retail Ltd.',
    year: '2024',
    liveUrl: 'https://luxeaura-store-preview.darex.internal',
    results: [
      '42% increase in mobile checkout conversions',
      'Instant catalog searching with zero client lag',
      'Reduced cart abandonment by 27%',
    ],
  },
  {
    id: 'kaelen-vance',
    title: 'Kaelen Vance Architecture Portfolio',
    category: 'Portfolio',
    shortDescription:
      'A minimalist, editorial architectural monograph and portfolio celebrating residential and civic architectural projects.',
    fullDescription:
      'Acclaimed architect Kaelen Vance commissioned Darex to create an editorial digital portfolio that lets photographs of structural spaces breathe. Designed with custom grid proportions, subtle monochromatic typography, fluid slide transitions, and interactive project floorplan overlays.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    technologies: ['React', 'Tailwind CSS', 'Vite', 'Full-bleed Grids', 'SVG Overlays'],
    client: 'Vance Design Studio',
    year: '2024',
    liveUrl: 'https://kaelen-vance-preview.darex.internal',
    results: [
      'Shortlisted for Web Design Excellence in Architecture 2024',
      '99/100 Google Lighthouse Accessibility score',
      'High-resolution imagery optimization with progressive lazy loading',
    ],
  },
  {
    id: 'horizon-academy',
    title: 'Horizon Academy Academic & Student Portal',
    category: 'Portals',
    shortDescription:
      'A unified educational institution portal providing course schedules, admissions management, and academic resources.',
    fullDescription:
      'Horizon Academy required a modern, accessible web portal serving prospective applicants, current students, and faculty. Darex designed a modular portal including automated online admissions processing, academic calendar synchronization, department directories, and student announcement noticeboards.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Role-based Views', 'Firestore'],
    client: 'Horizon Educational Foundation',
    year: '2024',
    liveUrl: 'https://horizon-academy-preview.darex.internal',
    results: [
      'Over 12,000 monthly active student and faculty sessions',
      'Admissions inquiry processing time reduced by 50%',
      'Strict WCAG 2.1 AA accessibility compliance across all pages',
    ],
  },
];
