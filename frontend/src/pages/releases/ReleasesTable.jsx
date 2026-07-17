import { useState } from 'react';
import { FaBoxOpen, FaSearch } from 'react-icons/fa';
import { usePagedResource } from '../../hooks/usePagedResource';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import Pagination from '../../components/common/Pagination';
import SortableHeader from '../../components/common/SortableHeader';
import ExportButtons from '../../components/common/ExportButtons';
import { formatDateTime } from '../../utils/format';

const EXPORT_COLUMNS = [
  { key: 'registrationNumber', label: 'Matricule' },
  { key: 'type', label: 'ISO' },
  { key: 'allocationCode', label: 'Allocation' },
  { key: 'entryDateTime', label: "Date d'entrée" },
  { key: 'exitDateTime', label: 'Date de sortie' },
  { key: 'entryState', label: 'État entrée' },
  { key: 'exitState', label: 'État sortie' },
  { key: 'movementLabel', label: 'Mouvement' },
  { key: 'agentName', label: 'Agent' }
];

const LABEL_OPTIONS = [
  { value: '', label: 'All movements' },
  { value: 'CHARGEMENT', label: 'Chargement' },
  { value: 'DECHARGEMENT', label: 'Déchargement' },
  { value: 'AUCUN', label: 'Aucun' }
];

export default function ReleasesTable({ title, subtitle }) {
  const [query, setQuery] = useState('');
  const [label, setLabel] = useState('');
  const [agent, setAgent] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState('dateHeure,desc');

  const debouncedQuery = useDebouncedValue(query, 300);
  const debouncedAgent = useDebouncedValue(agent, 300);

  const { rows, totalPages, totalElements, loading } = usePagedResource(
    '/releases/search',
    {
      query: debouncedQuery,
      label,
      agent: debouncedAgent,
      start: start ? `${start}T00:00:00` : '',
      end: end ? `${end}T23:59:59` : ''
    },
    { page, size: 10, sort }
  );

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border-default bg-surface-2 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/15 text-brand-600">
            <FaBoxOpen className="text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-ink-faint">{subtitle}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              className="w-full rounded-xl border border-border-default bg-surface py-3 pl-11 pr-4 text-ink outline-none focus:border-brand-500"
              placeholder="Search matricule or allocation..."
              value={query}
              onChange={(e) => handleFilterChange(setQuery)(e.target.value)}
            />
          </div>
          <select
            className="rounded-xl border border-border-default bg-surface px-4 py-3 text-ink"
            value={label}
            onChange={(e) => handleFilterChange(setLabel)(e.target.value)}
          >
            {LABEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <input
            className="rounded-xl border border-border-default bg-surface px-4 py-3 text-ink"
            placeholder="Filter by agent"
            value={agent}
            onChange={(e) => handleFilterChange(setAgent)(e.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="date" className="rounded-xl border border-border-default bg-surface px-4 py-3 text-ink" value={start} onChange={(e) => handleFilterChange(setStart)(e.target.value)} />
          <input type="date" className="rounded-xl border border-border-default bg-surface px-4 py-3 text-ink" value={end} onChange={(e) => handleFilterChange(setEnd)(e.target.value)} />
        </div>
      </div>

      <div className="rounded-3xl border border-border-default bg-surface-2 p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-ink">Sorties</h3>
          <ExportButtons columns={EXPORT_COLUMNS} rows={rows} filename="releases" />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-ink-faint">
              <tr>
                <th className="py-3">Matricule</th>
                <th className="py-3">ISO</th>
                <th className="py-3">Allocation</th>
                <th className="py-3">Date d'entrée</th>
                <SortableHeader field="dateHeure" label="Date de sortie" sort={sort} onSortChange={setSort} />
                <th className="py-3">État entrée</th>
                <th className="py-3">État sortie</th>
                <th className="py-3">Mouvement</th>
                <th className="py-3">Agent</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((release, index) => (
                <tr key={`${release.registrationNumber}-${index}`} className="border-t border-border-default">
                  <td className="py-3 text-ink">{release.registrationNumber}</td>
                  <td className="py-3">{release.type}</td>
                  <td className="py-3">{release.allocationCode || '—'}</td>
                  <td className="py-3">{formatDateTime(release.entryDateTime)}</td>
                  <td className="py-3">{formatDateTime(release.exitDateTime)}</td>
                  <td className="py-3">{release.entryState}</td>
                  <td className="py-3">{release.exitState}</td>
                  <td className="py-3">{release.movementLabel}</td>
                  <td className="py-3">{release.agentName || '—'}</td>
                </tr>
              ))}
              {!loading && !rows.length ? (
                <tr>
                  <td colSpan="9" className="py-6 text-center text-ink-faint">No releases match your filters.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
      </div>
    </div>
  );
}
