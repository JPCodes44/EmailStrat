import { Button, Icon } from './Common';
import { companySizeOptions, geographyOptions, industryOptions } from './data';
import type {
  ActiveFiltersProps,
  FilterActionsProps,
  FilterChipProps,
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
          <input
            type="text"
            className="outreachInput outreachSearchInput"
            placeholder="Search by company name, description, or domain..."
            value={value}
            onChange={(event) => onChange(event.target.value)}
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
}: FilterSelectProps) {
  return (
    <FilterField label={label}>
      <select
        className="outreachSelect"
        value={value}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FilterField>
  );
}

/** Tech-stack keyword input with a trailing code glyph. */
export function FilterTechInput({ value, onChange }: FilterTechInputProps) {
  return (
    <FilterField label="Tech Stack">
      <span className="outreachInputWrap">
        <input
          type="text"
          className="outreachInput outreachTechInput"
          placeholder="e.g., React, AWS"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="outreachTechIcon">
          <Icon name="code" size={20} />
        </span>
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
export function FilterActions({ onReset, onSearch }: FilterActionsProps) {
  return (
    <div className="outreachFilterActions">
      <Button variant="secondary" onClick={onReset}>
        Reset Filters
      </Button>
      <Button variant="primary" iconName="search" onClick={onSearch}>
        Search Companies
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
          label="Geography"
          options={geographyOptions}
          value={props.geography}
          onChange={props.onGeographyChange}
        />
        <FilterTechInput
          value={props.techStack}
          onChange={props.onTechStackChange}
        />
      </div>
      <div className="outreachFilterFooter">
        <ActiveFilters chips={props.chips} onRemove={props.onRemoveChip} />
        <FilterActions onReset={props.onReset} onSearch={props.onSearch} />
      </div>
    </section>
  );
}
