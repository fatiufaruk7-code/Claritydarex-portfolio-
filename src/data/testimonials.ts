import type { TestimonialItem, CommitmentItem } from '../types';

// We maintain a strict honesty policy: testimonials are only published when verified from actual clients.
export const TESTIMONIALS_DATA: TestimonialItem[] = [];

export const COMMITMENTS_DATA: CommitmentItem[] = [
  {
    id: 'commit-1',
    title: 'Direct Developer Collaboration',
    subtitle: 'Lead Engineer Faruk Fatiu',
    description:
      'You collaborate directly with your lead engineer. No account manager telephone games, delayed responses, or lost specifications between sales and developers.',
    iconName: 'UserCheck',
    guarantee: 'Direct Communication & 24h Response',
  },
  {
    id: 'commit-2',
    title: '100% Code & IP Ownership',
    subtitle: 'Zero Vendor Lock-In',
    description:
      'You own all custom source code, design assets, and database architecture. Complete repository ownership and hosting credentials are unconditionally handed over to you.',
    iconName: 'Key',
    guarantee: 'Full Copyright & Repository Transfer',
  },
  {
    id: 'commit-3',
    title: 'Milestone-Based Approvals',
    subtitle: 'Inspect Before Advancing',
    description:
      'Every project follows transparent, structured milestones. You test and approve live interactive staging builds before subsequent engineering phases proceed.',
    iconName: 'CheckCircle',
    guarantee: 'Predictable Staging Verifications',
  },
  {
    id: 'commit-4',
    title: '30-Day Post-Launch Warranty',
    subtitle: 'Launch Peace of Mind',
    description:
      'Every website and application delivered includes 30 days of complimentary bug resolution, performance monitoring, and configuration support after going live.',
    iconName: 'ShieldCheck',
    guarantee: '30 Days Post-Deployment Support',
  },
];
