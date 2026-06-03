import { Outlet, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import Navbar from './Navbar';
import VerificacionEmailBanner from './VerificacionEmailBanner';
import ChatWidget from './chat/ChatWidget';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fondo lava permanente — muy tenue para no competir con el contenido */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full" style={{
          left: 'calc(50% - 400px)', bottom: '-20%',
          width: '800px', height: '620px',
          background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.07) 0%, rgba(16,185,129,0.03) 52%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'lava-rise-1 22s ease-in-out infinite',
          willChange: 'transform',
        }} />
        <div className="absolute rounded-full" style={{
          left: '-12%', bottom: '-25%',
          width: '520px', height: '420px',
          background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.055) 0%, transparent 70%)',
          filter: 'blur(72px)',
          animation: 'lava-rise-2 28s ease-in-out infinite',
          animationDelay: '-10s',
          willChange: 'transform',
        }} />
        <div className="absolute rounded-full" style={{
          right: '-10%', bottom: '-20%',
          width: '480px', height: '400px',
          background: 'radial-gradient(ellipse at center, rgba(20,184,166,0.05) 0%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'lava-rise-3 25s ease-in-out infinite',
          animationDelay: '-15s',
          willChange: 'transform',
        }} />
      </div>
      <ScrollToTop />
      <Navbar />
      <VerificacionEmailBanner />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="border-t border-gray-800/60 bg-gray-950/60 mt-auto">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Marca */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-green-400">GreenAlert</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[220px]">
              Plataforma de monitoreo ambiental ciudadano. Reporta, visualiza y actúa frente a problemas ambientales en tu comunidad.
            </p>
          </div>

          {/* Navegación */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold">Plataforma</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/dashboard" className="text-gray-500 hover:text-green-400 transition-colors">Pagina principal</Link></li>
              <li><Link to="/reports" className="text-gray-500 hover:text-green-400 transition-colors">Reportes</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold">Legal</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacidad" className="text-gray-500 hover:text-green-400 transition-colors">Política de Privacidad</Link></li>
              <li><Link to="/terminos" className="text-gray-500 hover:text-green-400 transition-colors">Términos y Condiciones</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="border-t border-gray-800/50">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
            <span>© {new Date().getFullYear()} GreenAlert. Todos los derechos reservados.</span>
            <span className="flex items-center gap-1.5">
              Hecho con <span className="text-green-500">♥</span> para el medio ambiente
            </span>
          </div>
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}
