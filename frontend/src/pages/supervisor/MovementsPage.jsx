import { useState } from 'react';
import { FaExchangeAlt, FaSearch } from 'react-icons/fa';
import { usePagedResource } from '../../hooks/usePagedResource';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import Pagination from '../../components/common/Pagination';
import SortableHeader from '../../components/common/SortableHeader';
import ExportButtons from '../../components/common/ExportButtons';
import { formatDateTime } from '../../utils/format';

const EXPORT_COLUMNS = [
  { key: 'dateHeure', label: 'Date/heure' },
  { key: 'matricule', label: 'Matricule' },
  { key: 'etat', label: 'Etat' },
  { key: 'typeIso', label: 'ISO' },
  { key: 'allocationCode', label: 'Allocation' },
  { key: 'movementLabel', label: 'Mouvement' },
  { key: 'agentName', label: 'Agent' }
];

const LABEL_OPTIONS = [
  { value: '', label: 'All movements' },
  { value: 'ENP', label: 'ENP — Entree Pleine' },
  { value: 'ENV', label: 'ENV — Entree Vide' },
  { value: 'EXIT', label: 'EXIT — Sortie' }
];

export default function MovementsPage() {
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
    '/movements/search',
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
            <FaExchangeAlt className="text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Movements</h2>
            <p className="text-sm text-ink-faint">Every entry and exit movement recorded across the terminal.</p>
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
          <select className="rounded-xl border border-border-default bg-surface px-4 py-3 text-ink" value={label} onChange={(e) => handleFilterChange(setLabel)(e.target.value)}>
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
          <h3 className="text-lg font-semibold text-ink">Mouvements</h3>
          <ExportButtons columns={EXPORT_COLUMNS} rows={rows} filename="movements" />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-ink-faint">
              <tr>
                <SortableHeader field="dateHeure" label="Date/heure" sort={sort} onSortChange={setSort} />
                <th className="py-3">Matricule</th>
                <th className="py-3">Etat</th>
                <th className="py-3">ISO</th>
                <th className="py-3">Allocation</th>
                <th className="py-3">Mouvement</th>
                <th className="py-3">Agent</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((movement) => (
                <tr key={movement.id} className="border-t border-border-default">
                  <td className="py-3 text-ink-muted">{formatDateTime(movement.dateHeure)}</td>
                  <td className="py-3 text-ink">{movement.matricule || '—'}</td>
                  <td className="py-3">{movement.etat || '—'}</td>
                  <td className="py-3">{movement.typeIso || '—'}</td>
                  <td className="py-3">{movement.allocationCode || '—'}</td>
                  <td className="py-3">{movement.movementLabel || '—'}</td>
                  <td className="py-3">{movement.agentName || '—'}</td>
                </tr>
              ))}
              {!loading && !rows.length ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-ink-faint">No movements match your filters.</td>
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
