import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { useFCM } from './hooks/useFCM';

// Páginas cargadas bajo demanda (code splitting por ruta) — FE-32
const Home               = lazy(() => import('./pages/Home'));
const Auth               = lazy(() => import('./pages/Auth'));
const Dashboard          = lazy(() => import('./pages/Dashboard'));
const Reports            = lazy(() => import('./pages/Reports'));
const NewReport          = lazy(() => import('./pages/NewReport'));
const ReportDetail       = lazy(() => import('./pages/ReportDetail'));
const Trending           = lazy(() => import('./pages/Trending'));
const NotFound           = lazy(() => import('./pages/NotFound'));
const FormularioReporte  = lazy(() => import('./components/FormularioReporte'));
const Profile            = lazy(() => import('./pages/Profile'));
const Settings           = lazy(() => import('./pages/Settings'));
const Moderacion         = lazy(() => import('./pages/Moderacion'));
const ForgotPassword     = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword      = lazy(() => import('./pages/ResetPassword'));
const VerificarEmail     = lazy(() => import('./pages/VerificarEmail'));
const AdminPanel         = lazy(() => import('./pages/AdminPanel'));
const AdminUsuarios      = lazy(() => import('./pages/AdminUsuarios'));
const PoliticaPrivacidad = lazy(() => import('./pages/PoliticaPrivacidad'));
const TerminosCondiciones = lazy(() => import('./pages/TerminosCondiciones'));
const FacebookCallback   = lazy(() => import('./pages/FacebookCallback'));

function HomeRoute() {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <Home />;
}

/** FE-30: Activa FCM push notifications cuando el usuario está autenticado. */
function FCMController() {
  useFCM();
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <FCMController />
          <Suspense fallback={null}>
          <Routes>
            {/* Rutas públicas con Layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomeRoute />} />
              <Route path="about" element={<Navigate to="/#nosotros" replace />} />
              <Route path="reports"      element={<Reports />} />
              <Route path="reports/:id"  element={<ReportDetail />} />
              <Route path="trending"     element={<Trending />} />
              <Route path="privacidad"   element={<PoliticaPrivacidad />} />
              <Route path="terminos"     element={<TerminosCondiciones />} />
            </Route>

            {/* Rutas de autenticación (sin Layout, pantalla completa) */}
            <Route path="/login"            element={<Auth />} />
            <Route path="/register"         element={<Auth />} />
            <Route path="/forgot-password"  element={<ForgotPassword />} />
            <Route path="/reset-password"   element={<ResetPassword />} />
            <Route path="/auth/callback/facebook"  element={<FacebookCallback />} />

            {/* ── Rutas protegidas: cualquier usuario autenticado ── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/verificar-email" element={<VerificarEmail />} />
              <Route path="/" element={<Layout />}>
                <Route path="dashboard"    element={<Dashboard />} />
                <Route path="reports/new"  element={<NewReport />} />
                <Route path="nuevo-reporte" element={<FormularioReporte />} />
                <Route path="profile"      element={<Profile />} />
                <Route path="settings"     element={<Settings />} />
              </Route>
            </Route>

            {/* ── Rutas protegidas: moderador y admin ── */}
            <Route element={<ProtectedRoute roles={['moderador', 'admin']} />}>
              <Route path="/" element={<Layout />}>
                <Route path="moderacion" element={<Moderacion />} />
              </Route>
            </Route>

            {/* ── Rutas protegidas: solo admin ── */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/" element={<Layout />}>
                <Route path="admin"          element={<AdminPanel />} />
                <Route path="admin/usuarios" element={<AdminUsuarios />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          <ToastContainer />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
