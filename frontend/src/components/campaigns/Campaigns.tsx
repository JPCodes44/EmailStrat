import { useMemo, useState } from 'react';
import { useAction } from 'convex/react';
import { makeFunctionReference } from 'convex/server';
import { Icon } from '../outreach/Common';
import { useOutreachContext } from '../outreach/OutreachContext';
import type {
  CampaignCompany,
  CampaignHeaderProps,
  CampaignRowProps,
  CampaignScoreProps,
  CampaignTableProps,
  EntityDrawerProps,
} from './types';

const generateArtifactsAction = makeFunctionReference<
  'action',
  {
    companies: {
      id: string;
      name: string;
      industry: string;
      techStack: string[];
    }[];
  },
  void
>('artifacts:generateForCompanies');

export function GenerateButton({
  onClick,
  isLoading = false,
  disabled = false,
}: {
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      className="generateButton"
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      <Icon name={isLoading ? 'sync' : 'magic_button'} size={16} />
      {isLoading ? 'Generating...' : 'Generate templates & Resumes'}
    </button>
  );
}

export function CampaignHeader({
  query,
  onQueryChange,
  onGenerate,
  isGenerating,
  selectedCount,
}: CampaignHeaderProps & {
  onGenerate: () => void;
  isGenerating: boolean;
  selectedCount: number;
}) {
  return (
    <section className="campaignHeader">
      <div className="campaignHeaderText">
        <h1 className="campaignTitle">Target Companies</h1>
        <div className="campaignHeaderRowCompact">
          <p className="campaignSubtitle">
            Select companies to generate outreach templates.
          </p>
          <div className="campaignHeaderActions">
            <label className="campaignSearch">
              <span className="campaignSearchIcon">
                <Icon name="search" size={18} />
              </span>
              <input
                className="campaignSearchInput"
                placeholder="Search companies..."
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
              />
            </label>
            <button className="campaignFilterButton" type="button">
              <Icon name="filter_list" size={16} />
              Filter
            </button>
            <GenerateButton
              onClick={onGenerate}
              isLoading={isGenerating}
              disabled={selectedCount === 0}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CampaignScore({ score }: CampaignScoreProps) {
  return (
    <div className="campaignScore">
      <span className="campaignScoreTrack">
        <span className={`campaignScoreFill campaignScoreFill-${score}`} />
      </span>
      <span className={score >= 80 ? 'campaignScoreGood' : 'campaignScoreLow'}>
        {score}
      </span>
    </div>
  );
}

const columns = [
  ['Company Name', 'campaignColName'],
  ['Industry', 'campaignColIndustry'],
  ['Last Contact', 'campaignColContact'],
  ['Score', 'campaignColScore'],
] as const;

export function CampaignRow({
  company,
  active,
  onSelect,
  onToggleSelected,
}: CampaignRowProps) {
  return (
    <div
      className={`campaignRow ${active ? 'campaignRowActive' : ''}`}
      role="row"
      tabIndex={0}
      onClick={() => onSelect(company.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(company.id);
        }
      }}
    >
      <div role="cell" className="campaignCell campaignColSelect">
        <input
          className="campaignCheckbox"
          type="checkbox"
          checked={company.selected === true}
          aria-label={`Select ${company.name}`}
          onClick={(event) => event.stopPropagation()}
          onChange={() => onToggleSelected(company.id)}
        />
      </div>
      <div role="cell" className="campaignCell campaignColName campaignName">
        {company.name}
      </div>
      <div
        role="cell"
        className="campaignCell campaignColIndustry campaignMuted"
      >
        {company.industry}
      </div>
      <div
        role="cell"
        className="campaignCell campaignColContact campaignMuted"
      >
        {company.lastContact}
      </div>
      <div role="cell" className="campaignCell campaignColScore">
        <CampaignScore score={company.score} />
      </div>
    </div>
  );
}

export function CampaignTable({
  companies,
  activeId,
  onSelect,
  onToggleSelected,
  onToggleAll,
}: CampaignTableProps) {
  const allSelected =
    companies.length > 0 &&
    companies.every((company) => company.selected === true);

  return (
    <section className="campaignTableCard">
      <div className="campaignTableScroller">
        <div
          role="table"
          aria-label="Target companies"
          className="campaignTable"
        >
          <div role="rowgroup">
            <div role="row" className="campaignHeaderRow">
              <div
                role="columnheader"
                className="campaignHeadCell campaignColSelect"
              >
                <input
                  className="campaignCheckbox"
                  type="checkbox"
                  checked={allSelected}
                  aria-label="Select all companies"
                  onChange={onToggleAll}
                />
              </div>
              {columns.map(([label, className]) => (
                <div
                  key={label}
                  role="columnheader"
                  className={`campaignHeadCell ${className}`}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div role="rowgroup">
            {companies.length === 0 ? (
              <div role="row" className="campaignEmptyRow">
                <div role="cell" className="campaignEmptyCell">
                  No companies yet.
                </div>
              </div>
            ) : (
              companies.map((company) => (
                <CampaignRow
                  key={company.id}
                  company={company}
                  active={company.id === activeId}
                  onSelect={onSelect}
                  onToggleSelected={onToggleSelected}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Pathway() {
  const steps = [
    ['check', 'New', 'done'],
    ['check', 'Researched', 'done'],
    ['edit_document', 'Drafting', 'active'],
    ['schedule_send', 'Sent', 'pending'],
  ] as const;
  return (
    <section className="drawerCard">
      <h3 className="drawerCardTitle">Outreach Pathway</h3>
      <div className="pathway">
        <span className="pathwayTrack" />
        <span className="pathwayFill" />
        {steps.map(([icon, label, state]) => (
          <span key={label} className="pathwayStep">
            <span className={`pathwayDot pathwayDot-${state}`}>
              <Icon name={icon} size={14} />
            </span>
            <span className={`pathwayLabel pathwayLabel-${state}`}>
              {label}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}

function Artifacts() {
  return (
    <section className="drawerSection">
      <h3 className="drawerSectionTitle">
        <Icon name="folder_special" size={16} />
        Artifacts
      </h3>
      <div className="artifactList">
        <article className="artifactCard">
          <div className="artifactTop">
            <Icon name="article" />
            <span className="artifactBadge artifactReady">Ready</span>
          </div>
          <p className="artifactName">Q4_Value_Prop.docx</p>
          <p className="artifactMeta">Generated template</p>
        </article>
        <article className="artifactCard">
          <div className="artifactTop">
            <Icon name="contact_page" />
            <span className="artifactBadge artifactPending">Pending</span>
          </div>
          <p className="artifactName">Acme_Profile_Summary.pdf</p>
          <p className="artifactMeta">Resume artifact</p>
        </article>
      </div>
    </section>
  );
}

function RecentActivity() {
  const entries = [
    ['Template generation initiated by system.', 'Today, 09:41 AM', true],
    ['Data enrichment completed via Clearbit API.', 'Today, 09:35 AM', false],
    ["Entity added to campaign 'Enterprise Q4'.", 'Yesterday, 14:20 PM', false],
  ] as const;
  return (
    <section className="drawerSection">
      <h3 className="drawerSectionTitle">
        <Icon name="manage_search" size={16} />
        Recent Activity
      </h3>
      <div className="activityList">
        {entries.map(([body, time, active]) => (
          <article key={body} className="activityItem">
            <span className={active ? 'activityDot active' : 'activityDot'} />
            <div className="activityText">
              <p>{body}</p>
              <time>{time}</time>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function EntityDrawer({
  company,
  onClose,
  onGenerate,
  isGenerating,
}: EntityDrawerProps & { onGenerate: () => void; isGenerating: boolean }) {
  return (
    <aside className="entityDrawer" aria-label="Entity details">
      <div className="drawerHeader">
        <div className="drawerHeading">
          <span className="drawerEyebrow">Entity Details</span>
          <h2>{company.name}</h2>
          <p>
            <Icon name="domain" size={14} />
            {company.industry} • Enterprise
          </p>
        </div>
        <button
          className="drawerClose"
          type="button"
          aria-label="Close entity details"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="drawerBody">
        <Pathway />
        <Artifacts />
        <RecentActivity />
      </div>
      <div className="drawerFooter">
        <GenerateButton onClick={onGenerate} isLoading={isGenerating} />
        <div className="drawerSecondaryActions">
          <button type="button">
            <Icon name="skip_next" size={16} />
            Mark skipped
          </button>
          <button className="danger" type="button">
            <Icon name="archive" size={16} />
            Archive
          </button>
        </div>
      </div>
    </aside>
  );
}

export function CampaignsScreen() {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const { importedCompanies } = useOutreachContext();
  const generateArtifacts = useAction(generateArtifactsAction);

  const companies: CampaignCompany[] = useMemo(
    () =>
      importedCompanies.map((company) => ({
        id: company.id,
        name: company.name,
        industry: company.industry,
        lastContact: 'Never',
        score: company.confidence,
        selected: selectedIds.has(company.id),
      })),
    [importedCompanies, selectedIds],
  );

  const filteredCompanies = useMemo(() => {
    if (query.trim() === '') return companies;
    const lowerQuery = query.toLowerCase();
    return companies.filter((c) => c.name.toLowerCase().includes(lowerQuery));
  }, [companies, query]);

  const activeCompany = useMemo(
    () =>
      activeId === undefined
        ? undefined
        : companies.find((company) => company.id === activeId),
    [activeId, companies],
  );

  const handleGenerate = async () => {
    const selected = importedCompanies.filter((c) => selectedIds.has(c.id));
    if (selected.length === 0) {
      alert('Please select at least one company to generate artifacts.');
      return;
    }

    setIsGenerating(true);
    setGenError(null);

    try {
      await generateArtifacts({
        companies: selected.map((c) => ({
          id: c.id,
          name: c.name,
          industry: c.industry,
          techStack: c.techStack,
        })),
      });
      alert('Successfully triggered generation for selected companies!');
    } catch (error) {
      console.error('Generation failed:', error);
      const message =
        error instanceof Error ? error.message : 'Unknown generation error';
      setGenError(message);
      alert(`Generation failed: ${message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSingle = async (companyId: string) => {
    const company = importedCompanies.find((c) => c.id === companyId);
    if (!company) return;

    setIsGenerating(true);
    setGenError(null);

    try {
      await generateArtifacts({
        companies: [
          {
            id: company.id,
            name: company.name,
            industry: company.industry,
            techStack: company.techStack,
          },
        ],
      });
      alert(`Successfully triggered generation for ${company.name}!`);
    } catch (error) {
      console.error('Generation failed:', error);
      setGenError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsGenerating(false);
    }
  };

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds((current) => {
      if (current.size === filteredCompanies.length) {
        return new Set();
      }
      return new Set(filteredCompanies.map((company) => company.id));
    });
  }

  return (
    <div className="campaignScreen">
      <CampaignHeader
        query={query}
        onQueryChange={setQuery}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        selectedCount={selectedIds.size}
      />
      <div className="campaignCanvas">
        <div className="campaignTableWrap">
          <CampaignTable
            companies={filteredCompanies}
            activeId={activeId ?? ''}
            onSelect={setActiveId}
            onToggleSelected={toggleSelected}
            onToggleAll={toggleAll}
          />
        </div>
      </div>
      {activeCompany !== undefined ? (
        <EntityDrawer
          company={activeCompany}
          onClose={() => setActiveId(undefined)}
          onGenerate={() => handleGenerateSingle(activeCompany.id)}
          isGenerating={isGenerating}
        />
      ) : null}
      {genError && <div className="campaignGenError">Error: {genError}</div>}
    </div>
  );
}
