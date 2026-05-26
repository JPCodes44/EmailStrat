import type { ReactNode } from 'react';

/* ---------------------------------------------------------------- domain */

/** A left-nav destination. */
export interface NavItem {
  id: string;
  label: string;
  /** Material Symbols icon name. */
  iconName: string;
}

/** Confidence-score presentation tone. */
export type ConfidenceTone = 'positive' | 'neutral';

/** A discovered company row. */
export interface Company {
  id: string;
  name: string;
  domain: string;
  /** Single-letter avatar glyph. */
  initial: string;
  industry: string;
  location: string;
  size: string;
  techStack: string[];
  /** Confidence percentage, 0–100. */
  confidence: number;
  confidenceTone: ConfidenceTone;
}

/** An option in a filter `<select>`. */
export interface SelectOption {
  value: string;
  label: string;
}

/** A removable active-filter chip. */
export interface FilterChipModel {
  id: string;
  label: string;
}

/* -------------------------------------------------------------- atoms */

export interface IconProps {
  /** Material Symbols Outlined glyph name. */
  name: string;
  size?: number;
  fill?: boolean;
}

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'md' | 'sm';

export interface ButtonProps {
  variant: ButtonVariant;
  children: ReactNode;
  iconName?: string;
  size?: ButtonSize;
  type?: 'button' | 'submit';
  onClick?: () => void;
}

export interface SplitButtonProps {
  label: string;
  iconName: string;
  onClick?: () => void;
  onToggleMenu?: () => void;
}

export interface TechBadgeProps {
  label: string;
}

export interface ConfidenceBadgeProps {
  value: number;
  tone: ConfidenceTone;
}

export interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export interface CompanyAvatarProps {
  initial: string;
}

/* ------------------------------------------------------------ sidebar */

export interface SidebarBrandProps {
  title: string;
  subtitle: string;
}

export interface SidebarNavItemProps {
  item: NavItem;
  active: boolean;
  onSelect: (id: string) => void;
}

export interface SidebarNavProps {
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

export interface SidebarProps {
  brand: SidebarBrandProps;
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

/* ------------------------------------------------------------- header */

export interface PageHeaderProps {
  title: string;
  subtitle: string;
}

/* ------------------------------------------------------ filter console */

export interface FilterFieldProps {
  label: string;
  children: ReactNode;
}

export interface FilterSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export interface FilterSelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
}

export interface FilterTechInputProps {
  value: string;
  onChange: (value: string) => void;
}

export interface ActiveFiltersProps {
  chips: FilterChipModel[];
  onRemove: (id: string) => void;
}

export interface FilterActionsProps {
  onReset: () => void;
  onSearch: () => void;
}

export interface FilterConsoleProps {
  keywords: string;
  onKeywordsChange: (value: string) => void;
  techStack: string;
  onTechStackChange: (value: string) => void;
  industry: string;
  onIndustryChange: (value: string) => void;
  companySize: string;
  onCompanySizeChange: (value: string) => void;
  geography: string;
  onGeographyChange: (value: string) => void;
  chips: FilterChipModel[];
  onRemoveChip: (id: string) => void;
  onReset: () => void;
  onSearch: () => void;
}

/* -------------------------------------------------------------- results */

export interface ResultsHeaderProps {
  matches: number;
}

export interface CompanyCellProps {
  company: Company;
}

export interface ResultsRowProps {
  company: Company;
  selected: boolean;
  onToggle: (id: string) => void;
}

export interface ResultsTableProps {
  companies: Company[];
  selectedIds: ReadonlySet<string>;
  allSelected: boolean;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
}

export interface ResultsProps {
  companies: Company[];
  matches: number;
  selectedIds: ReadonlySet<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  onExport: () => void;
  onImport: () => void;
}

export interface BulkFooterProps {
  selectedCount: number;
  onExport: () => void;
  onImport: () => void;
}
