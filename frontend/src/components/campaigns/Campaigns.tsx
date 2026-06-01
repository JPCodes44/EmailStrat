import { useMemo, useState } from 'react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { makeFunctionReference } from 'convex/server';
import { Icon, StatusPill } from '../outreach/Common';
import {
  DraftGenerationSuccessModal,
  DeleteConfirmationModal,
  GenerationFailedModal,
  EmptySelectionModal,
  EmailTemplateModal,
  ResumePdfModal,
} from '../modals';
import { draftStatusThemes } from './status';
import type {
  CampaignCompany,
  CampaignHeaderProps,
  CampaignRowProps,
  CampaignScoreProps,
  CampaignsScreenProps,
  CampaignTableProps,
  DraftStatus,
  EntityDrawerProps,
} from './types';

const generateArtifactsAction = makeFunctionReference<
  'action',
  {
    companies: {
      id: string;
      name: string;
    }[];
  },
  void
>('artifacts:generateForCompanies');

/** A persisted pipeline company as returned by `companies:listCampaignCompanies`. */
interface CampaignCompanyRow {
  id: string;
  name: string;
  industry: string;
  confidence: number;
  status: DraftStatus;
}

const listCampaignCompaniesQuery = makeFunctionReference<
  'query',
  Record<string, never>,
  CampaignCompanyRow[]
>('companies:listCampaignCompanies');

const deleteCompaniesMutation = makeFunctionReference<
  'mutation',
  { externalIds: string[] },
  null
>('companies:deleteCompanies');

const getCompanyArtifactQuery = makeFunctionReference<
  'query',
  { companyId: string },
  { emailTemplate: string; resumePdfUrl: string | null } | null
>('companies:getCompanyArtifact');

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

const statusFilterOptions: { value: DraftStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'drafted', label: draftStatusThemes.drafted.label },
  { value: 'not-drafted', label: draftStatusThemes['not-drafted'].label },
];

export function CampaignHeader({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  onGenerate,
  onDelete,
  selectedCount,
}: CampaignHeaderProps & {
  onGenerate: () => void;
  onDelete: () => void;
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
            <div
              className="campaignStatusFilter"
              role="group"
              aria-label="Filter by status"
            >
              {statusFilterOptions.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={
                    statusFilter === value
                      ? 'campaignFilterChip campaignFilterChipActive'
                      : 'campaignFilterChip'
                  }
                  aria-pressed={statusFilter === value}
                  onClick={() => onStatusFilterChange(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              className="campaignDeleteButton"
              type="button"
              onClick={onDelete}
              disabled={selectedCount === 0}
            >
              <Icon name="delete" size={16} />
              Delete
            </button>
            <GenerateButton
              onClick={onGenerate}
              disabled={selectedCount === 0}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CampaignScore({ score }: CampaignScoreProps) {
  // Snap to the nearest 5% so the fill width maps to a fixed CSS class for any
  // score (avoids needing a hand-written rule per exact integer).
  const fillWidth = Math.min(100, Math.max(0, Math.round(score / 5) * 5));
  return (
    <div className="campaignScore">
      <span className="campaignScoreTrack">
        <span className={`campaignScoreFill campaignScoreFill-${fillWidth}`} />
      </span>
      <span
        className={`campaignCellText ${
          score >= 80 ? 'campaignScoreGood' : 'campaignScoreLow'
        }`}
      >
        {score}
      </span>
    </div>
  );
}

const columns = [
  ['Company Name', 'campaignColName'],
  ['Industry', 'campaignColIndustry'],
  ['Status', 'campaignColStatus'],
  ['Template', 'campaignColTemplate'],
  ['Resume', 'campaignColResume'],
  ['Score', 'campaignColScore'],
] as const;

export function CampaignRow({
  company,
  active,
  generating,
  onSelect,
  onToggleSelected,
  onShowTemplate,
  onShowResume,
}: CampaignRowProps) {
  return (
    <div
      className={[
        'campaignRow',
        active ? 'campaignRowActive' : '',
        generating ? 'campaignRowGenerating' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="row"
      aria-busy={generating}
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
        <span className="campaignCellText">{company.name}</span>
      </div>
      <div
        role="cell"
        className="campaignCell campaignColIndustry campaignMuted"
      >
        <span className="campaignCellText">{company.industry}</span>
      </div>
      <div role="cell" className="campaignCell campaignColStatus">
        <StatusPill tone={draftStatusThemes[company.status].tone}>
          {draftStatusThemes[company.status].label}
        </StatusPill>
      </div>
      <div role="cell" className="campaignCell campaignColTemplate">
        {company.status === 'drafted' ? (
          <button
            type="button"
            className="campaignLink"
            onClick={(event) => {
              event.stopPropagation();
              onShowTemplate(company.id);
            }}
          >
            Show Template
          </button>
        ) : (
          <span className="campaignDash">--</span>
        )}
      </div>
      <div role="cell" className="campaignCell campaignColResume">
        {company.status === 'drafted' ? (
          <button
            type="button"
            className="campaignLink"
            onClick={(event) => {
              event.stopPropagation();
              onShowResume(company.id);
            }}
          >
            Show Resume
          </button>
        ) : (
          <span className="campaignDash">--</span>
        )}
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
  generatingIds,
  onSelect,
  onToggleSelected,
  onToggleAll,
  onShowTemplate,
  onShowResume,
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
                  generating={generatingIds.has(company.id)}
                  onSelect={onSelect}
                  onToggleSelected={onToggleSelected}
                  onShowTemplate={onShowTemplate}
                  onShowResume={onShowResume}
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
}: EntityDrawerProps & { onGenerate: () => void }) {
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
        <GenerateButton
          onClick={onGenerate}
          disabled={company.status === 'drafted'}
        />
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

export function CampaignsScreen({ onViewDraftReview }: CampaignsScreenProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DraftStatus | 'all'>('all');
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [generatedCount, setGeneratedCount] = useState<number | null>(null);
  const [genFailure, setGenFailure] = useState<{
    targets: { id: string; name: string }[];
  } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);
  const [artifactView, setArtifactView] = useState<{
    companyId: string;
    name: string;
    kind: 'template' | 'resume';
  } | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const companyRows = useQuery(listCampaignCompaniesQuery, {});
  const artifact = useQuery(
    getCompanyArtifactQuery,
    artifactView !== null ? { companyId: artifactView.companyId } : 'skip',
  );
  const importedCompanies = useMemo(() => companyRows ?? [], [companyRows]);
  const generateArtifacts = useAction(generateArtifactsAction);
  const deleteCompanies = useMutation(deleteCompaniesMutation);

  const companies: CampaignCompany[] = useMemo(
    () =>
      importedCompanies.map((company) => ({
        id: company.id,
        name: company.name,
        industry: company.industry,
        score: company.confidence,
        status: company.status,
        selected: selectedIds.has(company.id),
      })),
    [importedCompanies, selectedIds],
  );

  const filteredCompanies = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    return companies.filter(
      (c) =>
        (lowerQuery === '' || c.name.toLowerCase().includes(lowerQuery)) &&
        (statusFilter === 'all' || c.status === statusFilter),
    );
  }, [companies, query, statusFilter]);

  const activeCompany = useMemo(
    () =>
      activeId === undefined
        ? undefined
        : companies.find((company) => company.id === activeId),
    [activeId, companies],
  );

  // Generate one company's artifacts, owning its own row-shimmer lifecycle so
  // multiple companies can generate in parallel and settle independently.
  // Rejects on failure; callers aggregate outcomes via Promise.allSettled.
  const generateOne = async (company: { id: string; name: string }) => {
    setGeneratingIds((prev) => new Set(prev).add(company.id));
    try {
      await generateArtifacts({
        companies: [{ id: company.id, name: company.name }],
      });
    } finally {
      setGeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(company.id);
        return next;
      });
    }
  };

  // Run a batch in parallel; show the success modal, or the failure modal
  // (with the failed companies, so Retry can re-run just those).
  const runGeneration = async (targets: { id: string; name: string }[]) => {
    if (targets.length === 0) return;
    const results = await Promise.allSettled(
      targets.map((c) => generateOne(c)),
    );
    const failed = targets.filter((_, i) => results[i]!.status === 'rejected');
    if (failed.length > 0) {
      setGenFailure({ targets: failed });
    } else {
      setGeneratedCount(targets.length);
    }
  };

  const handleGenerate = async () => {
    const selectedAll = importedCompanies.filter((c) => selectedIds.has(c.id));
    if (selectedAll.length === 0) {
      setNotice('Select at least one company to generate templates & resumes.');
      return;
    }
    // Skip companies already drafted or with generation in flight.
    const selected = selectedAll.filter(
      (c) => c.status !== 'drafted' && !generatingIds.has(c.id),
    );
    await runGeneration(selected.map((c) => ({ id: c.id, name: c.name })));
  };

  const handleGenerateSingle = async (companyId: string) => {
    if (generatingIds.has(companyId)) return;
    const company = importedCompanies.find((c) => c.id === companyId);
    if (!company || company.status === 'drafted') return;
    await runGeneration([{ id: company.id, name: company.name }]);
  };

  const handleDelete = () => {
    const ids = [...selectedIds];
    if (ids.length === 0) {
      setNotice('Select at least one company to delete.');
      return;
    }
    setPendingDelete(ids);
  };

  const confirmDelete = async () => {
    const ids = pendingDelete;
    setPendingDelete(null);
    if (ids === null) return;
    setGenError(null);
    try {
      await deleteCompanies({ externalIds: ids });
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Delete failed:', error);
      setGenError(
        error instanceof Error ? error.message : 'Unknown delete error',
      );
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

  const openArtifact = (kind: 'template' | 'resume') => (id: string) => {
    const company = importedCompanies.find((c) => c.id === id);
    if (company) setArtifactView({ companyId: id, name: company.name, kind });
  };

  return (
    <div className="campaignScreen">
      <CampaignHeader
        query={query}
        onQueryChange={setQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onGenerate={handleGenerate}
        onDelete={handleDelete}
        selectedCount={selectedIds.size}
      />
      <div className="campaignCanvas">
        <div className="campaignTableWrap">
          <CampaignTable
            companies={filteredCompanies}
            activeId={activeId ?? ''}
            generatingIds={generatingIds}
            onSelect={setActiveId}
            onToggleSelected={toggleSelected}
            onToggleAll={toggleAll}
            onShowTemplate={openArtifact('template')}
            onShowResume={openArtifact('resume')}
          />
        </div>
      </div>
      {activeCompany !== undefined ? (
        <EntityDrawer
          company={activeCompany}
          onClose={() => setActiveId(undefined)}
          onGenerate={() => handleGenerateSingle(activeCompany.id)}
        />
      ) : null}
      {genError && <div className="campaignGenError">Error: {genError}</div>}
      {generatedCount !== null ? (
        <DraftGenerationSuccessModal
          count={generatedCount}
          onDismiss={() => setGeneratedCount(null)}
          onGoToDraftReview={() => {
            setGeneratedCount(null);
            onViewDraftReview?.();
          }}
        />
      ) : null}
      {genFailure !== null ? (
        <GenerationFailedModal
          message={`We couldn't generate templates for ${
            genFailure.targets.length
          } ${
            genFailure.targets.length === 1 ? 'company' : 'companies'
          }. Please try again.`}
          onDismiss={() => setGenFailure(null)}
          onRetry={() => {
            const targets = genFailure.targets;
            setGenFailure(null);
            void runGeneration(targets);
          }}
        />
      ) : null}
      {pendingDelete !== null ? (
        <DeleteConfirmationModal
          count={pendingDelete.length}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      ) : null}
      {notice !== null ? (
        <EmptySelectionModal
          message={notice}
          onDismiss={() => setNotice(null)}
        />
      ) : null}
      {artifactView !== null && artifactView.kind === 'template' ? (
        <EmailTemplateModal
          companyName={artifactView.name}
          emailText={artifact?.emailTemplate ?? null}
          loading={artifact === undefined}
          onClose={() => setArtifactView(null)}
        />
      ) : null}
      {artifactView !== null && artifactView.kind === 'resume' ? (
        <ResumePdfModal
          companyName={artifactView.name}
          pdfUrl={artifact?.resumePdfUrl ?? null}
          loading={artifact === undefined}
          onClose={() => setArtifactView(null)}
        />
      ) : null}
    </div>
  );
}
