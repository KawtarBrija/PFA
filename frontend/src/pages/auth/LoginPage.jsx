import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { FaArrowRight, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/common/Logo';

export default function LoginPage() {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ defaultValues: { email: '', password: '' } });

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  const onSubmit = async (values) => {
    try {
      await login(values);
      navigate('/');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Connexion impossible',
        text: err?.response?.data?.message || 'Vérifiez votre email et votre mot de passe.'
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-900 via-black to-black px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-surface shadow-2xl"
      >
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-between bg-gradient-to-br from-brand-600 via-brand-700 to-black p-8 text-white sm:p-10">
            <div className="flex items-center gap-3">
              <Logo size="md" />
              <span className="text-xl font-semibold">SomaPort</span>
            </div>
            <div className="mt-10">
              <h1 className="text-2xl font-semibold leading-snug sm:text-3xl">
                SomaPort Container Management System
              </h1>
              <p className="mt-4 max-w-md text-sm text-white/80">
                Coordonnez les flux de conteneurs, suivez l'occupation des places et gardez chaque opération traçable
                depuis un espace de travail sécurisé.
              </p>
            </div>
            <p className="mt-10 text-xs uppercase tracking-[0.3em] text-white/50">Terminal portuaire · SomaPort</p>
          </div>

          <div className="p-8 sm:p-10">
            <div className="flex items-center gap-2 text-brand-600">
              <FaLock />
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">Connexion sécurisée</span>
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-ink">Bienvenue</h2>
            <p className="mt-2 text-sm text-ink-muted">Connectez-vous pour accéder à votre espace de travail.</p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div>
                <label className="mb-2 block text-sm text-ink-muted">Email</label>
                <input
                  className="w-full rounded-xl border border-border-default bg-surface-2 px-4 py-3 text-ink outline-none transition focus:border-brand-500"
                  type="email"
                  autoComplete="username"
                  {...register('email', { required: true })}
                />
                {errors.email ? <p className="mt-1 text-xs text-rose-500">L'email est requis.</p> : null}
              </div>
              <div>
                <label className="mb-2 block text-sm text-ink-muted">Mot de passe</label>
                <div className="relative">
                  <input
                    className="w-full rounded-xl border border-border-default bg-surface-2 px-4 py-3 pr-11 text-ink outline-none transition focus:border-brand-500"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...register('password', { required: true })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint transition hover:text-ink"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password ? <p className="mt-1 text-xs text-rose-500">Le mot de passe est requis.</p> : null}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Connexion...' : 'Se connecter'}
                <FaArrowRight />
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
