import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const getPostLoginPath = (userData) => (
  userData?.rol === 'entidad' ? '/entidad' : '/dashboard'
);

const getOAuthCodeFromLocation = () => {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const queryParams = new URLSearchParams(window.location.search);
  return hashParams.get('oauth_code') || queryParams.get('oauth_code') || queryParams.get('code');
};

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { completeOAuthCallback } = useAuth();
  const { showToast } = useToast();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = getOAuthCodeFromLocation();
    if (!code) {
      showToast('No fue posible completar el inicio de sesion social.', 'warning');
      navigate('/login', { replace: true });
      return;
    }

    completeOAuthCallback(code)
      .then((userData) => {
        showToast(`Bienvenido, ${userData.nombre}.`, 'success', 5000, {
          position: 'top-center',
          subtitle: 'Sesion social completada',
        });
        navigate(getPostLoginPath(userData), { replace: true });
      })
      .catch((err) => {
        showToast(err.response?.data?.message || 'Error al completar la autenticacion social.', 'error');
        navigate('/login', { replace: true });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <motion.div
        className="flex flex-col items-center gap-4 rounded-2xl border border-gray-800 bg-gray-900/80 px-8 py-7 text-center shadow-2xl shadow-black/40"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-green-400" />
        <div>
          <p className="text-sm font-semibold text-gray-100">Completando autenticacion</p>
          <p className="mt-1 text-xs text-gray-500">Estamos validando la sesion con Green Alert.</p>
        </div>
      </motion.div>
    </div>
  );
}
