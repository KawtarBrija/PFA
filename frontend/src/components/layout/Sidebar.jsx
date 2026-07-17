import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  FaArrowAltCircleUp,
  FaBoxOpen,
  FaBoxes,
  FaExchangeAlt,
  FaHistory,
  FaShieldAlt,
  FaSignOutAlt,
  FaUserCog,
  FaUserShield,
  FaUserTie,
  FaUsers,
  FaWarehouse
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';

export const NAV_ITEMS_BY_ROLE = {
  AGENT: [
    { to: '/register-arrival', label: 'Register Arrival', icon: FaWarehouse },
    { to: '/release-container', label: 'Release Container', icon: FaArrowAltCircleUp },
    { to: '/history', label: 'Review History', icon: FaHistory }
  ],
  SUPERVISOR: [
    { to: '/containers', label: 'Container Inventory', icon: FaBoxes },
    { to: '/movements', label: 'Movements', icon: FaExchangeAlt },
    { to: '/releases', label: 'Releases', icon: FaBoxOpen },
    { to: '/history', label: 'History', icon: FaHistory }
  ],
  ADMIN: [
    { to: '/users', label: 'User Management', icon: FaUsers },
    { to: '/releases', label: 'Releases', icon: FaBoxOpen },
    { to: '/history', label: 'History', icon: FaHistory },
    { to: '/security-log', label: 'Security Log', icon: FaShieldAlt }
  ]
};

const ROLE_ICON = {
  AGENT: FaUserTie,
  SUPERVISOR: FaUserShield,
  ADMIN: FaUserCog
};

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const roleName = user?.roleName || 'AGENT';
  const navItems = NAV_ITEMS_BY_ROLE[roleName] || [];
  const RoleIcon = ROLE_ICON[roleName] || FaUserTie;

  return (
    <div className="flex h-full flex-col border-r border-border-default bg-surface-2 p-6">
      <div className="flex items-center gap-3">
        <Logo size="md" />
        <div>
          <p className="text-lg font-semibold text-ink">SomaPort</p>
          <p className="text-xs text-ink-faint">Operations command center</p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-xl border border-border-default bg-surface px-3 py-2 text-xs text-ink-muted">
        <RoleIcon className="text-brand-600" />
        <span className="font-medium uppercase tracking-wide">{roleName}</span>
      </div>

      <nav className="mt-8 space-y-1.5">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <motion.div key={to} whileHover={{ x: 4 }} transition={{ duration: 0.15 }}>
              <Link
                to={to}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  active ? 'bg-brand-600/15 font-medium text-brand-700 dark:text-brand-400' : 'text-ink-muted hover:bg-surface-3 hover:text-ink'
                }`}
              >
                <Icon />
                {label}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-border-default bg-surface p-4 text-sm">
        <p className="font-semibold text-ink">{user?.firstName || 'Operator'}</p>
        <p className="mt-1 truncate text-ink-faint">{user?.email}</p>
        <button onClick={logout} className="mt-4 flex items-center gap-2 text-rose-500 transition hover:text-rose-600">
          <FaSignOutAlt />
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-72 lg:block">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
          >
            <motion.aside
              className="h-full w-72"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarContent onNavigate={onCloseMobile} />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
