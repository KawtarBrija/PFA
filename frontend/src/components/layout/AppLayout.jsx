import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  FaArrowAltCircleUp,
  FaBoxes,
  FaExchangeAlt,
  FaHistory,
  FaShip,
  FaSignOutAlt,
  FaUsers,
  FaWarehouse
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS_BY_ROLE = {
  AGENT: [
    { to: '/register-arrival', label: 'Register Arrival', icon: FaWarehouse },
    { to: '/release-container', label: 'Release Container', icon: FaArrowAltCircleUp },
    { to: '/history', label: 'Review History', icon: FaHistory }
  ],
  SUPERVISOR: [
    { to: '/containers', label: 'Container Inventory', icon: FaBoxes },
    { to: '/movements', label: 'Movements', icon: FaExchangeAlt },
    { to: '/history', label: 'History', icon: FaHistory }
  ],
  ADMIN: [
    { to: '/users', label: 'User Management', icon: FaUsers },
    { to: '/history', label: 'History', icon: FaHistory }
  ]
};

const WORKSPACE_LABEL = {
  AGENT: 'Agent workspace',
  SUPERVISOR: 'Supervisor workspace',
  ADMIN: 'Admin workspace'
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const roleName = user?.roleName || 'AGENT';
  const navItems = NAV_ITEMS_BY_ROLE[roleName] || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-slate-800 bg-slate-900/80 p-6 lg:flex">
        <div className="flex items-center gap-3 text-xl font-semibold">
          <FaShip className="text-brand-500" />
          SomaPort
        </div>
        <p className="mt-2 text-sm text-slate-400">Operations command center</p>

        <nav className="mt-10 space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  active ? 'bg-brand-600/20 text-brand-400' : 'text-slate-300 hover:bg-slate-800'
                }`}
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
          <button onClick={logout} className="mt-4 flex items-center gap-2 text-rose-400 transition hover:text-rose-300">
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>

      <main className="ml-0 lg:ml-72">
        <header className="border-b border-slate-800 bg-slate-900/70 px-6 py-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-brand-400">Live operations</p>
              <h1 className="text-2xl font-semibold text-slate-100">{WORKSPACE_LABEL[roleName]}</h1>
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
