import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { makeFunctionReference } from 'convex/server';
import { Icon } from '../outreach/Common';
import { EmailDraftCarouselModal } from '../modals/EmailDraftCarouselModal';
import { CompanyResumeModal } from '../modals';
import { useSetSelection } from '../shared/useSetSelection';
import type { EmailDraft } from '../modals/types';
import { statusOptions } from './data';
import type {
  CardMenuProps,
  CompanyCardProps,
  CompanyEmailRow,
  CompanyGridProps,
  DraftReviewHeaderProps,
  DraftReviewScreenProps,
  DraftReviewTableProps,
  EmailPreviewModalProps,
  ResumeAttachmentProps,
  StatusBadgeProps,
} from './types';

const statusMeta = {
  ready: { icon: 'check_circle', label: 'Ready' },
  'missing-resume': { icon: 'warning', label: 'Missing Resume' },
  'invalid-email': { icon: 'error', label: 'Invalid Email' },
} as const;

export function StatusBadge({ status }: StatusBadgeProps) {
  const meta = statusMeta[status];
  return (
    <span className={`draftBadge draftBadge-${status}`}>
      <Icon name={meta.icon} size={14} />
      {meta.label}
    </span>
  );
}

export function DraftReviewHeader({
  query,
  onQueryChange,
  status,
  onStatusChange,
  allSelected,
  onToggleSelectAll,
}: DraftReviewHeaderProps) {
  return (
    <div className="draftControls">
      <div className="draftControlsFields">
        <label className="draftSearch">
          <span className="draftSearchIcon">
            <Icon name="search" size={20} />
          </span>
          <input
            className="draftSearchInput"
            placeholder="Search company or email"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>
        <div className="draftSelectWrap">
          <select
            className="draftSelect"
            aria-label="Filter by status"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="draftSelectIcon">
            <Icon name="expand_more" size={20} />
          </span>
        </div>
      </div>
      {onToggleSelectAll !== undefined ? (
        <button
          className="draftSelectAllButton"
          type="button"
          aria-pressed={allSelected === true}
          onClick={onToggleSelectAll}
        >
          <Icon
            name={allSelected === true ? 'check_box' : 'select_all'}
            size={18}
          />
          {allSelected === true ? 'Deselect All' : 'Select All'}
        </button>
      ) : null}
    </div>
  );
}

export function ResumeAttachment({ resume }: ResumeAttachmentProps) {
  if (resume === undefined) {
    return (
      <div className="draftResume">
        <p className="draftSectionLabel">Attached Resume</p>
        <div className="draftResumeEmpty">
          <button className="draftUploadButton" type="button">
            <Icon name="upload_file" size={16} />
            Upload Resume
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="draftResume">
      <p className="draftSectionLabel">Attached Resume</p>
      <div className="draftResumeFile">
        <span className="draftFileIcon">
          <Icon name="picture_as_pdf" size={20} />
        </span>
        <span className="draftFileMeta">
          <span className="draftFileName">{resume.name}</span>
          <span className="draftFileSub">
            {resume.size}
            {resume.updated !== undefined ? ` • ${resume.updated}` : ''}
          </span>
        </span>
      </div>
    </div>
  );
}

export function CardMenu({ companyName, onPreview }: CardMenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="draftCardMenuWrap">
      <button
        className="draftCardMenu"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Options for ${companyName}`}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
      >
        <Icon name="more_vert" size={20} />
      </button>
      {open ? (
        <>
          <div
            className="draftMenuBackdrop"
            role="presentation"
            onClick={(event) => {
              event.stopPropagation();
              setOpen(false);
            }}
          />
          <div className="draftMenu" role="menu">
            <button
              className="draftMenuItem"
              type="button"
              role="menuitem"
              onClick={(event) => {
                event.stopPropagation();
                setOpen(false);
                onPreview();
              }}
            >
              <Icon name="visibility" size={18} />
              Preview
            </button>
            <button
              className="draftMenuItem"
              type="button"
              role="menuitem"
              onClick={(event) => event.stopPropagation()}
            >
              <Icon name="edit" size={18} />
              Edit emails
            </button>
            <button
              className="draftMenuItem draftMenuItemDanger"
              type="button"
              role="menuitem"
              onClick={(event) => event.stopPropagation()}
            >
              <Icon name="delete" size={18} />
              Remove
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function CompanyCard({
  company,
  selected,
  onSelect,
  onPreview,
}: CompanyCardProps) {
  const fixable = company.status === 'invalid-email';
  return (
    <div
      className={`draftCard draftCard-${company.status} ${
        selected ? 'draftCardSelected' : ''
      }`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Select ${company.name}`}
      onClick={() => onSelect(company.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(company.id);
        }
      }}
    >
      <div className="draftCardHeader">
        <div className="draftCardHeading">
          <h3 className="draftCardTitle">{company.name}</h3>
          <StatusBadge status={company.status} />
        </div>
        <CardMenu
          companyName={company.name}
          onPreview={() => onPreview(company.id)}
        />
      </div>
      <div className="draftCardBody">
        <div className="draftEmails">
          <p className="draftSectionLabel draftSectionLabelRow">
            Associated Emails
            <button
              className={fixable ? 'draftLink draftLinkError' : 'draftLink'}
              type="button"
              onClick={(event) => event.stopPropagation()}
            >
              {fixable ? 'Fix Issues' : 'Edit'}
            </button>
          </p>
          <div className="draftEmailChips">
            {company.emails.map((email) => (
              <span
                key={email.address}
                className={
                  email.invalid === true
                    ? 'draftChip draftChipInvalid'
                    : 'draftChip'
                }
              >
                {email.invalid === true ? (
                  <Icon name="warning" size={14} />
                ) : null}
                {email.address}
              </span>
            ))}
          </div>
        </div>
        <ResumeAttachment resume={company.resume} />
      </div>
    </div>
  );
}

export function CompanyGrid({
  companies,
  selectedIds,
  onSelect,
  onPreview,
}: CompanyGridProps) {
  if (companies.length === 0) {
    return (
      <div className="draftEmpty">
        <Icon name="inbox" size={20} />
        <p className="draftEmptyText">No companies to review.</p>
      </div>
    );
  }
  return (
    <div className="draftGrid">
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          selected={selectedIds.has(company.id)}
          onSelect={onSelect}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
}

export function EmailPreviewModal({
  company,
  onClose,
}: EmailPreviewModalProps) {
  const { preview } = company;
  return (
    <div className="draftModalOverlay" role="presentation" onClick={onClose}>
      <div
        className="draftModal"
        role="dialog"
        aria-modal="true"
        aria-label="Email Preview"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="draftModalHeader">
          <h3 className="draftModalTitle">Email Preview</h3>
          <button
            className="draftModalClose"
            type="button"
            aria-label="Close email preview"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="draftModalBody">
          <div className="draftFields">
            <div className="draftFieldRow">
              <span className="draftFieldLabel">To:</span>
              <span className="draftFieldValue">{preview.to}</span>
            </div>
            <span className="draftFieldDivider" />
            <div className="draftFieldRow">
              <span className="draftFieldLabel">Subject:</span>
              <span className="draftFieldValue draftFieldStrong">
                {preview.subject}
              </span>
            </div>
          </div>
          <div className="draftMessage">
            {preview.body.map((paragraph, index) => (
              <p key={index} className="draftParagraph">
                {paragraph}
              </p>
            ))}
          </div>
          {preview.attachment !== undefined ? (
            <div className="draftAttachment">
              <p className="draftSectionLabel">Attachment</p>
              <div className="draftResumeFile draftResumeFileFit">
                <span className="draftFileIcon">
                  <Icon name="picture_as_pdf" size={20} />
                </span>
                <span className="draftFileMeta">
                  <span className="draftFileName">
                    {preview.attachment.name}
                  </span>
                  <span className="draftFileSub">
                    {preview.attachment.size}
                  </span>
                </span>
              </div>
            </div>
          ) : null}
        </div>
        <div className="draftModalFooter">
          <button
            className="draftSecondaryButton"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="draftPrimaryButton" type="button">
            Send Email
            <Icon name="send" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Live subscription: opens when the screen mounts and is torn down on unmount.
// Reused from the Email Table — returns every company with ≥1 non-empty email.
const listCompaniesWithEmailsQuery = makeFunctionReference<
  'query',
  Record<string, never>,
  CompanyEmailRow[]
>('emails:listCompaniesWithEmails');

// The clicked company's email cards — fetched only while a row is active.
const getCompanyEmailDraftsQuery = makeFunctionReference<
  'query',
  { companyId: string },
  EmailDraft[]
>('emails:getCompanyEmailDrafts');

/** Show an email address, or a dash when that slot is empty. */
function emailCell(value: string): string {
  return value.trim().length > 0 ? value : '—';
}

/**
 * Table of companies that have at least one recipient email. Reuses the
 * Campaigns table's structure/styling (`campaign*` classes) so it shares the
 * same selectable-checkbox + clickable-row interaction.
 */
export function DraftReviewTable({
  loading,
  rows,
  selectedIds,
  allSelected,
  activeId,
  onSelect,
  onToggleSelected,
  onToggleAll,
}: DraftReviewTableProps) {
  if (loading) {
    return <p className="draftTableLoading">Loading…</p>;
  }
  return (
    <section className="campaignTableCard">
      <div className="campaignTableScroller">
        <div
          role="table"
          aria-label="Companies with contacts"
          className="campaignTable"
        >
          <div role="rowgroup">
            <div role="row" className="campaignHeaderRow">
              <div
                role="columnheader"
                className="campaignHeadCell draftColSelect"
              >
                <input
                  className="campaignCheckbox"
                  type="checkbox"
                  checked={allSelected}
                  aria-label="Select all companies"
                  onChange={onToggleAll}
                />
              </div>
              <div
                role="columnheader"
                className="campaignHeadCell draftColName"
              >
                Company
              </div>
              <div
                role="columnheader"
                className="campaignHeadCell draftColEmail"
              >
                Email1
              </div>
              <div
                role="columnheader"
                className="campaignHeadCell draftColEmail"
              >
                Email2
              </div>
              <div
                role="columnheader"
                className="campaignHeadCell draftColEmail"
              >
                Email3
              </div>
              <div
                role="columnheader"
                className="campaignHeadCell draftColStatus"
              >
                Status
              </div>
            </div>
          </div>
          <div role="rowgroup">
            {rows.length === 0 ? (
              <div role="row" className="campaignEmptyRow">
                <div role="cell" className="campaignEmptyCell">
                  No companies to review.
                </div>
              </div>
            ) : (
              rows.map((row) => (
                <div
                  key={row.companyId}
                  className={[
                    'campaignRow',
                    row.companyId === activeId ? 'campaignRowActive' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  role="row"
                  tabIndex={0}
                  onClick={() => onSelect(row.companyId)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelect(row.companyId);
                    }
                  }}
                >
                  <div role="cell" className="campaignCell draftColSelect">
                    <input
                      className="campaignCheckbox"
                      type="checkbox"
                      checked={selectedIds.has(row.companyId)}
                      aria-label={`Select ${row.company}`}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => onToggleSelected(row.companyId)}
                    />
                  </div>
                  <div role="cell" className="campaignCell draftColName">
                    <span className="campaignCellText">{row.company}</span>
                  </div>
                  <div role="cell" className="campaignCell draftColEmail">
                    <span className="campaignCellText">
                      {emailCell(row.email1)}
                    </span>
                  </div>
                  <div role="cell" className="campaignCell draftColEmail">
                    <span className="campaignCellText">
                      {emailCell(row.email2)}
                    </span>
                  </div>
                  <div role="cell" className="campaignCell draftColEmail">
                    <span className="campaignCellText">
                      {emailCell(row.email3)}
                    </span>
                  </div>
                  <div role="cell" className="campaignCell draftColStatus">
                    <span className="campaignCellText">{row.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function DraftReviewScreen({
  onContinue,
  onBack,
}: DraftReviewScreenProps) {
  const rows = useQuery(listCompaniesWithEmailsQuery, {});
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const {
    selectedIds,
    toggleSelected,
    toggleAll: toggleAllSelected,
  } = useSetSelection<string>();
  // The clicked row: highlights it AND opens the review carousel. Closing the
  // modal clears it, so the highlight disappears as the modal fades away.
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [carouselIndex, setCarouselIndex] = useState(0);
  // Opens the shared résumé-PDF modal for the active company's attachment.
  const [resumeOpen, setResumeOpen] = useState(false);

  // Fetch the active company's email cards only while a row is open; switching
  // to 'skip' on close tears the subscription down (the requested cleanup).
  const draftCards = useQuery(
    getCompanyEmailDraftsQuery,
    activeId !== undefined ? { companyId: activeId } : 'skip',
  );

  function openRow(id: string) {
    setActiveId(id);
    setCarouselIndex(0);
  }

  function closeModal() {
    setActiveId(undefined);
    setResumeOpen(false);
  }

  const visibleRows = useMemo(() => {
    const list = rows ?? [];
    const term = query.trim().toLowerCase();
    return list.filter((row) => {
      if (status !== 'all' && row.status !== status) {
        return false;
      }
      if (term.length === 0) {
        return true;
      }
      return (
        row.company.toLowerCase().includes(term) ||
        [row.email1, row.email2, row.email3].some((email) =>
          email.toLowerCase().includes(term),
        )
      );
    });
  }, [rows, query, status]);

  const allSelected =
    visibleRows.length > 0 &&
    visibleRows.every((row) => selectedIds.has(row.companyId));

  const activeCompanyName =
    (rows ?? []).find((row) => row.companyId === activeId)?.company ?? '';

  return (
    <section className="draftScreen">
      <div className="draftHeader">
        <h1 className="draftTitle">Review Company Email Groups</h1>
        <p className="draftSubtitle">
          Review each company, its associated email addresses, and the attached
          resume before continuing.
        </p>
      </div>
      <DraftReviewHeader
        query={query}
        onQueryChange={setQuery}
        status={status}
        onStatusChange={setStatus}
      />
      <DraftReviewTable
        loading={rows === undefined}
        rows={visibleRows}
        selectedIds={selectedIds}
        allSelected={allSelected}
        activeId={activeId}
        onSelect={openRow}
        onToggleSelected={toggleSelected}
        onToggleAll={() =>
          toggleAllSelected(
            visibleRows.map((row) => row.companyId),
            allSelected,
          )
        }
      />
      <div className="draftFooter">
        <button className="draftSecondaryButton" type="button" onClick={onBack}>
          Back
        </button>
        <button
          className="draftPrimaryButton"
          type="button"
          onClick={() => onContinue?.([...selectedIds])}
          disabled={selectedIds.size === 0}
        >
          Continue to Send
          <Icon name="arrow_forward" size={18} />
        </button>
      </div>
      {activeId !== undefined ? (
        <EmailDraftCarouselModal
          drafts={draftCards ?? []}
          activeIndex={carouselIndex}
          onPrev={() => setCarouselIndex((index) => Math.max(0, index - 1))}
          onNext={() =>
            setCarouselIndex((index) =>
              Math.min((draftCards?.length ?? 1) - 1, index + 1),
            )
          }
          onClose={closeModal}
          onDiscard={closeModal}
          onEdit={() => undefined}
          onApprove={closeModal}
          onShowResume={() => setResumeOpen(true)}
        />
      ) : null}
      {resumeOpen && activeId !== undefined ? (
        <CompanyResumeModal
          companyId={activeId}
          companyName={activeCompanyName}
          onClose={() => setResumeOpen(false)}
        />
      ) : null}
    </section>
  );
}
