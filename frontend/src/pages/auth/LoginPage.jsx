import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaLock, FaShip } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to sign in. Verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur"
      >
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="bg-gradient-to-br from-brand-700 via-blue-700 to-slate-900 p-8 text-slate-100">
            <div className="flex items-center gap-3 text-xl font-semibold">
              <FaShip className="text-2xl" />
              SomaPort Control Center
            </div>
            <p className="mt-4 max-w-md text-sm text-slate-200">
              Coordinate container flows, monitor place occupancy, and keep every operation traceable from a single secure workspace.
            </p>
          </div>

          <div className="p-8 sm:p-10">
            <div className="flex items-center gap-2 text-brand-500">
              <FaLock />
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">Secure sign in</span>
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-slate-100">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-400">Sign in to access your workspace.</p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Email</label>
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-brand-500"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Password</label>
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-brand-500"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              {error ? <p className="text-sm text-rose-400">{error}</p> : null}
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Signing in...' : 'Sign in'}
                <FaArrowRight />
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
