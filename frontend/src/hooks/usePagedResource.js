import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

const EMPTY_PAGE = { content: [], totalPages: 0, totalElements: 0, number: 0 };

/**
 * Fetches a Spring Data Page<T> from `endpoint`, refetching whenever
 * `page`, `size`, `sort`, or any value inside `filters` changes.
 */
export function usePagedResource(endpoint, filters, { page, size, sort }) {
  const [data, setData] = useState(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filtersKey = JSON.stringify(filters);

  const reload = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    const params = { ...JSON.parse(filtersKey), page, size, sort };
    Object.keys(params).forEach((key) => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    api.get(endpoint, { params })
      .then(({ data: page }) => {
        if (!cancelled) setData(page);
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load data.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, filtersKey, page, size, sort]);

  useEffect(() => reload(), [reload]);

  return {
    rows: data.content ?? [],
    totalPages: data.totalPages ?? 0,
    totalElements: data.totalElements ?? 0,
    loading,
    error,
    reload
  };
}
