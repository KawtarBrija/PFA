import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { FaWarehouse } from 'react-icons/fa';
import api from '../../services/api';
import { formatDateTime } from '../../utils/format';

export default function RegisterArrivalPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({ defaultValues: { registrationNumber: '', state: 'EMPTY', type: 'ISO20' } });

  const [lastAllocation, setLastAllocation] = useState(null);

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post('/containers', values);
      setLastAllocation(data);
      reset({ registrationNumber: '', state: 'EMPTY', type: 'ISO20' });
      Swal.fire({
        icon: 'success',
        title: 'Container registered',
        html: `Allocation <b>${data.allocationCode}</b> (${data.blockName}-${data.lineName})`,
        timer: 2200,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Registration failed',
        text: err?.response?.data?.message || 'No allocation is available for this container type.'
      });
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-border-default bg-surface-2 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/15 text-brand-600">
            <FaWarehouse className="text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Register Arrival</h2>
            <p className="text-sm text-ink-faint">The system automatically allocates the first available place and creates the entry movement.</p>
          </div>
        </div>

        <form className="mt-8 grid gap-5 md:grid-cols-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="md:col-span-1">
            <label className="mb-2 block text-sm text-ink-muted">Matricule</label>
            <input
              className="w-full rounded-xl border border-border-default bg-surface px-4 py-3 text-ink outline-none focus:border-brand-500"
              placeholder="e.g. MSCU1234567"
              {...register('registrationNumber', { required: true })}
            />
            {errors.registrationNumber ? <p className="mt-1 text-xs text-rose-500">Matricule is required.</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm text-ink-muted">Etat</label>
            <select className="w-full rounded-xl border border-border-default bg-surface px-4 py-3 text-ink" {...register('state')}>
              <option value="EMPTY">EMPTY</option>
              <option value="FULL">FULL</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-ink-muted">ISO</label>
            <select className="w-full rounded-xl border border-border-default bg-surface px-4 py-3 text-ink" {...register('type')}>
              <option value="ISO20">ISO20</option>
              <option value="ISO40">ISO40</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-brand-600 px-4 py-3 font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-3"
          >
            {isSubmitting ? 'Allocating...' : 'Register arrival'}
          </button>
        </form>
      </motion.div>

      {lastAllocation ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
          <h3 className="text-lg font-semibold text-emerald-600">Allocation confirmed</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Bloc" value={lastAllocation.blockName} />
            <Stat label="Ligne" value={lastAllocation.lineName} />
            <Stat label="Place(s)" value={lastAllocation.placeNumbers?.join(', ')} />
            <Stat label="Allocation" value={lastAllocation.allocationCode} />
          </div>
          <p className="mt-4 text-sm text-ink-faint">
            Movement <span className="text-ink">{lastAllocation.movementLabel}</span> recorded at{' '}
            <span className="text-ink">{formatDateTime(lastAllocation.entryDateTime)}</span>.
          </p>
        </motion.div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-border-default bg-surface p-4">
      <p className="text-xs uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-2 text-lg font-semibold text-ink">{value || '—'}</p>
    </div>
  );
}
