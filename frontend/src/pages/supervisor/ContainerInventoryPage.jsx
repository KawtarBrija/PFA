import { useState } from 'react';
import { FaBoxes, FaSearch } from 'react-icons/fa';
import { usePagedResource } from '../../hooks/usePagedResource';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import Pagination from '../../components/common/Pagination';
import SortableHeader from '../../components/common/SortableHeader';
import ExportButtons from '../../components/common/ExportButtons';
import { formatDateTime } from '../../utils/format';

const EXPORT_COLUMNS = [
  { key: 'registrationNumber', label: 'Matricule' },
  { key: 'type', label: 'ISO' },
  { key: 'state', label: 'Etat' },
  { key: 'blockName', label: 'Bloc' },
  { key: 'lineName', label: 'Ligne' },
  { key: 'allocationCode', label: 'Allocation' },
  { key: 'agentName', label: 'Agent' },
  { key: 'entryDateTime', label: 'Entry date' }
];

export default function ContainerInventoryPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [state, setState] = useState('');
  const [block, setBlock] = useState('');
  const [line, setLine] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState('entryDateTime,desc');

  const debouncedQuery = useDebouncedValue(query, 300);

  const { rows, totalPages, totalElements, loading } = usePagedResource(
    '/containers/search',
    {
      query: debouncedQuery,
      type,
      state,
      block,
      line,
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
            <FaBoxes className="text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Container Inventory</h2>
            <p className="text-sm text-ink-faint">Read-only view of every container currently tracked by the terminal.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              className="w-full rounded-xl border border-border-default bg-surface py-3 pl-11 pr-4 text-ink outline-none focus:border-brand-500"
              placeholder="Search matricule, allocation, agent..."
              value={query}
              onChange={(e) => handleFilterChange(setQuery)(e.target.value)}
            />
          </div>
          <select className="rounded-xl border border-border-default bg-surface px-4 py-3 text-ink" value={type} onChange={(e) => handleFilterChange(setType)(e.target.value)}>
            <option value="">All ISO types</option>
            <option value="ISO20">ISO20</option>
            <option value="ISO40">ISO40</option>
          </select>
          <select className="rounded-xl border border-border-default bg-surface px-4 py-3 text-ink" value={state} onChange={(e) => handleFilterChange(setState)(e.target.value)}>
            <option value="">All states</option>
            <option value="FULL">FULL</option>
            <option value="EMPTY">EMPTY</option>
          </select>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          <input
            className="rounded-xl border border-border-default bg-surface px-4 py-3 text-ink"
            placeholder="Bloc"
            value={block}
            onChange={(e) => handleFilterChange(setBlock)(e.target.value)}
          />
          <input
            className="rounded-xl border border-border-default bg-surface px-4 py-3 text-ink"
            placeholder="Ligne"
            value={line}
            onChange={(e) => handleFilterChange(setLine)(e.target.value)}
          />
          <input type="date" className="rounded-xl border border-border-default bg-surface px-4 py-3 text-ink" value={start} onChange={(e) => handleFilterChange(setStart)(e.target.value)} />
          <input type="date" className="rounded-xl border border-border-default bg-surface px-4 py-3 text-ink" value={end} onChange={(e) => handleFilterChange(setEnd)(e.target.value)} />
        </div>
      </div>

      <div className="rounded-3xl border border-border-default bg-surface-2 p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-ink">Conteneurs</h3>
          <ExportButtons columns={EXPORT_COLUMNS} rows={rows} filename="container-inventory" />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-ink-faint">
              <tr>
                <SortableHeader field="registrationNumber" label="Matricule" sort={sort} onSortChange={setSort} />
                <th className="py-3">ISO</th>
                <th className="py-3">Etat</th>
                <th className="py-3">Bloc/Ligne</th>
                <th className="py-3">Allocation</th>
                <th className="py-3">Agent</th>
                <SortableHeader field="entryDateTime" label="Entry date" sort={sort} onSortChange={setSort} />
              </tr>
            </thead>
            <tbody>
              {rows.map((container) => (
                <tr key={container.id} className="border-t border-border-default">
                  <td className="py-3 text-ink">{container.registrationNumber}</td>
                  <td className="py-3">{container.type}</td>
                  <td className="py-3">{container.state}</td>
                  <td className="py-3">{container.blockName ? `${container.blockName}-${container.lineName}` : '—'}</td>
                  <td className="py-3">{container.allocationCode || (container.exitDateTime ? 'Released' : '—')}</td>
                  <td className="py-3">{container.agentName || '—'}</td>
                  <td className="py-3">{formatDateTime(container.entryDateTime)}</td>
                </tr>
              ))}
              {!loading && !rows.length ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-ink-faint">No containers match your filters.</td>
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
