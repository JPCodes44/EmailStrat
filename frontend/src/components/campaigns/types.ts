/** Whether a company's outreach artifacts have been generated yet. */
export type DraftStatus = 'drafted' | 'not-drafted';

export interface CampaignCompany {
  id: string;
  name: string;
  industry: string;
  score: number;
  status: DraftStatus;
  selected?: boolean;
}

/** Per-row actions to open the generated email template / résumé. */
export interface ArtifactActions {
  onShowTemplate: (id: string) => void;
  onShowResume: (id: string) => void;
}

export interface CampaignHeaderProps {
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: DraftStatus | 'all';
  onStatusFilterChange: (value: DraftStatus | 'all') => void;
}

export interface CampaignScoreProps {
  score: number;
}

export interface CampaignRowProps extends ArtifactActions {
  company: CampaignCompany;
  active: boolean;
  /** True while this company's templates/resumes are being generated. */
  generating: boolean;
  onSelect: (id: string) => void;
  onToggleSelected: (id: string) => void;
}

export interface CampaignTableProps extends ArtifactActions {
  companies: CampaignCompany[];
  activeId: string;
  /** Ids whose artifacts are currently generating (drives the row loading state). */
  generatingIds: ReadonlySet<string>;
  onSelect: (id: string) => void;
  onToggleSelected: (id: string) => void;
  onToggleAll: () => void;
}

export interface EntityDrawerProps {
  company: CampaignCompany;
  onClose: () => void;
}

export interface CampaignsScreenProps {
  /** Navigate to the Draft Review workspace (from the generation-success modal). */
  onViewDraftReview?: () => void;
}
