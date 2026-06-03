import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';
import GlobalLoadingIndicator from './components/GlobalLoadingIndicator';
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
const EntidadPanel       = lazy(() => import('./pages/EntidadPanel'));
const ForgotPassword     = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword      = lazy(() => import('./pages/ResetPassword'));
const VerificarEmail     = lazy(() => import('./pages/VerificarEmail'));
const AdminPanel         = lazy(() => import('./pages/AdminPanel'));
const AdminUsuarios      = lazy(() => import('./pages/AdminUsuarios'));
const PoliticaPrivacidad = lazy(() => import('./pages/PoliticaPrivacidad'));
const TerminosCondiciones = lazy(() => import('./pages/TerminosCondiciones'));
const FacebookCallback   = lazy(() => import('./pages/FacebookCallback'));
const OAuthCallback       = lazy(() => import('./pages/OAuthCallback'));

function HomeRoute() {
  const { user } = useAuth();
  if (!user) return <Home />;
  return <Navigate to={user.rol === 'entidad' ? '/entidad' : '/dashboard'} replace />;
}

/** FE-30: Activa FCM push notifications cuando el usuario está autenticado. */
function FCMController() {
  useFCM();
  return null;
}

function RouteLoading() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-300">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 rounded-full bg-green-400 animate-pulse" />
        <span>Cargando...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <FCMController />
          <Suspense fallback={<RouteLoading />}>
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
            <Route path="/auth/callback"     element={<OAuthCallback />} />
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
            <Route element={<ProtectedRoute roles={['entidad']} />}>
              <Route path="/" element={<Layout />}>
                <Route path="entidad" element={<EntidadPanel />} />
              </Route>
            </Route>

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
          <GlobalLoadingIndicator />
          <ToastContainer />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
