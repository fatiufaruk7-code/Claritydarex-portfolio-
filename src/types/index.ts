export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectType: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  features: string[];
  tag: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: 'E-commerce' | 'Corporate' | 'Web Apps' | 'Portals' | 'Portfolio';
  shortDescription: string;
  fullDescription: string;
  image: string;
  technologies: string[];
  liveUrl?: string;
  client?: string;
  year: string;
  results: string[];
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
