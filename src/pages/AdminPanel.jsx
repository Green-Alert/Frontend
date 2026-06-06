import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Users, FileText, ShieldCheck, Building2,
  TrendingUp, AlertTriangle, CheckCircle2, Clock,
  ArrowRight, Loader2, UserCheck, UserX, UserPlus, Activity,
  MapPin, Sparkles, XCircle, BarChart3, RefreshCw,
} from 'lucide-react';
import { motion } from 'motion/react';
import { getAdminStats, getStatsCategoria, getStatsIA } from '../services/api';
import { CountUp } from '../utils/animations.jsx';

export default function AdminPanel() {
  const [stats,          setStats]          = useState(null);
  const [categoriaStats, setCategoriaStats] = useState([]);
  const [iaStats,        setIaStats]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [adminRes, catRes, iaRes] = await Promise.allSettled([
        getAdminStats(),
        getStatsCategoria(),
        getStatsIA({ dias: 30 }),
      ]);

      if (adminRes.status === 'fulfilled') {
        setStats(adminRes.value.data.data);
      } else {
        setError('No se pudieron cargar las estadísticas principales.');
      }

      if (catRes.status === 'fulfilled') {
        setCategoriaStats((catRes.value.data.data ?? []).slice(0, 6));
      }

      if (iaRes.status === 'fulfilled') {
        setIaStats(iaRes.value.data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

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
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAll}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 text-xs transition-colors"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Actualizar
            </button>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Sistema en línea
            </div>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Activos',         value: stats.usuarios?.activos,         icon: UserCheck,  accent: '#22C55E', ibg: 'bg-green-500/8'    },
                { label: 'Inactivos',       value: stats.usuarios?.inactivos,       icon: UserX,      accent: '#EF4444', ibg: 'bg-red-500/8'      },
                { label: 'Nuevos este mes', value: stats.usuarios?.nuevos_este_mes, icon: UserPlus,   accent: '#38BDF8', ibg: 'bg-sky-500/8'      },
                { label: 'Entidades',       value: stats.usuarios?.entidades,       icon: Building2,  accent: '#A78BFA', ibg: 'bg-violet-500/8'   },
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
                { label: 'Total',       value: stats.reportes?.total_reportes,    icon: FileText,     accent: '#9CA3AF', ibg: 'bg-gray-500/10',   border: 'border-gray-600/30' },
                { label: 'Este mes',    value: stats.reportes?.reportes_este_mes, icon: Activity,     accent: '#38BDF8', ibg: 'bg-sky-500/10',    border: 'border-sky-500/20' },
                { label: 'Pendientes',  value: stats.reportes?.pendientes,        icon: Clock,        accent: '#F59E0B', ibg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
                { label: 'En proceso',  value: stats.reportes?.en_proceso,        icon: RefreshCw,    accent: '#F97316', ibg: 'bg-orange-500/10', border: 'border-orange-500/20' },
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

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Resueltos',         value: stats.reportes?.resueltos,         icon: CheckCircle2, accent: '#22C55E', ibg: 'bg-green-500/8'  },
                { label: 'Con seguimiento',   value: stats.reportes?.con_seguimiento,   icon: TrendingUp,   accent: '#818CF8', ibg: 'bg-indigo-500/8' },
                { label: 'Municipios activos',value: stats.reportes?.municipios_activos,icon: MapPin,       accent: '#34D399', ibg: 'bg-emerald-500/8' },
              ].map(({ label, value, icon: Icon, accent, ibg }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.72 + i * 0.07 }}
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

          {/* ── Por Categoría ── */}
          {categoriaStats.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <BarChart3 size={13} className="text-emerald-400" />
                </div>
                <h2 className="text-sm font-semibold text-gray-300">Reportes por categoría</h2>
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-xs text-gray-600">Top {categoriaStats.length}</span>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800/70">
                {categoriaStats.map((cat, i) => {
                  const total = Number(cat.total_reportes) || 0;
                  const resueltos = Number(cat.resueltos) || 0;
                  const pendientes = Number(cat.pendientes) || 0;
                  const enProceso = Number(cat.en_proceso) || 0;
                  const pct = total > 0 ? Math.round((resueltos / total) * 100) : 0;
                  const hex = cat.color_hex ?? '#6B7280';
                  return (
                    <motion.div
                      key={cat.codigo}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + i * 0.05 }}
                      className="flex items-center gap-4 px-4 py-3"
                    >
                      <div
                        className="w-2 h-8 rounded-full shrink-0"
                        style={{ background: hex }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-gray-200 truncate">{cat.nombre}</span>
                          <span className="text-xs font-bold ml-3 shrink-0" style={{ color: hex }}>{total}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: hex }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-600 shrink-0 w-10 text-right">{pct}% res.</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-[10px]">
                        {pendientes > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {pendientes} pend.
                          </span>
                        )}
                        {enProceso > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            {enProceso} proc.
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Análisis con IA ── */}
          {iaStats && (
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Sparkles size={13} className="text-purple-400" />
                </div>
                <h2 className="text-sm font-semibold text-gray-300">Análisis con IA</h2>
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-xs text-gray-600">Últimos 30 días</span>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">
                      <CountUp target={iaStats.total_procesados ?? 0} />
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Procesados</p>
                  </div>
                  <div className="text-center border-x border-gray-800">
                    <p className="text-2xl font-bold text-violet-300">
                      <CountUp target={iaStats.confianza?.promedio ?? 0} />%
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Confianza promedio</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-fuchsia-400">
                      <CountUp target={iaStats.confianza?.distribucion?.alta ?? 0} />
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Alta confianza</p>
                  </div>
                </div>

                {/* Distribución de confianza */}
                <div className="space-y-2">
                  {[
                    { label: 'Alta (≥75%)',   value: iaStats.confianza?.distribucion?.alta  ?? 0, color: '#22C55E' },
                    { label: 'Media (50-75%)',value: iaStats.confianza?.distribucion?.media ?? 0, color: '#F59E0B' },
                    { label: 'Baja (<50%)',   value: iaStats.confianza?.distribucion?.baja  ?? 0, color: '#EF4444' },
                  ].map(({ label, value, color }) => {
                    const total = iaStats.total_procesados || 1;
                    const pct = Math.round((value / total) * 100);
                    return (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-28 shrink-0">{label}</span>
                        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, delay: 1.1 }}
                            className="h-full rounded-full"
                            style={{ background: color }}
                          />
                        </div>
                        <span className="text-xs font-medium w-12 text-right" style={{ color }}>{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

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
                <div className="flex items-center gap-2 shrink-0">
                  {(stats.reportes?.pendientes ?? 0) > 0 && (
                    <span className="min-w-[22px] h-5 px-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center justify-center">
                      {stats.reportes.pendientes}
                    </span>
                  )}
                  <ArrowRight size={16} className="text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
