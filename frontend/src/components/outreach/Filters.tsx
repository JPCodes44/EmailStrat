import { Button, Icon, InputBox } from './Common';
import { companySizeOptions, industryOptions } from './data';
import type {
  ActiveFiltersProps,
  FilterActionsProps,
  FilterChipProps,
  FilterCompanyLimitInputProps,
  FilterConsoleProps,
  FilterFieldProps,
  FilterSearchProps,
  FilterSelectProps,
  FilterTechInputProps,
} from './types';

/** A labelled wrapper around a single filter control. */
export function FilterField({ label, children }: FilterFieldProps) {
  return (
    <label className="outreachFilterField">
      <span className="outreachFilterLabel">{label}</span>
      {children}
    </label>
  );
}

/** An active-filter chip with a remove control. */
export function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="outreachFilterChip">
      {label}
      <button
        type="button"
        className="outreachChipClose"
        aria-label={`Remove filter ${label}`}
        onClick={onRemove}
      >
        <Icon name="close" size={14} />
      </button>
    </span>
  );
}

/** Full-width keyword search input with a leading search glyph. */
export function FilterSearch({ value, onChange }: FilterSearchProps) {
  return (
    <div className="outreachSearchField">
      <FilterField label="Keywords">
        <span className="outreachInputWrap">
          <span className="outreachSearchIcon">
            <Icon name="search" size={20} />
          </span>
          <InputBox
            className="outreachSearchInput"
            placeholder="Search by company name, description, or domain..."
            value={value}
            onChange={onChange}
          />
        </span>
      </FilterField>
    </div>
  );
}

/** A labelled dropdown filter backed by a native `<select>`. */
export function FilterSelect({
  label,
  options,
  value,
  onChange,
  onBlur,
}: FilterSelectProps) {
  return (
    <FilterField label={label}>
      <select
        className="outreachSelect"
        value={value}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      >
        {options.map((option) => {
          const optValue = typeof option === 'string' ? option : option.value;
          const optLabel = typeof option === 'string' ? option : option.label;
          return (
            <option key={optValue} value={optValue}>
              {optLabel}
            </option>
          );
        })}
      </select>
    </FilterField>
  );
}

/** Tech-stack keyword input with a trailing code glyph. */
export function FilterTechInput({ value, onChange }: FilterTechInputProps) {
  return (
    <FilterField label="Tech Stack">
      <span className="outreachInputWrap">
        <InputBox
          className="outreachTechInput"
          placeholder="e.g., React, AWS"
          value={value}
          onChange={onChange}
        />
        <span className="outreachTechIcon">
          <Icon name="code" size={20} />
        </span>
      </span>
    </FilterField>
  );
}

/** Numeric target-count input for company research. */
export function FilterCompanyLimitInput({
  value,
  onChange,
}: FilterCompanyLimitInputProps) {
  return (
    <FilterField label="Companies">
      <span className="outreachInputWrap">
        <InputBox
          type="number"
          placeholder="50"
          min={1}
          max={100}
          value={value}
          onChange={onChange}
        />
      </span>
    </FilterField>
  );
}

/** "Active Filters:" label followed by the removable chips. */
export function ActiveFilters({ chips, onRemove }: ActiveFiltersProps) {
  return (
    <div className="outreachActiveFilters">
      <span className="outreachActiveLabel">Active Filters:</span>
      <div className="outreachActiveChips">
        {chips.map((chip) => (
          <FilterChip
            key={chip.id}
            label={chip.label}
            onRemove={() => onRemove(chip.id)}
          />
        ))}
      </div>
    </div>
  );
}

/** Reset and Search actions for the filter console. */
export function FilterActions({
  onReset,
  onSearch,
  isSearching = false,
}: FilterActionsProps) {
  return (
    <div className="outreachFilterActions">
      <Button variant="secondary" disabled={isSearching} onClick={onReset}>
        Reset Filters
      </Button>
      <Button
        variant="primary"
        iconName="search"
        disabled={isSearching}
        onClick={onSearch}
      >
        {isSearching ? 'Searching...' : 'Search Companies'}
      </Button>
    </div>
  );
}

/** Search keyword + faceted filters card above the results table. */
export function FilterConsole(props: FilterConsoleProps) {
  return (
    <section className="outreachFilterConsole">
      <div className="outreachFilterGrid">
        <FilterSearch
          value={props.keywords}
          onChange={props.onKeywordsChange}
        />
        <FilterSelect
          label="Industry"
          options={industryOptions}
          value={props.industry}
          onChange={props.onIndustryChange}
        />
        <FilterSelect
          label="Company Size"
          options={companySizeOptions}
          value={props.companySize}
          onChange={props.onCompanySizeChange}
        />
        <FilterSelect
          label="Location"
          options={props.locationOptions}
          value={props.location}
          onChange={props.onLocationChange}
        />
        <FilterSelect
          label="State/Province"
          options={props.regionOptions}
          value={props.region}
          onChange={props.onRegionChange}
        />
        <FilterSelect
          label="City"
          options={props.cityOptions}
          value={props.city}
          onChange={props.onCityChange}
        />
        <FilterTechInput
          value={props.techStack}
          onChange={props.onTechStackChange}
        />
        <FilterCompanyLimitInput
          value={props.companyLimit}
          onChange={props.onCompanyLimitChange}
        />
      </div>
      <div className="outreachFilterFooter">
        <ActiveFilters chips={props.chips} onRemove={props.onRemoveChip} />
        <FilterActions
          onReset={props.onReset}
          onSearch={props.onSearch}
          isSearching={props.isSearching}
        />
      </div>
    </section>
  );
}
