import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Users, FileText, ShieldCheck,
  TrendingUp, AlertTriangle, CheckCircle2, Clock,
  ArrowRight, Loader2, UserCheck, UserX, UserPlus, Activity,
} from 'lucide-react';
import { motion } from 'motion/react';
import { getAdminStats } from '../services/api';
import { CountUp } from '../utils/animations.jsx';

export default function AdminPanel() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getAdminStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => setError('No se pudieron cargar las estadísticas.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 space-y-8">

      {/* Encabezado */}
      <div className="flex items-start sm:items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Panel de <span className="text-yellow-400">Administración</span>
            </h1>
            <p className="text-sm text-gray-500">Vista general del sistema GreenAlert</p>
          </div>
        </div>
        {!loading && !error && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Sistema en línea
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          <AlertTriangle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
        </div>
      ) : stats && (
        <>
          {/* ── Usuarios ── */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                <Users size={13} className="text-green-400" />
              </div>
              <h2 className="text-sm font-semibold text-gray-300">Usuarios</h2>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            {/* Tarjetas principales de roles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total',       value: stats.usuarios?.total,       icon: Users,       accent: '#9CA3AF', ibg: 'bg-gray-500/10',   border: 'border-gray-600/30' },
                { label: 'Ciudadanos',  value: stats.usuarios?.ciudadanos,  icon: Users,       accent: '#22C55E', ibg: 'bg-green-500/10',  border: 'border-green-500/20' },
                { label: 'Moderadores', value: stats.usuarios?.moderadores, icon: ShieldCheck, accent: '#3B82F6', ibg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
                { label: 'Admins',      value: stats.usuarios?.admins,      icon: Shield,      accent: '#EAB308', ibg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
              ].map(({ label, value, icon: Icon, accent, ibg, border }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group hover:border-gray-700 transition-colors"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at top right, ${accent}10 0%, transparent 65%)` }}
                  />
                  <div className="relative p-4 flex flex-col gap-3">
                    <div className={`w-9 h-9 rounded-lg ${ibg} border ${border} flex items-center justify-center`}>
                      <Icon size={16} style={{ color: accent }} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: accent }}>
                        <CountUp target={value ?? 0} />
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Fila secundaria */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Activos',         value: stats.usuarios?.activos,         icon: UserCheck, accent: '#22C55E', ibg: 'bg-green-500/8'  },
                { label: 'Inactivos',       value: stats.usuarios?.inactivos,       icon: UserX,     accent: '#EF4444', ibg: 'bg-red-500/8'    },
                { label: 'Nuevos este mes', value: stats.usuarios?.nuevos_este_mes, icon: UserPlus,  accent: '#38BDF8', ibg: 'bg-sky-500/8'    },
              ].map(({ label, value, icon: Icon, accent, ibg }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28 + i * 0.07 }}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3 hover:border-gray-700 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg ${ibg} flex items-center justify-center shrink-0`}>
                    <Icon size={15} style={{ color: accent }} />
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: accent }}>
                      <CountUp target={value ?? 0} />
                    </p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── Reportes ── */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <FileText size={13} className="text-blue-400" />
              </div>
              <h2 className="text-sm font-semibold text-gray-300">Reportes</h2>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total',          value: stats.reportes?.total_reportes,    icon: FileText,     accent: '#9CA3AF', ibg: 'bg-gray-500/10',   border: 'border-gray-600/30' },
                { label: 'Este mes',       value: stats.reportes?.reportes_este_mes, icon: Activity,     accent: '#38BDF8', ibg: 'bg-sky-500/10',    border: 'border-sky-500/20' },
                { label: 'En seguimiento', value: stats.reportes?.con_seguimiento,   icon: Clock,        accent: '#EAB308', ibg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
                { label: 'Resueltos',      value: stats.reportes?.resueltos,         icon: CheckCircle2, accent: '#22C55E', ibg: 'bg-green-500/10',  border: 'border-green-500/20' },
              ].map(({ label, value, icon: Icon, accent, ibg, border }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  className="relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group hover:border-gray-700 transition-colors"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at top right, ${accent}10 0%, transparent 65%)` }}
                  />
                  <div className="relative p-4 flex flex-col gap-3">
                    <div className={`w-9 h-9 rounded-lg ${ibg} border ${border} flex items-center justify-center`}>
                      <Icon size={16} style={{ color: accent }} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: accent }}>
                        <CountUp target={value ?? 0} />
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── Acciones rápidas ── */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <TrendingUp size={13} className="text-purple-400" />
              </div>
              <h2 className="text-sm font-semibold text-gray-300">Acciones rápidas</h2>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                to="/admin/usuarios"
                className="group relative bg-gray-900 border border-gray-800 hover:border-yellow-500/40 rounded-xl p-5 flex items-center gap-4 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0 group-hover:bg-yellow-500/20 group-hover:border-yellow-500/40 transition-all duration-300">
                  <Users size={20} className="text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-100 group-hover:text-yellow-100 transition-colors">Gestión de usuarios</p>
                  <p className="text-xs text-gray-500 mt-0.5">Cambiar roles, activar/desactivar cuentas</p>
                </div>
                <ArrowRight size={16} className="text-gray-600 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all shrink-0" />
              </Link>

              <Link
                to="/moderacion"
                className="group relative bg-gray-900 border border-gray-800 hover:border-blue-500/40 rounded-xl p-5 flex items-center gap-4 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 group-hover:border-blue-500/40 transition-all duration-300">
                  <ShieldCheck size={20} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-100 group-hover:text-blue-100 transition-colors">Moderación de reportes</p>
                  <p className="text-xs text-gray-500 mt-0.5">Revisar y gestionar el estado de reportes</p>
                </div>
                <ArrowRight size={16} className="text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
