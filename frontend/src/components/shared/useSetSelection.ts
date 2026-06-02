import { useCallback, useState } from 'react';

export function useSetSelection<T extends string>() {
  const [selectedIds, setSelectedIds] = useState<Set<T>>(() => new Set());

  const clearSelected = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleSelected = useCallback((id: T) => {
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

  const toggleAll = useCallback((ids: T[], everySelected: boolean) => {
    setSelectedIds((current) => {
      if (everySelected) {
        const next = new Set(current);
        for (const id of ids) {
          next.delete(id);
        }
        return next;
      }
      return new Set(ids);
    });
  }, []);

  return {
    selectedIds,
    setSelectedIds,
    clearSelected,
    toggleSelected,
    toggleAll,
  };
}
