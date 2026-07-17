import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaBars, FaBell, FaMoon, FaSignOutAlt, FaSun, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../common/Logo';

const WORKSPACE_LABEL = {
  AGENT: 'Agent workspace',
  SUPERVISOR: 'Supervisor workspace',
  ADMIN: 'Admin workspace'
};

function useClickOutside(onOutside) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onOutside();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onOutside]);
  return ref;
}

export default function Navbar({ onOpenMobileNav }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const roleName = user?.roleName || 'AGENT';

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useClickOutside(() => setNotifOpen(false));
  const profileRef = useClickOutside(() => setProfileOpen(false));

  return (
    <header className="border-b border-border-default bg-surface-2 px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="rounded-lg border border-border-default p-2 text-ink-muted transition hover:text-ink lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <FaBars />
          </button>
          <Logo size="sm" className="lg:hidden" />
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-brand-600">Live operations</p>
            <h1 className="text-xl font-semibold text-ink sm:text-2xl">{WORKSPACE_LABEL[roleName]}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border-default text-ink-muted transition hover:text-ink"
            aria-label="Basculer le thème"
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border-default text-ink-muted transition hover:text-ink"
              aria-label="Notifications"
            >
              <FaBell />
            </button>
            <AnimatePresence>
              {notifOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 mt-2 w-64 rounded-xl border border-border-default bg-surface p-4 text-sm text-ink-muted shadow-xl"
                >
                  Aucune notification pour le moment.
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-border-default py-1.5 pl-1.5 pr-3 text-sm text-ink transition hover:border-brand-500"
            >
              <FaUserCircle className="text-xl text-brand-600" />
              <span className="hidden sm:inline">{user?.firstName || 'Operator'}</span>
            </button>
            <AnimatePresence>
              {profileOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border-default bg-surface text-sm shadow-xl"
                >
                  <div className="border-b border-border-default px-4 py-3">
                    <p className="font-medium text-ink">{user?.firstName} {user?.lastName}</p>
                    <p className="truncate text-xs text-ink-faint">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-ink-muted transition hover:bg-surface-3 hover:text-ink"
                  >
                    <FaUserCircle /> Mon Profil
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-rose-500 transition hover:bg-surface-3"
                  >
                    <FaSignOutAlt /> Déconnexion
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
