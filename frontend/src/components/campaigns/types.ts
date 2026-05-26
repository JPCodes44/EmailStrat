export interface CampaignCompany {
  id: string;
  name: string;
  industry: string;
  lastContact: string;
  score: number;
  selected?: boolean;
}

export interface CampaignHeaderProps {
  query: string;
  onQueryChange: (value: string) => void;
}

export interface CampaignScoreProps {
  score: number;
}

export interface CampaignRowProps {
  company: CampaignCompany;
  active: boolean;
  onSelect: (id: string) => void;
  onToggleSelected: (id: string) => void;
}

export interface CampaignTableProps {
  companies: CampaignCompany[];
  activeId: string;
  onSelect: (id: string) => void;
  onToggleSelected: (id: string) => void;
  onToggleAll: () => void;
}

export interface EntityDrawerProps {
  company: CampaignCompany;
  onClose: () => void;
}
