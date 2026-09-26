export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectType: string;
  budget?: string;
  timeline?: string;
  message: string;
  read?: boolean;
  createdAt?: string;
}

export interface SiteSettings {
  general: {
    companyName: string;
    companyDescription: string;
    location: string;
    businessHours: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsappNumber: string;
  };
  socialMedia: {
    instagram: string;
    twitter: string;
    github: string;
    whatsapp: string;
  };
  hero: {
    headline: string;
    description: string;
    primaryButtonText: string;
    primaryButtonUrl: string;
  };
  footer: {
    description: string;
    copyrightText: string;
  };
  seo: {
    title: string;
    description: string;
    ogImageUrl: string;
  };
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  features: string[];
  tag: string;
  pricing?: string;
  order?: number;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: 'E-commerce' | 'Corporate' | 'Web Apps' | 'Portals' | 'Portfolio' | string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  technologies: string[];
  liveUrl?: string;
  client?: string;
  year: string;
  results: string[];
  order?: number;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  clientRole: string;
  company: string;
  avatarText: string;
  quote: string;
  rating: number;
  projectDelivered: string;
  published?: boolean;
  order?: number;
}

export interface CommitmentItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  guarantee: string;
  order?: number;
}

export interface ProcessStep {
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
  deliverables: string[];
}

export interface StatItem {
  value: string;
  label: string;
  sublabel: string;
}

export interface WhyDarexItem {
  title: string;
  description: string;
  iconName: string;
}
