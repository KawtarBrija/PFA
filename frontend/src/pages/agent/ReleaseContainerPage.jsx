import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { FaArrowAltCircleUp } from 'react-icons/fa';
import api from '../../services/api';
import { formatDateTime } from '../../utils/format';
import ReleasesTable from '../releases/ReleasesTable';

export default function ReleaseContainerPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({ defaultValues: { registrationNumber: '', exitState: 'EMPTY' } });

  const [lastRelease, setLastRelease] = useState(null);
  const [tableKey, setTableKey] = useState(0);

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post('/releases', values);
      setLastRelease(data);
      reset({ registrationNumber: '', exitState: 'EMPTY' });
      setTableKey((key) => key + 1);
      Swal.fire({
        icon: 'success',
        title: 'Container released',
        html: `Mouvement <b>${data.movementLabel}</b>`,
        timer: 2200,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Release failed',
        text: err?.response?.data?.message || 'Please try again.'
      });
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-border-default bg-surface-2 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/15 text-brand-600">
            <FaArrowAltCircleUp className="text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Release Container</h2>
            <p className="text-sm text-ink-faint">
              Enter the matricule and the observed state at exit. The system frees the place(s) and determines the movement automatically.
            </p>
          </div>
        </div>

        <form className="mt-8 grid gap-5 md:grid-cols-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-ink-muted">Matricule</label>
            <input
              className="w-full rounded-xl border border-border-default bg-surface px-4 py-3 text-ink outline-none focus:border-brand-500"
              placeholder="e.g. MSCU1234567"
              {...register('registrationNumber', { required: true })}
            />
            {errors.registrationNumber ? <p className="mt-1 text-xs text-rose-500">Matricule is required.</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm text-ink-muted">État à la sortie</label>
            <select className="w-full rounded-xl border border-border-default bg-surface px-4 py-3 text-ink" {...register('exitState')}>
              <option value="EMPTY">EMPTY</option>
              <option value="FULL">FULL</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-brand-600 px-4 py-3 font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-3"
          >
            {isSubmitting ? 'Releasing...' : 'Release'}
          </button>
        </form>
      </motion.div>

      {lastRelease ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
          <h3 className="text-lg font-semibold text-emerald-600">Release confirmed</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="État entrée" value={lastRelease.entryState} />
            <Stat label="État sortie" value={lastRelease.exitState} />
            <Stat label="Mouvement" value={lastRelease.movementLabel} />
            <Stat label="Allocation libérée" value={lastRelease.allocationCode} />
          </div>
          <p className="mt-4 text-sm text-ink-faint">
            Sortie enregistrée à <span className="text-ink">{formatDateTime(lastRelease.exitDateTime)}</span>.
          </p>
        </motion.div>
      ) : null}

      <ReleasesTable
        key={tableKey}
        title="Release history"
        subtitle="Operations you have recorded, searchable and filterable."
      />
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
