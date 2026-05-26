import { useCallback, useMemo, useState } from 'react';
import { companies, defaultSelectedIds, initialFilterChips } from './data';
import type { FilterChipModel } from './types';

/**
 * Owns all interactive state for the discovery screen: filter inputs, active
 * chips, and row selection. Keeps the screen component a pure composition.
 */
export function useScreenState() {
  const [activeNavId, setActiveNavId] = useState('companies');
  const [keywords, setKeywords] = useState('');
  const [techStack, setTechStack] = useState('');
  const [industry, setIndustry] = useState('all');
  const [companySize, setCompanySize] = useState('any');
  const [geography, setGeography] = useState('global');
  const [chips, setChips] = useState<FilterChipModel[]>(initialFilterChips);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(defaultSelectedIds),
  );

  const toggleRow = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((current) =>
      current.size === companies.length
        ? new Set()
        : new Set(companies.map((c) => c.id)),
    );
  }, []);

  const removeChip = useCallback((id: string) => {
    setChips((current) => current.filter((chip) => chip.id !== id));
  }, []);

  const reset = useCallback(() => {
    setChips([]);
    setKeywords('');
    setTechStack('');
    setIndustry('all');
    setCompanySize('any');
    setGeography('global');
  }, []);

  return useMemo(
    () => ({
      activeNavId,
      setActiveNavId,
      keywords,
      setKeywords,
      techStack,
      setTechStack,
      industry,
      setIndustry,
      companySize,
      setCompanySize,
      geography,
      setGeography,
      chips,
      removeChip,
      selectedIds,
      toggleRow,
      toggleAll,
      reset,
    }),
    [
      activeNavId,
      keywords,
      techStack,
      industry,
      companySize,
      geography,
      chips,
      selectedIds,
      toggleRow,
      toggleAll,
      removeChip,
      reset,
    ],
  );
}
