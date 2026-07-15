import { useState } from 'react';
import Swal from 'sweetalert2';
import { FaArrowAltCircleUp, FaSearch } from 'react-icons/fa';
import api from '../../services/api';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { usePagedResource } from '../../hooks/usePagedResource';
import { formatDateTime } from '../../utils/format';

export default function ReleaseContainerPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);

  const { rows, loading, reload } = usePagedResource(
    '/containers/search',
    { query: debouncedQuery },
    { page: 0, size: 10, sort: 'entryDateTime,desc' }
  );

  const activeContainers = rows.filter((container) => Boolean(container.allocationCode));

  const handleRelease = async (container) => {
    const confirm = await Swal.fire({
      title: 'Release this container?',
      html: `Matricule <b>${container.registrationNumber}</b><br/>Allocation <b>${container.allocationCode}</b>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Release',
      cancelButtonText: 'Cancel'
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.post(`/containers/${container.id}/release`);
      Swal.fire({ icon: 'success', title: 'Container released', timer: 1500, showConfirmButton: false });
      reload();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Release failed', text: err?.response?.data?.message || 'Please try again.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/20 text-brand-400">
            <FaArrowAltCircleUp className="text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Release Container</h2>
            <p className="text-sm text-slate-400">Search by matricule or allocation to free its place(s) and record the exit.</p>
          </div>
        </div>

        <div className="relative mt-6">
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-3 pl-11 pr-4 text-slate-100 outline-none focus:border-brand-500"
            placeholder="Search matricule or allocation code..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="py-3">Matricule</th>
                <th className="py-3">ISO</th>
                <th className="py-3">Etat</th>
                <th className="py-3">Allocation</th>
                <th className="py-3">Entry date</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {activeContainers.map((container) => (
                <tr key={container.id} className="border-t border-slate-800">
                  <td className="py-3 text-slate-100">{container.registrationNumber}</td>
                  <td className="py-3">{container.type}</td>
                  <td className="py-3">{container.state}</td>
                  <td className="py-3">{container.allocationCode}</td>
                  <td className="py-3">{formatDateTime(container.entryDateTime)}</td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => handleRelease(container)}
                      className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 transition hover:bg-slate-800"
                    >
                      Release
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && !activeContainers.length ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400">
                    {query ? 'No matching allocated container found.' : 'Search for a matricule or allocation code to release a container.'}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
