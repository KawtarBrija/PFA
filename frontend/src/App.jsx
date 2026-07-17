import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute, RoleRoute, HOME_ROUTE_BY_ROLE } from './routes/guards';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterArrivalPage from './pages/agent/RegisterArrivalPage';
import ReleaseContainerPage from './pages/agent/ReleaseContainerPage';
import ReviewHistoryPage from './pages/agent/ReviewHistoryPage';
import ContainerInventoryPage from './pages/supervisor/ContainerInventoryPage';
import MovementsPage from './pages/supervisor/MovementsPage';
import GlobalHistoryPage from './pages/history/GlobalHistoryPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import AuditLogPage from './pages/admin/AuditLogPage';
import ReleasesPage from './pages/releases/ReleasesPage';
import ProfilePage from './pages/profile/ProfilePage';

function HomeRedirect() {
  const { user } = useAuth();
  const target = HOME_ROUTE_BY_ROLE[user?.roleName] || '/login';
  return <Navigate to={target} replace />;
}

function HistoryRoute() {
  const { user } = useAuth();
  return user?.roleName === 'AGENT' ? <ReviewHistoryPage /> : <GlobalHistoryPage />;
}

function AppRoutes() {
  const { loading, token } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-ink">Loading workspace...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomeRedirect />} />

        <Route
          path="register-arrival"
          element={
            <RoleRoute roles={['AGENT']}>
              <RegisterArrivalPage />
            </RoleRoute>
          }
        />
        <Route
          path="release-container"
          element={
            <RoleRoute roles={['AGENT']}>
              <ReleaseContainerPage />
            </RoleRoute>
          }
        />

        <Route
          path="containers"
          element={
            <RoleRoute roles={['SUPERVISOR']}>
              <ContainerInventoryPage />
            </RoleRoute>
          }
        />
        <Route
          path="movements"
          element={
            <RoleRoute roles={['SUPERVISOR']}>
              <MovementsPage />
            </RoleRoute>
          }
        />
        <Route
          path="releases"
          element={
            <RoleRoute roles={['SUPERVISOR', 'ADMIN']}>
              <ReleasesPage />
            </RoleRoute>
          }
        />

        <Route
          path="users"
          element={
            <RoleRoute roles={['ADMIN']}>
              <UserManagementPage />
            </RoleRoute>
          }
        />

        <Route
          path="security-log"
          element={
            <RoleRoute roles={['ADMIN']}>
              <AuditLogPage />
            </RoleRoute>
          }
        />

        <Route
          path="history"
          element={
            <RoleRoute roles={['AGENT', 'SUPERVISOR', 'ADMIN']}>
              <HistoryRoute />
            </RoleRoute>
          }
        />

        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
