import { Link } from 'react-router-dom';
import { Leaf, Home, FileText } from 'lucide-react';
import { motion } from 'motion/react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-green-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-emerald-400/4 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">

        {/* Animated leaf icon */}
        <motion.div
          animate={{ rotate: [0, -8, 8, -5, 0], y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-3xl bg-green-500/10 border border-green-500/25 flex items-center justify-center"
        >
          <Leaf className="w-9 h-9 text-green-400" />
        </motion.div>

        {/* 404 gradient */}
        <motion.p
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-8xl sm:text-9xl font-extrabold bg-gradient-to-b from-green-400 to-emerald-600 bg-clip-text text-transparent select-none leading-none"
        >
          404
        </motion.p>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
          className="flex flex-col items-center gap-2"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Página no encontrada</h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-sm">
            La ruta que buscas no existe, fue movida o ya no está disponible.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.35, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-3 mt-2"
        >
          <Link to="/" className="btn-primary flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            Volver al inicio
          </Link>
          <Link to="/reports" className="btn-secondary flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            Ver reportes
          </Link>
        </motion.div>

      </div>
    </div>
  );
}

