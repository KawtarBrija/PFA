import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash, FaLock, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  return (
    <div className="space-y-6">
      <ProfileInfoCard user={user} setUser={setUser} />
      <PasswordCard />
    </div>
  );
}

function ProfileInfoCard({ user, setUser }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || ''
    }
  });

  const onSubmit = async (values) => {
    try {
      const { data } = await api.put('/users/me', values);
      setUser(data);
      Swal.fire({ icon: 'success', title: 'Profil mis à jour', timer: 1800, showConfirmButton: false });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Échec de la mise à jour',
        text: err?.response?.data?.message || 'Veuillez réessayer.'
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-border-default bg-surface-2 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/15 text-brand-600">
          <FaUserCircle className="text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-ink">Mon Profil</h2>
          <p className="text-sm text-ink-muted">Gérez vos informations personnelles.</p>
        </div>
      </div>

      <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-2 block text-sm text-ink-muted">Prénom</label>
          <input
            className="w-full rounded-xl border border-border-default bg-surface px-4 py-3 text-ink outline-none focus:border-brand-500"
            {...register('firstName', { required: true })}
          />
          {errors.firstName ? <p className="mt-1 text-xs text-rose-500">Le prénom est requis.</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm text-ink-muted">Nom</label>
          <input
            className="w-full rounded-xl border border-border-default bg-surface px-4 py-3 text-ink outline-none focus:border-brand-500"
            {...register('lastName', { required: true })}
          />
          {errors.lastName ? <p className="mt-1 text-xs text-rose-500">Le nom est requis.</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm text-ink-muted">Téléphone</label>
          <input
            className="w-full rounded-xl border border-border-default bg-surface px-4 py-3 text-ink outline-none focus:border-brand-500"
            placeholder="+212600000000"
            {...register('phone')}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-ink-muted">Email</label>
          <input
            className="w-full cursor-not-allowed rounded-xl border border-border-default bg-surface-3 px-4 py-3 text-ink-faint"
            value={user?.email || ''}
            disabled
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-brand-600 px-4 py-3 font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </form>
    </motion.div>
  );
}

function PasswordCard() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({ defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });

  const onSubmit = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      Swal.fire({ icon: 'error', title: 'Les mots de passe ne correspondent pas' });
      return;
    }
    try {
      await api.post('/users/me/change-password', values);
      reset();
      Swal.fire({ icon: 'success', title: 'Mot de passe mis à jour', timer: 1800, showConfirmButton: false });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Échec du changement de mot de passe',
        text: err?.response?.data?.message || 'Veuillez réessayer.'
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-border-default bg-surface-2 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/15 text-brand-600">
          <FaLock className="text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-ink">Sécurité</h2>
          <p className="text-sm text-ink-muted">Modifiez votre mot de passe.</p>
        </div>
      </div>

      <form className="mt-8 grid gap-5 md:grid-cols-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-2 block text-sm text-ink-muted">Mot de passe actuel</label>
          <div className="relative">
            <input
              className="w-full rounded-xl border border-border-default bg-surface px-4 py-3 pr-11 text-ink outline-none focus:border-brand-500"
              type={showCurrent ? 'text' : 'password'}
              {...register('currentPassword', { required: true })}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
            >
              {showCurrent ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.currentPassword ? <p className="mt-1 text-xs text-rose-500">Requis.</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm text-ink-muted">Nouveau mot de passe</label>
          <div className="relative">
            <input
              className="w-full rounded-xl border border-border-default bg-surface px-4 py-3 pr-11 text-ink outline-none focus:border-brand-500"
              type={showNew ? 'text' : 'password'}
              {...register('newPassword', { required: true, minLength: 6 })}
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
            >
              {showNew ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.newPassword ? <p className="mt-1 text-xs text-rose-500">Minimum 6 caractères.</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm text-ink-muted">Confirmer le mot de passe</label>
          <input
            className="w-full rounded-xl border border-border-default bg-surface px-4 py-3 text-ink outline-none focus:border-brand-500"
            type="password"
            {...register('confirmPassword', { required: true })}
          />
          {errors.confirmPassword ? <p className="mt-1 text-xs text-rose-500">Requis.</p> : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-brand-600 px-4 py-3 font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-3"
        >
          {isSubmitting ? 'Mise à jour...' : 'Changer le mot de passe'}
        </button>
      </form>
    </motion.div>
  );
}
