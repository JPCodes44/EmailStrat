import { Button } from './Common';
import { FilterConsole } from './Filters';
import { Results } from './Results';
import { useOutreachContext } from './OutreachContext';
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

/** Top-level "Generate Target List" screen wiring state to presentation. */
export function Screen() {
  const s = useOutreachContext();
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
        location={s.location}
        onLocationChange={s.onLocationChange}
        locationOptions={s.locationOptions}
        region={s.region}
        onRegionChange={s.onRegionChange}
        regionOptions={s.regionOptions}
        city={s.city}
        onCityChange={s.onCityChange}
        cityOptions={s.cityOptions}
        companyLimit={s.companyLimit}
        onCompanyLimitChange={s.setCompanyLimit}
        chips={s.chips}
        onRemoveChip={s.removeChip}
        onReset={s.reset}
        onSearch={s.search}
        isSearching={s.isSearching}
      />
      <Results
        companies={s.resultCompanies}
        matches={s.matches}
        selectedIds={s.selectedIds}
        isLoading={s.isSearching}
        error={s.searchError}
        onToggleRow={s.toggleRow}
        onToggleAll={s.toggleAll}
        onClearSelected={s.clearSelectedResults}
        onExport={() => undefined}
        onImport={s.importToCampaign}
      />
    </>
  );
}
