import { Button } from './Common';
import { FilterConsole } from './Filters';
import { Results } from './Results';
import { useScreenState } from './useScreenState';
import { companies, discoveryMatches } from './data';
import type { PageHeaderProps } from './types';

/** Page title, supporting copy, and the Recent Searches action. */
export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="outreachPageHeader">
      <div className="outreachPageHeaderText">
        <h2 className="outreachPageTitle">{title}</h2>
        <p className="outreachPageSubtitle">{subtitle}</p>
      </div>
      <Button variant="secondary" iconName="history">
        Recent Searches
      </Button>
    </header>
  );
}

const noop = () => undefined;

/** Top-level "Generate Target List" screen wiring state to presentation. */
export function Screen() {
  const s = useScreenState();
  return (
    <>
      <PageHeader
        title="Generate Target List"
        subtitle="Discover and import companies based on industry, size, and technology stack."
      />
      <FilterConsole
        keywords={s.keywords}
        onKeywordsChange={s.setKeywords}
        techStack={s.techStack}
        onTechStackChange={s.setTechStack}
        industry={s.industry}
        onIndustryChange={s.setIndustry}
        companySize={s.companySize}
        onCompanySizeChange={s.setCompanySize}
        geography={s.geography}
        onGeographyChange={s.setGeography}
        chips={s.chips}
        onRemoveChip={s.removeChip}
        onReset={s.reset}
        onSearch={noop}
      />
      <Results
        companies={companies}
        matches={discoveryMatches}
        selectedIds={s.selectedIds}
        onToggleRow={s.toggleRow}
        onToggleAll={s.toggleAll}
        onExport={noop}
        onImport={noop}
      />
    </>
  );
}
