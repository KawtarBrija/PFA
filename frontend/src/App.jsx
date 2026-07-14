import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from './services/api';
import Swal from 'sweetalert2';
import {
  FaBoxes,
  FaChartBar,
  FaHistory,
  FaLock,
  FaShip,
  FaSignOutAlt,
  FaUsers,
  FaArrowRight,
  FaExchangeAlt
} from 'react-icons/fa';

function App() {
  const [token, setToken] = useState(localStorage.getItem('somaport_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('somaport_token')));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch {
        localStorage.removeItem('somaport_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('somaport_token', data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('somaport_token');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-200">Loading workspace...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={login} isAuthenticated={Boolean(token)} />} />
        <Route path="/" element={<ProtectedRoute token={token}><Layout user={user} onLogout={logout} /></ProtectedRoute>}>
          <Route index element={<DashboardPage user={user} />} />
          <Route path="containers" element={<ContainersPage user={user} />} />
          <Route path="history" element={<HistoryPage user={user} />} />
          <Route path="movements" element={<MovementsPage user={user} />} />
          <Route path="users" element={<AdminRoute user={user}><UsersPage /></AdminRoute>} />
        </Route>
        <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function ProtectedRoute({ token, children }) {
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ user, children }) {
  if (!user) return <Navigate to="/" replace />;
  return user.roleName === 'ADMIN' ? children : <Navigate to="/" replace />;
}

function LoginPage({ onLogin, isAuthenticated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await onLogin(form);
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
              SommaPort Control Center
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
            <p className="mt-2 text-sm text-slate-400">Sign in to access the operations dashboard.</p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Email / registered identifier</label>
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

function Layout({ user, onLogout }) {
  const location = useLocation();
  const roleName = user?.roleName || 'AGENT';
  const isAdmin = roleName === 'ADMIN';

  const navItems = [
    { to: '/', label: 'Overview', icon: FaChartBar },
    { to: '/containers', label: 'Containers', icon: FaBoxes },
    { to: '/history', label: 'History', icon: FaHistory },
    { to: '/movements', label: 'Movements', icon: FaExchangeAlt },
    ...(isAdmin ? [{ to: '/users', label: 'Admin users', icon: FaUsers }] : [])
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-slate-800 bg-slate-900/80 p-6 lg:flex">
        <div className="flex items-center gap-3 text-xl font-semibold">
          <FaShip className="text-brand-500" />
          SommaPort
        </div>
        <p className="mt-2 text-sm text-slate-400">Operations command center</p>

        <nav className="mt-10 space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${active ? 'bg-brand-600/20 text-brand-400' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <Icon />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm">
          <p className="font-semibold text-slate-100">{user?.firstName || 'Operator'}</p>
          <p className="mt-1 text-slate-400">{user?.email}</p>
          <button onClick={onLogout} className="mt-4 flex items-center gap-2 text-rose-400">
            <FaSignOutAlt />
            Sign out
          </button>
        </div>
      </aside>

      <main className="ml-0 lg:ml-72">
        <header className="border-b border-slate-800 bg-slate-900/70 px-6 py-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-brand-400">Live operations</p>
              <h1 className="text-2xl font-semibold text-slate-100">{roleName === 'AGENT' ? 'Agent workspace' : isAdmin ? 'Admin workspace' : 'Supervisor workspace'}</h1>
            </div>
            <div className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">{user?.email}</div>
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function DashboardPage({ user }) {
  const [stats, setStats] = useState(null);
  const roleName = user?.roleName || 'AGENT';
  const isAgent = roleName === 'AGENT';
  const isSupervisor = roleName === 'SUPERVISOR';

  useEffect(() => {
    if (isAgent) return;

    const loadStats = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data);
      } catch {
        setStats({
          totalContainers: 0,
          fullContainers: 0,
          emptyContainers: 0,
          iso20Count: 0,
          iso40Count: 0,
          blocksCount: 0,
          freePlaces: 0,
          occupiedPlaces: 0,
          agentCount: 0,
          supervisorCount: 0,
          labels: []
        });
      }
    };

    loadStats();
  }, [isAgent]);

  const cards = useMemo(() => [
    { label: 'Total containers', value: stats?.totalContainers ?? 0, accent: 'from-brand-600 to-blue-600' },
    { label: 'Full containers', value: stats?.fullContainers ?? 0, accent: 'from-emerald-600 to-teal-500' },
    { label: 'Empty containers', value: stats?.emptyContainers ?? 0, accent: 'from-amber-500 to-orange-500' },
    { label: 'Free places', value: stats?.freePlaces ?? 0, accent: 'from-violet-600 to-fuchsia-500' }
  ], [stats]);

  if (isAgent) {
    return (
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-6">
          <h2 className="text-xl font-semibold">Your operations</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Link to="/containers" className="border border-slate-800 bg-slate-900/70 p-5 transition hover:bg-slate-900">
            <p className="text-sm text-slate-400">Container entry</p>
            <p className="mt-2 text-lg font-semibold">Register an arrival</p>
          </Link>
          <Link to="/containers" className="border border-slate-800 bg-slate-900/70 p-5 transition hover:bg-slate-900">
            <p className="text-sm text-slate-400">Container exit</p>
            <p className="mt-2 text-lg font-semibold">Release an allocated container</p>
          </Link>
          <Link to="/history" className="border border-slate-800 bg-slate-900/70 p-5 transition hover:bg-slate-900">
            <p className="text-sm text-slate-400">Personal history</p>
            <p className="mt-2 text-lg font-semibold">Review your recorded operations</p>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border border-slate-800 bg-gradient-to-br ${card.accent} p-5 shadow-lg`}>
            <p className="text-sm text-slate-200">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Operations overview</h2>
            <p className="mt-2 text-sm text-slate-400">
              {isSupervisor
                ? 'Monitor occupancy, fleet mix, and daily activity from the supervisor view.'
                : 'Monitor the full terminal, user activity, and place availability from the admin workspace.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold">Fleet mix</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">ISO 20</p>
              <p className="mt-2 text-2xl font-semibold">{stats?.iso20Count ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">ISO 40</p>
              <p className="mt-2 text-2xl font-semibold">{stats?.iso40Count ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold">Operations snapshot</h2>
          <div className="mt-6 space-y-4 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
              <span>Blocks configured</span>
              <span className="font-semibold text-slate-100">{stats?.blocksCount ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
              <span>Occupied places</span>
              <span className="font-semibold text-slate-100">{stats?.occupiedPlaces ?? 0}</span>
            </div>
            {!isSupervisor ? (
              <>
                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <span>Agents</span>
                  <span className="font-semibold text-slate-100">{stats?.agentCount ?? 0}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <span>Supervisors</span>
                  <span className="font-semibold text-slate-100">{stats?.supervisorCount ?? 0}</span>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContainersPage({ user }) {
  const [containers, setContainers] = useState([]);
  const roleName = user?.roleName || 'AGENT';
  const isAgent = roleName === 'AGENT';
  const canOperate = roleName === 'ADMIN' || isAgent;
  const [form, setForm] = useState({ registrationNumber: '', state: 'EMPTY', type: 'ISO20' });

  const loadContainers = async () => {
    const { data } = await api.get('/containers');
    setContainers(data);
  };

  useEffect(() => {
    loadContainers();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await api.post('/containers', form);
    setForm({ registrationNumber: '', state: 'EMPTY', type: 'ISO20' });
    loadContainers();
  };

  const handleRelease = async (id) => {
    await api.post(`/containers/${id}/release`);
    loadContainers();
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <div className="space-y-6">
      {canOperate ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold">{isAgent ? 'Register a container entry' : 'Container operations'}</h2>
          <form className="mt-6 grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
            <input
              className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100"
              placeholder="Registration number"
              value={form.registrationNumber}
              onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
              required
            />
            <select className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
              <option value="EMPTY">Empty</option>
              <option value="FULL">Full</option>
            </select>
            <select className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="ISO20">ISO 20</option>
              <option value="ISO40">ISO 40</option>
            </select>
            <button type="submit" className="rounded-xl bg-brand-600 px-4 py-3 font-medium text-white md:col-span-3">Save container</button>
          </form>
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Container inventory</h2>
          <span className="text-sm text-slate-400">{containers.length} active entries</span>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="py-3">Registration</th>
                <th className="py-3">Type</th>
                <th className="py-3">State</th>
                <th className="py-3">Assigned place / allocation</th>
                <th className="py-3">Movement</th>
                <th className="py-3">Entry Date</th>
                {canOperate ? <th className="py-3">Action</th> : null}
              </tr>
            </thead>
            <tbody>
              {containers.map((container) => (
                <tr key={container.id} className="border-t border-slate-800">
                  <td className="py-3 text-slate-100">{container.registrationNumber}</td>
                  <td className="py-3">{container.type}</td>
                  <td className="py-3">{container.state}</td>
                  <td className="py-3">{container.allocationCode || (container.placeNumbers?.length ? `${container.blockName || ''}-${container.lineName || ''}-${container.placeNumbers.map((n) => String(n).padStart(3, '0')).join('-')}` : container.exitDateTime ? 'Released' : 'Allocation unavailable')}</td>
                  <td className="py-3">{container.movementLabel || '—'}</td>
                  <td className="py-3">{formatDateTime(container.entryDateTime)}</td>
                  {canOperate ? (
                    <td className="py-3">
                      {container.allocationCode ? (
                        <button onClick={() => handleRelease(container.id)} className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 hover:bg-slate-800">Release</button>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function HistoryPage() {
  const [history, setHistory] = useState([]);

  const formatDateTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  };

  useEffect(() => {
    const loadHistory = async () => {
      const { data } = await api.get('/histories');
      setHistory(data);
    };
    loadHistory();
  }, []);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <h2 className="text-xl font-semibold">Activity history</h2>
      <div className="mt-6 space-y-3">
        {history.map((entry, index) => (
          <div key={entry.id || index} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-medium text-slate-100">{entry.operation === 'ENTRY' ? 'Container entry' : entry.operation === 'EXIT' ? 'Container exit' : 'Activity logged'}</span>
              <span className="text-slate-500">{formatDateTime(entry.occurredAt)}</span>
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <p className="text-slate-400">Matricule: <span className="text-slate-100">{entry.containerRegistrationNumber || '—'}</span></p>
              <p className="text-slate-400">État: <span className="text-slate-100">{entry.containerState || '—'}</span></p>
              <p className="text-slate-400">Type ISO: <span className="text-slate-100">{entry.containerTypeIso || '—'}</span></p>
              <p className="text-slate-400">Allocation: <span className="text-slate-100">{entry.allocation || entry.newAllocation || entry.previousAllocation || '—'}</span></p>
              <p className="text-slate-400">Mouvement: <span className="text-slate-100">{entry.movementLabel || entry.movementType || '—'}</span></p>
              <p className="text-slate-400">Agent connecté: <span className="text-slate-100">{entry.agentName || '—'}</span></p>
              <p className="text-slate-400">Details: <span className="text-slate-100">{entry.details || 'Recorded by the system.'}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MovementsPage() {
  const [movements, setMovements] = useState([]);

  const formatDateTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  };

  useEffect(() => {
    const loadMovements = async () => {
      const { data } = await api.get('/movements');
      setMovements(data);
    };
    loadMovements();
  }, []);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <h2 className="text-xl font-semibold">Movements</h2>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="py-3">Date/heure</th>
              <th className="py-3">Matricule</th>
              <th className="py-3">État</th>
              <th className="py-3">Type ISO</th>
              <th className="py-3">Allocation</th>
              <th className="py-3">Mouvement</th>
              <th className="py-3">Agent</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id} className="border-t border-slate-800">
                <td className="py-3 text-slate-300">{formatDateTime(m.dateHeure)}</td>
                <td className="py-3 text-slate-100">{m.matricule || '—'}</td>
                <td className="py-3">{m.etat || '—'}</td>
                <td className="py-3">{m.typeIso || '—'}</td>
                <td className="py-3">{m.allocationCode || '—'}</td>
                <td className="py-3">{m.movementLabel || m.movementType || '—'}</td>
                <td className="py-3">{m.agentName || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', roleName: 'AGENT' });

  const loadUsers = async () => {
    const { data } = await api.get('/users');
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await api.post('/users', form);
    setForm({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', roleName: 'AGENT' });
    loadUsers();
    Swal.fire({ icon: 'success', title: 'User created', timer: 1200, showConfirmButton: false });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <h2 className="text-xl font-semibold">Admin account creation</h2>
        <p className="mt-2 text-sm text-slate-400">Create accounts for supervisors, agents, or other admins. Each user will sign in with the email address you register.</p>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <input className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100" placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          <input className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100" placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          <input className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <input className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100" placeholder="Confirm password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
          <select className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 md:col-span-2" value={form.roleName} onChange={(e) => setForm({ ...form, roleName: e.target.value })}>
            <option value="AGENT">Agent</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit" className="rounded-xl bg-brand-600 px-4 py-3 font-medium text-white md:col-span-2">Create account</button>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <h2 className="text-xl font-semibold">Team roster</h2>
        <div className="mt-6 space-y-3">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
              <div>
                <p className="font-semibold text-slate-100">{u.firstName} {u.lastName}</p>
                <p className="text-sm text-slate-400">{u.email}</p>
              </div>
              <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">{u.roleName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

