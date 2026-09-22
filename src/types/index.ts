export type StaffRole = 'SUPER_ADMIN' | 'MANAGER' | 'SUPPORT' | 'DEVELOPER' | 'EDITOR';
export type StaffStatus = 'ACTIVE' | 'INACTIVE';

export interface StaffMember {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  role: StaffRole;
  status: StaffStatus;
  createdAt: string;
  updatedAt?: string;
  firebaseUid?: string;
}

export type EnquiryStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface InternalNote {
  id: string;
  authorName: string;
  authorEmail: string;
  authorRole: StaffRole | string;
  text: string;
  createdAt: string;
}

export interface EnquiryActivity {
  id: string;
  action: string;
  user: string;
  role?: string;
  timestamp: string;
  details?: string;
}

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
  read: boolean;
  createdAt: string;
  status?: EnquiryStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  assignedStaffEmail?: string;
  assignedStaffRole?: StaffRole | string;
  internalNotes?: InternalNote[];
  activityHistory?: EnquiryActivity[];
  updatedAt?: string;
  source?: 'firestore' | 'local';
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
  updatedAt?: string;
  updatedBy?: string;
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

export interface CommitmentItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  guarantee: string;
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
