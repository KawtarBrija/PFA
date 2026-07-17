import { useState } from 'react';
import { FaSearch, FaShieldAlt } from 'react-icons/fa';
import { usePagedResource } from '../../hooks/usePagedResource';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import Pagination from '../../components/common/Pagination';
import SortableHeader from '../../components/common/SortableHeader';
import ExportButtons from '../../components/common/ExportButtons';
import { formatDateTime } from '../../utils/format';

const EXPORT_COLUMNS = [
  { key: 'occurredAt', label: 'Date/heure' },
  { key: 'eventType', label: 'Event' },
  { key: 'actorName', label: 'Actor' },
  { key: 'targetEmail', label: 'Target email' },
  { key: 'ipAddress', label: 'IP address' },
  { key: 'details', label: 'Details' }
];

const EVENT_TYPE_OPTIONS = [
  { value: '', label: 'All events' },
  { value: 'LOGIN_SUCCESS', label: 'Login success' },
  { value: 'LOGIN_FAILURE', label: 'Login failure' },
  { value: 'ACCOUNT_LOCKED', label: 'Account locked' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'USER_CREATED', label: 'User created' },
  { value: 'USER_UPDATED', label: 'User updated' },
  { value: 'USER_DELETED', label: 'User deleted' },
  { value: 'PASSWORD_RESET', label: 'Password reset' }
];

export default function AuditLogPage() {
  const [query, setQuery] = useState('');
  const [eventType, setEventType] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState('occurredAt,desc');

  const debouncedQuery = useDebouncedValue(query, 300);

  const { rows, totalPages, totalElements, loading } = usePagedResource(
    '/audit-logs/search',
    {
      query: debouncedQuery,
      eventType,
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
            <FaShieldAlt className="text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Security log</h2>
            <p className="text-sm text-ink-faint">Authentication events and admin actions on user accounts.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              className="w-full rounded-xl border border-border-default bg-surface py-3 pl-11 pr-4 text-ink outline-none focus:border-brand-500"
              placeholder="Search email, IP, details..."
              value={query}
              onChange={(e) => handleFilterChange(setQuery)(e.target.value)}
            />
          </div>
          <select
            className="rounded-xl border border-border-default bg-surface px-4 py-3 text-ink"
            value={eventType}
            onChange={(e) => handleFilterChange(setEventType)(e.target.value)}
          >
            {EVENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              className="rounded-xl border border-border-default bg-surface px-3 py-3 text-ink"
              value={start}
              onChange={(e) => handleFilterChange(setStart)(e.target.value)}
            />
            <input
              type="date"
              className="rounded-xl border border-border-default bg-surface px-3 py-3 text-ink"
              value={end}
              onChange={(e) => handleFilterChange(setEnd)(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border-default bg-surface-2 p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-ink">Événements</h3>
          <ExportButtons columns={EXPORT_COLUMNS} rows={rows} filename="security-log" />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-ink-faint">
              <tr>
                <SortableHeader field="occurredAt" label="Date/heure" sort={sort} onSortChange={setSort} />
                <th className="py-3">Event</th>
                <th className="py-3">Actor</th>
                <th className="py-3">Target email</th>
                <th className="py-3">IP address</th>
                <th className="py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <tr key={entry.id} className="border-t border-border-default">
                  <td className="py-3 text-ink-muted">{formatDateTime(entry.occurredAt)}</td>
                  <td className="py-3 text-ink">{entry.eventType}</td>
                  <td className="py-3">{entry.actorName || '—'}</td>
                  <td className="py-3">{entry.targetEmail || '—'}</td>
                  <td className="py-3">{entry.ipAddress || '—'}</td>
                  <td className="py-3 text-ink-faint">{entry.details || '—'}</td>
                </tr>
              ))}
              {!loading && !rows.length ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-ink-faint">No audit events match your filters.</td>
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
