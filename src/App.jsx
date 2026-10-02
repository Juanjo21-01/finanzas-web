import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthLoading } from '@/components/AuthLoading';
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { EgresosPage } from '@/pages/EgresosPage';
import { IngresosPage } from '@/pages/IngresosPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { HomePage } from '@/pages/HomePage';

function GuestOnly({ children }) {
  const { isAuthenticated, ready } = useAuth();

  if (!ready) return <AuthLoading />;
  return isAuthenticated ? <Navigate to="/" replace /> : children ?? <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/ingresos" element={<IngresosPage />} />
          <Route path="/egresos" element={<EgresosPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
