import type { Company, FilterChipModel, NavItem, SelectOption } from './types';

/** Left-nav destinations (icons are Material Symbols names). */
export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', iconName: 'dashboard' },
  { id: 'companies', label: 'Companies', iconName: 'business' },
  { id: 'campaigns', label: 'Campaigns', iconName: 'campaign' },
  { id: 'jobs', label: 'Generation Jobs', iconName: 'smart_toy' },
  { id: 'drafts', label: 'Draft Review', iconName: 'rate_review' },
  { id: 'schedule', label: 'Schedule', iconName: 'calendar_today' },
  { id: 'audit', label: 'Audit Logs', iconName: 'history_edu' },
  { id: 'settings', label: 'Settings', iconName: 'settings' },
];

export const industryOptions: SelectOption[] = [
  { value: 'all', label: 'All Industries' },
  { value: 'software', label: 'Software Development' },
  { value: 'finance', label: 'Financial Services' },
  { value: 'healthcare', label: 'Healthcare' },
];

export const companySizeOptions: SelectOption[] = [
  { value: 'any', label: 'Any Size' },
  { value: '1-50', label: '1-50 Employees' },
  { value: '51-200', label: '51-200 Employees' },
  { value: '201-1000', label: '201-1000 Employees' },
  { value: '1000+', label: '1000+ Employees' },
];

export const geographyOptions: SelectOption[] = [
  { value: 'global', label: 'Global' },
  { value: 'na', label: 'North America' },
  { value: 'eu', label: 'Europe' },
  { value: 'apac', label: 'Asia Pacific' },
];

export const initialFilterChips: FilterChipModel[] = [
  { id: 'size', label: 'Size: 51-200' },
  { id: 'tech', label: 'Tech: React' },
];

export const discoveryMatches = 1240;

export const companies: Company[] = [
  {
    id: 'acme',
    name: 'Acme Corp',
    domain: 'acme.io',
    initial: 'A',
    industry: 'SaaS / Enterprise',
    location: 'San Francisco, CA',
    size: '150-200',
    techStack: ['React', 'AWS'],
    confidence: 98,
    confidenceTone: 'positive',
  },
  {
    id: 'nexus',
    name: 'Nexus Dynamics',
    domain: 'nexus.dev',
    initial: 'N',
    industry: 'Fintech',
    location: 'New York, NY',
    size: '50-100',
    techStack: ['Vue', 'Stripe'],
    confidence: 92,
    confidenceTone: 'positive',
  },
  {
    id: 'orbit',
    name: 'Orbit Logistics',
    domain: 'orbit.logistics',
    initial: 'O',
    industry: 'Supply Chain',
    location: 'Chicago, IL',
    size: '200-500',
    techStack: ['Angular', 'Azure'],
    confidence: 75,
    confidenceTone: 'neutral',
  },
];

/** Companies selected by default (matches the reference screen). */
export const defaultSelectedIds: string[] = ['acme', 'nexus'];
