import { useMemo, useState } from 'react';
import { Icon } from '../outreach/Common';
import { draftCompanies, statusOptions } from './data';
import type {
  CardMenuProps,
  CompanyCardProps,
  CompanyGridProps,
  DraftReviewHeaderProps,
  DraftReviewScreenProps,
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
      <button
        className="draftSelectAllButton"
        type="button"
        aria-pressed={allSelected}
        onClick={onToggleSelectAll}
      >
        <Icon name={allSelected ? 'check_box' : 'select_all'} size={18} />
        {allSelected ? 'Deselect All' : 'Select All'}
      </button>
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

export function DraftReviewScreen({
  onContinue,
  companies = draftCompanies,
}: DraftReviewScreenProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

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

  function toggleSelectAll(ids: string[], everySelected: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (everySelected) {
          next.delete(id);
        } else {
          next.add(id);
        }
      }
      return next;
    });
  }

  const visibleCompanies = useMemo(() => {
    const term = query.trim().toLowerCase();
    return companies.filter((company) => {
      if (status !== 'all' && company.status !== status) {
        return false;
      }
      if (term.length === 0) {
        return true;
      }
      return (
        company.name.toLowerCase().includes(term) ||
        company.emails.some((email) =>
          email.address.toLowerCase().includes(term),
        )
      );
    });
  }, [companies, query, status]);

  const activeCompany = useMemo(
    () => companies.find((company) => company.id === activeId),
    [companies, activeId],
  );

  const allSelected =
    visibleCompanies.length > 0 &&
    visibleCompanies.every((company) => selectedIds.has(company.id));

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
        allSelected={allSelected}
        onToggleSelectAll={() =>
          toggleSelectAll(
            visibleCompanies.map((company) => company.id),
            allSelected,
          )
        }
      />
      <CompanyGrid
        companies={visibleCompanies}
        selectedIds={selectedIds}
        onSelect={toggleSelected}
        onPreview={setActiveId}
      />
      <div className="draftFooter">
        <button className="draftSecondaryButton" type="button">
          Back
        </button>
        <button
          className="draftPrimaryButton"
          type="button"
          onClick={onContinue}
        >
          Continue
          <Icon name="arrow_forward" size={18} />
        </button>
      </div>
      {activeCompany !== undefined ? (
        <EmailPreviewModal
          company={activeCompany}
          onClose={() => setActiveId(undefined)}
        />
      ) : null}
    </section>
  );
}
